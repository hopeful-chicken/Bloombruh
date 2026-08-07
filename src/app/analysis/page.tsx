import AnalysisIndexGate from "@/components/research/AnalysisIndexGate";
import AnalysisEntryRow from "@/components/research/AnalysisEntryRow";
import { ANALYSIS_ENTRIES } from "@/data/analysis";

// Write-ups are public — real data imported and rendered directly, right
// here, server-side. Stock pitches and the leads list are still gated:
// AnalysisIndexGate fetches those client-side, only after the code is
// verified server-side. See docs/DECISIONS.md for why the split works this
// way now instead of everything sitting behind one gate.
export default function AnalysisPage() {
  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-widest text-module-analysis">My Analysis</p>
      <h1 className="font-display mt-1 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        The Feed
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
        Most of what actually reaches me isn&apos;t a newspaper. It&apos;s my feed: a clip, a
        headline, a 20-second video between everything else on Instagram. I scroll past almost
        all of it. This is what I stopped on, the ones I went and actually worked out properly.
      </p>

      <section className="mt-10">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">Write-Ups</h2>
        <div className="mt-3 space-y-2.5">
          {ANALYSIS_ENTRIES.map((entry) => (
            <AnalysisEntryRow key={entry.id} entry={entry} />
          ))}
        </div>
      </section>

      <AnalysisIndexGate />
    </div>
  );
}
