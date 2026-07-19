# Data Sources

## Golden rules

1. **Free and public only.** No paid APIs, no scraping behind logins, no violating terms of service.
2. **Verify empirically before building.** URLs and formats below are best-known as of July 2026 — check them at session start. If a source has moved, look for it on the official site before falling back.
3. **Attribute everything.** Every view shows its source and as-of date. Footer credits NBIM/Norges Bank as the data source for the SWF Explorer, and states this project is independent and unaffiliated.
4. **Preprocess, don't ship raw.** Raw downloads go in `/data-raw` (gitignored if large); scripts in `/scripts` transform them into slim JSON in the app. Keep only the columns the UI needs.

## NBIM holdings data (primary source for SWF Explorer)

- NBIM publishes its full portfolio holdings on its official site, **nbim.no** — look under "The fund" → "Investments" (or similar). Historically this includes a searchable investments page and downloadable full holdings lists (equities, fixed income, real estate) published annually, typically as Excel/CSV, with fields like: company name, country, sector/industry, market value (NOK and/or USD), ownership %, voting %.
- There is also an "investments" API/JSON behind their own portfolio browser that has historically been publicly reachable — worth checking via the network tab of their investments page, but only use it if clearly public; otherwise use the downloadable files.
- Download the most recent full year available (likely year-end 2025) and, if easy, 2–3 prior years for the year-over-year view. **Equities only for v1.**
- Currency: prefer USD if provided; otherwise keep NOK and label clearly. Do not silently convert.

### Fallbacks if downloads fail from the sandbox

1. Try the Wayback Machine capture of the NBIM holdings download.
2. If all else fails, build the entire pipeline against a realistic mock dataset (~200 well-known companies with plausible values, clearly marked `MOCK DATA` in the UI and in PROGRESS.md), so Adam can swap in the real file by dropping it into `/data-raw` and running one script. Make that swap path dead simple and documented.

## NBIM voting data (stretch)

- NBIM publishes voting records on nbim.no under responsible investment / "Voting" — historically a searchable voting portal with per-company, per-meeting records, including votes against management and (since 2021) voting intentions published ~5 days before AGMs.
- This data is large and messier. For overnight scope: attempt ingestion only for the top ~100 holdings, or ship the placeholder tab. Do not let this block the core module.

## Reference data (nice-to-have)

- Country → region mapping: hardcode a small JSON (standard World Bank-style regions).
- FTSE 100 constituent list for the UK view: a hardcoded list is fine for v1 (label its as-of date).

## Explicitly out of scope for v1

- Live market prices, fundamentals APIs (that's the future company profile module).
- Any scraping of Bloomberg, Refinitiv, paid terminals, or content behind paywalls/logins. Never do this.
