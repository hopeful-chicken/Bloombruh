# PROGRESS — Morning Briefing for Adam

This file is updated as work happens. Read top-to-bottom for the latest status. Older entries stay below for history.

---

## Session 1 — 2026-07-20

### What got built
- Set up the development environment from scratch: installed Node.js (via `nvm`, since this machine had none) and initialized a git repository for the project.
- Scaffolded the Next.js app: TypeScript, Tailwind CSS, App Router, all as decided in `CLAUDE.md`. `npm run build` passes.
- Confirmed scope with you directly (see decisions below): SWF Explorer module 1 stays NBIM-specific, and we're starting with a clearly-labeled mock dataset rather than blocking on real NBIM downloads first.

### What works right now
- The site builds and runs (`npm run dev`), but is still the default Next.js starter page — no custom UI yet. That's next.

### In progress / next up
- Building the mock NBIM holdings dataset (~200 well-known companies, realistic but fake numbers) and the `/scripts` pipeline that will later swap in real data.
- Then: terminal shell (nav, landing page, footer) and the SWF Explorer views (search, dashboard, country drill-down).

### Decisions made this session (see `docs/DECISIONS.md` for full plain-English detail)
1. **Module 1 stays NBIM-specific** — you confirmed you want to keep the SWF Explorer built around NBIM's real holdings/voting data, even though it's not a strict requirement for the internship goal. This matches the original plan in the docs.
2. **Starting on mock data, not real NBIM downloads** — to move fast, the whole pipeline and UI is being built first against a realistic fake dataset (~200 companies, clearly labeled `MOCK DATA` everywhere it appears). Swapping in the real NBIM file later will be a documented, one-step process. This means: **the numbers you'll see in the app for now are not real NBIM figures** — don't share screenshots as if they were, until the swap happens.
3. **Auto-accept enabled for this session** — you asked to let Claude work autonomously overnight without approval prompts. This is now configured (see `.claude/settings.local.json`), scoped to this project only.

### Known issues / things to check
- Git commits in this repo currently use a placeholder identity (`Adam <adam@example.com>`) since no global git identity was configured on this machine. **You should update this** by running `git config --global user.name "Your Name"` and `git config --global user.email "your@email.com"` at some point (doesn't need to happen tonight).

### Nothing broken — safe to continue from here.
