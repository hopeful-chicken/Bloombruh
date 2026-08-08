export default function AnalysisLayout({ children }: { children: React.ReactNode }) {
  // Was max-w-3xl, then max-w-5xl — fine for the listing, but once an entry
  // page grew a side nav (ArticleBody's sections sidebar) that split the
  // same column, the actual text still read phone-width in the middle of a
  // wide desktop screen. Wider shell here; ArticleBody itself still caps
  // the text column's own reading width separately.
  return <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">{children}</div>;
}
