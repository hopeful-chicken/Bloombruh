// Pure functions that turn raw SEC EDGAR fundamentals plus the current
// share price into the "derived basics" and multiples a real analyst
// would compute by hand: market cap, enterprise value, working capital,
// free cash flow, the core multiples (P/E, EV/EBITDA, EV/EBIT, EV/Sales,
// P/B, FCF yield, dividend yield), returns (ROE, ROA), and growth rates
// (revenue/EBITDA/EPS). None of this comes pre-packaged from a free data
// provider — Twelve Data's free tier has no market cap or P/E field, so
// it's computed here from data we already have. No Node.js deps — safe
// for client import. Every metric returns `null` (never NaN/0/a guess)
// when an input is missing, matching the "Unavailable" convention used
// throughout this project (see fundamentalsAnalysis.ts, dealMath.ts).

import type { Fundamentals, YearValue } from "./secEdgar";

function growthPct(current: number | null, prior: number | null): number | null {
  if (current === null || prior === null || prior === 0) return null;
  return ((current - prior) / prior) * 100;
}

function historyGrowthPct(history: YearValue[]): number | null {
  if (history.length < 2) return null;
  const latest = history[history.length - 1];
  const prior = history[history.length - 2];
  return growthPct(latest.value, prior.value);
}

/**
 * EBITDA history = operating income + D&A, matched year by year (a
 * standard proxy since most companies don't tag "EBITDA" itself in XBRL).
 * Only years present in both histories are returned.
 */
export function computeEbitdaHistory(f: Fundamentals): YearValue[] {
  const daByYear = new Map(f.depreciationAmortizationHistory.map((v) => [v.fiscalYear, v.value]));
  return f.operatingIncomeHistory
    .filter((v) => daByYear.has(v.fiscalYear))
    .map((v) => ({ fiscalYear: v.fiscalYear, value: v.value + daByYear.get(v.fiscalYear)! }));
}

export type ValuationMetrics = {
  marketCap: number | null;
  enterpriseValue: number | null;
  netDebt: number | null;
  workingCapital: number | null;
  freeCashFlow: number | null;
  ebitda: number | null;
  peRatio: number | null;
  evToEbitda: number | null;
  evToEbit: number | null;
  evToSales: number | null;
  priceToBook: number | null;
  fcfYieldPct: number | null;
  dividendYieldPct: number | null;
  roePct: number | null;
  roaPct: number | null;
  revenueGrowthPct: number | null;
  ebitdaGrowthPct: number | null;
  epsGrowthPct: number | null;
};

/**
 * Computes market cap, enterprise value, the core valuation multiples,
 * ROE/ROA, and growth rates from SEC fundamentals plus the current price.
 * Market cap uses the latest point-in-time shares-outstanding count (not
 * a weighted average), matching how market cap is conventionally quoted.
 */
export function computeValuationMetrics(
  f: Fundamentals,
  price: number
): ValuationMetrics {
  const marketCap =
    f.sharesOutstanding !== null && Number.isFinite(price) && price > 0
      ? price * f.sharesOutstanding
      : null;

  const netDebt = f.totalDebt !== null && f.cash !== null ? f.totalDebt - f.cash : null;
  const enterpriseValue = marketCap !== null && netDebt !== null ? marketCap + netDebt : null;

  const workingCapital =
    f.currentAssets !== null && f.currentLiabilities !== null
      ? f.currentAssets - f.currentLiabilities
      : null;

  const freeCashFlow =
    f.operatingCashFlow !== null && f.capex !== null
      ? f.operatingCashFlow - f.capex
      : null;

  const ebitdaHistory = computeEbitdaHistory(f);
  const ebitda = ebitdaHistory.at(-1)?.value ?? null;

  const peRatio =
    f.epsDiluted !== null && f.epsDiluted > 0 && Number.isFinite(price)
      ? price / f.epsDiluted
      : null;

  const evToEbitda =
    enterpriseValue !== null && ebitda !== null && ebitda !== 0
      ? enterpriseValue / ebitda
      : null;

  const evToEbit =
    enterpriseValue !== null && f.operatingIncome !== null && f.operatingIncome !== 0
      ? enterpriseValue / f.operatingIncome
      : null;

  const evToSales =
    enterpriseValue !== null && f.revenue !== null && f.revenue !== 0
      ? enterpriseValue / f.revenue
      : null;

  const priceToBook =
    marketCap !== null && f.stockholdersEquity !== null && f.stockholdersEquity !== 0
      ? marketCap / f.stockholdersEquity
      : null;

  const fcfYieldPct =
    freeCashFlow !== null && marketCap !== null && marketCap !== 0
      ? (freeCashFlow / marketCap) * 100
      : null;

  const dividendYieldPct =
    f.dividendsPaid !== null && marketCap !== null && marketCap !== 0
      ? (Math.abs(f.dividendsPaid) / marketCap) * 100
      : null;

  const roePct =
    f.netIncome !== null && f.stockholdersEquity !== null && f.stockholdersEquity !== 0
      ? (f.netIncome / f.stockholdersEquity) * 100
      : null;

  const roaPct =
    f.netIncome !== null && f.totalAssets !== null && f.totalAssets !== 0
      ? (f.netIncome / f.totalAssets) * 100
      : null;

  return {
    marketCap,
    enterpriseValue,
    netDebt,
    workingCapital,
    freeCashFlow,
    ebitda,
    peRatio,
    evToEbitda,
    evToEbit,
    evToSales,
    priceToBook,
    fcfYieldPct,
    dividendYieldPct,
    roePct,
    roaPct,
    revenueGrowthPct: growthPct(f.revenue, f.revenuePriorYear),
    ebitdaGrowthPct: historyGrowthPct(ebitdaHistory),
    epsGrowthPct: historyGrowthPct(f.epsDilutedHistory),
  };
}
