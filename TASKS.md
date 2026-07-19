# TASKS — Overnight Backlog

Work top to bottom. Mark `[x]` when acceptance criteria are met. Log everything in `PROGRESS.md` as you go. If blocked on one task >30 min, apply the documented fallback or note it and move on.

## Phase 0 — Setup

- [ ] Read `CLAUDE.md` and all files in `docs/` fully before writing code.
- [ ] Initialize git repo, create Next.js app (App Router, TypeScript, Tailwind), confirm dev server and `npm run build` both work. First commit.
- [ ] Create `PROGRESS.md` and `docs/DECISIONS.md` with initial entries.

## Phase 1 — Data pipeline (do this before UI polish)

- [ ] Investigate NBIM holdings data availability per `docs/DATA_SOURCES.md`. Document exactly what you found (URLs, formats) in `PROGRESS.md`.
- [ ] Write `/scripts` pipeline: raw download → cleaned, slimmed JSON (equities only; columns: name, country, sector, market value, ownership %, year). Include a README in `/scripts` explaining how to rerun it.
- [ ] Sanity-check the processed data: row count ≈ NBIM's stated company count, top 10 holdings look right (Apple/Microsoft/Nvidia-tier names), totals in a plausible range. Record the checks in `PROGRESS.md`.
- [ ] If real data unreachable: build the mock dataset fallback, clearly labeled, with the documented one-step swap path.

## Phase 2 — Terminal shell

- [ ] Layout shell: dark terminal aesthetic, navigation, footer with attribution + disclaimer, responsive.
- [ ] Landing page: pitch, module cards (SWF Explorer live; four "coming soon" cards per `MODULE_SPECS.md`), about section with placeholders for Adam's links.
- [ ] Commit. Verify build passes.

## Phase 3 — SWF Explorer core

- [ ] `/swf` route with module layout and as-of-date banner.
- [ ] Company search (hero feature): fast fuzzy search over holdings; result card with stake value, % owned, % of portfolio, country, sector.
- [ ] Portfolio overview dashboard: headline numbers, region chart, sector chart, top-20 table.
- [ ] Country drill-down, including the UK view ("NBIM owns X% of the FTSE 100" style callout).
- [ ] Editorial callouts with `{/* EDITORIAL: Adam to review */}` markers.
- [ ] Commit. Verify build passes.

## Phase 4 — Stretch (only if Phases 0–3 fully done)

- [ ] Year-over-year comparison view (if multi-year data was obtained).
- [ ] Voting explorer for top ~100 holdings, or a well-designed placeholder tab.
- [ ] Basic SEO/meta tags and a good social-share preview.
- [ ] Prepare for Vercel: confirm clean production build, write `docs/DEPLOY.md` with plain-English steps for Adam to deploy (creating Vercel account, importing repo). Do not attempt to deploy yourself — Adam does this step.

## Phase 5 — Wrap-up (always do this last, leave time for it)

- [ ] Final `npm run build` must pass. Fix or revert anything broken.
- [ ] Update `PROGRESS.md` with a morning briefing for Adam: what got built, what works, known issues, 3 suggested next steps, and any decisions he needs to make.
- [ ] Final commit.
