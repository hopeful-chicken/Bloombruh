# PROGRESS — Morning Briefing for Adam

This file is updated as work happens. Read top-to-bottom for the latest status. Older entries stay below for history.

---

## Session 6 — 2026-07-20 (Deepened the data: full fundamentals, valuation, chart/news blocks, all 4 report types)

### The short version

You tested the block builder from last session and said the report
*structure* was good but the *data* was still insufficient — "at least the
first part datas need to be there otherwise theres nothing to do." This
session was entirely about fixing that:

1. **Full three-statement data** — added working capital, net debt,
   shareholders' equity, operating cash flow, capex, free cash flow, and
   basic/diluted shares outstanding to `secEdgar.ts`.
2. **Valuation, growth, and returns math** (new `valuationAnalysis.ts`) —
   market cap, enterprise value, and the multiples analysts actually quote:
   P/E, EV/EBITDA, EV/EBIT, EV/Sales, P/B, FCF yield, dividend yield, plus
   ROE, ROA, and revenue/EBITDA/EPS growth rates. ~23 new stats, all
   `null`-safe (shows "Unavailable", never a guessed number).
3. **Chart block** — pick price/revenue/net income/EBITDA history, line or
   bar, live preview in the editor and an SVG chart in the PDF.
4. **News block** — recent headlines via Google News' free RSS feed, with
   working links, both in the editor and the PDF.
5. **Qualitative "lens" text blocks** — guided free-text sections (Business
   & Moat, Bear Case, Ownership & Shareholder Structure, Deal Terms &
   Synergies, Leverage & Debt Maturities, etc.) for the four interview
   contexts, each with a helpful placeholder prompt rather than a rigid
   form — same style as the existing Thesis block.
6. **All four report types opened up** — Equity Research, IB Comps, M&A,
   and LBO are all now selectable (previously only Equity Research
   worked), each with its own starter block set. Switching types asks for
   confirmation since it replaces the current blocks.

`npm run build` passes with no TypeScript errors. Smoke-tested a fresh dev
server on `/pitch/AAPL` (all new stats show real numbers, chart renders
with real price/fundamentals data, news block shows real headlines with
working links, all four report types selectable) and `/pitch/SHEL` (every
new SEC-dependent stat gracefully shows "Unavailable", no crash).

### What changed

- `src/lib/secEdgar.ts` — new concepts (operating cash flow, current
  assets/liabilities, basic/diluted weighted-average shares); operating
  income, D&A, and diluted EPS now keep full multi-year history (needed
  for EBITDA/EPS growth).
- `src/lib/valuationAnalysis.ts` (new) — the valuation/growth/returns math
  described above, pure and null-safe.
- `src/lib/news.ts` (new) — Google News RSS fetch + regex parse.
- `src/lib/reportBlocks.ts` — two new block types (`chart`, `news`);
  `BLOCK_LIBRARY` entries now carry a unique `id` (since several entries
  can share a block `type`, e.g. many text presets) and a `group` for the
  "Add a block" menu; new stat-key preset constants for the Financials/
  Valuation/Growth/Credit stat-grid presets.
- `src/components/pitch/blocks/ChartBlockEditor.tsx`,
  `NewsBlockEditor.tsx` (new) — the two new block editors.
- `src/components/pitch/blocks/TextBlockEditor.tsx` — supports a
  placeholder prompt for the guided lens sections.
- `src/components/pitch/ReportBuilder.tsx` — dispatches the two new block
  types; "Add a block" menu now grouped into labeled sections.
- `src/components/pitch/PitchWorkbench.tsx` — all four report types
  clickable with per-type starter block sets; switching types confirms
  first (destructive).
- `src/components/pitch/PitchPdfDocument.tsx` — renders Chart blocks as an
  inline SVG (line or bar) and News blocks as clickable links.
- `src/app/pitch/[symbol]/page.tsx` — computes valuation metrics, fetches
  news, builds the chart-series registry, and expands `availableStats`
  from ~22 to ~45 entries.

### What Adam should look at / decide

- Nothing blocking — this is a pure data/feature deepening, no new
  decisions needed. Worth spending a few minutes in the builder on a
  ticker you know well (try switching between all four report types) to
  see if the new stat coverage and starter sets feel right, or if any
  particular metric/lens is still missing something you'd want.
- The chart's SVG rendering in the PDF is hand-rolled (same technique as
  the existing price sparkline) rather than a real charting library, to
  avoid adding a new dependency — it's simple line/bar shapes, not
  gridlines/axis labels. Fine for now; flag if it ever feels too plain.

### Next up

- Nothing specific queued — Phase 10 in `TASKS.md` is now complete.
  Revisit `docs/PROJECT_BRIEF.md`'s module roadmap for what's next when
  ready.

---

## Session 5 — 2026-07-20 (Pitch Builder becomes a block-based report builder)

### The short version

This was the big one: Pitch Builder went from a fixed rating/thesis/
catalysts/risks form to a **block-based report builder** — you now pick a
report type, then build the report out of blocks you add, remove,
reorder, and retitle yourself. Also added a proper analyst's toolkit
underneath it, using only free data:

1. **Deeper fundamentals** — `secEdgar.ts` now pulls multi-year history
   (not just the latest year) and many more line items: operating income,
   balance sheet items, D&A, capex, dividends/buybacks, interest expense,
   shares outstanding.
2. **Real computed analytics** — beta (an actual regression against the
   S&P 500's ETF, SPY — not a looked-up number, since Twelve Data's free
   tier doesn't give you beta), net debt/EBITDA, interest coverage, ROIC,
   and a dividends+buybacks summary.
3. **Peer comps table** — you type in peer tickers (same as a real analyst
   picking a peer set — there's no free "give me the comps" endpoint
   anywhere) and it builds a P/E, margins, and growth comparison table.
4. **LBO and M&A calculators** — real IRR/MOIC math for a leveraged
   buyout, and real accretion/dilution math for an M&A deal, both as
   blocks you can drop into a report and edit the assumptions on.
5. **The block builder itself** — report type picker (only "Equity
   Research / Pitch" works so far; IB Comps/M&A/LBO are shown as
   "(soon)" so it's honest about scope), block types: custom text, SWOT,
   bullet list, a pick-your-own stat grid (anything not free shows
   "Unavailable" with a box where you type your own number), comps table,
   LBO calculator, M&A calculator. The PDF export renders whatever blocks
   you've built, in your order, with your titles.

`npm run build` passes cleanly. Smoke-tested a genuinely fresh dev server
(not the one left running through all the edits) across `/`, `/pitch`,
`/pitch/AAPL`, `/profile`, `/profile/AAPL` — all 200, no console errors.

### What changed

- `src/lib/secEdgar.ts` — extended to fetch full multi-year fundamentals
  history and the additional line items listed above.
- `src/lib/fundamentalsAnalysis.ts` (new) — credit metrics, ROIC, capital
  allocation, all pure functions on top of the fundamentals data.
- `src/lib/beta.ts` (new) — regresses a symbol's daily returns against
  SPY's over the last year to compute beta.
- `src/lib/comps.ts` (new) + `src/app/api/comps/route.ts` (new) — builds
  the peer comps table server-side (API key stays hidden).
- `src/lib/dealMath.ts` (new) — the LBO and M&A math, pure functions
  shared by both the live block editors and the PDF export.
- `src/lib/reportBlocks.ts` (new) — the block data model: types, factory
  functions, and the `BLOCK_LIBRARY` that drives the "add a block" menu.
- `src/components/pitch/blocks/` (new folder) — one editor component per
  block type (text, SWOT, list, stats, comps, LBO, M&A) plus a shared
  `BlockShell` for the move/remove/retitle chrome.
- `src/components/pitch/ReportBuilder.tsx` (new) — orchestrates the list
  of blocks and the "add a block" picker.
- `src/components/pitch/PitchWorkbench.tsx` — replaced the fixed pitch
  form with the report-type picker + `ReportBuilder`; still keeps
  Rating/Target Price as fixed fields (those aren't really "blocks").
- `src/components/pitch/PitchPdfDocument.tsx` — replaced the fixed
  Thesis/SWOT/Catalysts/Risks sections with a generic `BlockOutput`
  renderer that switches on block type, so the PDF always matches
  whatever you built in the editor.
- `src/app/pitch/[symbol]/page.tsx` — now computes beta, credit metrics,
  ROIC, and capital allocation, and assembles a ~20-entry "available
  stats" list that both the stat-grid block and the PDF pull from.

### Action needed from you
None — everything here runs on data sources you're already using (Twelve
Data, SEC EDGAR) plus calculations this app does itself. No new API keys,
no new costs.

### Known issues / things to check
- The LBO model uses a simplified flat debt-paydown percentage rather than
  a full cash-sweep schedule — real but simplified math, worth knowing if
  you show this to someone who's done a "real" LBO model.
- Beta needs at least 30 shared trading dates of price history between the
  ticker and SPY to compute — very newly-listed tickers will show
  "Unavailable" rather than a shaky number from too little data.
- I saw one `.trim()` browser error in the dev server log partway through
  this session, traced to a stale hot-reload artifact from a browser tab
  left open through many rapid file edits (not a real bug — confirmed by
  code review and a clean fresh-server smoke test afterward with zero
  errors). If you ever see something odd after a long edit session, a
  hard refresh (or restarting the dev server) is the first thing to try.

### Suggested next steps, in order
1. **Try it**: `/pitch/AAPL`, add/remove/reorder a few blocks, try the LBO
   and M&A calculators, build a peer comps table, download the PDF —
   confirm it all looks and feels right to you.
2. **Decide whether to open up the other report types** (IB Comps, M&A,
   LBO) as their own guided flows with suggested starter blocks, now that
   the underlying block system supports it — currently they're just
   available as blocks inside Equity Research.
3. Carried over from last session, still not started: AI grading of a
   pitch (needs a paid LLM key + abuse protection since there's no login)
   and a denser "equity research report" template.

### Nothing broken — safe to continue from here.

---

## Session 4 — 2026-07-20 (Pitch Builder round two: chart ranges, fancier PDF, company info, SWOT)

### The short version

Four improvements to Pitch Builder (and Company Profile, where shared),
all free — no new API keys or costs:

1. **Chart range picker** — 1D / 1M / 3M / 1Y / Max buttons above the price
   chart, on both Company Profile and Pitch Builder.
2. **Fancier PDF** — the exported pitch now has a proper dark "terminal"
   header banner, card-style stat boxes, and section dividers instead of
   plain black-and-white text.
3. **Richer company info** — a plain-English "About" section (sourced from
   Wikipedia) plus jump-off links (Yahoo Finance, SEC EDGAR filings,
   Wikipedia) on both modules.
4. **Your own SWOT** — a Strengths / Weaknesses / Opportunities / Threats
   form in Pitch Builder, which flows into the downloaded PDF. This one
   matters most for the "is this just copying" concern from last session:
   it's your own judgment, not fetched data.

Two bigger ideas from this conversation — an **equity research report
template** (a longer/denser template alongside the pitch one) and **AI
grading of your pitch** — were deliberately **not built yet**. AI grading
in particular needs a paid LLM API key and a way to stop random visitors
from running up your bill (no login on this site), so it needs a bit more
design before it's safe to ship. Flagged as next steps below.

`npm run build` passes cleanly (clean rebuild, `.next` deleted first).
Dev-server smoke-tested: all 5 chart ranges return real data, `/pitch/AAPL`
shows description/links/SWOT, `/pitch/SHEL` degrades gracefully (no
fundamentals, everything else works).

### What changed

- `src/lib/marketData.ts` — generalized time-series fetching into a
  `getTimeSeriesForRange(symbol, range)` helper with a range→interval
  table (1D uses 5-minute bars; Max uses weekly bars so it doesn't ask for
  thousands of daily points).
- `src/app/api/timeseries/route.ts` (new) — proxies range-based chart
  fetches so the API key stays server-side, same pattern as the existing
  search proxy.
- `src/components/profile/PriceChart.tsx` — now owns its own range state
  and range-switch buttons; fetches new data client-side on click.
- `src/lib/companyInfo.ts` (new) — Wikipedia two-step lookup (search →
  summary) for a plain-English description, plus constructed source links
  (Yahoo Finance always, SEC EDGAR filings for US filers, Wikipedia if
  found). No API key needed.
- `src/components/pitch/PitchPdfDocument.tsx` — restyled with a dark
  header banner, amber accent color (matches the site's theme), card-style
  stat boxes, and a new SWOT quadrant layout.
- `src/components/pitch/PitchWorkbench.tsx` — added the About section and
  the four-box SWOT form.

### Action needed from you
None — everything here runs on data sources you're already using (Twelve
Data + the new free Wikipedia lookup). Nothing to sign up for.

### Known issues / things to check
- Wikipedia's description is a best-effort text match on company name — for
  obscure or newly-listed tickers it may find nothing (About section just
  won't show) or occasionally match a slightly wrong article. Worth a spot
  check on a few of your own tickers before relying on it.
- 1D intraday chart data depends on market hours/session — on weekends or
  holidays it'll show the most recent trading day, not "today."

### Suggested next steps, in order
1. **Try it**: `/pitch/AAPL`, switch chart ranges, fill in a SWOT, download
   the PDF — confirm it all looks right to you.
2. **Decide on AI grading**: you asked for this and it's a strong feature,
   but it needs an Anthropic (or similar) API key plus a hard rate limit
   (e.g. one free grade per pitch) since the site has no login to stop
   abuse. Ready to scope this properly whenever you want to move on it.
3. **Equity research report template**: a longer/denser second template
   (business overview, valuation notes, more sections) alongside the
   existing pitch — queued, not yet started.

### Nothing broken — safe to continue from here.

---

## Session 3 — 2026-07-20 (free-tier fix + new flagship: Pitch Builder)

### The short version

Two things happened today, both driven by your feedback.

First, a real bug: once you got a real Twelve Data key, the price and
chart loaded fine but every stat box showed "—". Turns out Twelve Data's
free tier does **not** include the `/profile` or `/statistics` endpoints
(market cap, P/E, dividend yield, etc.) — that needs their paid "Grow"
plan ($29/month), which the docs didn't make obvious upfront. Rather than
asking you to pay, I rebuilt Company Profile to run entirely on the
confirmed-free endpoints (quote + price history) plus numbers computed
directly from that price history: a 50-day moving average, a plain-English
momentum note, and annualized volatility. No paid plan needed.

Second, and bigger: you pushed back again, this time harder — "isn't this
just copying the Twelve Data website?" You're right that a page that only
re-displays someone else's numbers doesn't prove much to an interviewer.
We talked through a bigger idea and landed on it: **Pitch Builder**, the
new flagship-next module. It pulls in real price data and (for US
companies) real financial fundamentals, then hands you a structured form —
your own rating, target price, thesis, catalysts, and risks — and exports
the whole thing as a clean PDF. It's not a data viewer anymore; it's a
tool where the "output" is *your* analysis, not the raw numbers.

`npm run build` passes cleanly. Nothing new is deployed yet.

### What changed

**Company Profile — fixed to use only free data**
- `src/lib/marketData.ts`: removed the paid-only `/profile` and
  `/statistics` calls entirely.
- `src/lib/profileAnalysis.ts`: rewritten around numbers computed from
  price history instead — 50-day moving average, a momentum description,
  and annualized volatility (from daily price swings).
- The profile page's stat grid now shows Open, Previous close, 52-week
  high/low, Volume, Average volume, 50-day average, and Volatility —
  all real, all free.

**New: Pitch Builder (`/pitch`, `/pitch/[symbol]`)**
- Search a company (same autocomplete box as Company Profile).
- Pulls the same real price/chart data, plus — for US, SEC-filing
  companies only — real fundamentals (revenue, revenue growth, net
  income, gross margin, EPS, total assets) from **SEC EDGAR**, the SEC's
  own free public data API. No API key needed for this part at all; non-US
  tickers (e.g. Shell, AstraZeneca) just won't show a fundamentals section,
  which the page explains plainly rather than hiding.
- Below the data: a form for your own Buy/Hold/Sell rating, a target
  price (shows implied upside automatically), a written thesis, and
  catalysts/risks lists.
- A "Download PDF" button turns all of it — your data, your writing — into
  a clean one-page PDF you could genuinely hand to someone. Runs entirely
  in your browser; nothing is saved to a server or database (no login,
  matches this project's "no database in v1" rule).
- `src/lib/secEdgar.ts` is the new server-only wrapper for the SEC data.

**Docs updated:** `docs/DATA_SOURCES.md` (Twelve Data correction + new SEC
EDGAR section), `docs/MODULE_SPECS.md` (Pitch Builder spec replaces the
old "Analyst's Portfolio" idea), `docs/DECISIONS.md` (two new entries
explaining both changes and the "why"), `TASKS.md` (Phase 8 added,
Phase 7/Analyst's Portfolio marked superseded).

### Action needed from you

Nothing new — your existing Twelve Data key (from Session 2) is all that's
needed; SEC EDGAR requires no key or signup at all. Try `/pitch/AAPL` (has
fundamentals) and `/pitch/SHEL` (doesn't — see how it degrades gracefully).

### Known issues / things to check
- Fundamentals only work for companies that file 10-Ks with the US SEC.
  Non-US tickers get price data and the pitch form, just no fundamentals
  section — this is a real, permanent scope limit of the free data
  source, not a bug.
- `EDITORIAL` placeholder copy carried into the new module too — same
  as before, search for it before sharing publicly.

### Suggested next steps, in order
1. **Try building a real pitch end-to-end** (e.g. `/pitch/AAPL`) and
   download the PDF — that's the artifact worth putting in front of an
   interviewer or on a CV.
2. **Deploy** — `docs/DEPLOY.md` still applies; both modules only need the
   one `TWELVE_DATA_API_KEY` environment variable in Vercel (SEC EDGAR
   needs nothing).
3. **Decide what's next**: polish Pitch Builder further, or start on
   Central Bank Room / Hype vs Fundamentals from the original module
   lineup (`docs/MODULE_SPECS.md`) — worth a quick discussion before I
   start either, since both are bigger builds.

### Nothing broken — safe to continue from here.

---

## Session 2 — 2026-07-20 (pivot: SWF Explorer → Company Profile Generator)

### The short version

You tested the site and pushed back on the SWF Explorer, and you were
right to: it just showed NBIM's own public holdings back to them — nothing
about your own thinking. We talked it through and agreed on a pivot: the
SWF Explorer is **gone entirely**, and the new flagship is a **Company
Profile Generator** — a "type a ticker, get a clean one-page profile with
real market data" tool, in the spirit of a mini Bloomberg. It also adds an
**analytical context block** (e.g. "trading 8% below its 52-week high,"
"P/E is above the broad market average") so it's not just a data viewer —
this "analysis, not just data" rule is now the standing design principle
for every future module (see `docs/PROJECT_BRIEF.md`).

`npm run build` passes cleanly. Nothing is deployed yet.

### What changed

**Removed entirely:** the SWF Explorer module — `/swf` routes, its
components, the mock NBIM holdings data pipeline (`scripts/`,
`data-raw/`, `public/data/holdings.json`), and every nav/landing/footer
reference to it. This was your explicit call (not kept as a secondary
module) — see `docs/DECISIONS.md`.

**Built: Company Profile Generator (new flagship)**
- `/profile` — search a company by name or ticker, with a live
  autocomplete dropdown.
- `/profile/[symbol]` — the profile page: current price and day's change,
  a historical price chart, a grid of key stats (market cap, P/E, 52-week
  range, dividend yield, EPS, shares outstanding, beta), a plain-English
  company description, and the analytical context block described above.
- If a ticker doesn't exist, or the API key isn't set up yet, the page
  shows a clear, friendly error message instead of crashing.

**Data source: real market data via Twelve Data (new — requires a free API key)**
- Chose Twelve Data over Finnhub because Finnhub's free tier blocks
  historical price-chart data; Twelve Data's free tier (800 requests/day,
  no credit card) covers everything this module needs under one key.
- The key is read only on the server (`src/lib/marketData.ts`) and never
  reaches the browser — the search box talks to a small proxy route
  instead of the data provider directly.

**Docs updated to match:** `docs/PROJECT_BRIEF.md`, `docs/MODULE_SPECS.md`,
`docs/DATA_SOURCES.md`, `docs/DECISIONS.md` (two new dated entries
explaining the pivot and the Twelve Data choice), and `TASKS.md` (old
phases kept as history, new Phase 6 pivot section added, Phase 7 —
Analyst's Portfolio — queued up next).

### Action needed from you: get a free API key

The Company Profile pages won't show real data until you do this
(~2 minutes, no credit card):
1. Sign up free at [twelvedata.com/pricing](https://twelvedata.com/pricing) (Basic/free plan).
2. Copy the key it gives you.
3. In the project folder, copy `.env.local.example` to a new file named
   `.env.local`, and paste your key in as `TWELVE_DATA_API_KEY=your-key-here`.
4. Restart the dev server. That's it — `.env.local` is already set up to
   never be committed to git.

### Known issues / things to check
- No API key is set up yet in this environment, so `/profile/[symbol]`
  pages currently show the graceful error state rather than real data —
  expected until you do the step above.
- Editorial placeholders (`EDITORIAL` comments) carried over into the new
  module's copy — same as before, search for them before sharing publicly.

### Suggested next steps, in order
1. **Get your Twelve Data API key** (above) and confirm a real profile
   page (e.g. `/profile/AAPL`) loads with live numbers.
2. **Build Analyst's Portfolio next** — this is queued as Phase 7 in
   `TASKS.md`: your own paper portfolio positions and dated letters, the
   one module that's inherently *yours* rather than republished public
   data.
3. **Deploy once you're happy with Company Profile** — `docs/DEPLOY.md`
   still applies; just remember to add `TWELVE_DATA_API_KEY` as an
   environment variable in Vercel's project settings too, not just
   locally.

### Nothing broken — safe to continue from here.

---

## Session 1 — 2026-07-20 (full overnight session, Phases 0–4 complete)

### The short version

The site is built and working. `npm run build` passes cleanly. You have a
live-feeling SWF Explorer with search, a portfolio dashboard, country
drill-downs, and a voting placeholder — all running on a clearly-labeled
**mock dataset** (not real NBIM numbers yet). Nothing is deployed — that's
the one step left for you, and `docs/DEPLOY.md` walks you through it.

### What got built

**Environment & scaffold**
- Installed Node.js (via `nvm`) and initialized git, since this machine had
  neither.
- Scaffolded the app with Next.js (App Router) + TypeScript + Tailwind CSS,
  exactly per `CLAUDE.md`.

**Data pipeline (mock, not yet real NBIM data)**
- Built `scripts/generate-mock-holdings.mjs`: generates ~200 real, well-known
  companies (Apple, Shell, HSBC, AstraZeneca, etc.) with realistic-but-fake
  position sizes, using a fixed random seed so the output is reproducible.
  Total portfolio value targets ~$1.6tn, roughly NBIM's real scale.
- Output lives at `public/data/holdings.json`, tagged `isMockData: true`
  everywhere, plus a "MOCK DATA" badge shown in the site's footer and module
  banner.
- `scripts/README.md` documents the exact one-step swap to real data later:
  drop NBIM's real file in `/data-raw/`, write one new processing script
  that outputs the same JSON shape with `isMockData: false`, done.

**Terminal shell**
- Dark, amber-accented, monospace-for-numbers layout, per the design brief.
- Top nav with a global search box (press `/` to focus it), footer with
  data attribution/disclaimer and your (placeholder) links.
- Landing page: pitch, 5 module cards (SWF Explorer live, four others marked
  "coming soon" per `docs/MODULE_SPECS.md`), about section.

**SWF Explorer module (the core deliverable)**
- `/swf` — company search: type a name or ticker ("Apple", "Shell", "AAPL"),
  get a result card with NBIM's stake value, % of the company owned, % of
  NBIM's total portfolio, country, and sector.
- `/swf/dashboard` — headline numbers (total value, companies, countries,
  sectors), a region pie chart, a sector bar chart, and a top-20 holdings
  table.
- `/swf/country/[country]` — every country NBIM holds something in gets its
  own page; the UK page additionally gets an "FTSE 100 spotlight" callout
  showing NBIM's position in every FTSE 100 constituent it holds.
- `/swf/voting` — placeholder tab (real voting data ingestion was judged too
  big a job for one overnight session; the placeholder explains what's
  coming, per the fallback plan in `docs/MODULE_SPECS.md`).
- Every page with subjective/promotional copy is marked with an
  `{/* EDITORIAL: Adam to review */}` comment so you know exactly what's
  placeholder voice vs. finished.

**Phase 4 stretch items completed**
- SEO/social-share metadata (OpenGraph + Twitter card tags) so links shared
  on Slack/Twitter/iMessage show a proper title and description.
- `docs/DEPLOY.md` — plain-English, step-by-step guide to pushing this to
  GitHub and deploying it on Vercel's free tier. **Deployment was
  deliberately left for you to do**, per `CLAUDE.md`'s instruction.

**Not attempted (out of scope for this session)**
- Year-over-year comparison view — skipped, since only one year of (mock)
  data exists. Worth revisiting once real multi-year NBIM data is in.

### Decisions made this session (see `docs/DECISIONS.md` for full detail)
1. Module 1 stays NBIM-specific (your call).
2. Started on mock data instead of blocking on real NBIM downloads (your
   call) — **the numbers in the app right now are fake.** Don't share this
   publicly or put it on a CV until the real data swap happens.
3. Auto-accept was enabled for this session so work could continue
   unattended overnight (scoped to this project only, in
   `.claude/settings.local.json`).
4. Deployment left for you to do manually — see `docs/DEPLOY.md`.

### Known issues / things to check
- Git commits in this repo use a placeholder identity
  (`Adam <adam@example.com>`) since no global git identity was set on this
  machine. Run `git config --global user.name "..."` and
  `git config --global user.email "..."` whenever convenient — not urgent.
- The footer and landing page "About" section both have placeholder
  LinkedIn/GitHub links — search for `EDITORIAL` comments to find every spot
  that needs your real info or wording before this goes public.
- All portfolio numbers are synthetic (see mock data note above).

### Suggested next steps, in order
1. **Review the editorial placeholders.** Search the codebase for
   `EDITORIAL` (5 spots) and swap in your own voice/links. This is the
   fastest way to make the site feel like "yours."
2. **Deploy it.** Follow `docs/DEPLOY.md` — about 10 minutes, mostly
   clicking buttons on Vercel's site. You'll get a live URL to share.
3. **Start the real NBIM data swap.** Once you're ready to replace mock
   numbers with the real thing, `docs/DATA_SOURCES.md` has NBIM's actual
   data URLs and `scripts/README.md` explains the one-step process to plug
   real data into everything already built (search, dashboard, charts,
   country pages all update automatically — nothing else needs to change).

### Nothing broken — safe to continue from here.

---

## Session: Rebrand to "Bloombruh" + dark/light theme + split-view Pitch Builder (2026-07-20)

You tried the deepened Pitch Builder and gave three pieces of feedback, all
addressed this session:

1. **"Just be able to see the metrics and financials as data, not something
   to select"** — the company data now shows as a plain, always-visible
   dashboard (`DataDashboard.tsx`): header, chart, key stats, context, about,
   then every fundamentals/valuation/growth/credit stat (~45 in total),
   grouped into labeled sections, then news — all read-only cards, no
   checkboxes, ordered general-to-specific.
2. **A clear split between "just look" and "build my own report."** The
   Pitch Builder page now defaults to that full data dashboard plus a
   "Build your own report →" button. Clicking it splits the page into two
   panes: the data dashboard stays visible (scrollable) on the left, the
   report builder (report type, rating, target price, blocks, PDF export)
   is on the right. Nothing is lost switching back and forth — the report's
   blocks/rating/target price live in the same component regardless of
   which view is showing. News headlines are always visible in the
   dashboard *and* can still be added as a block/appendix in the exported
   report (so a student can quote or footnote them).
3. **Site-wide dark/light theme.** A small toggle (top-right of the nav)
   switches between dark (same terminal look, but blue accent instead of
   amber) and light (white background, green accent). No new library —
   it's a CSS class + `localStorage`, with a tiny script that applies the
   saved theme before the page paints so there's no flash of the wrong
   theme on reload.
4. **Renamed the whole project to "Bloombruh"** — nav, landing page,
   footer, PDF export, `package.json`, and every planning doc.

### What changed under the hood
- `src/app/globals.css` — new light theme palette; dark theme's accent
  swapped amber → blue. Gain/loss colors (the red/green for price moves)
  were deliberately left alone in both themes so "up"/"down" always mean
  the same thing regardless of accent color.
- New: `src/components/ThemeToggle.tsx`, `src/components/Stat.tsx` (shared
  stat card, previously duplicated in three places), `src/components/pitch/
  NewsList.tsx` (shared headline list), `src/components/pitch/
  DataDashboard.tsx`.
- `src/components/pitch/PitchWorkbench.tsx` — restructured around a
  `showBuilder` boolean instead of one long scrolling page.
- Verified: `npm run build` passes clean; fresh dev server smoke-tested `/`,
  `/profile/AAPL`, `/pitch/AAPL` (default dashboard view has no checkboxes,
  News shows without adding a block, split view renders both panes), and
  `/pitch/SHEL` (non-US ticker — dashboard gracefully shows "Unavailable"
  for SEC-only stats, no crash).

### Known issues / things to check
- The PDF export wasn't re-verified by actually clicking "Download PDF" in
  a browser this session (only confirmed the code compiles and the accent
  color/branding strings were updated) — worth a quick manual check next
  time you're in the app.
- Same placeholder LinkedIn/GitHub links as before — still marked with
  `EDITORIAL` comments, still waiting on your real links.

### Nothing broken — safe to continue from here.
