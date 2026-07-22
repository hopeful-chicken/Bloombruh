// Thin proxy route for the Central Bank Room's "Markets & the economy"
// panel: given a bank id and a period, fetches real period-scoped news for
// that region and asks Claude for a short grounded narrative on the
// country's economy and stock market over that window — grounded in the
// real index return the client passes through (computed from the same
// price series the overlay chart shows) plus that news. Same lazy,
// in-memory-cached pattern as /api/global-rate-narrative and
// /api/market-narrative — only called when a reader picks a period.

import { NextRequest, NextResponse } from "next/server";
import { getCentralBank, type CentralBankId } from "@/lib/centralBanks";
import { getRegionalIndex } from "@/lib/regionalIndices";
import { getPeriodNews, type NewsArticle } from "@/lib/news";
import { explainCountrySituation } from "@/lib/centralBankNarrative";

type Period = "1W" | "1M" | "3M" | "1Y" | "MAX";
const PERIOD_DAYS_BACK: Record<Period, number | null> = {
  "1W": 7,
  "1M": 30,
  "3M": 90,
  "1Y": 365,
  MAX: null,
};
const PERIOD_PHRASE: Record<Period, string> = {
  "1W": "the past week",
  "1M": "the past month",
  "3M": "the past 3 months",
  "1Y": "the past year",
  MAX: "the full period shown",
};

type CachedResult = {
  narrative: string | null;
  narrativeError: string | null;
  articles: NewsArticle[];
};

const cache = new Map<string, CachedResult>();

export async function GET(request: NextRequest) {
  const bankId = request.nextUrl.searchParams.get("bank") ?? "";
  const period = request.nextUrl.searchParams.get("period") as Period | null;
  const changeParam = request.nextUrl.searchParams.get("indexChangePercent");
  const rateParam = request.nextUrl.searchParams.get("currentRate");

  const bank = getCentralBank(bankId);
  if (!bank || !period || !(period in PERIOD_DAYS_BACK)) {
    return NextResponse.json({ error: "Invalid bank or period" }, { status: 400 });
  }

  const cacheKey = `${bankId}|${period}`;
  const cached = cache.get(cacheKey);
  if (cached) return NextResponse.json(cached);

  const index = getRegionalIndex(bank.id as CentralBankId);
  const indexChangePercent =
    changeParam !== null && changeParam.trim() !== "" && !Number.isNaN(Number(changeParam))
      ? Number(changeParam)
      : null;
  const currentRate =
    rateParam !== null && rateParam.trim() !== "" && !Number.isNaN(Number(rateParam))
      ? Number(rateParam)
      : null;

  try {
    // Region economy + market news, scoped to the chosen period.
    const query = `${bank.region} economy stock market ${index.indexName.split(" (")[0]}`;
    const articles = await getPeriodNews(query, PERIOD_DAYS_BACK[period], 6);

    let narrative: string | null = null;
    let narrativeError: string | null = null;
    try {
      narrative = await explainCountrySituation({
        bankName: bank.name,
        region: bank.region,
        indexName: index.indexName,
        isExactIndex: index.isExactIndex,
        periodPhrase: PERIOD_PHRASE[period],
        indexChangePercent,
        currentRate,
        articles,
      });
    } catch (err) {
      narrativeError = err instanceof Error ? err.message : "AI narrative unavailable.";
    }

    const result: CachedResult = { narrative, narrativeError, articles };
    cache.set(cacheKey, result);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Country situation fetch failed:", error);
    return NextResponse.json({ error: "Failed to load the country situation" }, { status: 502 });
  }
}
