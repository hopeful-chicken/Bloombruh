"use client";

// The hero interaction: type a company name, get NBIM's position instantly.
// Filtering happens entirely in the browser (the dataset is tiny — ~200
// rows / ~60KB) so results update on every keystroke with no network round
// trip, making it feel instant.

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Holding } from "@/lib/types";
import { filterHoldings, formatUSD } from "@/lib/search";

function slugifyCountry(country: string): string {
  return country.toLowerCase().replace(/\s+/g, "-");
}

export default function CompanySearch({
  holdings,
  initialQuery = "",
}: {
  holdings: Holding[];
  initialQuery?: string;
}) {
  const [query, setQuery] = useState(initialQuery);

  const results = useMemo(
    () => filterHoldings(holdings, query, 8),
    [holdings, query]
  );

  return (
    <div>
      <div className="mx-auto max-w-2xl">
        <label htmlFor="company-search" className="sr-only">
          Search a company
        </label>
        <input
          id="company-search"
          autoFocus
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Try “Apple”, “Shell”, or “AAPL”…"
          className="w-full rounded-lg border border-border bg-surface px-4 py-3.5 font-mono text-lg text-foreground placeholder:text-muted/60 focus:border-accent focus:outline-none"
        />
      </div>

      <div className="mx-auto mt-6 max-w-2xl space-y-3">
        {query.trim() === "" && (
          <p className="text-center text-sm text-muted">
            Start typing to see NBIM&apos;s position, instantly.
          </p>
        )}

        {query.trim() !== "" && results.length === 0 && (
          <p className="text-center text-sm text-muted">
            No match for &quot;{query}&quot; in NBIM&apos;s equity holdings
            {" "}(this dataset covers ~{holdings.length} companies, not the
            full ~9,000).
          </p>
        )}

        {results.map((h) => (
          <ResultCard key={h.id} holding={h} />
        ))}
      </div>
    </div>
  );
}

function ResultCard({ holding }: { holding: Holding }) {
  return (
    <Link
      href={`/swf/country/${slugifyCountry(holding.country)}`}
      className="block rounded-lg border border-border bg-surface p-5 transition-colors hover:border-accent/60"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-lg font-semibold text-foreground">
          {holding.name}
          {holding.ticker && (
            <span className="ml-2 font-mono text-sm text-muted">
              {holding.ticker}
            </span>
          )}
        </h3>
        <div className="flex gap-1.5">
          {holding.isFTSE100 && (
            <span className="rounded-sm bg-accent/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent">
              FTSE 100
            </span>
          )}
          <span className="rounded-sm bg-surface-hover px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted">
            {holding.country}
          </span>
        </div>
      </div>
      <p className="mt-0.5 text-xs text-muted">{holding.sector}</p>

      <div className="mt-4 grid grid-cols-3 gap-3 font-mono">
        <Metric label="NBIM's stake" value={formatUSD(holding.marketValueUSD)} />
        <Metric label="% of company owned" value={`${holding.ownershipPct.toFixed(2)}%`} />
        <Metric label="% of NBIM portfolio" value={`${holding.portfolioPct.toFixed(3)}%`} />
      </div>
    </Link>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-lg font-semibold text-accent">{value}</p>
      <p className="text-[11px] leading-tight text-muted">{label}</p>
    </div>
  );
}
