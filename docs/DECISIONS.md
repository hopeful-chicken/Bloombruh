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

---

### 2026-07-20 — Dropped SWF Explorer, made Company Profile Generator the flagship

**Decision:** Removed the entire SWF Explorer module (NBIM holdings viewer — search, dashboard, country pages, mock data pipeline) and made the **Company Profile Generator** the new flagship module instead. **Analyst's Portfolio** is next in the queue after it.

**Why:** You tried the SWF Explorer and pointed out it didn't show anything about *you* — it was just a clean viewer of NBIM's own already-public data, something anyone can already find on NBIM's site. You clarified your actual goals: your interest is finance broadly (not NBIM specifically, even though it's still your long-term target employer), and you want the project to be a genuinely general, accessible "mini Bloomberg" — not a niche data explorer. This is now the standing design principle for every future module (see `docs/PROJECT_BRIEF.md`): add original analysis on top of data, don't just display it.

**What it means for the project:** All SWF/NBIM code, mock data, and docs sections were removed rather than kept as a secondary module — a clean break, per your explicit choice. The Company Profile Generator adds an "analytical context" block (e.g. how a stock's valuation compares to a rough market-average benchmark) specifically to avoid repeating the "just a data viewer" problem.

---

### 2026-07-20 — Company Profile Generator uses real market data via Twelve Data (API key now required)

**Decision:** Built the Company Profile Generator on live-ish (delayed) market data from the Twelve Data API, rather than static preprocessed JSON as `CLAUDE.md` originally specified for v1. This requires a free API key stored in `.env.local` (gitignored, never committed).

**Why:** You asked whether real-time-following-trends data was possible. True tick-by-tick real-time isn't achievable for free (that's what Bloomberg charges for), but 15-minute-delayed-or-better quotes are — and you confirmed you're OK with signing up for a free API key to get that, which is a deliberate, explicit exception to the original "no API keys in v1" rule.

**What it means for the project:** You'll need to grab a free key from twelvedata.com (no credit card) and drop it into a `.env.local` file — exact steps are in `docs/DATA_SOURCES.md` and `PROGRESS.md`. Without a key, the site still builds and runs, but company profile pages show a clear error message instead of data. Twelve Data was picked over Finnhub specifically because Finnhub's free tier blocks historical price-chart data, while Twelve Data's free tier covers quotes, company profile, statistics, and historical charts all under one key.
