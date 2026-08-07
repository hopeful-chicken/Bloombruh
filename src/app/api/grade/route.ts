// Thin proxy route for the "Pro" AI report-grading feature: lets the
// client-side "Grade my report" button send the student's written blocks
// without ever holding the Anthropic API key itself. The key stays
// server-side inside src/lib/grading.ts. This is a Pro (code-locked)
// feature and the only part of the site that costs real money per request.

import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { gradeReport } from "@/lib/grading";
import type { Block, StatEntry } from "@/lib/reportBlocks";

type GradeRequestBody = {
  symbol: string;
  companyName: string;
  price: number;
  rating: string;
  targetPrice: number | null;
  availableStats: StatEntry[];
  blocks: Block[];
};

export async function POST(request: NextRequest) {
  let body: GradeRequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!body.symbol || !Array.isArray(body.blocks)) {
    return NextResponse.json({ error: "Missing symbol or blocks" }, { status: 400 });
  }

  try {
    const result = await gradeReport(body);
    return NextResponse.json({ result });
  } catch (error) {
    // Never show fake/guessed feedback — surface a clear, honest message
    // for each known failure mode instead.
    if (error instanceof Anthropic.AuthenticationError) {
      return NextResponse.json(
        { error: "AI grading is not configured: the Anthropic API key is missing or invalid." },
        { status: 502 }
      );
    }
    if (error instanceof Anthropic.RateLimitError) {
      return NextResponse.json(
        { error: "AI grading is rate-limited right now. Try again in a minute." },
        { status: 429 }
      );
    }
    if (error instanceof Anthropic.APIError) {
      return NextResponse.json(
        { error: `AI grading failed: ${error.message}` },
        { status: 502 }
      );
    }
    const message = error instanceof Error ? error.message : "AI grading failed unexpectedly.";
    console.error("Grading failed:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
