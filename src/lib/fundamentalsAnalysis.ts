// Pure functions that turn the raw SEC EDGAR fundamentals (see
// src/lib/secEdgar.ts) into credit, returns, and capital-allocation
// analysis — the kind of things an equity research associate would
// compute by hand from the 10-K, rather than pull pre-made from a
// paid data terminal. No Node.js deps — safe for client import.
//
// Every function returns `null` for a metric it can't compute (rather
// than guessing or defaulting to 0), so the UI can show "Unavailable"
// instead of a misleading number. See docs/DECISIONS.md for why that
// matters for this project.

import type { Fundamentals } from "./secEdgar";

export type CreditMetrics = {
  /** Operating income + D&A — a standard proxy for EBITDA when a company
   * doesn't explicitly tag "EBITDA" in its XBRL filing (most don't). */
  ebitda: number | null;
  netDebt: number | null;
  netDebtToEbitda: number | null;
  interestCoverage: number | null;
};

export function computeCreditMetrics(f: Fundamentals): CreditMetrics {
  const ebitda =
    f.operatingIncome !== null && f.depreciationAmortization !== null
      ? f.operatingIncome + f.depreciationAmortization
      : null;

  const netDebt =
    f.totalDebt !== null && f.cash !== null ? f.totalDebt - f.cash : null;

  const netDebtToEbitda =
    netDebt !== null && ebitda !== null && ebitda !== 0
      ? netDebt / ebitda
      : null;

  const interestCoverage =
    ebitda !== null && f.interestExpense !== null && f.interestExpense !== 0
      ? ebitda / f.interestExpense
      : null;

  return { ebitda, netDebt, netDebtToEbitda, interestCoverage };
}

export function describeCreditMetrics(m: CreditMetrics): string | null {
  if (m.netDebtToEbitda === null) return null;
  const leverageLabel =
    m.netDebtToEbitda < 1
      ? "very lightly levered"
      : m.netDebtToEbitda < 3
        ? "moderately levered"
        : m.netDebtToEbitda < 5
          ? "fairly leveraged"
          : "highly leveraged";
  const coverageNote =
    m.interestCoverage !== null
      ? ` Interest coverage (EBITDA / interest expense) is ${m.interestCoverage.toFixed(1)}x.`
      : "";
  return `Net debt / EBITDA is ${m.netDebtToEbitda.toFixed(1)}x, which is ${leverageLabel} for a typical company.${coverageNote}`;
}

/**
 * Return on invested capital, using a standard textbook approximation:
 * NOPAT (operating income after an assumed tax rate) divided by invested
 * capital (total debt + equity - cash). The 21% default is the current
 * US federal statutory corporate tax rate — a simplification since actual
 * effective tax rates aren't in this data set, so this is a reasonable
 * approximation rather than the company's true effective rate.
 */
export function computeROIC(
  f: Fundamentals,
  assumedTaxRate = 0.21
): number | null {
  if (f.operatingIncome === null) return null;
  const investedCapitalParts = [f.totalDebt, f.stockholdersEquity, f.cash];
  if (investedCapitalParts.some((v) => v === null)) return null;

  const investedCapital = f.totalDebt! + f.stockholdersEquity! - f.cash!;
  if (investedCapital <= 0) return null;

  const nopat = f.operatingIncome * (1 - assumedTaxRate);
  return (nopat / investedCapital) * 100; // as a percentage
}

export function describeROIC(roicPct: number | null): string | null {
  if (roicPct === null || !Number.isFinite(roicPct)) return null;
  const label =
    roicPct >= 15
      ? "strong — well above a typical cost of capital"
      : roicPct >= 8
        ? "solid — likely above a typical cost of capital"
        : roicPct >= 0
          ? "modest — may be near or below a typical cost of capital"
          : "negative — the business is not covering its cost of capital";
  return `Estimated ROIC (assuming a 21% tax rate) is about ${roicPct.toFixed(1)}%, which is ${label}. This is an approximation — it doesn't know the company's true effective tax rate.`;
}

export type CapitalAllocation = {
  dividendsPaid: number | null;
  buybacks: number | null;
  totalReturnedToShareholders: number | null;
};

export function computeCapitalAllocation(f: Fundamentals): CapitalAllocation {
  const parts = [f.dividendsPaid, f.buybacks].filter(
    (v): v is number => v !== null
  );
  return {
    dividendsPaid: f.dividendsPaid,
    buybacks: f.buybacks,
    totalReturnedToShareholders: parts.length > 0 ? parts.reduce((a, b) => a + b, 0) : null,
  };
}

export function describeCapitalAllocation(c: CapitalAllocation): string | null {
  if (c.dividendsPaid === null && c.buybacks === null) return null;
  const hasDividends = c.dividendsPaid !== null && c.dividendsPaid > 0;
  const hasBuybacks = c.buybacks !== null && c.buybacks > 0;
  if (hasDividends && hasBuybacks) {
    return "Returns cash to shareholders through both dividends and share buybacks — a mature capital-return profile.";
  }
  if (hasDividends) {
    return "Returns cash to shareholders through dividends, with no meaningful buyback activity in the latest year.";
  }
  if (hasBuybacks) {
    return "Returns cash to shareholders through share buybacks rather than dividends.";
  }
  return "No meaningful dividends or buybacks in the latest year — cash is likely being reinvested or retained.";
}
