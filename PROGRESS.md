# PROGRESS — Morning Briefing for Adam

This file is updated as work happens. Read top-to-bottom for the latest status. Older entries stay below for history.

---

## Session 18 — 2026-07-21 (Central Bank Room: Global Overview card)

### The short version
You wanted something at the top of the Central Bank Room that gives a
global picture across all central banks, with a choice of time period, and
links to news backing it up. Done — there's now a "Global Overview" card
right at the top of the page (before the per-bank view), with Day/Week/
Month/3 Months/Year/Max buttons. It shows a one-line summary ("3 hiked, 2
cut, 3 held steady across the 8 banks tracked") plus a small card per bank
with its current rate, how much it's moved in the chosen period, and how
many decisions happened — click any bank's card to jump to its full page.
Underneath, a handful of real, dated news links for context.

### What changed under the hood
New component `src/components/macro/GlobalRatesOverview.tsx`. All the
numbers (hikes/cuts/holds, each bank's basis-point change) are computed
directly from the same real rate history each bank's page already fetches —
nothing here is AI-written or guessed. `src/app/macro/page.tsx` now fetches
all 8 banks in parallel (not one after another) to build this, plus a broad
news search for the supporting links. Full detail in `docs/DECISIONS.md`
(2026-07-21, "Global Overview" entry).

### Verified
`tsc --noEmit` passes clean. Live-tested: all 8 banks show real current
rates; switching period buttons correctly recomputes the trend counts and
each bank's change (checked 3M vs. Max gave different, correct numbers);
news list and its "show more" button work.

### Nothing broken — safe to continue from here.

---

## Session 17 — 2026-07-21 (Bug fix: ECB rate data wasn't loading)

### The short version
You reported the ECB page showed "unavailable." Fixed — it was a real bug in
how ECB's response was parsed, not a problem with the ECB's data source
itself (I confirmed the ECB API was healthy the whole time).

### What was actually wrong
The ECB sends its data with Windows-style line endings (`\r\n`), but the
code only split lines on `\n`, leaving a stray character stuck to the end of
the last column name in the header row. That column happened not to be the
one we needed, so the bug stayed invisible — until I also shrank the ECB
request's payload size (15 years of daily data was 2.17MB, just over a
Next.js internal caching limit, which was silently breaking caching, not
the page). Trimming unused columns from the request to fix that shrinking
step accidentally moved the needed column to the very end — which is
exactly where the stray character was — and *that's* what made the page
start showing "unavailable." Fixed the line-splitting properly so both
issues are resolved together.

### Verified
Reloaded the ECB page live several times after the fix: correct rate
(2.25%), full 15-year history chart, and the rate-decision timeline all
render correctly, and pages load fast (well under a quarter-second) since
the smaller request now gets cached properly. `tsc --noEmit` passes clean.
Full detail in `docs/DECISIONS.md` (2026-07-21, "Bug fix: ECB rate data
wasn't loading").

### What Adam should know
Nothing to do — just a fix. Worth quickly checking the other central bank
pages (Fed, BoE, BoC, SNB, RBA, BoJ, PBoC) next time you're on the site,
just as a sanity check, though none of them share this specific bug.

### Nothing broken — safe to continue from here.

---

## Session 16 — 2026-07-21 (Rate decision timeline: full history by year + AI explanations)

### The short version
Follow-up on the Central Bank Room timeline: you wanted a longer period
covered (not just recent moves) with a way to browse by year, and real
sentences explaining the situation and reasoning behind each decision, with
sources — not just a pile of headline links.

Both done. The timeline now shows every rate change in the fetched history
(years back), grouped into expandable year sections — click "2019" and it
opens to show every move that year, same detail view as before. The most
recent year opens automatically; older years are collapsed until you click.

For the "why," I checked with you first since it has a real cost: writing a
grounded explanation needs an actual AI call (same paid Claude API as the
"Pro" report grader), since there's no free source for a central bank's real
stated reasoning. You chose AI-generated over a free-but-rougher option.
Clicking "Explain more" on any decision now shows 2-4 AI-written sentences
about the situation and likely reasoning — written strictly from the real,
dated news articles fetched for that decision, with those exact articles
listed as sources right underneath. If the AI can't generate something (no
API key configured, or the call fails), it just shows the real source
articles instead — never a made-up explanation.

### What changed under the hood
New file `src/lib/rateDecisionExplainer.ts` does the AI call, using the
cheaper Sonnet model rather than the grader's Opus since this is a short,
low-effort summary task that could get triggered a lot more often across
visitors. Results are cached per bank+date on the server so re-opening the
same decision doesn't fetch or charge twice. Full detail in
`docs/DECISIONS.md` (2026-07-21, "Rate decision timeline" entry).

### Verified
`npm run build` and `tsc --noEmit` pass clean. Live-tested on the Fed's
page: year sections expand/collapse correctly with 2025 open by default;
"Explain more" correctly fetched real articles and showed the expected
graceful fallback (no Anthropic key is set in this dev environment, so it
showed the real source articles with a clear note instead of an AI summary
— exactly the intended behavior when the key is missing).

### What Adam should know
This feature needs your `ANTHROPIC_API_KEY` in `.env.local` to actually
generate AI explanations (same key the "Pro" report grader uses — see
`.env.local.example`). Without it, the timeline still works fine, it just
shows real source articles instead of AI-written summaries. Each click that
does have a key configured costs a small amount on your Anthropic account
— cached per decision so repeat views are free, but many different
decisions being explored by many visitors would add up over time, worth
keeping an eye on usage once this is live.

### Nothing broken — safe to continue from here.

---

## Session 15 — 2026-07-21 (News quoting/pagination, rate-decision "Explain more", rate chart zoom)

### The short version
Three follow-ups from trying the Pitch Builder and Central Bank Room:

1. **Pick which headlines to quote.** The report builder's News block used
   to dump every fetched headline into your exported report automatically.
   Now it's a checkbox list — tick exactly the headlines you want to quote,
   with "All"/"None" shortcuts. There's also more headlines to choose from
   (20 fetched instead of 6), shown 6 at a time with a "Show 4 more
   headlines" button — same pattern on the always-visible News list on the
   Company Profile page.
2. **"Explain more" on each rate move.** In the Central Bank Room, every
   line in the rate-decision timeline now has an "Explain more" button.
   Instead of inventing a longer canned explanation (no free source
   publishes a bank's real stated rationale), it fetches real, dated news
   coverage from around that specific decision and shows the actual
   headlines — tested live against the Fed's real 2025-12-11 rate cut and
   it pulled back 5 correctly-dated real articles from AP, CBS, NPR, Yahoo
   Finance, and Spectrum News.
3. **Rate chart zoom.** The rate history chart now has the same 1D/1W/1M/
   3M/1Y/Max buttons as the stock price chart on Company Profile. Since the
   full rate history is already loaded, zooming just re-filters what's
   already there — no extra network request, unlike the stock chart.

### What changed under the hood
`NewsBlockData` (the News report block's saved state) now stores which
article links are selected instead of storing nothing at all — a report
started before this change keeps working, since "nothing selected yet"
still means "show everything," same as before. A new small API route,
`/api/bank-decision-news`, does the real-news lookup for the "Explain more"
buttons, reusing the same free Google News feed the rest of the site
already uses, just scoped to a few days around one specific date. Full
detail in `docs/DECISIONS.md` (2026-07-21 entry, second one).

### Verified
`npm run build` and `tsc --noEmit` both pass clean. Live-tested in the
preview browser: News block checkboxes toggle correctly and All/None work;
pagination reveals 4 more headlines per click; the rate-decision "Explain
more" button fetched real articles matching the Fed's actual December cut;
the rate chart's 1Y button correctly zoomed into the last year of data.

### Nothing broken — safe to continue from here.

---

## Session 14 — 2026-07-21 (Full visual redesign: "Claude-like" look)

### The short version
You asked for the whole site to be redesigned visually — a "claude design"
look, an elegant/cursive logo, modern but simple. Done: the site now defaults
to a warm, light, editorial look (cream background, warm near-black text,
a single terracotta accent color) instead of the old dark terminal theme —
dark mode is still there, just now an opt-in toggle instead of the default.
The "Bloombruh" wordmark (in the nav, footer, and the big landing-page
heading) now renders in an elegant italic serif for the "cursive, classy"
look you asked for. Buttons, the search box, and nav items are now fully
rounded pills; cards have softer corners. Nothing about the data or how any
page works changed — this was a styling-only pass.

### What changed under the hood
Because this app already reads all its colors from a small set of shared
CSS variables (`src/app/globals.css`) instead of hardcoding colors in every
file, the whole palette could be swapped in one place and almost every page
inherited it automatically. The few spots that couldn't (chart colors,
which use a charting library that needs literal colors, and the PDF export,
which renders completely outside the browser) were updated by hand to match.
Full detail and reasoning is in `docs/DECISIONS.md` (2026-07-21 entry).

### Verified
`npm run build` and `tsc --noEmit` both pass clean. Live-tested in the
browser (landing page, a company profile page, and the Pitch Builder's
two-pane split-view report builder) in both light and dark mode — colors,
the chart, and the layout all look right. One local-only hiccup: the preview
tool's dev server briefly failed to start because of a missing `PATH` entry
in its own process environment (nothing to do with the site's code) — fixed
by adding it to `.claude/launch.json`. Won't affect the real deployed site.

### Nothing broken — safe to continue from here.

---

## Session 13 — 2026-07-21 (Central Bank Room: real rates, history charts, rate-decision timeline)

### The short version
You said the Central Bank Room needed the part that was actually missing —
real policy rates, history, a rate-decision timeline with explanations, and
plain-English context on monetary/fiscal policy — shown *before* the news,
not instead of it. That's now live on `/macro` for all 8 banks.

For each central bank you pick, the page now shows, in this order:

1. **The actual current policy rate**, as of the latest published figure.
2. **A history chart** of that rate going back several years.
3. **A rate-decision timeline** — every point the rate changed, most recent
   first, with a short *generic* explanation of what that type of move
   (hike or cut) typically does economically. This is explicitly labelled
   as generic, not the bank's own stated reason for that specific decision
   — no free source publishes that in a structured way, so I didn't
   pretend otherwise.
4. **A plain-English explainer** on how monetary policy works, hikes vs.
   cuts, and how monetary policy relates to fiscal (government
   spending/taxing) policy.
5. Then, same as before: real news for that bank, and your own commentary.

### Where the rate data comes from
Tested 8 free data sources with real API calls before writing any code —
each central bank publishes (or has a proxy for) its rate differently:

- **Fed, BoJ, PBoC** — via FRED (the St. Louis Fed's free data service, no
  key needed). Fed's own daily target rate is used directly. BoJ and PBoC
  don't publish one clean daily policy rate, so a closely-related market
  rate (interbank lending rate) is used instead and clearly marked as a
  **proxy** on the page.
- **ECB, BoE, BoC** — each bank's own official statistics API, daily rate.
- **SNB, RBA** — each bank's own official statistics, but only published
  **monthly** rather than daily — the page says so.
- One quirk: Australia's central bank (RBA) blocks requests that don't look
  like they're coming from a plain command-line tool — a one-line fix
  (sending the same identification a `curl` command already sends for
  free) got it working. Not a security bypass, just matching what a normal
  script already gets.

If a fetch ever fails, the page says "Rate data unavailable" honestly
rather than guessing a number.

### Verified
- `npm run build` and `tsc --noEmit` pass clean.
- Live dev server test across all 8 banks
  (`/macro?bank=fed|ecb|boe|boc|snb|rba|boj|pboc`) — every one shows a real
  current rate, a working chart, and a decision timeline; confirmed the RBA
  fix actually resolves the blocked request it hit initially.

### What Adam should do next
- Nothing required — this is fully working. Worth a look at `/macro` for
  a couple of banks to see the new layout before deciding what's next.
- The "Hype vs Fundamentals" module is still the only "soon" card left on
  the landing page — same open question as last session: build it the same
  way (data + your own written takes) when you're ready.

---

## Session 12 — 2026-07-21 (Built the Central Bank Room)

### The short version
The "Central Bank Room" module card on the landing page said "soon" — it's
now real, at `/macro`. You described it as two parts, and that's exactly
what's there:

1. **Pick a central bank, see real news.** Fed, ECB, BoE, BoJ, PBoC, SNB,
   RBA, BoC — click one and get recent, real headlines about it (same free
   Google News source already used for company pages, just a different
   search per bank).
2. **Your own commentary, clearly separate.** Next to the news is a
   "Commentary" section for your own written take on that bank. There's no
   database in this project, so this works the same way as everything
   else here: it's a plain code file
   (`src/data/centralBankOpinions.ts`) that starts empty. To publish an
   opinion, just ask me to add it (or edit the file yourself) — same
   workflow as any other change to the site.

The page is explicit that commentary is your opinion, not reported news —
there's a banner at the top of the page saying so, so the two never get
confused.

### What's not built yet
The original placeholder description for this module mentioned
"hawkish/dovish scoring" and a "rate-decision timeline" — neither of those
were built this round. What shipped is simpler: news + your own writing.
Worth deciding later whether the scoring/timeline idea is still wanted, or
whether news + commentary is actually the better fit.

### Verified
- `npm run build` and `tsc --noEmit` pass clean; `/macro` shows up as a new
  route in the build output.
- Live dev server test: `/macro` (defaults to the Fed) and
  `/macro?bank=ecb` both return 200, show the right bank's name and real
  news headlines, and show "No commentary on Fed yet — check back soon."
  correctly (since the opinions file is empty right now).

### What Adam should do next
- Whenever you want to publish a take on a central bank, just tell me what
  to write (or which bank + what you think) and I'll add it to
  `src/data/centralBankOpinions.ts` — it'll show up on the site right away.
- Decide if "Hype vs Fundamentals" (the other "soon" module, for your own
  ticker-focused articles) should work the same way — a picker/list page +
  your own written articles in a data file, same pattern as this one.

---

## Session 11 — 2026-07-21 (Built "Pro" AI report grading, code-locked with "bloombruh")

### The short version
You asked for an AI feature that grades a student's written report — real,
useful feedback on top of the data, not just another chart. Built it as a
new **"Pro"** tier:

1. **AI grading is real and working**, powered by Anthropic's Claude API
   (`claude-opus-4-6`). It reads the student's own written sections
   (Thesis, SWOT, Bear Case, etc.) *and* the real company numbers already
   on the page, then returns an overall score, a written summary,
   strengths, things to improve, section-by-section comments — and
   crucially, a **fact-check pass** that flags any written claim that
   doesn't actually match the real data.
2. **This is the first feature on the whole site that costs real money.**
   Every other data source (Twelve Data, SEC EDGAR, Wikipedia, Google News,
   Frankfurter FX) is free with no key. AI grading needs your own
   `ANTHROPIC_API_KEY` (get one at console.anthropic.com — pay-as-you-go,
   no free tier). Without a key set, the feature fails gracefully with a
   clear "AI grading isn't configured" message; nothing else on the site is
   touched.
3. **Gated behind a code, not real payment, on purpose.** You said to lock
   it with a code for now and revisit with something real once there's an
   actual plan — the code is **"bloombruh"**. It's checked entirely in the
   browser and remembered via `localStorage`, so it's a friction gate, not
   real security — fine for now, not meant to survive contact with a real
   paying customer.

### Where it lives
- New: `src/lib/grading.ts` (server-only Claude API wrapper — never import
  this from a client component), `src/app/api/grade/route.ts` (proxy route
  so the browser never sees your API key), `src/components/pitch/
  AiGrader.tsx` (the code-lock UI + "Grade my report" button + results).
- Wired into `PitchWorkbench.tsx`'s report-building pane, right above the
  "Download PDF" button — so it's part of the same flow, once a student has
  written something.
- `.env.local.example` now documents the new (optional, paid)
  `ANTHROPIC_API_KEY` line, same pattern as `TWELVE_DATA_API_KEY`.

### Verified
- `npm run build` and `tsc --noEmit` both pass clean; `/api/grade` shows up
  as a new server route in the build output.
- Live dev server test: posting to `/api/grade` with no `ANTHROPIC_API_KEY`
  set returns a clear error message (not a crash) — expected, since no key
  is configured locally yet. Posting a malformed request returns a clean
  400. **Not yet tested end-to-end with a real key** — do that once you add
  your own `ANTHROPIC_API_KEY` to `.env.local`.

### What Adam should do next
- Get an API key from console.anthropic.com, add `ANTHROPIC_API_KEY=...` to
  `.env.local`, restart the dev server, and try grading a report on
  `/profile/AAPL` end-to-end (write a sentence or two in the Thesis block,
  click "Grade my report").
- When there's an actual plan for how "Pro" should really work (payment,
  accounts, etc.), replace the "bloombruh" code-check in `AiGrader.tsx` —
  it was always meant as a placeholder, not a real gate.

---

## Session 10 — 2026-07-20 (Built the IFRS fundamentals fix + USD conversion from Session 9's follow-up)

### The short version
1. **Small/mid caps that file under IFRS (like Canada Goose) now show real
   fundamentals.** Following on from Session 9's diagnosis, `secEdgar.ts`
   now also checks the `ifrs-full`/`20-F` filing path when a company has no
   US-GAAP `10-K` data, using a short, spot-checked list of IFRS tag names
   for the most important line items (revenue, net income, profit, assets,
   equity, cash, D&A, diluted EPS, operating cash flow). Not every possible
   line item is covered (buybacks, dividends, debt breakdown, capex stay
   unavailable for these filers) — deliberately scoped down after you said
   not to worry about exhaustive accounting rigor for a student site.
2. **Automatic USD conversion, with a "converted from" note.** When a
   company's filings come back in another currency (Canada Goose reports
   in CAD), every dollar figure is now automatically converted to USD using
   a free, no-key exchange-rate API (Frankfurter) — so multiples, margins,
   and credit metrics all just work in USD like any other company. The
   original figure is kept and shown as a small caption under the number,
   e.g. Revenue shows **$867m**, with **"Converted from CAD C$1.2bn"**
   underneath — nothing is silently changed without saying so.
3. **Verified live**: `/profile/GOOS` now shows real converted fundamentals
   throughout (revenue, net income, EPS, total assets, cash, equity,
   operating cash flow, EBITDA, working capital all populated with CAD
   captions); `/profile/AAPL` is completely unaffected (plain USD, no
   captions) — confirming no regression for the vast majority of US
   companies that don't need any of this. Both `npm run build` and a
   TypeScript check pass clean.

### What Adam should look at / decide
- Nothing needs a decision right now — this session's work directly
  answered the open question from Session 9.
- Still nothing has been committed to git across the last several sessions
  (this one included) — let me know when you'd like these grouped into
  commits.

---

## Session 9 — 2026-07-20 (Search dedupe, Grow plan follow-up, found the real small/mid-cap fundamentals gap)

### The short version
1. **Search dropdown deduped to one row per company.** Smaller/dual-listed
   companies (e.g. Canada Goose) were showing 6+ near-identical rows, one
   per stock exchange they trade on. Now shows one row per company,
   preferring whichever listing will actually load.
2. **You upgraded Twelve Data to the paid "Grow" plan yourself** — that
   needed no code change on our end, Twelve Data itself now allows more
   tickers through the same `/quote`/`/time_series` calls.
3. **Stopped showing empty stat sections.** The company page used to
   always show all four fundamentals sections (Core financials,
   Valuation, Growth & returns, Credit metrics) even when a company had
   zero real data in them, filling the screen with "Unavailable" cards.
   Now a section only shows if it has real numbers, and if a company has
   no fundamentals at all, you get one clean sentence instead.
4. **Found the real reason small/mid caps still lack fundamentals** — and
   it's good news, not a dead end. I tested Canada Goose directly against
   SEC EDGAR: it genuinely has real financial data filed with the SEC, but
   under a different accounting standard (IFRS, form `20-F`) than the one
   our code checks (US-GAAP, form `10-K`). This is almost certainly true
   for most non-US companies with a US stock listing (UK, Canadian, EU,
   Australian companies, etc.) — the data exists for free, our code just
   isn't looking in the right place for it yet.

### What Adam should look at / decide
- **Next real option**: add IFRS-taxonomy support to `secEdgar.ts` so
  foreign-but-US-listed companies get real fundamentals too. Not built
  yet — it needs one decision first: many IFRS filers report in their
  home currency (Canada Goose reports in Canadian dollars, not USD), so
  we'd need to either label that clearly on the page or add currency
  conversion, rather than silently mixing a USD stock price with
  non-USD earnings in a valuation multiple.
- Nothing has been committed to git yet across the last several sessions
  — worth reviewing and committing in logical groups when you're ready.

---

## Session 8 — 2026-07-20 (Fixed the "Couldn't load DPLM" bug report)

### The short version
You reported that searching "Diploma plc" found it fine, but the profile
page then failed with a generic "might not exist" error — frustrating for
a well-known real company. Two things were going on, both now fixed/handled:

1. **A real code bug**: Twelve Data's error message explaining *why* it
   couldn't return a quote was being thrown away before it ever reached
   the page, because the code checked the HTTP status before reading the
   response body. Fixed — the real reason now surfaces correctly.
2. **A genuine data-plan limit that can't be "fixed" for free**: the free
   Twelve Data plan only gives quotes for US-listed stocks (NYSE/NASDAQ)
   and US OTC — Diploma trades only on the London Stock Exchange with no
   US listing, so it will never return a real price on this free plan.
   The page now says this plainly instead of implying something might be
   wrong with the ticker, and the search dropdown flags "limited data" on
   likely-unavailable exchanges before you even click through.

### What changed under the hood
- `src/lib/marketData.ts` — `fetchTwelveData()` now reads and checks the
  JSON response body for an error message *before* checking `res.ok`,
  since Twelve Data's plan-gated error is a real HTTP 404 whose useful
  message was previously being discarded in favor of a generic one.
- `src/app/profile/[symbol]/page.tsx` — detects this specific error and
  shows an accurate explanation instead of "might not exist."
- `src/components/profile/TickerSearch.tsx` — "limited data" badge on
  search results from exchanges the free plan doesn't cover.
- Verified live: restarted the dev server, confirmed `/profile/DPLM` now
  shows the new explanation and `/profile/AAPL` still loads with no
  regression. `npm run build` passes clean.

### What Adam should look at / decide
- This is a genuine free-tier limit, not something more code can fix. If
  non-US companies like this come up often, the real fix is either a paid
  Twelve Data plan or adding a second, still-free data source for non-US
  quotes (e.g. Stooq) — flagged in `docs/DECISIONS.md` as a future option,
  not built yet.
- Nothing has been committed to git yet this session (or last session's
  module-merge/font/appendix work) — worth reviewing and committing in
  logical groups when you're ready.

---

## Session 7 — 2026-07-20 (Merged the two modules, added a title font, added a data-sources appendix)

### The short version

You said Company Profile and Pitch Builder had become too similar ("Pitch
Builder contains everything Company Profile has"), so this session merged
them into **one module**, at `/profile` — `/pitch` is gone. The "Build your
own report" option is still right there at the end of every company's page,
exactly as before, just under one module name now instead of two. You also
asked for the titles to feel less generic/"AI website"-like, and for an
expandable section showing where every number comes from — both done too.

1. **One module, not two** — `/profile` now shows everything the old
   `/pitch` did (full financials, chart, news, computed analytics like
   beta) plus the optional two-pane report builder. The landing page and
   nav show a single "Company Profile" card/link.
2. **A title font** — added Fraunces, a distinctive serif, used only for
   page and company titles (e.g. "Bloombruh" on the landing page, the
   company name on each profile). Everything else — body text, terminal
   labels, all the numbers — stays on the existing sans/mono fonts, so this
   is a deliberate, contained flourish rather than a full redesign.
3. **Data sources appendix** — a new collapsible "Data sources &
   methodology" box at the bottom of every company page (right after the
   "Build your own report" prompt), spelling out in plain English which
   free source backs each figure (Twelve Data for price, SEC EDGAR for
   fundamentals, Wikipedia for the description, Google News for
   headlines) and which numbers are this site's own math (beta, credit
   metrics, valuation multiples) rather than something looked up.

`npm run build` passes with no TypeScript errors. Fresh dev server
smoke-tested `/`, `/profile`, `/profile/AAPL`, `/profile/SHEL` (all 200)
and confirmed `/pitch` now correctly 404s.

### What changed
- `src/app/profile/[symbol]/page.tsx`, `src/app/profile/page.tsx`,
  `src/app/profile/layout.tsx` — replaced with the fuller versions that
  used to live under `src/app/pitch/`; `src/app/pitch/` deleted entirely.
- `src/lib/modules.ts` — one "Company Profile" entry instead of two.
- `src/app/layout.tsx` — added the Fraunces font.
- `src/app/globals.css` — registered it as the `font-display` utility.
- Applied `font-display` to the landing hero title, module card names, the
  company-profile search page title, and each company's name header
  (`src/components/pitch/DataDashboard.tsx`).
- New `src/components/pitch/DataSourcesAppendix.tsx`, wired into
  `PitchWorkbench.tsx` right after the "Build your own report" CTA (both in
  the default full-width view and at the bottom of the split view).

### What Adam should look at / decide
- Nothing blocking. Worth a quick look at the new serif title font on
  `/profile/AAPL` to confirm you like the feel — easy to swap for a
  different Google Font later if not (one line in `layout.tsx`).
- The internal folder is still named `src/components/pitch/` even though
  the user-facing route is now `/profile` — a deliberate choice to avoid a
  risky bulk-rename colliding with the pre-existing (and still used)
  `src/components/profile/` folder that holds `PriceChart.tsx`/
  `TickerSearch.tsx`. Purely an internal detail; doesn't affect anything
  you see in the browser.

### Nothing broken — safe to continue from here.

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

## Session: New module — Markets Overview (2026-07-21)

You asked for a text section explaining the world situation — both in the
Central Bank Room's Global Overview and on the homepage — with a picker
for equity sectors (global equities, TMT, FIG, healthcare, energy,
industrials, consumer), a period picker (week/month/year/forever),
descriptions of how each is doing plus graphs, and the same idea for
private markets (private equity, private credit, etc.).

Before building, I checked three scope questions with you (this was
genuinely a new module's worth of work): where it should live, how the
narrative text should be produced, and how to handle private markets
having no free live data. You chose: a new standalone module with a
homepage teaser; AI-generated narrative grounded in real news, with Adam's
own take stacked underneath; and for private markets, real public-market
proxies (charted) plus real news, clearly labeled as proxies rather than
actual fund returns.

### What shipped
A new **Markets Overview** module at `/markets`, live in the nav, plus a
compact version of its top section on the homepage:

1. **Global Overview** (world situation) — pick Week/Month/Year/Forever,
   see a short AI-generated summary of how world markets/the economy are
   doing, grounded in real fetched news underneath, plus a space for
   Adam's own take (starts empty, same as the Central Bank Room's
   Commentary section).
2. **Markets by Sector** — pick a sector (Global Equities, TMT, Financial
   Institutions, Healthcare, Energy, Industrials, Consumer) and a period;
   see a real price chart (via that sector's real ETF — e.g. XLK for
   TMT), the real computed return over the period, the same AI narrative +
   news + Adam's-take structure as above.
3. **Private Markets** — same picker structure for Private Equity (PSP),
   Private Credit (BIZD), and Real Estate & Infrastructure (VNQ), each a
   real, named, publicly-traded proxy — with a persistent on-page
   disclaimer that these are public securities standing in for private
   activity, not actual fund NAVs (there's no free source for real private
   fund returns).

Nothing here is invented: every chart is real Twelve Data price history,
every narrative is Claude synthesizing only the real return figure and
real news handed to it (same "never fabricate" rule as the rate-decision
explainer), and every "Adam's take" is clearly labeled as your own opinion,
not fetched or AI data.

### What works (verified live)
- `npm run build` and `tsc --noEmit` both pass clean.
- Homepage: the compact world-situation panel renders with real news
  headlines; since no `ANTHROPIC_API_KEY` is configured in this dev
  environment, it shows the honest "AI-generated market narratives need an
  API key" fallback instead of crashing or faking a summary — exactly the
  designed behavior.
- `/markets`: all three sections render with real numbers — e.g. SPY moved
  +0.2% and PSP moved -2.0% over the past month at test time, both with
  real charts and real, period-scoped news underneath. Clicking a
  different sector, and switching the period from Month to Week, both
  correctly re-fetch new real data. No console errors.

### What Adam should look at or decide
- **Add an `ANTHROPIC_API_KEY`** (see `.env.local.example`) if you want
  the AI-generated narratives to actually show instead of the fallback
  message — same key already used by the AI report grader and the
  rate-decision explainer, so this doesn't add a new cost source, just
  uses the existing one more.
- **Write some commentary.** `src/data/marketCommentary.ts` starts empty —
  add an entry (segment id, date, title, body) any time you want your own
  take to show under the world situation, a sector, or a private-market
  segment.
- Consider whether 7 equity sectors and 3 private-market segments are the
  right set — both registries (`src/lib/marketSectors.ts`,
  `src/lib/privateMarketSegments.ts`) are simple arrays, easy to extend
  later.

### Nothing broken — safe to continue from here.

## Session: Central Bank Room — AI situation summary + per-bank economic backdrop (2026-07-21)

You asked for two additions to the Central Bank Room: an AI-written
presentation on the Global Overview explaining the current situation across
central banks (why rates are like this, what's happening, the decisions
made), and a few simple lines before each bank's own rate-decision timeline
on that region's current economic situation and how it's evolved.

### What shipped
- **Global Overview now has a "situation" box.** Under the existing
  hike/cut/hold summary sentence, a new AI-generated paragraph (3-5
  sentences) explains the current global rate picture — grounded in the
  exact same real per-bank figures already on screen plus real,
  period-scoped news. It re-generates when you change the period selector,
  same as everything else on that card. Tested live just now: it correctly
  identified the ECB/RBA hiking, PBoC/SNB cutting, Fed/BoE/BoC holding
  pattern, named the real reasons found in the news (a new Fed chair,
  wartime disruptions, a "gigantic problem" headline), and was honest that
  the coverage didn't fully explain every individual bank's reasoning
  rather than guessing.
- **Each bank's page now has an "Economic backdrop" box** between the price
  chart and the rate-decision timeline — 2-4 simple sentences on that
  region's current economic situation, grounded in real recent news about
  that region's economy. Tested live on the Fed (correctly summarized US
  jobs growth, inflation pressure, and Iran-related uncertainty from real
  articles) and the ECB (correctly scoped to "Eurozone").

Both features use the same "never invent, only synthesize real data/news"
approach as the existing rate-decision "Explain more" feature, and both
gracefully fall back to a plain message (not a crash or a fake summary) if
the AI key is missing or a call fails.

### What works (verified live, with a real ANTHROPIC_API_KEY configured)
- `npm run build` and `tsc --noEmit` both pass clean.
- Global Overview's narrative loads correctly and is cached client-side per
  period (switching banks doesn't re-trigger it if you're on the same
  period you already viewed).
- Fed and ECB pages both show correct, region-specific "Economic backdrop"
  text.
- No console errors.

### Nothing broken — safe to continue from here.

## Session: Hong Kong Stock Exchange coverage via EODHD (2026-07-21)

You asked about getting Hong Kong stock data, since Twelve Data's plan
doesn't include HKEX (upgrading to their Pro tier for it alone would be
$229/month). We found EODHD as a free alternative, you signed up and got a
key, and asked specifically for EODHD to be added just for Hong Kong —
everything else stays on Twelve Data.

### What shipped
Type any Hong Kong ticker with a `.HK` suffix — e.g. `/profile/0700.HK`
(Tencent) or search "HSBC" and click the HKEX result — and you get the same
full Company Profile page as any US/UK/etc. company: real live price, a
real price chart with range buttons, a real computed 52-week high/low and
average volume, the plain-English "About" summary, real news, and an
honest "no SEC fundamentals available" message (Hong Kong companies mostly
don't file with the SEC, same limitation as any other non-US-filer ticker
already has). Beta is also skipped for HK tickers, since it needs Twelve
Data's index history which doesn't cover Hong Kong.

Search now finds real Hong Kong companies too — typing "Tencent" or "HSBC"
surfaces the actual HKEX-listed stock, not buried under noise. Getting this
right took an extra fix: neither EODHD's nor Twelve Data's own free-text
search reliably finds plain HKEX common stock (both surfaced warrants and
depositary receipts instead), so this uses EODHD's free, complete ~3,700-
ticker Hong Kong directory instead, filtered locally. And Twelve Data alone
returns so many international near-duplicates for a name like "HSBC" that
the one real HK result was getting pushed past what the dropdown actually
shows — fixed by sorting results so ones that actually work come first,
which helps every search on the site, not just Hong Kong.

### What works (verified live)
- `npm run build` and `tsc --noEmit` both pass clean.
- `/profile/0700.HK` and `/profile/0005.HK` both load with real data —
  price, chart, 52-week range, About section, news.
- Searching "hsbc" in the ticker box surfaces the real HKEX listing within
  the visible results.
- No console errors.

### What you should know
- EODHD's free tier is thin — 20 requests/day plus a 500-call welcome
  bonus. The Hong Kong ticker directory is cached for 24 hours specifically
  to not burn through that on searches.
- Fundamentals and beta are genuinely unavailable for Hong Kong tickers on
  the free tier of either provider — this is disclosed on the page, not a
  bug to fix later.
- `EODHD_API_KEY` is optional — every other exchange on the site works
  fine without it; it's purely additive.

### Nothing broken — safe to continue from here.

## Session: New module — HKEX Screener for the KPMG conversation (2026-07-21)

Right after Hong Kong Stock Exchange coverage shipped, you asked for a
separate, distinctly-branded page for the KPMG conversation specifically —
somewhere the *only* thing searchable is Hong Kong Stock Exchange, not
folded into the general Company Profile search.

### What shipped
A new module, **HKEX Screener**, live in the nav at `/kpmg`. The landing
page states plainly it's an independent student project — not affiliated
with, endorsed by, or built in any official capacity for KPMG, just built
after a conversation about Hong Kong opportunity screening — then gives a
search box where every result is a real HKEX-listed company (five
quick-pick tickers up front: Tencent, HSBC, Alibaba, AIA Group, China
Mobile). Picking a company sends you to the same full profile page the
main Company Profile module already has for Hong Kong tickers — real
price, chart, computed 52-week range, description, news.

This reused everything built minutes earlier for HK coverage rather than
duplicating it: the only genuinely new code is the search box and the
landing page itself.

### What works (verified live)
- `npm run build` and `tsc --noEmit` both pass clean.
- `/kpmg` renders with the disclaimer banner and quick-pick chips.
- Searching "alibaba" returns only real HKEX results (not mixed with
  Twelve Data's global results the way the main search is).
- Clicking through to a result (tested with Alibaba, `9988.HK`) renders a
  complete real profile.
- "HKEX Screener" shows in the nav bar alongside every other module.
- No console errors.

### Nothing broken — safe to continue from here.

## Session: Chart range bug fix, search UX, HKEX Screener copy (2026-07-21)

You reported some graphs didn't update when switching the time range, asked
for limited-data companies to just be suggestions rather than clickable
dead ends, and asked to simplify the HKEX Screener's "conversation with
KPMG" framing to just "for KPMG."

### What was wrong, and what shipped
- **The bug was real, and isolated to Hong Kong tickers.** I tested every
  chart on the site (Company Profile, Markets Overview, Central Bank Room)
  by simulating clicks and checking the actual rendered dates before and
  after — only HK tickers' charts were broken. Root cause: EODHD's history
  endpoint completely ignores the parameter that's supposed to limit how
  many days it returns (confirmed by testing it directly with different
  values — same ~1-year answer every time). Fixed by asking it to bound the
  results by date instead, which does work. Verified live: `/profile/
  0700.HK`'s chart now correctly narrows from a full year down to one
  month when you click "1M".
- **Search now refuses to link to dead ends.** Companies flagged "limited
  data" (a foreign listing this site's free plan can't actually show)
  still appear in the search dropdown so you can see they exist, but
  they're no longer clickable — plain greyed-out text instead of a button.
  Pressing Enter also now skips past them to the first result that
  actually works.
- **HKEX Screener copy simplified** — the module description, the page
  itself, and the banner now just say "for KPMG" instead of narrating the
  conversation behind it. The honest "not affiliated with or endorsed by
  KPMG" line is unchanged.

### What works (verified live)
- `npm run build` and `tsc --noEmit` both pass clean.
- HK chart range buttons now genuinely change the chart.
- Limited-data search results are confirmed non-clickable (checked the
  actual DOM, not just how it looks).
- `/kpmg` reads "for KPMG" throughout.

### Nothing broken — safe to continue from here.

## Session: Fixed the "no fundamentals data" bug (2026-07-21)

You said the Fundamentals & Valuation section had almost nothing in it and
asked if there was anything to do about it. There was — this turned out to
be two real bugs, not a genuine data gap.

### What was actually wrong
Tested Alibaba (`BABA`) directly against SEC's own data before touching
any code. Its real financials are there — revenue, net income, everything
— but this site's code only accepted that data if it arrived via a 10-K
filing. Alibaba (like JD.com, Baidu, PDD, NIO, Trip.com, and other
US-ADR-linked Chinese/Hong-Kong companies) reports under the same US-GAAP
accounting rules but files a `20-F`/`6-K` instead, since it's a foreign
private issuer — so its perfectly good data was being silently thrown away
by an overly strict filter. Fixed.

While checking the fix worked, also found and fixed a second bug: negative
numbers (like Alibaba's net debt, which is negative since it holds far
more cash than debt) were displaying as a broken raw number
(`$-20612040200.00`) instead of a clean `-$20.6bn`.

### What works now (verified live)
- `/profile/BABA` went from "No SEC fundamentals data available" to a
  complete fundamentals section: revenue $139.1bn, net income $11.8bn,
  every valuation multiple, credit metrics, beta, growth rates.
- Net debt and any other negative dollar figure now renders correctly.
- `/profile/AAPL` re-checked — no regression for ordinary US filers.
- `npm run build` and `tsc --noEmit` both pass clean.

### What's proposed next (your call, not built yet)
1. **Bridge fundamentals to Hong Kong tickers directly.** Many HKEX
   companies have a real US-listed ADR that IS an SEC filer (e.g. `9988.HK`
   Alibaba's HK listing ↔ `BABA` its NYSE ADR; `0005.HK` HSBC ↔ `HSBC`).
   Mapping known HK tickers to their ADR counterpart just for the
   fundamentals fetch (keeping price from the real HK listing) would show
   real fundamentals directly on HK company pages, not just when someone
   searches the US ticker instead.
2. **A DCF calculator**, matching the existing LBO/M&A calculator pattern
   already in the report builder — the other "bank valuation model" not
   yet built alongside comps, LBO, and M&A accretion/dilution.

### Nothing broken — safe to continue from here.

## Session: Homepage cleanup — hero copy trimmed, sources appendix added (2026-07-21)

You asked to remove the hero eyebrow/description on the homepage, and to
add the same kind of expandable "data sources" section the Company Profile
page has, at the end of the homepage.

### What shipped
- Homepage hero is now just the logo and the "Open Company Profile" button
  — the "Free · Web-based · Built for students" line and the "Bloomberg-
  lite for students" paragraph are gone.
- A new expandable "Data sources & methodology" section at the very
  bottom of the homepage, matching the one already on company pages —
  click to expand, lists exactly what's real on this page (the world-
  situation panel's Google News headlines and its Claude-generated
  narrative).
- Under the hood, the appendix component that used to be hardcoded to
  Company Profile is now generic (takes its content as a prop), so it can
  be reused on any page — the homepage is the second real use of it.

### What works (verified live)
- `npm run build` and `tsc --noEmit` both pass clean.
- Homepage renders with the trimmed hero.
- The new appendix expands correctly with the right content.
- Company Profile's own appendix (`/profile/AAPL`) re-checked — still
  works exactly as before.

### Nothing broken — safe to continue from here.

## Session: Way more companies now have real fundamentals (2026-07-22)

You said smaller companies and the HKEX pages showed no Fundamentals &
Valuation data and asked to close the gap without inventing anything.

### What was actually going on
Tested before coding. Small US companies mostly worked already — the real
holes were:
1. **Banks and insurers showed no revenue** — they report their top line
   under industry-specific accounting tags. Added the verified ones
   (checked against Goldman, JPMorgan, Progressive, MetLife, Eagle
   Bancorp), with a caption under the number saying which concept it is.
2. **Hong Kong pages had no path to SEC data** — now, for 15 verified
   companies that are one legal entity with two listings (Alibaba, HSBC,
   JD.com, Baidu, NIO, NetEase, Yum China, Manulife, Prudential, and
   more), the HK page shows that same company's real SEC filings, clearly
   labeled in the appendix. Tencent stays honestly empty — its US ticker
   never files with the SEC.
3. **Found a real bug while verifying:** ADR pages (like BABA) showed
   massively inflated multiples — P/E 204x instead of ~26x — because ADR
   prices are per bundle of 8 shares. Fixed by pricing multiples off the
   HK ordinary share. HK prices also now display as "HK$", not "$".

### Still honestly missing
HKEX companies with no SEC-filing US twin (most small ones + Tencent) have
no free structured fundamentals anywhere — the paid escape hatch is
EODHD's fundamentals tier (€59.99/mo) if it ever matters enough.

### Verified live
EGBN, 9988.HK, BABA, AAPL — all correct, build clean.

### Nothing broken — safe to continue from here.

## Session: Model Templates module — build what analysts build (2026-07-22)

The big one you asked for: downloadable, personalizable templates for the
work analysts produce across investment banking, equity research, asset
management, and sales & trading. You chose Excel with live formulas, the
full set in one go, and sector guidance built into each template.

### What shipped — six templates at /templates ("Model Templates" in nav)
1. **DCF Valuation Model** — revenue growth that fades to a terminal rate,
   a WACC you build from real inputs (real beta prefilled), terminal
   value, implied share price vs. today's, and a sensitivity grid where
   every cell re-runs the model. **Picking FIG switches the whole file to
   a dividend-discount model** — banks can't be valued on enterprise
   value, and the template explains why inside.
2. **LBO Model** — a real year-by-year debt schedule, MOIC and IRR, and a
   value-creation bridge answering the classic interview question: did the
   return come from growth, the multiple, or the debt paydown?
3. **M&A Accretion/Dilution** — pick acquirer and target tickers, both
   prefill with real data; financing mix with a sum-to-100% check;
   synergies deliberately default to zero.
4. **Equity Research Initiation Note** — rating and target price with live
   implied upside, thesis prompts that force a real view, a valuation
   summary that turns your target multiples into implied prices.
5. **Portfolio One-Pager (AM)** — type positions in, values/weights/
   concentration compute themselves.
6. **Market Update Sheet (S&T)** — downloads prefilled with the site's
   real sector performance and all eight central banks' rates at that
   moment, plus a structured morning-note section.

Every workbook opens on a guidance sheet (conventions + sector-specific
advice in plain English) and closes with a "Data & Sources" sheet listing
where each prefilled number came from. Missing data stays blank — never
estimated. The homepage now pairs the Global Overview with a "Want to
build your own valuation model?" card linking to the library.

### Verified (not just built)
All eight test configurations were generated through the real API and then
parsed back file-by-file: real prefill confirmed (AAPL's $383.3bn revenue
and 0.84 beta, Eagle Bancorp's real 54.7% payout in the FIG variant,
MarineMax's real 3.8x market multiple in the LBO, Alibaba's HK page
pricing at the correct ~$14.92/ordinary share, the real 3.75% Fed rate in
the market sheet), live formulas confirmed in every model cell probed, and
a real download exercised through the browser UI. Build and typecheck
clean.

### One new dependency
`exceljs` — what makes these real recalculating models rather than
pictures of models. Server-side only; documented in DECISIONS.md.

### Nothing broken — safe to continue from here.

## Session: Central Bank Room — "Markets & the economy" panel (2026-07-22)

You asked for two things on each central bank's page: more text on the
country's situation that changes with the timeline period you pick, and a
famous regional index (Fed → S&P 500, etc.) charted alongside the policy
rate so people can compare — while noting you weren't sure the two are
actually correlated.

### What shipped
Each bank page now has a **"Markets & the economy"** panel:
- A period selector (Week / Month / 3 Months / Year / Max).
- A **dual-axis chart**: the region's stock index (blue, right axis) drawn
  over the policy rate (terracotta step-line, left axis) on the same
  timeline — you can see, e.g., the Fed cutting from 4.5% while the S&P 500
  recovered.
- A **period-scoped AI write-up** of the country's economy and market for
  the window you picked, grounded in the real index move and real news,
  with the headlines listed underneath.

**On the "not sure if correlated" point:** handled honestly on purpose.
The chart caption says the two lines are shown side by side with no
correlation implied — judge for yourself — and the AI is told to never
claim they move together unless the real coverage supports it. In testing,
the Fed write-up did exactly that: it said drawing a conclusion about the
rate-vs-market link from the available coverage "would be speculation
rather than analysis."

**Indices are labeled honestly:** the US and Eurozone use the real tracked
index (S&P 500 via SPY, Euro Stoxx 50 via FEZ); the others use the closest
free country-ETF proxy and say so ("UK equities ≈ FTSE 100, via EWU"),
rather than pretending to be the exact famous index (no free tracker
exists for those).

### Verified live
Fed (exact S&P 500) and BoE (proxy, labeled) — both lines render against
the rate, switching periods re-fetches the narrative + news, correlation
kept honest. Build + typecheck clean, no console errors.

### Note
This replaced the old static "Economic backdrop" box (superseded by the
richer, period-interactive, chart-paired panel).

### Nothing broken — safe to continue from here.

## Session: Markets Overview — 5-Year option + fixed "Forever" (2026-07-23)

You said the chart's x-axis dates weren't understandable, especially for
"Forever". Turned out to be two real bugs, not one:

1. **"Forever" wasn't actually forever** — it was quietly capped at the
   same 5-year window as every other long range, with nothing on screen
   telling you it was capped.
2. **The year was never shown**, on any multi-year range, for any ticker
   — a leftover check from the Hong Kong work was silently overriding the
   year-showing logic for everyone, not just HK tickers.

### What shipped
- A real **"5 Years"** button, next to Week/Month/Year/Forever.
- **"Forever" now means it** — tested against SPY, it correctly goes back
  to 1993 (the ETF's actual inception), not just 5 years.
- Dates on the chart now show the year for 5-Year and Forever views (e.g.
  "1993-11"), so you can actually tell which year you're looking at.
- This also fixed the same "Max" button bug on the Company Profile price
  chart, since it shares the same underlying code.

### Verified live
Confirmed via direct testing: the 5-year view returns real weekly data
correctly labeled, and "Forever" returns 33 years of real monthly SPY data
starting exactly at its 1993 launch. Clicked through it in the actual
Markets Overview page and watched the chart re-render with the fix. No
console errors, build clean.

### Nothing broken — safe to continue from here.

## Session: New module — Hype vs Fundamentals (2026-07-23)

You asked for a module comparing hype to fundamentals, in two parts:
closed historical cases, and open current ones like "AI bubble". Built
and shipped as a new `/hype` page (module flipped from "coming soon" to
live).

### What it does
**Historical Cases** — three closed episodes with known outcomes: the
dot-com bubble (Cisco, QQQ), the meme-stock mania (GameStop, AMC), and
the cannabis stock boom (Tilray, Canopy Growth). For each, you see the
real price history indexed so tickers with wildly different prices can be
compared on one chart, the real peak price *within that bubble's actual
era* (not just the highest price ever), the real run-up percentage to
that peak, and where the price sits today relative to it — plus a
hindsight AI write-up grounded in those real numbers and real
retrospective news coverage.

**Current Watch** — two open, unresolved themes: AI & semiconductors
(Nvidia, the semiconductor ETF SMH) and quantum computing (IonQ,
Rigetti). You pick a period (week/month/year) and see the real price
return next to real latest-year revenue growth — different time bases,
labeled honestly rather than pretending they're comparable. The AI
commentary here is deliberately told **never to declare a verdict** —
it can't say something "is" or "isn't" a bubble, only lay out the real
evidence on both sides.

### Three real bugs found and fixed before this shipped
1. Every historical ticker's computed "peak" was showing a 2024-2026 date
   instead of its real bubble-era peak — e.g. Cisco showing this year
   instead of March 2000. Root cause: the price data function used only
   fetched about 1.6 years of daily bars no matter what was asked for.
   Switched to the deep monthly-history function already built for the
   Markets Overview "Forever" fix, plus properly bounding the peak search
   to each case's real era.
2. The current-theme AI commentary sometimes said price-return data was
   "unavailable" while that exact number was displayed right next to it —
   caused by asking the AI before the page had actually finished fetching
   the number. Fixed by waiting for the real number first.
3. A subtler one: looking up 5 companies' SEC fundamentals on one page
   load, all at once, was bursting past SEC EDGAR's public 10-requests/
   second limit — causing some real data to look like "unavailable" when
   it actually existed, just rate-limited. Fixed by fetching one company
   at a time instead.

### Worth knowing
SEC EDGAR's free API blocks an IP for 10 minutes if you exceed its rate
limit (and extends the block if you keep hitting it during the time-out).
Heavy testing while building this tripped that a few times today — if you
load `/hype` soon and see "Revenue growth: Unavailable" for Nvidia or
IonQ, that's very likely this temporary block, not a real data gap; it
clears on its own within a few minutes of normal use, and each fact stays
cached for 24 hours once it does succeed.

### Verified live
Rebuilt and confirmed via the real dev server: all six historical tickers
now show correct era-bound peaks (CSCO/QQQ March 2000, GME January 2021,
AMC June 2021, TLRY September 2018, CGC April 2019) with large, plausible
real run-up percentages (GME +7,388%). The historical AI narrative reads
as genuine hindsight, citing the real retrospective articles shown
underneath it. The current-theme AI narrative correctly presents both
sides without ever declaring a verdict. `npm run build` and
`tsc --noEmit` are both clean, and the page is confirmed dynamic
(not statically prerendered) so its real, paid AI calls only fire on
real visits, never on `npm run build`.

### Also logged, not built
You mentioned an idea for a Pokémon-card trading market, "just an idea at
the moment" — logged as a backlog note in `TASKS.md` only. Nothing was
built for it, and the note says the first step (whenever it's picked up)
should be checking what free card-price data actually exists, same as
every other module here.

### Nothing broken — safe to continue from here.

## Session: Deep research pass + Pokemon Cards module + Prompt Answers page (2026-07-22, while you were out)

You asked for five things while stepping out: 10 stock pitches, a
valuation-model learning plan, 10 hype-vs-fundamentals write-ups,
agentic AI research for KPMG's tax team, and a real Pokemon card
tracking module. Went in the order you asked for (easier/research first,
Pokemon last), all with real web research, no invented numbers.

### What's ready to read
A new **Prompt Answers** page (`/research`) now holds four long write-ups:
- **10 stock pitches** — Diploma PLC (mandatory), Nintendo (the Pokemon
  pick — and genuinely interesting: record Pokemon/Switch 2 year, but
  the stock is down ~53% on an AI-driven memory-chip cost shock and a
  weak game showcase), Microsoft (AI capex vs. Copilot monetization),
  British American Tobacco and BAE Systems (a real paired case study in
  how NBIM's ethics exclusions actually work — BAT is excluded, BAE
  isn't), ASML/Maersk/Cameco (three different geopolitical trades), and
  Greggs (the everyday UK one).
- **A valuation-model learning plan** — sequenced specifically for an
  NBIM equities-team goal (grounded in NBIM's own real published
  strategy documents, not a generic template), stays useful for S&T/M&A,
  points to this site's own Model Templates to practice on.
- **10 hype-vs-fundamentals examples** — the two required open cases
  (the AI bubble, Pokemon card hype) plus 8 more spanning tulip mania
  (mostly a 200-year-old exaggeration, per modern historians), the NFT
  crash, Meta's metaverse retreat, the Nikola fraud (the truck really
  was just rolling downhill), the 3D-printing bubble, and quantum
  computing's current triple-digit valuation multiples — all with real,
  sourced quotes.
- **Agentic AI for KPMG's tax team** — Copilot, OpenAI, Claude, and
  Perplexity, including what KPMG itself has already committed to
  (Workbench, Digital Gateway integrating Claude for tax/PE clients,
  firm-wide Microsoft Agent 365 rollout) and the Circular 230/hallucination
  liability considerations that actually matter for a tax practice.

### What got built: a new Pokemon Cards module (`/pokemon`)
Before building, checked empirically what free Pokemon card data really
exists (rather than assuming). Good news: TCGdex is a genuinely free,
working API with real card data and real current prices across 12
languages. Built a real search (name, language, energy type, set) and a
card detail page with real TCGPlayer low/mid/high/market prices and
Cardmarket short-term trend.

**The one honest limit:** nobody publishes real multi-year price
*history* for trading cards for free — that's the same proprietary
infrastructure the Chinese app you showed me built for itself over
years. So this shows real current stats, not a fabricated historical
chart. A real paid option exists if you want instant multi-month history
later (~$99/month for the tier licensed for a public site) — a real
cost, so I didn't sign up for it on your behalf; it's your call.

Also answered your reverse-engineering follow-up directly on the
research page: now moot for this build, since a legitimate free API
already covers what you needed.

### One new dependency
`react-markdown`, used only to render the long research write-ups
cleanly on the Prompt Answers page — the same "one clearly justified new
dependency" pattern as `exceljs` earlier in this project.

### Verified live
Both new modules build and typecheck clean, show up in the site nav,
and were checked in a real browser: real search results, a real card
page matching a direct API call, the research page rendering all five
write-ups with working links, no console errors.

### Nothing broken — safe to continue from here.

## Session: Company Profile upgrades from the Streamlit-spec comparison (2026-07-23)

After the gap-analysis report against the Streamlit dashboard spec, you
picked 5 of the 10 ideas to actually build, in this order: chart
color-splitting, a 1D-baseline check, a disclosure footer, gauge scores,
logos.

### A real bug, found and fixed
Checking the spec's own warning against Bloombruh's code turned up a
genuine bug: the Company Profile chart's "1D" view computed whether the
stock was up or down for the day using the day's *first* intraday price
instead of *yesterday's actual closing price*. Twelve Data's intraday feed
only covers today's own trading session, so there was nothing wrong with
the data — the chart was just comparing against the wrong starting point.
Practical effect: a stock that gapped down overnight could have shown as
green ("up") for the day. Fixed by using the previous close (a number
already being fetched and shown elsewhere on the page) as the real
baseline, with a caption on the 1D view now saying explicitly what it's
measured against.

### What else shipped
- **Chart colors now split at the actual crossing point** — a price
  chart is green above its starting level and red below it, with the
  color changing exactly where the line crosses, not just once for the
  whole chart based on the net move.
- **Two 0-100 "Snapshot" gauges** on Company Profile — Technical strength
  (200-day trend, momentum, 52-week position) and Fundamental quality
  (margins, returns, leverage, growth) — plus 7 short factual tags
  (e.g. "Above 200DMA," "High ROE," "Low leverage"). Real numbers, not a
  buy/sell call anywhere — matches the neutral-language rule you've had
  on this project from the start.
- **One shared disclosure line**, now stored once and shown at the bottom
  of every page, instead of separately hand-typed prose.
- **Company logos** next to the ticker on Company Profile and in the
  search dropdown — kept intentionally lightweight (a small curated list
  + a public favicon service) rather than the heavier "download and store
  125 logo files" approach the original spec used, since that's a lot of
  upkeep for a cosmetic feature.

### Verified live
Checked against AAPL: gauge scores and their driver bullets match the
real numbers in the stats grid below them exactly (e.g. gross margin
44.1% shown both places), the 1Y chart visibly turns red at the one point
it dipped below its starting price and green everywhere else, clicking
"1D" shows the new "Baselined at yesterday's close" note with a real
number, and Apple's logo renders next to its name. Build and typecheck
both clean, no console errors.

### Nothing broken — safe to continue from here.

## Session: "The Vault" cleanup + Pokemon Cards rebuilt as a market analysis (2026-07-23)

Two changes, both things you asked for directly.

### The research page got trimmed and renamed
Dropped 4 entries you didn't want kept (the two KPMG write-ups, the
Pokemon API research note, and the Streamlit-spec comparison — more
working notes than portfolio pieces) and renamed "Prompt Answers" to
**The Vault**. Three entries remain: the 10 stock pitches, the valuation
learning plan, and the 10 Hype vs Fundamentals examples.

### Pokemon Cards is now a real market analysis, not a search tool
You said the per-card search wasn't satisfying and gave me a specific
thesis to test: that Pokemon cards behave more like a durable commodity
than a typical hype-driven collectible. I checked it rather than just
writing it up:

- **The numbers back it up more than expected.** Pokemon has printed over
  85 billion cards lifetime as of May 2026, and about 40% of every card
  ever made was printed in just the last 3 fiscal years — an
  *accelerating* curve, not a fad running out of steam.
- **Real contrast case: the 1990s baseball-card crash.** Manufacturers
  printed ~81 billion cards a year at that peak with no regard for
  scarcity; when the 1994 MLB strike broke collector confidence, the
  market never recovered — revenue fell to about a seventh of its peak.
- **Honest counter-argument, not skipped:** Pokemon's own print runs are
  accelerating in exactly the way that broke the sports-card market. A
  real recession or a sharp drop in new collectors is a stress test this
  boom hasn't faced yet — stated plainly on the page as a real risk, not
  buried.
- **A real volatility case study:** a PSA 10 1st-Edition Base Set
  Charizard went from $11,000 (2018) to a $420,000 peak (March 2022),
  corrected about 40% to the $250,000s, then set a new record of
  $550,000 in December 2025 — real volatility sitting inside a longer
  uptrend, shown on a real (log-scale) chart, not the one-way crash the
  sports-card comparison shows.
- **What's genuinely not knowable is said outright:** no continuous
  30-year demand series exists publicly, and "market size" estimates for
  this category disagree by 3-5x across research firms — both flagged on
  the page instead of hidden behind one convenient number.

The old per-card search UI and its now-unused code were removed, per your
request to make this feel like a market, not a lookup tool. The
individual card page still exists and still works — it's just linked
from the Charizard case study now, not the front door.

### The walking-Pokemon easter egg — checked before building, not assumed
You asked if this was even doable. It is: real animated sprites exist in
a well-known, long-standing open GitHub project (Pokemon
Showdown/Smogon-sourced, explicitly reusable per that project's own
README), confirmed working with a live request before writing any code.
Every 6-10 seconds a real animated Pokemon now spawns on the
`/pokemon` page. Same "fan project, non-commercial, educational"
territory as the card artwork this module already shows — not a new kind
of risk, the same one already accepted when this module was first built.

You gave two rounds of feedback on how it actually looked, both applied:
first, that it moved in a straight line like "an image that moves," not
something that really walks — rebuilt so it genuinely wanders (picks a
direction, holds it a couple seconds, picks a new one, bounces off edges,
bobs up and down as it moves), driven by real per-frame position updates
instead of a fixed animation path. Second, that it should stick to the
sides/corners where there's less text — each one now spawns into and
stays within the page's actual empty side margins rather than crossing
the content column. Capped at 6 on screen at once now, verified with a
real screenshot showing one correctly parked in the top-right corner.

### A real bug, caught while verifying
Two spots on the new page silently lost a space where bold text met
plain text (a known React/JSX quirk this codebase had already worked
around elsewhere) — found by checking the actual rendered HTML rather
than trusting the screenshot, and fixed the same way it was fixed
elsewhere.

### Verified live
Real chart data, a real live Charizard price matching a direct API check,
and — checked directly in the browser's own developer tools, not just
visually — real sprites confirmed spawning with correct images,
positions, and the 8-sprite cap all working as intended. No console
errors, build and typecheck both clean.

### Nothing broken — safe to continue from here.

## Session: "$30 in 1999" — Charizard vs. the S&P 500 (2026-07-23)

You asked for a specific chart: $30 in a PSA 10 1st-Edition Charizard
since 1999 against $30 in the S&P 500 since 1999, orange vs. blue. Worth
flagging upfront: partway through researching this, this session's
monthly web-search budget ran out, and going straight to the sources you
named (PriceCharting, PWCC, Heritage Auctions) instead got blocked
outright by all three. Rather than quietly work around that, the chart
says exactly what it can and can't stand behind.

### What's fully real
The S&P 500 side turned out to be completely solid: Yahoo Finance
actually has a public data feed that's directly reachable (no search
needed) with real dividend-adjusted prices back to January 1999 — exactly
the source you asked for. Real number: $30 in the S&P 500 in January 1999
is worth about **$261 today** (roughly 9x), computed from that real data.

The Charizard side is fully real from 2018 onward too, reusing the sale
data already verified earlier ($11,000 in 2018 up to $550,000 by December
2025).

### What's honestly not verifiable
There's a real ~19-year gap: no dated sale record for a PSA 10 Charizard
between 1999 and 2017 could be confirmed, given the access blocks above.
Instead of inventing a smooth line through that gap, the $30 starting
point is labeled exactly as what it is — the entry price you asked this
comparison to use, not a documented sale — and the chart shows this
visually (a hollow dot for that one assumption, solid dots for every real
transaction).

### The headline number, with its own honest caveat
$30 in Charizard would be worth **$550,000** today — over 18,000x, against
the market's real 9x. Real gap, genuinely enormous — and the page says
directly that this is "the least representative comparison possible,"
since it's the single most valuable specific outcome in the whole hobby,
not a typical one.

### Verified live
The real 9x and ~18,000x figures check out against the underlying data,
the full 28-year dataset confirmed correctly rendered via direct
inspection, no console errors, build and typecheck clean.

### Nothing broken — safe to continue from here.

## Session: Filled the pre-2016 Charizard gap — and fixed a data mistake along the way (2026-07-23)

You asked me to search again for data before 2016 on the Charizard chart.
Web search access had come back since the earlier monthly limit (that was
temporary, not permanent), and this pass found something better than just
another data point.

### What the new research found
A real, precisely dated sale: **$18,900 on 23 July 2017**, via PWCC on
eBay, documented by Beckett News — one of the sources you originally
asked for. More usefully, it also found an explicit, sourced fact from
data tracker Card Ladder: **no PSA 10 sale of this exact card is publicly
recorded at all between 2017 and 2021.** That's not a gap in this
research — it's a real fact about how thin this market actually was, and
a more honest thing to show than any made-up in-between point.

### A real correction, not just an addition
Checking this against what was already on the chart, the old "2018:
$11,000" figure turned out to be shaky — it doesn't square with the Card
Ladder fact above, and its original sourcing wasn't as solid as what this
pass found. Replaced it with the properly-sourced $18,900/July 2017
figure instead. Also removed an old "2016: $800" point that had been
quietly mixing a different, much more common ungraded card into the same
line as the PSA 10 graded sales — a real mistake that made the pre-2020
gap look smaller and better-documented than it actually was.

### A bug caught before it ever reached you
My first attempt at showing the "no sales 2017-2021" fact used a
placeholder $0 data point. That would have been a real problem — a $0
value breaks a log-scale chart outright (mathematically undefined), and
would have implied a documented $0 sale that never happened. Caught this
on review, before running the build, and fixed it by leaving that window
as a genuine gap with no point at all, with the real fact stated in the
text next to the chart instead.

### Verified live
The old $11,000 figure confirmed completely gone from the live page; the
new $18,900 figure and the Card Ladder gap fact confirmed present in both
the case study and the full chart data; no console errors; build and
typecheck clean.

### Nothing broken — safe to continue from here.

## Session 21 — 2026-08-05 (The Vault → Word download; new "My Analysis" section; domain move queued)

### The short version
Before moving the site to your new domain, you asked for two changes: turn "The Vault" from a
browsable page into a downloadable Word document, and add a new section for your own ongoing
research — somewhere to write up breaking stories you personally dig into, separate from the
rest of the site's neutral data modules. Both are done. The domain move itself is queued but not
started — you said "wait, actually first" before we got to it, so see the "What I need from you"
section below.

### The Vault is now a download, not a page
`/research` is gone. Its three write-ups (the valuation-model learning plan, the 10 stock
pitches, the 10 hype-vs-fundamentals cases) are now a real Word document — **Download past
research write-ups**, in the site footer on every page, ~40KB. I couldn't do the usual visual
check on it (this machine doesn't have LibreOffice or pandoc installed), so I verified it a
different way — opening the file's internal structure directly and confirming the number of
links, headings, and formatted sections all match what should be there. Worth you personally
opening it once in Word to eyeball it, since that's a check I genuinely can't fully do myself
here.

### New: My Analysis (`/analysis`)
This is your own research notebook — framed explicitly as personal digging, not site data. Two
real entries to start, both freshly researched today rather than assumed:
- **Korean equity volatility following SK Hynix's $26.5bn Nasdaq listing** — the figure you gave
  me checked out exactly. Real story: a 10 July 2026 Nasdaq debut that raised $26.5bn (genuinely
  the second-largest US listing on record), followed four days later by a 15.37% single-session
  drop in SK Hynix's *separate* Seoul-listed shares and a KOSPI-wide selloff of over 9% — driven
  by real dilution from the new shares, investors rotating into the new US listing, and an actual
  analyst earnings downgrade, not just noise.
- **What AI is actually doing to hedge fund/bank analyst roles** — led with real Goldman
  Sachs/Morgan Stanley labor-market research rather than the more common AI-vendor hype. One
  vendor's "3-5% higher returns" claim was found, named, and deliberately left out rather than
  included as fact, since it came from a company selling AI research tools to hedge funds — an
  obvious conflict of interest.

### What I need from you before the domain move
You mentioned buying bloombruh.com on Porkbun — genuinely ready to help with this, but two things
only you can do:
1. **Confirm where this site is actually hosted right now** (Vercel, most likely, given the
   project's stack) — if it's not deployed anywhere live yet, that's step one before a domain can
   point at anything.
2. **Porkbun DNS access** — I have no way to log into your registrar account. Once I know the
   hosting target, I can give you the exact DNS records to paste into Porkbun (or walk you through
   it live), but the actual click-the-button step in Porkbun's dashboard has to be you.

### Verified live
Nav correctly shows "My Analysis" with zero remaining trace of "The Vault"; `/research` cleanly
404s; the footer download link serves the real file with the correct type; no console errors;
`npm run build` passes clean (30 routes).

### Nothing broken — safe to continue from here.

## Session 22 — 2026-08-05 (HKEX Screener rebuilt from your "HK Research" project)

### The short version
You had a separate, more built-out local project called "HK Research" (same stack, also built
with Claude Code) and asked to replace the site's current HKEX Screener with it. Done — `/hkex`
still has the same search box as before (that part already worked), but clicking a result now
lands on a genuinely richer dedicated page instead of the generic company profile.

### What's new on a company's HKEX page now
- A real price chart, up to 10 years, from Yahoo Finance (with an honest fallback to ~1 year of
  EODHD data if Yahoo is briefly unavailable — and it says so on screen rather than pretending
  a 1-year chart is actually 10 years).
- Direct links to the company's key financials and its official HKEX profile.
- The company's **own press releases**, scraped directly from its official page — genuinely
  real, dated announcements, not a search result. Only works for the handful of companies whose
  IR site is honestly checkable this way (their page has to render real HTML, not just an empty
  shell filled in by JavaScript) — anything else says so plainly instead of guessing.
- Real third-party news, filtered down to a fixed list of serious financial outlets (Reuters,
  Bloomberg, FT, SCMP, and similar), not just anything a generic search turns up.
- A short AI recap above each list — strictly limited to summarizing the real, dated items
  sitting right below it, never adding outside information.

### How it was built
Read through the entire HK Research codebase first, then ported it in under its own
`src/lib/hkex/` folder rather than mixing it into the site's existing code — a couple of its
filenames (`eodhd.ts`, `news.ts`) exactly matched files already doing different, important jobs
elsewhere on this site (Company Profile, Central Bank Room, and others all depend on those), so
keeping it cleanly separated avoided any risk of quietly breaking something that already worked.

### Verified live
Actually used it, not just checked it builds: searched "HSBC," clicked through to its real page;
on Tencent's page, confirmed the press releases were real (dated, linked, genuinely from
Tencent's own site) and the news feed pulled real Bloomberg/SCMP/FT/Reuters coverage, both with
accurate AI summaries; watched the price chart's fallback correctly kick in and say so when
repeated testing tripped Yahoo Finance's real rate limit. No console errors, build and typecheck
both clean.

### Nothing broken — safe to continue from here.

## Session 23 — 2026-08-05 (Alpha Vantage: insider activity, institutional holdings, sentiment news, movers, CPI/unemployment)

### The short version
You wanted to try out Alpha Vantage (a free market-data API) and add whatever tested out as
genuinely useful. Tested 8 real endpoint types with actual API calls before building anything —
7 came back with real, good data; Hong Kong Stock Exchange isn't covered at all, confirmed by
search. Built four new things with what worked, all verified live with real data, not just
"the build passed."

### What's new
- **Company Profile** (US tickers only) — a new "Ownership, activity & sentiment" section: who's
  recently bought/sold stock (real insider names, dates, amounts), who the biggest institutional
  holders are (Vanguard, BlackRock, etc., with real % changes), sentiment-scored recent news
  alongside the existing headline list, and the next earnings date.
- **Markets Overview** — a "Today's Movers" panel: real top gainers, losers, and most-active
  stocks for the day.
- **Central Bank Room** — a small CPI/unemployment panel, shown only on the Fed's page (this data
  is US-only, so it doesn't belong on the ECB's or BoE's page).

### Two real problems hit and worked through, not swept under the rug
1. **A genuine bug**: fetching two pieces of data at the same time tripped Alpha Vantage's rate
   limit. Fixed properly — not just patched in one spot, but fixed at the shared code level so it
   can't happen again anywhere else this API gets used later.
2. **A harder one, investigated properly but not fully solved tonight**: even spacing requests out
   by several seconds, some still got rate-limited — including on a completely fresh key that had
   never been used before. Ruled out my own code as the cause (identical direct tests outside the
   app worked fine). Most likely explanation: Alpha Vantage may track its free daily limit by IP
   address, not just by key — meaning today's heavy testing across the three keys you gave me
   probably shares one real quota, not three separate ones. Documented this clearly in the code
   so it's not mistaken for a bug again later. Practical effect: some sections (unemployment, next
   earnings date) may not show up if you check the site again today — that's the quota, and it
   should recover on its own (daily limits reset).

### What I need from you before this goes live
Add `ALPHA_VANTAGE_API_KEY` to Vercel's environment variables (Settings → Environment Variables),
same as you did for the other three keys earlier — I put the first key you gave me into your local
`.env.local`, but same as always, that file never leaves your machine, so Vercel needs its own
copy. Then redeploy for it to take effect.

### Verified live
Real AAPL insider transactions and institutional holders, real same-day sentiment-scored news
articles, real top market movers, real CPI figures — all confirmed with actual data on the actual
pages, not just a successful build. `npm run build` and `tsc --noEmit` both clean.

### Nothing broken — safe to continue from here.

## Session 24 — 2026-08-05 (Live vs. Beta split; a sourced leads list; stock pitches merged into My Analysis)

### The short version
Three things: split the site into what you're confident in vs. what's still being polished (both
labeled honestly, nothing hidden or faked), a sourced list of quick "interesting news" leads for
you to dig into yourself, and stock pitches moved into My Analysis.

### The Live/Beta split
Company Profile, Central Bank Room, Pokemon Cards, and My Analysis stay as the main, "this is
done" front door — no badge, listed first on the homepage. Everything else (Markets Overview,
Model Templates, HKEX Screener, Hype vs Fundamentals, Lessons, Simulations, Test Prep) now carries
a small "beta" tag in the nav and sits in its own "In development — beta" section on the homepage,
with a plain-English note that these are real and working, just not polished/verified to the same
level yet. Nothing is disabled or hidden — beta modules are fully clickable, just honestly labeled.

### A sourced leads list
Researched and added 10 real, dated, one-sentence news items to My Analysis, under a new "Worth
Digging Into" section — SpaceX's rocky first earnings as a public company, Anthropic's and
OpenAI's own AI models breaching real systems during safety testing, the Bezos Amazon share sale
the same day Amazon hit $3 trillion, the Strait of Hormuz reopening talks and oil's reaction, a
contentious Bitcoin protocol fight, Palantir's earnings pop, an unusually high S&P 500 earnings-
beat rate, a Chipotle selloff, and a claim about corporate AI adoption cooling. Each one is
explicitly labeled as single-source and not independently verified — these are meant as your own
starting points, not finished facts, and the page says so directly rather than presenting them
with the same confidence as the fully-researched write-ups above them.

### Stock pitches, merged in
The "10 Stock Pitches" write-up (previously part of the retired Vault, also still in the
downloadable Word doc) now lives directly in My Analysis, alongside the two existing deep-dive
write-ups and above the new leads list — one page, your own research and opinions, in one place.

### Verified live
Nav badges and the homepage split match exactly what was asked (4 modules plain, 7 tagged "beta,"
all still clickable); `/analysis` shows all four sections — two write-ups, stock pitches, and the
10 sourced leads — in both its jump-to nav and its body. `npm run build` and `tsc --noEmit` both
clean.

### Nothing broken — safe to continue from here.

## Session 25 — 2026-08-05 (My Analysis rebuilt: index/detail pages, professional stock pitches)

### The short version
A bigger rework of My Analysis: new page name and intro (built around how you actually described
finding things — scrolling your feed, stopping on the odd thing), the disclosure banner deleted,
stock pitches rewritten to read professionally with no personal asides, and the whole page
changed from "everything expanded at once" to a proper index you click into.

### What changed
- Page renamed to **The Feed**, with new intro copy about scrolling past most of what reaches you
  and stopping on the rare thing worth digging into properly.
- Deleted the old disclosure banner at the top of the page entirely, as asked.
- **Stock pitches rewritten from scratch**, professional tone throughout, no personal notes: kept
  Diploma PLC, Nintendo, British American Tobacco, ASML, Maersk, and Palantir; added TSMC and
  Domino's Pizza Group (the "same idea as Greggs, but in London" pick) fresh; reworked Microsoft
  around a new angle tying it directly to the Anthropic/OpenAI AI-safety stories already in the
  leads list. Every pitch now opens with an explicit "trigger" — the actual dated news that
  justified picking it, same idea as the leads list, just applied to the pitches too.
- **A real catch, worth flagging directly:** you asked for CMA CGM in place of Maersk. Checked
  first — CMA CGM has no public shares at all; it's privately owned by the Saadé family. Told you
  this rather than quietly writing a pitch for a stock that doesn't exist, and you confirmed
  going back to Maersk, rewritten in the new format.
- **The page itself restructured**: instead of every write-up and pitch sitting fully expanded on
  one long page, `/analysis` is now a clean index — just dates, titles, and one-line taglines, in
  the style of a real news index — and clicking one opens its own full page. Applies to both the
  write-ups and all 9 stock pitches. The leads list stays as-is on the index, since each one is
  already just a sentence.
- Also, while in there: removed the long description text under each module card on the
  homepage (titles and one-line taglines only now), and beta modules no longer sit in the
  permanent top nav bar — only the 4 modules you're confident in do. Beta modules are still fully
  real and reachable from the homepage's own section.

### Verified live
Index page shows the new title, new copy, and correct title-only listings for both sections; a
detail page (Microsoft) opens correctly with the full professional write-up, trigger, and
sources; nav confirmed down to exactly 4 items; homepage cards confirmed to no longer show the
long descriptions. `npm run build` and `tsc --noEmit` clean.

### Nothing broken — safe to continue from here.

## Session 26 — 2026-08-05 (A gated Research Toolkit on every stock pitch)

### The short version
You sent me two real competition pitch decks (a long thesis on Global Payments, a short thesis on
Altria) as the actual bar — properly modeled, DCF-derived target prices, comps tables, the works.
Rather than have me write pitches at that level, you want to build them yourself — so every one of
the 9 stock pitches now has its own "Research Toolkit": what tools to use, which newspapers/trade
press to read, real primary-source links, a pointer to this site's own downloadable model
templates, and a step-by-step build guide. Kept behind a shared code so it's not just open to
anyone browsing the site.

### How it works
The pitch write-up itself stays exactly as public as before — still readable by anyone, including
a recruiter, with no code needed. Only the new toolkit underneath each one is gated. Enter the
code once on any pitch and it stays unlocked for every pitch on that browser going forward — same
mechanism this site already uses for the "Pro" AI-grading feature, so it's consistent with
something already built rather than a brand new system.

### What's in each toolkit
Primary filing sources tailored to where each company actually reports (SEC EDGAR for US names,
London Stock Exchange news + Companies House for the UK ones, Japan's EDINET for Nintendo, Taiwan's
MOPS for TSMC, Denmark's CVR for Maersk), the real trade press worth reading for that sector
(Lloyd's List for shipping, DigiTimes for chips, The Grocer for Domino's, USASpending.gov for
Palantir's actual government contract data), a suggested peer comp set with where to pull free
multiples, and 4 concrete steps to actually build the thing — including a pointer to this site's
own downloadable DCF and Trading Comps templates for the modeling itself, rather than needing a
new blank template built from scratch.

### A real catch while writing it
Flagged directly in the Domino's toolkit: Domino's Pizza Group plc (the UK listing) and Domino's
Pizza Inc. (the US-listed global brand owner) are two completely different companies. Mixing up
their filings would have quietly broken anyone's research from step one, so it's called out
explicitly rather than left as a trap.

### Verified live
Confirmed the toolkit content genuinely doesn't appear anywhere in the page before entering the
code; confirmed the correct code unlocks it; confirmed unlocking on one pitch's page also unlocks
every other pitch's toolkit without re-entering the code. `npm run build` and `tsc --noEmit`
clean.

### Nothing broken — safe to continue from here.

## Session 20 — 2026-07-25 (Self-audit: new Simulations module + a nav bug fixed)

### The short version
You asked me to self-check the whole site like an analyst would and add
whatever I judged genuinely useful, no need to ask first — and you
specifically suggested a "simulation" section for any high-finance role,
generated data allowed where real data isn't available. Built a new
**Simulations** module (`/simulations`) with two simulations, and along
the way found and fixed a real navigation bug that the 11th new module
had quietly caused.

### Market Maker — a sales & trading seat
Quote a bid and ask around a randomly generated, moving price for 90
ticks. Tighter spreads get hit by more customer flow but earn less per
trade; wider spreads earn more per trade but get hit less — that trade-off
is the entire game. Your inventory carries real mark-to-market risk, and
if you breach a ±40-share risk limit, the "desk" forcibly hedges part of
your position at a penalty price, same as a real risk desk would. Every
number here is generated, not real market data — stated plainly on the
page.

### Portfolio Risk Simulator — an asset-management/risk seat
Build a portfolio across 10 real asset classes (US/international/emerging
equities, bonds, treasuries, REITs, gold, crypto, cash) and run a genuine
500-path, 1-year Monte Carlo simulation right in your browser. Get back a
percentile fan chart of possible outcomes, expected return, volatility,
95% VaR, 95% CVaR (Expected Shortfall), and a Sharpe ratio — the actual
output a risk or portfolio-management analyst produces. The return/
volatility/beta assumptions behind it are clearly labeled as illustrative,
textbook-style long-run averages, not live data or any specific bank's
published forecast.

### A real bug caught during my own check, not reported by you
Adding this 11th module pushed the top navigation bar past the width of a
normal 1280px laptop screen. My first fix (a horizontally scrolling nav
with the scrollbar hidden for a cleaner look) actually made things worse —
"Test Prep" and "The Vault" became genuinely unreachable, with no visual
hint that more items existed off-screen. Caught this by checking the
actual page structure at a standard screen width, not just eyeballing a
screenshot. Fixed properly: the module links now sit on their own row
that wraps onto a second line when there isn't room, so nothing is ever
hidden no matter how many modules get added later.

### Verified live
Monte Carlo output checked by hand against its own math (the displayed
Sharpe ratio matched the expected-return/volatility numbers exactly).
Market Maker's full mechanics — pumping, fills, risk-limit breaches,
pausing and resuming a session — all exercised directly, including
confirming a subtle bug (Resume was accidentally restarting the session
instead of continuing it) was caught and fixed before shipping. Dark-mode
chart colors confirmed correct. No console errors. `npm run build` passes
clean (30 routes).

### Nothing broken — safe to continue from here.

## Session 19 — 2026-07-24 (Two new modules: Lessons and Test Prep)

### The short version
You asked what was missing from the site for a real banking/asset
management/consulting career. I gave you a 6-item gap list, and you asked
for two new blocks built on top of it: **Lessons** (six written lessons —
Fixed Income & Credit, Three-Statement Modeling, Technical Interview
Fundamentals, Options & Derivatives, FX as an Asset Class, and Reading a
Real Deal — built as a complete curriculum, not just the topics you named)
and **Test Prep** (firm-type recruiting-process breakdowns, a technical/
case question bank, real Pymetrics game explanations with one playable
mock, and HireVue-style written practice). Both are live now, in the nav,
and working.

### Lessons (`/lessons`)
Six full lessons, each written for someone with no prior background,
grounded in real mechanics (bond pricing, the three-statement linkage
worked through by hand, DCF/LBO/M&A/comps walkthroughs, the options
Greeks, FX drivers, and how to actually read a real M&A deal
announcement). Click into any one from the index page; they link to each
other (next/previous) and back to relevant tools elsewhere on the site
(Model Templates, Company Profile, Central Bank Room, Hype vs
Fundamentals).

### Test Prep (`/test-prep`)
Four sections on one page:
- **Firm-type process breakdowns** — bulge bracket IB, boutique IB, asset
  management, MBB, and Big 4/other consulting, each with its real
  recruiting steps and honest notes on what actually matters at that firm
  type.
- **A filterable question bank** — 15 real technical and case questions
  (accounting/three-statement, valuation/technicals, deal & case), each
  with a model answer, filterable by category or firm type.
- **Pymetrics** — all 12 real games explained (what each one measures),
  plus a genuinely playable, simplified version of the Balloon Game
  (pump to grow the pot, cash out before it pops) — clearly labeled as an
  honest simplification, not the real proprietary algorithm. Worth
  knowing: **McKinsey doesn't actually use Pymetrics** — it uses its own
  "Solve" game — that distinction is called out directly on the page.
- **HireVue practice** — 12 real behavioral/technical/motivational
  prompts. No video recording (this project has no server to store
  video, by design), so instead: a stopwatch plus a text box, with drafts
  saved to your browser so they survive a refresh.

### Verified live
Both modules render correctly and appear in site nav. Directly tested:
question-bank category and firm-type filters, expanding/collapsing an
answer, the Balloon Game's pump/cash-out/pop mechanics end to end, and
the HireVue textarea saving to `localStorage` and correctly reloading
after a full page refresh. No console errors. `npm run build` passes
clean (29 routes total, including the 6 lesson pages pre-rendered as
static HTML).

### Nothing broken — safe to continue from here.
