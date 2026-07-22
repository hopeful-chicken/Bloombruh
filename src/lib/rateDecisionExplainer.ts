// Server-only wrapper around the Anthropic Claude API — used only by the
// Central Bank Room's per-decision "Explain more" panel. Given a rate
// decision's real, dated news coverage (fetched via Google News RSS, see
// getRateDecisionNews in src/lib/news.ts), asks Claude to write a short,
// grounded explanation of the situation and the likely reasoning behind
// that specific move — grounded strictly in the real articles handed to
// it, never invented. The caller (the API route) lists those same articles
// as sources underneath the generated text, so nothing here is presented
// as fact without a real, clickable source next to it.
//
// This is the same paid Claude API already used by the AI report grader
// (src/lib/grading.ts) — it costs a small amount per call on your own
// Anthropic key, confirmed as an acceptable tradeoff since this only fires
// when a student explicitly clicks to expand one specific decision. Uses
// the lighter Sonnet model rather than Opus (grading.ts's choice) since
// this is a short, low-effort factual synthesis task that could be called
// far more often than grading is — cost-conscious rather than needing
// grading's deeper reasoning. Results are cached by the route handler so
// the same decision isn't re-generated (and re-charged) on every view.

import Anthropic from "@anthropic-ai/sdk";
import type { NewsArticle } from "./news";

function getClient(): Anthropic {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    throw new Error(
      "ANTHROPIC_API_KEY is not set — AI-generated decision explanations need the same key as the AI report grader."
    );
  }
  return new Anthropic({ apiKey: key });
}

const SYSTEM_PROMPT = `You are a concise financial analyst explaining one specific central bank interest rate decision to a finance student.

Rules:
- Write 2-4 plain sentences: briefly describe the economic situation at the time and the likely reasoning behind this specific move, based ONLY on the real news articles provided.
- Never invent facts, quotes, figures, or officials' statements that aren't supported by the provided articles.
- If the articles don't give enough detail to explain the "why", say so plainly rather than guessing or padding.
- No headers, no bullet points, no markdown formatting — plain prose only.
- Don't just repeat the rate figure or date back verbatim (the reader already sees those) — focus on the economic context and reasoning.`;

/** Generates a short, source-grounded explanation of one rate decision.
 * Throws on a missing API key, no articles to ground the answer in, or an
 * API error — the caller is responsible for falling back to showing just
 * the raw source articles rather than any fabricated text. */
export async function explainRateDecision(params: {
  bankName: string;
  date: string;
  rate: number;
  changeBp: number;
  type: "hike" | "cut";
  articles: NewsArticle[];
}): Promise<string> {
  if (params.articles.length === 0) {
    throw new Error("No source articles available to ground an explanation.");
  }

  const client = getClient();

  const articleContext = params.articles
    .map((a, i) => `${i + 1}. "${a.title}" (${a.source ?? "unknown source"}, ${a.pubDate})`)
    .join("\n");

  const userPrompt = `${params.bankName} ${params.type === "hike" ? "raised" : "cut"} its policy rate to ${params.rate}% on ${params.date} (${params.changeBp > 0 ? "+" : ""}${params.changeBp}bp move).

Real news coverage from around this decision:
${articleContext}

Explain the situation and the likely reasoning for this specific move, grounded only in the coverage above.`;

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 400,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userPrompt }],
  });

  const text = message.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("\n")
    .trim();

  if (!text) {
    throw new Error("The AI didn't return an explanation — try again.");
  }
  return text;
}
