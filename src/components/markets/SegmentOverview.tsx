"use client";

// Shared "pick a segment, pick a period, see a chart + AI narrative + real
// news + Adam's take" panel — used for both the equity-sector section
// (Global Equities/TMT/FIG/Healthcare/...) and the private-markets section
// (Private Equity/Private Credit/Real Assets) on /markets, since the two
// are structurally identical and only differ in which segments they list
// and whether a public-market-proxy disclaimer needs to show.

import { useEffect, useState } from "react";
import PeriodSelector, { type MarketPeriod, periodPhrase } from "./PeriodSelector";
import SegmentChart from "./SegmentChart";
import SegmentNarrative from "./SegmentNarrative";
import type { MarketCommentaryEntry } from "@/data/marketCommentary";

type PickableSegment = {
  id: string;
  label: string;
  shortLabel?: string;
  tickerSymbol: string;
  proxyName: string;
  blurb: string;
};

export default function SegmentOverview({
  title,
  subtitle,
  segments,
  commentary,
  proxyDisclaimer,
}: {
  title: string;
  subtitle: string;
  segments: PickableSegment[];
  commentary: MarketCommentaryEntry[];
  proxyDisclaimer?: string;
}) {
  const [selectedId, setSelectedId] = useState(segments[0]?.id ?? "");
  const [period, setPeriod] = useState<MarketPeriod>("1M");
  const [changePercent, setChangePercent] = useState<number | null>(null);

  const selected = segments.find((s) => s.id === selectedId) ?? segments[0];

  // A fresh segment/period pick shouldn't briefly show the previous
  // selection's return figure while the new chart is still loading.
  useEffect(() => {
    setChangePercent(null);
  }, [selectedId, period]);

  if (!selected) return null;

  return (
    <section className="mt-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-mono text-sm uppercase tracking-widest text-muted">{title}</h2>
          <p className="mt-0.5 text-xs text-muted/70">{subtitle}</p>
        </div>
        <PeriodSelector value={period} onChange={setPeriod} />
      </div>

      {proxyDisclaimer && (
        <p className="mt-3 rounded-md border border-border bg-surface/60 px-3 py-2 text-xs text-muted">
          {proxyDisclaimer}
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {segments.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setSelectedId(s.id)}
            className={`rounded-md border px-3 py-1.5 text-xs ${
              s.id === selectedId
                ? "border-accent bg-accent/10 text-accent"
                : "border-border text-muted hover:border-accent hover:text-accent"
            }`}
          >
            {s.shortLabel ?? s.label}
          </button>
        ))}
      </div>

      <div className="mt-5 rounded-xl border border-border bg-surface/40 p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="text-base font-semibold text-foreground">{selected.label}</h3>
          {changePercent !== null && (
            <span
              className={`font-mono text-sm ${changePercent >= 0 ? "text-positive" : "text-negative"}`}
            >
              {changePercent > 0 ? "+" : ""}
              {changePercent.toFixed(1)}% over {periodPhrase(period)}
            </span>
          )}
        </div>
        <p className="mt-1 text-xs text-muted">{selected.blurb}</p>
        <p className="mt-0.5 text-[11px] text-muted/60">Tracked via {selected.proxyName}</p>

        <div className="mt-4">
          <SegmentChart
            key={`${selected.id}-${period}`}
            symbol={selected.tickerSymbol}
            period={period}
            onChangePercent={setChangePercent}
          />
        </div>

        <div className="mt-5 border-t border-border pt-4">
          <SegmentNarrative
            id={selected.id}
            period={period}
            changePercent={changePercent}
            commentary={commentary}
          />
        </div>
      </div>
    </section>
  );
}
