// AI summary of a stock pitch's recent real news coverage — same
// "AI synthesizes, never invents" discipline as
// src/lib/centralBankNarrative.ts's explainRegionalEconomy(), just for a
// company instead of a central bank's region. Called directly from
// src/app/analysis/[slug]/page.tsx (a server component), which is
// statically generated via generateStaticParams — so, like the rest of a
// stock pitch, this narrative is a dated snapshot fixed at build time, not
// a live feed. That's intentional, not an oversight: every pitch on this
// site already says as much about its own numbers.

import Anthropic from "@anthropic-ai/sdk";
import type { NewsArticle } from "./news";

function getClient(): Anthropic {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    throw new Error(
      "ANTHROPIC_API_KEY is not set — AI-generated pitch news summaries need the same key as the AI report grader."
    );
  }
  return new Anthropic({ apiKey: key });
}

function articleContext(articles: NewsArticle[]): string {
  return articles
    .map((a, i) => `${i + 1}. "${a.title}" (${a.source ?? "unknown source"}, ${a.pubDate})`)
    .join("\n");
}

const SYSTEM_PROMPT = `You are a concise equity analyst summarizing a company's most recent real news coverage for a finance student's own stock pitch.

Rules:
- Write 2-4 plain sentences: what's actually happened recently, based ONLY on the headlines and sources provided.
- Never invent facts, figures, deals, or events that aren't supported by the provided articles — if a headline is ambiguous, describe it cautiously rather than filling in detail that isn't there.
- If the articles are thin, repetitive, or don't add up to a clear recent story, say so plainly rather than padding it out.
- No headers, no bullet points, no markdown formatting — plain prose only.
- Don't just list the headlines back (the reader already sees those below) — synthesize what they add up to.`;

const cache = new Map<string, { narrative: string | null; narrativeError: string | null }>();

/** Generates a short, source-grounded summary of a stock pitch's recent
 * news. Falls back to a stated "no summary" error (never a fabricated
 * one) when there are no articles to ground it in, the API key is
 * missing, or the API call fails — callers show the real headlines either
 * way. Cached per pitch id since this runs at build time via
 * generateStaticParams, not per-request. */
export async function explainPitchNews(params: {
  pitchId: string;
  companyName: string;
  articles: NewsArticle[];
}): Promise<{ narrative: string | null; narrativeError: string | null }> {
  const cached = cache.get(params.pitchId);
  if (cached) return cached;

  if (params.articles.length === 0) {
    const result = { narrative: null, narrativeError: "No recent news coverage found to summarize." };
    cache.set(params.pitchId, result);
    return result;
  }

  let result: { narrative: string | null; narrativeError: string | null };
  try {
    const client = getClient();
    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 300,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Company: ${params.companyName}\n\nRecent headlines:\n${articleContext(params.articles)}`,
        },
      ],
    });
    const text = message.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("\n")
      .trim();
    result = text
      ? { narrative: text, narrativeError: null }
      : { narrative: null, narrativeError: "The AI didn't return a narrative — try again." };
  } catch (err) {
    result = {
      narrative: null,
      narrativeError: err instanceof Error ? err.message : "AI narrative unavailable.",
    };
  }

  cache.set(params.pitchId, result);
  return result;
}
