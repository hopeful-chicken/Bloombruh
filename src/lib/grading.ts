// Server-only wrapper around the Anthropic Claude API. Never import this
// from a "use client" component — it reads process.env.ANTHROPIC_API_KEY
// and would leak the key into the browser bundle if it were.
//
// This is the "Pro" AI-grading feature: it reads the student's own written
// report blocks plus the real company data already on the page, and asks
// Claude to act like a strict-but-encouraging finance mentor grading the
// report — checking whether claims are actually consistent with the real
// numbers, and giving concrete, specific feedback rather than generic
// praise. Unlike every other data source in this project, this one is not
// free: it costs a small amount per grading request on the student's own
// Anthropic API key. See docs/DATA_SOURCES.md for the full story.

import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import type { Block } from "./reportBlocks";
import type { StatEntry } from "./reportBlocks";

function getClient(): Anthropic {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    throw new Error(
      "ANTHROPIC_API_KEY is not set. Copy .env.local.example to .env.local and add your own key from https://console.anthropic.com — AI grading is a paid Pro feature, unlike the rest of this site's free data sources."
    );
  }
  return new Anthropic({ apiKey: key });
}

const SectionFeedbackSchema = z.object({
  blockTitle: z.string().describe("The exact title of the block being reviewed"),
  score: z
    .number()
    .min(0)
    .max(10)
    .nullable()
    .describe("0-10 quality score for this section, or null if it's a data block with nothing written"),
  comment: z
    .string()
    .describe("Specific, actionable feedback — 1-3 sentences, referencing what was actually written"),
});

const GradeResultSchema = z.object({
  overallScore: z.number().min(0).max(100).describe("Overall report quality, 0-100"),
  overallSummary: z
    .string()
    .describe("2-4 sentence overall assessment, written directly to the student"),
  strengths: z.array(z.string()).describe("Specific things the student did well"),
  weaknesses: z.array(z.string()).describe("Specific, concrete things to improve"),
  factCheckNotes: z
    .array(z.string())
    .describe(
      "Any claims in the written sections that seem inconsistent with, or unsupported by, the real company data provided — empty array if nothing stood out"
    ),
  sectionFeedback: z.array(SectionFeedbackSchema),
});

export type GradeResult = z.infer<typeof GradeResultSchema>;

/** Flattens a block's editable content into plain text for the grading
 * prompt. Skips blocks with no student-authored text (comps tables, LBO/M&A
 * calculators, charts, stat grids, news) — those are data, not writing, and
 * grading them as prose would just confuse the model. Returns null for
 * blocks with nothing to grade. */
function blockToText(block: Block): string | null {
  switch (block.type) {
    case "text":
      return block.data.body.trim() ? block.data.body.trim() : null;
    case "swot": {
      const { strengths, weaknesses, opportunities, threats } = block.data;
      const parts = [
        strengths.trim() && `Strengths:\n${strengths.trim()}`,
        weaknesses.trim() && `Weaknesses:\n${weaknesses.trim()}`,
        opportunities.trim() && `Opportunities:\n${opportunities.trim()}`,
        threats.trim() && `Threats:\n${threats.trim()}`,
      ].filter(Boolean);
      return parts.length > 0 ? parts.join("\n\n") : null;
    }
    case "list":
      return block.data.items.trim() ? block.data.items.trim() : null;
    default:
      return null;
  }
}

/** Builds a plain-text summary of the real company data so Claude can
 * fact-check the student's claims against it, rather than grading in a
 * vacuum. Mirrors what's already visible on the page (availableStats). */
function buildDataContext(params: {
  symbol: string;
  companyName: string;
  price: number;
  availableStats: StatEntry[];
}): string {
  const statLines = params.availableStats
    .filter((s) => s.value !== null)
    .map((s) => `- ${s.label}: ${s.value}`)
    .join("\n");
  return `Company: ${params.companyName} (${params.symbol})\nCurrent price: $${params.price.toFixed(2)}\n\nReal financial data available to the student (source: SEC EDGAR / market data):\n${statLines || "(no fundamentals data available for this company)"}`;
}

const SYSTEM_PROMPT = `You are a sharp, honest buy-side/sell-side research mentor grading a university student's equity research report. Your job is to help the student genuinely improve — not to flatter them.

Rules:
- Judge the writing on its own merits: clarity, specificity, logical structure, and whether claims are actually supported by reasoning or evidence rather than vague generalities.
- Cross-check any factual or numerical claims in the student's writing against the real company data provided. If a claim looks wrong, unsupported, or inconsistent with the real numbers, flag it specifically in factCheckNotes — quote the claim.
- Be concrete. "Good analysis" is not useful feedback; "You claim gross margins are expanding but don't cite the actual margin trend — pull the last 2-3 years and show the direction" is useful feedback.
- Score fairly across the 0-100 range — an empty or one-sentence section should score low, not be rounded up to be kind.
- Only include sectionFeedback for blocks that actually contain student-written prose (skip anything with no meaningful text).
- Keep the tone direct but constructive — this is a student learning, not a professional being reviewed for a job.`;

/** Sends the student's written report blocks + the real company data to
 * Claude and returns a structured grade. Throws on missing API key or API
 * errors — callers (the /api/grade route) are responsible for turning
 * those into a clear message for the student rather than showing fake
 * feedback. */
export async function gradeReport(params: {
  symbol: string;
  companyName: string;
  price: number;
  rating: string;
  targetPrice: number | null;
  availableStats: StatEntry[];
  blocks: Block[];
}): Promise<GradeResult> {
  const client = getClient();

  const sections = params.blocks
    .map((b) => {
      const text = blockToText(b);
      return text ? `### ${b.title}\n${text}` : null;
    })
    .filter((s): s is string => s !== null);

  if (sections.length === 0) {
    throw new Error(
      "There's nothing written yet to grade — add some text to a Text, SWOT, or Bullet list block first."
    );
  }

  const dataContext = buildDataContext(params);
  const ratingLine = `Student's rating: ${params.rating}${
    params.targetPrice ? ` | Target price: $${params.targetPrice.toFixed(2)}` : ""
  }`;

  const userPrompt = `${dataContext}\n\n${ratingLine}\n\nThe student's written report sections:\n\n${sections.join("\n\n")}\n\nGrade this report.`;

  const stream = client.messages.stream({
    model: "claude-opus-4-6",
    max_tokens: 8000,
    thinking: { type: "adaptive" },
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userPrompt }],
    output_config: {
      format: zodOutputFormat(GradeResultSchema),
      effort: "high",
    },
  });

  const message = await stream.finalMessage();
  if (!message.parsed_output) {
    throw new Error("The AI grader didn't return a parsable result — try again.");
  }
  return message.parsed_output;
}
