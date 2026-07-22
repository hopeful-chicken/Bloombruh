export default function MarketsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="mb-6 rounded-md border border-border bg-surface/60 px-4 py-2 text-xs text-muted">
        Prices from Twelve Data (sector and private-market segments are
        tracked via real, liquid ETFs used as proxies — see each section for
        which one). Headlines from{" "}
        <a
          href="https://news.google.com"
          className="underline decoration-dotted underline-offset-2 hover:text-accent"
        >
          Google News
        </a>
        . The short narrative under each segment is AI-generated and
        grounded only in the real return figure and news shown next to it —
        never invented. Anything labeled &quot;Adam&apos;s take&quot; is his
        own opinion, not fetched or AI-generated data. Private-market
        segments (Private Equity, Private Credit, Real Assets) use public
        listed proxies, not actual fund NAVs — see the disclaimer in that
        section.
      </div>
      {children}
    </div>
  );
}
