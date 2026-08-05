export default function AnalysisLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="mb-6 rounded-md border border-border bg-surface/60 px-4 py-2 text-xs text-muted">
        Written by Adam, researched with AI-assisted tools — this is personal analysis and
        opinion, not neutral site data. Every factual claim is dated and sourced; where a source
        looks commercially motivated, that&apos;s flagged directly rather than presented as fact.
        Treat each piece as a snapshot from its written date, not a live feed. Not investment
        advice.
      </div>
      {children}
    </div>
  );
}
