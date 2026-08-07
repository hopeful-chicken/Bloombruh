export default function LessonsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="mb-6 rounded-md border border-border bg-surface/60 px-4 py-2 text-xs text-muted">
        A written curriculum, not a data feed: a 13-chapter, start-to-end course covering the
        finance-career fundamentals this site&apos;s other modules do not teach directly, plus
        an optional deep dive per chapter, each ending in a quiz. Educational content, not
        investment advice.
      </div>
      {children}
    </div>
  );
}
