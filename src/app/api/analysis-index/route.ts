// Serves the still-locked half of the /analysis index listing (titles,
// taglines, dates for the stock pitches, plus the leads list) only after
// the same unlock code as every other gated part of My Analysis. Write-ups
// are public now and rendered directly by the page, so they're not part of
// this response. Same reasoning as /api/pitch-content: this data must not
// be included in the page's own server-rendered output, or it ships to
// every visitor regardless of whether the gate ever shows unlocked.

import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { STOCK_PITCHES, LEADS } from "@/data/analysis";
import { PITCH_UNLOCK_CODE } from "@/lib/pitchUnlock";

// Locked the same way as everything else here, on request — not because
// this text is sensitive, but because the instruction was to gate it like
// a pitch, not leave it public.
const PHILOSOPHY =
  "These aren't news summaries. They're my own opinion, not neutral reporting. Every piece starts from something real, a headline, a number, a chart, but the actual point is always what I think it means, checked against the real data first. Mostly markets and the economy. Sometimes something else, if the numbers behind it are real enough to actually say something with.";

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
      philosophy: PHILOSOPHY,
      pitches: STOCK_PITCHES.map(strip),
      leads: LEADS,
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
