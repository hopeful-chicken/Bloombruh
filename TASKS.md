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

## Phase 35 — New module: Hype vs Fundamentals (historical cases + current themes)

You asked for a module comparing hype to fundamentals in two parts: closed
historical cases, and open current ones (e.g. "AI bubble").

- [x] `src/lib/hypeCases.ts` — registry of 3 historical cases (dot-com,
      meme stocks, cannabis boom), each with its tickers, a bounded
      era window (start/end), and a news query. Metadata only — no
      hardcoded prices or stats.
- [x] `src/lib/hypeThemes.ts` — registry of 2 current themes (AI &
      semiconductors, quantum computing), same pattern, no end window
      since these are still open.
- [x] `src/lib/hypeAnalysis.ts` — real computation layer: fetches each
      historical ticker's full monthly price history, indexes it to 100
      at the window start, finds the real peak *within the case's era*
      (not the whole history), and computes real run-up % and
      vs-today % from that. Current themes get a real quote + real SEC
      EDGAR revenue growth + real valuation multiples.
- [x] `src/lib/hypeNarrative.ts` — two AI narrative functions with
      deliberately different guardrails: historical cases allow hindsight
      ("what happened, and why"); current themes are explicitly instructed
      to **never render a verdict** on whether something is a bubble —
      present the real evidence on both sides and say so if it's unclear.
- [x] `/api/hype-theme-narrative` route (current themes only — historical
      narratives are cheap enough to compute directly in the server
      component) + `src/data/hypeCommentary.ts` for Adam's own take.
- [x] `IndexedCaseChart.tsx`, `HistoricalCaseCard.tsx`,
      `CurrentThemeCard.tsx` (period selector, reuses Markets Overview's
      `SegmentChart`), `hype/layout.tsx` (source/guardrail banner),
      `hype/page.tsx` (assembles both sections).
- [x] `modules.ts` — "Hype vs Fundamentals" flipped from "soon" to "live".
- [x] **Bug found and fixed:** every historical ticker's computed "era
      peak" was landing in 2024–2026 instead of its real historical era.
      Root cause was two layers deep — a missing `windowEnd` bound on the
      peak search, and (the real cause) `getTimeSeries()` being hardcoded
      to daily bars, so `outputsize=400` only reached back ~1.6 years,
      nowhere near 1998–2003. Fixed by switching to
      `getTimeSeriesForRange(symbol, "MAX")` (the monthly-bar deep-history
      function built for Markets Overview's "Forever" fix) plus the
      `windowEnd` bound. Verified live after the fix: CSCO/QQQ peak
      2000-03, GME 2021-01, AMC 2021-06, TLRY 2018-09, CGC 2019-04 — all
      correct eras, with plausible real run-up % (GME +7388%).
- [x] **Bug found and fixed:** the current-theme AI narrative fired before
      the page's own price-return figures had loaded client-side, so it
      sometimes said price-return data was "unavailable" while the stat
      cards next to it already showed real numbers. Fixed by waiting for
      every ticker's real return before requesting the narrative.
- [x] **Bug found and fixed:** the module fetches SEC EDGAR fundamentals
      for up to 5 tickers per page load; each ticker's own fundamentals
      call already fans out to ~21 concurrent SEC requests, and doing
      several tickers at once multiplied that into a burst well past
      SEC's documented 10-requests/second limit, causing some real
      fundamentals to silently come back "Unavailable". Fixed by fetching
      tickers sequentially instead of via `Promise.all`, capping the
      module's peak SEC EDGAR concurrency at the same level every other
      page on the site already has.
- [x] Build + typecheck clean; `dynamic = "force-dynamic"` added after
      confirming the page would otherwise run its (paid) AI narrative
      calls at `next build` time on every deploy.
- [x] Updated `docs/DECISIONS.md`, `docs/DATA_SOURCES.md`, `PROGRESS.md`.

## Phase 36 — Deep research pass (stock pitches, valuation plan, hype/fundamentals, agentic AI) + new Pokemon Cards module + new Prompt Answers page

While you were out: 10 stock pitches, a guided valuation-model learning
plan, 10 hype-vs-fundamentals write-ups, agentic AI research for KPMG's
tax team, and a real Pokemon card market module — done in that order
(easier/research tasks first, Pokemon last, per your instruction).

- [x] 10 stock pitches researched live (Diploma PLC mandatory, Nintendo
      for the Pokemon angle, BAT/BAE as the paired ESG-exclusion
      contrast, ASML/Maersk/Cameco for the geopolitics angle, Microsoft/
      Palantir for AI, Greggs for the everyday-UK pick) — each with real
      current numbers, macro/geopolitical context, and a personal-
      connection angle.
- [x] Valuation-model learning plan written, sequenced for NBIM's
      equities team specifically (grounded in NBIM's own real published
      strategy and active-ownership documents, not a generic curriculum),
      staying open to S&T/M&A, referencing this site's own Model
      Templates for practice.
- [x] 10 hype-vs-fundamentals examples researched with real, sourced
      quotes (tulip mania debunked by modern historians, the NFT "right
      click save" collapse, Meta's $80bn+ metaverse retreat, the Nikola
      "rolling downhill truck" fraud, the 3D-printing bubble, quantum
      computing's 800-1000x P/S ratios) alongside the two required open
      cases: the AI bubble and Pokemon card hype.
- [x] Agentic AI capabilities researched live across Copilot, OpenAI,
      Claude, and Perplexity, specifically for KPMG's tax practice —
      including what KPMG itself has already committed to (Workbench,
      Digital Gateway + Claude integration, the Microsoft Agent 365/
      Copilot firm-wide deployment) plus the Circular 230/hallucination
      liability considerations that matter most for tax specifically.
- [x] Pokemon card data-source research done empirically (not assumed):
      TCGdex confirmed as a genuinely free, working, multi-language API
      with real current pricing; PokemonPriceTracker identified as the
      real paid option for deeper history if ever wanted. Reverse-
      engineering question answered directly (moot now that a free,
      legitimate option covers the need).
- [x] `src/lib/pokemonCards.ts` + `src/app/pokemon/` — new module: search
      by name/language/energy-type/set, card detail page with real
      TCGPlayer low/mid/high/market + Cardmarket avg/1-7-30-day trend.
      Honest about the one real limit (no free multi-year price history
      exists anywhere) rather than faking a chart.
- [x] `src/data/promptAnswers.ts` + `src/app/research/` — new "Prompt
      Answers" page storing all the long-form research above (rendered
      via `react-markdown`, the one new dependency this added).
- [x] Both new modules registered in `modules.ts`. Build + typecheck
      clean; live-verified real search results, a real card detail page
      matching a direct API call, and the research page rendering
      correctly — no console errors.
- [x] Updated `docs/DECISIONS.md`, `docs/DATA_SOURCES.md`, `PROGRESS.md`.

## Phase 37 — Company Profile: gauge scores, chart baseline/color fixes, disclosure, logos

Picked from the Streamlit-spec gap-analysis report (Phase 36's last entry),
in the priority order you gave: chart color-split, 1D baseline bug check,
disclosure footer, gauge scores, logos.

- [x] `src/lib/chartSplit.ts` — shared `splitAtBaseline()` helper: splits a
      price series into green-above/red-below segments around a baseline,
      inserting an exact interpolated crossing point so the color change
      happens right where the line crosses, not at the nearest real point.
      Applied to `PriceChart.tsx` (Company Profile) and `SegmentChart.tsx`
      (Markets Overview / Hype current themes) — not to the multi-ticker
      `IndexedCaseChart`, where distinct per-ticker colors matter more than
      a shared up/down semantic.
- [x] **Real bug found and fixed**: `PriceChart`'s "1D" view computed
      up/down (and the chart's own baseline) from the day's *first*
      intraday bar, not yesterday's close — Twelve Data's 1D intraday
      series only covers today's own session. An overnight gap-down could
      render as a green "up" day. Fixed by wiring the `previousClose`
      already fetched server-side (previously computed but only shown as
      a separate stat tile) through to `PriceChart` as a real baseline,
      prepended as a genuine data point so the chart itself shows the true
      gap, with an explicit caption saying so.
- [x] `src/lib/config.ts` — single `DISCLOSURE` constant, now the source
      for the line already shown in `TerminalFooter.tsx` (rendered on
      every page via the root layout) — one wording, one place, instead of
      hand-typed prose that could drift between pages.
- [x] `src/lib/signals.ts` + `src/components/profile/ScoreGauge.tsx` — two
      0-100 gauges ("Technical strength": 200DMA trend, 14-day RSI,
      52-week range position; "Fundamental quality": margin, ROE, net
      debt/EBITDA, revenue growth) plus 7 short neutral-language "at a
      glance" chips (Trend, Momentum, 52-week range, Profitability,
      Leverage, Volatility, Valuation) — never a buy/sell signal, every
      sub-score documented as a simple linear-clamp heuristic against
      commonly-cited reference ranges, and any missing input is left out
      of the average rather than guessed. Wired into `DataDashboard.tsx`
      right after the price chart, fed by real inputs already computed on
      the Company Profile page (fundamentals, valuation metrics, beta,
      price history) — no new API calls.
- [x] `src/lib/logos.ts` — lightweight logo display: a curated ticker→
      domain map plus Google's public favicon proxy, fetched live at
      render time (no offline scraper pipeline, no locally-stored asset
      files to maintain, per the report's own recommendation against the
      spec's heavier approach). Shown next to the company name on Company
      Profile and next to each match in the ticker search dropdown.
- [x] Verified live: AAPL's gauges/chips show real numbers (88 Technical
      strength, 76 Fundamental quality, driver bullets matching the stats
      grid below exactly); the 1Y chart visibly splits red→green at the
      real crossing point; the 1D view shows the "Baselined at yesterday's
      close" caption and a real previous-close data point; the Apple logo
      renders in the header. Build + typecheck clean, no console errors.
- [x] Updated `docs/DECISIONS.md`, `PROGRESS.md`.

## Phase 38 — "The Vault" cleanup + Pokemon Cards rebuilt as a market analysis + walking-sprite easter egg

You asked to trim the research page, rename it, and rework Pokemon Cards
from a per-card search tool into a market-level analysis — framed around
a specific thesis you gave: Pokemon behaves like a durable commodity,
unlike the hype-and-crash pattern of most collectibles.

- [x] Removed 4 entries from `promptAnswers.ts` (the two KPMG write-ups,
      the Pokemon API research writeup, and the Streamlit-spec comparison)
      — 3 remain (valuation plan, stock pitches, hype vs fundamentals 10).
      Renamed the module/page from "Prompt Answers" to **"The Vault"**
      throughout (`modules.ts`, the page eyebrow).
- [x] `src/lib/pokemonMarket.ts` — real, sourced data only: the Pokemon
      Company's own disclosed cumulative-production milestones (34.1bn in
      2020 → 85bn+ by May 2026, ~40% of all cards ever printed made in
      just the last 3 fiscal years), PSA 10 1st-Edition Base Set
      Charizard's real reported price trajectory (2018-2025), and real
      liquidity proxies (PSA grading volume +95% YoY, eBay's ~58% share of
      Pokemon sales) — no fabricated data points, no smoothed gaps.
- [x] Researched the "commodity vs. hype" thesis directly rather than just
      asserting it: found the 1990s "Junk Wax" baseball-card bubble (81bn
      cards/year printed at the peak, market never recovered, revenue fell
      to ~1/7th of peak) as the real contrast case, and confirmed Pokemon
      is actually outperforming Magic/Yu-Gi-Oh in recent growth rather
      than the category broadly declining.
      Also researched, and reported honestly, what *isn't* verifiable: no
      continuous 30-year demand series exists publicly (only scattered
      disclosed milestones), and "market size" estimates disagree 3-5x
      across research firms depending on methodology.
- [x] `src/components/pokemon/MarketChart.tsx` and `CharizardChart.tsx` —
      real Recharts visualizations of the above (Charizard's chart is
      log-scaled; the price range spans ~700x). `src/app/pokemon/page.tsx`
      rebuilt around this analysis: market overview, the Charizard case
      study (with a live current raw-card price pulled from this module's
      own TCGdex feed, for comparison against the historical graded
      figures), the sports-card comparison, a SWOT, and an explicit "what
      isn't knowable" section.
- [x] Removed the per-card search UI and its now-dead code
      (`searchCards`, `listSets`, `ENERGY_TYPES`, `CardSummary` in
      `pokemonCards.ts`) per your explicit request to reframe this as a
      market, not a lookup tool. The `/pokemon/[id]` card detail route
      stays live and linkable (used by the Charizard case study's "see
      the live card page" link) — just no longer the page's front door.
- [x] **Real bug found and fixed while verifying the new page:** two
      bold/plain-text JSX boundaries lost their space on render (e.g.
      "...ever printed</span>was printed..." with no space) — a classic
      JSX line-wrap whitespace-collapsing pitfall already worked around
      elsewhere in this codebase with explicit `{" "}`. Found via direct
      HTML inspection (not just the rendered screenshot), fixed the same way.
- [x] `src/components/pokemon/WalkingPokemon.tsx` — the easter egg: every
      6-10 seconds (randomized), a real animated Pokemon sprite spawns and
      genuinely wanders — a shared `requestAnimationFrame` loop drives
      real per-frame position updates (random direction changes every
      1.5-4s, edge-bounce by reflecting the angle, a sine-wave vertical
      bob for a walking gait), not a fixed CSS point-A-to-B keyframe.
      Refined twice from your feedback: first to genuinely wander instead
      of glide in a straight line, then to stay in the page's empty side
      margins (computed from the content column's real `max-w-5xl` width)
      rather than crossing over the text. Capped at 6 on-screen at once,
      each despawning after ~35s. A defensive guard skips spawning
      entirely if the viewport hasn't been laid out yet (0 width/height)
      rather than ever placing a walker at garbage coordinates. Sprites
      are real animated GIFs from the `PokeAPI/sprites` GitHub repo
      (Pokemon Showdown/Smogon-community sourced, explicitly credited as
      reusable in that repo's own README), served via jsDelivr's GitHub
      CDN mirror (not `raw.githubusercontent.com`, which explicitly asks
      not to be hotlinked in production) — confirmed working via a direct
      request before building anything. Same non-commercial, educational,
      fan-project usage category as the card artwork this module already
      displays via TCGdex — not Nintendo-licensed, but the same
      well-established, low-friction pattern thousands of fan tools rely on.
- [x] Verified live: new page renders with real chart data and a real
      live Charizard price matching a direct API check; DOM inspection
      confirmed real sprites spawning with correct URLs, positions, and
      capping behavior; a real screenshot confirmed correct visible
      placement in the side margin after the wander/side-zone refinement
      (a Psyduck sprite in the top-right corner, clear of the text
      column); no console errors; `npm run build`/`tsc --noEmit` clean.
- [x] Updated `docs/DECISIONS.md`, `docs/DATA_SOURCES.md`, `PROGRESS.md`.

## Phase 39 — Pokemon Cards: "$30 in 1999" vs. the S&P 500 comparison chart

You asked for a chart: $30 in a PSA 10 1st-Edition Charizard since 1999
vs. $30 in the S&P 500 since 1999, orange vs. blue. Built it, with a real
constraint surfaced along the way: this session's web-search budget for
the month was exhausted partway through the research, and PriceCharting/
PWCC/Heritage Auctions all blocked automated access (HTTP 403) on top of
that — so this documents exactly what's solidly sourced vs. not, rather
than presenting a smooth 27-year line as if it were all equally real.

- [x] **The S&P 500 side is fully real.** Found that Yahoo Finance's own
      public chart API (`query1.finance.yahoo.com/v8/finance/chart/SPY`)
      is directly reachable and returns real dividend-and-split-adjusted
      ("Adj Close") SPY prices back to January 1999 — confirmed live,
      332 real monthly data points. This is the correct basis for a fair
      total-return comparison (not just raw price appreciation), and is
      exactly the source you named. $30 in January 1999 compounds to
      ~$261 today (real, computed from this real data — roughly 9x).
- [x] **The Charizard side is honest about a real ~19-year data gap.**
      From 2018 onward, every point is the same real, publicly reported
      sale data already verified earlier this session ($11,000 in 2018 →
      $550,000 by December 2025). For 1999-2017, no dated PSA 10 sale
      record could be verified from the named sources given the access
      blocks — the $30 starting point is treated explicitly as the
      *stated entry-price assumption this comparison was asked to use*,
      not a documented sale, and is visually marked as such on the chart
      (a hollow/dashed dot vs. filled dots for every real transaction).
- [x] `src/lib/pokemonMarket.ts` — added `THIRTY_DOLLAR_COMPARISON`, a
      real year-by-year dataset (1999-2026) merging the dense real S&P
      500 series with the sparse real Charizard sale points, each row
      flagged `charizardReal: true/false` so the chart can render the
      distinction rather than imply false precision.
- [x] `src/components/pokemon/ThirtyDollarChart.tsx` — dual-line,
      log-scale (the two lines end ~2,000x apart) Recharts component,
      Charizard in orange, S&P 500 in blue, with a custom dot renderer
      for the real-vs-assumption distinction.
- [x] Added to `src/app/pokemon/page.tsx` with an explicit "exactly how
      solid each side of this chart actually is" disclosure box — same
      honesty pattern as the rest of this module.
- [x] **Real bug found and fixed while verifying, same pattern as before:**
      another JSX whitespace-collapse spot (`$550,000</span> as of...`
      losing its space where the line wrapped) — found via direct HTML
      inspection, fixed with `{" "}`.
- [x] Verified live: real computed figures (9x, ~18,000x) match the
      underlying data exactly; the full 28-point dataset confirmed
      correctly embedded and rendered via direct HTML inspection; no
      console errors; `npm run build`/`tsc --noEmit` clean.
- [x] Updated `docs/DECISIONS.md`, `docs/DATA_SOURCES.md`, `PROGRESS.md`.

## Phase 40 — Pokemon Cards: filled the pre-2016 gap, and corrected a shaky data point in the process

You asked to search again specifically for pre-2016 Charizard data.
Web search access had come back since the last session (the earlier
monthly-budget block was temporary), which turned up real, better-sourced
data — and, importantly, surfaced that one of the *existing* data points
was itself questionable and needed fixing, not just filling a gap forward.

- [x] Found a real, precisely dated sale: **$18,900, 23 July 2017**, via
      PWCC on eBay, documented by Beckett News — one of the sources you
      originally named. Pushes real data back about 5 months earlier than
      what was there before.
- [x] Found something more valuable than another data point: an explicit,
      source-attributed fact (via data tracker Card Ladder) that **no PSA
      10 sale of this card is publicly recorded at all between 2017 and
      2021**. That's not a research gap to apologize for — it's a real,
      citable fact about the market itself, and a stronger thing to show
      on the chart than an invented intermediate point ever would be.
- [x] **Caught and corrected a real data-quality issue while doing this:**
      the previously-used "2018: $11,000" point turned out to be shaky —
      it doesn't square with the Card Ladder gap fact above, and its
      original sourcing (from earlier in the project) wasn't as solid as
      what this pass found. Replaced it with the properly-sourced $18,900/
      July 2017 figure. Also removed a "2016: $800" point that had been
      mixing a different, far more common ungraded/near-mint card into
      the same series as PSA 10 graded sales — a real, if subtle,
      apples-to-oranges mistake that made the pre-2020 gap look smaller
      than it honestly is.
- [x] **Caught a real bug while making this edit, before it ever
      shipped:** first attempt at encoding the "no recorded sales"
      2017-2021 gap used a literal `{ usd: 0 }` placeholder point — which
      would have plotted as a real zero value on a log-scale axis (where
      log(0) is undefined) and misleadingly implied a documented $0 sale.
      Caught immediately on review and fixed by leaving the gap as a true
      gap in the data (no interpolated point at all) with the Card
      Ladder fact stated in prose instead.
- [x] Updated `src/lib/pokemonMarket.ts` (`CHARIZARD_PRICE_HISTORY` and
      `THIRTY_DOLLAR_COMPARISON`), the case-study prose, and the "$30 in
      1999" disclosure box in `src/app/pokemon/page.tsx` — all now
      consistent with the corrected data and the new sourcing.
- [x] Verified live: old `$11,000` figure confirmed completely gone from
      the rendered page; new `$18,900`/`Card Ladder` figures confirmed
      present in both the case-study section and the full embedded
      28-point dataset; no console errors; `npm run build`/`tsc --noEmit`
      clean.
- [x] Updated `docs/DECISIONS.md`, `docs/DATA_SOURCES.md`, `PROGRESS.md`.

## Phase 41 — Two new modules: Lessons and Test Prep (closing the finance-career gaps)

You asked what was missing from the site for a real banking/asset
management/consulting career, then asked for two new blocks: a "Lessons"
block covering the gap topics as proper written lessons (fixed income,
three-statement modeling, technical interview fundamentals, options,
FX, and reading a real deal — built as a complete set, not just the ones
you asked about by name), and a "Test Prep" block covering first-round
assessments specifically — firm-type process breakdowns, a technical/case
question bank, real Pymetrics game mocks, and HireVue-style written
practice.

- [x] Researched the real first-round assessment landscape before
      building anything: which firms actually use Pymetrics vs. HireVue
      vs. their own tools (McKinsey uses "Solve," not Pymetrics — a real
      distinction worth not blurring), what the real 12 Pymetrics games
      are and what each measures, and how bulge bracket IB, boutique IB,
      asset management, and MBB vs. other consulting recruiting
      processes actually differ.
- [x] New **Lessons** module (`/lessons`, `/lessons/[slug]`) — six
      full written lessons in `src/data/lessons.ts`: Fixed Income &
      Credit, Three-Statement Modeling, Technical Interview Fundamentals
      (turns the site's own DCF/LBO/M&A/Comps templates into
      interview-ready walkthroughs), Options & Derivatives, FX as an
      Asset Class, and Reading a Real Deal. Reuses the existing
      `MarkdownContent` renderer from The Vault rather than building a
      new one. Registered in `src/lib/modules.ts` and site nav.
- [x] New **Test Prep** module (`/test-prep`) — firm-type process
      overviews for 5 firm types in `src/data/testPrep.ts`; a filterable
      technical/case question bank (15 questions across Accounting &
      Three-Statement, Valuation & Technicals, and Deal & Case, each
      tagged by which firm types actually ask it) via
      `src/components/testprep/QuestionBank.tsx`; all 12 real Pymetrics
      games listed with what each measures, plus a genuinely playable
      simplified Balloon Game (`BalloonGame.tsx`) — explicitly labeled as
      an honest simplification, not Pymetrics' real algorithm; and a
      write-and-time HireVue practice tool (`HireVuePractice.tsx`) with
      12 real behavioral/technical/motivational prompts, a stopwatch, and
      localStorage-persisted drafts (no accounts/database in this
      project, so drafts save per-browser).
- [x] Verified live: both modules render correctly in nav and on their
      pages; question bank category/firm-type filters and expand/collapse
      work; Balloon Game pump/pop/cash-out mechanics confirmed correct
      via direct interaction; HireVue textarea save-to-localStorage and
      persistence across a full page reload both confirmed; no console
      errors; `npm run build` clean (29 routes, including 6 static
      lesson pages via `generateStaticParams`).

## Phase 42 — Self-audit pass: new Simulations module + a real nav bug fixed

You asked me to self-check the site as an analyst would and add whatever I
judged genuinely useful — no need to ask first — and specifically floated
a "simulation" section for any high-finance role, generated data allowed
if real data wasn't available.

- [x] New **Simulations** module (`/simulations`) — two simulations, two
      seats:
      - **Market Maker** (`MarketMakerGame.tsx`) — a sales & trading
        seat. Quote a bid/ask spread around a randomly generated
        (random-walk) mid price for 90 ticks; tighter spreads fill more
        often but earn less per trade, wider spreads the opposite;
        inventory carries real mark-to-market risk; breaching a ±40-share
        risk limit triggers a forced, penalty-priced hedge — the same
        trade-offs a real market-making desk manages, on fully synthetic
        data.
      - **Portfolio Risk Simulator** (`PortfolioRiskSimulator.tsx`) — an
        asset-management/risk seat. Build a portfolio across 10 real
        asset classes (`src/data/simulations.ts`), each with an
        illustrative long-run return/vol/beta assumption (textbook-style
        figures, explicitly labeled as assumptions, not live data or any
        specific bank's published forecast), and run a genuine 500-path,
        1-year Monte Carlo simulation (single-factor/market-model, so
        assets move with realistic correlation) entirely in the browser —
        outputs a percentile fan chart, expected return, volatility, 95%
        VaR, 95% CVaR (Expected Shortfall), and Sharpe ratio.
- [x] Registered in `src/lib/modules.ts` and nav.
- [x] **Found and fixed a real bug while verifying this in the browser,
      not something the user reported:** adding an 11th nav item pushed
      the top nav past the width of a standard 1280px desktop screen —
      "Test Prep" and "The Vault" scrolled off with no visible way to
      reach them (my first attempted fix, a horizontal scroll container,
      made this worse by hiding the scrollbar entirely). Fixed properly
      by moving the module links to their own row that wraps onto a
      second line instead of scrolling — confirmed via direct DOM
      inspection that all 11 modules are present and reachable at both
      1280px desktop and 768px tablet widths.
- [x] Verified live: Monte Carlo output sanity-checked by hand (a
      50/20/30 Large-Cap/Intl/Bonds mix returned a Sharpe ratio matching
      `(expectedReturn − 4%) / volatility` exactly); Market Maker's
      pump/fill/risk-breach/pause/resume mechanics all exercised directly
      (including confirming the "Resume" button correctly continues an
      in-progress session instead of restarting it); dark-mode chart
      colors confirmed resolving to the correct theme value via computed
      styles. No console errors. `npm run build` clean (30 routes).

## Phase 43 — Replaced The Vault with a Word download; added "My Analysis" (Adam's own research notebook)

You asked for two changes ahead of moving the site to bloombruh.com: remove "The Vault" as a
browsable section and replace it with a downloadable Word document instead, and add a new
section for your own independent, ongoing research on breaking macro/market stories — something
closer to "I saw a headline, I want to dig deeper," not a neutral data module.

- [x] Generated a real `.docx` (`public/downloads/bloombruh-research.docx`, ~40KB) from the 3
      remaining Vault entries (valuation-model learning plan, 10 stock pitches, 10 hype-vs-
      fundamentals write-ups) — built with the `docx` npm library since neither `pandoc` nor
      LibreOffice was available on this machine to use the more typical markdown→docx path;
      verified structurally (63 hyperlinks, 35 headings, 160 bold runs, 27 bullets — all counts
      consistent with the source content) since there was no way to render it to an image for a
      visual check without LibreOffice installed.
- [x] Removed `src/app/research/` entirely, removed "The Vault" from `src/lib/modules.ts`/nav,
      deleted the now-fully-unused `src/data/promptAnswers.ts`, and removed a stale link to it
      from the Pokemon Cards page.
- [x] Added a "Download past research write-ups (Word)" link to the site footer
      (`TerminalFooter.tsx`) so the content is still reachable, just as a download rather than a
      browsable page.
- [x] New **My Analysis** module (`/analysis`) — reuses the same entry-list + Markdown-body
      pattern The Vault used, but reframed as Adam's own personal research notebook rather than
      AI-answered prompts. Two real, sourced entries to start:
      - **Korean equity volatility following SK Hynix's $26.5bn Nasdaq listing** — researched
        fresh (the $26.5bn/second-largest-US-listing claim checked out): the 10 July 2026 ADR
        debut, the 15.37% Seoul-listed share drop and >9% KOSPI cascade four days later, and the
        genuine causes (new-share dilution, a liquidity migration into the new US listing, and a
        real analyst earnings downgrade from Korea Investment & Securities).
      - **What AI is actually doing to hedge fund/bank analyst roles** — led with real Goldman
        Sachs/Morgan Stanley labor-market research (via Axios) rather than vendor blog claims;
        explicitly flagged and excluded one vendor-sourced stat (a "3-5% higher returns" claim
        from an AI-tool vendor's own blog) as commercially motivated rather than presenting it as
        fact.
- [x] Verified live: nav shows "My Analysis" with no remaining trace of "The Vault," `/research`
      correctly 404s, the footer download link serves the real `.docx` with the correct
      content-type, no console errors, `npm run build` clean (30 routes).
- [ ] **Not done yet, deferred at your request:** pointing bloombruh.com (bought via Porkbun) at
      this site. Needs your input when you're ready — see PROGRESS.md for what's needed from you
      specifically (DNS access I don't have).

## Phase 44 — HKEX Screener rebuilt: ported in the standalone "HK Research" project

You asked to replace the HKEX Screener's current thin search-and-redirect behavior with a copy
of a separate, more built-out project you already had ("HK Research," same stack, same author),
which has its own dedicated per-company research page (price chart, official filing links,
scraped press releases, filtered third-party news, AI recaps of both).

- [x] Read through all of HK Research's source first (7 lib files, 4 API routes, 2 components,
      1 data file, ~1,100 lines) before porting anything, to check for real overlap/collisions
      with this site's existing shared code — found that `src/lib/eodhd.ts` and `src/lib/news.ts`
      names collide with files already used site-wide (Company Profile, Central Bank Room,
      Markets Overview, Pitch Builder, the existing `/hkex` search). Ported everything under a
      dedicated `src/lib/hkex/` namespace instead of dropping it at the top level, so nothing
      already working elsewhere on the site was put at risk.
- [x] Kept the existing `/hkex` search page and its search component (`HkTickerSearch.tsx`,
      backed by this site's own shared HKEX directory/search code) — that part already worked
      and didn't need replacing. Changed only where a result navigates to: `/hkex/[code]` (new)
      instead of the generic `/profile/[symbol]`.
- [x] New `/hkex/[code]` — ported HK Research's company page, restyled to this site's header/
      page-shell conventions (font-mono eyebrow + font-display h1, matching every other module)
      rather than its own separate styling. Real price chart (Yahoo Finance primary, up to 10
      years, with an honest EODHD ~1-year fallback and a visible note when that fallback is in
      use — confirmed this fallback path firing correctly during testing, when rapid test
      requests hit Yahoo's real rate limit), direct links to official filings, the company's own
      press releases scraped from its official page (only for the small curated list where a
      plain HTTP fetch actually returns real HTML, not a JS-rendered shell — unmapped companies
      say so honestly), and reliable third-party news via Google News filtered to a fixed list of
      major outlets — each feed gets a strictly source-grounded Claude summary.
- [x] Added `fast-xml-parser` dependency (for parsing Google News' RSS feed). `@anthropic-ai/sdk`
      was already present. Both API keys this needs (`EODHD_API_KEY`, `ANTHROPIC_API_KEY`) were
      already in this project's `.env.local` — no new secrets required.
- [x] New namespaced files: `src/lib/hkex/{eodhd,yahooFinance,companyName,officialLinks,news,
      pressReleaseScraper,summarize}.ts`, `src/data/hkexPressReleaseSources.ts`,
      `src/components/hkex/{HkexPriceChart,NewsFeedSection}.tsx`, `src/app/api/hkex/{timeseries,
      news,press-releases}/route.ts`, `src/app/hkex/[code]/page.tsx`. Updated `src/app/hkex/
      page.tsx`, `layout.tsx`, `src/components/hkex/HkTickerSearch.tsx`, and the module
      description in `src/lib/modules.ts`.
- [x] Verified live end-to-end, not just build-clean: searched "HSBC," clicked through to
      `/hkex/0005.HK` with a real live quote; on Tencent's page, confirmed real scraped press
      releases (dated, linked, correctly summarized) and real filtered news (Bloomberg/SCMP/
      FT/Reuters, correctly summarized) both loading with no console errors; confirmed the price
      chart's range-switching and its honest partial-data fallback both work. `npm run build` and
      `tsc --noEmit` both clean.

## Phase 45 — Alpha Vantage integration: insider activity, institutional holdings, sentiment news, market movers, US economic indicators

You asked to evaluate Alpha Vantage (a free-tier market-data API) and add whatever tested out as
genuinely usable. Tested 8 endpoint types via real curl calls before writing any code — 7 came
back with real, well-formed data; 1 (Hong Kong Stock Exchange fundamentals) doesn't exist on the
platform at all, confirmed by search returning Frankfurt/US-OTC/London listings for Tencent with
no HKEX listing.

- [x] New `src/lib/alphaVantage.ts` — typed wrappers for insider transactions, institutional
      holdings, sentiment-scored news, the earnings calendar (CSV-parsed), top gainers/losers,
      and two US economic indicators (CPI, unemployment — deliberately not Fed funds rate/
      Treasury yield, which would duplicate the Central Bank Room's existing official-source rate
      data). Every function cached 24h via Next.js's fetch `revalidate` (1h for top movers, since
      that refreshes through the trading day) — the same on-demand-cache pattern already used for
      EODHD/Yahoo Finance/HK data everywhere else on this site, chosen over a scheduled batch job
      since this project has no cron infrastructure and traffic is low enough not to need one.
- [x] **Company Profile** — new "Ownership, activity & sentiment" section (US tickers only,
      skipped entirely for HKEX): recent insider transactions, institutional holders, sentiment-
      scored news alongside (not replacing) the existing plain Google News list, and a next-
      earnings-date stat.
- [x] **Markets Overview** — new "Today's Movers" panel: real top gainers/losers/most active.
- [x] **Central Bank Room** — new "Beyond the policy rate" panel, shown only on the Fed's page
      (this data is explicitly US-only): CPI and unemployment rate.
- [x] **A real bug, found and fixed during verification, not assumed away:** `UsEconomicIndicators`
      originally fetched CPI and unemployment via `Promise.allSettled` — firing both concurrently
      reliably tripped Alpha Vantage's per-request throttling. Fixed two ways: made the two calls
      sequential in that component, and — more robustly — added a module-level request queue to
      `alphaVantage.ts` itself (`throttle()`) that serializes *every* call through the module with
      a guaranteed minimum gap, so no future caller can reintroduce this by accident.
- [x] **A second issue, investigated thoroughly, not fully resolved tonight:** even after
      confirming (via timestamped logging) that calls were genuinely ~1.2-3s apart, some calls
      still came back rate-limited. Ruled out a code bug — direct `curl` calls with identical
      timing succeeded fine outside the app. The likely explanation: Alpha Vantage's free tier
      may bucket usage by IP address, not purely by key — a brand-new, never-before-used key
      started failing almost immediately mid-session, after extensive testing on two other keys
      from the same machine. Documented directly in `alphaVantage.ts` so this isn't mistaken for
      a code bug again later.
- [x] Added `ALPHA_VANTAGE_API_KEY` to `.env.local` (gitignored) and `.env.local.example`
      (placeholder + explanation). **Still needed: add this key to Vercel's environment variables
      before deploying** — see PROGRESS.md.
- [x] Verified live with real data, not just build-clean: real AAPL insider transactions (real
      executive names, dates, share counts) and institutional holders (Vanguard, BlackRock, State
      Street with real % changes) on Company Profile; real sentiment-scored news (same-day
      articles); real top gainers/losers on Markets Overview; real CPI on Central Bank Room.
      Unemployment and next-earnings intermittently didn't load live during testing — confirmed
      this is the honest "ran out of quota today" fallback working as designed (page still loads
      normally, that one section/stat just doesn't appear), not a crash or fabricated data.
      `npm run build` and `tsc --noEmit` both clean.

## Phase 46 — Live vs. Beta split, a sourced leads list, and stock pitches merged into My Analysis

You asked for three things: separate the modules you're confident in from the ones still being
worked on (with the in-progress ones clearly labeled, not hidden), a sourced list of "interesting
news" leads in the same spirit as My Analysis's existing deep-dives but lighter — one real
sentence each, not fully verified, for you to research further yourself — and stock pitches
merged into My Analysis.

- [x] Added a third `ModuleInfo` status, `"beta"`, alongside `"live"` and `"soon"` — beta modules
      are fully real and clickable (not fake, not disabled), just labeled honestly as
      not-yet-finished. Company Profile, Central Bank Room, Pokemon Cards, and My Analysis stay
      `"live"`; Markets Overview, Model Templates, HKEX Screener, Hype vs Fundamentals, Lessons,
      Simulations, and Test Prep moved to `"beta"`.
- [x] Nav (`TerminalNav.tsx`) shows a small "beta" pill next to each beta module's name — still
      fully clickable, just visually distinct from the live ones.
- [x] Homepage split into two sections: "Modules" (live only) and "In development — beta" (beta
      only, with a one-line explanation that these are real/working, just not fully polished
      yet) — extracted the shared card-rendering logic into a new `ModuleGrid` component so both
      sections render identically.
- [x] Researched and wrote a "Worth Digging Into" leads list — 10 real, dated, sourced
      one-sentence items across markets/AI/geopolitics/crypto (SpaceX's first public earnings,
      Anthropic's and OpenAI's own AI models breaching real systems during security testing, the
      Bezos Amazon share sale the same day Amazon hit $3tn, the Strait of Hormuz reopening talks
      and the oil-price reaction, a contentious Bitcoin protocol change, Palantir's earnings pop,
      an unusually high S&P 500 earnings-beat rate worth sanity-checking, a Chipotle selloff on a
      salmonella scare, and a claim about corporate AI-adoption cooling worth checking how broad
      it really is) — explicitly labeled as single-source, not independently cross-checked, in
      contrast to the fully-researched write-ups above them on the same page.
- [x] Restored the "10 Stock Pitches" content (previously in the retired Vault, now also in the
      downloadable Word doc) as a new entry directly in My Analysis, alongside the two existing
      deep-dive write-ups and above the new leads list — same page, three tiers of confidence,
      clearly distinguished.
- [x] Verified live: nav badges correct (4 modules plain, 7 tagged "beta," all still clickable);
      homepage renders exactly the live-then-beta split with the right modules in each; `/analysis`
      shows all 4 sections (2 write-ups, stock pitches, 10 sourced leads) in its jump-to nav and
      body. `npm run build` and `tsc --noEmit` clean.

## Phase 47 — My Analysis rebuilt: index/detail split, a trimmed and re-sourced stock-pitch set, homepage cleanup

You asked for a substantial rework of My Analysis: delete the page's disclosure banner, rename
and rewrite the intro copy around the "scrolling my feed" concept, rewrite the stock pitches to
read as professional/recruiter-facing (no personal notes) with an explicit recent-news trigger
for each, cut the set down to specific names (dropping others), add three new ones, merge in an
AI-industry pitch tied to the Anthropic/OpenAI leads-list stories, and change the page from
"everything expanded inline" to a title-only index with click-through detail pages. Separately:
strip the long description text from the homepage's module cards, and drop beta modules from the
persistent top nav entirely.

- [x] Deleted the "Written by Adam, researched with AI-assisted tools..." disclosure banner from
      `/analysis`'s layout.
- [x] New page title ("The Feed") and intro copy built around the actual mental model you
      described — most of what reaches you is short-form feed content (Instagram), most of it
      scrolled past, this page is what you stopped on.
- [x] Stock pitches rebuilt from scratch as 9 entries, each with a "The trigger" line naming the
      specific dated news story that justified picking it, professional/analyst tone throughout,
      zero personal-connection framing: **Diploma PLC**, **Nintendo**, **British American
      Tobacco**, **ASML**, **TSMC** (new), **Maersk** (kept — see correction below), **Domino's
      Pizza Group** (new — the "same type as Greggs, present in London" pick), **Palantir**, and
      **Microsoft** (new framing — "a way into the AI industry," its trigger drawn directly from
      the Anthropic/OpenAI AI-safety leads-list stories, tying the stock pitches and leads list
      together as asked). Dropped: Microsoft's original framing, BAE Systems, Greggs, Cameco (not
      requested to keep).
- [x] **A real correction made mid-task, not glossed over:** you asked for CMA CGM in place of
      Maersk. Checked its listing status before writing anything — CMA CGM is privately held by
      the Saadé family (~73% ownership) with no public equity ticker on any exchange; a
      conventional "buy the stock" pitch would have been a fabricated premise. Initially rewrote
      it as a credit-story pitch instead (real, rated, publicly traded CMA CGM bonds do exist),
      flagged this finding to you directly, and you confirmed reverting to Maersk — done, with
      Maersk's pitch rewritten to match the new professional format.
- [x] Restructured `/analysis` from one long page with every entry expanded inline into an index
      (dates/titles/taglines only, styled like a headline list) plus new `/analysis/[slug]`
      detail pages for full write-ups and pitches — applies to both the 2 write-ups and all 9
      pitches, so nothing forces a full article open until you choose to click it. The "Worth
      Digging Into" leads list stays inline on the index (each entry is already one sentence —
      nothing to expand).
- [x] Homepage: removed the long per-module description paragraph from `ModuleGrid` — cards now
      show just the name and one-line tagline.
- [x] Nav: beta modules no longer appear in the persistent top bar at all — only the 4 live
      modules do. Beta modules stay fully real and reachable via the homepage's dedicated "in
      development — beta" section.
- [x] Verified live: index page shows the new title/copy and correct title-only rows for both
      write-ups and all 9 pitches; a detail page (Microsoft) renders the full trigger/thesis/risk/
      sources content correctly with no personal-connection language; nav confirmed down to 4
      items; homepage cards confirmed description-free. `npm run build` and `tsc --noEmit` clean
      (44 routes, including 11 new static `/analysis/[slug]` pages).

## Phase 48 — A gated "Research Toolkit" on every stock pitch (sources, tools, downloadable templates, build steps)

You shared two real competition-grade pitch decks (a Varsity Pitch Competition long on Global
Payments, and a short thesis on Altria) as the actual quality bar — DCF-derived, scenario-
weighted target prices, comps tables, Porter's Five Forces, precedent transactions, catalysts/
risk matrices. Rather than have me write pitches at that level, you want to build them yourself,
with each of the 9 current stock pitches carrying its own tailored research toolkit — tools,
named newspapers/trade press, real primary-source links, a link to this site's own downloadable
Excel templates, and a step-by-step build guide — kept behind a shared unlock code so it isn't
sitting fully open to any visitor.

- [x] New `PitchToolkitGate.tsx` — same pattern as this site's only other gated feature
      (`AiGrader.tsx`'s "Pro" unlock): one shared hardcoded code, unlock state in `localStorage`,
      explicitly documented as a friction gate, not real security. Code: `vq55jh68&*`. Unlocking
      once on any pitch unlocks the toolkit on every pitch for that browser.
- [x] Added an optional `toolkit` field to `AnalysisEntry`, used only by the 9 stock pitches (the
      2 macro write-ups don't have one) — kept as a separate field from `body` specifically so the
      polished pitch write-up stays fully public/recruiter-readable while only the research
      methodology behind it sits behind the code.
- [x] Wrote a tailored toolkit for each of the 9 pitches: primary filing source (SEC EDGAR for US
      filers, LSE news explorer + Companies House for UK names, EDINET for Nintendo, Taiwan MOPS
      for TSMC, CVR for Maersk), named real trade press per sector/geography (Lloyd's List and
      TradeWinds for Maersk, DigiTimes and Nikkei Asia for the chip names, The Grocer for
      Domino's, Defense News and USASpending.gov for Palantir's government contracts, etc.), a
      comps peer set with free data-source suggestions (stockanalysis.com, macrotrends.net), and a
      4-step build guide specific to that company's actual situation — plus a pointer to this
      site's own downloadable **DCF/Trading Comps templates** (`/templates`) for the modeling
      step, so nothing requires a new template to be built from scratch.
- [x] One correction caught while writing Domino's toolkit: flagged directly that Domino's Pizza
      Group plc (LSE: DOM, the UK/Ireland master franchisee) is a different, separately listed
      company from Domino's Pizza, Inc. (NYSE: DPZ, the global brand owner) — an easy mix-up that
      would have quietly corrupted anyone's comps/filings research if left unstated.
- [x] Verified live: the gate renders locked with zero toolkit content leaking into the page text
      before unlocking; entering the correct code unlocks and reveals the full toolkit; confirmed
      the unlock is genuinely shared — unlocking on Diploma's page also unlocked Palantir's
      without re-entering the code. `npm run build` and `tsc --noEmit` clean.

## Phase 49 — Moved the pitch gate to the whole pitch, shown immediately on click

Quick follow-up: the code gate only covered the "Research Toolkit" section at the bottom of each
pitch, so clicking a pitch from `/analysis` still showed the full write-up before you ever saw a
code prompt. You asked for the code to appear right when you click into a pitch instead.

- [x] `src/app/analysis/[slug]/page.tsx` now gates the entire pitch (body + toolkit together, one
      prompt, shown immediately after the title) for the 9 stock pitches specifically — the 2
      macro write-ups stay fully public and ungated, unchanged.
- [x] `PitchToolkitGate.tsx` simplified to match: locked-state copy now says "This pitch is
      locked" rather than being toolkit-specific, and the unlocked state renders children directly
      with no extra wrapper box (it's holding a full article now, not a small section).
- [x] Added a "Locked" badge to each stock pitch's row on the `/analysis` index page, so it's
      clear before clicking, not just after.
- [x] Along the way: found and fixed an unrelated stale-build-cache issue (a leftover production
      `.next` directory from the last `npm run build` was conflicting with `next dev`, causing
      every route — including the homepage — to 404). Cleared `.next` and restarted; not a code
      bug, confirmed by the fact `npm run build` itself had already passed clean.
- [x] Verified live: an unauthenticated visit to a pitch shows only the lock prompt (confirmed via
      direct DOM inspection, not just visual — an earlier text-match check produced a false
      positive from unrelated footer copy, caught and re-verified properly); the correct code
      reveals body and toolkit together in one action; the index page shows exactly 9 "Locked"
      badges (the pitches) and 0 on the 2 write-ups. `npm run build` and `tsc --noEmit` clean.

## Backlog — ideas raised but not started

Not built, not scoped, not scheduled — just captured so they don't get
lost. Nothing below should be started without picking it up as a real
phase first.

- **Pokémon card trading market** (raised 2026-07-23) — Adam's idea: a
  stock-exchange-style market for Pokémon trading cards (real cards have
  real secondary-market prices via sites like TCGplayer/PriceCharting).
  Explicitly "just an idea at the moment, don't build it yet." Whenever
  it's picked up, the first step should be the same as every other module
  here: check what free/public real pricing data actually exists for
  card prices before designing anything (same "verify before building"
  discipline as the rest of this project) — don't assume a free API
  exists just because one might.
