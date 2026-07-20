// Server-only beta calculation. Twelve Data's free plan doesn't include a
// pre-computed beta (that's a paid "fundamentals" field on most
// providers), but beta is just a regression of a stock's returns against
// a market benchmark's returns — and we already have daily closing prices
// for any symbol via getTimeSeriesForRange. So instead of skipping this
// or faking a number, we compute it ourselves from real price history.
//
// Benchmark: SPY (S&P 500 ETF), a standard proxy for "the market".

import { getTimeSeriesForRange } from "./marketData";

export type BetaResult = {
  beta: number;
  benchmark: string;
  tradingDaysUsed: number;
};

function dailyReturns(closes: number[]): number[] {
  const returns: number[] = [];
  for (let i = 1; i < closes.length; i++) {
    if (closes[i - 1] > 0) returns.push(closes[i] / closes[i - 1] - 1);
  }
  return returns;
}

/**
 * Computes beta = covariance(stock returns, benchmark returns) /
 * variance(benchmark returns), over the trailing 1 year of daily closes.
 * Returns null if either series is unavailable or too short to be
 * statistically meaningful.
 */
export async function getBeta(symbol: string): Promise<BetaResult | null> {
  const benchmark = "SPY";
  if (symbol.toUpperCase() === benchmark) {
    return { beta: 1, benchmark, tradingDaysUsed: 0 };
  }

  const [stockSeries, benchmarkSeries] = await Promise.allSettled([
    getTimeSeriesForRange(symbol, "1Y"),
    getTimeSeriesForRange(benchmark, "1Y"),
  ]);
  if (stockSeries.status !== "fulfilled" || benchmarkSeries.status !== "fulfilled") {
    return null;
  }

  // Align by date — the two series can have slightly different trading
  // calendars (e.g. dual-listed foreign stocks), so build a lookup by
  // datetime and only keep dates present in both.
  const stockByDate = new Map(
    stockSeries.value.values.map((v) => [v.datetime, parseFloat(v.close)])
  );
  const benchmarkByDate = new Map(
    benchmarkSeries.value.values.map((v) => [v.datetime, parseFloat(v.close)])
  );

  const sharedDates = [...stockByDate.keys()]
    .filter((d) => benchmarkByDate.has(d))
    .sort(); // ascending chronological order

  if (sharedDates.length < 30) return null; // not enough overlap to be meaningful

  const stockCloses = sharedDates.map((d) => stockByDate.get(d)!);
  const benchmarkCloses = sharedDates.map((d) => benchmarkByDate.get(d)!);

  const stockReturns = dailyReturns(stockCloses);
  const benchmarkReturns = dailyReturns(benchmarkCloses);
  const n = Math.min(stockReturns.length, benchmarkReturns.length);
  if (n < 20) return null;

  const stockMean = stockReturns.slice(0, n).reduce((a, b) => a + b, 0) / n;
  const benchmarkMean = benchmarkReturns.slice(0, n).reduce((a, b) => a + b, 0) / n;

  let covariance = 0;
  let benchmarkVariance = 0;
  for (let i = 0; i < n; i++) {
    const stockDiff = stockReturns[i] - stockMean;
    const benchmarkDiff = benchmarkReturns[i] - benchmarkMean;
    covariance += stockDiff * benchmarkDiff;
    benchmarkVariance += benchmarkDiff * benchmarkDiff;
  }
  covariance /= n - 1;
  benchmarkVariance /= n - 1;

  if (benchmarkVariance === 0) return null;

  return { beta: covariance / benchmarkVariance, benchmark, tradingDaysUsed: n };
}

export function describeBeta(result: BetaResult | null): string | null {
  if (result === null) return null;
  const label =
    result.beta < 0.7
      ? "notably less volatile than the broad market"
      : result.beta <= 1.3
        ? "roughly in line with the broad market"
        : "notably more volatile than the broad market";
  return `Beta (vs. S&P 500, trailing ~1 year) is ${result.beta.toFixed(2)}, ${label}.`;
}
