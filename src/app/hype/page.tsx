// The Hype vs Fundamentals module: two parts. "Historical Cases" —
// closed, well-documented episodes (dot-com, meme stocks, cannabis) shown
// with real price data, real computed run-up/drawdown stats, real
// fundamentals where free structured data exists, and an AI hindsight
// narrative. "Current Watch" — open, unresolved themes (AI/semis, quantum
// computing) shown with real price returns, real revenue growth, and an
// AI narrative explicitly instructed never to render a verdict.

import { HYPE_CASES } from "@/lib/hypeCases";
import { HYPE_THEMES } from "@/lib/hypeThemes";
import { analyzeHypeCase, analyzeHypeTheme } from "@/lib/hypeAnalysis";
import { getCachedHistoricalCaseNarrative } from "@/lib/hypeNarrative";
import { getPeriodNews } from "@/lib/news";
import { HYPE_COMMENTARY } from "@/data/hypeCommentary";
import HistoricalCaseCard from "@/components/hype/HistoricalCaseCard";
import CurrentThemeCard from "@/components/hype/CurrentThemeCard";

// Forced dynamic (server-rendered per-request, not statically prerendered)
// deliberately: this page has no searchParams/cookies dependency, so
// Next.js would otherwise happily static-optimize it — which means the
// three historical cases' AI narratives (a real, paid Claude call each)
// would fire at `next build` time, i.e. on every deploy, not on real
// visits. getCachedHistoricalCaseNarrative()'s in-memory cache already
// keeps repeat *visits* free within one server lifetime; this just makes
// sure the first fire is a real user's first real request, not a build.
export const dynamic = "force-dynamic";

export default async function HypePage() {
  // Cases (and, below, themes) are processed one at a time rather than via
  // Promise.all — each one's analyzeHypeCase/analyzeHypeTheme call already
  // fetches its tickers' SEC EDGAR fundamentals sequentially for rate-limit
  // reasons (see hypeAnalysis.ts); running multiple cases at once would
  // just recreate the same burst one layer up.
  const cases: {
    hypeCase: (typeof HYPE_CASES)[number];
    analysis: Awaited<ReturnType<typeof analyzeHypeCase>>;
    articles: Awaited<ReturnType<typeof getPeriodNews>>;
    narrative: string | null;
    narrativeError: string | null;
  }[] = [];
  for (const hypeCase of HYPE_CASES) {
    const [analysis, articles] = await Promise.all([
      analyzeHypeCase(hypeCase),
      getPeriodNews(hypeCase.newsQuery, null, 6),
    ]);
    const { narrative, narrativeError } = await getCachedHistoricalCaseNarrative(hypeCase.id, {
      caseName: hypeCase.name,
      era: hypeCase.era,
      tickerSummaries: analysis.tickers.map((t) => ({
        symbol: t.symbol,
        runUpPercent: t.runUpPercent,
        vsPeakTodayPercent: t.vsPeakTodayPercent,
        hasFundamentals: !!t.fundamentals,
      })),
      articles,
    });
    cases.push({ hypeCase, analysis, articles, narrative, narrativeError });
  }

  const themes: { theme: (typeof HYPE_THEMES)[number]; analysis: Awaited<ReturnType<typeof analyzeHypeTheme>> }[] = [];
  for (const theme of HYPE_THEMES) {
    themes.push({ theme, analysis: await analyzeHypeTheme(theme) });
  }

  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-widest text-accent">
        Hype vs Fundamentals
      </p>
      <h1 className="font-display mt-1 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        Narrative vs. numbers
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
        When does a story get ahead of the numbers behind it — and what happens
        next? Real historical cases with known outcomes, then real current themes
        where the outcome isn&apos;t known yet.
      </p>

      <section className="mt-10">
        <h2 className="font-mono text-sm uppercase tracking-widest text-muted">
          Historical Cases
        </h2>
        <p className="mt-0.5 text-xs text-muted/70">
          Closed episodes — real prices, real (where available) fundamentals, hindsight.
        </p>
        <div className="mt-4 space-y-6">
          {cases.map((c) => (
            <HistoricalCaseCard
              key={c.hypeCase.id}
              hypeCase={c.hypeCase}
              analysis={c.analysis}
              narrative={c.narrative}
              narrativeError={c.narrativeError}
              articles={c.articles}
              commentary={HYPE_COMMENTARY}
            />
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-mono text-sm uppercase tracking-widest text-muted">
          Current Watch
        </h2>
        <p className="mt-0.5 text-xs text-muted/70">
          Open questions — real current data, no verdict rendered.
        </p>
        <div className="mt-4 space-y-6">
          {themes.map((t) => (
            <CurrentThemeCard
              key={t.theme.id}
              theme={t.theme}
              analysis={t.analysis}
              commentary={HYPE_COMMENTARY}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
