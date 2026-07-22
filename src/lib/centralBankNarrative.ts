// Server-only wrapper around the Anthropic Claude API — two new Central
// Bank Room narratives, both following the same "AI synthesizes, never
// invents" pattern already used by src/lib/rateDecisionExplainer.ts:
//
// 1. explainGlobalRateSituation() — the Global Overview card's "why do
//    rates look like this right now, across every tracked bank" summary.
//    Grounded in the real per-bank hike/cut/hold counts and bp changes
//    already computed by summarizeBankRates() (see centralBankRates.ts)
//    plus real fetched news. Pure function — its caller,
//    /api/global-rate-narrative, owns the in-memory cache, same as
//    /api/bank-decision-news does for explainRateDecision().
//
// 2. explainRegionalEconomy() — a short "economic backdrop" for one bank's
//    region, shown before that bank's rate-decision timeline. Grounded in
//    the bank's real current rate/last move plus real fetched news about
//    that region's economy. Unlike (1), this is called directly from
//    src/app/macro/page.tsx (a server component, not a route), so it owns
//    a small in-memory cache itself, keyed by bank id — same best-effort,
//    resets-on-cold-start convention used everywhere else in this project
//    (no database — see CLAUDE.md), just placed here instead of in a route
//    since there is no route in front of this call site.

import Anthropic from "@anthropic-ai/sdk";
import type { CentralBankId } from "./centralBanks";
import type { NewsArticle } from "./news";

function getClient(): Anthropic {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    throw new Error(
      "ANTHROPIC_API_KEY is not set — AI-generated central bank narratives need the same key as the AI report grader."
    );
  }
  return new Anthropic({ apiKey: key });
}

function articleContext(articles: NewsArticle[]): string {
  return articles
    .map((a, i) => `${i + 1}. "${a.title}" (${a.source ?? "unknown source"}, ${a.pubDate})`)
    .join("\n");
}

const GLOBAL_SYSTEM_PROMPT = `You are a concise macro analyst explaining the current global central bank policy situation to a finance student.

Rules:
- Write 3-5 plain sentences: describe why rates across the tracked central banks are where they are right now, what's happening, and what the recent hikes/cuts/holds suggest — based ONLY on the real hike/cut/hold counts, per-bank figures, and news articles provided.
- Never invent facts, figures, or officials' statements that aren't supported by the provided data or articles.
- If the articles don't give enough detail to explain "why", say so plainly rather than guessing or padding.
- No headers, no bullet points, no markdown formatting — plain prose only.
- Don't just restate the hike/cut/hold counts verbatim (the reader already sees those above) — add context and reasoning on top of them.`;

/** Generates a short, source-grounded narrative on the current global
 * central bank rate picture. Throws on a missing API key, no articles to
 * ground the answer in, or an API error — the caller falls back to
 * showing just the real source articles instead of any fabricated text. */
export async function explainGlobalRateSituation(params: {
  periodPhrase: string;
  hiked: number;
  cut: number;
  held: number;
  summaries: { shortName: string; currentRate: number; changeBp: number }[];
  articles: NewsArticle[];
}): Promise<string> {
  if (params.articles.length === 0) {
    throw new Error("No source articles available to ground a narrative.");
  }

  const client = getClient();

  const bankLines = params.summaries
    .map(
      (s) =>
        `- ${s.shortName}: ${s.currentRate}% (${s.changeBp > 0 ? "+" : ""}${s.changeBp}bp over ${params.periodPhrase})`
    )
    .join("\n");

  const userPrompt = `Over ${params.periodPhrase}, across the tracked central banks: ${params.hiked} hiked, ${params.cut} cut, ${params.held} held steady.

Per-bank current rate and move:
${bankLines}

Real news coverage from ${params.periodPhrase}:
${articleContext(params.articles)}

Explain the current global central bank rate situation, grounded only in the figures and coverage above.`;

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 500,
    system: GLOBAL_SYSTEM_PROMPT,
    messages: [{ role: "user", content: userPrompt }],
  });

  const text = message.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("\n")
    .trim();

  if (!text) {
    throw new Error("The AI didn't return a narrative — try again.");
  }
  return text;
}

const REGIONAL_SYSTEM_PROMPT = `You are a concise macro analyst giving a finance student quick, simple economic context for one region, right before they look at that region's central bank rate-decision history.

Rules:
- Write 2-4 short, simple sentences: the current economic situation in this region (growth, inflation, jobs — whichever the coverage actually discusses) and how it's been evolving recently, based ONLY on the real news articles provided.
- Keep it simple and plain — this is context-setting, not a deep analysis.
- Never invent facts, figures, or data points that aren't supported by the provided articles.
- If the articles don't give enough detail, say so plainly rather than guessing or padding.
- No headers, no bullet points, no markdown formatting — plain prose only.`;

const regionalEconomyCache = new Map<CentralBankId, { narrative: string | null; narrativeError: string | null }>();

/** Generates a short, source-grounded "economic backdrop" for one bank's
 * region. Self-caching (see file header) — never throws; on failure it
 * returns a null narrative plus a plain-English reason, so the page can
 * show a graceful fallback instead of blocking or crashing. */
export async function explainRegionalEconomy(params: {
  bankId: CentralBankId;
  bankName: string;
  region: string;
  currentRate: number | null;
  recentChangeBp: number | null;
  articles: NewsArticle[];
}): Promise<{ narrative: string | null; narrativeError: string | null }> {
  const cached = regionalEconomyCache.get(params.bankId);
  if (cached) return cached;

  if (params.articles.length === 0) {
    const result = { narrative: null, narrativeError: "No recent regional economic coverage found to summarize." };
    regionalEconomyCache.set(params.bankId, result);
    return result;
  }

  let result: { narrative: string | null; narrativeError: string | null };
  try {
    const client = getClient();

    const rateLine =
      params.currentRate === null
        ? ""
        : `${params.bankName}'s current policy rate is ${params.currentRate}%${
            params.recentChangeBp !== null
              ? ` (most recent move: ${params.recentChangeBp > 0 ? "+" : ""}${params.recentChangeBp}bp)`
              : ""
          }.`;

    const userPrompt = `Region: ${params.region} (covered by ${params.bankName}). ${rateLine}

Real recent news coverage on this region's economy:
${articleContext(params.articles)}

Give simple, short economic context for this region right now and how it's been evolving, grounded only in the coverage above.`;

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 350,
      system: REGIONAL_SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
    });

    const text = message.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("\n")
      .trim();

    result = text
      ? { narrative: text, narrativeError: null }
      : { narrative: null, narrativeError: "The AI didn't return a summary." };
  } catch (err) {
    result = {
      narrative: null,
      narrativeError: err instanceof Error ? err.message : "AI economic summary unavailable.",
    };
  }

  regionalEconomyCache.set(params.bankId, result);
  return result;
}

const COUNTRY_SITUATION_SYSTEM_PROMPT = `You are a concise macro analyst explaining a country's economic and stock-market situation over a specific period to a finance student who is looking at a chart of that country's stock index next to its central bank policy rate.

Rules:
- Write 3-5 plain sentences covering the period given: what happened in the economy (growth, inflation, jobs), how the stock market did, and — only if the real coverage supports it — whether the central bank's rate stance and the market seemed to move together or apart over that window.
- Ground everything ONLY in the real stock-index return figure and the real news articles provided. Never invent facts, figures, deals, or officials' statements.
- Be careful and honest about correlation: do NOT claim the rate and the market are correlated (or not) unless the return figure and coverage actually support it — a single period is weak evidence, and you can say the relationship isn't clear from this window.
- If the coverage is too thin to say much, say so plainly rather than padding.
- No headers, no bullet points, no markdown — plain prose only.
- Don't just restate the index return number (the reader sees it above) — add context and reasoning on top of it.`;

/** Generates a period-scoped narrative on one country's economy and stock
 * market, for the Central Bank Room's "Markets & the economy" panel.
 * Grounded strictly in the real index return over the period plus real
 * period-scoped news. Pure function — its caller (/api/country-situation)
 * owns the cache, same as explainGlobalRateSituation. Throws on missing
 * key / no articles / API error so the caller can fall back to showing
 * just the real sources. */
export async function explainCountrySituation(params: {
  bankName: string;
  region: string;
  indexName: string;
  isExactIndex: boolean;
  periodPhrase: string;
  indexChangePercent: number | null;
  currentRate: number | null;
  articles: NewsArticle[];
}): Promise<string> {
  if (params.articles.length === 0) {
    throw new Error("No source articles available to ground a narrative.");
  }

  const client = getClient();

  const indexLine =
    params.indexChangePercent === null
      ? `No computed return is available for ${params.indexName} over this window.`
      : `${params.indexName}${params.isExactIndex ? "" : " (broad-market proxy)"} moved ${
          params.indexChangePercent > 0 ? "+" : ""
        }${params.indexChangePercent.toFixed(1)}% over ${params.periodPhrase}.`;

  const rateLine =
    params.currentRate === null
      ? ""
      : ` ${params.bankName}'s current policy rate is ${params.currentRate}%.`;

  const userPrompt = `Country/region: ${params.region} (central bank: ${params.bankName}).
${indexLine}${rateLine}

Real news coverage from ${params.periodPhrase}:
${articleContext(params.articles)}

Explain this country's economic and stock-market situation over ${params.periodPhrase}, grounded only in the figure and coverage above. Be honest about whether the rate and market relationship is actually visible in this window.`;

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 500,
    system: COUNTRY_SITUATION_SYSTEM_PROMPT,
    messages: [{ role: "user", content: userPrompt }],
  });

  const text = message.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("\n")
    .trim();

  if (!text) {
    throw new Error("The AI didn't return a narrative — try again.");
  }
  return text;
}
