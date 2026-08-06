"use client";

// Client panel for one current "is the narrative outrunning the
// fundamentals" theme: a period selector (week/month/year), a real price
// chart per ticker (reusing the Markets Overview's SegmentChart — same
// /api/timeseries pipeline), real latest-fiscal-year revenue growth next
// to it (a different, annual time base, labeled as such), a lazily-fetched
// AI narrative that is explicitly instructed never to render a verdict,
// real news, and Adam's own take if he's written one.

import { useEffect, useRef, useState } from "react";
import type { HypeTheme } from "@/lib/hypeThemes";
import type { ThemeAnalysis } from "@/lib/hypeAnalysis";
import type { NewsArticle } from "@/lib/news";
import type { HypeCommentaryEntry } from "@/data/hypeCommentary";
import { formatUSD, formatPct } from "@/lib/format";
import Stat from "@/components/Stat";
import NewsList from "@/components/pitch/NewsList";
import SegmentChart from "@/components/markets/SegmentChart";
import type { MarketPeriod } from "@/components/markets/PeriodSelector";

type HypePeriod = "1W" | "1M" | "1Y";
const PERIODS: { value: HypePeriod; label: string }[] = [
  { value: "1W", label: "Week" },
  { value: "1M", label: "Month" },
  { value: "1Y", label: "Year" },
];
const PERIOD_PHRASE: Record<HypePeriod, string> = {
  "1W": "the past week",
  "1M": "the past month",
  "1Y": "the past year",
};

type FetchResult = { narrative: string | null; narrativeError: string | null; articles: NewsArticle[] };

function paragraphs(body: string): string[] {
  return body
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export default function CurrentThemeCard({
  theme,
  analysis,
  commentary,
}: {
  theme: HypeTheme;
  analysis: ThemeAnalysis;
  commentary: HypeCommentaryEntry[];
}) {
  const [period, setPeriod] = useState<HypePeriod>("1M");
  const [returns, setReturns] = useState<Record<string, number | null>>({});
  const [result, setResult] = useState<FetchResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const cacheRef = useRef<Map<HypePeriod, FetchResult>>(new Map());

  // Each chart's price return arrives asynchronously (its own fetch to
  // /api/timeseries). Clear collected returns on period change so a stale
  // value left over from the previous period can't look "ready" before
  // this period's charts have actually reported in.
  useEffect(() => {
    setReturns({});
  }, [period]);

  const returnsReady = analysis.tickers.every((t) => t.symbol in returns);

  useEffect(() => {
    const cached = cacheRef.current.get(period);
    if (cached) {
      setResult(cached);
      setLoading(false);
      setFetchError(false);
      return;
    }

    // Wait for every ticker's real price return before asking for a
    // narrative. Firing early (with returns still empty) produced a
    // narrative that said price-return data was "unavailable" while the
    // stat cards right next to it already showed real numbers — found via
    // live verification of the AI & Semiconductors panel (2026-07-23).
    if (!returnsReady) {
      setLoading(true);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setFetchError(false);

    const returnsStr = Object.entries(returns)
      .filter(([, v]) => v !== null)
      .map(([k, v]) => `${k}:${v!.toFixed(2)}`)
      .join(",");
    const params = new URLSearchParams({ id: theme.id, period });
    if (returnsStr) params.set("returns", returnsStr);

    fetch(`/api/hype-theme-narrative?${params.toString()}`)
      .then((res) => {
        if (!res.ok) throw new Error("Request failed");
        return res.json();
      })
      .then((body: FetchResult) => {
        if (cancelled) return;
        cacheRef.current.set(period, body);
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
  }, [theme.id, period, returnsReady, returns]);

  const entryCommentary = commentary
    .filter((c) => c.entryId === theme.id)
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <section className="rounded-sm border border-border bg-surface/40 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-semibold text-foreground">{theme.name}</h3>
          <p className="mt-1 max-w-xl text-sm text-muted">{theme.blurb}</p>
        </div>
        <div className="flex gap-1">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => setPeriod(p.value)}
              className={`rounded-md px-2.5 py-1 font-mono text-xs transition-colors ${
                period === p.value
                  ? "bg-accent text-accent-foreground"
                  : "text-muted hover:bg-surface hover:text-foreground"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {analysis.tickers.map((t) => (
          <div key={t.symbol} className="rounded-lg border border-border bg-surface p-4">
            <p className="text-xs font-semibold text-foreground">
              {t.symbol} <span className="font-normal text-muted">— {t.role}</span>
            </p>
            <div className="mt-3">
              <SegmentChart
                key={`${t.symbol}-${period}`}
                symbol={t.symbol}
                period={period as MarketPeriod}
                onChangePercent={(cp) => setReturns((r) => ({ ...r, [t.symbol]: cp }))}
              />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <Stat
                label={`Price, ${PERIOD_PHRASE[period]}`}
                value={returns[t.symbol] != null ? formatPct(returns[t.symbol]!, 1) : "Loading…"}
              />
              <Stat
                label={t.fiscalYear ? `Revenue growth (FY${t.fiscalYear})` : "Revenue growth (latest FY)"}
                value={t.revenueGrowthPct !== null ? formatPct(t.revenueGrowthPct, 1) : "Unavailable"}
              />
              <Stat label="Price" value={t.price !== null ? formatUSD(t.price) : "Unavailable"} />
              <Stat
                label="P/E"
                value={t.valuation?.peRatio ? `${t.valuation.peRatio.toFixed(1)}x` : "Unavailable"}
              />
            </div>
          </div>
        ))}
      </div>
      <p className="mt-2 text-[11px] text-muted/70">
        Price return is over the period selected above; revenue growth is the latest
        full fiscal year — different time bases, both real, not directly comparable.
      </p>

      <div className="mt-5 border-t border-border pt-4">
        <p className="mb-2 text-[11px] uppercase tracking-widest text-muted/70">
          The evidence, both sides — AI-generated, grounded in the real figures above and the sources below (no verdict rendered)
        </p>
        {loading ? (
          <p className="text-sm text-muted">Reading recent coverage…</p>
        ) : fetchError ? (
          <p className="text-sm text-muted">
            Couldn&apos;t load a summary right now — see the real coverage below in the meantime.
          </p>
        ) : result?.narrative ? (
          <p className="text-sm leading-relaxed text-foreground">{result.narrative}</p>
        ) : (
          <p className="text-sm text-muted">
            {result?.narrativeError ?? `Not enough recent coverage to summarize ${PERIOD_PHRASE[period]} yet.`}
          </p>
        )}
      </div>

      <div className="mt-4">
        <p className="mb-2 text-[11px] uppercase tracking-widest text-muted/70">
          Real coverage from {PERIOD_PHRASE[period]}
        </p>
        {loading ? (
          <p className="text-sm text-muted">Loading headlines…</p>
        ) : (
          <NewsList articles={result?.articles ?? []} initialCount={4} pageSize={4} />
        )}
      </div>

      {entryCommentary.length > 0 && (
        <div className="mt-5 border-t border-border pt-4">
          <p className="mb-2 text-[11px] uppercase tracking-widest text-muted/70">
            Adam&apos;s take (his own opinion, not AI-generated or fetched)
          </p>
          <div className="space-y-4">
            {entryCommentary.map((c) => (
              <article key={`${c.entryId}-${c.date}-${c.title}`}>
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
    </section>
  );
}
