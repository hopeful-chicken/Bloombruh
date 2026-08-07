"use client";

// A "global view" card at the top of the Central Bank Room: instead of only
// showing one bank at a time, this shows every tracked bank side by side —
// current rate, how much it's moved over a chosen period, and how many
// decisions happened in that window — plus real news links for context.
//
// Everything shown here is computed directly from the same real history
// each bank's own page already fetches (nothing new is invented): the "X
// hiked / Y cut / Z held steady" summary and each bank's bp change are plain
// arithmetic over real observations, not an AI-generated take. The period
// selector (Day/Week/Month/3 Months/Year/Max) mirrors the zoom buttons
// already used on each bank's own rate chart, so the interaction pattern is
// familiar.

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { CentralBankId } from "@/lib/centralBanks";
import {
  GLOBAL_RATE_RANGES,
  globalRatePeriodPhrase,
  summarizeBankRates,
  type CentralBankRateData,
  type GlobalRateRange,
} from "@/lib/centralBankRates";
import type { NewsArticle } from "@/lib/news";
import NewsList from "@/components/pitch/NewsList";

type NarrativeResult = {
  narrative: string | null;
  narrativeError: string | null;
  articles: NewsArticle[];
};

export default function GlobalRatesOverview({
  banks,
  news,
}: {
  banks: { id: CentralBankId; shortName: string; data: CentralBankRateData | null }[];
  news: NewsArticle[];
}) {
  const [range, setRange] = useState<GlobalRateRange>("3M");
  const [narrativeResult, setNarrativeResult] = useState<NarrativeResult | null>(null);
  const [narrativeLoading, setNarrativeLoading] = useState(true);
  const [narrativeFetchError, setNarrativeFetchError] = useState(false);
  const narrativeCacheRef = useRef<Map<string, NarrativeResult>>(new Map());

  const summaries = useMemo(() => summarizeBankRates(banks, range), [banks, range]);

  const hiked = summaries.filter((s) => s.changeBp > 0).length;
  const cut = summaries.filter((s) => s.changeBp < 0).length;
  const held = summaries.filter((s) => s.changeBp === 0).length;
  const periodPhrase = globalRatePeriodPhrase(range);

  useEffect(() => {
    const cached = narrativeCacheRef.current.get(range);
    if (cached) {
      setNarrativeResult(cached);
      setNarrativeLoading(false);
      setNarrativeFetchError(false);
      return;
    }

    let cancelled = false;
    setNarrativeLoading(true);
    setNarrativeFetchError(false);

    fetch(`/api/global-rate-narrative?range=${range}`)
      .then((res) => {
        if (!res.ok) throw new Error("Request failed");
        return res.json();
      })
      .then((body: NarrativeResult) => {
        if (cancelled) return;
        narrativeCacheRef.current.set(range, body);
        setNarrativeResult(body);
      })
      .catch(() => {
        if (!cancelled) setNarrativeFetchError(true);
      })
      .finally(() => {
        if (!cancelled) setNarrativeLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [range]);

  // The period-scoped articles behind the AI narrative are a better match
  // for the currently selected range than the fixed set fetched once on
  // page load — use them once available, falling back to the original
  // server-fetched `news` prop while loading or if the fetch fails.
  const displayedNews =
    narrativeResult && narrativeResult.articles.length > 0 ? narrativeResult.articles : news;

  return (
    <section className="mb-8 rounded-sm border border-border bg-surface/40 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-mono text-sm uppercase tracking-widest text-muted">
            Global Overview
          </h2>
          <p className="mt-0.5 text-xs text-muted/70">
            All tracked central banks, side by side.
          </p>
        </div>
        <div className="flex gap-1">
          {GLOBAL_RATE_RANGES.map((r) => (
            <button
              key={r.value}
              type="button"
              onClick={() => setRange(r.value)}
              className={`rounded-md px-2.5 py-1 font-mono text-xs transition-colors ${
                range === r.value
                  ? "bg-module-macro text-accent-foreground"
                  : "text-muted hover:bg-surface hover:text-foreground"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {summaries.length === 0 ? (
        <p className="mt-4 text-sm text-muted">
          Rate data is unavailable for all tracked banks right now. Try again
          shortly.
        </p>
      ) : (
        <>
          <p className="mt-3 text-sm text-foreground">
            Over {periodPhrase}:{" "}
            <span className="font-semibold text-negative">{hiked} hiked</span>
            {", "}
            <span className="font-semibold text-positive">{cut} cut</span>
            {", and "}
            <span className="font-semibold">{held} held steady</span>
            {" "}across the {summaries.length} bank{summaries.length === 1 ? "" : "s"}{" "}
            tracked here.
          </p>

          <div className="mt-4 rounded-lg border border-border bg-surface/60 p-4">
            <p className="mb-2 text-[11px] uppercase tracking-widest text-muted/70">
              The situation, AI-generated and grounded in the real numbers above and the sources below
            </p>
            {narrativeLoading ? (
              <p className="text-sm text-muted">Reading recent coverage…</p>
            ) : narrativeFetchError ? (
              <p className="text-sm text-muted">
                Could not load a summary right now. See the real coverage below in the meantime.
              </p>
            ) : narrativeResult?.narrative ? (
              <p className="text-sm leading-relaxed text-foreground">{narrativeResult.narrative}</p>
            ) : (
              <p className="text-sm text-muted">
                {narrativeResult?.narrativeError ?? `Not enough recent coverage to summarize ${periodPhrase} yet.`}
              </p>
            )}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {summaries.map((s) => (
              <Link
                key={s.id}
                href={`/macro?bank=${s.id}`}
                className="rounded-lg border border-border bg-surface p-3 transition-colors hover:border-accent"
              >
                <p className="text-xs font-semibold text-foreground">{s.shortName}</p>
                <p className="mt-1 font-mono text-lg text-foreground">
                  {s.currentRate}%
                </p>
                <p
                  className={`mt-0.5 text-xs font-mono ${
                    s.changeBp > 0
                      ? "text-negative"
                      : s.changeBp < 0
                        ? "text-positive"
                        : "text-muted"
                  }`}
                >
                  {s.changeBp > 0 ? "+" : ""}
                  {s.changeBp}bp
                  {s.decisionsInWindow > 0 &&
                    ` · ${s.decisionsInWindow} move${s.decisionsInWindow === 1 ? "" : "s"}`}
                </p>
                <p className="mt-0.5 text-[10px] text-muted/70">As of {s.asOfDate}</p>
              </Link>
            ))}
          </div>
        </>
      )}

      {displayedNews.length > 0 && (
        <div className="mt-5 border-t border-border pt-4">
          <p className="mb-2 text-[11px] uppercase tracking-widest text-muted/70">
            Real coverage from {periodPhrase}
          </p>
          <NewsList articles={displayedNews} initialCount={4} pageSize={4} />
        </div>
      )}
    </section>
  );
}
