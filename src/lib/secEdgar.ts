// Server-only wrapper around the SEC's EDGAR XBRL data API
// (https://data.sec.gov). This is the free, official source of US public
// companies' actual filed financial statements — no key, no signup, no
// rate-limit tier games. It only covers companies that file with the SEC
// (US-listed), which is why the Pitch Builder shows fundamentals for US
// tickers and gracefully skips them for others.
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
  units: { USD?: ConceptUnitEntry[]; "USD/shares"?: ConceptUnitEntry[]; shares?: ConceptUnitEntry[] };
};

export type YearValue = { fiscalYear: number; value: number };

/**
 * Fetches one XBRL "concept" (e.g. NetIncomeLoss) for a company and returns
 * its full annual (10-K, full-year) history, oldest to newest, one value
 * per fiscal year (de-duplicated by keeping the most recently *filed*
 * value for each year, in case of restatements). Tries a list of fallback
 * concept names since companies don't all use the same XBRL tag for the
 * same idea (e.g. revenue is tagged "Revenues" for some,
 * "RevenueFromContract..." for others).
 */
async function fetchAnnualConceptHistory(
  cik: string,
  conceptNames: string[]
): Promise<YearValue[]> {
  for (const concept of conceptNames) {
    const url = `https://data.sec.gov/api/xbrl/companyconcept/CIK${cik}/us-gaap/${concept}.json`;
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT },
      next: { revalidate: 86400 },
    });
    if (!res.ok) continue; // this concept isn't tagged for this company — try the next

    const data = (await res.json()) as ConceptResponse;
    const entries =
      data.units.USD ?? data.units["USD/shares"] ?? data.units.shares ?? [];
    const annual = entries.filter((e) => e.form === "10-K" && e.fp === "FY");
    if (annual.length === 0) continue;

    // One value per fiscal year — if a year appears more than once (e.g. a
    // restatement in a later filing), keep whichever was filed most recently.
    const byYear = new Map<number, ConceptUnitEntry>();
    for (const e of annual) {
      const existing = byYear.get(e.fy);
      if (!existing || e.filed > existing.filed) byYear.set(e.fy, e);
    }

    return Array.from(byYear.entries())
      .sort(([a], [b]) => a - b)
      .map(([fiscalYear, e]) => ({ fiscalYear, value: e.val }));
  }
  return [];
}

async function fetchLatestAnnualConcept(
  cik: string,
  conceptNames: string[]
): Promise<{ value: number; fiscalYear: number } | null> {
  const history = await fetchAnnualConceptHistory(cik, conceptNames);
  if (history.length === 0) return null;
  const latest = history[history.length - 1];
  return { value: latest.value, fiscalYear: latest.fiscalYear };
}

// Concept name fallback lists — companies tag the same line item under
// different XBRL concepts depending on their accounting/filing conventions.
const CONCEPTS = {
  revenue: [
    "RevenueFromContractWithCustomerExcludingAssessedTax",
    "Revenues",
  ],
  netIncome: ["NetIncomeLoss"],
  grossProfit: ["GrossProfit"],
  operatingIncome: ["OperatingIncomeLoss"],
  totalAssets: ["Assets"],
  stockholdersEquity: ["StockholdersEquity", "StockholdersEquityIncludingPortionAttributableToNoncontrollingInterest"],
  cash: [
    "CashAndCashEquivalentsAtCarryingValue",
    "CashCashEquivalentsRestrictedCashAndRestrictedCashEquivalents",
  ],
  longTermDebt: ["LongTermDebtNoncurrent", "LongTermDebt"],
  currentDebt: ["LongTermDebtCurrent", "ShortTermBorrowings"],
  depreciationAmortization: [
    "DepreciationDepletionAndAmortization",
    "DepreciationAmortizationAndAccretionNet",
  ],
  capex: ["PaymentsToAcquirePropertyPlantAndEquipment"],
  dividendsPaid: ["PaymentsOfDividends", "PaymentsOfDividendsCommonStock"],
  buybacks: ["PaymentsForRepurchaseOfCommonStock"],
  interestExpense: ["InterestExpense", "InterestExpenseDebt"],
  epsDiluted: ["EarningsPerShareDiluted"],
  sharesOutstanding: ["CommonStockSharesOutstanding"],
} as const;

export type Fundamentals = {
  fiscalYear: number;
  revenue: number | null;
  revenuePriorYear: number | null;
  revenueHistory: YearValue[];
  netIncome: number | null;
  netIncomeHistory: YearValue[];
  grossProfit: number | null;
  operatingIncome: number | null;
  totalAssets: number | null;
  stockholdersEquity: number | null;
  cash: number | null;
  totalDebt: number | null;
  depreciationAmortization: number | null;
  capex: number | null;
  dividendsPaid: number | null;
  buybacks: number | null;
  interestExpense: number | null;
  epsDiluted: number | null;
  sharesOutstanding: number | null;
};

/**
 * Pulls headline fundamentals — including up to ~5 years of revenue/net
 * income history and the extra line items needed for credit metrics, ROIC,
 * and capital-allocation analysis — for a US SEC-filing company, from its
 * 10-Ks. Returns null if the ticker isn't an SEC filer (e.g. a non-US
 * company) or has no usable data.
 */
export async function getFundamentals(ticker: string): Promise<Fundamentals | null> {
  const cik = await getCikForTicker(ticker);
  if (!cik) return null;

  const [
    revenueHistory,
    netIncomeHistory,
    grossProfit,
    operatingIncome,
    totalAssets,
    stockholdersEquity,
    cash,
    longTermDebt,
    currentDebt,
    depreciationAmortization,
    capex,
    dividendsPaid,
    buybacks,
    interestExpense,
    epsDiluted,
    sharesOutstanding,
  ] = await Promise.all([
    fetchAnnualConceptHistory(cik, [...CONCEPTS.revenue]),
    fetchAnnualConceptHistory(cik, [...CONCEPTS.netIncome]),
    fetchLatestAnnualConcept(cik, [...CONCEPTS.grossProfit]),
    fetchLatestAnnualConcept(cik, [...CONCEPTS.operatingIncome]),
    fetchLatestAnnualConcept(cik, [...CONCEPTS.totalAssets]),
    fetchLatestAnnualConcept(cik, [...CONCEPTS.stockholdersEquity]),
    fetchLatestAnnualConcept(cik, [...CONCEPTS.cash]),
    fetchLatestAnnualConcept(cik, [...CONCEPTS.longTermDebt]),
    fetchLatestAnnualConcept(cik, [...CONCEPTS.currentDebt]),
    fetchLatestAnnualConcept(cik, [...CONCEPTS.depreciationAmortization]),
    fetchLatestAnnualConcept(cik, [...CONCEPTS.capex]),
    fetchLatestAnnualConcept(cik, [...CONCEPTS.dividendsPaid]),
    fetchLatestAnnualConcept(cik, [...CONCEPTS.buybacks]),
    fetchLatestAnnualConcept(cik, [...CONCEPTS.interestExpense]),
    fetchLatestAnnualConcept(cik, [...CONCEPTS.epsDiluted]),
    fetchLatestAnnualConcept(cik, [...CONCEPTS.sharesOutstanding]),
  ]);

  if (revenueHistory.length === 0 && netIncomeHistory.length === 0) return null;

  const revenue = revenueHistory.at(-1)?.value ?? null;
  const revenuePriorYear = revenueHistory.at(-2)?.value ?? null;
  const netIncome = netIncomeHistory.at(-1)?.value ?? null;

  // Total debt = long-term + current portion, whichever pieces are tagged.
  const debtParts = [longTermDebt?.value, currentDebt?.value].filter(
    (v): v is number => v !== undefined && v !== null
  );
  const totalDebt = debtParts.length > 0 ? debtParts.reduce((a, b) => a + b, 0) : null;

  return {
    fiscalYear:
      revenueHistory.at(-1)?.fiscalYear ?? netIncomeHistory.at(-1)?.fiscalYear ?? 0,
    revenue,
    revenuePriorYear,
    revenueHistory: revenueHistory.slice(-5),
    netIncome,
    netIncomeHistory: netIncomeHistory.slice(-5),
    grossProfit: grossProfit?.value ?? null,
    operatingIncome: operatingIncome?.value ?? null,
    totalAssets: totalAssets?.value ?? null,
    stockholdersEquity: stockholdersEquity?.value ?? null,
    cash: cash?.value ?? null,
    totalDebt,
    depreciationAmortization: depreciationAmortization?.value ?? null,
    capex: capex?.value ?? null,
    dividendsPaid: dividendsPaid?.value ?? null,
    buybacks: buybacks?.value ?? null,
    interestExpense: interestExpense?.value ?? null,
    epsDiluted: epsDiluted?.value ?? null,
    sharesOutstanding: sharesOutstanding?.value ?? null,
  };
}
