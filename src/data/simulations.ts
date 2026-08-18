// Data + math for the Simulations module. Two simulations, two different
// high-finance seats:
//
// 1. Market Maker (a sales & trading role) — the price feed and order
//    flow are entirely generated (a random walk + a probabilistic fill
//    model), not real market data. That's the point: this teaches the
//    *mechanics* of market-making (spread capture vs. fill rate,
//    inventory risk, mark-to-market, risk limits), not a real market.
//
// 2. Portfolio Risk Simulator (an asset management / risk role) — runs a
//    real Monte Carlo simulation (single-factor model, like Sharpe's
//    market model) using ILLUSTRATIVE long-run return/volatility
//    assumptions for each asset class. These are the kind of
//    widely-cited, textbook-style long-run averages used in finance
//    education (not a live feed, not any one bank's published capital
//    market assumptions) — labeled clearly as assumptions everywhere
//    they appear, per this project's "never present a guess as live
//    data" rule.

export type AssetClass = {
  id: string;
  name: string;
  ticker: string;
  category: string;
  expectedReturn: number; // annual, illustrative long-run assumption
  volatility: number; // annual, illustrative long-run assumption
  beta: number; // sensitivity to the single common market factor
};

export const ASSET_CLASSES: AssetClass[] = [
  { id: "us-large", name: "US Large-Cap Equities", ticker: "S&P 500-like", category: "Equities", expectedReturn: 0.10, volatility: 0.16, beta: 1.0 },
  { id: "us-small", name: "US Small-Cap Equities", ticker: "Russell 2000-like", category: "Equities", expectedReturn: 0.11, volatility: 0.20, beta: 1.2 },
  { id: "intl-dev", name: "Developed Intl. Equities", ticker: "MSCI EAFE-like", category: "Equities", expectedReturn: 0.08, volatility: 0.18, beta: 0.85 },
  { id: "em", name: "Emerging Market Equities", ticker: "MSCI EM-like", category: "Equities", expectedReturn: 0.09, volatility: 0.22, beta: 1.1 },
  { id: "ig-bonds", name: "US Investment-Grade Bonds", ticker: "Agg-like", category: "Fixed Income", expectedReturn: 0.045, volatility: 0.06, beta: 0.05 },
  { id: "treasuries", name: "Long-Duration US Treasuries", ticker: "20Y+ Treasury-like", category: "Fixed Income", expectedReturn: 0.04, volatility: 0.10, beta: -0.1 },
  { id: "reits", name: "Real Estate (REITs)", ticker: "REIT index-like", category: "Real Assets", expectedReturn: 0.08, volatility: 0.19, beta: 0.7 },
  { id: "gold", name: "Gold", ticker: "XAU-like", category: "Real Assets", expectedReturn: 0.06, volatility: 0.15, beta: 0.05 },
  { id: "crypto", name: "Bitcoin / Crypto", ticker: "BTC-like", category: "Alternatives", expectedReturn: 0.35, volatility: 0.65, beta: 1.5 },
  { id: "cash", name: "Cash / T-Bills", ticker: "T-Bill-like", category: "Cash", expectedReturn: 0.03, volatility: 0.01, beta: 0.0 },
];

export const RISK_FREE_RATE = 0.04;
const MARKET_VOL = 0.16; // annualized vol of the common factor (matches US Large-Cap)
const TRADING_DAYS = 252;

// ---------------------------------------------------------------------------
// Client briefs — what turns the simulator from a calculator into a seat.
// A real risk/PM analyst never optimizes a portfolio in a vacuum: the
// client hands you a mandate with hard constraints, and your job is to get
// inside ALL of them at once. Return vs. tail risk is the obvious
// trade-off; the subtler ones (concentration limits, banned assets,
// minimum diversification) are where first-timers actually fail.
// ---------------------------------------------------------------------------

export type MandateConstraint =
  | { kind: "minReturn"; value: number } // expected 1yr return, decimal
  | { kind: "maxCvar"; value: number } // 95% CVaR, decimal (positive = loss)
  | { kind: "maxSingleWeight"; value: number } // any one asset class, decimal
  | { kind: "bannedAsset"; assetId: string } // weight must be ~zero
  | { kind: "capAsset"; assetId: string; value: number } // one specific asset, decimal
  | { kind: "minDiversified"; count: number; minWeight: number }; // at least N assets >= minWeight

export type ClientBrief = {
  id: string;
  client: string;
  role: string;
  story: string;
  constraints: MandateConstraint[];
  constraintLabels: string[]; // human-readable, in the same order
  signOff: string; // what the client says if you pass everything
  pushBack: string; // what they lead with if you don't
};

export const CLIENT_BRIEFS: ClientBrief[] = [
  {
    id: "pension",
    client: "Ruth",
    role: "pension trustee",
    story:
      "Ruth looks after a defined-benefit pension's reserve sleeve. Retirees' payments come out of this money. She is not interested in what happens in a good year. She wants to know what happens in a bad one, and she has a board to answer to.",
    constraints: [
      { kind: "minReturn", value: 0.05 },
      { kind: "maxCvar", value: 0.12 },
      { kind: "bannedAsset", assetId: "crypto" },
      { kind: "maxSingleWeight", value: 0.4 },
    ],
    constraintLabels: [
      "Expected 1-year return of at least 5%",
      "95% CVaR no worse than −12% (the average bad year)",
      "No crypto — the board won't allow it",
      "No single asset class above 40%",
    ],
    signOff:
      "This I can take to the board. You've told me what the bad year looks like, and it's one we survive.",
    pushBack:
      "My board doesn't ask about expected returns. They ask about the worst year. Come back when the downside is something I can defend.",
  },
  {
    id: "endowment",
    client: "Marcus",
    role: "university endowment CIO",
    story:
      "Marcus runs a mid-size university endowment: perpetual horizon, annual spending needs, and an investment committee that once watched a peer school concentrate in one theme and spend a decade recovering. Growth matters, but so does not being the next cautionary tale.",
    constraints: [
      { kind: "minReturn", value: 0.065 },
      { kind: "maxCvar", value: 0.18 },
      { kind: "minDiversified", count: 4, minWeight: 0.05 },
      { kind: "maxSingleWeight", value: 0.5 },
    ],
    constraintLabels: [
      "Expected 1-year return of at least 6.5%",
      "95% CVaR no worse than −18%",
      "At least 4 asset classes with 5%+ each (real diversification)",
      "No single asset class above 50%",
    ],
    signOff:
      "Growth with genuine diversification. This is what perpetual capital is supposed to look like. Send the memo.",
    pushBack:
      "I've seen this movie: great expected return, fragile construction. My committee will ask which single bet sinks us. Have a better answer.",
  },
  {
    id: "young",
    client: "Chloe",
    role: "first-job saver, 24",
    story:
      "Chloe just started her first job and wants her savings to work hard. She has decades ahead of her and keeps saying she can handle risk. Your job is to get her real growth, while making sure the first big drawdown of her life doesn't scare her out of the market forever.",
    constraints: [
      { kind: "minReturn", value: 0.09 },
      { kind: "maxCvar", value: 0.35 },
      { kind: "capAsset", assetId: "cash", value: 0.1 },
    ],
    constraintLabels: [
      "Expected 1-year return of at least 9%",
      "95% CVaR no worse than −35% (she says she can take it, test that)",
      "Cash no more than 10% (she wants the money working)",
    ],
    signOff:
      "Aggressive but honest about what a bad year feels like. She stays invested through it. That's the whole plan.",
    pushBack:
      "If the honest bad year is one she can't sit through, she'll sell at the bottom and this was all worse than a savings account.",
  },
];

export type MandateResult = { label: string; pass: boolean; detail: string };

// Checks a portfolio (normalized weights + its Monte Carlo output) against
// every constraint in the client's mandate. Each check returns the numbers
// behind the verdict — a real client conversation is about specifics, not
// vibes.
export function evaluateMandate(
  brief: ClientBrief,
  weights: Record<string, number>, // normalized (sums to 1)
  result: MonteCarloResult
): MandateResult[] {
  return brief.constraints.map((c, i) => {
    const label = brief.constraintLabels[i];
    switch (c.kind) {
      case "minReturn": {
        const pass = result.expectedReturn >= c.value;
        return {
          label,
          pass,
          detail: `expected ${(result.expectedReturn * 100).toFixed(1)}% vs ${(c.value * 100).toFixed(0)}% required`,
        };
      }
      case "maxCvar": {
        const pass = result.cvar95 <= c.value;
        return {
          label,
          pass,
          detail: `CVaR −${(result.cvar95 * 100).toFixed(1)}% vs −${(c.value * 100).toFixed(0)}% limit`,
        };
      }
      case "maxSingleWeight": {
        const worst = Math.max(...Object.values(weights));
        const worstName = ASSET_CLASSES.find((a) => weights[a.id] === worst)?.name ?? "";
        const pass = worst <= c.value + 1e-9;
        return {
          label,
          pass,
          detail: `largest is ${worstName} at ${(worst * 100).toFixed(0)}% vs ${(c.value * 100).toFixed(0)}% cap`,
        };
      }
      case "bannedAsset": {
        const w = weights[c.assetId] ?? 0;
        const pass = w < 0.005;
        return {
          label,
          pass,
          detail: w < 0.005 ? "none held" : `you hold ${(w * 100).toFixed(0)}% — outside the mandate`,
        };
      }
      case "capAsset": {
        const w = weights[c.assetId] ?? 0;
        const name = ASSET_CLASSES.find((a) => a.id === c.assetId)?.name ?? c.assetId;
        const pass = w <= c.value + 1e-9;
        return {
          label,
          pass,
          detail: `${name} at ${(w * 100).toFixed(0)}% vs ${(c.value * 100).toFixed(0)}% cap`,
        };
      }
      case "minDiversified": {
        const n = Object.values(weights).filter((w) => w >= c.minWeight).length;
        const pass = n >= c.count;
        return {
          label,
          pass,
          detail: `${n} asset classes at ≥${(c.minWeight * 100).toFixed(0)}% vs ${c.count} required`,
        };
      }
    }
  });
}

// Box-Muller transform — standard normal random draw.
function randNormal(): number {
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

export type SimPath = number[]; // portfolio value per day, length TRADING_DAYS + 1

export type MonteCarloResult = {
  paths: SimPath[];
  percentileByDay: { day: number; p5: number; p25: number; median: number; p75: number; p95: number }[];
  endValues: number[];
  expectedReturn: number;
  volatility: number;
  var95: number; // 1yr 95% Value at Risk, as a fraction of starting value (positive = loss)
  cvar95: number; // Expected Shortfall beyond the 95% VaR threshold
  sharpe: number;
};

export type WeightedAsset = { asset: AssetClass; weight: number };

export function runMonteCarlo(
  weightedAssets: WeightedAsset[],
  startingValue: number,
  numPaths = 500,
  days = TRADING_DAYS
): MonteCarloResult {
  const paths: SimPath[] = [];

  for (let p = 0; p < numPaths; p++) {
    let value = startingValue;
    const path: number[] = [value];
    for (let d = 0; d < days; d++) {
      const marketZ = randNormal();
      let dayReturn = 0;
      for (const { asset, weight } of weightedAssets) {
        if (weight <= 0) continue;
        const dailyDrift = (asset.expectedReturn - 0.5 * asset.volatility * asset.volatility) / TRADING_DAYS;
        const factorVol = asset.beta * MARKET_VOL;
        const idioVolSq = Math.max(asset.volatility * asset.volatility - factorVol * factorVol, 0);
        const idioVol = Math.sqrt(idioVolSq);
        const factorShock = (factorVol / Math.sqrt(TRADING_DAYS)) * marketZ;
        const idioShock = (idioVol / Math.sqrt(TRADING_DAYS)) * randNormal();
        const assetDayReturn = dailyDrift + factorShock + idioShock;
        dayReturn += weight * assetDayReturn;
      }
      value = value * (1 + dayReturn);
      path.push(value);
    }
    paths.push(path);
  }

  const percentileByDay: MonteCarloResult["percentileByDay"] = [];
  for (let d = 0; d <= days; d++) {
    const valuesAtDay = paths.map((path) => path[d]).sort((a, b) => a - b);
    percentileByDay.push({
      day: d,
      p5: percentile(valuesAtDay, 0.05),
      p25: percentile(valuesAtDay, 0.25),
      median: percentile(valuesAtDay, 0.5),
      p75: percentile(valuesAtDay, 0.75),
      p95: percentile(valuesAtDay, 0.95),
    });
  }

  const endValues = paths.map((path) => path[path.length - 1]);
  const returns = endValues.map((v) => v / startingValue - 1);
  const expectedReturn = mean(returns);
  const volatility = stdDev(returns);

  const sortedReturns = [...returns].sort((a, b) => a - b);
  const var95Index = Math.floor(sortedReturns.length * 0.05);
  const var95Return = sortedReturns[var95Index];
  const var95 = -var95Return; // express as a positive loss fraction
  const tailReturns = sortedReturns.slice(0, Math.max(var95Index, 1));
  const cvar95 = -mean(tailReturns);

  const sharpe = volatility > 0 ? (expectedReturn - RISK_FREE_RATE) / volatility : 0;

  return { paths, percentileByDay, endValues, expectedReturn, volatility, var95, cvar95, sharpe };
}

function percentile(sortedValues: number[], p: number): number {
  const idx = Math.min(sortedValues.length - 1, Math.max(0, Math.floor(sortedValues.length * p)));
  return sortedValues[idx];
}

function mean(values: number[]): number {
  return values.reduce((s, v) => s + v, 0) / values.length;
}

function stdDev(values: number[]): number {
  const m = mean(values);
  const variance = mean(values.map((v) => (v - m) ** 2));
  return Math.sqrt(variance);
}
