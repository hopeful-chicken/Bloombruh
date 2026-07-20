# Data Sources

## Golden rules

1. **Free and public only.** No paid APIs, no scraping behind logins, no violating terms of service.
2. **Verify empirically before building.** Endpoints/limits below are best-known as of July 2026 — check the provider's docs if something stops working.
3. **Attribute everything.** Every module shows its data source and notes that quotes may be delayed. Footer states this project is independent and unaffiliated with any company, exchange, or data provider mentioned on the site.
4. **API keys stay server-side only.** Never expose a data-provider API key to the browser. In this codebase, only `src/lib/marketData.ts` reads `process.env.TWELVE_DATA_API_KEY` — client components go through the `/api/search` proxy route instead of calling the provider directly.

## Company Profile Generator — Twelve Data

- **Provider:** [twelvedata.com](https://twelvedata.com) — chosen over Finnhub because Finnhub's free tier blocks historical price candles (a 403 on that endpoint).
- **Free tier limits:** 800 requests/day, 8 requests/minute. No credit card required to sign up.
- **Correction (2026-07-20):** Twelve Data's docs make it look like `/profile` and `/statistics` (company description, P/E, market cap, dividend yield, margins, beta, etc.) are included free — they are not. Testing the real key showed both return HTTP 403 on the free Basic plan; they require the paid "Grow" plan ($29/month) or higher. This module was reworked to not depend on them at all — see `docs/DECISIONS.md`.
- **Endpoints used** (see `src/lib/marketData.ts`), all confirmed free on the Basic plan:
  - `/quote` — current price, day's change, day's open/high/low, previous close, volume, average volume, and 52-week high/low. Cached 60 seconds.
  - `/time_series` (interval=1day) — historical daily closes for the price chart, and the input to our own computed analytics (50-day moving average, annualized volatility — see `src/lib/profileAnalysis.ts`). Cached 15 minutes.
  - `/symbol_search` — ticker/name autocomplete, proxied through `/api/search` so the key never reaches the browser. Cached 1 hour.
- **Not used (paid-only on Twelve Data's free plan):** `/profile` (company description, sector, CEO, employees), `/statistics` (market cap, P/E, dividend yield, EPS, shares outstanding, beta). If real fundamentals data becomes important later, either upgrade the Twelve Data key or bring in a second, still-free source for that specific data — don't silently show broken/blank fields.
- **Data freshness:** free-tier quotes are effectively real-time to slightly delayed depending on exchange — not tick-by-tick like a real Bloomberg terminal, but current enough to feel live for a student tool. This is stated in the module's UI.
- **Getting a key:** sign up free at [twelvedata.com/pricing](https://twelvedata.com/pricing) (Basic/free plan), then copy `.env.local.example` to `.env.local` and paste the key in as `TWELVE_DATA_API_KEY`. `.env.local` is gitignored — never commit it.
- **Graceful failure:** if the key is missing/invalid, or a ticker doesn't exist, the profile page shows a plain error message instead of crashing (see `src/app/profile/[symbol]/page.tsx`).

## Pitch Builder — adds SEC EDGAR (US company fundamentals)

- **Provider:** [SEC EDGAR's XBRL API](https://www.sec.gov/edgar/sec-api-documentation) (`data.sec.gov`) — the official, free source of US public companies' actual filed financial statements. No key or signup at all; the SEC only requires a descriptive `User-Agent` header identifying the app (see `src/lib/secEdgar.ts`), which is not a secret.
- **Coverage:** US-listed companies that file 10-Ks with the SEC only. Non-US tickers (LSE-listed like Shell, AstraZeneca, HSBC, etc.) aren't covered — the Pitch Builder module shows the fundamentals panel only when data comes back, and otherwise just omits it rather than showing broken fields.
- **Endpoints used** (see `src/lib/secEdgar.ts`):
  - `company_tickers.json` — the full ticker → CIK (SEC's internal company ID) lookup table. Cached 24 hours.
  - `xbrl/companyconcept/{cik}/us-gaap/{concept}.json` — one financial-statement line item at a time (e.g. `NetIncomeLoss`, `Assets`), pulled per company from its most recent 10-K, plus prior years' values from the same response (`fetchAnnualConceptHistory()`) so multi-year revenue/net-income history is available without extra requests. We fetch 16 concepts covering revenue, net income, operating income, gross profit, total assets, stockholders' equity, cash, total debt, D&A, capex, dividends paid, buybacks, interest expense, diluted EPS, and shares outstanding — rather than the much larger "all facts" endpoint. Cached 24 hours (annual filings don't change intra-day).
- **Known quirk:** companies don't all use the same XBRL tag for the same concept — e.g. revenue is tagged `RevenueFromContractWithCustomerExcludingAssessedTax` for some filers and `Revenues` for others. `getFundamentals()` tries a short fallback list per concept; if a company uses a tag we haven't listed, that one field just won't show (rather than the whole fetch failing).
- **Graceful failure:** if a ticker isn't an SEC filer, or none of the tried concepts return data, `getFundamentals()` returns `null` and the Pitch Builder simply doesn't render the fundamentals panel for that company.

## Pitch Builder — computed analytics (no new data source, built on the above)

These aren't a data provider — they're our own calculations layered on top of Twelve Data's price history and SEC EDGAR's fundamentals, in keeping with the "analysis, not just data" principle.

- **Beta** (`src/lib/beta.ts`): a real regression, not a looked-up number (Twelve Data's `/statistics` endpoint that would return beta directly is paid-only, see above). Fetches the target symbol's and SPY's 1-year daily closes, aligns them by shared trading date, computes daily returns, then beta = covariance(stock, SPY) ÷ variance(SPY). Returns `null` (shown as "Unavailable") if fewer than 30 shared trading dates are available, so a thin/unreliable regression is never silently presented as a real number.
- **Credit metrics, ROIC, capital allocation** (`src/lib/fundamentalsAnalysis.ts`): pure calculations off SEC EDGAR fundamentals — EBITDA (operating income + D&A, an estimate since EDGAR doesn't tag EBITDA directly), net debt/EBITDA, interest coverage, ROIC (after-tax operating profit ÷ invested capital, assuming a flat 21% tax rate), and a dividends + buybacks summary. Each is `null`-safe: any missing input means that one metric shows "Unavailable" rather than a wrong number.
- **Peer comps** (`src/lib/comps.ts`, `/api/comps`): there is no free "give me a comps set" endpoint anywhere, so the student types in peer tickers themselves (same as a real analyst choosing a peer set) and the server fetches quote + fundamentals for each, computing P/E, revenue growth, and margins per peer.
- **LBO and M&A calculators** (`src/lib/dealMath.ts`): pure math, not a data source — entry/exit multiples, leverage, and holding period for the LBO; offer price, financing mix, and synergies for the M&A accretion/dilution model. Every assumption is a field the student fills in and can see; the LBO paydown model is a simplified flat percentage rather than a full cash-sweep schedule, and this simplification is documented in the module, not hidden.

## Explicitly out of scope for now

- Sub-second/tick-by-tick market data — no free source provides this legally; Twelve Data's near-real-time delayed quotes are the ceiling for a free tool.
- Any scraping of Bloomberg, Refinitiv, paid terminals, or content behind paywalls/logins. Never do this.
- NBIM/sovereign wealth fund holdings data — this was the original flagship module's data source; it was dropped along with the SWF Explorer module (see `docs/DECISIONS.md`). Revisit only if Adam decides to bring an NBIM-specific module back later.
