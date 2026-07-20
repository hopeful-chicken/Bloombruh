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

## 3. Analyst's Portfolio (next up)

Adam's own paper portfolio and published letters — the one module that is inherently *his*, not a republished public dataset.

### Core views (priority order)

1. **Portfolio overview** — current paper positions, entry price/date, current price (via the same Twelve Data quote endpoint used by Company Profile), unrealized gain/loss, and a short one-line thesis per position.
2. **Letters** — a simple list of dated, written entries (Adam's own commentary/reasoning) — can start as markdown files rendered as pages, no CMS needed for v1.
3. **Track record** — total paper portfolio return over time, ideally a simple chart once enough history exists.

### Data notes

Position data (what's held, at what price, since when) is Adam's own input — store it as a small JSON/markdown file he edits directly, not fetched from an API. Current prices reuse `src/lib/marketData.ts` (already built for Company Profile).

### Acceptance criteria

- Adam can add/edit a position or letter by editing a plain file, without touching component code.
- Every position shows its thesis in his own words — this is the module's whole point, don't let it become just another data table.

## 4. Future modules (not in scope yet — do not build)

Documented so the shell's architecture anticipates them.

- **Central bank room** (`/macro`): archive of BoE/Fed/ECB statements, simple hawkish/dovish scoring over time, rate decision timeline.
- **Hype vs Fundamentals** (`/hype`): mention velocity/sentiment vs earnings revisions and valuation; divergence flags. The most research-y module; scope carefully later.
