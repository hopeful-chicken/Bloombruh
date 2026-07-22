// Thin proxy route: lets the chart's range buttons (1D/1M/3M/1Y/MAX) fetch
// fresh price history from the client without exposing the Twelve Data (or
// EODHD) API keys to the browser. The keys stay server-side inside
// src/lib/marketData.ts and src/lib/eodhd.ts.
//
// Hong Kong symbols (".HK" suffix) route to EODHD instead of Twelve Data —
// see isHongKongSymbol() in eodhd.ts for why. Everything else is unchanged.

import { NextRequest, NextResponse } from "next/server";
import { getTimeSeriesForRange, type Range } from "@/lib/marketData";
import { isHongKongSymbol, getHkTimeSeriesForRange, type HkRange } from "@/lib/eodhd";

const VALID_RANGES: Range[] = ["1D", "1W", "1M", "3M", "1Y", "5Y", "MAX"];

export async function GET(request: NextRequest) {
  const symbol = request.nextUrl.searchParams.get("symbol") ?? "";
  const range = request.nextUrl.searchParams.get("range") as Range | null;

  if (!symbol.trim() || !range || !VALID_RANGES.includes(range)) {
    return NextResponse.json({ error: "Invalid symbol or range" }, { status: 400 });
  }

  try {
    const series = isHongKongSymbol(symbol)
      ? await getHkTimeSeriesForRange(symbol.toUpperCase(), range as HkRange)
      : await getTimeSeriesForRange(symbol.toUpperCase(), range);
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

/** Chart x-axis label: time-of-day for intraday, "YYYY-MM" for multi-year
 * windows (5Y/MAX), "MM-DD" otherwise.
 *
 * Bug fixed 2026-07-23: this used to check `datetime.length <= 10` first,
 * before checking the range — but Twelve Data's daily/weekly bars are
 * always plain "YYYY-MM-DD" (10 chars, no time-of-day), so that check was
 * true for every range, and the range-specific formatting below it (in
 * particular the "MAX" case) never actually ran. The practical symptom:
 * "Forever" showed bare "MM-DD" labels with no year, indistinguishable
 * year over year — exactly the "not understandable" complaint. Only "1D"
 * genuinely needs to branch on whether a time-of-day component is present
 * (EODHD's Hong Kong data has none, even for "1D" — see the HkRange
 * comment in eodhd.ts), so that check now only applies there. */
function formatLabel(datetime: string, range: Range): string {
  if (range === "1D") {
    return datetime.length > 10 ? datetime.slice(11, 16) : datetime.slice(5);
  }
  if (range === "5Y" || range === "MAX") {
    return datetime.slice(0, 7); // "YYYY-MM" — a multi-year window needs the year
  }
  return datetime.slice(5); // "MM-DD"
}
