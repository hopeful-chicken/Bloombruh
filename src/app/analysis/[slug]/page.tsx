import Link from "next/link";
import { notFound } from "next/navigation";
import { ANALYSIS_ENTRIES, STOCK_PITCHES } from "@/data/analysis";
import PitchToolkitGate from "@/components/research/PitchToolkitGate";
import ArticleBody from "@/components/research/ArticleBody";

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
  const writeUp = ANALYSIS_ENTRIES.find((e) => e.id === slug);
  const isPitch = STOCK_PITCHES.some((e) => e.id === slug);
  if (!writeUp && !isPitch) notFound();

  return (
    <div>
      <Link
        href="/analysis"
        className="text-xs text-muted underline decoration-dotted underline-offset-2 hover:text-accent"
      >
        ← All of My Analysis
      </Link>

      {writeUp ? (
        // Write-ups are public — real content, rendered server-side, same
        // as every other page on the site. Only stock pitches (below) are
        // gated: nothing about a pitch, not even its title, gets rendered
        // in this tree, since a server component's output ships to every
        // visitor regardless of the gate's visual state. See docs/DECISIONS.md.
        <>
          <p className="font-mono mt-4 text-[11px] text-muted">{writeUp.date}</p>
          <h1 className="font-display mt-1 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {writeUp.title}
          </h1>
          <p className="mt-1 text-sm text-muted">{writeUp.tagline}</p>
          <div className="mt-8 border-t border-border pt-6">
            <ArticleBody body={writeUp.body} chart={writeUp.chart} />
          </div>
        </>
      ) : (
        <PitchToolkitGate pitchId={slug} />
      )}
    </div>
  );
}
