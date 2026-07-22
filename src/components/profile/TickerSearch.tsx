"use client";

// The hero interaction for the Company Profile module: type a name or
// ticker, get a dropdown of matches, hit enter/click to go to its profile.

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { SymbolSearchResult } from "@/lib/marketData";
import { hasFreeQuoteDataForResult } from "@/lib/exchangeCoverage";

// The search endpoint (symbol_search) returns matches across every global
// exchange, but the free Twelve Data plan this site uses only actually
// returns quote/price data for US-listed stocks (NYSE/NASDAQ) and US OTC
// listings — a foreign-exchange-only match (LSE, ASX, TSX, Frankfurt, etc.)
// will find the company here but then fail to load on the next page.
// Rather than letting a click lead to a guaranteed dead end, these are
// still shown (so the company isn't just silently missing from search)
// but rendered as plain, non-clickable rows instead of buttons — visible
// as a suggestion, not a live link. (Results are also deduped to one row
// per company server-side — see dedupeByCompany() in marketData.ts.)

export default function TickerSearch({
  initialQuery = "",
  autoFocus = false,
  basePath = "/profile",
}: {
  initialQuery?: string;
  autoFocus?: boolean;
  /** Route prefix to navigate to on selection, e.g. "/profile" or "/pitch". */
  basePath?: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SymbolSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setResults([]);
      return;
    }
    setLoading(true);
    const timeout = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(q)}`)
        .then((r) => r.json())
        .then((data) => setResults(data.results ?? []))
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(timeout);
  }, [query]);

  function goToSymbol(symbol: string) {
    setOpen(false);
    router.push(`${basePath}/${encodeURIComponent(symbol)}`);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Skip straight past any limited-data results — same rule as the
    // dropdown itself, so pressing Enter can't land on a guaranteed dead
    // end any more than clicking can.
    const firstUsable = results.find((r) => hasFreeQuoteDataForResult(r));
    if (firstUsable) {
      goToSymbol(firstUsable.symbol);
    } else if (query.trim()) {
      goToSymbol(query.trim().toUpperCase());
    }
  }

  return (
    <div className="relative w-full max-w-xl">
      <form onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder='Try "Apple", "Microsoft", or "AAPL"…'
          className="w-full rounded-lg border border-border bg-surface px-4 py-3 font-mono text-sm text-foreground placeholder:text-muted/60 focus:border-accent focus:outline-none"
        />
      </form>

      {open && query.trim() && (
        <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-border bg-surface shadow-lg">
          {loading && (
            <p className="px-4 py-3 text-sm text-muted">Searching…</p>
          )}
          {!loading && results.length === 0 && (
            <p className="px-4 py-3 text-sm text-muted">
              No matches. Try a different name or ticker.
            </p>
          )}
          {!loading &&
            results.slice(0, 8).map((r) => {
              const freeData = hasFreeQuoteDataForResult(r);
              const rowContent = (
                <>
                  <span>
                    <span
                      className={`font-medium ${freeData ? "text-foreground" : "text-muted"}`}
                    >
                      {r.instrument_name}
                    </span>
                    <span className="ml-2 font-mono text-xs text-muted">
                      {r.symbol}
                    </span>
                  </span>
                  <span className="shrink-0 text-right">
                    <span className="block font-mono text-xs text-muted">
                      {r.exchange}
                    </span>
                    {!freeData && (
                      <span
                        className="block text-[10px] text-negative/80"
                        title="This site's free data plan doesn't cover quotes for this exchange, so this isn't clickable — shown for visibility only."
                      >
                        limited data
                      </span>
                    )}
                  </span>
                </>
              );

              if (!freeData) {
                return (
                  <div
                    key={`${r.symbol}-${r.exchange}`}
                    className="flex w-full cursor-not-allowed items-center justify-between gap-3 border-b border-border/60 px-4 py-2.5 text-left opacity-60 last:border-b-0"
                  >
                    {rowContent}
                  </div>
                );
              }

              return (
                <button
                  key={`${r.symbol}-${r.exchange}`}
                  type="button"
                  onMouseDown={() => goToSymbol(r.symbol)}
                  className="flex w-full items-center justify-between gap-3 border-b border-border/60 px-4 py-2.5 text-left last:border-b-0 hover:bg-surface-hover"
                >
                  {rowContent}
                </button>
              );
            })}
        </div>
      )}
    </div>
  );
}
