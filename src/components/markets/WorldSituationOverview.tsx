"use client";

// The "what's happening in the world right now" text panel — the piece
// requested both at the top of the Markets Overview module and, in a
// compact form, on the homepage. Period selector + AI-generated narrative
// grounded in real global market/economy news + Adam's own take, same
// three-layer structure (data / AI synthesis / opinion, clearly labeled)
// as the rest of this site.

import { useState } from "react";
import Link from "next/link";
import PeriodSelector, { type MarketPeriod } from "./PeriodSelector";
import SegmentNarrative from "./SegmentNarrative";
import type { MarketCommentaryEntry } from "@/data/marketCommentary";

export default function WorldSituationOverview({
  commentary,
  compact = false,
}: {
  commentary: MarketCommentaryEntry[];
  compact?: boolean;
}) {
  const [period, setPeriod] = useState<MarketPeriod>("1M");

  return (
    <section className="rounded-xl border border-border bg-surface/40 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-mono text-sm uppercase tracking-widest text-muted">
            Global Overview
          </h2>
          <p className="mt-0.5 text-xs text-muted/70">
            How the world&apos;s markets and economy are doing right now.
          </p>
        </div>
        <PeriodSelector value={period} onChange={setPeriod} />
      </div>

      <div className="mt-4">
        <SegmentNarrative id="world" period={period} changePercent={null} commentary={commentary} />
      </div>

      {compact && (
        <Link href="/markets" className="mt-4 inline-block text-xs text-accent hover:underline">
          Open the full Markets Overview, by sector and private markets →
        </Link>
      )}
    </section>
  );
}
