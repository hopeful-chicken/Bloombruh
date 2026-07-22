// Thin proxy route for the Central Bank Room's Global Overview card:
// re-fetches all 8 tracked banks' real rate data, computes the same
// hike/cut/hold summary the card itself shows (via summarizeBankRates, so
// the AI narrative below describes the exact same numbers on screen), then
// fetches period-scoped real news and asks Claude for a short grounded
// explanation of the current global rate situation. Same lazy,
// in-memory-cached pattern as /api/bank-decision-news and
// /api/market-narrative — only called when a reader picks a period on the
// Global Overview card.

import { NextRequest, NextResponse } from "next/server";
import { CENTRAL_BANKS } from "@/lib/centralBanks";
import {
  GLOBAL_RATE_RANGES,
  getCentralBankRateData,
  globalRatePeriodPhrase,
  summarizeBankRates,
  type GlobalRateRange,
} from "@/lib/centralBankRates";
import { getPeriodNews, type NewsArticle } from "@/lib/news";
import { explainGlobalRateSituation } from "@/lib/centralBankNarrative";

type CachedResult = {
  narrative: string | null;
  narrativeError: string | null;
  articles: NewsArticle[];
};

// Same "best effort, resets on cold start" in-memory cache as the other AI
// narrative routes — this project has no database (see CLAUDE.md).
const cache = new Map<GlobalRateRange, CachedResult>();

export async function GET(request: NextRequest) {
  const range = request.nextUrl.searchParams.get("range") as GlobalRateRange | null;
  const rangeSpec = GLOBAL_RATE_RANGES.find((r) => r.value === range);
  if (!range || !rangeSpec) {
    return NextResponse.json({ error: "Invalid range" }, { status: 400 });
  }

  const cached = cache.get(range);
  if (cached) return NextResponse.json(cached);

  try {
    const allBankRates = await Promise.all(CENTRAL_BANKS.map((b) => getCentralBankRateData(b.id)));
    const banks = CENTRAL_BANKS.map((b, i) => ({ id: b.id, shortName: b.shortName, data: allBankRates[i] }));
    const summaries = summarizeBankRates(banks, range);

    const hiked = summaries.filter((s) => s.changeBp > 0).length;
    const cut = summaries.filter((s) => s.changeBp < 0).length;
    const held = summaries.filter((s) => s.changeBp === 0).length;
    const periodPhrase = globalRatePeriodPhrase(range);

    const articles = await getPeriodNews(
      "global central banks interest rate decisions monetary policy",
      rangeSpec.days,
      6
    );

    let narrative: string | null = null;
    let narrativeError: string | null = null;
    if (summaries.length === 0) {
      narrativeError = "Rate data is unavailable for all tracked banks right now.";
    } else {
      try {
        narrative = await explainGlobalRateSituation({
          periodPhrase,
          hiked,
          cut,
          held,
          summaries: summaries.map((s) => ({
            shortName: s.shortName,
            currentRate: s.currentRate,
            changeBp: s.changeBp,
          })),
          articles,
        });
      } catch (err) {
        // Never fabricate a narrative — if generation fails (missing key,
        // no articles, API error), the client falls back to showing just
        // the real source articles instead.
        narrativeError = err instanceof Error ? err.message : "AI narrative unavailable.";
      }
    }

    const result: CachedResult = { narrative, narrativeError, articles };
    cache.set(range, result);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Global rate narrative fetch failed:", error);
    return NextResponse.json({ error: "Failed to load the global rate situation" }, { status: 502 });
  }
}
