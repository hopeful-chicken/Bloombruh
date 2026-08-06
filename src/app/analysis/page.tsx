import AnalysisIndexGate from "@/components/research/AnalysisIndexGate";

// Deliberately no entry data imported or rendered here — this is a server
// component, and its output ships to every visitor regardless of the
// gate's visual state. AnalysisIndexGate fetches the real listing itself,
// client-side, only after the code is verified server-side. See
// docs/DECISIONS.md for the incident that made this the rule for
// everything under /analysis, not just the pitch detail pages.
export default function AnalysisPage() {
  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-widest text-module-analysis">My Analysis</p>
      <h1 className="font-display mt-1 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        The Feed
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
        Most of what actually reaches me isn&apos;t a newspaper — it&apos;s my feed: a clip, a
        headline, a 20-second video between everything else on Instagram. I scroll past almost
        all of it. This is what I stopped on — the ones I went and actually worked out properly.
      </p>

      <AnalysisIndexGate />
    </div>
  );
}
