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

## 2. Company Profile Generator (built — flagship)

Ticker in, one clean page out: any public company, searchable in seconds.

### Core views

1. **Ticker search** — the hero interaction (`/profile`). Type a company name or ticker, get an autocomplete dropdown, hit enter or click to go to its profile page.
2. **Profile page** (`/profile/[symbol]`) — current price and day's change, a historical price chart (area chart, daily closes), a grid of key stats (market cap, trailing P/E, 52-week high/low, dividend yield, EPS, shares outstanding, beta), a plain-English company description, and an **analytical context block**: computed, factual comparisons (e.g. "trading X% below its 52-week high," "P/E is Y% above the broader market's long-run average") — not investment advice, just objective context. This context block is the differentiator that satisfies the "analysis, not just data" principle in `PROJECT_BRIEF.md`.

### Data notes

See `DATA_SOURCES.md`. Uses the Twelve Data API (free tier) for quote, company profile, key statistics, and historical daily prices. Requires a free API key (`TWELVE_DATA_API_KEY`) — the module fails gracefully with a clear message if the key is missing or a ticker doesn't exist, rather than crashing.

### Editorial layer

Leave clearly-marked placeholders (`{/* EDITORIAL: Adam to review */}`) on any framing copy so Adam can add his own voice later.

### Acceptance criteria

- Search returns matches from the Twelve Data symbol search within a couple hundred ms of typing.
- Every stat gracefully shows "—" rather than crashing if that field is missing from the API response.
- Data freshness (quote/statistics cache windows) is documented in `DATA_SOURCES.md`, and the module footer/banner notes that quotes may be delayed.

## 3. Pitch Builder (built — block-based report builder)

Not Adam's own portfolio — a tool **any student** can use to research a company and assemble their own investment report, then export it as a polished PDF. This is the module that answers "isn't this just a copy of the data provider's website?" — the output is the user's own analysis and judgment, not a republished dataset. Modeled on the "stock pitch" / comps / LBO / M&A exercises used in real IB/AM/HF interviews and case competitions.

### Core views

1. **Ticker search** (`/pitch`) — same interaction as Company Profile's search, landing on a per-company workbench.
2. **Workbench** (`/pitch/[symbol]`) — pulls in everything Company Profile shows (price, chart, computed momentum/volatility) *plus*, for US SEC-filing companies, the full three-statement picture sourced from SEC EDGAR: multi-year revenue/net income/operating income/EPS history, gross/operating/EBITDA/net margins, balance sheet items (cash, total debt, net debt, working capital, shareholders' equity), cash flow items (operating cash flow, capex, free cash flow), and derived basics (basic/diluted shares outstanding, market cap, enterprise value) — plus computed analytics: beta (regressed against SPY), credit metrics, ROIC, capital allocation, and the core valuation multiples and growth/returns (P/E, EV/EBITDA, EV/EBIT, EV/Sales, P/B, FCF yield, dividend yield, ROE, ROA, revenue/EBITDA/EPS growth — `src/lib/valuationAnalysis.ts`). Non-US tickers still work, just with fewer stats available (shown as "Unavailable", never guessed).
3. **Report type picker** — the user chooses what they're building: **Equity Research / Pitch**, **IB Comps**, **M&A**, or **LBO** — all four are fully selectable, each pre-loading a distinct suggested starter block set for that interview "lens". Switching types rebuilds the block list from the new type's starter set (with a confirmation, since it discards the current blocks).
4. **Block-based report builder** — instead of one fixed form, the user assembles their report out of blocks they add, remove, reorder, and retitle, organized in the "Add a block" menu into labeled sections (Core, Financials & valuation, and one section per interview lens). Block types: custom text (including guided qualitative "lens" prompts like Business & Moat, Bear Case, Ownership & Shareholder Structure, Deal Terms & Synergies, Leverage & Debt Maturities — free-text with a helpful placeholder, not a rigid form), SWOT, bullet list, a stat grid (pick any of the ~45 available metrics, with presets for Core Financials / Valuation Multiples / Growth & Returns / Credit & WACC; anything unavailable for free shows "Unavailable" with an editable override field), a peer comps table, an LBO returns calculator, an M&A accretion/dilution calculator, a **Chart block** (plot price, revenue, net income, or EBITDA history as a line or bar chart), and a **News block** (recent headlines via Google News RSS, with links).
5. **PDF export** — a "Download PDF" button renders the exact current block list (in the user's chosen order, with their titles and inputs) into a clean, presentable document, alongside the company header, price history, and rating/target price. Chart and News blocks render in the PDF too (an inline SVG chart, and clickable headline links).

### Data notes

See `DATA_SOURCES.md` for the SEC EDGAR integration and the beta/comps computation approach. No accounts, no database — the whole tool runs client-side after the initial data fetch; the PDF *is* the save/export mechanism, so no persistence layer is needed for v1.

### Acceptance criteria

- Works end-to-end for both a US ticker (fundamentals + all computed analytics shown) and a non-US ticker (fundamentals-dependent stats gracefully show "Unavailable", rest of the tool unaffected).
- Blocks can be added, removed, reordered, and retitled without errors; each block type's editor and PDF rendering stay in sync (same underlying data, no duplicate state).
- The generated PDF is legible and presentable — this needs to be something a student would actually want to attach to an application, not an obvious dev-tool dump.
- Nothing requires a login or writes to a database.

## 4. Future modules (not in scope yet — do not build)

Documented so the shell's architecture anticipates them.

- **Central bank room** (`/macro`): archive of BoE/Fed/ECB statements, simple hawkish/dovish scoring over time, rate decision timeline.
- **Hype vs Fundamentals** (`/hype`): mention velocity/sentiment vs earnings revisions and valuation; divergence flags. The most research-y module; scope carefully later.
