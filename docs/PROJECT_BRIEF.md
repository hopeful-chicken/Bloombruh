# Project Brief — Bloombruh

## One-liner

A free, web-based Bloomberg-lite for students: a terminal-style site hosting modular finance tools, starting with a company profile generator anyone can use to look up any public stock.

## Why it exists

Adam is a UCL Economics student (entering 2nd year, summer 2026) building a long-term professional project to stand out in finance recruiting. His long-term target employer is **NBIM (Norges Bank Investment Management)**, but his interest is finance broadly — investment banking, sales & trading, and asset management — not one employer specifically. The project must (a) demonstrate initiative and technical/analytical ability, (b) be genuinely useful to a broad audience of students, and (c) show original analytical judgment, not just data-fetching.

## Design principle: analysis, not just data (important)

**Do not build modules that are just clean viewers of someone else's already-public data.** Every module should add a layer of original analysis, comparison, or judgment on top of raw numbers — something that demonstrates Adam's own thinking. Concrete patterns that satisfy this: comparisons against a benchmark, written/derived context (e.g. "this P/E is X% above the market average"), flagged signals (concentration, divergence, momentum), or content that's inherently Adam's own (his paper portfolio, his letters) rather than a republished public dataset.

This principle exists because the original flagship module (an NBIM holdings viewer) was rejected for exactly this reason — see `docs/DECISIONS.md` for the full story.

## Audience

1. **Primary:** university students interested in finance who cannot afford a Bloomberg terminal (huge audience, natural distribution through university finance societies).
2. **Secondary:** recruiters and interviewers looking at Adam's CV — the site is a living portfolio piece.

## Architecture: shell + modules

The Terminal is an umbrella. Modules plug in over time:

| Module | Status | Description |
|---|---|---|
| Terminal shell | **Built** | Navigation, landing page, module framework, watchlist |
| Company Profile Generator | **Built — flagship** | Ticker → clean one-page profile: price chart, key multiples, plain-English company description, and analytical context (e.g. valuation vs. a market benchmark) |
| Analyst's Portfolio | Next up | Adam's own paper portfolio + published letters — his personal track record and writing |
| Central Bank Room | Later | BoE/Fed/ECB statement tracker, hawkish/dovish scoring |
| Hype vs Fundamentals | Later | Sentiment/mention velocity vs earnings revisions |

Full specs in `MODULE_SPECS.md`.

## Success criteria (summer 2026)

1. Live site on a real URL (Vercel free tier) that Adam can put on his CV.
2. Company Profile Generator working with real, near-real-time market data, polished enough to share with UCL finance societies.
3. At least one more module (Analyst's Portfolio) live, so the site demonstrates Adam's own judgment, not just data lookups.
4. Codebase and docs clean enough that Adam (a non-coder, learning) can understand what exists and why.
