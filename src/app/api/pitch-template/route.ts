// Serves the downloadable pitch-deck .pptx templates from a location
// outside `public/` — so the files are not sitting at a guessable static
// URL that skips the pitch's own unlock gate entirely. Requires the same
// code as PitchToolkitGate.tsx.
//
// Still NOT real security (see docs/DECISIONS.md and pitchUnlock.ts) —
// the code is visible in the client bundle, and this route's whole job is
// friction, not access control. What it does fix: before, the raw file
// lived in `public/downloads/pitch-templates/*.pptx`, a predictable path
// anyone (or any crawler) could hit directly, with no code and without
// ever loading the gated pitch page. Now the file only exists behind this
// route, and `id` is checked against a fixed allowlist rather than used
// to build a filesystem path directly, so it can't be used to read an
// arbitrary file off disk either.

import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { PITCH_UNLOCK_CODE, PITCH_TEMPLATE_IDS, type PitchTemplateId } from "@/lib/pitchUnlock";

function isValidId(id: string | null): id is PitchTemplateId {
  return !!id && (PITCH_TEMPLATE_IDS as readonly string[]).includes(id);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const code = searchParams.get("code");

  if (code !== PITCH_UNLOCK_CODE) {
    return NextResponse.json({ error: "Wrong or missing unlock code." }, { status: 403 });
  }
  if (!isValidId(id)) {
    return NextResponse.json({ error: "Unknown pitch template." }, { status: 404 });
  }

  const filePath = path.join(process.cwd(), "src", "data", "pitch-templates", `${id}.pptx`);
  const file = await readFile(filePath);

  return new NextResponse(new Uint8Array(file), {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "Content-Disposition": `attachment; filename="${id}-pitch-deck-template.pptx"`,
      "Cache-Control": "no-store",
    },
  });
}
