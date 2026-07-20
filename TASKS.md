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
