export default function PitchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="mb-6 rounded-md border border-border bg-surface/60 px-4 py-2 text-xs text-muted">
        Prices from{" "}
        <a
          href="https://twelvedata.com"
          className="underline decoration-dotted underline-offset-2 hover:text-accent"
        >
          Twelve Data
        </a>
        , fundamentals from{" "}
        <a
          href="https://www.sec.gov/edgar"
          className="underline decoration-dotted underline-offset-2 hover:text-accent"
        >
          SEC EDGAR
        </a>{" "}
        (US filers only). The pitch below is your own analysis, not
        investment advice.
      </div>
      {children}
    </div>
  );
}
