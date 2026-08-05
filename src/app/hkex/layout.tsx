export default function HkexLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="mb-6 rounded-md border border-border bg-surface/60 px-4 py-2 text-xs text-muted">
        This is an independent student project, not affiliated with or endorsed by any accounting
        or advisory firm — a focused Hong Kong Stock Exchange lookup, useful for teams screening HK
        names; the only exchange searchable here is HKEX. Prices and history are from Yahoo
        Finance&apos;s public chart data (EODHD as a fallback, and for the searchable company
        directory); press releases are scraped directly from each company&apos;s own official page
        where one is curated (unmapped companies say so plainly rather than guessing); news comes
        from Google News, filtered to a short list of reliable financial outlets. Every AI recap
        above a press-release or news list is strictly grounded in the real, dated items shown next
        to it — never outside knowledge. See <span className="font-mono text-xs">docs/DATA_SOURCES.md</span> for
        the full detail.
      </div>
      {children}
    </div>
  );
}
