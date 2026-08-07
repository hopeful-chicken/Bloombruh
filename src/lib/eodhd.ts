// Server-only wrapper around the EODHD API (https://eodhd.com) — used
// exclusively for Hong Kong Stock Exchange (HKEX) coverage, since Twelve
// Data's free/Grow plans this site otherwise runs on don't include HKEX
// (confirmed empirically: HKEX returns "available starting with the Pro or
// Venture plan", a $229/mo tier — see docs/DATA_SOURCES.md). EODHD's own
// free tier genuinely does return real HKEX quotes and EOD history, tested
// live before writing this file. Every other exchange this site supports
// still goes through Twelve Data (src/lib/marketData.ts) — this file only
// ever gets called for symbols ending in ".HK".
//
// Never import this from a "use client" component — it reads
// process.env.EODHD_API_KEY and would leak the key into the browser bundle.
//
// Free tier limits: 20 API calls/day + a 500-call welcome bonus (confirmed
// via a real key). That's thin, so the HK company directory (below) is
// fetched once and cached hard rather than re-fetched per search.

import type { Quote, PricePoint, TimeSeries } from "./marketData";

const BASE_URL = "https://eodhd.com/api";

function getApiKey(): string {
  const key = process.env.EODHD_API_KEY;
  if (!key) {
    throw new Error(
      "EODHD_API_KEY is not set. Copy .env.local.example to .env.local and add a free key from https://eodhd.com. This is only needed for Hong Kong Stock Exchange coverage; every other exchange on this site works without it."
    );
  }
  return key;
}

async function fetchEodhd<T>(
  path: string,
  params: Record<string, string>,
  revalidateSeconds: number
): Promise<T> {
  const url = new URL(`${BASE_URL}/${path}`);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  url.searchParams.set("api_token", getApiKey());
  url.searchParams.set("fmt", "json");

  const res = await fetch(url.toString(), { next: { revalidate: revalidateSeconds } });
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const message = typeof data === "string" ? data : data?.message ?? `EODHD request failed: ${res.status}`;
    throw new Error(message);
  }
  return data as T;
}

/** True for any symbol this site routes to EODHD/HKEX — the single source
 * of truth for that routing decision, used by the profile page, the
 * timeseries API route, and the search UI's "limited data" check. */
export function isHongKongSymbol(symbol: string): boolean {
  return symbol.toUpperCase().endsWith(".HK");
}

/** Strips the ".HK" suffix to get the bare EODHD/HKEX code, e.g.
 * "0700.HK" -> "0700". */
function hkCode(symbol: string): string {
  return symbol.toUpperCase().replace(/\.HK$/, "");
}

type HkDirectoryEntry = {
  Code: string;
  Name: string;
  Country: string;
  Exchange: string;
  Currency: string;
  Type: string;
};

// The full HKEX ticker directory (~3,700 entries, a few hundred KB) — free
// on EODHD's "Exchange symbol list" endpoint, and the only reliable way to
// search HK companies by name: neither Twelve Data's nor EODHD's own
// free-text search endpoints reliably surface plain HKEX common-stock
// listings (confirmed by testing both against "Tencent" and "HSBC" — both
// returned warrants/depositary-receipts/wrong-market noise instead of the
// real 0700.HK / 0005.HK listings). Fetched once and cached for 24 hours
// via Next's fetch cache — HKEX listings don't change intraday, and the
// free tier's 20-calls/day limit makes re-fetching this per search a bad
// idea anyway.
async function getHkDirectory(): Promise<HkDirectoryEntry[]> {
  return fetchEodhd<HkDirectoryEntry[]>("exchange-symbol-list/HK", {}, 86400);
}

export type SymbolSearchResultLike = {
  symbol: string;
  instrument_name: string;
  exchange: string;
  country: string;
  type: string;
};

/** Searches the HKEX directory by company name or ticker code (simple
 * case-insensitive substring match — the directory is small enough that a
 * full-text search service would be overkill). Returns results shaped like
 * Twelve Data's SymbolSearchResult so the existing search UI/route can
 * merge them in without a redesign. Common-stock listings are surfaced
 * first since those are what a student is almost always looking for. */
export async function searchHongKongSymbols(query: string, limit = 5): Promise<SymbolSearchResultLike[]> {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  let directory: HkDirectoryEntry[];
  try {
    directory = await getHkDirectory();
  } catch {
    return [];
  }

  const matches = directory.filter(
    (d) => d.Name.toLowerCase().includes(q) || d.Code.toLowerCase().includes(q)
  );
  matches.sort((a, b) => (a.Type === "Common Stock" ? -1 : 0) - (b.Type === "Common Stock" ? -1 : 0));

  return matches.slice(0, limit).map((d) => ({
    symbol: `${d.Code}.HK`,
    instrument_name: d.Name,
    exchange: "HKEX",
    country: d.Country,
    type: d.Type,
  }));
}

type EodhdRealTimeQuote = {
  code: string;
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  previousClose: number;
  change: number;
  change_p: number;
};

type EodhdEodPoint = {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  adjusted_close: number;
  volume: number;
};

/** Daily EOD history, most recent first (matches Twelve Data's own
 * ordering, so downstream code that does `[...values].reverse()` for
 * chronological order works unchanged). `limit` is trading days, not
 * calendar days.
 *
 * Bounded with `from` (a calendar-day lookback), NOT `limit` — confirmed
 * empirically that EODHD's `/eod` endpoint silently ignores `limit`
 * entirely (with or without `order`) and always returns its full ~1-year
 * default history regardless of the value passed. `from`/`to` date
 * filtering does work correctly. `daysBack: null` means no lower bound —
 * the full available history ("Max"). */
async function getHkEodHistory(symbol: string, daysBack: number | null): Promise<EodhdEodPoint[]> {
  const params: Record<string, string> = { period: "d", order: "d" };
  if (daysBack !== null) {
    const from = new Date();
    from.setDate(from.getDate() - daysBack);
    params.from = from.toISOString().slice(0, 10);
  }
  return fetchEodhd<EodhdEodPoint[]>(`eod/${hkCode(symbol)}.HK`, params, 900);
}

function toPricePoint(p: EodhdEodPoint): PricePoint {
  return {
    datetime: p.date,
    open: String(p.open),
    high: String(p.high),
    low: String(p.low),
    close: String(p.close),
    volume: String(p.volume),
  };
}

/** Full history for the Company Profile page's initial chart + computed
 * analytics (52-week range, moving average, volatility). `daysBack` is
 * calendar days (see getHkEodHistory) — 380 comfortably covers a trailing
 * 52 weeks with a small buffer for holidays. */
export async function getHkTimeSeries(symbol: string, daysBack: number | null = 380): Promise<TimeSeries> {
  const history = await getHkEodHistory(symbol, daysBack);
  return {
    meta: { symbol, interval: "1day", currency: "HKD", exchange_timezone: "Asia/Hong_Kong", exchange: "HKEX" },
    values: history.map(toPricePoint),
  };
}

// Chart range selector support — mirrors marketData.ts's Range/RANGE_CONFIG
// but daily-resolution only: EODHD's free tier doesn't include intraday
// data, so there's no real 5-minute-bar option for "1D" the way Twelve
// Data's US/UK/etc. charts have. "1D" instead shows the last few daily
// closes rather than pretending to be intraday — an honest degradation,
// not a silent gap. Values are calendar-day lookbacks, not trading-day
// counts (see getHkEodHistory for why — EODHD's `limit` param doesn't
// work), padded a bit past the nominal window to absorb weekends/holidays.
export type HkRange = "1D" | "1W" | "1M" | "3M" | "1Y" | "5Y" | "MAX";

const HK_RANGE_DAYS_BACK: Record<HkRange, number | null> = {
  "1D": 5,
  "1W": 10,
  "1M": 35,
  "3M": 100,
  "1Y": 380,
  "5Y": 1830,
  MAX: null, // no lower bound — the full history EODHD has
};

export async function getHkTimeSeriesForRange(symbol: string, range: HkRange): Promise<TimeSeries> {
  return getHkTimeSeries(symbol, HK_RANGE_DAYS_BACK[range]);
}

/** Just the latest close for one HK listing, in HKD — one cached API call,
 * no directory or history fetch. Used by ADR pages (BABA etc.) to compute
 * per-ordinary-share valuation multiples from the HK listing's price (see
 * src/lib/hkAdrMap.ts for why ADS bundle prices can't be used directly).
 * Returns null instead of throwing — a missing HK price should quietly
 * skip the price-derived multiples, never break the page. */
export async function getHkClose(symbol: string): Promise<number | null> {
  try {
    const realtime = await fetchEodhd<EodhdRealTimeQuote>(
      `real-time/${hkCode(symbol)}.HK`,
      {},
      60
    );
    return Number.isFinite(realtime.close) ? realtime.close : null;
  } catch {
    return null;
  }
}

/** Builds a Quote-shaped object (same fields Twelve Data's /quote returns)
 * from EODHD's real-time endpoint plus the HK directory (for the company
 * name — EODHD's own name/description data is paywalled on the free tier)
 * plus one year of real EOD history (for 52-week high/low and average
 * volume — EODHD's real-time endpoint doesn't include either, so these are
 * computed here the same way this project already computes other derived
 * stats rather than relying on a provider to hand them over, e.g.
 * src/lib/profileAnalysis.ts's moving average/volatility). Throws if the
 * symbol doesn't exist or the key is missing/invalid — same contract as
 * marketData.ts's getQuote(), so the profile page's existing error
 * handling applies unchanged. */
export async function getHkQuote(symbol: string): Promise<Quote> {
  const code = hkCode(symbol);

  const [realtime, directory, history] = await Promise.all([
    fetchEodhd<EodhdRealTimeQuote>(`real-time/${code}.HK`, {}, 60),
    getHkDirectory().catch(() => [] as HkDirectoryEntry[]),
    getHkEodHistory(symbol, 380).catch(() => [] as EodhdEodPoint[]),
  ]);

  const entry = directory.find((d) => d.Code === code);
  const closes = history.map((h) => h.close);
  const volumes = history.map((h) => h.volume);
  const week52High = closes.length > 0 ? Math.max(...history.map((h) => h.high)) : realtime.high;
  const week52Low = closes.length > 0 ? Math.min(...history.map((h) => h.low)) : realtime.low;
  const averageVolume =
    volumes.length > 0 ? volumes.reduce((a, b) => a + b, 0) / volumes.length : realtime.volume;

  return {
    symbol: `${code}.HK`,
    name: entry?.Name ?? `${code}.HK`,
    exchange: "HKEX",
    currency: entry?.Currency ?? "HKD",
    open: String(realtime.open),
    high: String(realtime.high),
    low: String(realtime.low),
    close: String(realtime.close),
    previous_close: String(realtime.previousClose),
    change: String(realtime.change),
    percent_change: String(realtime.change_p),
    volume: String(realtime.volume),
    average_volume: String(Math.round(averageVolume)),
    is_market_open: false,
    fifty_two_week: { low: String(week52Low), high: String(week52High) },
  };
}
