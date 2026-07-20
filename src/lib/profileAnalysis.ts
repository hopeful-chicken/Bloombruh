// Pure functions that turn raw quote/statistics numbers into short,
// factual, plain-English context — the "analytical layer" the module needs
// so it's more than a data dump. No opinions on whether to buy/sell
// anything; just objective comparisons (vs. 52-week range, vs. a rough
// market-average P/E benchmark). No Node.js deps — safe for client import.

// Very rough, commonly-cited long-run average trailing P/E for the broader
// US market (S&P 500). This is a loose rule-of-thumb for context, not a
// precise or current benchmark — labelled as such wherever it's shown.
export const MARKET_AVERAGE_PE = 20;

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

export function describePE(trailingPE: number | undefined): string | null {
  if (!trailingPE || !Number.isFinite(trailingPE) || trailingPE <= 0) {
    return null;
  }
  const diffPct = ((trailingPE - MARKET_AVERAGE_PE) / MARKET_AVERAGE_PE) * 100;
  if (Math.abs(diffPct) < 10) {
    return `A trailing P/E of ${trailingPE.toFixed(1)} is roughly in line with the broader market's long-run average (~${MARKET_AVERAGE_PE}).`;
  }
  const direction = diffPct > 0 ? "above" : "below";
  return `A trailing P/E of ${trailingPE.toFixed(1)} is ${Math.abs(diffPct).toFixed(0)}% ${direction} the broader market's long-run average (~${MARKET_AVERAGE_PE}) — one signal among many, not a verdict on its own.`;
}

export function describeMargin(
  label: string,
  marginFraction: number | undefined
): string | null {
  if (marginFraction === undefined || !Number.isFinite(marginFraction)) {
    return null;
  }
  const pct = marginFraction * 100;
  return `${label}: ${pct.toFixed(1)}%.`;
}
