import Link from "next/link";
import { notFound } from "next/navigation";
import { ANALYSIS_ENTRIES, STOCK_PITCHES } from "@/data/analysis";
import MarkdownContent from "@/components/research/MarkdownContent";
import PitchToolkitGate from "@/components/research/PitchToolkitGate";

const ALL_ENTRIES = [...ANALYSIS_ENTRIES, ...STOCK_PITCHES];

export function generateStaticParams() {
  return ALL_ENTRIES.map((entry) => ({ slug: entry.id }));
}

export default async function AnalysisEntryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = ALL_ENTRIES.find((e) => e.id === slug);
  if (!entry) notFound();
  const isPitch = STOCK_PITCHES.some((p) => p.id === entry.id);

  return (
    <div>
      <Link
        href="/analysis"
        className="text-xs text-muted underline decoration-dotted underline-offset-2 hover:text-accent"
      >
        ← All of My Analysis
      </Link>

      <p className="font-mono mt-4 text-[11px] text-muted">{entry.date}</p>
      <h1 className="font-display mt-1 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        {entry.title}
      </h1>
      <p className="mt-1 text-sm text-muted">{entry.tagline}</p>

      {isPitch ? (
        <PitchToolkitGate>
          <div className="mt-8 border-t border-border pt-6">
            <MarkdownContent markdown={entry.body} />
          </div>
          {entry.toolkit && (
            <div className="mt-8 border-t border-border pt-6">
              <p className="font-mono text-xs uppercase tracking-widest text-accent">
                Research Toolkit
              </p>
              <MarkdownContent markdown={entry.toolkit} />
            </div>
          )}
        </PitchToolkitGate>
      ) : (
        <div className="mt-8 border-t border-border pt-6">
          <MarkdownContent markdown={entry.body} />
        </div>
      )}
    </div>
  );
}
