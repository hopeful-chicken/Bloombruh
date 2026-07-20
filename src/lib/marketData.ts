// Server-only wrapper around the Twelve Data API (https://twelvedata.com).
// Never import this from a "use client" component — it reads process.env
// and would leak the API key into the browser bundle if it were.
//
// Free tier: 800 requests/day, 8 requests/minute. We keep well under that
// by using Next.js's fetch cache (the `next: { revalidate }` option below)
// so repeat visits to the same ticker within the cache window don't cost
// another API call.

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
  is_market_open: boolean;
};

/** Current (or last close) price and day's change. Cached 1 minute. */
export function getQuote(symbol: string): Promise<Quote> {
  return fetchTwelveData<Quote>("quote", { symbol }, 60);
}

export type CompanyProfile = {
  symbol: string;
  name: string;
  exchange: string;
  sector: string;
  industry: string;
  employees: number;
  website: string;
  description: string;
  type: string;
  CEO: string;
  address: string;
  city: string;
  country: string;
};

/** Company description, sector, industry, etc. Cached 24 hours — this data barely changes. */
export function getCompanyProfile(symbol: string): Promise<CompanyProfile> {
  return fetchTwelveData<CompanyProfile>("profile", { symbol }, 86400);
}

export type Statistics = {
  statistics: {
    valuations_metrics: {
      market_capitalization?: number;
      trailing_pe?: number;
      forward_pe?: number;
      peg_ratio?: number;
      price_to_sales_ttm?: number;
      price_to_book_mrq?: number;
      enterprise_value?: number;
    };
    financials: {
      quarterly_revenue_growth?: number;
      quarterly_earnings_growth_yoy?: number;
      gross_margin?: number;
      profit_margin?: number;
      operating_margin?: number;
      return_on_equity_ttm?: number;
      income_statement?: {
        diluted_eps_ttm?: number;
      };
    };
    stock_statistics: {
      "52_week_high"?: number;
      "52_week_low"?: number;
      shares_outstanding?: number;
      "beta"?: number;
    };
    dividends_and_splits: {
      forward_annual_dividend_yield?: number;
    };
  };
};

/** Key valuation multiples and financial ratios. Cached 24 hours. */
export function getStatistics(symbol: string): Promise<Statistics> {
  return fetchTwelveData<Statistics>("statistics", { symbol }, 86400);
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
  outputsize = 180
): Promise<TimeSeries> {
  return fetchTwelveData<TimeSeries>(
    "time_series",
    { symbol, interval: "1day", outputsize: String(outputsize) },
    900
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
