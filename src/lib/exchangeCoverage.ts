// Which exchanges this site's free Twelve Data plan can actually return
// quote/time_series data for (see docs/DATA_SOURCES.md for how this was
// confirmed). Shared between the server-side search dedupe logic
// (marketData.ts) and the client-side "limited data" warning badge
// (TickerSearch.tsx) so the two stay in sync.
export const FREE_TIER_EXCHANGES = ["NASDAQ", "NYSE", "OTC"];

export function hasFreeQuoteData(exchange: string): boolean {
  return FREE_TIER_EXCHANGES.some((e) => exchange.toUpperCase().includes(e));
}

/** Whether this site can show real data for a given search result — like
 * hasFreeQuoteData(), but also covers Hong Kong Stock Exchange results,
 * which route through EODHD (src/lib/eodhd.ts) instead of Twelve Data.
 * Deliberately keyed off the *symbol* (EODHD-backed HK results are always
 * formatted "0700.HK" by searchHongKongSymbols(), see eodhd.ts), not the
 * exchange label — Twelve Data's own raw "HKEX" search results (warrants,
 * plain numeric codes with no ".HK" suffix) still correctly show as
 * limited, since those genuinely don't work through Twelve Data. */
export function hasFreeQuoteDataForResult(result: { symbol: string; exchange: string }): boolean {
  return hasFreeQuoteData(result.exchange) || result.symbol.toUpperCase().endsWith(".HK");
}
