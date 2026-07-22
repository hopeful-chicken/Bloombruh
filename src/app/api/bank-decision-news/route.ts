// Thin proxy route: lets the Central Bank Room's per-decision "Explain
// more" panel lazily fetch real, dated news coverage for one specific rate
// decision, plus a short AI-generated explanation of the situation and
// likely reasoning grounded in those real articles (see
// src/lib/rateDecisionExplainer.ts). Only called when a decision is
// actually expanded, not for every decision up front.

import { NextRequest, NextResponse } from "next/server";
import { getRateDecisionNews, type NewsArticle } from "@/lib/news";
import { explainRateDecision } from "@/lib/rateDecisionExplainer";

type CachedResult = {
  articles: NewsArticle[];
  explanation: string | null;
  explanationError: string | null;
};

// In-memory cache so re-expanding the same decision doesn't re-fetch news
// or re-generate (and re-charge) an AI explanation while this server
// process stays warm. This project deliberately has no database (see
// CLAUDE.md) — this is a "best effort" cache that resets on a fresh
// deploy/cold start, not a durable one, which is fine since re-generating
// occasionally is cheap and never shows stale/wrong data either way.
const cache = new Map<string, CachedResult>();

export async function GET(request: NextRequest) {
  const bank = request.nextUrl.searchParams.get("bank") ?? "";
  const date = request.nextUrl.searchParams.get("date") ?? "";
  const rate = parseFloat(request.nextUrl.searchParams.get("rate") ?? "");
  const changeBp = parseInt(request.nextUrl.searchParams.get("changeBp") ?? "", 10);
  const type = request.nextUrl.searchParams.get("type");

  if (!bank.trim() || !date.trim() || Number.isNaN(rate) || Number.isNaN(changeBp)) {
    return NextResponse.json({ error: "Invalid bank, date, rate, or changeBp" }, { status: 400 });
  }
  if (type !== "hike" && type !== "cut") {
    return NextResponse.json({ error: "Invalid decision type" }, { status: 400 });
  }

  const cacheKey = `${bank}|${date}`;
  const cached = cache.get(cacheKey);
  if (cached) return NextResponse.json(cached);

  try {
    const articles = await getRateDecisionNews(bank, date);

    let explanation: string | null = null;
    let explanationError: string | null = null;
    try {
      explanation = await explainRateDecision({
        bankName: bank,
        date,
        rate,
        changeBp,
        type,
        articles,
      });
    } catch (err) {
      // Never fabricate an explanation — if generation fails (missing key,
      // no articles, API error), the client falls back to showing just the
      // real source articles with a clear note instead.
      explanationError = err instanceof Error ? err.message : "AI explanation unavailable.";
    }

    const result: CachedResult = { articles, explanation, explanationError };
    cache.set(cacheKey, result);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Rate decision news fetch failed:", error);
    return NextResponse.json(
      { error: "Failed to load news for this decision" },
      { status: 502 }
    );
  }
}
