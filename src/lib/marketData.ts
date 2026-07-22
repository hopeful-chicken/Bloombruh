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

import { hasFreeQuoteData } from "./exchangeCoverage";

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

  // Twelve Data usually returns HTTP 200 even on API-level errors (bad
  // symbol, rate limit, etc.), with the error in the JSON body instead —
  // but for the "this symbol needs a paid plan" case it returns a real
  // HTTP 404 with the explanation still in the JSON body. So the body must
  // be read and checked for a message *before* giving up on a non-OK
  // status, otherwise that specific, useful message is thrown away in
  // favour of a generic "request failed" one.
  const data = await res.json().catch(() => null);

  if (data && (data.status === "error" || data.code >= 400)) {
    throw new Error(data.message ?? "Twelve Data returned an error");
  }

  if (!res.ok) {
    throw new Error(`Twelve Data request failed: ${res.status} ${res.statusText}`);
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
export type Range = "1D" | "1W" | "1M" | "3M" | "1Y" | "5Y" | "MAX";

const RANGE_CONFIG: Record<
  Range,
  { interval: string; outputsize: number; revalidateSeconds: number }
> = {
  "1D": { interval: "5min", outputsize: 80, revalidateSeconds: 60 },
  "1W": { interval: "1day", outputsize: 7, revalidateSeconds: 900 },
  "1M": { interval: "1day", outputsize: 22, revalidateSeconds: 900 },
  "3M": { interval: "1day", outputsize: 65, revalidateSeconds: 900 },
  "1Y": { interval: "1day", outputsize: 252, revalidateSeconds: 900 },
  "5Y": { interval: "1week", outputsize: 260, revalidateSeconds: 3600 },
  // True "as far back as the provider has" — monthly bars so the request
  // stays small. Confirmed empirically: SPY's real inception-to-date
  // history is ~400 months (back to 1993); 600 comfortably covers any
  // ETF's full history without erroring on ones with less (Twelve Data
  // just returns what exists, it doesn't pad or fail short of the cap).
  // Previously "MAX" reused the 5Y config (260 weekly bars) — mislabeled,
  // since a reader picking "Forever" got only 5 years with no visual cue
  // it was capped. Now MAX is genuinely longer than 5Y, and 5Y is its own
  // real option.
  MAX: { interval: "1month", outputsize: 600, revalidateSeconds: 3600 },
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
  return dedupeByCompany(data.data ?? []);
}

// Twelve Data's search returns one row per exchange a company is listed or
// cross-listed on — a single mid-cap company can easily come back as 5-10
// near-identical rows (its home exchange, plus Frankfurt, Stuttgart,
// Toronto, LSE, etc., all for the same business). A real ticker search
// shows one row per company, so this collapses same-named results down to
// one, preferring whichever listing this site's free plan can actually
// show a price for for (falling back to Twelve Data's own top-ranked
// listing if none of them are free-tier-compatible).
function dedupeByCompany(
  results: SymbolSearchResult[]
): SymbolSearchResult[] {
  const seen = new Map<string, SymbolSearchResult>();
  for (const result of results) {
    const key = result.instrument_name.trim().toLowerCase();
    const existing = seen.get(key);
    if (!existing) {
      seen.set(key, result);
    } else if (
      !hasFreeQuoteData(existing.exchange) &&
      hasFreeQuoteData(result.exchange)
    ) {
      seen.set(key, result);
    }
  }
  return Array.from(seen.values());
}
