// Thin proxy route: lets client components search for a ticker without
// exposing the Twelve Data (or EODHD) API keys to the browser. The keys
// stay server-side inside src/lib/marketData.ts and src/lib/eodhd.ts.
//
// Results are merged from two sources: Twelve Data's symbol_search (every
// exchange it covers) plus EODHD's Hong Kong directory search (the one
// exchange Twelve Data's plan doesn't include — see docs/DATA_SOURCES.md).
// The EODHD lookup is wrapped so a failure there (missing key, rate limit)
// never breaks the rest of search — it just silently contributes zero
// extra results.

import { NextRequest, NextResponse } from "next/server";
import { searchSymbols } from "@/lib/marketData";
import { searchHongKongSymbols } from "@/lib/eodhd";
import { hasFreeQuoteDataForResult } from "@/lib/exchangeCoverage";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q") ?? "";

  if (!query.trim()) {
    return NextResponse.json({ results: [] });
  }

  try {
    const [results, hkResults] = await Promise.all([
      searchSymbols(query),
      searchHongKongSymbols(query).catch(() => []),
    ]);
    // The client only ever shows the first 8 results (see TickerSearch.tsx)
    // — Twelve Data alone can return dozens of near-duplicate international
    // listings for a name like "HSBC" (ADRs, depositary receipts, regional
    // funds), which would otherwise bury the working EODHD-backed HK result
    // past that cutoff. A stable sort putting results this site can
    // actually show real data for first (regardless of source) fixes that
    // generally, not just for HK.
    const merged = [...results, ...hkResults];
    merged.sort((a, b) => Number(hasFreeQuoteDataForResult(b)) - Number(hasFreeQuoteDataForResult(a)));
    return NextResponse.json({ results: merged });
  } catch (error) {
    console.error("Symbol search failed:", error);
    return NextResponse.json({ results: [], error: "Search failed" }, { status: 502 });
  }
}
