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

import { getExchangeRate } from "./fx";

const USER_AGENT = "Bloombruh contact@example.com (student project)";

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
  // SEC tags each value with whichever currency the filer actually reports
  // in — always USD for US-GAAP/10-K filers, but for foreign-private-issuer
  // IFRS filers (20-F/40-F, e.g. Canada Goose) it's commonly their home
  // currency instead (CAD, EUR, etc.), hence a plain currency-keyed record
  // rather than a fixed "USD" field.
  units: Record<string, ConceptUnitEntry[]>;
};

export type YearValue = { fiscalYear: number; value: number };

// Foreign private issuers file 20-F (or 40-F for Canadian filers) instead
// of a 10-K, plus 6-K for interim/ad hoc disclosures — but which XBRL
// *taxonomy* they tag under (us-gaap vs. ifrs-full) is the filer's own
// accounting-standard choice, independent of which *form* carries it.
// Confirmed empirically: Alibaba (BABA) reports under US-GAAP but files
// 20-F/6-K, not 10-K — so restricting the us-gaap lookup to form=10-K-only
// (the original assumption here) silently returned zero data for it and
// every other 20-F filer using US-GAAP, not just true IFRS filers like
// Canada Goose. Both taxonomy lookups now accept the full set of forms;
// which taxonomy actually has the company's data is what determines the
// result, not which form the code expected to pair with it.
const FOREIGN_PRIVATE_ISSUER_FORMS = ["20-F", "20-F/A", "40-F", "40-F/A", "6-K", "6-K/A"];
const US_GAAP_FORMS = ["10-K", "10-K/A", ...FOREIGN_PRIVATE_ISSUER_FORMS];
const IFRS_FORMS = FOREIGN_PRIVATE_ISSUER_FORMS;

type ConceptHistoryResult = {
  history: YearValue[];
  currency: string;
  /** Which XBRL concept actually supplied the data — lets the UI caption
   * values honestly when a non-obvious tag was used (e.g. a bank's
   * "revenue" coming from RevenuesNetOfInterestExpense). Null when no
   * concept matched at all. */
  concept: string | null;
};

async function fetchAnnualConceptHistoryForTaxonomy(
  cik: string,
  conceptNames: string[],
  taxonomy: "us-gaap" | "ifrs-full",
  forms: string[]
): Promise<ConceptHistoryResult | null> {
  // Staleness guard: a company can carry data under an *old* tag it stopped
  // using years ago (T. Rowe Price still has RevenuesNetOfInterestExpense
  // entries ending in 2015, JPMorgan has InterestAndDividendIncomeOperating
  // ending in 2011). Taking the first tag that returns anything would then
  // present a decade-old figure as "latest FY". So: take the first concept
  // whose newest fiscal year is recent (within 2 years), and only fall back
  // to the freshest stale match if nothing recent exists at all.
  const currentYear = new Date().getFullYear();
  let bestStale: ConceptHistoryResult | null = null;

  for (const concept of conceptNames) {
    const url = `https://data.sec.gov/api/xbrl/companyconcept/CIK${cik}/${taxonomy}/${concept}.json`;
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT },
      next: { revalidate: 86400 },
    });
    if (!res.ok) continue; // this concept isn't tagged for this company — try the next

    const data = (await res.json()) as ConceptResponse;
    const currency = Object.keys(data.units).find(
      (k) => (data.units[k]?.length ?? 0) > 0
    );
    if (!currency) continue;
    const entries = data.units[currency] ?? [];
    const annual = entries.filter((e) => forms.includes(e.form) && e.fp === "FY");
    if (annual.length === 0) continue;

    // One value per fiscal year — if a year appears more than once (e.g. a
    // restatement in a later filing), keep whichever was filed most recently.
    const byYear = new Map<number, ConceptUnitEntry>();
    for (const e of annual) {
      const existing = byYear.get(e.fy);
      if (!existing || e.filed > existing.filed) byYear.set(e.fy, e);
    }

    const result: ConceptHistoryResult = {
      currency,
      concept,
      history: Array.from(byYear.entries())
        .sort(([a], [b]) => a - b)
        .map(([fiscalYear, e]) => ({ fiscalYear, value: e.val })),
    };

    const latestFy = result.history[result.history.length - 1]?.fiscalYear ?? 0;
    if (latestFy >= currentYear - 2) return result;
    const bestStaleFy = bestStale?.history[bestStale.history.length - 1]?.fiscalYear ?? 0;
    if (latestFy > bestStaleFy) bestStale = result;
  }
  return bestStale;
}

/**
 * Fetches one financial concept's full annual history, oldest to newest.
 * Tries US-GAAP (10-K) first — the vast majority of SEC filers — and falls
 * back to IFRS (20-F/40-F) for foreign-private-issuer filers, who use a
 * different set of XBRL tag names and often report in their home currency
 * rather than USD. Also returns which currency the values actually came in
 * (almost always "USD"), so callers can convert once, at the end.
 */
async function fetchAnnualConceptHistory(
  cik: string,
  usGaapConcepts: string[],
  ifrsConcepts: string[] = []
): Promise<ConceptHistoryResult> {
  const usGaap = await fetchAnnualConceptHistoryForTaxonomy(cik, usGaapConcepts, "us-gaap", US_GAAP_FORMS);
  if (usGaap) return usGaap;
  if (ifrsConcepts.length > 0) {
    const ifrs = await fetchAnnualConceptHistoryForTaxonomy(cik, ifrsConcepts, "ifrs-full", IFRS_FORMS);
    if (ifrs) return ifrs;
  }
  return { history: [], currency: "USD", concept: null };
}

async function fetchLatestAnnualConcept(
  cik: string,
  usGaapConcepts: string[],
  ifrsConcepts: string[] = []
): Promise<{ value: number; fiscalYear: number } | null> {
  const { history } = await fetchAnnualConceptHistory(cik, usGaapConcepts, ifrsConcepts);
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
    // The "including assessed tax" variant — some filers (e.g. Weibo) tag
    // their top line gross of assessed taxes and never use the "excluding"
    // form above, so without this their revenue (and every margin/multiple
    // built on it) would be blank. Placed after the cleaner "excluding"
    // and "Revenues" tags so a company that reports both still uses the net
    // figure; this only kicks in when those are absent.
    "RevenueFromContractWithCustomerIncludingAssessedTax",
    // Financial-sector top lines — banks and insurers don't tag revenue
    // under the generic concepts above. Each of these was verified against
    // real filers before being added (see docs/DECISIONS.md): net revenues
    // for banks/brokers (Goldman $58.3bn, JPMorgan $182.4bn FY2025), net
    // premiums earned for insurers (Progressive $81.7bn, MetLife $49.8bn),
    // and gross interest & dividend income as a last resort for smaller
    // lenders that tag nothing else (Eagle Bancorp $604m). Ordered so the
    // truest "total revenue" concept wins when several exist; the UI
    // captions the figure with which concept it came from so a bank's
    // "revenue" is never silently presented as if it were a normal
    // company's sales line.
    "RevenuesNetOfInterestExpense",
    "PremiumsEarnedNet",
    "InterestAndDividendIncomeOperating",
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
  operatingCashFlow: [
    "NetCashProvidedByUsedInOperatingActivities",
    "NetCashProvidedByUsedInOperatingActivitiesContinuingOperations",
  ],
  currentAssets: ["AssetsCurrent"],
  currentLiabilities: ["LiabilitiesCurrent"],
  sharesOutstandingBasic: ["WeightedAverageNumberOfSharesOutstandingBasic"],
  sharesOutstandingDiluted: ["WeightedAverageNumberOfDilutedSharesOutstanding"],
} as const;

// IFRS equivalents for the subset of concepts common enough to reliably
// tag under one predictable name (spot-checked against a real 20-F filer,
// Canada Goose) — not exhaustive. Line items that vary too much company to
// company to guess reliably (buybacks, dividends, debt breakdowns, capex)
// are simply left unavailable for IFRS filers, same as any other free-data
// gap on this site — good enough for a student research tool, not meant to
// cover every possible IFRS tagging convention.
const IFRS_CONCEPTS = {
  revenue: ["Revenue"],
  netIncome: ["ProfitLoss"],
  grossProfit: ["GrossProfit"],
  operatingIncome: ["ProfitLossFromOperatingActivities"],
  totalAssets: ["Assets"],
  stockholdersEquity: ["Equity"],
  cash: ["CashAndCashEquivalents"],
  currentAssets: ["CurrentAssets"],
  currentLiabilities: ["CurrentLiabilities"],
  depreciationAmortization: ["DepreciationAndAmortisationExpense"],
  epsDiluted: ["DilutedEarningsLossPerShare"],
  operatingCashFlow: ["CashFlowsFromUsedInOperatingActivities"],
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
  operatingIncomeHistory: YearValue[];
  totalAssets: number | null;
  stockholdersEquity: number | null;
  cash: number | null;
  totalDebt: number | null;
  currentAssets: number | null;
  currentLiabilities: number | null;
  depreciationAmortization: number | null;
  depreciationAmortizationHistory: YearValue[];
  capex: number | null;
  operatingCashFlow: number | null;
  dividendsPaid: number | null;
  buybacks: number | null;
  interestExpense: number | null;
  epsDiluted: number | null;
  epsDilutedHistory: YearValue[];
  sharesOutstanding: number | null;
  sharesOutstandingBasic: number | null;
  sharesOutstandingDiluted: number | null;
  /** The currency this company's filings actually report in — "USD" for
   * virtually all US-GAAP/10-K filers, but sometimes a home currency (e.g.
   * "CAD") for IFRS/20-F filers. All monetary fields above are already
   * converted to USD using fxRateToUsd; this is kept alongside so the UI
   * can show a small "converted from" note. */
  originalCurrency: string;
  /** USD per 1 unit of originalCurrency, at time of fetch. 1 when
   * originalCurrency is "USD" (i.e. nothing was converted). */
  fxRateToUsd: number;
  /** Which XBRL concept the revenue figure came from — lets the UI caption
   * financial-sector top lines honestly (a bank's "revenue" is its net
   * revenues / interest income, not a product sales line). Null when no
   * revenue was found. */
  revenueConcept: string | null;
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
    revenueResult,
    netIncomeResult,
    grossProfit,
    operatingIncomeResult,
    totalAssets,
    stockholdersEquity,
    cash,
    longTermDebt,
    currentDebt,
    currentAssets,
    currentLiabilities,
    depreciationAmortizationResult,
    capex,
    operatingCashFlow,
    dividendsPaid,
    buybacks,
    interestExpense,
    epsDilutedResult,
    sharesOutstanding,
    sharesOutstandingBasic,
    sharesOutstandingDiluted,
  ] = await Promise.all([
    fetchAnnualConceptHistory(cik, [...CONCEPTS.revenue], [...IFRS_CONCEPTS.revenue]),
    fetchAnnualConceptHistory(cik, [...CONCEPTS.netIncome], [...IFRS_CONCEPTS.netIncome]),
    fetchLatestAnnualConcept(cik, [...CONCEPTS.grossProfit], [...IFRS_CONCEPTS.grossProfit]),
    fetchAnnualConceptHistory(cik, [...CONCEPTS.operatingIncome], [...IFRS_CONCEPTS.operatingIncome]),
    fetchLatestAnnualConcept(cik, [...CONCEPTS.totalAssets], [...IFRS_CONCEPTS.totalAssets]),
    fetchLatestAnnualConcept(cik, [...CONCEPTS.stockholdersEquity], [...IFRS_CONCEPTS.stockholdersEquity]),
    fetchLatestAnnualConcept(cik, [...CONCEPTS.cash], [...IFRS_CONCEPTS.cash]),
    fetchLatestAnnualConcept(cik, [...CONCEPTS.longTermDebt]),
    fetchLatestAnnualConcept(cik, [...CONCEPTS.currentDebt]),
    fetchLatestAnnualConcept(cik, [...CONCEPTS.currentAssets], [...IFRS_CONCEPTS.currentAssets]),
    fetchLatestAnnualConcept(cik, [...CONCEPTS.currentLiabilities], [...IFRS_CONCEPTS.currentLiabilities]),
    fetchAnnualConceptHistory(cik, [...CONCEPTS.depreciationAmortization], [...IFRS_CONCEPTS.depreciationAmortization]),
    fetchLatestAnnualConcept(cik, [...CONCEPTS.capex]),
    fetchLatestAnnualConcept(cik, [...CONCEPTS.operatingCashFlow], [...IFRS_CONCEPTS.operatingCashFlow]),
    fetchLatestAnnualConcept(cik, [...CONCEPTS.dividendsPaid]),
    fetchLatestAnnualConcept(cik, [...CONCEPTS.buybacks]),
    fetchLatestAnnualConcept(cik, [...CONCEPTS.interestExpense]),
    fetchAnnualConceptHistory(cik, [...CONCEPTS.epsDiluted], [...IFRS_CONCEPTS.epsDiluted]),
    fetchLatestAnnualConcept(cik, [...CONCEPTS.sharesOutstanding]),
    fetchLatestAnnualConcept(cik, [...CONCEPTS.sharesOutstandingBasic]),
    fetchLatestAnnualConcept(cik, [...CONCEPTS.sharesOutstandingDiluted]),
  ]);

  if (revenueResult.history.length === 0 && netIncomeResult.history.length === 0) return null;

  // Figure out which currency this company's filings actually report in —
  // whichever of revenue/net income has data determines it (they always
  // agree in practice, since a filing only ever uses one reporting
  // currency). Convert every monetary figure to USD once, here, using a
  // single current FX rate — see src/lib/fx.ts for why that's good enough.
  const currency =
    revenueResult.history.length > 0
      ? revenueResult.currency
      : netIncomeResult.currency;
  const fxRateToUsd = currency === "USD" ? 1 : (await getExchangeRate(currency, "USD")) ?? 1;
  // If the FX lookup fails, fall back to a rate of 1 — showing the raw
  // non-USD number un-converted is better than hiding the data entirely.

  const convVal = (v: number | null | undefined): number | null =>
    v === null || v === undefined || fxRateToUsd === 1 ? (v ?? null) : v * fxRateToUsd;
  const convHist = (h: YearValue[]): YearValue[] =>
    fxRateToUsd === 1 ? h : h.map((y) => ({ ...y, value: y.value * fxRateToUsd }));

  const revenueHistory = convHist(revenueResult.history);
  const netIncomeHistory = convHist(netIncomeResult.history);
  const operatingIncomeHistory = convHist(operatingIncomeResult.history);
  const depreciationAmortizationHistory = convHist(depreciationAmortizationResult.history);
  const epsDilutedHistory = convHist(epsDilutedResult.history);

  const revenue = revenueHistory.at(-1)?.value ?? null;
  const revenuePriorYear = revenueHistory.at(-2)?.value ?? null;
  const netIncome = netIncomeHistory.at(-1)?.value ?? null;
  const operatingIncome = operatingIncomeHistory.at(-1)?.value ?? null;
  const depreciationAmortization = depreciationAmortizationHistory.at(-1)?.value ?? null;
  const epsDiluted = epsDilutedHistory.at(-1)?.value ?? null;

  // Total debt = long-term + current portion, whichever pieces are tagged.
  // (Not fetched for IFRS filers — see IFRS_CONCEPTS comment — so this is
  // simply unavailable for them, same as any other free-data gap.)
  const debtParts = [convVal(longTermDebt?.value), convVal(currentDebt?.value)].filter(
    (v): v is number => v !== null
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
    grossProfit: convVal(grossProfit?.value),
    operatingIncome,
    operatingIncomeHistory: operatingIncomeHistory.slice(-5),
    totalAssets: convVal(totalAssets?.value),
    stockholdersEquity: convVal(stockholdersEquity?.value),
    cash: convVal(cash?.value),
    totalDebt,
    currentAssets: convVal(currentAssets?.value),
    currentLiabilities: convVal(currentLiabilities?.value),
    depreciationAmortization,
    depreciationAmortizationHistory: depreciationAmortizationHistory.slice(-5),
    capex: convVal(capex?.value),
    operatingCashFlow: convVal(operatingCashFlow?.value),
    dividendsPaid: convVal(dividendsPaid?.value),
    buybacks: convVal(buybacks?.value),
    interestExpense: convVal(interestExpense?.value),
    epsDiluted,
    epsDilutedHistory: epsDilutedHistory.slice(-5),
    sharesOutstanding: sharesOutstanding?.value ?? null,
    sharesOutstandingBasic: sharesOutstandingBasic?.value ?? null,
    sharesOutstandingDiluted: sharesOutstandingDiluted?.value ?? null,
    originalCurrency: currency,
    fxRateToUsd,
    revenueConcept: revenueResult.concept,
  };
}
