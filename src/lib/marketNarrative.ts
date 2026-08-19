// Server-only wrapper around the Anthropic Claude API — used by the
// Markets Overview module's world-situation, sector, and private-market
// panels. Given a segment's real computed price return over a period and
// real fetched news coverage for that same period, asks Claude to write a
// short, grounded description of how it's doing and any notable recent
// developments — grounded strictly in the real return figure and articles
// handed to it, never invented. The caller (the API route) lists those same
// articles as sources underneath the generated text, same convention as
// src/lib/rateDecisionExplainer.ts, which this closely mirrors.
//
// Same paid Claude API already used by the AI report grader (grading.ts)
// and the rate-decision explainer — uses the lighter Sonnet model since
// this is short factual synthesis, not deep reasoning, and could fire for
// many segment/period combinations. Results are cached by the route
// handler so the same segment+period isn't re-generated (and re-charged)
// on every view.

import { getAiClient, AI_MODEL } from "./aiClient";
import type { NewsArticle } from "./news";

const SYSTEM_PROMPT = `You are a concise financial analyst explaining how one part of the market is doing to a finance student.

Rules:
- Write 2-4 plain sentences: describe how this segment has been performing over the given period and mention any notable recent developments, based ONLY on the real price return figure and news articles provided.
- Never invent facts, figures, deals, or statements that aren't supported by the provided return figure or articles.
- If the articles don't give enough detail on "why", say so plainly rather than guessing or padding.
- No headers, no bullet points, no markdown formatting — plain prose only.
- Don't just repeat the percent return back verbatim (the reader already sees it above) — add color and context on top of it.`;

/** Generates a short, source-grounded narrative for one market segment over
 * one period. Throws on a missing API key, no articles to ground the answer
 * in, or an API error — the caller is responsible for falling back to
 * showing just the raw source articles rather than any fabricated text. */
export async function explainMarketSegment(params: {
  label: string;
  periodPhrase: string;
  changePercent: number | null;
  articles: NewsArticle[];
}): Promise<string> {
  if (params.articles.length === 0) {
    throw new Error("No source articles available to ground a narrative.");
  }

  const client = getAiClient();

  const articleContext = params.articles
    .map((a, i) => `${i + 1}. "${a.title}" (${a.source ?? "unknown source"}, ${a.pubDate})`)
    .join("\n");

  const returnLine =
    params.changePercent === null
      ? "No computed return figure is available for this window."
      : `Real computed price return over ${params.periodPhrase}: ${params.changePercent > 0 ? "+" : ""}${params.changePercent.toFixed(1)}%.`;

  const userPrompt = `Segment: ${params.label}
${returnLine}

Real news coverage from ${params.periodPhrase}:
${articleContext}

Explain how this segment has been doing and any notable recent developments, grounded only in the figure and coverage above.`;

  const message = await client.messages.create({
    model: AI_MODEL,
    thinking: { type: "disabled" },
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
    throw new Error("The AI did not return a narrative. Try again.");
  }
  return text;
}
