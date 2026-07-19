# CLAUDE.md — Instructions for Claude Code

## What this project is

The **Graduate Analyst Terminal** — a free, web-based "Bloomberg-lite" built by Adam, a UCL Economics student entering 2nd year. The site is a shell (navigation, watchlist, clean terminal-style UI) that hosts modular finance tools. The first module is the **SWF Explorer**: an interactive explorer of NBIM's (Norges Bank Investment Management) published portfolio holdings and voting data.

Read these before writing any code, in this order:

1. `docs/PROJECT_BRIEF.md` — vision, audience, why NBIM matters
2. `docs/MODULE_SPECS.md` — what to build, feature by feature
3. `docs/DATA_SOURCES.md` — where the data comes from, and rules for handling it
4. `TASKS.md` — the prioritized backlog. Work through it top to bottom.

## About the owner (important)

Adam has **essentially no coding experience**. This changes how you must work:

- Every time you make a meaningful technical decision (choice of library, file structure, data approach), add a short plain-English explanation to `docs/DECISIONS.md` — 2-4 sentences, no jargon, written for a smart economics student. Format: date, decision, why, and what it means for the project.
- Prefer simple, boring, well-documented technology over clever solutions.
- Write code comments generously, explaining *what* and *why* in plain language.
- Never leave the project in a broken state at the end of a work session. If something half-works, revert or clearly document it in `PROGRESS.md`.

## Tech stack (decided — do not change without documenting why)

- **Next.js (App Router) + React**, JavaScript or TypeScript at your discretion (prefer TypeScript with simple types)
- **Tailwind CSS** for styling
- **Recharts** for charts
- **Static/preprocessed data**: raw data files are downloaded and processed by scripts in `/scripts` into JSON files in `/public/data` or `/src/data`. The site itself reads these JSON files. No database in v1.
- **Deployment target: Vercel free tier.** The build must succeed with `npm run build` at all times. Keep total processed data files well under 100MB; aggregate or slim the data rather than shipping huge files.

## Design language

Terminal aesthetic, but modern and readable: dark background, a single accent color (suggest amber or green), monospace for numbers, clean sans-serif for text. It should look like a serious professional tool, not a toy. Fully responsive but desktop-first.

## Workflow rules

1. Initialize a git repo if none exists. Commit small and often with clear messages.
2. Keep a running `PROGRESS.md` at the project root: after each task from `TASKS.md`, append what you did, what works, what's next, and anything Adam should look at or decide. This is Adam's morning briefing — write it for him, in plain English.
3. Work through `TASKS.md` in order. Mark tasks done with `[x]` as you complete them. Do not skip ahead to later phases if earlier acceptance criteria aren't met.
4. Verify data availability empirically (see `docs/DATA_SOURCES.md`). If a data source is unavailable or different than documented, use the documented fallback, note it in `PROGRESS.md`, and continue — do not stall the whole session on one data source.
5. Test what you build: after each feature, run the dev server / build and confirm it works. Fix errors before moving on.
6. Never commit API keys or secrets. This project should need none in v1.
7. All data used must be free and publicly available, and the site must display source attribution (see `DATA_SOURCES.md`).

## Definition of "done" for the overnight session

A deployable Next.js app where: the terminal shell renders with navigation and landing page; the SWF Explorer module loads real NBIM holdings data and lets a user search a company, see NBIM's stake, and explore the portfolio by country/sector; `npm run build` passes; `PROGRESS.md` tells Adam exactly what happened and what to do next.
