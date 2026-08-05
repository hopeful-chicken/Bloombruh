// Server-only wrapper around the EODHD API (https://eodhd.com) — used only
// for the HK company directory/search now. Price history and live quotes
// come from Yahoo Finance instead (src/lib/yahooFinance.ts) — EODHD's free
// tier caps EOD history at 1 year regardless of the range requested
// (confirmed empirically), which broke the 10Y/Max chart views.
//
// Never import this from a "use client" component: it reads
// process.env.EODHD_API_KEY and would leak the key into the browser bundle.
//
// Free tier limits: 20 calls/day + a 500-call welcome bonus. The HK company
// directory (below) is fetched once and cached for 24 hours since HKEX
// listings don't change intraday and the quota is thin.

const BASE_URL = "https://eodhd.com/api";

function getApiKey(): string {
  const key = process.env.EODHD_API_KEY;
  if (!key) {
    throw new Error(
      "EODHD_API_KEY is not set. Copy .env.local.example to .env.local and add a free key from https://eodhd.com/register"
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
    const message = typeof data === "string" ? data : (data?.message ?? `EODHD request failed: ${res.status}`);
    throw new Error(message);
  }
  return data as T;
}

/** Strips a ".HK" suffix if present, e.g. "0700.HK" -> "0700". */
export function hkCode(symbol: string): string {
  return symbol.toUpperCase().replace(/\.HK$/, "");
}

export type HkDirectoryEntry = {
  Code: string;
  Name: string;
  Country: string;
  Exchange: string;
  Currency: string;
  Type: string;
};

// The full HKEX ticker directory (~3,700 entries) — the only reliable way to
// search HK companies by name on the free tier.
export async function getHkDirectory(): Promise<HkDirectoryEntry[]> {
  return fetchEodhd<HkDirectoryEntry[]>("exchange-symbol-list/HK", {}, 86400);
}

export type SearchResult = {
  code: string; // bare code, e.g. "0700"
  name: string;
  type: string;
};

/** Case-insensitive substring search over the HK directory by name or code.
 * Common-stock listings are surfaced first — that's what a search is almost
 * always looking for over warrants/depositary receipts/etc. */
export async function searchHkCompanies(query: string, limit = 12): Promise<SearchResult[]> {
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
    code: d.Code,
    name: d.Name,
    type: d.Type,
  }));
}

/** Looks up a single company's name from the directory by its bare code.
 * Returns null if the code isn't in the HKEX directory. */
export async function getHkCompanyName(code: string): Promise<string | null> {
  const directory = await getHkDirectory();
  const entry = directory.find((d) => d.Code === hkCode(code));
  return entry?.Name ?? null;
}

// --- Fallback quote/history, used only when Yahoo Finance is unavailable ---
// Yahoo's chart endpoint is unofficial and free but does rate-limit under
// heavy use (confirmed empirically — a burst of requests during testing
// got a 429 from Yahoo that lasted several minutes). EODHD is the more
// official source but its free tier caps history at 1 year, so it's only
// used as an emergency fallback (src/lib/yahooFinance.ts), not the primary
// path — that keeps the thin 20-calls/day quota mostly free for search.

export type FallbackQuote = {
  symbol: string;
  name: string;
  currency: string;
  open: number;
  high: number;
  low: number;
  close: number;
  previousClose: number;
  change: number;
  changePercent: number;
  volume: number;
};

type EodhdRealTimeQuote = {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  previousClose: number;
  change: number;
  change_p: number;
};

export async function getHkQuoteFallback(code: string): Promise<FallbackQuote> {
  const bareCode = hkCode(code);
  const [realtime, name] = await Promise.all([
    fetchEodhd<EodhdRealTimeQuote>(`real-time/${bareCode}.HK`, {}, 60),
    getHkCompanyName(bareCode).catch(() => null),
  ]);

  return {
    symbol: `${bareCode}.HK`,
    name: name ?? `${bareCode}.HK`,
    currency: "HKD",
    open: realtime.open,
    high: realtime.high,
    low: realtime.low,
    close: realtime.close,
    previousClose: realtime.previousClose,
    change: realtime.change,
    changePercent: realtime.change_p,
    volume: realtime.volume,
  };
}

export type FallbackPricePoint = {
  date: string; // "YYYY-MM-DD"
  close: number;
};

type EodhdEodPoint = {
  date: string;
  close: number;
};

/** Up to 1 year of history — that's the hard cap on EODHD's free tier, so
 * this is only ever a reasonable fallback for the 1W/1M/3M/1Y ranges, never
 * for 10Y/MAX. */
export async function getPriceHistoryFallback(code: string): Promise<FallbackPricePoint[]> {
  const from = new Date();
  from.setDate(from.getDate() - 380);
  const history = await fetchEodhd<EodhdEodPoint[]>(
    `eod/${hkCode(code)}.HK`,
    { period: "d", order: "d", from: from.toISOString().slice(0, 10) },
    900
  );
  return history.map((p) => ({ date: p.date, close: p.close })).reverse();
}
