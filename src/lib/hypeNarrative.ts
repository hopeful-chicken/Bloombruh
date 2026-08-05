// Server-only wrapper around the Anthropic Claude API for the Hype vs
// Fundamentals module — same "AI synthesizes real numbers and real
// articles, never invents" pattern as every other narrative function in
// this project (rateDecisionExplainer.ts, marketNarrative.ts,
// centralBankNarrative.ts).
//
// Two functions with deliberately different guardrails, because they're
// answering different kinds of questions:
//
// 1. explainHistoricalCase() — the outcome is already known (Cisco still
//    hasn't fully recovered 25 years later; the meme-stock names mostly
//    gave back their gains). This can discuss what happened, grounded in
//    real computed run-up/drawdown figures and real retrospective
//    coverage, with the benefit of hindsight stated as hindsight.
//
// 2. explainCurrentHypeTheme() — the outcome is NOT known. This is the one
//    function in the whole project with an explicit "never render a
//    verdict" instruction: it must present real evidence on both sides
//    (what's real about the growth vs. how far the price has run) and
//    explicitly refuse to declare "this is/isn't a bubble" — that's a
//    forward-looking claim nobody can grounded-source, and asserting one
//    either way would be exactly the kind of unearned confidence this
//    project's "never invent" rule exists to prevent.

import Anthropic from "@anthropic-ai/sdk";
import type { NewsArticle } from "./news";
import type { HypeCaseId } from "./hypeCases";

function getClient(): Anthropic {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    throw new Error(
      "ANTHROPIC_API_KEY is not set — AI-generated hype/fundamentals narratives need the same key as the AI report grader."
    );
  }
  return new Anthropic({ apiKey: key });
}

function articleContext(articles: NewsArticle[]): string {
  return articles
    .map((a, i) => `${i + 1}. "${a.title}" (${a.source ?? "unknown source"}, ${a.pubDate})`)
    .join("\n");
}

const HISTORICAL_SYSTEM_PROMPT = `You are a concise financial historian explaining a well-documented historical episode of hype outrunning (or catching up with) fundamentals, to a finance student, with the benefit of hindsight.

Rules:
- Write 4-6 plain sentences: what drove the excitement, how far prices ran versus what the real numbers ultimately supported, and how it resolved — grounded ONLY in the real computed price statistics and real retrospective articles provided.
- You may state outcomes as known fact since this is history with hindsight (e.g. "the stock has still not recovered its peak") — but only facts actually supported by the figures or articles given.
- Never invent specific figures, dates, or quotes beyond what's provided.
- If the articles don't cover something, say so rather than padding.
- No headers, no bullet points, no markdown — plain prose only.
- Don't just restate the percentages verbatim (the reader sees those above) — add the story and context on top of them.`;

export async function explainHistoricalCase(params: {
  caseName: string;
  era: string;
  tickerSummaries: {
    symbol: string;
    runUpPercent: number | null;
    vsPeakTodayPercent: number | null;
    hasFundamentals: boolean;
  }[];
  articles: NewsArticle[];
}): Promise<string> {
  if (params.articles.length === 0) {
    throw new Error("No source articles available to ground a narrative.");
  }

  const client = getClient();

  const statsLines = params.tickerSummaries
    .map((t) => {
      const runUp = t.runUpPercent !== null ? `ran up ${t.runUpPercent.toFixed(0)}% to its era peak` : "run-up not computable";
      const vsPeak =
        t.vsPeakTodayPercent !== null
          ? `is now ${Math.abs(t.vsPeakTodayPercent).toFixed(0)}% ${t.vsPeakTodayPercent < 0 ? "below" : "above"} that peak`
          : "current standing vs. peak not computable";
      return `- ${t.symbol}: ${runUp}; ${vsPeak}. ${t.hasFundamentals ? "Real filed fundamentals are available for this ticker." : "No free structured fundamentals exist for this ticker's era."}`;
    })
    .join("\n");

  const userPrompt = `Case: ${params.caseName} (${params.era})

Real computed price statistics:
${statsLines}

Real retrospective coverage:
${articleContext(params.articles)}

Explain this case — what drove it and how it resolved — grounded only in the figures and coverage above.`;

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 500,
    system: HISTORICAL_SYSTEM_PROMPT,
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

// Historical cases have no period selector — there's exactly one fixed
// analysis per case — and are rendered directly from a server component
// (src/app/hype/page.tsx), same situation as centralBankNarrative.ts's
// explainRegionalEconomy(). Self-caches for the same reason: no route
// sits in front of this call site to own the cache itself.
const historicalCaseCache = new Map<
  HypeCaseId,
  { narrative: string | null; narrativeError: string | null }
>();

export async function getCachedHistoricalCaseNarrative(
  id: HypeCaseId,
  params: Parameters<typeof explainHistoricalCase>[0]
): Promise<{ narrative: string | null; narrativeError: string | null }> {
  const cached = historicalCaseCache.get(id);
  if (cached) return cached;

  let result: { narrative: string | null; narrativeError: string | null };
  try {
    const narrative = await explainHistoricalCase(params);
    result = { narrative, narrativeError: null };
  } catch (err) {
    result = { narrative: null, narrativeError: err instanceof Error ? err.message : "AI narrative unavailable." };
  }
  historicalCaseCache.set(id, result);
  return result;
}

const CURRENT_THEME_SYSTEM_PROMPT = `You are a careful, balanced financial analyst helping a finance student weigh whether a current market theme's price action is outrunning its fundamentals — a genuinely open question with no known answer yet.

Strict rules:
- Write 4-6 plain sentences presenting REAL evidence on both sides: what's genuinely real about the growth/demand (grounded only in the real revenue growth figures and real articles provided) AND how far prices have moved (grounded only in the real price return figures provided).
- You must NEVER declare or imply a verdict — never say this "is" or "is not" a bubble, never predict what will happen next. This is a forward-looking judgment nobody can ground in current data, and asserting one would be fabrication dressed as analysis.
- It is fine, and often the honest conclusion, to say the current evidence doesn't clearly point either way.
- Never invent specific figures, deals, or quotes beyond what's provided.
- If the articles don't give enough detail, say so rather than padding.
- No headers, no bullet points, no markdown — plain prose only.
- Don't just restate the percentages verbatim (the reader sees those above) — add context and the tension between them.`;

export async function explainCurrentHypeTheme(params: {
  themeName: string;
  periodPhrase: string;
  tickerSummaries: {
    symbol: string;
    priceReturnPercent: number | null;
    revenueGrowthPercent: number | null;
    fiscalYear: number | null;
  }[];
  articles: NewsArticle[];
}): Promise<string> {
  if (params.articles.length === 0) {
    throw new Error("No source articles available to ground a narrative.");
  }

  const client = getClient();

  const statsLines = params.tickerSummaries
    .map((t) => {
      const price =
        t.priceReturnPercent !== null
          ? `price ${t.priceReturnPercent > 0 ? "+" : ""}${t.priceReturnPercent.toFixed(1)}% over ${params.periodPhrase}`
          : "price return not available";
      const rev =
        t.revenueGrowthPercent !== null
          ? `latest full fiscal year (FY${t.fiscalYear}) revenue grew ${t.revenueGrowthPercent.toFixed(1)}% year-over-year`
          : "no real revenue-growth figure available";
      return `- ${t.symbol}: ${price}; ${rev}.`;
    })
    .join("\n");

  const userPrompt = `Theme: ${params.themeName}

Real current statistics (note: the price return is over ${params.periodPhrase}; the revenue growth figure is the latest full fiscal year — different time bases, not directly comparable, both real):
${statsLines}

Real recent news coverage:
${articleContext(params.articles)}

Present the real evidence on both sides of whether price action has run ahead of fundamentals here, grounded only in the figures and coverage above. Do not render a verdict.`;

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 500,
    system: CURRENT_THEME_SYSTEM_PROMPT,
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
