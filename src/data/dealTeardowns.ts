// Deal Teardowns — real announced M&A deals taken apart: price, multiple,
// financing, accretion/dilution, verdict. A separate section from the
// stock pitches (src/data/analysis.ts): pitches are about the stock, these
// are about the deal. Same discipline as the rest of the site — every
// number traces to a cited source, and anything not yet pulled from the
// primary filing is marked [FROM RNS] as a to-verify placeholder rather
// than estimated.

export type DealFact = {
  label: string;
  value: string;
  /** Optional qualifier, e.g. "per the announcement RNS" or a to-verify flag. */
  note?: string;
};

export type DealTeardown = {
  id: string;
  title: string;
  tagline: string;
  date: string;
  acquirer: string;
  target: string;
  /** One-line verdict shown on the index and at the top of the page. */
  stance: string;
  facts: DealFact[];
  /** The analysis itself, markdown — rendered with the shared ArticleBody. */
  body: string;
  /** The first-timer build guide — how to produce this teardown yourself. */
  walkthrough: string;
};

export const DEAL_TEARDOWNS: DealTeardown[] = [
  {
    id: "diploma-peerless",
    title: "Diploma / Peerless Aerospace Fastener",
    tagline:
      "A £236m bolt-on that buys Diploma its aerospace/defense distribution entry — with a stated ~8% year-one EPS accretion you can check",
    date: "2026-08-14",
    acquirer: "Diploma PLC (LSE: DPLM)",
    target: "Peerless Aerospace Fastener (US aerospace fastener distribution)",
    stance: "Strategically additive and tracking well — H1 evidence shows discipline (avg 8x multiple paid) and Peerless 'outperforming'",
    facts: [
      { label: "Consideration", value: "£236m", note: "per the acquisition announcement" },
      { label: "Stated year-one effect", value: "~+8% group EPS accretion", note: "management's own figure — rebuild it yourself before citing" },
      { label: "Peerless-specific financials", value: "[FROM RNS]", note: "the announcement discloses target financials — compute the deal-level EV/EBITDA yourself" },
      { label: "Multiple discipline (group evidence)", value: "avg ~8x EBIT across the 15 LTM deals (~9x on the 7 most recent)", note: "H1 2026 results, 19 May 2026 — vs Diploma's own far higher trading multiple" },
      { label: "Tracking so far", value: "Peerless: \"continued outstanding performance\", double-digit organic growth", note: "H1 2026 Controls sector review" },
      { label: "Financing / balance sheet", value: "Leverage 0.8x at 31 Mar 2026 (net debt £343.9m)", note: "far inside Diploma's <2.0x policy even mid-buying-spree" },
      { label: "Checkable milestone", value: "Full-year results, 17 Nov 2026", note: "the stated ~+8% accretion gets publicly tested there" },
    ],
    body: `## The deal

Diploma — the UK technical-distribution compounder — announced the acquisition of Peerless Aerospace Fastener, a US distributor of aerospace fasteners, for £236m. Management's announcement states the deal should add roughly 8% to group EPS in its first year. It sits alongside two smaller 2026 bolt-ons: PAR Group (£38m, UK seals) and CDM (US defense-market exposure).

## Why Diploma is doing it

Diploma's model is serial acquisition of small, founder-owned distributors at sensible multiples, retaining management and scaling procurement centrally. Peerless extends that model into aerospace and defense-adjacent distribution — a structurally growing end-market (the European/US rearmament cycle) where Diploma previously had no real position. The logic is the same as every Diploma deal: buy a niche distributor with sticky customer relationships, keep the founders, plug it into group procurement.

## The accretion math — and what the H1 filings already answer

Management says ~+8% year-one EPS accretion. That claim decomposes into three checkable inputs. Two of them now have real, company-disclosed evidence from the H1 2026 results (19 May 2026); the third still needs the deal RNS:

1. **What Peerless earns.** The deal-level financials are in the announcement RNS — the one number still to pull yourself. But the H1 results give the group-level discipline evidence: **15 deals in the last twelve months for c.£310m at an average ~8x EBIT multiple** (the 7 most recent at ~9x), expected to add c.£40m of annualised operating profit. Diploma's own multiple is far higher — the arbitrage is intact, though the uptick from 8x to ~9x is worth watching.
2. **How it's financed.** Leverage was just **0.8x at 31 March 2026 (net debt £343.9m)** — deep inside Diploma's <2.0x policy even mid-buying-spree, so financing strain is not the issue here. The cash/debt/equity mix for this specific deal is in the RNS.
3. **What's assumed on top.** H1 tracking: the Controls sector review singles out Peerless for "continued outstanding performance" with double-digit organic growth — early evidence the ~+8% is on track, publicly testable at the 17 November 2026 full-year results.

| Step | Figure | Where from |
| --- | --- | --- |
| Target EBITDA (deal-level) | [FROM RNS] | acquisition announcement |
| Multiple paid, this deal (EV/EBITDA) | = £236m ÷ target EBITDA | computed |
| Group multiple discipline | avg ~8x EBIT (15 LTM deals), ~9x recent 7 | H1 2026 results |
| Diploma's own EV/EBITDA | [INSERT, same-day pull] | stockanalysis.com |
| Post-deal leverage | 0.8x (net debt £343.9m, 31 Mar 2026) | H1 2026 balance sheet |
| Stated EPS accretion | ~+8% year one | announcement — reconcile against your own math |
| Tracking evidence | "continued outstanding performance" | H1 2026 Controls review |

## What would make it a bad deal

The three ways roll-ups go wrong, applied here: overpaying (deal multiple at/above Diploma's own — the group average is ~8x, so check the Peerless number specifically), integration failure (founders leave, customers follow — no evidence of this; H1 commentary is positive), and running out of good targets (the stated pipeline is >4,000 opportunities with >60 active). The bull and bear readings now differ mostly on one remaining number — the deal-level multiple — which is exactly why computing it yourself matters more than reading anyone's summary.

## Verdict

This looks like a textbook Diploma bolt-on, now with receipts: small, niche, founder-led, in a structurally growing end-market, bought inside a disclosed ~8x-average discipline, and already described as outperforming one half in. The stated ~+8% year-one EPS accretion gets publicly tested at the 17 November 2026 full-year results — a dated, falsifiable milestone, which is what a good teardown should always end on. The one piece of arithmetic still worth doing yourself is the deal-level multiple from the RNS, to confirm Peerless sits inside the group's disciplined average rather than above it.

## Sources

- Diploma acquisition announcement RNS (via [LSE news explorer](https://www.londonstockexchange.com/news?tab=news-explorer) — search "Diploma"): price, target financials, financing, stated accretion
- [Diploma H1 2026 results and investor presentation](https://www.diplomaplc.com/investors/financial-presentations/) (19 May 2026): LTM deal multiples (\~8x / \~9x), leverage, Peerless tracking commentary, acquisition pipeline
- [Diploma plc investor relations](https://www.diplomaplc.com/investors): Q3 FY2026 trading update and results calendar (full-year results 17 November 2026)`,
    walkthrough: `## Build your own teardown — the walkthrough

Never torn down a deal before? This is the process, in order. Budget a focused afternoon per deal.

**Step 1 — Get the announcement RNS (30 min).** LSE news explorer → search the acquirer → the acquisition announcement. Write down: price/consideration, target revenue and profit, financing mix (cash / debt / new shares), stated EPS or earnings effect, expected completion date, and any synergy language. This one document contains almost everything.

**Step 2 — Get the acquirer's own numbers (20 min).** Latest annual/interim report: the acquirer's own EBITDA, net debt, shares outstanding, and its trading multiple (stockanalysis.com, same day). You cannot judge the price paid without knowing what the buyer's own earnings are valued at.

**Step 3 — Compute the multiple paid (15 min).** Price ÷ target EBITDA = EV/EBITDA paid. Now three comparisons: (a) vs the acquirer's own multiple — multiple arbitrage is the roll-up engine; (b) vs precedent transactions in the sector (stockanalysis/macrotrends, or the RNS itself sometimes cites them); (c) vs the acquirer's own past deals — a rising trend in multiples paid is the classic roll-up warning sign.

**Step 4 — Rebuild the accretion/dilution (45 min).** Target net income, minus the cost of financing (interest on new debt, or dilution from new shares at the current price), plus any synergies — versus management's stated EPS effect. If your number and theirs diverge a lot, find out which assumption differs. This is the core M&A interview skill, done on a real deal.

**Step 5 — The financing read (15 min).** Pro forma net debt ÷ EBITDA. A roll-up funding deals with debt is fine until leverage crosses ~2-2.5x; check the acquirer's stated policy and whether this deal tests it.

**Step 6 — Verdict + what to monitor (15 min).** One paragraph: good deal / fair / rich, and the two dated, checkable milestones that will prove it (next results, integration commentary). A teardown without a falsifiable prediction is just a summary.

**The questions this prepares you for:** "walk me through a recent deal" · "how do you assess accretion/dilution" · "what multiple did they pay and was it justified" · "how would you finance it differently". Each teardown you do is one interview answer you never have to improvise.`,
  },
];
