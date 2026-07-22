# TASKS — Overnight Backlog

Work top to bottom. Mark `[x]` when acceptance criteria are met. Log everything in `PROGRESS.md` as you go. If blocked on one task >30 min, apply the documented fallback or note it and move on.

> **Note (2026-07-20):** Phases 0–5 below describe the *original* overnight plan, built around an NBIM-specific SWF Explorer flagship. After demoing it, Adam decided that module didn't fit his goals (see `docs/DECISIONS.md`) and asked for a pivot. That module was removed entirely. See **"Phase 6 — Pivot"** below for what replaced it and what's current. Phases 0–5 are kept as a historical record — most of their build steps (shell, data pipeline, editorial layer, etc.) still describe real work done and lessons applied to the new modules, only the specific SWF Explorer feature list is now obsolete.

## Phase 0 — Setup

- [x] Read `CLAUDE.md` and all files in `docs/` fully before writing code.
- [x] Initialize git repo, create Next.js app (App Router, TypeScript, Tailwind), confirm dev server and `npm run build` both work. First commit.
- [x] Create `PROGRESS.md` and `docs/DECISIONS.md` with initial entries.

## Phase 1 — Data pipeline (do this before UI polish)

- [x] Investigate NBIM holdings data availability per `docs/DATA_SOURCES.md`. Document exactly what you found (URLs, formats) in `PROGRESS.md`.
- [x] Write `/scripts` pipeline: raw download → cleaned, slimmed JSON (equities only; columns: name, country, sector, market value, ownership %, year). Include a README in `/scripts` explaining how to rerun it.
- [x] Sanity-check the processed data: row count ≈ NBIM's stated company count, top 10 holdings look right (Apple/Microsoft/Nvidia-tier names), totals in a plausible range. Record the checks in `PROGRESS.md`.
- [x] If real data unreachable: build the mock dataset fallback, clearly labeled, with the documented one-step swap path.

## Phase 2 — Terminal shell

- [x] Layout shell: dark terminal aesthetic, navigation, footer with attribution + disclaimer, responsive.
- [x] Landing page: pitch, module cards (SWF Explorer live; four "coming soon" cards per `MODULE_SPECS.md`), about section with placeholders for Adam's links.
- [x] Commit. Verify build passes.

## Phase 3 — SWF Explorer core

- [x] `/swf` route with module layout and as-of-date banner.
- [x] Company search (hero feature): fast fuzzy search over holdings; result card with stake value, % owned, % of portfolio, country, sector.
- [x] Portfolio overview dashboard: headline numbers, region chart, sector chart, top-20 table.
- [x] Country drill-down, including the UK view ("NBIM owns X% of the FTSE 100" style callout).
- [x] Editorial callouts with `{/* EDITORIAL: Adam to review */}` markers.
- [x] Commit. Verify build passes.

## Phase 4 — Stretch (only if Phases 0–3 fully done)

- [ ] Year-over-year comparison view (if multi-year data was obtained). — Skipped: only one year of (mock) data exists; revisit once real multi-year NBIM data is in.
- [x] Voting explorer for top ~100 holdings, or a well-designed placeholder tab. — Shipped as a placeholder tab (`/swf/voting`).
- [x] Basic SEO/meta tags and a good social-share preview.
- [x] Prepare for Vercel: confirm clean production build, write `docs/DEPLOY.md` with plain-English steps for Adam to deploy (creating Vercel account, importing repo). Do not attempt to deploy yourself — Adam does this step.

## Phase 5 — Wrap-up (always do this last, leave time for it)

- [x] Final `npm run build` must pass. Fix or revert anything broken.
- [x] Update `PROGRESS.md` with a morning briefing for Adam: what got built, what works, known issues, 3 suggested next steps, and any decisions he needs to make.
- [x] Final commit.

## Phase 6 — Pivot: SWF Explorer → Company Profile Generator

- [x] Remove SWF Explorer entirely: routes, components, mock data pipeline, and all nav/landing/footer references.
- [x] Wire up a real market-data provider (Twelve Data, free tier) behind a server-only wrapper (`src/lib/marketData.ts`) and an API-key setup flow (`.env.local.example`, documented in `docs/DATA_SOURCES.md`).
- [x] Build Company Profile Generator (new flagship): ticker search with autocomplete, price chart, key multiples grid, plain-English description, and an analytical context block (52-week range, P/E vs. market benchmark) — the "add analysis, not just data" layer.
- [x] Update all planning docs (`PROJECT_BRIEF.md`, `MODULE_SPECS.md`, `DATA_SOURCES.md`, `DECISIONS.md`) to reflect the new module lineup and design principle.
- [x] Verify `npm run build` passes and smoke-test the new routes.
- [x] Update `PROGRESS.md` with the pivot summary and API key setup steps for Adam.
- [x] Commit.

## Phase 7 — Analyst's Portfolio (superseded, see Phase 8)

This phase was replaced before being started. Testing the Company Profile
module with a real key surfaced that Twelve Data's free tier doesn't
include company fundamentals (see Phase 8 below and `docs/DECISIONS.md`),
and a broader conversation about what would actually stand out to
interviewers led to a bigger idea: not Adam's own private portfolio, but a
tool any student can use to research a company and build their own
investment pitch. See Phase 8.

## Phase 8 — Pitch Builder (in progress)

- [x] Investigate Twelve Data free-tier limits after testing with a real
      key — confirmed `/profile` and `/statistics` require a paid plan;
      reworked Company Profile to run entirely on free endpoints plus
      self-computed analytics (50-day moving average, momentum, annualized
      volatility) instead. See `docs/DECISIONS.md`.
- [x] Research and confirm SEC EDGAR's free XBRL API as a source of real
      US company fundamentals (revenue, net income, EPS, etc.), no key
      required — build `src/lib/secEdgar.ts`.
- [x] Build the Pitch Builder module (`/pitch`, `/pitch/[symbol]`): reuses
      Company Profile's price/chart data, adds SEC fundamentals for US
      tickers, and a structured form (rating, target price, thesis,
      catalysts, risks) — client-side only, no login, no database.
- [x] Add PDF export of the assembled pitch (`@react-pdf/renderer`) —
      presentable output a student could actually use.
- [x] Wire up nav/landing page to the new module; update
      `docs/MODULE_SPECS.md`/`docs/DATA_SOURCES.md` (done) and
      `docs/DECISIONS.md`.
- [x] Verify `npm run build` passes and smoke-test both a US ticker (with
      fundamentals) and a non-US ticker (without).
- [x] Update `PROGRESS.md`. Commit.

## Phase 9 — Pitch Builder becomes a block-based report builder

- [x] Extend `secEdgar.ts` to pull multi-year fundamentals history and
      many more line items (balance sheet, D&A, capex, dividends/
      buybacks, interest expense, shares outstanding).
- [x] Build computed analytics on free data only: beta (`src/lib/beta.ts`,
      real regression against SPY), credit metrics/ROIC/capital
      allocation (`src/lib/fundamentalsAnalysis.ts`), and a peer comps
      table (`src/lib/comps.ts` + `/api/comps`, student supplies peer
      tickers).
- [x] Build pure financial-modeling calculators: LBO returns (IRR/MOIC)
      and M&A accretion/dilution (`src/lib/dealMath.ts`), documented
      simplifying assumptions where real.
- [x] Design and build the block-based report builder: report-type picker
      (Equity Research live, others marked "(soon)"), addable/removable/
      reorderable/retitlable blocks (text, SWOT, list, stat grid, comps,
      LBO, M&A), "Unavailable" + editable override for any free-data gap.
- [x] Update PDF export to render the block list generically, same math
      functions as the live editors (single source of truth).
- [x] Verify `npm run build` passes; smoke-test a fresh dev server across
      `/`, `/pitch`, `/pitch/AAPL`, `/profile`, `/profile/AAPL` with no
      console errors.
- [x] Update planning docs (`MODULE_SPECS.md`, `DATA_SOURCES.md`,
      `DECISIONS.md`) and `PROGRESS.md`. Commit.

## Phase 10 — Deepen the data: full three-statement fundamentals, valuation multiples, growth/returns, qualitative lenses, chart block, news, all four report types

Adam tested the block builder and said the underlying data was still
insufficient — "at least the first part datas need to be there otherwise
theres nothing to do." This phase fills that gap.

- [x] Extend `secEdgar.ts`: operating cash flow, current assets/
      liabilities, basic/diluted weighted-average shares; changed
      operating income, D&A, and diluted EPS to multi-year history
      (needed for EBITDA/EPS growth).
- [x] New `src/lib/valuationAnalysis.ts`: market cap, enterprise value,
      net debt, working capital, free cash flow, EBITDA, the core
      multiples (P/E, EV/EBITDA, EV/EBIT, EV/Sales, P/B, FCF yield,
      dividend yield), ROE/ROA, and growth rates (revenue/EBITDA/EPS) —
      all null-safe, same convention as `fundamentalsAnalysis.ts`.
- [x] New `src/lib/news.ts`: Google News RSS headlines (free, no key),
      regex-parsed (no new XML dependency).
- [x] New Chart block (`ChartBlockEditor.tsx` + PDF rendering): pick a
      time series (price/revenue/net income/EBITDA) and line or bar type.
- [x] New News block: viewer-only, shows fetched headlines with links.
- [x] Added ~20 new stats to `availableStats` and a `group` field to the
      block library so the "Add a block" menu is organized into Core /
      Financials & valuation / four interview-lens sections.
- [x] Opened up all four report types (Equity Research, IB Comps, M&A,
      LBO) as selectable, each with its own suggested starter block set;
      switching types confirms before replacing the current blocks.
- [x] Added guided qualitative "lens" text blocks (Business & Moat, Bear
      Case, Ownership, Deal Synergies, Leverage & Debt Maturities, etc.)
      with placeholder prompts, not structured forms.
- [x] Verified `npm run build` passes with no TypeScript errors; fresh
      dev server smoke-tested `/pitch/AAPL` (new stats, chart with real
      data, news with real headlines, all four report types, PDF export
      compiles) and `/pitch/SHEL` (graceful "Unavailable" everywhere,
      no crash).
- [x] Update `PROGRESS.md` with a session summary. Commit.

## Phase 11 — Rebrand to "Bloombruh", site-wide dark/light theme, split-view Pitch Builder

You tested the deepened Pitch Builder and asked for three changes: stop
gating the company data behind checkboxes ("just be able to see the metrics
and financials as data... just like the data at the start of the website"),
a clear split between "just look at the data" and "build my own report" (a
two-pane layout once the student opts in), and a site-wide dark/light theme
(blue accent in dark mode, green in light mode). You also asked to rename
the project to **Bloombruh**.

- [x] Theme system: swapped the dark accent from amber to blue, added a
      `:root.light` palette (white background, green accent) in
      `globals.css`; new dependency-free `ThemeToggle.tsx` (persists to
      `localStorage`); a blocking script in `layout.tsx` applies the saved
      theme before first paint (no flash of the wrong theme).
- [x] Renamed the project to "Bloombruh" everywhere: nav, landing page,
      footer, PDF export, `package.json`, and every doc (`README.md`,
      `CLAUDE.md`, `docs/PROJECT_BRIEF.md`, `docs/MODULE_SPECS.md`,
      `docs/DEPLOY.md`).
- [x] New `DataDashboard.tsx`: every stat (key stats + all ~45 fundamentals/
      valuation/growth/credit stats) plus the price chart and news, shown as
      plain read-only cards, general → specific, zero checkboxes.
- [x] Extracted shared `Stat.tsx` and `NewsList.tsx` components so Company
      Profile, the dashboard, and the optional News report block all render
      identically.
- [x] Restructured `PitchWorkbench.tsx`: default view shows `DataDashboard`
      full-width with a "Build your own report" CTA; choosing to build
      splits the page into two panes (data dashboard sticky/scrollable on
      one side, report builder — type picker, rating/target price, blocks,
      PDF export — on the other). News stays visible in the dashboard and
      is still addable as a block/appendix in the exported report.
- [x] Verified `npm run build` passes with no TypeScript errors; fresh dev
      server smoke-tested `/`, `/profile/AAPL`, `/pitch/AAPL`, `/pitch/SHEL`
      — dashboard renders with no checkboxes, News section shows without
      adding a block, split view works, theme toggle markup present.
- [x] Updated `docs/DECISIONS.md`, `TASKS.md`, `PROGRESS.md`. Commit.

## Phase 12 — Merge Company Profile + Pitch Builder, title font, data-sources appendix

You said the two modules overlapped too much, asked for them merged into
one (keeping "build your own report" visible at the end, as before), asked
for less "AI-generated"-feeling titles, and asked for an expandable
appendix showing the source of every number on the page.

- [x] Deleted the old, simpler `/profile` pages; the fuller pages that used
      to live at `/pitch` (full financials, chart, news, computed
      analytics, optional report builder) now live at `/profile` instead.
      `/pitch` removed entirely (correctly 404s).
- [x] Updated `src/lib/modules.ts` to a single "Company Profile" module
      entry — nav and landing page no longer show two overlapping cards.
- [x] Added Fraunces (`next/font/google`, no new dependency) as a
      `font-display` utility, applied only to page/company titles; rest of
      the site stays on Geist Sans/Mono.
- [x] New `DataSourcesAppendix.tsx`: collapsible "Data sources &
      methodology" section at the bottom of every company page (after the
      "build your own report" CTA), documenting which free provider backs
      each figure and which numbers are this site's own calculations.
- [x] Verified `npm run build` passes with no TypeScript errors; fresh dev
      server smoke-tested `/`, `/profile`, `/profile/AAPL`, `/profile/SHEL`
      (all 200) and `/pitch` (404 as expected).
- [x] Updated `docs/DECISIONS.md`, `TASKS.md`, `PROGRESS.md`. Commit.

## Phase 13 — Fix "Couldn't load DPLM" bug report (Diploma plc)

- [x] Diagnosed via direct Twelve Data API testing: free "Basic" plan only
      covers quotes for US-exchange-primary-listed stocks and US OTC, not
      foreign-exchange-only listings (LSE, ASX, TSX, Frankfurt, etc.).
- [x] Found and fixed a real code bug in `src/lib/marketData.ts`: the
      plan-gated error's useful message was being discarded because the
      code checked `res.ok` before reading the JSON body that contained it.
- [x] `src/app/profile/[symbol]/page.tsx` now shows an accurate explanation
      for this specific error instead of the generic "might not exist"
      message.
- [x] `src/components/profile/TickerSearch.tsx` flags "limited data" on
      search results from exchanges the free plan doesn't cover.
- [x] Verified live: fresh dev server, `/profile/DPLM` shows the new
      explanation, `/profile/AAPL` unaffected (no regression). `npm run
      build` passes clean.
- [x] Updated `docs/DECISIONS.md`, `TASKS.md`, `PROGRESS.md`.

## Phase 14 — Dedupe search results to one row per company

- [x] Diagnosed via direct Twelve Data API testing: `symbol_search` returns
      one row per exchange a company is listed on — Canada Goose alone
      came back as 6+ near-duplicate rows (NYSE, TSX, LSE, Frankfurt,
      Stuttgart, Munich, Dusseldorf).
- [x] New `src/lib/exchangeCoverage.ts` — shared `FREE_TIER_EXCHANGES`/
      `hasFreeQuoteData()`, used by both the new dedupe logic and the
      existing "limited data" search badge (previously two separate copies).
- [x] `src/lib/marketData.ts` — `searchSymbols()` now dedupes by company
      name, preferring the listing that's free-tier-compatible.
- [x] Verified live: fresh dev server, `/api/search?q=canada%20goose`
      returns a single NYSE result instead of 6+. `npm run build` passes.
- [x] Updated `docs/DECISIONS.md`, `TASKS.md`.

## Phase 15 — Upgraded to Twelve Data Grow plan; stop showing empty stat sections; diagnose small/mid cap fundamentals gap

You upgraded to Twelve Data's paid "Grow" plan yourself, then reported that
small/mid caps still show no fundamentals/valuation/growth/returns, and
asked not to show companies/sections with no data or just one number.

- [x] `src/components/pitch/DataDashboard.tsx` — `StatGroup` now only
      renders stats that actually have a value (no more "Unavailable"
      cards); a section with zero populated stats doesn't render at all;
      if a company has no fundamentals-driven data whatsoever, the whole
      "Fundamentals & valuation" area collapses to one explanatory line
      instead of four empty-looking grids.
- [x] Diagnosed the fundamentals gap directly against SEC EDGAR: Canada
      Goose (`GOOS`) genuinely has financial data filed with the SEC, but
      under form `20-F` and the `ifrs-full` XBRL taxonomy (foreign private
      issuer / IFRS accounting), not `10-K`/`us-gaap` — the only taxonomy
      `secEdgar.ts` currently checks. This likely applies to most non-US
      companies with a US listing (Canadian, UK, EU, Australian, etc.).
- [x] Verified live: fresh dev server, `/profile/GOOS` shows a clean
      one-line "no fundamentals" message with zero "Unavailable" cards;
      `/profile/AAPL` still shows all four full sections (no regression).
      `npm run build` passes.
- [x] Updated `docs/DECISIONS.md`, `TASKS.md`.
- [x] Not yet built (flagged for a follow-up decision): adding an
      `ifrs-full` taxonomy fallback to `secEdgar.ts` to recover real
      fundamentals for foreign-private-issuer filers — needs a currency
      handling decision first (many report in local currency, not USD).
      → Built in Phase 16 below.

## Phase 16 — IFRS fundamentals fallback + automatic USD conversion with a "converted from" caption

You said to show the USD-converted number with a small "converted from X
currency, X number" note underneath, and not to worry about exhaustive IFRS
accounting rigor — "good enough" for a student site.

- [x] `src/lib/fx.ts` (new) — free, no-key Frankfurter FX rate lookup.
- [x] `src/lib/secEdgar.ts` — `getFundamentals()` now falls back to the
      `ifrs-full` taxonomy + `20-F`/`40-F` forms when no US-GAAP `10-K`
      data exists, using a short, spot-checked (not exhaustive) IFRS tag
      list for revenue, net income, gross/operating profit, assets, equity,
      cash, current assets/liabilities, D&A, diluted EPS, operating cash
      flow. Detects whichever currency SEC actually reports the value in,
      converts every monetary field to USD with one FX rate per company,
      and returns `originalCurrency`/`fxRateToUsd` alongside so the UI can
      show the original figure.
- [x] `src/lib/format.ts` — new `formatOriginalCurrency()` helper.
- [x] `src/components/Stat.tsx` — optional `caption` prop.
- [x] `src/lib/reportBlocks.ts` — `StatEntry` gets an optional `caption`.
- [x] `src/app/profile/[symbol]/page.tsx` — `currencyCaption()` helper adds
      "Converted from CAD C$1.2bn"-style captions to the monetary stats
      that come from fundamentals (revenue, net income, cash, total assets,
      shareholders' equity, operating cash flow, EBITDA, working capital,
      diluted EPS); ratios/multiples don't need one (unaffected by currency
      once inputs are consistent).
- [x] `src/components/pitch/DataDashboard.tsx` — passes the caption through
      to each `Stat` card.
- [x] Verified: `npm run build` and `tsc --noEmit` both pass clean. Live
      dev server test: `/profile/GOOS` now shows real USD-converted
      fundamentals (e.g. Revenue $867m, caption "Converted from CAD
      C$1.2bn"); `/profile/AAPL` unaffected — plain USD, no captions.
- [x] Updated `docs/DATA_SOURCES.md`, `docs/DECISIONS.md`, `TASKS.md`.

## Phase 17 — "Pro" AI report grading (Anthropic Claude API), code-locked

You asked for an AI feature that grades a student's written report, shipped
now as a "Pro" tier unlocked with the code "bloombruh" — a placeholder until
there's a real monetization plan.

- [x] `npm install @anthropic-ai/sdk zod`.
- [x] `.env.local.example` — documents the new (paid, optional)
      `ANTHROPIC_API_KEY`.
- [x] `src/lib/grading.ts` (new) — server-only wrapper around the Claude API
      (`claude-opus-4-6`, adaptive thinking, structured output via a Zod
      schema). Builds a prompt from the student's written blocks (Text,
      SWOT, Bullet list — skips data-only blocks like comps/LBO/charts) and
      the real company stats already fetched, so Claude can fact-check
      claims against real numbers, not just judge writing style in a
      vacuum.
- [x] `src/app/api/grade/route.ts` (new) — thin proxy so the browser never
      sees the API key; maps Anthropic's typed error classes
      (`AuthenticationError`, `RateLimitError`, `APIError`) to clear,
      honest messages rather than a generic failure.
- [x] `src/components/pitch/AiGrader.tsx` (new) — the code-lock gate
      (`localStorage`-persisted unlock, code "bloombruh") plus the "Grade my
      report" trigger and results display (overall score, summary,
      strengths/weaknesses, fact-check notes, section-by-section feedback).
      Wired into `PitchWorkbench.tsx`'s report pane, next to the PDF
      download button.
- [x] Verified: `npm run build` and `tsc --noEmit` pass clean. Live dev
      server test of `/api/grade`: missing `ANTHROPIC_API_KEY` returns a
      clear 500 with an honest message (no key is set locally, as
      expected); malformed/empty request returns a clean 400. Actually
      calling Claude wasn't tested end-to-end this session since no
      `ANTHROPIC_API_KEY` is configured — do that once you add your own key.
- [x] Updated `docs/DATA_SOURCES.md`, `docs/DECISIONS.md`, `TASKS.md`,
      `PROGRESS.md`.

## Phase 18 — Central Bank Room: news per bank + Adam's own commentary

Turned the "Central Bank Room" module from a "soon" placeholder into a
real page — a bank picker, real news per bank, and a space for Adam's own
written opinion, kept clearly separate from the sourced news.

- [x] `src/lib/centralBanks.ts` (new) — registry of 8 central banks (Fed,
      ECB, BoE, BoJ, PBoC, SNB, RBA, BoC), each with a Google News search
      query.
- [x] `src/data/centralBankOpinions.ts` (new) — Adam's own commentary,
      stored as a plain versioned data file (no database), starts empty.
- [x] `src/app/macro/layout.tsx`, `src/app/macro/page.tsx` (new) — bank
      selector (`?bank=` URL param, server-rendered), two-column News +
      Commentary layout, honest "No commentary yet" empty state per bank.
      Reuses `getCompanyNews()` (`src/lib/news.ts`) and the shared
      `NewsList` component — no new news integration needed.
- [x] `src/lib/modules.ts` — Central Bank Room flipped from "soon" to
      "live"; tagline/description rewritten to match what actually shipped
      (dropped the old placeholder's "hawkish/dovish scoring" promise,
      which wasn't built this round).
- [x] Verified: `npm run build` and `tsc --noEmit` pass clean; `/macro`
      shows up as a new route. Live dev server test: `/macro` and
      `/macro?bank=ecb` both return 200, render the right bank's name/news,
      and show the "No commentary yet" empty state correctly.
- [x] Updated `docs/DATA_SOURCES.md`, `docs/DECISIONS.md`, `TASKS.md`,
      `PROGRESS.md`.

## Phase 19 — Central Bank Room: real rates, history charts, rate-decision timeline

Deepened `/macro` per Adam's request: real policy-rate data, a history
chart, and a derived timeline of rate decisions with generic explanations —
plus a plain-English section on monetary/fiscal policy — all shown before
the news section (previously the whole page).

- [x] Empirically tested 8 candidate free central-bank statistics APIs with
      real `curl` calls before writing any code (Fed/FRED, ECB SDW, BoE
      IADB, BoC Valet, SNB Data Portal, RBA CSV, plus FRED proxy series for
      BoJ and PBoC) — confirmed which ones actually work, what resolution
      (daily vs monthly) each gives, and one access quirk (RBA blocks
      non-`curl`-like User-Agents).
- [x] `src/lib/centralBankRates.ts` (new) — one fetcher per bank, `null`-safe
      throughout, returns current rate + history + a derived
      `decisions` timeline (every point where the rate changed). Two banks
      (BoJ, PBoC) are flagged `isProxy: true` since no bank-published daily
      policy rate exists for them; two (SNB, RBA) are `resolution: "monthly"`
      instead of `"daily"`.
- [x] `src/components/macro/RateChart.tsx` (new) — history chart (Recharts,
      same visual style as the Company Profile price chart).
- [x] `src/components/macro/RateTimeline.tsx` (new) — rate-decision list,
      most recent first, each with a generic (clearly labelled as generic,
      not sourced) one-line explanation of what that type of move typically
      does.
- [x] `src/components/macro/PolicyExplainer.tsx` (new) — static, plain-English
      section on how monetary policy works, hikes vs. cuts, and how monetary
      policy relates to budgetary/fiscal policy.
- [x] `src/app/macro/page.tsx` — restructured so the new Rates section
      (stat cards, chart, timeline, explainer) renders first, with News and
      Commentary moved below it, exactly as requested. Honest "Rate data
      unavailable" state if a live fetch fails.
- [x] `src/lib/modules.ts`, `src/app/macro/layout.tsx` — description and
      attribution banner updated to reflect what's actually on the page now.
- [x] Verified: `npm run build` and `tsc --noEmit` pass clean. Live dev
      server test across all 8 banks (`/macro?bank=fed|ecb|boe|boc|snb|rba|boj|pboc`)
      — every one returns a real current rate, a working chart, and a
      decision timeline; confirmed the RBA User-Agent workaround actually
      fixes the 403 it hit initially.
- [x] Updated `docs/DATA_SOURCES.md`, `docs/DECISIONS.md`, `TASKS.md`,
      `PROGRESS.md`.

## Phase 20 — Full visual redesign: "Claude-like" look, light-by-default, cursive-serif logo

Adam asked for a full visual redesign — warm, modern, simple, with a
cursive/elegant logo — replacing the original dark terminal aesthetic.

- [x] `src/app/globals.css` — new palette: light theme is now the default
      (warm cream background, warm near-black text, terracotta accent
      `#bc5b33`); dark theme is now the opt-in toggle (warm charcoal
      background, peach accent `#e08659`). Added `--accent-foreground` token
      so accent-colored buttons get correct contrast text in both themes.
- [x] `src/app/layout.tsx` — Fraunces font gained an italic style variant;
      inline anti-flash theme script flipped to default-light/opt-in-dark.
- [x] `src/components/ThemeToggle.tsx` — rewritten as a circular sun/moon
      icon button (was a "LIGHT"/"DARK" text button); persists to
      `localStorage`.
- [x] `src/components/TerminalNav.tsx`, `TerminalFooter.tsx` — logo/wordmark
      now renders in italic serif (`font-logo`) for the "cursive, elegant"
      look; nav pills and search box are now fully rounded.
- [x] `src/app/page.tsx` — landing hero heading uses the italic serif too;
      module cards use softer rounded-2xl corners.
- [x] Hardcoded chart/PDF colors updated to match the new palette (can't use
      CSS variables): `PriceChart.tsx`, `RateChart.tsx`,
      `ChartBlockEditor.tsx`, `PitchPdfDocument.tsx`. Accent-on-accent button
      text fixed (`text-black` → `text-accent-foreground`) in
      `PitchWorkbench.tsx` and `AiGrader.tsx`.
- [x] Verified: `npm run build` and `tsc --noEmit` pass clean. Live preview
      check (after fixing an unrelated local dev-tooling `PATH` issue — see
      `docs/DECISIONS.md`) of the landing page, `/profile/AAPL`, and the
      Pitch Builder two-pane split view, in both light and dark mode —
      colors, chart tones, and the split-view layout all render correctly.
- [x] Updated `docs/DECISIONS.md`, `TASKS.md`, `PROGRESS.md`.

## Phase 21 — News block quoting/pagination, rate-decision "Explain more", rate chart zoom

Follow-up feedback after trying the Pitch Builder and Central Bank Room.

- [x] `src/lib/reportBlocks.ts` — `NewsBlockData` changed from `Record<string,
      never>` to `{ selectedLinks: string[] | null }` (`null` = include
      everything, the old default behavior); `createNewsBlock` updated.
- [x] `src/components/pitch/blocks/NewsBlockEditor.tsx` — rewritten as an
      interactive checkbox-selection list (data/articles/onChange props,
      "All"/"None" quick actions, selected/unselected card styling matching
      `StatsBlockEditor.tsx`).
- [x] `src/components/pitch/ReportBuilder.tsx` — News block now wired with
      `data`/`onChange` like every other block type.
- [x] `src/components/pitch/PitchPdfDocument.tsx` — News block in the PDF
      export now filters by `selectedLinks` instead of rendering every
      fetched article.
- [x] `src/components/pitch/NewsList.tsx` — now a client component with
      "Show 4 more headlines" pagination (6 shown up front, +4 per click);
      shared by the always-visible data dashboard and the News block.
- [x] `src/app/profile/[symbol]/page.tsx` — news fetch limit raised from 6
      to 20 so there's more to page through/select from.
- [x] `src/lib/news.ts` — extracted shared `fetchGoogleNewsRss` helper; added
      `getRateDecisionNews(bankName, date, limit)` using Google News'
      `after:`/`before:` date-scoped search, bracketing a few days either
      side of a rate decision.
- [x] New `src/app/api/bank-decision-news/route.ts` — thin GET proxy calling
      `getRateDecisionNews`, following the existing `/api/timeseries`
      pattern.
- [x] `src/components/macro/RateTimeline.tsx` — rewritten as a client
      component; each decision has an "Explain more" button that lazily
      fetches and displays real, dated news coverage for that specific
      decision (clearly labeled as real sourced coverage, not the bank's
      own stated rationale).
- [x] `src/components/macro/RateChart.tsx` — rewritten to accept full
      `history` and add 1D/1W/1M/3M/1Y/Max range buttons (same UI pattern as
      the Company Profile price chart), filtering the already-fetched
      history client-side (no re-fetch) and reusing `sampleForChart` for
      downsampling.
- [x] `src/app/macro/page.tsx` — updated call sites for both components.
- [x] Verified: `npm run build`/`tsc --noEmit` pass clean. Live preview
      check: News block checkboxes toggle and All/None work; "Show 4 more
      headlines" pagination confirmed on `/profile/AAPL`; rate-decision
      "Explain more" confirmed against the Fed's real 2025-12-11 cut
      (returned 5 real dated articles); rate chart 1Y zoom confirmed
      correctly narrowing the Fed chart.
- [x] Updated `docs/DECISIONS.md`, `TASKS.md`, `PROGRESS.md`.

## Phase 22 — Rate decision timeline: full history grouped by year + AI-generated (source-grounded) explanations

Follow-up: wanted the whole fetched history browsable (not just recent
moves), grouped by year, with real explanatory sentences per decision
instead of just a list of links.

- [x] `src/components/macro/RateTimeline.tsx` — rewritten to group all
      decisions by year into expandable sections (`YearSection`), most
      recent year open by default, others collapsed until clicked; removed
      the old 20-item cap since year-grouping makes the full history
      browsable without dumping everything on screen at once.
- [x] New `src/lib/rateDecisionExplainer.ts` — sends the real fetched news
      articles for one decision to Claude (`claude-sonnet-4-6`, cheaper than
      the AI grader's Opus since this is short factual synthesis, not deep
      reasoning) with strict instructions to only use what's in those
      articles and say plainly if there isn't enough to explain confidently
      — never fabricates.
- [x] `src/app/api/bank-decision-news/route.ts` — now also calls
      `explainRateDecision`, returns `{ articles, explanation,
      explanationError }`, and caches results in memory per bank+date so
      re-viewing a decision doesn't re-fetch or re-charge.
- [x] `DecisionItem` in `RateTimeline.tsx` shows the AI explanation with
      "Situation & likely reasoning (AI-generated, grounded in the sources
      below)" labeling, sources always listed directly underneath; falls
      back to showing just the raw source articles with a clear note if the
      AI call fails or no API key is configured (verified live locally with
      no key set — fallback renders cleanly, no crash).
- [x] Verified: `npm run build`/`tsc --noEmit` pass clean. Live preview
      check on `/macro?bank=fed`: 2025 opens expanded by default with 2024
      etc. collapsed below; clicking a year expands/collapses correctly;
      "Explain more" fetched real articles and showed the expected graceful
      AI-unavailable fallback (no `ANTHROPIC_API_KEY` in this dev
      environment).
- [x] Updated `docs/DECISIONS.md`, `TASKS.md`, `PROGRESS.md`.

## Phase 23 — New module: Markets Overview (world situation, equity sectors, private markets)

You asked for a "how is the market doing" text section in the Central Bank
Room's Global Overview and on the homepage, with a sector picker (global
equities, TMT, FIG, healthcare, etc.), a period picker (week/month/year/
forever), descriptions and graphs, and the same idea for private markets
(private equity, private credit, etc.). Clarified scope with you first: new
standalone module vs. extending /macro (chose new module + homepage
teaser), how the narrative text should be produced (chose AI-generated,
grounded in real news, stacked with Adam's own take), and how to handle
private markets having no free live data (chose real public proxies,
charted, plus real news/text, clearly labeled as proxies).

- [x] `src/lib/marketSectors.ts` (new) — 7-sector registry (Global
      Equities/SPY, TMT/XLK, FIG/XLF, Healthcare/XLV, Energy/XLE,
      Industrials/XLI, Consumer/XLY), each with a real named ETF proxy and
      a news query.
- [x] `src/lib/privateMarketSegments.ts` (new) — 3-segment private-market
      registry (Private Equity/PSP, Private Credit/BIZD, Real Estate &
      Infrastructure/VNQ), each a real public proxy, plus a shared
      disclaimer string.
- [x] `src/data/marketCommentary.ts` (new) — Adam's own commentary, empty
      to start, keyed by segment id, same pattern as
      `centralBankOpinions.ts`.
- [x] `src/lib/marketData.ts`, `src/app/api/timeseries/route.ts` — added an
      additive `"1W"` range (7-day chart) alongside the existing
      1D/1M/3M/1Y/MAX, for the Markets Overview module's period picker.
- [x] `src/lib/news.ts` — generalized `getGlobalMacroNews` into a reusable
      `getPeriodNews(query, daysBack, limit)` so any segment's news query
      can be scoped to any period.
- [x] `src/lib/marketNarrative.ts` (new) — Claude-grounded narrative
      generator, same guardrails/model choice as
      `rateDecisionExplainer.ts`; `src/app/api/market-narrative/route.ts`
      (new) — in-memory cached proxy route.
- [x] `src/components/markets/` (new) — `PeriodSelector.tsx`,
      `SegmentChart.tsx`, `SegmentNarrative.tsx`, `SegmentOverview.tsx`
      (shared picker+chart+narrative panel, reused for both sectors and
      private markets), `WorldSituationOverview.tsx` (reused full-size on
      `/markets` and compact on the homepage).
- [x] `src/app/markets/layout.tsx`, `src/app/markets/page.tsx` (new) —
      assembles the world-situation panel, sector picker, and
      private-markets picker.
- [x] `src/lib/modules.ts` — registered "Markets Overview" as a new live
      module (auto-wires nav).
- [x] `src/app/page.tsx` — added the compact world-situation teaser between
      the hero and the module cards.
- [x] Verified: `npm run build` and `tsc --noEmit` both pass clean. Live
      dev server smoke test: `/` (teaser renders with real news, graceful
      "AI key not set" fallback since no `ANTHROPIC_API_KEY` is configured
      locally) and `/markets` (all three sections render with real Twelve
      Data prices and real period-scoped news; clicking a sector and
      switching periods correctly re-fetches; no console errors).
- [x] Updated `docs/DATA_SOURCES.md`, `docs/DECISIONS.md`, `PROGRESS.md`.

## Phase 24 — Central Bank Room: AI "situation" summary on Global Overview + per-bank "Economic backdrop"

You asked for the Global Overview to present an AI-written explanation of
the current situation across central banks (why rates are like this, what's
happening, explaining the decisions), and a few simple lines before each
bank's own timeline about that region's current economic situation and how
it's evolved.

- [x] `src/lib/centralBankRates.ts` — extracted the Global Overview's
      hike/cut/hold arithmetic into a shared, exported `summarizeBankRates()`
      (+ `GlobalRateRange`/`GLOBAL_RATE_RANGES`/`globalRatePeriodPhrase`) so
      both the client component and the new API route compute the identical
      numbers — the AI narrative can never describe a different figure than
      what's on screen.
- [x] `src/lib/centralBankNarrative.ts` (new) — `explainGlobalRateSituation()`
      (pure, grounded in real per-bank figures + period-scoped news) and
      `explainRegionalEconomy()` (self-caching, called directly from the
      macro page's server component since there's no route in front of it).
- [x] `src/app/api/global-rate-narrative/route.ts` (new) — re-fetches all 8
      banks, computes the summary, fetches period-scoped news, generates the
      narrative; in-memory cached per period.
- [x] `src/components/macro/GlobalRatesOverview.tsx` — refactored to use the
      shared summary logic; added the AI narrative box (lazy-fetched,
      re-fetches on period change, client-cached); the "Real coverage"
      news list now shows the period-scoped articles behind the narrative
      once loaded, falling back to the original fixed list otherwise.
- [x] `src/app/macro/page.tsx` — fetches regional economy news + generates
      the "Economic backdrop" narrative per bank, rendered in a new box
      between the price-history chart and the "Rate decisions" timeline.
- [x] Verified: `npm run build` and `tsc --noEmit` both pass clean. Live dev
      server test with a real `ANTHROPIC_API_KEY` configured: the Global
      Overview produced a real, grounded 5-sentence explanation of why the
      Fed/ECB/RBA/PBoC/SNB were moving in different directions (correctly
      citing real bp figures, honestly flagging where coverage didn't fully
      explain a move); switching to the ECB's page showed a correct,
      region-specific "Economic backdrop" (Eurozone) while the cached global
      narrative reappeared instantly; no console errors.
- [x] Updated `docs/DATA_SOURCES.md`, `docs/DECISIONS.md`, `PROGRESS.md`.

## Phase 25 — Hong Kong Stock Exchange coverage via EODHD (second free provider, HK only)

You asked whether Hong Kong stocks could be added given Twelve Data's plan
doesn't cover HKEX, and specifically whether EODHD could be used just for
Hong Kong while everything else stayed on Twelve Data. Verified empirically
with your real EODHD key before building anything.

- [x] Tested EODHD live against a real HKEX ticker (Tencent `0700.HK`) —
      confirmed real quote + years of EOD history on the free tier;
      fundamentals paywalled (expected, same shape of limit as SEC EDGAR).
- [x] `src/lib/eodhd.ts` (new) — server-only wrapper: `isHongKongSymbol()`
      (the single routing check, keyed off the `.HK` suffix),
      `searchHongKongSymbols()` (filters the free `/exchange-symbol-list/HK`
      directory locally — neither provider's own free-text search reliably
      surfaces plain HKEX common stock), `getHkQuote()` (adapts EODHD's
      real-time endpoint + directory name lookup + computed 52-week
      high/low and average volume from real EOD history into a
      Twelve-Data-`Quote`-shaped object), `getHkTimeSeries()` /
      `getHkTimeSeriesForRange()`.
- [x] `src/lib/exchangeCoverage.ts` — new `hasFreeQuoteDataForResult()`,
      symbol-aware (not just exchange-label-aware) so Twelve Data's own
      non-working raw HKEX search results still correctly show "limited
      data" while EODHD-backed `.HK` results don't.
- [x] `src/app/api/search/route.ts` — merges Twelve Data + EODHD HK results;
      sorts so results this site can actually show real data for come
      first, fixing a real bug found while testing (Twelve Data alone
      returns dozens of noisy international matches for names like "HSBC",
      which pushed the one working HK result past the dropdown's 8-item
      display cutoff).
- [x] `src/app/api/timeseries/route.ts` — routes `.HK` symbols to EODHD for
      chart-range switching; fixed the x-axis label formatter for
      EODHD's date-only (no time-of-day) response shape.
- [x] `src/app/profile/[symbol]/page.tsx` — routes quote/series to EODHD for
      HK symbols, skips SEC fundamentals and beta outright (neither source
      covers Hong Kong), and shows an HK-specific "couldn't load" message
      instead of the Twelve-Data-plan-specific one.
- [x] `src/components/profile/TickerSearch.tsx` — uses the new symbol-aware
      free-data check.
- [x] `src/app/profile/layout.tsx`, `src/components/pitch/
      DataSourcesAppendix.tsx` — data-source banner and methodology
      appendix both updated to disclose the EODHD/HKEX carve-out and how
      the computed 52-week/average-volume figures work for HK tickers.
- [x] `.env.local.example` — documents the new optional `EODHD_API_KEY`
      (every other exchange works with no key here at all).
- [x] Verified: `npm run build`/`tsc --noEmit` pass clean. Live dev server
      test: `/profile/0700.HK` (Tencent) and `/profile/0005.HK` (HSBC) both
      render real prices, real computed 52-week ranges, real Wikipedia
      descriptions, real news, graceful "no SEC fundamentals" messaging;
      searching "hsbc" surfaces the real HKEX listing within the visible
      dropdown (confirmed the sort fix); no console errors.
- [x] Updated `docs/DATA_SOURCES.md`, `docs/DECISIONS.md`, `PROGRESS.md`.

## Phase 26 — New module: HKEX Screener (`/kpmg`), Hong-Kong-only search built for the KPMG conversation

Right after Phase 25 shipped Hong Kong Stock Exchange coverage, you asked
for a separate, distinctly-branded page — explicitly for the KPMG
conversation — where the only thing searchable is HKEX.

- [x] `src/app/api/search-hk/route.ts` (new) — thin proxy calling
      `searchHongKongSymbols()` directly (no Twelve Data merge, unlike the
      main `/api/search`), so this module's search is guaranteed
      HKEX-only.
- [x] `src/components/kpmg/HkTickerSearch.tsx` (new) — search box UI,
      same interaction pattern as `TickerSearch.tsx` but no "limited data"
      badge needed (nothing this search returns can fail to load).
- [x] `src/app/kpmg/layout.tsx`, `src/app/kpmg/page.tsx` (new) — landing
      page with an honest "not affiliated with/endorsed by KPMG"
      disclaimer, HK-only search, and five quick-pick tickers (Tencent,
      HSBC, Alibaba, AIA Group, China Mobile), each verified against the
      live EODHD directory before being hardcoded.
- [x] `src/lib/modules.ts` — registered "HKEX Screener" as a new live
      module (auto-wires nav). Clicking a search result sends the reader to
      the existing `/profile/{symbol}.HK` page — no new company-data
      pipeline built, reuses the HK routing shipped in Phase 25.
- [x] Verified: `npm run build`/`tsc --noEmit` pass clean. Live dev server
      test: `/kpmg` renders with the disclaimer and quick-pick chips;
      `/api/search-hk?q=alibaba` returns only HKEX results; clicking
      through to `/profile/9988.HK` (Alibaba) renders a full real profile;
      "HKEX Screener" shows in the nav; no console errors.
- [x] Updated `docs/DATA_SOURCES.md`, `docs/DECISIONS.md`, `PROGRESS.md`.

## Phase 27 — Bug fix: HK chart range switching; search UX for limited-data results; HKEX Screener copy trim

Three follow-ups after trying the site: some graphs didn't respond to
range switching, limited-data search results should just be suggestions
(not live dead-end links), and the HKEX Screener's copy should say "for
KPMG" rather than narrating the conversation that inspired it.

- [x] Diagnosed the range-switching bug by live-testing all three chart
      types (Company Profile, Markets Overview, Central Bank Room) via
      simulated clicks + before/after x-axis diffing — only Hong Kong
      tickers were actually broken.
- [x] Root-caused via direct `curl` tests against EODHD: their `/eod`
      endpoint's `limit` parameter does nothing at all (confirmed with and
      without `order`, with different `limit` values, all returning the
      same ~1-year default) — an undocumented provider quirk, not a bug in
      this project's code.
- [x] `src/lib/eodhd.ts` — `getHkEodHistory()` now bounds results with
      `from`/`to` calendar-date params instead of the broken `limit`;
      `HkRange` mappings changed from trading-day counts to calendar-day
      lookbacks to match.
- [x] `src/components/profile/TickerSearch.tsx` — limited-data search
      results now render as plain, greyed-out, non-clickable rows instead
      of buttons; `handleSubmit` (Enter key) skips past limited-data
      results to the first genuinely usable one.
- [x] `src/lib/modules.ts`, `src/app/kpmg/page.tsx`, `src/app/kpmg/
      layout.tsx` — simplified copy to "for KPMG", dropped the
      conversation narrative; the honest non-affiliation disclaimer was
      left unchanged.
- [x] Verified: `npm run build`/`tsc --noEmit` pass clean. Live tests:
      `/api/timeseries?symbol=0700.HK&range=1M` returns 24 points (was
      246); clicking "1M" on `/profile/0700.HK` now correctly narrows the
      chart; searching "hsbc" shows working results as clickable rows and
      limited-data results as non-clickable `<div>`s (confirmed via DOM
      inspection); `/kpmg` copy updated.
- [x] Updated `docs/DATA_SOURCES.md`, `docs/DECISIONS.md`, `PROGRESS.md`.

## Phase 28 — Bug fix: SEC EDGAR fundamentals missing for 20-F/6-K US-GAAP filers (Alibaba, JD, Baidu, etc.)

You reported the Fundamentals & Valuation section was showing almost
nothing and asked if anything could be done. Investigated by testing a
real company (Alibaba, `BABA`) directly against SEC's own API before
touching code.

- [x] Confirmed empirically: Alibaba's real revenue/net income data exists
      in SEC's XBRL API, tagged under `us-gaap`, filed via `20-F`/`6-K` —
      but `secEdgar.ts` only accepted `us-gaap` data filed under `10-K`,
      silently discarding it.
- [x] `src/lib/secEdgar.ts` — both the US-GAAP and IFRS taxonomy lookups
      now accept the full set of forms (`10-K`/`10-K/A` plus
      `20-F`/`20-F/A`/`40-F`/`40-F/A`/`6-K`/`6-K/A`) instead of assuming a
      strict taxonomy-to-form pairing that doesn't hold for foreign
      private issuers reporting under US-GAAP (Alibaba, JD.com, Baidu,
      PDD, NIO, Trip.com, and others).
- [x] `src/lib/format.ts` — fixed a related bug found while verifying:
      `formatUSD()` didn't handle negative numbers (common for net debt at
      cash-rich companies like Alibaba), rendering a raw
      `$-20612040200.00` instead of `-$20.6bn`. Fixed to match
      `formatOriginalCurrency()`'s already-correct `Math.abs()` pattern.
- [x] Verified: `npm run build`/`tsc --noEmit` pass clean. Live test:
      `/profile/BABA` went from "No SEC fundamentals data available" to a
      complete real fundamentals section (revenue, net income, all
      valuation multiples, credit metrics, beta, growth rates); net debt
      renders correctly as `-$20.6bn`; `/profile/AAPL` re-checked for no
      regression.
- [x] Updated `docs/DATA_SOURCES.md`, `docs/DECISIONS.md`, `PROGRESS.md`.
- [ ] Proposed, not yet built: map HK tickers to their corresponding US
      ADR ticker where one exists and is a real SEC registrant (e.g.
      `9988.HK` → `BABA`, `0005.HK` → `HSBC`), so fundamentals show
      directly on HK company pages too. Also proposed: a DCF calculator
      block, matching the existing LBO/M&A calculator pattern
      (`src/lib/dealMath.ts`). Both awaiting Adam's go-ahead.

## Phase 29 — Homepage: trimmed hero copy, added an expandable data-sources appendix

- [x] `src/app/page.tsx` — removed the "Free · Web-based · Built for
      students" eyebrow and the "A Bloomberg-lite for students..."
      paragraph from the hero.
- [x] `src/components/pitch/DataSourcesAppendix.tsx` — generalized from a
      Company-Profile-only hardcoded component to a generic one taking
      `sources`/`note` props; exported the original content as
      `COMPANY_PROFILE_SOURCES`.
- [x] `src/components/pitch/PitchWorkbench.tsx` — both call sites updated
      to pass `COMPANY_PROFILE_SOURCES` + a computed fundamentals note
      (same wording as before, no content change).
- [x] `src/app/page.tsx` — added a new `HOME_SOURCES` list (world-situation
      news via Google News RSS, world-situation narrative via Claude) and
      rendered the appendix at the very end of the homepage.
- [x] Verified: `npm run build`/`tsc --noEmit` pass clean. Live dev server
      test: homepage hero now reads as just the logo + button; new
      appendix expands correctly at the bottom with the tailored sources;
      `/profile/AAPL`'s appendix re-checked, still works after the
      refactor.
- [x] Updated `docs/DECISIONS.md`, `PROGRESS.md`.

## Phase 30 — Fundamentals coverage: banks/insurers, stale-tag guard, HK↔SEC bridge, ADR multiple fix

You reported smaller companies and HKEX pages still showed no Fundamentals
& Valuation data. Investigated empirically: small US companies mostly
worked already — the real holes were financial-sector tagging, Hong Kong
listings, and (discovered during verification) wrongly inflated multiples
on ADR pages.

- [x] `src/lib/secEdgar.ts` — added verified financial-sector revenue tags
      (`RevenuesNetOfInterestExpense` GS/JPM, `PremiumsEarnedNet` PGR/MET,
      `InterestAndDividendIncomeOperating` EGBN); staleness guard so an
      abandoned tag's decade-old data is never shown as "latest FY";
      `revenueConcept` returned so the UI can caption FIG top lines.
- [x] `src/lib/hkAdrMap.ts` (new) — curated 15-pair HK↔US-SEC-filer map,
      every pair verified same-legal-entity; excludes unsponsored ADRs
      (Tencent) and HK subsidiaries of US parents.
- [x] `src/app/profile/[symbol]/page.tsx` — HK pages fetch fundamentals via
      the mapped US ticker; valuation multiples on both HK and mapped ADR
      pages computed from the HK ordinary-share price × HKD→USD (fixes
      BABA's P/E showing 204.3x instead of 25.8x — ADS bundle ≠ share);
      price stats currency-aware (HK$); FIG revenue caption; provenance
      note fed to the data-sources appendix.
- [x] `src/lib/eodhd.ts` — `getHkClose()` (single cached call).
- [x] `PitchWorkbench.tsx` / `DataDashboard.tsx` / appendix copy — note
      plumbing + currency-aware price display.
- [x] Verified live: EGBN ($625m revenue + lender caption, P/E 8.1x),
      9988.HK (full fundamentals via BABA, P/E 25.8x, HK$ prices), BABA
      (25.8x / $275.7bn, was 204.3x / $2.18tn), AAPL (no regression).
      Build + typecheck clean.
- [x] Updated `docs/DECISIONS.md`, `docs/DATA_SOURCES.md`, `PROGRESS.md`.

## Phase 31 — New module: Model Templates (downloadable Excel models, live formulas)

You asked for downloadable, personalizable templates covering what analysts
build across IB, ER, AM, and S&T — configured on the site, prefilled with
real data, sector guidance built in, surfaced on the homepage next to the
Global Overview. Scoping questions answered: Excel with live formulas, the
full set at once, guidance inside each template.

- [x] `npm install exceljs` (server-side only; documented in DECISIONS.md).
- [x] `src/lib/templates/` — `types.ts` (registry + request config),
      `sectorGuidance.ts` (7 sectors; FIG is structural, others written),
      `prefill.ts` (real data via the same libs as profile pages),
      `excelHelpers.ts` (shared styling, guidance + sources sheets).
- [x] Six template builders: `dcf.ts` (EV DCF + FIG dividend-discount
      variant, fading growth, CAPM/WACC, sensitivity grid), `lbo.ts`
      (real debt schedule, MOIC/IRR, value-creation bridge), `merger.ts`
      (two-ticker prefill, financing mix + check, synergies discipline),
      `initiation.ts` (rating/target with live upside, thesis prompts,
      valuation summary), `portfolio.ts` (self-computing holdings sheet),
      `marketUpdate.ts` (real sector + central-bank data at download time).
- [x] `/api/template` (POST → .xlsx stream), `/templates` page + layout,
      `TemplateGallery.tsx` (cards, inline ticker search, sector chips,
      per-template options, download). Module registered; homepage got the
      "Want to build your own valuation model?" card beside Global Overview.
- [x] Verified: 8 configurations generated through the live API and parsed
      back programmatically — real prefill and live formulas confirmed in
      every probe; browser UI download tested (200, file saved); build +
      typecheck clean; no console errors.
- [x] Updated `docs/DECISIONS.md`, `docs/DATA_SOURCES.md`,
      `docs/MODULE_SPECS.md`, `PROGRESS.md`.

## Phase 32 — Model Templates: Trading Comps (completes DCF/Comps/LBO/M&A)

- [x] `src/lib/templates/comps.ts` (new) — subject + up to 6 peers, real
      data prefilled per row, every multiple a live formula, MEDIAN/mean
      over peers only (blanks skipped), implied-value block repricing the
      subject at peer medians three ways.
- [x] `types.ts` — `comps` template entry + `peerTickers` request field.
- [x] `/api/template` — parse/dedupe/cap (6) the peer list, exclude subject.
- [x] `TemplateGallery.tsx` — subject picker + peer-list input.
- [x] Verified: TMT (AAPL vs MSFT/GOOGL/META) and FIG (JPM vs GS/MS/BAC)
      generated via live API + parsed back — real prefill + live formulas
      confirmed. Build + typecheck clean.
- [x] Updated `docs/DECISIONS.md`, `PROGRESS.md`.

## Phase 33 — Central Bank Room: "Markets & the economy" panel (index vs. rate + period narrative)

You asked for more period-dependent text on each bank's country situation,
and a famous regional index charted in parallel with the policy rate to
compare (unsure if actually correlated).

- [x] `src/lib/regionalIndices.ts` — each bank → a verified US-listed index/
      country ETF proxy, honestly labeled exact (SPY, FEZ) vs. proxy.
- [x] `explainCountrySituation()` in `centralBankNarrative.ts` + `/api/
      country-situation` (period + real index-return + news grounded,
      instructed to be honest about correlation), cached per bank+period.
- [x] `IndexRateCompareChart.tsx` — dual-axis overlay (rate % left, index
      right), rate carried forward onto index dates; `windowChangePercent`
      helper shared with the panel.
- [x] `CountrySituation.tsx` — period selector + chart + period narrative +
      news; replaces the old static "Economic backdrop" box.
- [x] `macro/page.tsx` — fetches ~5yr of the region's index daily closes,
      passes rate+index history in; removed the superseded server-side
      backdrop fetch.
- [x] Verified live: Fed (exact S&P 500) + BoE (proxy, labeled "≈ FTSE 100,
      via EWU") — both lines render, period switch re-fetches narrative +
      news, correlation kept honest ("would be speculation rather than
      analysis"). Build + typecheck clean, no console errors.
- [x] Updated `docs/DECISIONS.md`, `docs/DATA_SOURCES.md`, `PROGRESS.md`.

## Phase 34 — Markets Overview: 5-Year period + fixed "Forever" (was secretly capped at 5yr, no year label)

- [x] Diagnosed two real problems: "Forever" silently reused a 5-year
      weekly window (no cap indicator), and a genuine bug in the shared
      `/api/timeseries` date-label code meant the year was never shown for
      any multi-year range on any ticker (a Hong-Kong-specific check was
      short-circuiting the range-specific formatting for everyone).
- [x] `src/lib/marketData.ts` — new real "5Y" tier (weekly, ~5yr); "MAX"
      now genuinely full history (monthly bars, confirmed against SPY's
      real 1993 inception via a live API test, not assumed).
- [x] `src/app/api/timeseries/route.ts` — `formatLabel` rewritten so only
      "1D" branches on time-of-day presence; 5Y/MAX show "YYYY-MM", others
      "MM-DD" — fixes the same bug on Company Profile's price chart too
      (shares this route).
- [x] `PeriodSelector.tsx`, `/api/market-narrative/route.ts`,
      `eodhd.ts`'s `HkRange` — "5Y" added for type consistency.
- [x] Verified live: `range=5Y` → 260 weekly points labeled `YYYY-MM`;
      `range=MAX` → 403 monthly points from 1993-01 to today; UI shows
      "5 Years" button; clicking "Forever" on a real chart renders ticks
      `1993-11 → 2026-07`. Build + typecheck clean, no console errors.
- [x] Updated `docs/DECISIONS.md`, `PROGRESS.md`.
