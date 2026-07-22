// Thin proxy route for the HKEX Screener module (/hkex): searches only the
// Hong Kong Stock Exchange directory, unlike /api/search which merges
// Twelve Data's global results with EODHD's HK results. Kept as a
// separate route rather than a filter flag on /api/search since this
// module's whole point is "only HKEX is searchable here" — a dedicated
// endpoint makes that guarantee obvious in the code, not just in the UI.

import { NextRequest, NextResponse } from "next/server";
import { searchHongKongSymbols } from "@/lib/eodhd";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q") ?? "";

  if (!query.trim()) {
    return NextResponse.json({ results: [] });
  }

  try {
    const results = await searchHongKongSymbols(query, 8);
    return NextResponse.json({ results });
  } catch (error) {
    console.error("Hong Kong symbol search failed:", error);
    return NextResponse.json({ results: [], error: "Search failed" }, { status: 502 });
  }
}
