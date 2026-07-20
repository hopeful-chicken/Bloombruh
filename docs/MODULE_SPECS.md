# Module Specs

## 1. Terminal shell (built)

The chrome that everything lives inside.

### Features

- **Landing page**: name ("Graduate Analyst Terminal" — placeholder, Adam may rebrand), one-line pitch, cards for each module (live ones clickable, future ones shown as "coming soon"), short "about this project" section naming Adam as builder with a link placeholder for LinkedIn/GitHub.
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

## 3. Pitch Builder (next up — supersedes the earlier "Analyst's Portfolio" idea)

Not Adam's own portfolio — a tool **any student** can use to research a company and build their own investment pitch, then export it as a polished PDF. This is the module that answers "isn't this just a copy of the data provider's website?" — the output is the user's own analysis and judgment, not a republished dataset. Modeled on the "stock pitch" exercise used in real IB/AM/HF interviews and case competitions.

### Core views

1. **Ticker search** (`/pitch`) — same interaction as Company Profile's search, landing on a per-company workbench.
2. **Workbench** (`/pitch/[symbol]`) — pulls in everything Company Profile shows (price, chart, computed momentum/volatility) *plus*, for US SEC-filing companies, real headline fundamentals (revenue, net income, gross profit, total assets, diluted EPS, YoY revenue growth) sourced from SEC EDGAR. Non-US tickers still work, just without the fundamentals panel.
3. **Structured pitch form** (client-side, no login) — the user fills in: a rating (Buy/Hold/Sell), a target price, a written thesis, catalysts, and risks. This is deliberately a structured form, not a freeform rich-text/drag-and-drop editor — keeps v1 scoped and reliable.
4. **Live preview + PDF export** — as the user fills the form, a preview of the assembled one-page pitch updates; a "Download PDF" button produces a clean, presentable document (company header, price history, key stats/fundamentals, and the user's own thesis/rating/target/catalysts/risks) they can actually use or submit somewhere.

### Data notes

See `DATA_SOURCES.md` for the SEC EDGAR integration. No accounts, no database — the whole tool runs client-side after the initial data fetch; the PDF *is* the save/export mechanism, so no persistence layer is needed for v1.

### Acceptance criteria

- Works end-to-end for both a US ticker (fundamentals shown) and a non-US ticker (fundamentals panel gracefully omitted, rest of the tool unaffected).
- The generated PDF is legible and presentable — this needs to be something a student would actually want to attach to an application, not an obvious dev-tool dump.
- Nothing requires a login or writes to a database.

## 4. Future modules (not in scope yet — do not build)

Documented so the shell's architecture anticipates them.

- **Central bank room** (`/macro`): archive of BoE/Fed/ECB statements, simple hawkish/dovish scoring over time, rate decision timeline.
- **Hype vs Fundamentals** (`/hype`): mention velocity/sentiment vs earnings revisions and valuation; divergence flags. The most research-y module; scope carefully later.
