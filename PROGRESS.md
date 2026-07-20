# PROGRESS — Morning Briefing for Adam

This file is updated as work happens. Read top-to-bottom for the latest status. Older entries stay below for history.

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
