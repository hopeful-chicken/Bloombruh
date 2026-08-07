import MarkdownContent from "./MarkdownContent";
import AnalysisPriceChart from "./AnalysisPriceChart";
import { extractSections } from "@/lib/extractSections";
import type { AnalysisChart } from "@/data/analysis";

// Entries can drop this literal token into their markdown body to place the
// price chart inline (e.g. right after "the chart below" is mentioned)
// instead of always appending it after the full body.
const CHART_MARKER = "{{CHART}}";

function ChartSplitBody({ body, chart }: { body: string; chart?: AnalysisChart | null }) {
  if (chart && body.includes(CHART_MARKER)) {
    return (
      <>
        {body.split(CHART_MARKER).map((part, i) => (
          <div key={i}>
            {i > 0 && <AnalysisPriceChart chart={chart} />}
            <MarkdownContent markdown={part} />
          </div>
        ))}
      </>
    );
  }
  return (
    <>
      <MarkdownContent markdown={body} />
      {chart && <AnalysisPriceChart chart={chart} />}
    </>
  );
}

// Long write-ups and pitches both get a section nav: a horizontally
// scrolling row of pills above the text on mobile, a sticky list beside it
// on desktop. Built from the raw markdown's ## headings, so it stays in
// sync with the piece automatically instead of needing to be hand-maintained.
export default function ArticleBody({ body, chart }: { body: string; chart?: AnalysisChart | null }) {
  const sections = extractSections(body);

  if (sections.length < 2) {
    // Not worth a nav for a piece with only one or zero real sections.
    return <ChartSplitBody body={body} chart={chart} />;
  }

  return (
    <div className="lg:grid lg:grid-cols-[1fr_180px] lg:items-start lg:gap-10">
      <nav
        aria-label="Sections"
        className="sticky top-16 z-10 -mx-4 mb-6 overflow-x-auto border-b border-border bg-background/95 px-4 py-2 backdrop-blur lg:hidden [&::-webkit-scrollbar]:hidden"
      >
        <div className="flex w-max gap-2">
          {sections.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="whitespace-nowrap rounded-full border border-border bg-surface/60 px-3 py-1.5 text-xs text-muted hover:border-accent/60 hover:text-accent"
            >
              {s.title}
            </a>
          ))}
        </div>
      </nav>

      <div className="min-w-0">
        <ChartSplitBody body={body} chart={chart} />
      </div>

      <nav aria-label="Sections" className="hidden lg:sticky lg:top-24 lg:block lg:self-start">
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted">Sections</p>
        <ul className="mt-2 space-y-1 border-l border-border pl-3">
          {sections.map((s) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                className="block py-0.5 text-xs leading-snug text-muted hover:text-accent"
              >
                {s.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
