// Server-only wrapper around the Twelve Data API (https://twelvedata.com).
// Never import this from a "use client" component — it reads process.env
// and would leak the API key into the browser bundle if it were.
//
// Free tier: 800 requests/day, 8 requests/minute. We keep well under that
// by using Next.js's fetch cache (the `next: { revalidate }` option below)
// so repeat visits to the same ticker within the cache window don't cost
// another API call.
//
// IMPORTANT — only /quote, /time_series, and /symbol_search are actually
// available on the free plan. /profile and /statistics (company
// description, P/E, market cap, dividend yield, etc.) return HTTP 403 on
// the free plan — they require a paid "Grow" plan ($29/mo) or higher.
// This was discovered after building against Twelve Data's docs, which
// don't make the free-vs-paid split obvious. So this module deliberately
// does NOT call those two endpoints — see docs/DECISIONS.md for the full
// story and docs/DATA_SOURCES.md for what's really free.

const BASE_URL = "https://api.twelvedata.com";

function getApiKey(): string {
  const key = process.env.TWELVE_DATA_API_KEY;
  if (!key) {
    throw new Error(
      "TWELVE_DATA_API_KEY is not set. Copy .env.local.example to .env.local and add a free key from https://twelvedata.com/pricing"
    );
  }
  return key;
}

async function fetchTwelveData<T>(
  endpoint: string,
  params: Record<string, string>,
  revalidateSeconds: number
): Promise<T> {
  const url = new URL(`${BASE_URL}/${endpoint}`);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  url.searchParams.set("apikey", getApiKey());

  const res = await fetch(url.toString(), {
    next: { revalidate: revalidateSeconds },
  });

  if (!res.ok) {
    throw new Error(`Twelve Data request failed: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();

  // Twelve Data returns HTTP 200 even on API-level errors (bad symbol,
  // rate limit, etc.) — the error shows up in the JSON body instead.
  if (data.status === "error" || data.code >= 400) {
    throw new Error(data.message ?? "Twelve Data returned an error");
  }

  return data as T;
}

export type Quote = {
  symbol: string;
  name: string;
  exchange: string;
  currency: string;
  open: string;
  high: string;
  low: string;
  close: string;
  previous_close: string;
  change: string;
  percent_change: string;
  volume: string;
  average_volume: string;
  is_market_open: boolean;
  fifty_two_week: {
    low: string;
    high: string;
  };
};

/** Current (or last close) price, day's change, and 52-week range. Cached 1 minute. */
export function getQuote(symbol: string): Promise<Quote> {
  return fetchTwelveData<Quote>("quote", { symbol }, 60);
}

export type PricePoint = {
  datetime: string;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
};

export type TimeSeries = {
  meta: {
    symbol: string;
    interval: string;
    currency: string;
    exchange_timezone: string;
    exchange: string;
  };
  values: PricePoint[];
};

/** Historical daily closes, most recent `outputsize` trading days. Cached 15 minutes. */
export function getTimeSeries(
  symbol: string,
  outputsize = 252
): Promise<TimeSeries> {
  return fetchTwelveData<TimeSeries>(
    "time_series",
    { symbol, interval: "1day", outputsize: String(outputsize) },
    900
  );
}

// Chart range selector support ----------------------------------------
//
// Each range maps to a Twelve Data interval + how many bars to pull.
// Longer ranges use coarser intervals (weekly) so we don't ask for
// thousands of daily points, and the free plan doesn't get hit harder
// than it needs to be. Intraday ("1D") is cached for a much shorter
// window since it should stay close to live during market hours.
export type Range = "1D" | "1M" | "3M" | "1Y" | "MAX";

const RANGE_CONFIG: Record<
  Range,
  { interval: string; outputsize: number; revalidateSeconds: number }
> = {
  "1D": { interval: "5min", outputsize: 80, revalidateSeconds: 60 },
  "1M": { interval: "1day", outputsize: 22, revalidateSeconds: 900 },
  "3M": { interval: "1day", outputsize: 65, revalidateSeconds: 900 },
  "1Y": { interval: "1day", outputsize: 252, revalidateSeconds: 900 },
  MAX: { interval: "1week", outputsize: 260, revalidateSeconds: 3600 },
};

/** Historical closes for a given chart range (1D/1M/3M/1Y/MAX). */
export function getTimeSeriesForRange(
  symbol: string,
  range: Range
): Promise<TimeSeries> {
  const { interval, outputsize, revalidateSeconds } = RANGE_CONFIG[range];
  return fetchTwelveData<TimeSeries>(
    "time_series",
    { symbol, interval, outputsize: String(outputsize) },
    revalidateSeconds
  );
}

export type SymbolSearchResult = {
  symbol: string;
  instrument_name: string;
  exchange: string;
  country: string;
  type: string;
};

/** Ticker/name autocomplete search. Cached 1 hour. */
export async function searchSymbols(
  query: string
): Promise<SymbolSearchResult[]> {
  if (!query.trim()) return [];
  const data = await fetchTwelveData<{ data: SymbolSearchResult[] }>(
    "symbol_search",
    { symbol: query },
    3600
  );
  return data.data ?? [];
}
