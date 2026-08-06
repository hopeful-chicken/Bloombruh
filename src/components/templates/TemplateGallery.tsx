"use client";

// The Model Templates builder UI: a card per template; picking one opens
// its configuration (company ticker with live search, sector variant,
// per-template options) and a Download button that POSTs the config to
// /api/template and saves the returned .xlsx. All personalization happens
// here on the site, per Adam's spec — the download is the finished,
// prefilled workbook.

import { useEffect, useRef, useState } from "react";
import { TEMPLATES, type TemplateId, type TemplateSectorId, type TemplateRequest } from "@/lib/templates/types";
import { TEMPLATE_SECTORS } from "@/lib/templates/sectorGuidance";
import { hasFreeQuoteDataForResult } from "@/lib/exchangeCoverage";

type SearchResult = {
  symbol: string;
  instrument_name: string;
  exchange: string;
};

/** Compact ticker search: like TickerSearch, but selecting a result fills
 * local state instead of navigating — the template config needs the symbol
 * here, not a page change. */
function InlineTickerPicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (symbol: string) => void;
}) {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const chosen = useRef(false);

  useEffect(() => {
    const q = query.trim();
    if (!q || chosen.current) {
      chosen.current = false;
      setResults([]);
      return;
    }
    const timeout = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(q)}`)
        .then((r) => r.json())
        .then((d) => setResults((d.results ?? []).slice(0, 6)))
        .catch(() => setResults([]));
    }, 250);
    return () => clearTimeout(timeout);
  }, [query]);

  return (
    <div className="relative">
      <label className="mb-1 block text-xs font-medium text-muted">{label}</label>
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          onChange(e.target.value.trim().toUpperCase());
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder="Ticker or company name (optional)"
        className="w-full rounded-md border border-border bg-surface px-3 py-2 font-mono text-sm text-foreground placeholder:text-muted/60 focus:border-accent focus:outline-none"
      />
      {open && query.trim() && results.length > 0 && (
        <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-md border border-border bg-surface shadow-lg">
          {results.map((r) => {
            const usable = hasFreeQuoteDataForResult(r);
            if (!usable) {
              return (
                <div
                  key={`${r.symbol}-${r.exchange}`}
                  className="cursor-not-allowed border-b border-border/60 px-3 py-2 text-left text-sm text-muted opacity-60 last:border-b-0"
                >
                  {r.instrument_name}{" "}
                  <span className="font-mono text-xs">{r.symbol}</span>
                  <span className="float-right text-[10px] text-negative/80">limited data</span>
                </div>
              );
            }
            return (
              <button
                key={`${r.symbol}-${r.exchange}`}
                type="button"
                onMouseDown={() => {
                  chosen.current = true;
                  setQuery(r.symbol);
                  onChange(r.symbol);
                  setOpen(false);
                }}
                className="block w-full border-b border-border/60 px-3 py-2 text-left text-sm text-foreground last:border-b-0 hover:bg-surface-hover"
              >
                {r.instrument_name}{" "}
                <span className="font-mono text-xs text-muted">{r.symbol}</span>
                <span className="float-right font-mono text-xs text-muted">{r.exchange}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function OptionToggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-foreground">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="accent-[var(--accent)]"
      />
      {label}
    </label>
  );
}

function OptionSelect<T extends string | number>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-muted">{label}</label>
      <div className="flex gap-1">
        {options.map((o) => (
          <button
            key={String(o.value)}
            type="button"
            onClick={() => onChange(o.value)}
            className={`rounded-md px-2.5 py-1 font-mono text-xs transition-colors ${
              value === o.value
                ? "bg-accent text-accent-foreground"
                : "border border-border text-muted hover:border-accent hover:text-accent"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

const SECTOR_LABELS = Object.fromEntries(TEMPLATE_SECTORS.map((s) => [s.id, s.label]));

export default function TemplateGallery() {
  const [openId, setOpenId] = useState<TemplateId | null>(null);
  const [ticker, setTicker] = useState("");
  const [targetTicker, setTargetTicker] = useState("");
  const [peerTickers, setPeerTickers] = useState("");
  const [sector, setSector] = useState<TemplateSectorId>("generic");
  const [forecastYears, setForecastYears] = useState<5 | 10>(5);
  const [includeSensitivity, setIncludeSensitivity] = useState(true);
  const [holdYears, setHoldYears] = useState<3 | 5 | 7>(5);
  const [includeSynergies, setIncludeSynergies] = useState(true);
  const [includeValuationSummary, setIncludeValuationSummary] = useState(true);
  const [holdingRows, setHoldingRows] = useState<10 | 20 | 30>(20);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function download(id: TemplateId) {
    setDownloading(true);
    setError(null);
    const req: TemplateRequest = {
      template: id,
      ticker: ticker.trim() || null,
      sector,
      forecastYears,
      includeSensitivity,
      holdYears,
      targetTicker: targetTicker.trim() || null,
      peerTickers: peerTickers.trim() || null,
      includeSynergies,
      includeValuationSummary,
      holdingRows,
    };
    try {
      const res = await fetch("/api/template", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req),
      });
      if (!res.ok) throw new Error("Generation failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const cd = res.headers.get("Content-Disposition") ?? "";
      const m = cd.match(/filename="([^"]+)"/);
      a.download = m?.[1] ?? `bloombruh-${id}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      setError("Couldn't generate the template right now — try again in a moment.");
    } finally {
      setDownloading(false);
    }
  }

  const usesSector = (id: TemplateId) =>
    id === "dcf" || id === "lbo" || id === "merger" || id === "initiation";
  const usesTicker = (id: TemplateId) => id !== "market-update";

  return (
    <div className="mt-8 space-y-4">
      {TEMPLATES.map((t) => {
        const isOpen = openId === t.id;
        return (
          <div
            key={t.id}
            className={`rounded-sm border p-6 transition-colors ${
              isOpen ? "border-accent/60 bg-surface" : "border-border bg-surface hover:border-accent/40"
            }`}
          >
            <button
              type="button"
              onClick={() => setOpenId(isOpen ? null : t.id)}
              className="flex w-full items-start justify-between gap-4 text-left"
            >
              <div>
                <p className="font-mono text-[11px] uppercase tracking-widest text-accent">
                  {t.desk}
                </p>
                <h2 className="font-display mt-1 text-lg font-medium text-foreground">
                  {t.name}
                </h2>
                <p className="mt-1 text-sm leading-relaxed text-muted">{t.description}</p>
              </div>
              <span className="shrink-0 font-mono text-xs text-muted">
                {isOpen ? "− close" : "+ configure"}
              </span>
            </button>

            {isOpen && (
              <div className="mt-5 space-y-4 border-t border-border pt-5">
                {usesTicker(t.id) && (
                  <InlineTickerPicker
                    label={
                      t.id === "merger"
                        ? "Acquirer — prefills with real data"
                        : t.id === "comps"
                          ? "Subject company — prefills with real data"
                          : t.id === "portfolio"
                            ? "Seed the first holding (optional)"
                            : "Company — prefills with real data (blank = empty template)"
                    }
                    value={ticker}
                    onChange={setTicker}
                  />
                )}
                {t.id === "comps" && (
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted">
                      Peer tickers — comma-separated, up to 6 (picking the set is the analyst&apos;s job)
                    </label>
                    <input
                      type="text"
                      value={peerTickers}
                      onChange={(e) => setPeerTickers(e.target.value)}
                      placeholder="e.g. MSFT, GOOGL, META"
                      className="w-full rounded-md border border-border bg-surface px-3 py-2 font-mono text-sm text-foreground placeholder:text-muted/60 focus:border-accent focus:outline-none"
                    />
                  </div>
                )}
                {t.id === "merger" && (
                  <InlineTickerPicker
                    label="Target — prefills with real data"
                    value={targetTicker}
                    onChange={setTargetTicker}
                  />
                )}

                {usesSector(t.id) && (
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted">
                      Sector — adapts the template and its guidance
                    </label>
                    <div className="flex flex-wrap gap-1">
                      {TEMPLATE_SECTORS.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => setSector(s.id)}
                          className={`rounded-md px-2.5 py-1 text-xs transition-colors ${
                            sector === s.id
                              ? "bg-accent text-accent-foreground"
                              : "border border-border text-muted hover:border-accent hover:text-accent"
                          }`}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                    {t.id === "dcf" && sector === "fig" && (
                      <p className="mt-2 text-xs text-muted">
                        FIG switches this download to a dividend-discount model — EV-based
                        DCFs don&apos;t work for banks. The template explains why inside.
                      </p>
                    )}
                    {t.recommendedFor.length > 0 && (
                      <p className="mt-2 text-[11px] text-muted/70">
                        Recommended for:{" "}
                        {t.recommendedFor.map((s) => SECTOR_LABELS[s]).join(" · ")}
                      </p>
                    )}
                  </div>
                )}

                <div className="flex flex-wrap items-end gap-5">
                  {t.id === "dcf" && (
                    <>
                      <OptionSelect
                        label="Forecast length"
                        value={forecastYears}
                        options={[
                          { value: 5, label: "5 years" },
                          { value: 10, label: "10 years" },
                        ]}
                        onChange={setForecastYears}
                      />
                      <OptionToggle
                        label="Include sensitivity grid"
                        checked={includeSensitivity}
                        onChange={setIncludeSensitivity}
                      />
                    </>
                  )}
                  {t.id === "lbo" && (
                    <OptionSelect
                      label="Holding period"
                      value={holdYears}
                      options={[
                        { value: 3, label: "3 yrs" },
                        { value: 5, label: "5 yrs" },
                        { value: 7, label: "7 yrs" },
                      ]}
                      onChange={setHoldYears}
                    />
                  )}
                  {t.id === "merger" && (
                    <OptionToggle
                      label="Include synergies block"
                      checked={includeSynergies}
                      onChange={setIncludeSynergies}
                    />
                  )}
                  {t.id === "initiation" && (
                    <OptionToggle
                      label="Include valuation summary table"
                      checked={includeValuationSummary}
                      onChange={setIncludeValuationSummary}
                    />
                  )}
                  {t.id === "portfolio" && (
                    <OptionSelect
                      label="Holding rows"
                      value={holdingRows}
                      options={[
                        { value: 10, label: "10" },
                        { value: 20, label: "20" },
                        { value: 30, label: "30" },
                      ]}
                      onChange={setHoldingRows}
                    />
                  )}
                  {t.id === "market-update" && (
                    <p className="text-sm text-muted">
                      No company needed — this one downloads prefilled with the site&apos;s
                      real sector and central-bank data at this moment.
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => download(t.id)}
                    disabled={downloading}
                    className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
                  >
                    {downloading ? "Building your file…" : "Download .xlsx"}
                  </button>
                  {error && <p className="text-sm text-negative">{error}</p>}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
