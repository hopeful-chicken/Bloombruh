# PROGRESS — Morning Briefing for Adam

This file is updated as work happens. Read top-to-bottom for the latest status. Older entries stay below for history.

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
