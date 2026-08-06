# Bloombruh

A free, terminal-style research tool — company profiles, central-bank data, and downloadable
valuation models, built as a long-term project to get better at markets and asset management by
actually building something.

## What it does

**Company Profile** — look up any public company and get a real price chart, full financials, and
a plain-English read on whether the multiples look cheap or expensive, then build your own rating,
thesis, and target price on top and export it as a PDF.

**Central Bank Room** — the Fed, ECB, BoE, BoJ and more: real policy rates, a rate-decision history,
plain-English monetary-policy context, sourced news, and my own written take on each.

**Pokemon Cards** — the collectible-card market treated as a real asset class: three decades of
production data, a real price-volatility case study, and an honest SWOT on investing in the category.

**My Analysis** — my own running research notebook: dated write-ups on breaking market stories, ten
full stock pitches (DCF, WACC, and Bear/Base/Bull scenarios I sourced and cross-checked by hand),
and a lighter-weight leads list — written for myself first, kept here because it's worth coming
back to.

Plus, in active development: a full **Markets Overview** by sector, a **Model Templates** library
(DCF/LBO/M&A/comps, prefilled with real data and downloadable as working Excel files), an **HKEX
screener**, a **Hype vs Fundamentals** module comparing narrative to numbers, six written **Lessons**,
two trading/portfolio **Simulations**, and a **Test Prep** hub for interview recruiting.

## Stack

Next.js (App Router) + React + TypeScript, Tailwind CSS, Recharts for charts, `exceljs` for the
downloadable Excel models, `@react-pdf/renderer` for exportable pitch PDFs. Data is fetched from free
public sources and preprocessed into static JSON — no database. Every module cites where its numbers
come from.

## Running it locally

```bash
npm install
npm run dev
```

## About this project

I'm Adam, a UCL Economics student. I built this to get hands-on with the kind of work an equity
research or asset-management analyst actually does — not just read about it. I drove every product
and design decision here: what each module should do, how the DCF models are structured, which data
sources to trust, the visual identity, and every opinion and pitch in the My Analysis section is
mine, sourced and cross-checked by hand.

I used Claude Code as an engineering pair to implement it — the same way a lot of people build
software now. That let me move fast on the technical side while I focused on the parts that actually
require judgment: the financial analysis, what data to trust, and what the site should look and feel
like.

Free, independent, and unaffiliated with any company, exchange, or institution mentioned on this
site. Educational — nothing here is financial advice.

**Links:** [LinkedIn](https://www.linkedin.com/in/adam-zhou-1913ba225/) ·
[GitHub](https://github.com/hopeful-chicken)
