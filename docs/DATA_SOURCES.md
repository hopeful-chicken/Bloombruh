# Data Sources

## Golden rules

1. **Free and public only.** No paid APIs, no scraping behind logins, no violating terms of service.
2. **Verify empirically before building.** Endpoints/limits below are best-known as of July 2026 — check the provider's docs if something stops working.
3. **Attribute everything.** Every module shows its data source and notes that quotes may be delayed. Footer states this project is independent and unaffiliated with any company, exchange, or data provider mentioned on the site.
4. **API keys stay server-side only.** Never expose a data-provider API key to the browser. In this codebase, only `src/lib/marketData.ts` reads `process.env.TWELVE_DATA_API_KEY` — client components go through the `/api/search` proxy route instead of calling the provider directly.

## Company Profile Generator — Twelve Data

- **Provider:** [twelvedata.com](https://twelvedata.com) — chosen over Finnhub because Finnhub's free tier blocks historical price candles (a 403 on that endpoint), while Twelve Data's free tier includes quote, company profile, key statistics/multiples, symbol search, *and* historical daily time series all under one key.
- **Free tier limits:** 800 requests/day, 8 requests/minute. No credit card required to sign up.
- **Endpoints used** (see `src/lib/marketData.ts`):
  - `/quote` — current price, day's change. Cached 60 seconds.
  - `/profile` — company description, sector, industry, employee count. Cached 24 hours (barely changes).
  - `/statistics` — valuation multiples (P/E, market cap), margins, 52-week range, beta, dividend yield. Cached 24 hours.
  - `/time_series` (interval=1day) — historical daily closes for the price chart. Cached 15 minutes.
  - `/symbol_search` — ticker/name autocomplete, proxied through `/api/search` so the key never reaches the browser. Cached 1 hour.
- **Data freshness:** free-tier quotes are effectively real-time to slightly delayed depending on exchange — not tick-by-tick like a real Bloomberg terminal, but current enough to feel live for a student tool. This is stated in the module's UI.
- **Getting a key:** sign up free at [twelvedata.com/pricing](https://twelvedata.com/pricing) (Basic/free plan), then copy `.env.local.example` to `.env.local` and paste the key in as `TWELVE_DATA_API_KEY`. `.env.local` is gitignored — never commit it.
- **Graceful failure:** if the key is missing/invalid, or a ticker doesn't exist, the profile page shows a plain error message instead of crashing (see `src/app/profile/[symbol]/page.tsx`).

## Analyst's Portfolio (next module)

- **Position data** (what's held, entry price/date, thesis): Adam's own input, stored as a small JSON or markdown file in the repo — not fetched from any external API.
- **Current prices for held positions:** reuse the Twelve Data quote endpoint above (`src/lib/marketData.ts`) — no new data source needed.

## Explicitly out of scope for now

- Sub-second/tick-by-tick market data — no free source provides this legally; Twelve Data's near-real-time delayed quotes are the ceiling for a free tool.
- Any scraping of Bloomberg, Refinitiv, paid terminals, or content behind paywalls/logins. Never do this.
- NBIM/sovereign wealth fund holdings data — this was the original flagship module's data source; it was dropped along with the SWF Explorer module (see `docs/DECISIONS.md`). Revisit only if Adam decides to bring an NBIM-specific module back later.
