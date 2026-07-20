// Server-only wrapper around the SEC's EDGAR XBRL data API
// (https://data.sec.gov). This is the free, official source of US public
// companies' actual filed financial statements (revenue, net income, etc.)
// — no key, no signup, no rate-limit tier games. It only covers companies
// that file with the SEC (US-listed), which is why Pitch Builder shows
// fundamentals for US tickers and gracefully skips them for others.
//
// The SEC requires a descriptive User-Agent header identifying the app —
// see https://www.sec.gov/os/webmaster-faq#developers. It does NOT require
// an API key.

const USER_AGENT = "GraduateAnalystTerminal contact@example.com (student project)";

// SEC's full ticker → CIK (Central Index Key) lookup table. It's one file,
// ~1MB, and barely changes — cached for a day.
const TICKER_MAP_URL = "https://www.sec.gov/files/company_tickers.json";

type TickerMapEntry = { cik_str: number; ticker: string; title: string };

async function fetchTickerMap(): Promise<Record<string, TickerMapEntry>> {
  const res = await fetch(TICKER_MAP_URL, {
    headers: { "User-Agent": USER_AGENT },
    next: { revalidate: 86400 },
  });
  if (!res.ok) {
    throw new Error(`SEC ticker map request failed: ${res.status}`);
  }
  const data = (await res.json()) as Record<string, TickerMapEntry>;
  return data;
}

/** Looks up a ticker's 10-digit, zero-padded CIK. Returns null if not an SEC filer. */
export async function getCikForTicker(ticker: string): Promise<string | null> {
  const map = await fetchTickerMap();
  const upper = ticker.toUpperCase();
  const entry = Object.values(map).find((e) => e.ticker === upper);
  if (!entry) return null;
  return String(entry.cik_str).padStart(10, "0");
}

type ConceptUnitEntry = {
  end: string;
  val: number;
  fy: number;
  fp: string;
  form: string;
  filed: string;
};

type ConceptResponse = {
  label: string;
  units: { USD?: ConceptUnitEntry[]; "USD/shares"?: ConceptUnitEntry[] };
};

/**
 * Fetches one XBRL "concept" (e.g. NetIncomeLoss) for a company and returns
 * its most recent full-year (10-K) value, trying a list of fallback concept
 * names since companies don't all use the same XBRL tag for the same idea
 * (e.g. revenue is tagged "Revenues" for some, "RevenueFromContract..." for
 * others).
 */
async function fetchLatestAnnualConcept(
  cik: string,
  conceptNames: string[]
): Promise<{ value: number; fiscalYear: number } | null> {
  for (const concept of conceptNames) {
    const url = `https://data.sec.gov/api/xbrl/companyconcept/CIK${cik}/us-gaap/${concept}.json`;
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT },
      next: { revalidate: 86400 },
    });
    if (!res.ok) continue; // this concept isn't tagged for this company — try the next

    const data = (await res.json()) as ConceptResponse;
    const entries = data.units.USD ?? data.units["USD/shares"] ?? [];
    const annual = entries
      .filter((e) => e.form === "10-K" && e.fp === "FY")
      .sort((a, b) => a.end.localeCompare(b.end));
    if (annual.length === 0) continue;

    const latest = annual[annual.length - 1];
    return { value: latest.val, fiscalYear: latest.fy };
  }
  return null;
}

export type Fundamentals = {
  fiscalYear: number;
  revenue: number | null;
  revenuePriorYear: number | null;
  netIncome: number | null;
  grossProfit: number | null;
  totalAssets: number | null;
  epsDiluted: number | null;
};

/**
 * Pulls a small set of headline fundamentals for a US SEC-filing company,
 * from its most recent 10-K. Returns null if the ticker isn't an SEC filer
 * (e.g. a non-US company) or has no usable data.
 */
export async function getFundamentals(ticker: string): Promise<Fundamentals | null> {
  const cik = await getCikForTicker(ticker);
  if (!cik) return null;

  const [revenue, netIncome, grossProfit, totalAssets, epsDiluted] =
    await Promise.all([
      fetchLatestAnnualConcept(cik, [
        "RevenueFromContractWithCustomerExcludingAssessedTax",
        "Revenues",
      ]),
      fetchLatestAnnualConcept(cik, ["NetIncomeLoss"]),
      fetchLatestAnnualConcept(cik, ["GrossProfit"]),
      fetchLatestAnnualConcept(cik, ["Assets"]),
      fetchLatestAnnualConcept(cik, ["EarningsPerShareDiluted"]),
    ]);

  if (!revenue && !netIncome) return null; // nothing usable came back

  // Best-effort prior-year revenue for a simple YoY growth figure.
  let revenuePriorYear: number | null = null;
  if (revenue) {
    const priorYearConcepts = [
      "RevenueFromContractWithCustomerExcludingAssessedTax",
      "Revenues",
    ];
    for (const concept of priorYearConcepts) {
      const url = `https://data.sec.gov/api/xbrl/companyconcept/CIK${cik}/us-gaap/${concept}.json`;
      const res = await fetch(url, {
        headers: { "User-Agent": USER_AGENT },
        next: { revalidate: 86400 },
      });
      if (!res.ok) continue;
      const data = (await res.json()) as ConceptResponse;
      const entries = data.units.USD ?? [];
      const annual = entries
        .filter((e) => e.form === "10-K" && e.fp === "FY")
        .sort((a, b) => a.end.localeCompare(b.end));
      if (annual.length >= 2) {
        revenuePriorYear = annual[annual.length - 2].val;
      }
      break;
    }
  }

  return {
    fiscalYear: revenue?.fiscalYear ?? netIncome?.fiscalYear ?? 0,
    revenue: revenue?.value ?? null,
    revenuePriorYear,
    netIncome: netIncome?.value ?? null,
    grossProfit: grossProfit?.value ?? null,
    totalAssets: totalAssets?.value ?? null,
    epsDiluted: epsDiluted?.value ?? null,
  };
}
