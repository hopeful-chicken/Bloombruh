import { NextRequest, NextResponse } from "next/server";
import { getPriceHistory, type Range } from "@/lib/hkex/yahooFinance";

const VALID_RANGES: Range[] = ["1W", "1M", "3M", "1Y", "10Y", "MAX"];

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code") ?? "";
  const range = request.nextUrl.searchParams.get("range") as Range | null;

  if (!code.trim() || !range || !VALID_RANGES.includes(range)) {
    return NextResponse.json({ error: "Invalid code or range" }, { status: 400 });
  }

  try {
    const { points, isPartial } = await getPriceHistory(code, range);
    return NextResponse.json({ points, isPartial });
  } catch (error) {
    console.error("HKEX price history fetch failed:", error);
    return NextResponse.json({ error: "Failed to load price data" }, { status: 502 });
  }
}
