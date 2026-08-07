export default function HypeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="mb-6 rounded-md border border-border bg-surface/60 px-4 py-2 text-xs text-muted">
        Prices and history from Twelve Data, fundamentals from SEC EDGAR (US filers
        only, see each case for what is genuinely available for its era). News
        from Google News. Every narrative is AI-generated, grounded strictly in the
        real figures and sources shown next to it. The current-themes section is
        explicitly instructed never to render a verdict on whether something is or
        is not a bubble, since nobody can know that yet. Anything labeled
        &ldquo;Adam&apos;s take&rdquo; is his own opinion. Not investment advice.
      </div>
      {children}
    </div>
  );
}
