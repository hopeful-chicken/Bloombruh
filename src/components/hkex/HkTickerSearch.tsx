"use client";

// Search box for the HKEX Screener module (/hkex) — same interaction
// pattern as TickerSearch.tsx, but deliberately narrower: only ever queries
// /api/search-hk, so every result is a real Hong Kong Stock Exchange
// listing this site can actually show real data for. No "limited data"
// badge is needed here (unlike TickerSearch) since nothing HK-only search
// can return would fail to load.

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { SymbolSearchResultLike } from "@/lib/eodhd";

export default function HkTickerSearch({ autoFocus = false }: { autoFocus?: boolean }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SymbolSearchResultLike[]>([]);
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
      fetch(`/api/search-hk?q=${encodeURIComponent(q)}`)
        .then((r) => r.json())
        .then((data) => setResults(data.results ?? []))
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(timeout);
  }, [query]);

  function goToSymbol(symbol: string) {
    setOpen(false);
    router.push(`/profile/${encodeURIComponent(symbol)}`);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (results.length > 0) {
      goToSymbol(results[0].symbol);
    } else if (query.trim()) {
      const typed = query.trim().toUpperCase();
      goToSymbol(typed.endsWith(".HK") ? typed : `${typed}.HK`);
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
          placeholder='Try "Tencent", "HSBC", or "0700"…'
          className="w-full rounded-lg border border-border bg-surface px-4 py-3 font-mono text-sm text-foreground placeholder:text-muted/60 focus:border-accent focus:outline-none"
        />
      </form>

      {open && query.trim() && (
        <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-border bg-surface shadow-lg">
          {loading && <p className="px-4 py-3 text-sm text-muted">Searching HKEX…</p>}
          {!loading && results.length === 0 && (
            <p className="px-4 py-3 text-sm text-muted">
              No HKEX matches. Try a different name or ticker code.
            </p>
          )}
          {!loading &&
            results.map((r) => (
              <button
                key={r.symbol}
                type="button"
                onMouseDown={() => goToSymbol(r.symbol)}
                className="flex w-full items-center justify-between gap-3 border-b border-border/60 px-4 py-2.5 text-left last:border-b-0 hover:bg-surface-hover"
              >
                <span>
                  <span className="font-medium text-foreground">{r.instrument_name}</span>
                  <span className="ml-2 font-mono text-xs text-muted">{r.symbol}</span>
                </span>
                <span className="shrink-0 font-mono text-xs text-muted">{r.type}</span>
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
