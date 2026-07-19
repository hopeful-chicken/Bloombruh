# DECISIONS — Plain-English Log

Every meaningful technical or scope decision gets logged here as it's made. Written for you, not for other developers — no jargon.

---

### 2026-07-20 — Scaffolded with Next.js + TypeScript + Tailwind

**Decision:** Used the standard `create-next-app` tool to generate the project, with TypeScript and Tailwind CSS turned on, using the "App Router" (Next.js's newer, recommended way of organizing pages as folders).

**Why:** This is exactly what `CLAUDE.md` specified, and it's the standard, well-documented way to build this kind of site — lots of tutorials and community support exist if you want to learn more later.

**What it means for the project:** Every page of the site lives as a folder inside `src/app/`. Adding a new module later (like the "Central bank room") means adding a new folder — it won't require rewriting anything that already works.

---

### 2026-07-20 — Kept SWF Explorer NBIM-specific (your call)

**Decision:** You confirmed (when asked directly) that module 1 should stay built around NBIM specifically, even though you clarified NBIM data isn't a strict *requirement* for your internship goal — it's about relevance, not obligation.

**Why:** NBIM is your target employer, and building the best free tool for exploring their own published portfolio is the strongest, most specific signal you can send. It also matches all the planning docs already written.

**What it means for the project:** No scope change — the SWF Explorer proceeds as originally planned in `MODULE_SPECS.md`.

---

### 2026-07-20 — Starting with mock data, not real NBIM downloads

**Decision:** Rather than spending the first chunk of time trying to find and download NBIM's real holdings file, we're building the entire pipeline and UI against a realistic **mock dataset** first (~200 well-known companies with made-up but plausible numbers).

**Why:** You confirmed this trade-off directly. It means the whole site — search, dashboard, charts, drill-downs — can be built and tested tonight without being blocked by any single external data source. `docs/DATA_SOURCES.md` already documented this exact fallback path.

**What it means for the project:** Every number you see in the app right now is **fake**, clearly labeled `MOCK DATA` in the UI. Swapping in the real NBIM file later is designed to be a simple, one-step process (drop a file in `/data-raw`, rerun one script) — documented in `/scripts/README.md` once it exists. **Do not share this publicly or put it on your CV until the real data is swapped in.**

---

### 2026-07-20 — Installed Node.js via `nvm`

**Decision:** This machine had no Node.js (the language runtime Next.js needs) installed at all, so `nvm` (Node Version Manager) was installed first, then Node's current LTS (long-term support) version through it.

**Why:** `nvm` is the standard, safe way to install Node without needing admin/root access, and it lets you easily switch Node versions later if a project ever needs a different one.

**What it means for the project:** Nothing you need to do — it's part of your dev environment now, not part of the deployed site. Vercel (where the site will eventually be hosted) manages its own Node version separately.

---

### 2026-07-20 — Left deployment for you to do manually

**Decision:** Wrote `docs/DEPLOY.md` with step-by-step Vercel deploy instructions, but did not attempt to deploy the site myself.

**Why:** `CLAUDE.md` explicitly says not to — deploying is the one step reserved for you, partly so the Vercel account is yours and under your control from the start.

**What it means for the project:** The site is fully ready to deploy (build passes cleanly), but it isn't live anywhere yet. Follow `docs/DEPLOY.md` whenever you're ready — it takes about 10 minutes and doesn't require touching a terminal beyond a couple of `git push` commands.
