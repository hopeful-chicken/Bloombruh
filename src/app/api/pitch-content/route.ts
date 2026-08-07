// Serves a locked stock pitch's actual content — body, toolkit, and its
// real news + AI summary — only after checking the same unlock code as
// the on-page gate. This exists because of a real gap found in this
// project: passing gated content as React children into a client
// component (the previous PitchToolkitGate) does NOT stop that content
// from being included in the page's server-rendered HTML and RSC
// payload. React only hides it from the rendered DOM after hydration —
// the full pitch text was sitting in plain view of "view source" and the
// network tab regardless of whether anyone ever typed the code. Same root
// cause as the pitch-deck download bug fixed earlier, same fix: don't
// ship the content to the client until the code has been checked
// server-side.
//
// Still NOT real security (see pitchUnlock.ts) — the code lives in the
// client bundle. What this route actually fixes is narrower and real:
// before, the content shipped to every visitor unconditionally, whether
// or not they ever attempted the code. Now it only ships after a
// (client-supplied, but server-verified) code matches.

import { NextRequest, NextResponse } from "next/server";
import { STOCK_PITCHES } from "@/data/analysis";
import { PITCH_UNLOCK_CODE } from "@/lib/pitchUnlock";
import { getCompanyNews } from "@/lib/news";
import { explainPitchNews } from "@/lib/pitchNewsNarrative";

// Write-ups are public now (rendered directly by the [slug] page, no code
// needed), so this route only ever serves stock pitches — the still-locked
// half of My Analysis.

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const code = searchParams.get("code");

  if (code !== PITCH_UNLOCK_CODE) {
    return NextResponse.json({ error: "Wrong or missing unlock code." }, { status: 403 });
  }

  const entry = STOCK_PITCHES.find((p) => p.id === id);
  if (!entry) {
    return NextResponse.json({ error: "Unknown entry." }, { status: 404 });
  }

  const articles = await getCompanyNews(entry.title, 8);
  const { narrative, narrativeError } = await explainPitchNews({
    pitchId: entry.id,
    companyName: entry.title,
    articles,
  });
  const news = { articles, narrative, narrativeError };

  return NextResponse.json(
    {
      title: entry.title,
      tagline: entry.tagline,
      date: entry.date,
      body: entry.body,
      toolkit: entry.toolkit ?? null,
      chart: entry.chart ?? null,
      news,
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
