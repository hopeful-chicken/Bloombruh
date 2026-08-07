// Pure functions that turn raw price data into short, factual,
// plain-English context — the "analytical layer" the module needs so it's
// more than a re-display of Twelve Data's own numbers. No opinions on
// whether to buy/sell anything; just objective, computed comparisons.
// No Node.js deps — safe for client import.
//
// Note: Twelve Data's free plan doesn't include company fundamentals
// (P/E, market cap, margins, etc. — see docs/DATA_SOURCES.md), so this
// layer is built entirely from price history (open/high/low/close over
// time), computed here rather than fetched pre-made from any provider.

export function describePriceVs52WeekRange(
  price: number,
  low: number,
  high: number
): string | null {
  if (!Number.isFinite(price) || !Number.isFinite(low) || !Number.isFinite(high)) {
    return null;
  }
  if (high <= low) return null;

  const positionPct = ((price - low) / (high - low)) * 100;
  const pctBelowHigh = ((high - price) / high) * 100;
  const pctAboveLow = ((price - low) / low) * 100;

  if (positionPct >= 95) {
    return "Trading at or near its 52-week high.";
  }
  if (positionPct <= 5) {
    return "Trading at or near its 52-week low.";
  }
  if (positionPct >= 50) {
    return `Trading ${pctBelowHigh.toFixed(1)}% below its 52-week high, and closer to the top of its 52-week range.`;
  }
  return `Trading ${pctAboveLow.toFixed(1)}% above its 52-week low, and closer to the bottom of its 52-week range.`;
}

/** Simple moving average of the last `window` closing prices. */
export function computeMovingAverage(
  closes: number[],
  window: number
): number | null {
  if (closes.length < window) return null;
  const slice = closes.slice(-window);
  return slice.reduce((sum, v) => sum + v, 0) / window;
}

export function describeMomentum(
  price: number,
  movingAverage: number | null,
  windowLabel: string
): string | null {
  if (!movingAverage || !Number.isFinite(movingAverage)) return null;
  const diffPct = ((price - movingAverage) / movingAverage) * 100;
  if (Math.abs(diffPct) < 1) {
    return `Trading close to its ${windowLabel} average price, no strong short-term trend either way.`;
  }
  const direction = diffPct > 0 ? "above" : "below";
  const trend = diffPct > 0 ? "upward" : "downward";
  return `Trading ${Math.abs(diffPct).toFixed(1)}% ${direction} its ${windowLabel} average price, consistent with recent ${trend} momentum.`;
}

/** Annualized volatility (%) from daily closing prices, using log returns. */
export function computeAnnualizedVolatility(closes: number[]): number | null {
  if (closes.length < 2) return null;
  const returns: number[] = [];
  for (let i = 1; i < closes.length; i++) {
    if (closes[i - 1] > 0 && closes[i] > 0) {
      returns.push(Math.log(closes[i] / closes[i - 1]));
    }
  }
  if (returns.length < 2) return null;
  const mean = returns.reduce((sum, v) => sum + v, 0) / returns.length;
  const variance =
    returns.reduce((sum, v) => sum + (v - mean) ** 2, 0) / (returns.length - 1);
  const dailyStdDev = Math.sqrt(variance);
  return dailyStdDev * Math.sqrt(252) * 100; // annualized, as a percentage
}

export function describeVolatility(annualizedVolPct: number | null): string | null {
  if (!annualizedVolPct || !Number.isFinite(annualizedVolPct)) return null;
  const label =
    annualizedVolPct < 20
      ? "relatively calm"
      : annualizedVolPct < 40
        ? "moderately volatile"
        : "highly volatile";
  return `Annualized price volatility over this period is about ${annualizedVolPct.toFixed(0)}%, which is ${label} next to a typical broad-market stock (commonly ~15-25%).`;
}
