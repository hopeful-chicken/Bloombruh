// Data for the sitewide ticker strip (see MarketTicker.tsx). Reuses the
// same Twelve Data /quote endpoint and 60-second cache already used by the
// Company Profile page (src/lib/marketData.ts) — no new provider, no made-
// up numbers. A small, fixed basket of large, liquid NASDAQ/NYSE names is
// used rather than letting the ticker roam the whole market, since Twelve
// Data's free plan only reliably serves those two exchanges (see
// src/lib/exchangeCoverage.ts) and this keeps the request count small and
// predictable against the 8-requests/minute free-tier limit.

import { getQuote } from "./marketData";

const TICKER_SYMBOLS = ["AAPL", "MSFT", "NVDA", "GOOGL", "AMZN", "TSLA", "JPM", "GS"];

export type TickerQuote = {
  symbol: string;
  priceLabel: string;
  changeLabel: string;
  direction: "up" | "down" | "flat";
};

/** Live quotes for the ticker strip. Symbols that fail (rate limit, no key
 * set locally, etc.) are silently dropped rather than breaking the whole
 * strip — MarketTicker renders nothing at all if every symbol fails. */
export async function getTickerQuotes(): Promise<TickerQuote[]> {
  const results = await Promise.allSettled(TICKER_SYMBOLS.map((symbol) => getQuote(symbol)));

  return results.flatMap((result) => {
    if (result.status !== "fulfilled") return [];
    const q = result.value;
    const price = Number(q.close);
    const changePct = Number(q.percent_change);
    if (!Number.isFinite(price) || !Number.isFinite(changePct)) return [];

    const direction: TickerQuote["direction"] = changePct > 0 ? "up" : changePct < 0 ? "down" : "flat";
    const arrow = direction === "up" ? "▲" : direction === "down" ? "▼" : "—";

    return [
      {
        symbol: q.symbol,
        priceLabel: price.toFixed(2),
        changeLabel: `${arrow}${Math.abs(changePct).toFixed(2)}%`,
        direction,
      },
    ];
  });
}
