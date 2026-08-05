export default function AnalysisLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="mb-6 rounded-md border border-border bg-surface/60 px-4 py-2 text-xs text-muted">
        Written by Adam, researched with AI-assisted tools — this is personal analysis and
        opinion, not neutral site data. The write-ups and stock pitches above are dated, sourced,
        and fact-checked the same way as the rest of this site; the &quot;Worth Digging
        Into&quot; leads list at the bottom is deliberately lighter — one sentence each from one
        source, not independently verified, meant as a starting point for further research rather
        than a checked fact. Treat each piece as a snapshot from its written date, not a live
        feed. Not investment advice.
      </div>
      {children}
    </div>
  );
}
