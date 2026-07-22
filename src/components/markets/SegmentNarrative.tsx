"use client";

// AI-generated, source-grounded narrative + real news + Adam's own
// commentary for one Markets Overview segment (world situation, an equity
// sector, or a private-market segment) at one period. Lazily fetches
// /api/market-narrative on id/period change (client-side cached in a ref so
// re-selecting an already-seen combination doesn't re-fetch), same pattern
// as the Central Bank Room's per-decision "Explain more" panel — just
// eager here instead of click-triggered, since a segment/period is already
// an explicit user choice.

import { useEffect, useRef, useState } from "react";
import type { NewsArticle } from "@/lib/news";
import type { MarketCommentaryEntry } from "@/data/marketCommentary";
import type { MarketPeriod } from "./PeriodSelector";
import { periodPhrase } from "./PeriodSelector";
import NewsList from "@/components/pitch/NewsList";

type FetchResult = {
  articles: NewsArticle[];
  narrative: string | null;
  narrativeError: string | null;
};

function paragraphs(body: string): string[] {
  return body
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export default function SegmentNarrative({
  id,
  period,
  changePercent,
  commentary,
}: {
  id: string;
  period: MarketPeriod;
  changePercent: number | null;
  commentary: MarketCommentaryEntry[];
}) {
  const [result, setResult] = useState<FetchResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const cacheRef = useRef<Map<string, FetchResult>>(new Map());

  useEffect(() => {
    const cacheKey = `${id}|${period}`;
    const cached = cacheRef.current.get(cacheKey);
    if (cached) {
      setResult(cached);
      setLoading(false);
      setFetchError(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setFetchError(false);

    const params = new URLSearchParams({ id, period });
    if (changePercent !== null) params.set("changePercent", changePercent.toFixed(2));

    fetch(`/api/market-narrative?${params.toString()}`)
      .then((res) => {
        if (!res.ok) throw new Error("Request failed");
        return res.json();
      })
      .then((body: FetchResult) => {
        if (cancelled) return;
        cacheRef.current.set(cacheKey, body);
        setResult(body);
      })
      .catch(() => {
        if (!cancelled) setFetchError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // changePercent intentionally excluded — it's a display refinement for
    // the initial narrative generation, not something that should re-fire
    // the fetch on every minor recompute.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, period]);

  const segmentCommentary = commentary
    .filter((c) => c.segmentId === id)
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="space-y-5">
      <div>
        <p className="mb-2 text-[11px] uppercase tracking-widest text-muted/70">
          AI-generated, grounded in the sources below
        </p>
        {loading ? (
          <p className="text-sm text-muted">Reading recent coverage…</p>
        ) : fetchError ? (
          <p className="text-sm text-muted">
            Couldn&apos;t load a narrative right now — see the real headlines below in the meantime.
          </p>
        ) : result?.narrative ? (
          <p className="text-sm leading-relaxed text-foreground">{result.narrative}</p>
        ) : (
          <p className="text-sm text-muted">
            {result?.narrativeError ??
              `Not enough recent coverage to summarize ${periodPhrase(period)} yet.`}
          </p>
        )}
      </div>

      <div>
        <p className="mb-2 text-[11px] uppercase tracking-widest text-muted/70">
          Real coverage from {periodPhrase(period)}
        </p>
        {loading ? (
          <p className="text-sm text-muted">Loading headlines…</p>
        ) : (
          <NewsList articles={result?.articles ?? []} initialCount={4} pageSize={4} />
        )}
      </div>

      {segmentCommentary.length > 0 && (
        <div className="border-t border-border pt-4">
          <p className="mb-2 text-[11px] uppercase tracking-widest text-muted/70">
            Adam&apos;s take (his own opinion, not AI-generated or fetched)
          </p>
          <div className="space-y-4">
            {segmentCommentary.map((c) => (
              <article key={`${c.segmentId}-${c.date}-${c.title}`}>
                <p className="font-mono text-[11px] text-muted">{c.date}</p>
                <h4 className="mt-1 text-sm font-semibold text-foreground">{c.title}</h4>
                <div className="mt-1.5 space-y-2 text-sm leading-relaxed text-muted">
                  {paragraphs(c.body).map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
