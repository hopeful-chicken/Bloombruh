export default function ProfileLayout({
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
        </a>{" "}
        (may be delayed) — Hong Kong Stock Exchange tickers (e.g.
        &ldquo;0700.HK&rdquo;) instead use{" "}
        <a
          href="https://eodhd.com"
          className="underline decoration-dotted underline-offset-2 hover:text-accent"
        >
          EODHD
        </a>
        , the only free source found that covers HKEX. Fundamentals from{" "}
        <a
          href="https://www.sec.gov/edgar"
          className="underline decoration-dotted underline-offset-2 hover:text-accent"
        >
          SEC EDGAR
        </a>{" "}
        (US filers only). Insider transactions, institutional holdings,
        sentiment-scored news, and the next earnings date (US tickers only —
        not covered for HKEX) are from{" "}
        <a
          href="https://www.alphavantage.co"
          className="underline decoration-dotted underline-offset-2 hover:text-accent"
        >
          Alpha Vantage
        </a>
        . Not investment advice — see the data sources appendix on each
        company page for full detail.
      </div>
      {children}
    </div>
  );
}
