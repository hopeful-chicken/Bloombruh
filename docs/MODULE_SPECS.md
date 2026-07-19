# Module Specs

## 1. Terminal shell (in scope now)

The chrome that everything lives inside.

### Features

- **Landing page**: name ("Graduate Analyst Terminal" — placeholder, Adam may rebrand), one-line pitch, cards for each module (live ones clickable, future ones shown as "coming soon"), short "about this project" section naming Adam as builder with a link placeholder for LinkedIn/GitHub.
- **Persistent navigation**: sidebar or top bar listing modules, terminal-style. Keyboard-friendly is a nice-to-have (e.g. pressing `/` focuses a global search).
- **Module framework**: each module is a route (`/swf`, later `/profile`, `/macro`, ...) sharing the same layout shell. Adding a module later should mean adding a folder, not rewriting the shell.
- **Footer**: data source attributions, "not investment advice" disclaimer, last-data-update date.

### Acceptance criteria

- Renders cleanly on desktop and mobile.
- Lighthouse-reasonable performance (no massive bundles).
- A new module can be added by creating a new route without touching existing modules.

## 2. SWF Explorer (in scope now — flagship)

Interactive explorer of NBIM's published equity holdings, with voting data as a stretch goal.

### Core views (priority order)

1. **Company search** — the hero interaction. A search box: type a company name (e.g. "Apple"), get NBIM's position: market value of stake, % of company owned, % of NBIM's portfolio, country, sector. Show top-line stats fast. This is the shareable, "wow" interaction — make it feel instant.
2. **Portfolio overview dashboard** — total portfolio value; breakdown by region/country (chart), by sector (chart); top 20 holdings table; number of companies held.
3. **Country drill-down** — click a country, see NBIM's total exposure there and top holdings. Special attention to a UK view (Adam's audience is UK students: "NBIM owns X% of the FTSE 100").
4. **Year-over-year comparison** (if multiple yearly files are loaded) — how has the portfolio shifted by sector/region? Biggest new positions and exits.
5. **Voting explorer** (stretch) — for a searched company, show how NBIM voted at recent AGMs, especially votes *against* management. If the voting data proves hard to ingest overnight, ship a placeholder tab explaining what's coming and move on.

### Data notes

See `DATA_SOURCES.md`. v1 uses NBIM's annual holdings disclosures preprocessed into JSON. The full holdings list is ~9,000 rows/year — small enough to ship as slimmed JSON (keep only needed columns; consider splitting into an index file + per-region detail files if size becomes an issue).

### Editorial layer (important differentiator)

Pure data dumps are boring. Add short plain-English annotations where they teach something, e.g. a callout on the dashboard: "NBIM owns on average ~1.5% of every listed company in the world — this dashboard shows what the world's largest equity owner actually holds." Keep these factual and sourced. Leave clearly-marked placeholders (`{/* EDITORIAL: Adam to review */}`) so Adam can add his own voice later.

### Acceptance criteria

- Search returns correct results from real NBIM data in under ~200ms perceived.
- All charts render with real data; numbers reconcile with NBIM's published totals (sanity-check top holdings against NBIM's own site and note the check in PROGRESS.md).
- Every view shows the data's as-of date and source attribution.

## 3–6. Future modules (NOT in scope — do not build)

Documented so the shell's architecture anticipates them.

- **Company profile generator** (`/profile`): ticker in → one-page profile out (price chart, basic multiples, description). Will need a free market-data source; decide later.
- **Central bank room** (`/macro`): archive of BoE/Fed/ECB statements, simple hawkish/dovish scoring over time, rate decision timeline.
- **Hype vs Fundamentals** (`/hype`): mention velocity/sentiment vs earnings revisions and valuation; divergence flags. The most research-y module; scope carefully later.
- **Analyst portfolio** (`/portfolio`): Adam's paper portfolio with published letters — his personal track record and writing.
