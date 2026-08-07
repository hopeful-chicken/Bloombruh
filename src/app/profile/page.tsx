import TickerSearch from "@/components/profile/TickerSearch";

const EXAMPLE_TICKERS = ["AAPL", "MSFT", "NVDA", "SHEL", "AZN"];

export default async function ProfileSearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-widest text-accent">
        Company Profile
      </p>
      <h1 className="font-display mt-1 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        Look up any public company
      </h1>
      {/* EDITORIAL: Adam to review/replace this framing line with his own voice */}
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
        Type a company name or ticker to pull up its price, chart, full
        financials, and a plain-English snapshot. Then, if you want, build
        your own rating, thesis, and target price on top of it and export
        the result as a PDF.
      </p>

      <div className="mt-8">
        <TickerSearch initialQuery={q ?? ""} autoFocus />
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2 text-xs text-muted">
        <span>Try:</span>
        {EXAMPLE_TICKERS.map((t) => (
          <a
            key={t}
            href={`/profile/${t}`}
            className="rounded border border-border px-2 py-1 font-mono hover:border-accent/60 hover:text-foreground"
          >
            {t}
          </a>
        ))}
      </div>
    </div>
  );
}
