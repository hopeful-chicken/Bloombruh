import Link from "next/link";
import { notFound } from "next/navigation";
import { ANALYSIS_ENTRIES, STOCK_PITCHES } from "@/data/analysis";
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
  const exists = ALL_ENTRIES.some((e) => e.id === slug);
  if (!exists) notFound();

  return (
    <div>
      <Link
        href="/analysis"
        className="text-xs text-muted underline decoration-dotted underline-offset-2 hover:text-accent"
      >
        ← All of My Analysis
      </Link>

      {/* The whole of My Analysis is gated now — nothing about this entry,
          not even its title, is rendered here. This is a server component
          whose output is shipped to every visitor regardless of the
          gate's visual state, so putting real content (including a
          title/tagline) in this tree at all would leak it — that's
          exactly what happened before this was fixed. PitchToolkitGate
          fetches everything itself, client-side, only after the code is
          verified server-side; see docs/DECISIONS.md. */}
      <PitchToolkitGate pitchId={slug} />
    </div>
  );
}
