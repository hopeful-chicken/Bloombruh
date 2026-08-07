"use client";

// A collapsible, user-facing methodology appendix: exactly where every
// number and word on a page came from, and how the computed figures
// (beta, credit metrics, valuation multiples...) are actually calculated.
// This is the plain-English mirror of docs/DATA_SOURCES.md, aimed at
// someone reading the page rather than the codebase.
//
// Generic — takes its source list and an optional note as props, so the
// same collapsible UI is shared between the Company Profile page
// (COMPANY_PROFILE_SOURCES, below) and the homepage (its own list in
// src/app/page.tsx), rather than each page reimplementing the disclosure
// widget itself.

import { useState } from "react";

export type DataSource = {
  title: string;
  detail: string;
  link?: { label: string; url: string };
};

export const COMPANY_PROFILE_SOURCES: DataSource[] = [
  {
    title: "Price & historical chart",
    detail:
      "Current price, day's change, 52-week high/low, volume, and the daily closing history behind the chart come from Twelve Data's free quote and time-series endpoints. Quotes may be delayed a little versus a live terminal, and are cached for 60 seconds (quote) or 15 minutes (price history). Hong Kong Stock Exchange tickers (“.HK” suffix) are the one exception. Twelve Data's plan does not cover HKEX, so those instead use EODHD's free tier; the 52-week high/low and average volume shown for HK tickers are computed by this site from EODHD's daily history rather than returned directly, since EODHD's live-quote endpoint does not include either.",
    link: { label: "twelvedata.com", url: "https://twelvedata.com" },
  },
  {
    title: "Company fundamentals",
    detail:
      "Revenue, margins, balance sheet, and cash flow line items come straight from the company's own filed 10-Ks (or 20-F/6-K for foreign private issuers reporting under US-GAAP, e.g. Alibaba), via SEC EDGAR's free XBRL data, no paid plan or key involved. Banks and insurers report their top line under industry-specific concepts (net revenues, net premiums earned, interest income) rather than a normal sales line. When one of those is used, a caption under the revenue figure says exactly which. Hong Kong listings with a US-listed twin that files with the SEC (Alibaba, HSBC, JD.com and others) show that same company's filings; a note here on those pages says so explicitly. Companies that do not file with the SEC at all show “Unavailable” rather than a guessed number.",
    link: { label: "sec.gov/edgar", url: "https://www.sec.gov/edgar" },
  },
  {
    title: "Company description",
    detail:
      "The plain-English “About” summary is pulled from Wikipedia's public API. It can be incomplete or slightly out of date, so treat it as a starting point for research, not a primary source.",
    link: { label: "wikipedia.org", url: "https://www.wikipedia.org" },
  },
  {
    title: "News headlines",
    detail:
      "Recent headlines come from Google News' public RSS search feed, filtered to the company's name, no account or key required, cached for an hour.",
    link: { label: "news.google.com", url: "https://news.google.com" },
  },
  {
    title: "Computed analytics",
    detail:
      "Beta is a real regression, not a looked-up figure: daily returns for this stock and the S&P 500 (via SPY) over the last year, beta = covariance ÷ variance. Moving averages and annualised volatility are computed directly from the price history above. Credit metrics (estimated EBITDA, net debt/EBITDA, interest coverage), ROIC, every valuation multiple (P/E, EV/EBITDA, EV/Sales, P/B, FCF yield, dividend yield), and growth/return rates (ROE, ROA, revenue/EBITDA/EPS growth) are all calculated by this site from the raw fundamentals and price data above, none of them are looked up from a provider directly.",
  },
];

export default function DataSourcesAppendix({
  sources,
  note,
}: {
  sources: DataSource[];
  /** Optional short note shown above the source list, e.g. "no
   * fundamentals found for this ticker" on the Company Profile page. */
  note?: string | null;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-6 rounded-lg border border-border bg-surface/40">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-5 py-3 text-left"
        aria-expanded={open}
      >
        <span className="font-mono text-xs uppercase tracking-widest text-muted">
          Data sources & methodology
        </span>
        <span className="text-xs text-muted">
          {open ? "− Hide" : "+ Show every number's source"}
        </span>
      </button>

      {open && (
        <div className="space-y-5 border-t border-border px-5 py-5">
          {note && <p className="text-xs text-muted/70">{note}</p>}
          {sources.map((s) => (
            <div key={s.title}>
              <h3 className="text-sm font-semibold text-foreground">
                {s.title}
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-muted">
                {s.detail}
              </p>
              {s.link && (
                <a
                  href={s.link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-block text-xs text-muted underline decoration-dotted underline-offset-2 hover:text-accent"
                >
                  {s.link.label} ↗
                </a>
              )}
            </div>
          ))}
          <p className="text-xs text-muted/70">
            Everything above is free and publicly available. This project is
            independent and not affiliated with any company, exchange, or
            data provider listed here. Not investment advice.
          </p>
        </div>
      )}
    </div>
  );
}
