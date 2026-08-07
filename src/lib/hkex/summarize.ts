// Server-only wrapper around the Anthropic Claude API. Given a list of real
// fetched headlines (press releases or news), asks Claude for a short,
// strictly source-grounded recap — never asked to add outside knowledge or
// invent detail beyond what the headlines/dates/sources say.

import Anthropic from "@anthropic-ai/sdk";
import type { NewsItem } from "./news";

function getClient(): Anthropic {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    throw new Error("ANTHROPIC_API_KEY is not set. Copy .env.local.example to .env.local and add a key.");
  }
  return new Anthropic({ apiKey: key });
}

const SYSTEM_PROMPT = `You summarize a list of real, dated headlines about a company for a finance-focused reader.

Rules:
- Write 5-10 plain sentences recapping what the headlines below actually say — key events, numbers, or developments they mention.
- Ground every sentence ONLY in the headlines/sources/dates given. Never invent facts, figures, or context not present in them.
- If the headlines are thin or repetitive, say so plainly rather than padding with filler.
- No headers, no bullet points, no markdown — plain prose only.
- Don't mention "the headlines" or "the list" — just recap the content directly.`;

/** Throws if there are no items to ground a summary in, if the key is
 * missing, or on an API error — callers should fall back to showing just
 * the raw links with no summary rather than any fabricated text. */
export async function summarizeItems(params: {
  companyName: string;
  kind: "press releases" | "news coverage";
  items: NewsItem[];
}): Promise<string> {
  if (params.items.length === 0) {
    throw new Error("No items available to summarize.");
  }

  const client = getClient();

  const lines = params.items
    .map((it, i) => `${i + 1}. "${it.title}" — ${it.source || "unknown source"}, ${it.publishedAt.slice(0, 10)}`)
    .join("\n");

  const userPrompt = `Company: ${params.companyName}
Recent ${params.kind} (last ~3 months):
${lines}

Recap what these say.`;

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 500,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userPrompt }],
  });

  const text = message.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("\n")
    .trim();

  if (!text) {
    throw new Error("The AI didn't return a summary.");
  }
  return text;
}
