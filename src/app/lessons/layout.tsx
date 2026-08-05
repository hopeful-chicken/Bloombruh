export default function LessonsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="mb-6 rounded-md border border-border bg-surface/60 px-4 py-2 text-xs text-muted">
        A written curriculum, not a data feed — six lessons covering the finance-career topics
        this site&apos;s other modules don&apos;t teach directly: fixed income, three-statement
        modeling, technical interview fundamentals, options, FX, and reading a real deal. Educational
        content, not investment advice.
      </div>
      {children}
    </div>
  );
}
