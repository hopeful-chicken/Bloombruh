export default function MacroLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="mb-6 rounded-md border border-border bg-surface/60 px-4 py-2 text-xs text-muted">
        Rate data from each central bank&apos;s own statistics API (or FRED
        where a bank has no clean daily series — see the source link under
        each chart). Headlines from{" "}
        <a
          href="https://news.google.com"
          className="underline decoration-dotted underline-offset-2 hover:text-accent"
        >
          Google News
        </a>
        . Commentary below each bank is Adam&apos;s own opinion, not fetched
        data or investment advice.
      </div>
      {children}
    </div>
  );
}
