export default function VotingPage() {
  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-widest text-muted">
        Coming soon
      </p>
      <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        Voting record
      </h1>

      {/* EDITORIAL: Adam to review/replace this framing line with his own voice */}
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
        NBIM publishes how it votes at the annual general meetings of the
        companies it owns — on pay, boards, climate resolutions, and more.
        This tab will let you look up how NBIM voted on a specific company or
        resolution.
      </p>

      <div className="mt-8 max-w-2xl rounded-lg border border-border bg-surface p-6">
        <p className="text-sm leading-relaxed text-muted">
          This feature isn&apos;t built yet. NBIM&apos;s voting data is
          published separately from the holdings data used elsewhere in this
          explorer, and ingesting it cleanly is a bigger job than an overnight
          session allows.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          <span className="font-medium text-foreground">Planned:</span> a
          searchable table of votes cast by NBIM at company AGMs, filterable
          by company, resolution type (pay / board / climate / other), and
          how NBIM voted (for / against / abstain).
        </p>
      </div>
    </div>
  );
}
