// Thin proxy route for the Markets Overview module: given a segment id
// (a world-situation panel, an equity sector, or a private-market segment)
// and a period, lazily fetches real, period-scoped news coverage plus a
// short AI-generated narrative grounded in that coverage and the real
// computed price return the client already has (see
// src/lib/marketNarrative.ts). Only called when a reader actually selects
// a segment/period, not for every combination up front — same lazy,
// in-memory-cached pattern as /api/bank-decision-news.

import { NextRequest, NextResponse } from "next/server";
import { getPeriodNews, type NewsArticle } from "@/lib/news";
import { explainMarketSegment } from "@/lib/marketNarrative";
import { MARKET_SECTORS } from "@/lib/marketSectors";
import { PRIVATE_MARKET_SEGMENTS } from "@/lib/privateMarketSegments";

type Period = "1W" | "1M" | "1Y" | "5Y" | "MAX";
const PERIOD_DAYS_BACK: Record<Period, number | null> = {
  "1W": 7,
  "1M": 30,
  "1Y": 365,
  "5Y": 1825,
  MAX: null,
};
const PERIOD_PHRASE: Record<Period, string> = {
  "1W": "the past week",
  "1M": "the past month",
  "1Y": "the past year",
  "5Y": "the past 5 years",
  MAX: "the full available history",
};

function segmentInfo(id: string): { label: string; newsQuery: string } | null {
  if (id === "world") {
    return {
      label: "Global markets",
      newsQuery: "global stock market economy outlook",
    };
  }
  const sector = MARKET_SECTORS.find((s) => s.id === id);
  if (sector) return { label: sector.label, newsQuery: sector.newsQuery };
  const privateSegment = PRIVATE_MARKET_SEGMENTS.find((s) => s.id === id);
  if (privateSegment) return { label: privateSegment.label, newsQuery: privateSegment.newsQuery };
  return null;
}

type CachedResult = {
  articles: NewsArticle[];
  narrative: string | null;
  narrativeError: string | null;
};

// Same "best effort, resets on cold start" in-memory cache as
// /api/bank-decision-news — this project has no database (see CLAUDE.md).
const cache = new Map<string, CachedResult>();

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id") ?? "";
  const period = request.nextUrl.searchParams.get("period") as Period | null;
  const changePercentParam = request.nextUrl.searchParams.get("changePercent");

  const info = segmentInfo(id);
  if (!info || !period || !(period in PERIOD_DAYS_BACK)) {
    return NextResponse.json({ error: "Invalid segment id or period" }, { status: 400 });
  }

  const cacheKey = `${id}|${period}`;
  const cached = cache.get(cacheKey);
  if (cached) return NextResponse.json(cached);

  const changePercent =
    changePercentParam !== null && changePercentParam.trim() !== "" && !Number.isNaN(Number(changePercentParam))
      ? Number(changePercentParam)
      : null;

  try {
    const articles = await getPeriodNews(info.newsQuery, PERIOD_DAYS_BACK[period], 6);

    let narrative: string | null = null;
    let narrativeError: string | null = null;
    try {
      narrative = await explainMarketSegment({
        label: info.label,
        periodPhrase: PERIOD_PHRASE[period],
        changePercent,
        articles,
      });
    } catch (err) {
      // Never fabricate a narrative — if generation fails (missing key, no
      // articles, API error), the client falls back to showing just the
      // real source articles with a clear note instead.
      narrativeError = err instanceof Error ? err.message : "AI narrative unavailable.";
    }

    const result: CachedResult = { articles, narrative, narrativeError };
    cache.set(cacheKey, result);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Market narrative fetch failed:", error);
    return NextResponse.json({ error: "Failed to load news for this segment" }, { status: 502 });
  }
}
