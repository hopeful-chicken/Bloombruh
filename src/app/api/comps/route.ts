// Thin proxy route: lets the client-side comps-table block ask for a set
// of user-entered peer tickers without exposing the Twelve Data API key
// to the browser. The actual fetching/computation lives in src/lib/comps.ts.

import { NextRequest, NextResponse } from "next/server";
import { buildCompsTable } from "@/lib/comps";

export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get("symbols") ?? "";
  const symbols = raw.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 10);

  if (symbols.length === 0) {
    return NextResponse.json({ rows: [] });
  }

  try {
    const rows = await buildCompsTable(symbols);
    return NextResponse.json({ rows });
  } catch (error) {
    console.error("Comps table build failed:", error);
    return NextResponse.json({ rows: [], error: "Failed to build comps table" }, { status: 502 });
  }
}
