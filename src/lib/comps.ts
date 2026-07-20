// Server-only peer-comps builder. There's no free source of a
// pre-built "comps set" (that's exactly what Bloomberg/CapIQ charge for),
// so instead this lets the student pick peer tickers themselves — a
// reasonable analyst task — and builds a multiples table by reusing the
// same quote + fundamentals fetchers already used for the primary
// company. Multiples are computed from price/EPS and margins rather than
// market cap/official P/E, since Twelve Data's free plan doesn't expose
// market cap or shares-outstanding-derived P/E directly.

import { getQuote } from "./marketData";
import { getFundamentals } from "./secEdgar";

export type CompRow = {
  symbol: string;
  companyName: string | null;
  price: number | null;
  epsDiluted: number | null;
  peRatio: number | null;
  revenue: number | null;
  revenueGrowthPct: number | null;
  grossMarginPct: number | null;
  operatingMarginPct: number | null;
  netMarginPct: number | null;
  error: string | null;
};

async function buildCompRow(symbol: string): Promise<CompRow> {
  const upper = symbol.toUpperCase();
  const [quoteResult, fundamentalsResult] = await Promise.allSettled([
    getQuote(upper),
    getFundamentals(upper),
  ]);

  if (quoteResult.status === "rejected") {
    return {
      symbol: upper,
      companyName: null,
      price: null,
      epsDiluted: null,
      peRatio: null,
      revenue: null,
      revenueGrowthPct: null,
      grossMarginPct: null,
      operatingMarginPct: null,
      netMarginPct: null,
      error: "Couldn't load a quote for this ticker.",
    };
  }

  const quote = quoteResult.value;
  const price = parseFloat(quote.close);
  const fundamentals =
    fundamentalsResult.status === "fulfilled" ? fundamentalsResult.value : null;

  const epsDiluted = fundamentals?.epsDiluted ?? null;
  const peRatio =
    epsDiluted !== null && epsDiluted > 0 && Number.isFinite(price)
      ? price / epsDiluted
      : null;

  const revenue = fundamentals?.revenue ?? null;
  const revenueGrowthPct =
    fundamentals?.revenue !== null &&
    fundamentals?.revenue !== undefined &&
    fundamentals?.revenuePriorYear
      ? ((fundamentals.revenue - fundamentals.revenuePriorYear) /
          fundamentals.revenuePriorYear) *
        100
      : null;

  const grossMarginPct =
    fundamentals?.grossProfit !== null &&
    fundamentals?.grossProfit !== undefined &&
    revenue
      ? (fundamentals.grossProfit / revenue) * 100
      : null;
  const operatingMarginPct =
    fundamentals?.operatingIncome !== null &&
    fundamentals?.operatingIncome !== undefined &&
    revenue
      ? (fundamentals.operatingIncome / revenue) * 100
      : null;
  const netMarginPct =
    fundamentals?.netIncome !== null &&
    fundamentals?.netIncome !== undefined &&
    revenue
      ? (fundamentals.netIncome / revenue) * 100
      : null;

  return {
    symbol: upper,
    companyName: quote.name,
    price: Number.isFinite(price) ? price : null,
    epsDiluted,
    peRatio,
    revenue,
    revenueGrowthPct,
    grossMarginPct,
    operatingMarginPct,
    netMarginPct,
    error: null,
  };
}

/** Builds a comps table for a list of user-entered peer tickers, in parallel. */
export async function buildCompsTable(symbols: string[]): Promise<CompRow[]> {
  const unique = [...new Set(symbols.map((s) => s.trim().toUpperCase()).filter(Boolean))];
  return Promise.all(unique.map(buildCompRow));
}
