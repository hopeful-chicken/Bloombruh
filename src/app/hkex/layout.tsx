export default function HkexLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="mb-6 rounded-md border border-border bg-surface/60 px-4 py-2 text-xs text-muted">
        This is an independent student project, not affiliated with or endorsed by any accounting
        or advisory firm — a focused Hong Kong Stock Exchange lookup, useful for teams screening HK
        names. Prices and history from{" "}
        <a
          href="https://eodhd.com"
          className="underline decoration-dotted underline-offset-2 hover:text-accent"
        >
          EODHD
        </a>
        ; the only exchange searchable here is the Hong Kong Stock Exchange (HKEX). See{" "}
        <span className="font-mono text-xs">docs/DATA_SOURCES.md</span> for the full detail.
      </div>
      {children}
    </div>
  );
}
