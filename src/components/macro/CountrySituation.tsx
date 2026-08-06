"use client";

// The Central Bank Room's "Markets & the economy" panel: pick a period,
// see the region's stock index charted against the bank's policy rate over
// that window, plus an AI narrative on the country's economy and market
// for the same period (grounded in real period-scoped news and the real
// index return) and the real headlines behind it. Replaces the old static
// "Economic backdrop" box with something period-interactive and paired
// with a real market chart — what the reader asked for.
//
// Same lazy-fetch-on-period-change + client-cache pattern as the Markets
// Overview's SegmentNarrative and the Global Overview narrative.

import { useEffect, useRef, useState } from "react";
import type { CentralBankId } from "@/lib/centralBanks";
import type { RateObservation } from "@/lib/centralBankRates";
import type { NewsArticle } from "@/lib/news";
import NewsList from "@/components/pitch/NewsList";
import IndexRateCompareChart, {
  windowChangePercent,
  type IndexPoint,
  type CompareRange,
} from "./IndexRateCompareChart";
import RateImpactExplainer from "./RateImpactExplainer";

const RANGES: { value: CompareRange; label: string }[] = [
  { value: "1W", label: "Week" },
  { value: "1M", label: "Month" },
  { value: "3M", label: "3 Months" },
  { value: "1Y", label: "Year" },
  { value: "MAX", label: "Max" },
];

const PERIOD_PHRASE: Record<CompareRange, string> = {
  "1W": "the past week",
  "1M": "the past month",
  "3M": "the past 3 months",
  "1Y": "the past year",
  MAX: "the full period shown",
};

type FetchResult = {
  narrative: string | null;
  narrativeError: string | null;
  articles: NewsArticle[];
};

export default function CountrySituation({
  bankId,
  bankName,
  region,
  indexName,
  proxyName,
  isExactIndex,
  currentRate,
  rateHistory,
  indexHistory,
}: {
  bankId: CentralBankId;
  bankName: string;
  region: string;
  indexName: string;
  proxyName: string;
  isExactIndex: boolean;
  currentRate: number | null;
  rateHistory: RateObservation[];
  indexHistory: IndexPoint[];
}) {
  const [range, setRange] = useState<CompareRange>("1Y");
  const [result, setResult] = useState<FetchResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const cacheRef = useRef<Map<CompareRange, FetchResult>>(new Map());

  const changePercent = windowChangePercent(indexHistory, range);

  useEffect(() => {
    const cached = cacheRef.current.get(range);
    if (cached) {
      setResult(cached);
      setLoading(false);
      setFetchError(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setFetchError(false);

    const params = new URLSearchParams({ bank: bankId, period: range });
    const cp = windowChangePercent(indexHistory, range);
    if (cp !== null) params.set("indexChangePercent", cp.toFixed(2));
    if (currentRate !== null) params.set("currentRate", String(currentRate));

    fetch(`/api/country-situation?${params.toString()}`)
      .then((res) => {
        if (!res.ok) throw new Error("Request failed");
        return res.json();
      })
      .then((body: FetchResult) => {
        if (cancelled) return;
        cacheRef.current.set(range, body);
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
    // indexHistory/currentRate are stable for a given bank page; range is
    // the only thing that should re-fire the fetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bankId, range]);

  return (
    <section className="mt-8 rounded-xl border border-border bg-surface/40 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-mono text-sm uppercase tracking-widest text-muted">
            Markets &amp; the economy
          </h2>
          <p className="mt-0.5 text-xs text-muted/70">
            {region}&apos;s stock market next to the policy rate — pick a period.
          </p>
        </div>
        <div className="flex gap-1">
          {RANGES.map((r) => (
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

      <div className="mt-4">
        <IndexRateCompareChart
          rateHistory={rateHistory}
          indexHistory={indexHistory}
          indexName={indexName}
          range={range}
        />
        <p className="mt-2 text-xs text-muted/70">
          Left axis: policy rate (%). Right axis: {indexName}
          {isExactIndex ? "" : `, tracked via ${proxyName}`}. The two lines are
          shown side by side for comparison — no correlation is implied; judge
          for yourself.
        </p>
        <RateImpactExplainer bankId={bankId} bankName={bankName} currentRate={currentRate} />
      </div>

      <div className="mt-5 border-t border-border pt-4">
        <p className="mb-2 text-[11px] uppercase tracking-widest text-muted/70">
          The situation over {PERIOD_PHRASE[range]} — AI-generated, grounded in the
          {changePercent !== null ? " real index move and " : " "}sources below
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
            {result?.narrativeError ??
              `Not enough recent coverage to summarize ${PERIOD_PHRASE[range]} yet.`}
          </p>
        )}
      </div>

      <div className="mt-4">
        <p className="mb-2 text-[11px] uppercase tracking-widest text-muted/70">
          Real coverage from {PERIOD_PHRASE[range]}
        </p>
        {loading ? (
          <p className="text-sm text-muted">Loading headlines…</p>
        ) : (
          <NewsList articles={result?.articles ?? []} initialCount={4} pageSize={4} />
        )}
      </div>
    </section>
  );
}
