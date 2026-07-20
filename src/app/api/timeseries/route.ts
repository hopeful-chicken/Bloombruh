// Thin proxy route: lets the chart's range buttons (1D/1M/3M/1Y/MAX) fetch
// fresh price history from the client without exposing the Twelve Data API
// key to the browser. The key stays server-side inside src/lib/marketData.ts.

import { NextRequest, NextResponse } from "next/server";
import { getTimeSeriesForRange, type Range } from "@/lib/marketData";

const VALID_RANGES: Range[] = ["1D", "1M", "3M", "1Y", "MAX"];

export async function GET(request: NextRequest) {
  const symbol = request.nextUrl.searchParams.get("symbol") ?? "";
  const range = request.nextUrl.searchParams.get("range") as Range | null;

  if (!symbol.trim() || !range || !VALID_RANGES.includes(range)) {
    return NextResponse.json({ error: "Invalid symbol or range" }, { status: 400 });
  }

  try {
    const series = await getTimeSeriesForRange(symbol.toUpperCase(), range);
    const chronological = [...series.values].reverse();
    const points = chronological.map((v) => ({
      date: formatLabel(v.datetime, range),
      close: parseFloat(v.close),
    }));
    return NextResponse.json({ points });
  } catch (error) {
    console.error("Time series fetch failed:", error);
    return NextResponse.json(
      { error: "Failed to load price data" },
      { status: 502 }
    );
  }
}

/** Chart x-axis label: time-of-day for intraday, month for MAX, month-day otherwise. */
function formatLabel(datetime: string, range: Range): string {
  if (range === "1D") return datetime.slice(11, 16);
  if (range === "MAX") return datetime.slice(0, 7);
  return datetime.slice(5);
}
