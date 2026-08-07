// Server-only: gathers the real company data a template gets prefilled
// with, using the exact same routing rules as the Company Profile page —
// Twelve Data quotes (EODHD for ".HK" symbols), SEC EDGAR fundamentals
// (bridged through the US listing for mapped HK companies), the real beta
// regression, and the HK-ordinary-share USD price for anything per-share.
// Everything is nullable: a missing figure stays missing, and the workbook
// shows a clearly-marked blank assumption cell instead of an invented
// number. Every value carries a source line for the workbook's
// "Data & sources" sheet, in keeping with this project's standing
// "show where every number came from" rule.

import { getQuote } from "@/lib/marketData";
import { isHongKongSymbol, getHkQuote, getHkClose } from "@/lib/eodhd";
import { getAdrForHkSymbol, getHkSymbolForAdr } from "@/lib/hkAdrMap";
import { getExchangeRate } from "@/lib/fx";
import { getFundamentals, type Fundamentals, type YearValue } from "@/lib/secEdgar";
import { getBeta } from "@/lib/beta";
import { computeCreditMetrics } from "@/lib/fundamentalsAnalysis";
import { computeValuationMetrics, type ValuationMetrics } from "@/lib/valuationAnalysis";

export type SourceLine = { item: string; source: string };

export type CompanyPrefill = {
  ticker: string;
  companyName: string;
  currency: string;
  /** Quote price in the quote's own currency (HKD for .HK symbols). */
  quotePrice: number | null;
  /** USD per ordinary share — safe input for per-share valuation math
   * (converted from HKD for HK symbols; the HK listing's price for mapped
   * ADRs, since ADS bundle prices distort per-share figures). Null when it
   * can't be established honestly. */
  usdSharePrice: number | null;
  fundamentals: Fundamentals | null;
  ebitda: number | null;
  valuation: ValuationMetrics | null;
  beta: number | null;
  sources: SourceLine[];
};

/** Empty prefill for a template downloaded without a ticker — pure
 * structure, formulas, and guidance. */
export function blankPrefill(): CompanyPrefill {
  return {
    ticker: "",
    companyName: "",
    currency: "USD",
    quotePrice: null,
    usdSharePrice: null,
    fundamentals: null,
    ebitda: null,
    valuation: null,
    beta: null,
    sources: [
      {
        item: "No company selected",
        source:
          "This template was downloaded blank. Every input is yours to fill in. Re-download with a ticker chosen to prefill real data.",
      },
    ],
  };
}

export async function getCompanyPrefill(rawTicker: string): Promise<CompanyPrefill> {
  const ticker = rawTicker.trim().toUpperCase();
  const isHk = isHongKongSymbol(ticker);
  const adrForHk = isHk ? getAdrForHkSymbol(ticker) : null;
  const hkListingForAdr = !isHk ? getHkSymbolForAdr(ticker) : null;
  const sources: SourceLine[] = [];
  const today = new Date().toISOString().slice(0, 10);

  const [quoteResult, fundamentalsResult, betaResult] = await Promise.allSettled([
    isHk ? getHkQuote(ticker) : getQuote(ticker),
    isHk
      ? adrForHk
        ? getFundamentals(adrForHk)
        : Promise.resolve(null)
      : getFundamentals(ticker),
    isHk ? Promise.resolve(null) : getBeta(ticker).catch(() => null),
  ]);

  const quote = quoteResult.status === "fulfilled" ? quoteResult.value : null;
  const fundamentals =
    fundamentalsResult.status === "fulfilled" ? fundamentalsResult.value : null;
  const beta = betaResult.status === "fulfilled" ? betaResult.value : null;

  const quotePrice = quote ? parseFloat(quote.close) : null;

  // USD per ordinary share — same rules as the profile page.
  let usdSharePrice: number | null = quotePrice;
  if (quote && (isHk || hkListingForAdr)) {
    const [hkClose, hkdToUsd] = await Promise.all([
      isHk ? Promise.resolve(quotePrice) : getHkClose(hkListingForAdr!),
      getExchangeRate("HKD", "USD"),
    ]);
    usdSharePrice = hkClose !== null && hkdToUsd !== null ? hkClose * hkdToUsd : null;
  }

  if (quote) {
    sources.push({
      item: `Share price (${quote.currency} ${quotePrice?.toFixed(2) ?? "—"}, as of ${today})`,
      source: isHk
        ? "EODHD (eodhd.com): Hong Kong Stock Exchange, may be delayed"
        : "Twelve Data (twelvedata.com), may be delayed",
    });
    if (isHk || hkListingForAdr) {
      sources.push({
        item: "USD per-share price used in valuation cells",
        source:
          "HK ordinary-share price converted at the current HKD→USD rate (Frankfurter/ECB); ADR prices are per ADS bundle and would distort per-share math",
      });
    }
  }

  if (fundamentals) {
    sources.push({
      item: `Fundamentals (FY${fundamentals.fiscalYear}: revenue, margins, balance sheet, cash flow)`,
      source:
        isHk && adrForHk
          ? `SEC EDGAR (data.sec.gov): the same company's filings via its US listing ${adrForHk}`
          : "SEC EDGAR (data.sec.gov): the company's own filed annual reports",
    });
    if (fundamentals.originalCurrency !== "USD") {
      sources.push({
        item: `Currency conversion (${fundamentals.originalCurrency} → USD)`,
        source: `All monetary fundamentals converted at one current rate (${fundamentals.fxRateToUsd.toFixed(4)}), Frankfurter/ECB; not per-fiscal-year historical rates`,
      });
    }
  } else {
    sources.push({
      item: "Fundamentals",
      source:
        "None found. This company does not file with the SEC (or has no SEC-filing US listing), so those inputs are left blank for you to research and enter. Nothing was estimated.",
    });
  }

  if (beta) {
    sources.push({
      item: `Beta (${beta.beta.toFixed(2)})`,
      source:
        "Computed by Bloombruh: regression of 1 year of daily returns vs. SPY (Twelve Data prices), not a looked-up figure",
    });
  }

  const ebitda = fundamentals ? computeCreditMetrics(fundamentals).ebitda : null;
  const valuation =
    fundamentals && usdSharePrice !== null
      ? computeValuationMetrics(fundamentals, usdSharePrice)
      : null;

  return {
    ticker,
    companyName: quote?.name ?? ticker,
    currency: quote?.currency ?? "USD",
    quotePrice,
    usdSharePrice,
    fundamentals,
    ebitda,
    valuation,
    beta: beta?.beta ?? null,
    sources,
  };
}

/** Latest N fiscal years of a history array, oldest first — convenience
 * for laying historical columns into a sheet. */
export function lastYears(history: YearValue[], n: number): YearValue[] {
  return history.slice(-n);
}

/** Compound annual growth rate across a history, as a decimal (0.08 =
 * 8%/yr), or null when there isn't enough real data to compute one. */
export function historyCagr(history: YearValue[]): number | null {
  if (history.length < 2) return null;
  const first = history[0];
  const last = history[history.length - 1];
  const years = last.fiscalYear - first.fiscalYear;
  if (years <= 0 || first.value <= 0 || last.value <= 0) return null;
  return Math.pow(last.value / first.value, 1 / years) - 1;
}
