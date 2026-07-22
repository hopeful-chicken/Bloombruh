# Module Specs

## 1. Terminal shell (built)

The chrome that everything lives inside.

### Features

- **Landing page**: name ("Bloombruh"), one-line pitch, cards for each module (live ones clickable, future ones shown as "coming soon"), short "about this project" section naming Adam as builder with a link placeholder for LinkedIn/GitHub.
- **Persistent navigation**: top bar listing modules, terminal-style, with a global ticker search box (press `/` to focus it, jumps into the Company Profile module).
- **Module framework**: each module is a route (`/profile`, `/portfolio`, later `/macro`, `/hype`, ...) sharing the same layout shell. Adding a module later should mean adding a folder, not rewriting the shell.
- **Footer**: data source attributions, "not investment advice" disclaimer.

### Acceptance criteria

- Renders cleanly on desktop and mobile.
- Lighthouse-reasonable performance (no massive bundles).
- A new module can be added by creating a new route without touching existing modules.

## 2. Company Profile (built — flagship; merged 2026-07-20, see `docs/DECISIONS.md`)

Ticker in, everything out: any public company, searchable in seconds — and, if the
student wants, a place to turn that data into their own investment report and
export it as a polished PDF. This used to be two separate modules (a simple
"Company Profile" and a deeper "Pitch Builder"); they were merged into one
once the data behind them grew similar enough that having two was just
confusing rather than offering two genuinely different things.

### Core views

1. **Ticker search** (`/profile`) — the hero interaction. Type a company name or ticker, get an autocomplete dropdown, hit enter or click to go to its profile page.
2. **Data dashboard** (`/profile/[symbol]`, always visible, read-only, `DataDashboard.tsx`) — current price and day's change, a historical price chart, key stats (open, previous close, 52-week high/low, volume, average volume, 50-day moving average, annualized volatility), a computed **context block** (e.g. "trading X% below its 52-week high") — the "analysis, not just data" differentiator from `PROJECT_BRIEF.md` — a plain-English company description, then, for US SEC-filing companies, the full three-statement picture (multi-year revenue/net income/operating income/EPS history, margins, balance sheet, cash flow) plus computed analytics (beta regressed against SPY, credit metrics, ROIC, capital allocation, and the core valuation multiples and growth/returns — `src/lib/valuationAnalysis.ts`), and recent news headlines. Non-US tickers still show everything that doesn't depend on SEC data; the rest gracefully reads "Unavailable", never guessed. Nothing here is a checkbox or a form field — general-to-specific, zero interaction required.
3. **"Build your own report" CTA** — sits at the end of the dashboard. Clicking it splits the page into two panes: the data dashboard stays visible (sticky/scrollable) on one side, while the other becomes a report workbench where the student picks a report type (**Equity Research / Pitch**, **IB Comps**, **M&A**, or **LBO**, each pre-loading a distinct suggested starter block set) and assembles their own report out of addable/removable/reorderable/retitlable blocks — custom text (including guided qualitative "lens" prompts like Business & Moat, Bear Case, Ownership & Shareholder Structure, Deal Terms & Synergies, Leverage & Debt Maturities), SWOT, bullet list, a pick-your-own stat grid, a peer comps table, an LBO returns calculator, an M&A accretion/dilution calculator, a Chart block, and a News block (headlines as an appendix/quote, distinct from the always-visible News section above). Nothing here is lost switching back and forth between the dashboard-only and split views.
4. **PDF export** — "Download PDF" renders the exact current block list (order, titles, inputs) into a clean document alongside the company header, price history, and rating/target price. Chart and News blocks render too (inline SVG chart, clickable headline links).
5. **Data sources appendix** (`DataSourcesAppendix.tsx`) — a collapsible "Data sources & methodology" section at the very end of the page (after the CTA/report pane), listing in plain English which free provider backs each figure and which numbers are this site's own calculations rather than something looked up.

### Data notes

See `DATA_SOURCES.md` for the Twelve Data, SEC EDGAR, Wikipedia, and Google News RSS integrations and the beta/comps computation approach. Requires a free `TWELVE_DATA_API_KEY` for price data; SEC EDGAR/Wikipedia/Google News need no key. No accounts, no database — the whole tool runs client-side after the initial data fetch; the PDF *is* the save/export mechanism.

### Editorial layer

Leave clearly-marked placeholders (`{/* EDITORIAL: Adam to review */}`) on any framing copy so Adam can add his own voice later.

### Acceptance criteria

- Search returns matches from the Twelve Data symbol search within a couple hundred ms of typing.
- Every stat gracefully shows "—"/"Unavailable" rather than crashing if that field is missing from the API response or a ticker isn't a US SEC filer.
- Works end-to-end for both a US ticker (fundamentals + all computed analytics shown) and a non-US ticker (fundamentals-dependent stats gracefully "Unavailable", rest of the tool unaffected).
- Blocks can be added, removed, reordered, and retitled without errors; each block type's editor and PDF rendering stay in sync (same underlying data, no duplicate state).
- The generated PDF is legible and presentable — this needs to be something a student would actually want to attach to an application, not an obvious dev-tool dump.
- Nothing requires a login or writes to a database.

## 3. Future modules (not in scope yet — do not build)

Documented so the shell's architecture anticipates them.

- **Central bank room** (`/macro`): archive of BoE/Fed/ECB statements, simple hawkish/dovish scoring over time, rate decision timeline.
- **Hype vs Fundamentals** (`/hype`): mention velocity/sentiment vs earnings revisions and valuation; divergence flags. The most research-y module; scope carefully later.

## Model Templates (`/templates`) — added 2026-07-22

**What it is:** downloadable Excel workbooks with live formulas — the
documents analysts actually produce, personalizable on the site before
download (company via ticker search, sector variant, per-template options)
and prefilled with real data through the same code paths as the rest of
the site.

**Templates:** DCF valuation (with an automatic dividend-discount variant
when the FIG sector is chosen — EV math doesn't work for banks), LBO
model, M&A accretion/dilution (two-company prefill), equity research
initiation note, AM portfolio one-pager, S&T market update sheet
(prefilled with real sector-ETF performance and central-bank rates at
download time).

**Design rules:** blue-on-yellow input cells (the banking-model
convention); every computed cell is a real Excel formula so the file
recalculates offline; every workbook carries a guidance sheet (usage +
sector-specific advice) and a "Data & Sources" sheet; missing real data
stays a blank input, never an estimate. Educational, not investment
advice — stated in every file.

**Key files:** `src/lib/templates/*` (builders), `/api/template`
(server-side generation, exceljs), `src/components/templates/
TemplateGallery.tsx` (config UI), homepage teaser card next to the Global
Overview.
