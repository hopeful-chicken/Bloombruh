// Server-rendered panel for one historical hype case: real price chart,
// real computed stats per ticker, real fundamentals where they exist, an
// AI hindsight narrative (grounded, generated server-side since there's no
// period picker here — one fixed analysis per case), real retrospective
// news, and Adam's own take if he's written one. No client interactivity
// needed beyond NewsList's own "show more" pagination.

import type { HypeCase } from "@/lib/hypeCases";
import type { CaseAnalysis } from "@/lib/hypeAnalysis";
import type { NewsArticle } from "@/lib/news";
import type { HypeCommentaryEntry } from "@/data/hypeCommentary";
import { formatUSD, formatPct } from "@/lib/format";
import Stat from "@/components/Stat";
import NewsList from "@/components/pitch/NewsList";
import IndexedCaseChart from "./IndexedCaseChart";

function paragraphs(body: string): string[] {
  return body
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export default function HistoricalCaseCard({
  hypeCase,
  analysis,
  narrative,
  narrativeError,
  articles,
  commentary,
}: {
  hypeCase: HypeCase;
  analysis: CaseAnalysis;
  narrative: string | null;
  narrativeError: string | null;
  articles: NewsArticle[];
  commentary: HypeCommentaryEntry[];
}) {
  const entryCommentary = commentary
    .filter((c) => c.entryId === hypeCase.id)
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <section className="rounded-sm border border-border bg-surface/40 p-5">
      <h3 className="font-display text-lg font-semibold text-foreground">
        {hypeCase.name} <span className="font-mono text-sm font-normal text-muted">{hypeCase.era}</span>
      </h3>
      <p className="mt-1 text-sm text-muted">{hypeCase.blurb}</p>

      <div className="mt-4">
        <IndexedCaseChart
          series={analysis.tickers.map((t) => ({ symbol: t.symbol, points: t.indexedSeries }))}
        />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {analysis.tickers.map((t) => (
          <div key={t.symbol} className="rounded-lg border border-border bg-surface p-4">
            <p className="text-xs font-semibold text-foreground">
              {t.symbol} <span className="font-normal text-muted">— {t.role}</span>
            </p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <Stat
                label="Era peak"
                value={t.windowPeakPrice !== null ? formatUSD(t.windowPeakPrice) : "Unavailable"}
                caption={t.windowPeakDate}
              />
              <Stat
                label="Run-up to peak"
                value={t.runUpPercent !== null ? formatPct(t.runUpPercent, 0) : "Unavailable"}
              />
              <Stat
                label="Latest price"
                value={t.latestPrice !== null ? formatUSD(t.latestPrice) : "Unavailable"}
                caption={t.latestDate}
              />
              <Stat
                label="Vs. era peak today"
                value={t.vsPeakTodayPercent !== null ? formatPct(t.vsPeakTodayPercent, 0) : "Unavailable"}
              />
            </div>
            {!t.fundamentals && (
              <p className="mt-3 text-[11px] text-muted/70">
                No free structured fundamentals exist for this ticker&apos;s era (SEC
                XBRL data generally only goes back to ~2009–2012).
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="mt-5 border-t border-border pt-4">
        <p className="mb-2 text-[11px] uppercase tracking-widest text-muted/70">
          What happened, in hindsight: AI-generated, grounded in the real figures above and the sources below
        </p>
        {narrative ? (
          <p className="text-sm leading-relaxed text-foreground">{narrative}</p>
        ) : (
          <p className="text-sm text-muted">{narrativeError ?? "No summary available right now."}</p>
        )}
      </div>

      <div className="mt-4">
        <p className="mb-2 text-[11px] uppercase tracking-widest text-muted/70">
          Real retrospective coverage
        </p>
        <NewsList articles={articles} initialCount={4} pageSize={4} />
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
