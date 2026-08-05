// Server-only wrapper around the Alpha Vantage API (https://alphavantage.co)
// — insider transactions, institutional holdings, sentiment-scored news,
// the earnings calendar, top gainers/losers, and two US economic
// indicators (CPI, unemployment). Every function here was tested with a
// real call before being wired in (see docs/DECISIONS.md).
//
// Free tier is genuinely thin: 25 requests/day, 1 request/second. Every
// function uses Next.js's fetch cache with a 24h revalidate window, the
// same pattern this project already uses for EODHD/Yahoo Finance/HK
// company data — a low-traffic student project realistically won't touch
// more than a couple dozen distinct symbols a day, so an on-demand cache
// (rather than a separate scheduled batch job this project has no
// infrastructure for) comfortably stays inside the quota.
//
// Never import this from a "use client" component: it reads
// process.env.ALPHA_VANTAGE_API_KEY and would leak the key into the
// browser bundle.
//
// NOT covered: Hong Kong Stock Exchange tickers — confirmed empirically
// (searched "Tencent", got Frankfurt/US-OTC/London listings, no HKEX
// listing at all). Use src/lib/hkex/* for HK names instead.

const BASE_URL = "https://www.alphavantage.co/query";

function getApiKey(): string {
  const key = process.env.ALPHA_VANTAGE_API_KEY;
  if (!key) {
    throw new Error(
      "ALPHA_VANTAGE_API_KEY is not set. Copy .env.local.example to .env.local and add a free key from https://www.alphavantage.co/support/#api-key"
    );
  }
  return key;
}

// Serializes every outbound call through this module with a minimum gap
// between them, so the free tier's 1-request/second throttle can never be
// tripped no matter how callers structure their own awaits. A promise
// chain (not just a timestamp check) is what actually serializes
// concurrent callers — a bare "if enough time has passed" check would let
// two requests that arrive in the same tick both see "yes, go ahead".
//
// This fixes real concurrent-call bursts, but it is NOT what was behind
// the rate-limit errors hit while building this: timestamped logging
// confirmed calls were genuinely ~3s apart and still got rejected with
// the same "Information" message. That points to the 25-requests/DAY cap,
// not the 1/second one — and, worth knowing, it kept happening even on a
// freshly-unused key tried mid-session, which suggests Alpha Vantage may
// bucket free-tier usage by IP address, not purely by key. Don't read "a
// brand new key is failing immediately" as a code bug without checking
// whether the same machine already spent today's quota on another key
// first.
let requestQueue: Promise<void> = Promise.resolve();
let lastRequestAt = 0;
const MIN_INTERVAL_MS = 1200;

function throttle(): Promise<void> {
  const next = requestQueue.then(async () => {
    const wait = lastRequestAt + MIN_INTERVAL_MS - Date.now();
    if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait));
    lastRequestAt = Date.now();
  });
  requestQueue = next;
  return next;
}

async function fetchAlphaVantage<T>(
  params: Record<string, string>,
  revalidateSeconds = 86400
): Promise<T> {
  const url = new URL(BASE_URL);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  url.searchParams.set("apikey", getApiKey());

  await throttle();
  const res = await fetch(url.toString(), { next: { revalidate: revalidateSeconds } });
  const text = await res.text();

  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    // A handful of endpoints (EARNINGS_CALENDAR) return CSV, not JSON —
    // callers that expect CSV pass through the raw text themselves via
    // fetchAlphaVantageCsv below, so a JSON parse failure here is a real
    // error, not a valid alternate response shape.
    throw new Error(`Alpha Vantage returned a non-JSON response: ${text.slice(0, 200)}`);
  }

  if (data && typeof data === "object" && "Information" in data) {
    // The free-tier rate-limit message ("25 requests/day" / "1
    // request/second") comes back as a 200 OK with an "Information" field
    // instead of an HTTP error — has to be checked explicitly.
    throw new Error(String((data as { Information: string }).Information));
  }
  if (data && typeof data === "object" && "Error Message" in data) {
    throw new Error(String((data as { "Error Message": string })["Error Message"]));
  }

  return data as T;
}

async function fetchAlphaVantageCsv(
  params: Record<string, string>,
  revalidateSeconds = 86400
): Promise<string> {
  const url = new URL(BASE_URL);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  url.searchParams.set("apikey", getApiKey());

  await throttle();
  const res = await fetch(url.toString(), { next: { revalidate: revalidateSeconds } });
  const text = await res.text();
  if (text.trim().startsWith("{")) {
    // A JSON body here means an error (rate limit, bad symbol) rather than
    // the expected CSV.
    const parsed = JSON.parse(text);
    throw new Error(parsed.Information ?? parsed["Error Message"] ?? "Unexpected JSON response for a CSV endpoint");
  }
  return text;
}

// --- Insider transactions ---

export type InsiderTransaction = {
  transactionDate: string;
  executive: string;
  executiveTitle: string;
  securityType: string;
  acquisitionOrDisposal: "A" | "D";
  shares: number;
  sharePrice: number | null;
};

type RawInsiderTransaction = {
  transaction_date: string;
  ticker: string;
  executive: string;
  executive_title: string;
  security_type: string;
  acquisition_or_disposal: string;
  shares: string;
  share_price: string;
};

/** Up to `limit` most recent insider transactions for `symbol`, newest
 * first. Real Form-4-derived data — confirmed live against AAPL and ROKU. */
export async function getInsiderTransactions(symbol: string, limit = 10): Promise<InsiderTransaction[]> {
  const data = await fetchAlphaVantage<{ data: RawInsiderTransaction[] }>({
    function: "INSIDER_TRANSACTIONS",
    symbol,
  });
  const rows = data.data ?? [];
  return rows
    .map((r) => ({
      transactionDate: r.transaction_date,
      executive: r.executive,
      executiveTitle: r.executive_title,
      securityType: r.security_type,
      acquisitionOrDisposal: r.acquisition_or_disposal === "A" ? ("A" as const) : ("D" as const),
      shares: Number(r.shares),
      sharePrice: r.share_price ? Number(r.share_price) : null,
    }))
    .sort((a, b) => (a.transactionDate < b.transactionDate ? 1 : -1))
    .slice(0, limit);
}

// --- Institutional holdings ---

export type InstitutionalHolder = {
  holderName: string;
  sharesHeld: number;
  sharesChanged: number;
  sharesChangedPercentage: string;
  changeType: string;
  lastReported: string;
};

export type InstitutionalHoldingsSummary = {
  totalHolders: number;
  totalOwnershipPercentage: string;
  topHolders: InstitutionalHolder[];
};

/** Real institutional ownership summary — confirmed live against MSFT
 * (6,612 holders, Vanguard/BlackRock at the top, real % changes). */
export async function getInstitutionalHoldings(symbol: string, limit = 8): Promise<InstitutionalHoldingsSummary> {
  const data = await fetchAlphaVantage<{
    total_institutional_holders: string;
    total_institutional_ownership_percentage: string;
    holdings: Array<{
      holder_name: string;
      shares_held: string;
      shares_changed: string;
      shares_changed_percentage: string;
      change_type: string;
      last_reported: string;
    }>;
  }>({ function: "INSTITUTIONAL_HOLDINGS", symbol });

  return {
    totalHolders: Number(data.total_institutional_holders ?? 0),
    totalOwnershipPercentage: data.total_institutional_ownership_percentage ?? "",
    topHolders: (data.holdings ?? []).slice(0, limit).map((h) => ({
      holderName: h.holder_name,
      sharesHeld: Number(h.shares_held),
      sharesChanged: Number(h.shares_changed),
      sharesChangedPercentage: h.shares_changed_percentage,
      changeType: h.change_type,
      lastReported: h.last_reported,
    })),
  };
}

// --- Sentiment-scored news ---

export type SentimentNewsItem = {
  title: string;
  url: string;
  source: string;
  timePublished: string; // ISO
  summary: string;
  sentimentScore: number;
  sentimentLabel: string;
};

function toIsoDate(raw: string): string {
  // Alpha Vantage's own compact format: "20260805T022931"
  const m = raw.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})$/);
  if (!m) return raw;
  const [, y, mo, d, h, mi, s] = m;
  return `${y}-${mo}-${d}T${h}:${mi}:${s}Z`;
}

/** Up to `limit` recent articles for `symbol` with a bullish/bearish
 * sentiment score — confirmed live against NVDA. Complements (doesn't
 * replace) the plain Google News headline list in src/lib/news.ts, which
 * has no rate limit and stays the primary news source. */
export async function getNewsSentiment(symbol: string, limit = 6): Promise<SentimentNewsItem[]> {
  const data = await fetchAlphaVantage<{
    feed: Array<{
      title: string;
      url: string;
      source: string;
      time_published: string;
      summary: string;
      overall_sentiment_score: number;
      overall_sentiment_label: string;
    }>;
  }>({ function: "NEWS_SENTIMENT", tickers: symbol, limit: String(limit) });

  return (data.feed ?? []).slice(0, limit).map((it) => ({
    title: it.title,
    url: it.url,
    source: it.source,
    timePublished: toIsoDate(it.time_published),
    summary: it.summary,
    sentimentScore: it.overall_sentiment_score,
    sentimentLabel: it.overall_sentiment_label,
  }));
}

// --- Earnings calendar ---

export type UpcomingEarnings = {
  symbol: string;
  name: string;
  reportDate: string;
  fiscalDateEnding: string;
  estimate: number | null;
  currency: string;
  timeOfDay: string | null;
};

/** The full 3-month US earnings calendar is one big CSV (thousands of
 * rows) — fetched and cached once (24h), then filtered per lookup rather
 * than making a separate API call per company. Confirmed live: real
 * report dates and EPS estimates for thousands of real US tickers. */
async function getFullEarningsCalendar(): Promise<UpcomingEarnings[]> {
  const csv = await fetchAlphaVantageCsv({ function: "EARNINGS_CALENDAR", horizon: "3month" });
  const lines = csv.trim().split("\n");
  const rows: UpcomingEarnings[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",");
    if (cols.length < 7) continue;
    const [symbol, name, reportDate, fiscalDateEnding, estimate, currency, timeOfDay] = cols;
    rows.push({
      symbol,
      name,
      reportDate,
      fiscalDateEnding,
      estimate: estimate ? Number(estimate) : null,
      currency,
      timeOfDay: timeOfDay || null,
    });
  }
  return rows;
}

/** The next scheduled earnings date for a single US ticker, or null if
 * it's not in the next 3 months (or not a US-listed company Alpha Vantage
 * covers). */
export async function getNextEarnings(symbol: string): Promise<UpcomingEarnings | null> {
  const all = await getFullEarningsCalendar();
  const bare = symbol.toUpperCase().replace(/\.(HK|US)$/, "");
  return all.find((r) => r.symbol === bare) ?? null;
}

// --- Top gainers/losers ---

export type MarketMover = {
  ticker: string;
  price: number;
  changeAmount: number;
  changePercentage: string;
  volume: number;
};

export type TopMovers = {
  lastUpdated: string;
  topGainers: MarketMover[];
  topLosers: MarketMover[];
  mostActive: MarketMover[];
};

type RawMover = { ticker: string; price: string; change_amount: string; change_percentage: string; volume: string };

function mapMovers(raw: RawMover[] | undefined, limit: number): MarketMover[] {
  return (raw ?? []).slice(0, limit).map((m) => ({
    ticker: m.ticker,
    price: Number(m.price),
    changeAmount: Number(m.change_amount),
    changePercentage: m.change_percentage,
    volume: Number(m.volume),
  }));
}

/** Real daily US market movers — confirmed live (real tickers, real
 * volumes, dated to the current trading day). */
export async function getTopMovers(limit = 5): Promise<TopMovers> {
  const data = await fetchAlphaVantage<{
    last_updated: string;
    top_gainers: RawMover[];
    top_losers: RawMover[];
    most_actively_traded: RawMover[];
  }>({ function: "TOP_GAINERS_LOSERS" }, 3600); // refreshes through the trading day, so a shorter cache than the 24h default

  return {
    lastUpdated: data.last_updated,
    topGainers: mapMovers(data.top_gainers, limit),
    topLosers: mapMovers(data.top_losers, limit),
    mostActive: mapMovers(data.most_actively_traded, limit),
  };
}

// --- US economic indicators (CPI, unemployment) ---
// Deliberately NOT federal-funds-rate or treasury-yield here: those would
// duplicate the Fed's own policy rate already shown in the Central Bank
// Room (src/lib/centralBankRates.ts), sourced there from the Fed's own
// official series. CPI and unemployment are genuinely new data this site
// didn't have anywhere before.

export type EconomicIndicatorPoint = { date: string; value: number };

async function getMonthlyIndicator(fn: "CPI" | "UNEMPLOYMENT"): Promise<EconomicIndicatorPoint[]> {
  const data = await fetchAlphaVantage<{ data: Array<{ date: string; value: string }> }>({ function: fn });
  return (data.data ?? []).map((p) => ({ date: p.date, value: Number(p.value) }));
}

/** US CPI (index, 1982-1984=100), monthly, newest first — confirmed live
 * through June 2026. */
export async function getCpi(): Promise<EconomicIndicatorPoint[]> {
  return getMonthlyIndicator("CPI");
}

/** US unemployment rate (%), monthly, newest first — confirmed live
 * through June 2026. */
export async function getUnemploymentRate(): Promise<EconomicIndicatorPoint[]> {
  return getMonthlyIndicator("UNEMPLOYMENT");
}
