# /scripts — Data Pipeline

Plain-English explanation of how data gets into the app, and how to swap fake data for real NBIM data later.

## Current state: MOCK DATA

The app currently runs on a **fake but realistic** dataset: ~200 real, well-known companies (Apple, Shell, Nestlé, Toyota, etc.) with **made-up** position sizes, ownership percentages, and portfolio weights. This was a deliberate choice to unblock building the whole site (search, dashboard, charts) without waiting on NBIM's real download.

**Every number currently shown on the site is fiction.** The app displays a "MOCK DATA" badge wherever this shows up, and the JSON file itself is labeled `isMockData: true`.

### How the mock data is made

`generate-mock-holdings.mjs`:
1. Starts from a hardcoded list of ~200 real company names, countries, and sectors (from general knowledge — not scraped from anywhere).
2. Invents position sizes using a "power law" curve (a few big positions, lots of small ones — mimicking how NBIM's real portfolio is shaped), scaled to a fake $1.6 trillion total.
3. Invents an ownership % for each company (bigger companies get a lower %, smaller ones higher, capped at 9.5% — a soft cap NBIM's real mandate also roughly respects).
4. Looks up each company's region from `src/data/regions.json`, and flags UK companies that are also in `src/data/ftse100.json`.
5. Writes the result to `public/data/holdings.json` — this is the one file the whole app reads.

To regenerate (e.g. if you tweak the company list or the math):

```
node scripts/generate-mock-holdings.mjs
```

It always produces the same numbers (a fixed random seed is used), so you can tell if a change actually did something.

## Swapping in real NBIM data (one-step path)

When you're ready to use NBIM's actual published holdings:

1. Download NBIM's real holdings file (per `docs/DATA_SOURCES.md`) — likely an Excel/CSV from nbim.no — and drop it into `/data-raw/` (this folder is gitignored, so raw downloads never get committed).
2. Write a new script, e.g. `scripts/process-real-holdings.mjs`, that:
   - Reads the raw file from `/data-raw/`
   - Keeps only equities (per the project's v1 scope)
   - Keeps only the columns the app needs: `name`, `country`, `sector`, `marketValueUSD`, `ownershipPct`, `portfolioPct`
   - Looks up `region` the same way (`src/data/regions.json`) and `isFTSE100` the same way (`src/data/ftse100.json`)
   - Writes to the exact same output shape as `public/data/holdings.json` (see the current file for the shape), but with `isMockData: false` and the real `asOfDate`
3. Run your new script instead of `generate-mock-holdings.mjs`.
4. That's it — because every page reads from `public/data/holdings.json` and checks the `isMockData` flag, the whole site (search, dashboard, charts, MOCK DATA badges) will automatically reflect real data without any UI code changes.

## Reference data (not generated, hand-maintained)

- `src/data/regions.json` — country → region mapping, used to build the region breakdown chart.
- `src/data/ftse100.json` — a snapshot list of FTSE 100 constituent names, used for the UK-focused view. It's a hardcoded, dated snapshot (see `asOfDate` inside the file) — the real index changes quarterly, so refresh this list occasionally if precision matters.
