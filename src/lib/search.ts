// Pure, dependency-free search logic — no Node.js APIs — so this can be
// imported from client components for instant, in-browser search over the
// (small, ~200 row) holdings dataset.

import type { Holding } from "./types";

/** Case-insensitive scored search over company name and ticker. */
export function filterHoldings(
  holdings: Holding[],
  query: string,
  limit = 10
): Holding[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  return holdings
    .map((h) => {
      const nameLower = h.name.toLowerCase();
      const tickerLower = h.ticker?.toLowerCase() ?? "";
      let score = -1;
      if (nameLower === q || tickerLower === q) score = 100;
      else if (nameLower.startsWith(q)) score = 80;
      else if (tickerLower.startsWith(q)) score = 70;
      else if (nameLower.includes(q)) score = 50;
      else if (tickerLower.includes(q)) score = 40;
      return { h, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || b.h.marketValueUSD - a.h.marketValueUSD)
    .slice(0, limit)
    .map((x) => x.h);
}

/** Formats a USD value into a compact string, e.g. $38.4bn, $920m. */
export function formatUSD(value: number): string {
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}tn`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}bn`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(0)}m`;
  return `$${value.toLocaleString()}`;
}
