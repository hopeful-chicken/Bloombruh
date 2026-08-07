// "Recent news" block on a stock pitch — real headlines plus a short,
// source-grounded AI summary of them, same "AI synthesizes, never
// invents" discipline used everywhere else on this site. Plain server
// component (data arrives pre-fetched as props from the page, same
// pattern as MarketIntelSection.tsx) — the only client piece is NewsList
// itself, for its "show more" pagination.

import NewsList from "@/components/pitch/NewsList";
import type { NewsArticle } from "@/lib/news";

export default function PitchNewsSection({
  narrative,
  narrativeError,
  articles,
}: {
  narrative: string | null;
  narrativeError: string | null;
  articles: NewsArticle[];
}) {
  return (
    <div className="mt-8 border-t border-border pt-6">
      <p className="font-mono text-xs uppercase tracking-widest text-module-analysis">
        Recent News
      </p>
      <p className="mt-1 text-xs text-muted/70">
        Real, dated headlines: AI-summarized below, grounded strictly in the articles listed
        underneath. Fixed as of when this pitch was last built, not a live feed.
      </p>

      <div className="mt-4 rounded-lg border border-border bg-surface/40 p-4">
        <p className="mb-2 text-[11px] uppercase tracking-widest text-muted/70">
          AI summary: grounded only in the sources below
        </p>
        {narrative ? (
          <p className="text-sm leading-relaxed text-foreground">{narrative}</p>
        ) : (
          <p className="text-sm text-muted">
            {narrativeError ?? "Not enough recent coverage to summarize."}
          </p>
        )}
      </div>

      <div className="mt-4">
        <NewsList articles={articles} initialCount={5} pageSize={5} />
      </div>
    </div>
  );
}
