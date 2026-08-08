import type { ReactNode } from "react";
import MarkdownContent from "./MarkdownContent";
import AnalysisPriceChart from "./AnalysisPriceChart";
import { extractSections } from "@/lib/extractSections";
import type { AnalysisChart } from "@/data/analysis";

// Entries can drop tokens like {{CHART}} or {{SOME_NAME}} into their
// markdown body to place rich content inline, right where the prose refers
// to it, instead of always appending everything after the full text.
// {{CHART}} is built in (renders the entry's own AnalysisChart, if any);
// any other {{TOKEN}} is looked up in the `blocks` map, which the page
// component supplies — real React content (charts, images) can't live in
// analysis.ts itself, since that's a plain data file, not JSX.
const MARKER_RE = /\{\{([A-Z0-9_]+)\}\}/g;

function ChartSplitBody({
  body,
  chart,
  blocks,
}: {
  body: string;
  chart?: AnalysisChart | null;
  blocks?: Record<string, ReactNode>;
}) {
  const parts = body.split(MARKER_RE);
  // String.split with a capturing group interleaves the token names between
  // the surrounding text chunks: [text, token, text, token, ..., text].
  if (parts.length === 1) return <MarkdownContent markdown={body} />;

  return (
    <>
      {parts.map((part, i) => {
        if (i % 2 === 0) {
          return part ? <MarkdownContent key={i} markdown={part} /> : null;
        }
        if (part === "CHART") {
          return chart ? <AnalysisPriceChart key={i} chart={chart} /> : null;
        }
        return blocks?.[part] ? <div key={i}>{blocks[part]}</div> : null;
      })}
    </>
  );
}

// Long write-ups and pitches both get a section nav: a horizontally
// scrolling row of pills above the text on mobile, a sticky list beside it
// on desktop. Built from the raw markdown's ## headings, so it stays in
// sync with the piece automatically instead of needing to be hand-maintained.
export default function ArticleBody({
  body,
  chart,
  blocks,
}: {
  body: string;
  chart?: AnalysisChart | null;
  blocks?: Record<string, ReactNode>;
}) {
  const sections = extractSections(body);

  if (sections.length < 2) {
    // Not worth a nav for a piece with only one or zero real sections.
    // Capped width even without a sidebar — otherwise body text stretches
    // to the full page shell's width, which is too wide to read comfortably.
    return (
      <div className="max-w-4xl">
        <ChartSplitBody body={body} chart={chart} blocks={blocks} />
      </div>
    );
  }

  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,56rem)_180px] lg:items-start lg:gap-10">
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
        <ChartSplitBody body={body} chart={chart} blocks={blocks} />
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
