export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="mb-6 rounded-md border border-border bg-surface/60 px-4 py-2 text-xs text-muted">
        Quotes and fundamentals from{" "}
        <a
          href="https://twelvedata.com"
          className="underline decoration-dotted underline-offset-2 hover:text-accent"
        >
          Twelve Data
        </a>
        , may be delayed. Not investment advice.
      </div>
      {children}
    </div>
  );
}
