// Server-only wrapper around Yahoo Finance's public chart endpoint — no API
// key, and confirmed live to genuinely return 10 years of daily history and
// a "max" range back to a company's listing date for HK tickers. This
// replaces EODHD as the primary source for price history and the live
// quote: EODHD's free tier caps EOD history at 1 year regardless of the
// date range requested (confirmed empirically — the API itself returns a
// "Data is limited by one year as you have free subscription" warning on
// any row past a year back), so "10Y"/"MAX" never actually worked there.
//
// There's no simpler alternative than this: Google doesn't publish a free
// historical-price API either (what GOOGLEFINANCE() does inside Sheets
// isn't a public HTTP endpoint), and Google Finance's own website is a
// client-rendered app with no server-side data to fetch. Yahoo's chart
// endpoint is the closest free equivalent, unofficial or not.
//
// It does rate-limit under heavy use, though (confirmed empirically — a
// burst of requests while testing this got a 429 that lasted for a while).
// So every function here retries once on a 429, and falls back to EODHD
// (src/lib/eodhd.ts) if Yahoo still fails — EODHD can't cover 10Y/MAX
// itself, but its ~1 year of data is used as an honest partial fallback for
// those too (see PriceHistoryResult.isPartial) rather than showing nothing.

import { hkCode, getHkCompanyName, getHkQuoteFallback, getPriceHistoryFallback } from "./eodhd";

const BASE_URL = "https://query1.finance.yahoo.com/v8/finance/chart";

// A real browser User-Agent is required — Yahoo's chart endpoint 4xxs
// requests with no UA or an obvious script UA.
const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
};

type YahooChartResult = {
  meta: {
    currency?: string;
    longName?: string;
    shortName?: string;
    regularMarketPrice?: number;
    regularMarketDayHigh?: number;
    regularMarketDayLow?: number;
    regularMarketVolume?: number;
    fiftyTwoWeekHigh?: number;
    fiftyTwoWeekLow?: number;
  };
  timestamp?: number[];
  indicators: {
    quote: Array<{
      open?: (number | null)[];
      high?: (number | null)[];
      low?: (number | null)[];
      close?: (number | null)[];
      volume?: (number | null)[];
    }>;
  };
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchYahooChartOnce(
  code: string,
  range: string,
  interval: string,
  revalidateSeconds: number
): Promise<{ result?: YahooChartResult; status: number; message?: string }> {
  const symbol = `${hkCode(code)}.HK`;
  const url = `${BASE_URL}/${symbol}?range=${range}&interval=${interval}`;
  const res = await fetch(url, { headers: HEADERS, next: { revalidate: revalidateSeconds } });
  const data = await res.json().catch(() => null);
  const result: YahooChartResult | undefined = data?.chart?.result?.[0];
  return { result, status: res.status, message: data?.chart?.error?.description };
}

/** Retries once on a 429 (Yahoo's rate limit) after a short delay — cheap
 * insurance against transient bursts, though a sustained rate-limit ban
 * still falls through to the caller's EODHD fallback. */
async function fetchYahooChart(
  code: string,
  range: string,
  interval: string,
  revalidateSeconds: number
): Promise<YahooChartResult> {
  let attempt = await fetchYahooChartOnce(code, range, interval, revalidateSeconds);
  if (attempt.status === 429) {
    await sleep(800);
    attempt = await fetchYahooChartOnce(code, range, interval, revalidateSeconds);
  }
  if (!attempt.result) {
    throw new Error(attempt.message ?? `Yahoo Finance request failed: ${attempt.status}`);
  }
  return attempt.result;
}

export type PricePoint = {
  date: string; // "YYYY-MM-DD"
  close: number;
};

export type Range = "1W" | "1M" | "3M" | "1Y" | "10Y" | "MAX";

// Yahoo's own range/interval vocabulary, plus a cache TTL per range: older
// history barely changes, so long ranges are cached far longer than short
// ones to cut down on repeat calls (and therefore rate-limit risk).
// "MAX" is left to Yahoo's own coarsening (it silently serves monthly bars
// for very long spans no matter what interval is requested — confirmed
// empirically), a reasonable, honest resolution for a multi-decade view.
const RANGE_PARAMS: Record<Range, { range: string; interval: string; revalidateSeconds: number }> = {
  "1W": { range: "5d", interval: "1d", revalidateSeconds: 900 },
  "1M": { range: "1mo", interval: "1d", revalidateSeconds: 900 },
  "3M": { range: "3mo", interval: "1d", revalidateSeconds: 1800 },
  "1Y": { range: "1y", interval: "1d", revalidateSeconds: 1800 },
  "10Y": { range: "10y", interval: "1d", revalidateSeconds: 21600 },
  MAX: { range: "max", interval: "1mo", revalidateSeconds: 21600 },
};

function toDateString(timestampSeconds: number): string {
  return new Date(timestampSeconds * 1000).toISOString().slice(0, 10);
}

async function getPriceHistoryFromYahoo(code: string, range: Range): Promise<PricePoint[]> {
  const { range: r, interval, revalidateSeconds } = RANGE_PARAMS[range];
  const result = await fetchYahooChart(code, r, interval, revalidateSeconds);
  const timestamps = result.timestamp ?? [];
  const closes = result.indicators.quote[0]?.close ?? [];

  const points: PricePoint[] = [];
  for (let i = 0; i < timestamps.length; i++) {
    const close = closes[i];
    if (close == null) continue; // non-trading day placeholder in the array
    points.push({ date: toDateString(timestamps[i]), close });
  }
  return points;
}

export type PriceHistoryResult = {
  points: PricePoint[];
  /** True when this is EODHD's ~1-year fallback standing in for a longer
   * range Yahoo couldn't serve (10Y/MAX) — the caller should say so rather
   * than silently mislabel a 1-year chart as 10 years. */
  isPartial: boolean;
};

/** Falls back to EODHD (capped at ~1 year) if Yahoo is unavailable for
 * ANY range, including 10Y/MAX — better to honestly show a shorter real
 * chart with a note than nothing at all. */
export async function getPriceHistory(code: string, range: Range): Promise<PriceHistoryResult> {
  try {
    return { points: await getPriceHistoryFromYahoo(code, range), isPartial: false };
  } catch (yahooError) {
    try {
      const points = await getPriceHistoryFallback(code);
      return { points, isPartial: range === "10Y" || range === "MAX" };
    } catch {
      throw yahooError;
    }
  }
}

export type Quote = {
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

/** Previous close is taken from the second-to-last daily bar (not Yahoo's
 * own `chartPreviousClose`, which for a short range is the close from
 * *before that whole window* — e.g. for a 5-day request it's 5 trading
 * days ago, not yesterday — confirmed empirically against 0700.HK). */
async function getHkQuoteFromYahoo(code: string): Promise<Quote> {
  const bareCode = hkCode(code);
  const [result, directoryName] = await Promise.all([
    fetchYahooChart(code, "5d", "1d", 60),
    getHkCompanyName(bareCode).catch(() => null),
  ]);

  const quote = result.indicators.quote[0];
  const closes = (quote.close ?? []).filter((c): c is number => c != null);
  const opens = (quote.open ?? []).filter((o): o is number => o != null);
  const highs = (quote.high ?? []).filter((h): h is number => h != null);
  const lows = (quote.low ?? []).filter((l): l is number => l != null);
  const volumes = (quote.volume ?? []).filter((v): v is number => v != null);

  const close = result.meta.regularMarketPrice ?? closes[closes.length - 1];
  const previousClose = closes.length > 1 ? closes[closes.length - 2] : close;
  const change = close - previousClose;
  const changePercent = previousClose !== 0 ? (change / previousClose) * 100 : 0;

  return {
    symbol: `${bareCode}.HK`,
    name: directoryName ?? result.meta.longName ?? result.meta.shortName ?? `${bareCode}.HK`,
    currency: result.meta.currency ?? "HKD",
    open: opens[opens.length - 1] ?? close,
    high: result.meta.regularMarketDayHigh ?? highs[highs.length - 1] ?? close,
    low: result.meta.regularMarketDayLow ?? lows[lows.length - 1] ?? close,
    close,
    previousClose,
    change,
    changePercent,
    volume: result.meta.regularMarketVolume ?? volumes[volumes.length - 1] ?? 0,
  };
}

/** Falls back to EODHD's real-time quote if Yahoo is unavailable. */
export async function getHkQuote(code: string): Promise<Quote> {
  try {
    return await getHkQuoteFromYahoo(code);
  } catch (yahooError) {
    try {
      return await getHkQuoteFallback(code);
    } catch {
      throw yahooError;
    }
  }
}
