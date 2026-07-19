# Project Brief — Graduate Analyst Terminal

## One-liner

A free, web-based Bloomberg-lite for students: a terminal-style site hosting modular finance tools, starting with the best free explorer of the world's largest sovereign wealth fund's portfolio.

## Why it exists

Adam is a UCL Economics student (entering 2nd year, summer 2026) building a long-term professional project to stand out in finance recruiting. His target employer is **NBIM (Norges Bank Investment Management)** — the Norwegian sovereign wealth fund — with broader interest in IB, S&T, and asset management. The project must (a) demonstrate initiative and technical/analytical ability, (b) be genuinely useful to other students, and (c) signal deep understanding of NBIM specifically.

## Why NBIM shapes the design

NBIM is not a bank. Key facts that should inform everything:

- World's largest sovereign wealth fund (~$1.5–2tn), owning roughly 1.5% of every listed company on earth (~9,000 companies).
- Investment style: essentially enhanced indexing — long horizon (decades), broad diversification, cost discipline, factor awareness. Not deal-driven, not fast-trading.
- Famously the most transparent large investor in the world: publishes its full portfolio holdings, publishes its voting decisions (including voting intentions ahead of AGMs since 2021), publishes responsible investment reports.
- Cultural values: transparency, long-term thinking, distinguishing fundamentals from hype, ownership/stewardship.

The **SWF Explorer** module is built directly on NBIM's own published data. The goal: if Adam ever interviews at NBIM, he walks in having built the best free visualization of their own portfolio.

## Audience

1. **Primary:** university students interested in finance who cannot afford a Bloomberg terminal (huge audience, natural distribution through university finance societies).
2. **Secondary:** recruiters and interviewers looking at Adam's CV — the site is a living portfolio piece.

## Architecture: shell + modules

The Terminal is an umbrella. Modules plug in over time:

| Module | Status | Description |
|---|---|---|
| Terminal shell | **Build now** | Navigation, landing page, module framework, watchlist |
| SWF Explorer | **Build now** | NBIM holdings + voting explorer (flagship, NBIM-specific) |
| Company profile generator | Later | Ticker → clean one-page company profile |
| Central bank room | Later | BoE/Fed/ECB statement tracker, hawkish/dovish scoring |
| Hype vs Fundamentals | Later | Sentiment/mention velocity vs earnings revisions |
| Analyst's own portfolio | Later | Adam's paper portfolio + published letters |

Full specs in `MODULE_SPECS.md`. Only the first two are in scope for now — resist scope creep.

## Success criteria (summer 2026)

1. Live site on a real URL (Vercel free tier) that Adam can put on his CV.
2. SWF Explorer working with real NBIM data, polished enough to share with UCL finance societies.
3. Codebase and docs clean enough that Adam (a non-coder, learning) can understand what exists and why.
