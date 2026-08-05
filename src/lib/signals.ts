// Computes the two 0-100 composite scores shown on Company Profile's
// Snapshot panel — "Technical strength" and "Fundamental quality" — plus
// the short, neutral-language chips shown alongside them (Trend, Momentum,
// 52-week position, Profitability, Leverage, Volatility, Valuation).
//
// Deliberately NOT a buy/sell signal, and not exposed as one anywhere:
// every chip is a factual bucket ("Above 200DMA", "High ROE") rather than
// a recommendation — see DISCLOSURE in lib/config.ts. The composite scores
// are simple, clearly-documented heuristics (linear clamps against
// commonly-cited reference ranges), not a rigorous quant model — good
// enough for an at-a-glance educational snapshot, not investment advice.
//
// Each sub-score only counts toward the average when its real input is
// actually available; an unavailable input is left out entirely rather
// than defaulting to a guessed midpoint, so the composite never quietly
// incorporates fabricated data. If nothing is available, the score is
// `null` and the UI shows "Unavailable" rather than a fake number.

export type Chip = { label: string; value: string };
export type ScoreResult = { score: number | null; drivers: string[] };

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/** Wilder's RSI (14-period), the standard momentum oscillator — 0-100
 * natively, so it's used directly as a technical sub-score with no
 * rescaling. */
export function computeRSI(closes: number[], period = 14): number | null {
  if (closes.length < period + 1) return null;
  let gains = 0;
  let losses = 0;
  for (let i = closes.length - period; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff >= 0) gains += diff;
    else losses += -diff;
  }
  const avgGain = gains / period;
  const avgLoss = losses / period;
  if (avgLoss === 0) return avgGain === 0 ? 50 : 100;
  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}

export type TechnicalInputs = {
  price: number;
  movingAverage200: number | null;
  rsi: number | null;
  week52Low: number;
  week52High: number;
};

export function computeTechnicalScore(inputs: TechnicalInputs): ScoreResult {
  const subScores: number[] = [];
  const drivers: string[] = [];

  if (inputs.movingAverage200 !== null && inputs.movingAverage200 > 0) {
    const pctDiff = ((inputs.price - inputs.movingAverage200) / inputs.movingAverage200) * 100;
    subScores.push(clamp(50 + pctDiff * 2.5, 0, 100));
    drivers.push(
      `Price is ${Math.abs(pctDiff).toFixed(1)}% ${pctDiff >= 0 ? "above" : "below"} its 200-day moving average.`
    );
  }

  if (inputs.rsi !== null) {
    subScores.push(inputs.rsi);
    drivers.push(`14-day RSI is ${inputs.rsi.toFixed(0)}.`);
  }

  if (inputs.week52High > inputs.week52Low) {
    const positionPct = ((inputs.price - inputs.week52Low) / (inputs.week52High - inputs.week52Low)) * 100;
    subScores.push(clamp(positionPct, 0, 100));
    drivers.push(`Sits at ${positionPct.toFixed(0)}% of its 52-week range (0% = low, 100% = high).`);
  }

  if (subScores.length === 0) return { score: null, drivers: [] };
  return { score: Math.round(subScores.reduce((a, b) => a + b, 0) / subScores.length), drivers };
}

export type FundamentalInputs = {
  grossMarginPct: number | null;
  netMarginPct: number | null;
  roePct: number | null;
  netDebtToEbitda: number | null;
  revenueGrowthPct: number | null;
};

export function computeFundamentalScore(inputs: FundamentalInputs): ScoreResult {
  const subScores: number[] = [];
  const drivers: string[] = [];

  const margin = inputs.grossMarginPct ?? inputs.netMarginPct;
  if (margin !== null) {
    const basis = inputs.grossMarginPct !== null ? "Gross" : "Net";
    const scale = inputs.grossMarginPct !== null ? 1.5 : 3;
    subScores.push(clamp(margin * scale, 0, 100));
    drivers.push(`${basis} margin is ${margin.toFixed(1)}%.`);
  }

  if (inputs.roePct !== null) {
    subScores.push(clamp(inputs.roePct * 3, 0, 100));
    drivers.push(`Return on equity is ${inputs.roePct.toFixed(1)}%.`);
  }

  if (inputs.netDebtToEbitda !== null) {
    subScores.push(clamp(100 - inputs.netDebtToEbitda * 15, 0, 100));
    drivers.push(`Net debt / EBITDA is ${inputs.netDebtToEbitda.toFixed(1)}x.`);
  }

  if (inputs.revenueGrowthPct !== null) {
    subScores.push(clamp(50 + inputs.revenueGrowthPct * 1.5, 0, 100));
    drivers.push(`Revenue grew ${inputs.revenueGrowthPct.toFixed(1)}% year over year.`);
  }

  if (subScores.length === 0) return { score: null, drivers: [] };
  return { score: Math.round(subScores.reduce((a, b) => a + b, 0) / subScores.length), drivers };
}

export type AtAGlanceInputs = TechnicalInputs &
  FundamentalInputs & {
    beta: number | null;
    peRatio: number | null;
  };

/** The 7 short "at a glance" chips — neutral, factual bucket language only
 * (never "Buy"/"Sell"/"Recommend"), matching the exact wording style this
 * module is scoped to use. */
export function computeAtAGlanceChips(inputs: AtAGlanceInputs): Chip[] {
  const chips: Chip[] = [];

  chips.push({
    label: "Trend",
    value:
      inputs.movingAverage200 === null
        ? "Unavailable"
        : inputs.price >= inputs.movingAverage200
          ? "Above 200DMA"
          : "Below 200DMA",
  });

  chips.push({
    label: "Momentum",
    value:
      inputs.rsi === null
        ? "Unavailable"
        : inputs.rsi >= 60
          ? "Firm momentum"
          : inputs.rsi <= 40
            ? "Soft momentum"
            : "Neutral momentum",
  });

  if (inputs.week52High > inputs.week52Low) {
    const positionPct = ((inputs.price - inputs.week52Low) / (inputs.week52High - inputs.week52Low)) * 100;
    chips.push({
      label: "52-week range",
      value: positionPct >= 80 ? "Near 52-week high" : positionPct <= 20 ? "Near 52-week low" : "Mid-range",
    });
  } else {
    chips.push({ label: "52-week range", value: "Unavailable" });
  }

  chips.push({
    label: "Profitability",
    value:
      inputs.roePct === null
        ? "Unavailable"
        : inputs.roePct >= 20
          ? "High ROE"
          : inputs.roePct >= 5
            ? "Moderate ROE"
            : inputs.roePct >= 0
              ? "Low ROE"
              : "Negative ROE",
  });

  chips.push({
    label: "Leverage",
    value:
      inputs.netDebtToEbitda === null
        ? "Unavailable"
        : inputs.netDebtToEbitda < 1
          ? "Low leverage"
          : inputs.netDebtToEbitda < 3
            ? "Moderate leverage"
            : "High leverage",
  });

  chips.push({
    label: "Volatility",
    value:
      inputs.beta === null
        ? "Unavailable"
        : inputs.beta > 1.2
          ? "Higher than market"
          : inputs.beta < 0.8
            ? "Lower than market"
            : "Near market",
  });

  chips.push({
    label: "Valuation",
    value:
      inputs.peRatio === null
        ? "Unavailable"
        : inputs.peRatio < 15
          ? "Low multiple"
          : inputs.peRatio <= 25
            ? "Market multiple"
            : "High multiple",
  });

  return chips;
}
