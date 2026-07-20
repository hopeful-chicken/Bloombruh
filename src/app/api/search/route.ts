// Thin proxy route: lets client components search for a ticker without
// exposing the Twelve Data API key to the browser. The key stays server-side
// inside src/lib/marketData.ts.

import { NextRequest, NextResponse } from "next/server";
import { searchSymbols } from "@/lib/marketData";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q") ?? "";

  if (!query.trim()) {
    return NextResponse.json({ results: [] });
  }

  try {
    const results = await searchSymbols(query);
    return NextResponse.json({ results });
  } catch (error) {
    console.error("Symbol search failed:", error);
    return NextResponse.json({ results: [], error: "Search failed" }, { status: 502 });
  }
}
