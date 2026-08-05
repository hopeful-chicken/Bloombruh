// Thin proxy route for the Hype vs Fundamentals module's current-theme
// panels: given a theme id, a period, and the real per-ticker price
// returns + revenue growth the client already computed/fetched, fetches
// real period-scoped news and asks Claude for a balanced, no-verdict
// narrative (see explainCurrentHypeTheme in hypeNarrative.ts). Same lazy,
// in-memory-cached pattern as /api/market-narrative.

import { NextRequest, NextResponse } from "next/server";
import { getPeriodNews, type NewsArticle } from "@/lib/news";
import { explainCurrentHypeTheme } from "@/lib/hypeNarrative";
import { getHypeTheme } from "@/lib/hypeThemes";

type Period = "1W" | "1M" | "1Y";
const PERIOD_DAYS_BACK: Record<Period, number> = { "1W": 7, "1M": 30, "1Y": 365 };
const PERIOD_PHRASE: Record<Period, string> = {
  "1W": "the past week",
  "1M": "the past month",
  "1Y": "the past year",
};

type CachedResult = {
  narrative: string | null;
  narrativeError: string | null;
  articles: NewsArticle[];
};

const cache = new Map<string, CachedResult>();

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id") ?? "";
  const period = request.nextUrl.searchParams.get("period") as Period | null;
  const returnsParam = request.nextUrl.searchParams.get("returns"); // "SYM:12.3,SYM2:-4.5"

  const theme = getHypeTheme(id);
  if (!theme || !period || !(period in PERIOD_DAYS_BACK)) {
    return NextResponse.json({ error: "Invalid theme id or period" }, { status: 400 });
  }

  const cacheKey = `${id}|${period}`;
  const cached = cache.get(cacheKey);
  if (cached) return NextResponse.json(cached);

  const returnsBySymbol = new Map<string, number>();
  for (const pair of (returnsParam ?? "").split(",")) {
    const [sym, val] = pair.split(":");
    if (sym && val && !Number.isNaN(Number(val))) returnsBySymbol.set(sym, Number(val));
  }

  try {
    const articles = await getPeriodNews(theme.newsQuery, PERIOD_DAYS_BACK[period], 6);

    let narrative: string | null = null;
    let narrativeError: string | null = null;
    try {
      // Real revenue-growth figures are recomputed here (not trusted from
      // the client) since they're annual/fiscal-year facts, not something
      // that changes with the period selector — same real fundamentals
      // pipeline as the rest of the site.
      const { analyzeHypeTheme } = await import("@/lib/hypeAnalysis");
      const analysis = await analyzeHypeTheme(theme);

      narrative = await explainCurrentHypeTheme({
        themeName: theme.name,
        periodPhrase: PERIOD_PHRASE[period],
        tickerSummaries: analysis.tickers.map((t) => ({
          symbol: t.symbol,
          priceReturnPercent: returnsBySymbol.get(t.symbol) ?? null,
          revenueGrowthPercent: t.revenueGrowthPct,
          fiscalYear: t.fiscalYear,
        })),
        articles,
      });
    } catch (err) {
      narrativeError = err instanceof Error ? err.message : "AI narrative unavailable.";
    }

    const result: CachedResult = { narrative, narrativeError, articles };
    cache.set(cacheKey, result);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Hype theme narrative fetch failed:", error);
    return NextResponse.json({ error: "Failed to load this theme" }, { status: 502 });
  }
}
