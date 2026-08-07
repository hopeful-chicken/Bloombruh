import HkTickerSearch from "@/components/hkex/HkTickerSearch";

// Real, named HKEX common-stock listings, confirmed against the live
// EODHD directory before being hardcoded here (see docs/DECISIONS.md) —
// same "verify before shipping" discipline as every other quick-pick list
// on this site.
const EXAMPLE_TICKERS = [
  { code: "0700.HK", name: "Tencent" },
  { code: "0005.HK", name: "HSBC" },
  { code: "9988.HK", name: "Alibaba" },
  { code: "1299.HK", name: "AIA Group" },
  { code: "0941.HK", name: "China Mobile" },
];

export default function HkexScreenerPage() {
  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-widest text-accent">
        HKEX Screener: for accounting &amp; advisory firms
      </p>
      <h1 className="font-display mt-1 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        Hong Kong Stock Exchange, company by company
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
        A focused lookup where every company is Hong Kong Stock Exchange-listed,
        real, and free, useful for accounting and advisory teams screening HK
        names. Pick one and you get a dedicated HKEX research page: a real
        price chart (up to 10 years), direct links to official filings, the
        company&apos;s own scraped press releases where a source is curated,
        and reliable third-party news, each with a strictly source-grounded
        AI recap.
      </p>

      <div className="mt-8">
        <HkTickerSearch autoFocus />
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2 text-xs text-muted">
        <span>Try:</span>
        {EXAMPLE_TICKERS.map((t) => (
          <a
            key={t.code}
            href={`/hkex/${t.code}`}
            className="rounded border border-border px-2 py-1 font-mono hover:border-accent/60 hover:text-foreground"
            title={t.name}
          >
            {t.code}
          </a>
        ))}
      </div>
    </div>
  );
}
