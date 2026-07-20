import TickerSearch from "@/components/profile/TickerSearch";

const EXAMPLE_TICKERS = ["AAPL", "MSFT", "NVDA", "SHEL", "AZN"];

export default async function PitchSearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-widest text-accent">
        Pitch Builder
      </p>
      <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        Research a company and build your own pitch
      </h1>
      {/* EDITORIAL: Adam to review/replace this framing line with his own voice */}
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
        Pick a ticker, pull in real price and (for US companies) financial
        data, then write your own rating, target price, thesis, catalysts,
        and risks. Download the finished pitch as a PDF — this is your
        analysis, not a data dump.
      </p>

      <div className="mt-8">
        <TickerSearch initialQuery={q ?? ""} autoFocus basePath="/pitch" />
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2 text-xs text-muted">
        <span>Try:</span>
        {EXAMPLE_TICKERS.map((t) => (
          <a
            key={t}
            href={`/pitch/${t}`}
            className="rounded border border-border px-2 py-1 font-mono hover:border-accent/60 hover:text-foreground"
          >
            {t}
          </a>
        ))}
      </div>
    </div>
  );
}
