// Server-only computation layer for the Hype vs Fundamentals module.
// Everything here is arithmetic over real fetched data (Twelve Data price
// history, SEC EDGAR fundamentals) — nothing is hardcoded or invented. A
// case's registry entry (hypeCases.ts) only records which tickers and
// which date window define its era; the actual peak price, run-up %,
// drawdown %, and fundamentals context are all computed fresh here every
// time, from real series, so they can never drift from reality the way a
// hand-typed "peaked at $X" figure could.

import { getTimeSeriesForRange, getQuote } from "./marketData";
import { getFundamentals, type Fundamentals } from "./secEdgar";
import { computeValuationMetrics, type ValuationMetrics } from "./valuationAnalysis";
import type { HypeCase } from "./hypeCases";
import type { HypeTheme } from "./hypeThemes";

export type PricePoint = { date: string; close: number };

export type CaseTickerAnalysis = {
  symbol: string;
  role: string;
  /** Full available history from the case's window start to today,
   * indexed to 100 at the first point on/after windowStart — lets
   * tickers with very different price scales (e.g. GME ~$480 vs AMC
   * ~$20) be compared on one chart honestly. */
  indexedSeries: PricePoint[];
  /** Real price series, unindexed, same date range — kept for computing
   * real dollar figures (the indexed series is display-only). */
  rawSeries: PricePoint[];
  windowPeakPrice: number | null;
  windowPeakDate: string | null;
  /** % gain from the window's first price to the window's peak price —
   * the real "how far did it run up" figure. */
  runUpPercent: number | null;
  /** % change from the window peak to the latest available price — real
   * "where does it stand today relative to that era's high" figure.
   * Negative means still below the historical peak. */
  vsPeakTodayPercent: number | null;
  latestPrice: number | null;
  latestDate: string | null;
  fundamentals: Fundamentals | null;
};

export type CaseAnalysis = {
  tickers: CaseTickerAnalysis[];
};

/** Fetches ~33 years of monthly closes (comfortably covers any of this
 * module's tickers' full history — confirmed empirically against SPY's
 * 1993 inception before this module was built) and derives every stat for
 * one ticker within a case's window. Never throws: a fetch failure just
 * means that ticker's analysis comes back all-null, handled the same
 * "Unavailable, not fabricated" way as everywhere else on this site. */
async function analyzeCaseTicker(
  symbol: string,
  role: string,
  windowStart: string,
  windowEnd: string
): Promise<CaseTickerAnalysis> {
  const empty: CaseTickerAnalysis = {
    symbol,
    role,
    indexedSeries: [],
    rawSeries: [],
    windowPeakPrice: null,
    windowPeakDate: null,
    runUpPercent: null,
    vsPeakTodayPercent: null,
    latestPrice: null,
    latestDate: null,
    fundamentals: null,
  };

  // getTimeSeries() always fetches *daily* bars regardless of outputsize —
  // outputsize=400 days only reaches back ~1.6 years, nowhere near a
  // historical case's window. getTimeSeriesForRange(symbol, "MAX") is the
  // one that actually fetches deep (monthly-bar) history — the same
  // function this project built for the Markets Overview "Forever" range
  // (confirmed there against SPY's real 1993 inception). Bug found and
  // fixed 2026-07-23 via live verification: every case ticker's computed
  // "era peak" was landing in 2024-2026 instead of its real historical era.
  const [seriesResult, fundamentalsResult] = await Promise.allSettled([
    getTimeSeriesForRange(symbol, "MAX"),
    getFundamentals(symbol),
  ]);

  if (seriesResult.status !== "fulfilled") return empty;

  const chronological = [...seriesResult.value.values].reverse();
  const fromWindowStart = chronological
    .map((v) => ({ date: v.datetime.slice(0, 10), close: parseFloat(v.close) }))
    .filter((p) => p.date >= windowStart && Number.isFinite(p.close));

  if (fromWindowStart.length === 0) return empty;

  const base = fromWindowStart[0].close;
  const indexedSeries = fromWindowStart.map((p) => ({
    date: p.date,
    close: base !== 0 ? (p.close / base) * 100 : 100,
  }));

  // The peak that defines "how far did this run up" must be bounded to the
  // case's actual era (windowStart..windowEnd), not searched across the
  // whole windowStart-to-today series used for the chart — otherwise an
  // unrelated later high (e.g. a stock's 2025 price, decades after a
  // 1999-2000 bubble) gets misattributed as "the" peak. Bug found and
  // fixed 2026-07-23 via live verification: CSCO's computed "era peak" was
  // showing a 2026 date before this fix.
  const withinWindow = fromWindowStart.filter((p) => p.date <= windowEnd);
  const peak =
    withinWindow.length > 0
      ? withinWindow.reduce((a, b) => (b.close > a.close ? b : a))
      : fromWindowStart.reduce((a, b) => (b.close > a.close ? b : a));
  const latest = fromWindowStart[fromWindowStart.length - 1];
  const runUpPercent = base !== 0 ? (peak.close / base - 1) * 100 : null;
  const vsPeakTodayPercent = peak.close !== 0 ? (latest.close / peak.close - 1) * 100 : null;

  const fundamentals = fundamentalsResult.status === "fulfilled" ? fundamentalsResult.value : null;

  return {
    symbol,
    role,
    indexedSeries,
    rawSeries: fromWindowStart,
    windowPeakPrice: peak.close,
    windowPeakDate: peak.date,
    runUpPercent,
    vsPeakTodayPercent,
    latestPrice: latest.close,
    latestDate: latest.date,
    fundamentals,
  };
}

// Tickers are fetched one at a time, not via Promise.all, deliberately.
// Each one's getFundamentals() call already fans out to ~21 concurrent SEC
// EDGAR requests; running several tickers' fundamentals fetches at once on
// top of that bursts well past SEC's fair-use rate limit and some concepts
// come back 429'd — which getFundamentals treats the same as "no data",
// silently showing real fundamentals as "Unavailable". Found and fixed
// 2026-07-23 via live verification (NVDA's real revenue growth intermittently
// vanished depending on how many other tickers' fundamentals were being
// fetched in the same request).
export async function analyzeHypeCase(hypeCase: HypeCase): Promise<CaseAnalysis> {
  const tickers: CaseTickerAnalysis[] = [];
  for (const t of hypeCase.tickers) {
    tickers.push(await analyzeCaseTicker(t.symbol, t.role, hypeCase.windowStart, hypeCase.windowEnd));
  }
  return { tickers };
}

// --- Current themes ---------------------------------------------------

export type ThemeTickerSnapshot = {
  symbol: string;
  role: string;
  price: number | null;
  revenueGrowthPct: number | null;
  fiscalYear: number | null;
  valuation: ValuationMetrics | null;
};

export type ThemeAnalysis = {
  tickers: ThemeTickerSnapshot[];
};

async function snapshotThemeTicker(symbol: string, role: string): Promise<ThemeTickerSnapshot> {
  const empty: ThemeTickerSnapshot = {
    symbol,
    role,
    price: null,
    revenueGrowthPct: null,
    fiscalYear: null,
    valuation: null,
  };

  const [quoteResult, fundamentalsResult] = await Promise.allSettled([
    getQuote(symbol),
    getFundamentals(symbol),
  ]);

  if (quoteResult.status !== "fulfilled") return empty;
  const price = parseFloat(quoteResult.value.close);
  const fundamentals = fundamentalsResult.status === "fulfilled" ? fundamentalsResult.value : null;

  const revenueGrowthPct =
    fundamentals?.revenue != null && fundamentals?.revenuePriorYear
      ? ((fundamentals.revenue - fundamentals.revenuePriorYear) / fundamentals.revenuePriorYear) * 100
      : null;

  const valuation =
    fundamentals && Number.isFinite(price) ? computeValuationMetrics(fundamentals, price) : null;

  return {
    symbol,
    role,
    price: Number.isFinite(price) ? price : null,
    revenueGrowthPct,
    fiscalYear: fundamentals?.fiscalYear ?? null,
    valuation,
  };
}

/** Real current price + real latest-fiscal-year revenue growth + real
 * valuation multiples for each ticker in a current theme. Revenue growth
 * is on a different time base than the module's own week/month/year price
 * period (fundamentals are inherently annual) — the UI is explicit about
 * that rather than implying a false apples-to-apples comparison. */
export async function analyzeHypeTheme(theme: HypeTheme): Promise<ThemeAnalysis> {
  // Sequential for the same SEC EDGAR rate-limit reason as analyzeHypeCase above.
  const tickers: ThemeTickerSnapshot[] = [];
  for (const t of theme.tickers) {
    tickers.push(await snapshotThemeTicker(t.symbol, t.role));
  }
  return { tickers };
}
