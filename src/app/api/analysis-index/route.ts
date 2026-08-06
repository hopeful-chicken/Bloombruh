// Serves the /analysis index listing (titles, taglines, dates for the
// write-ups, stock pitches, and leads list) only after the same unlock
// code as every other gated part of My Analysis. Same reasoning as
// /api/pitch-content: this data must not be included in the page's own
// server-rendered output, or it ships to every visitor regardless of
// whether the gate ever shows unlocked.

import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { ANALYSIS_ENTRIES, STOCK_PITCHES, LEADS } from "@/data/analysis";
import { PITCH_UNLOCK_CODE } from "@/lib/pitchUnlock";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  if (code !== PITCH_UNLOCK_CODE) {
    return NextResponse.json({ error: "Wrong or missing unlock code." }, { status: 403 });
  }

  const strip = (e: { id: string; title: string; tagline: string; date: string }) => ({
    id: e.id,
    title: e.title,
    tagline: e.tagline,
    date: e.date,
  });

  return NextResponse.json(
    {
      entries: ANALYSIS_ENTRIES.map(strip),
      pitches: STOCK_PITCHES.map(strip),
      leads: LEADS,
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
