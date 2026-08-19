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
      "A £236m bolt-on from 2024 that already delivered its promised EPS accretion — the live question now is what happens as its growth normalizes",
    date: "2026-08-14",
    acquirer: "Diploma PLC (LSE: DPLM)",
    target: "Peerless Aerospace Fastener (US aerospace fastener distribution)",
    stance: "The original bet already paid off — H1 2026 evidence shows group-level discipline (avg 8x multiple paid) and Peerless still outperforming, nearly two years in",
    facts: [
      { label: "Consideration", value: "£236m", note: "announced 27 March 2024, completed 1 May 2024" },
      { label: "Stated year-one target", value: "~+8% group EPS accretion", note: "management's original figure at announcement — since delivered, see below" },
      { label: "Actual year-one result", value: "Exceeded expectations", note: "per FY2025 results — year-one ROATCE over 20%, well ahead of the ~15% target at announcement" },
      { label: "Multiple discipline (group evidence)", value: "avg ~8x EBIT across the 15 LTM deals (~9x on the 7 most recent)", note: "H1 2026 results, 19 May 2026 — vs Diploma's own far higher trading multiple" },
      { label: "Current chapter, H1 2026", value: "Peerless: \"continued outstanding performance\", but management guides growth to moderate \"towards more typical growth rates\" in H2", note: "H1 2026 Controls sector review — this is the live, unresolved part of the story" },
      { label: "Financing / balance sheet", value: "Leverage 0.8x at 31 Mar 2026 (net debt £343.9m)", note: "far inside Diploma's <2.0x policy even mid-buying-spree" },
      { label: "Checkable milestone", value: "Next trading update / FY results, 17 Nov 2026", note: "not the original accretion test (already settled) — this is where the H2 moderation guidance gets tested instead" },
    ],
    body: `## The deal

Diploma — the UK technical-distribution compounder — announced the acquisition of Peerless Aerospace Fastener, a US distributor of aerospace fasteners, for £236m on 27 March 2024, completing that May. Management's announcement stated the deal should add roughly 8% to group EPS in its first year, with a targeted year-one return on capital around 15%. This is not a fresh deal: it is now nearly two and a half years old, which means the original bet is no longer a prediction, it is a checkable fact, and Diploma has kept making bolt-ons since (most recently PAR Group and CDM in 2026).

## Why Diploma did it

Diploma's model is serial acquisition of small, founder-owned distributors at sensible multiples, retaining management and scaling procurement centrally. Peerless extended that model into aerospace and defense-adjacent distribution — a structurally growing end-market (the European/US rearmament cycle) where Diploma previously had no real position. The logic is the same as every Diploma deal: buy a niche distributor with sticky customer relationships, keep the founders, plug it into group procurement.

## The accretion math — already settled, plus the current chapter

Management said ~+8% year-one EPS accretion at announcement. That is no longer a claim to test forward, it is a result: FY2025 results confirmed Peerless exceeded expectations, with year-one ROATCE over 20%, well ahead of the ~15% target. The real, still-open question by H1 2026 is different: what happens once the initial growth surge normalizes.

1. **What Peerless delivered.** The deal-level financials sit in the original 2024 RNS — pull them yourself if you want the exact multiple paid. What the H1 2026 results add is group-level discipline evidence around it: **15 deals in the last twelve months for c.£310m at an average ~8x EBIT multiple** (the 7 most recent at ~9x), expected to add c.£40m of annualised operating profit. Diploma's own multiple is far higher — the arbitrage is intact, though the uptick from 8x to ~9x is worth watching.
2. **How it was financed, and the balance sheet since.** Leverage stood at **0.8x at 31 March 2026 (net debt £343.9m)** — deep inside Diploma's <2.0x policy even mid-buying-spree, so financing strain was never really the risk here. The original cash/debt/equity mix for this specific deal is in the 2024 RNS.
3. **What's live now.** H1 2026 tracking: the Controls sector review singles out Peerless for "continued outstanding performance" with double-digit organic growth, nearly two years in, but management itself flags that growth will moderate "towards more typical growth rates" in H2. That guidance, not the original accretion target, is the actual open test.

| Step | Figure | Where from |
| --- | --- | --- |
| Target EBITDA (deal-level) | [FROM RNS] | 2024 acquisition announcement |
| Multiple paid, this deal (EV/EBITDA) | = £236m ÷ target EBITDA | computed |
| Group multiple discipline | avg ~8x EBIT (15 LTM deals), ~9x recent 7 | H1 2026 results |
| Diploma's own EV/EBITDA | [INSERT, same-day pull] | stockanalysis.com |
| Post-deal leverage | 0.8x (net debt £343.9m, 31 Mar 2026) | H1 2026 balance sheet |
| Stated EPS accretion, year one | ~+8% target, exceeded in practice | FY2025 results |
| Current tracking | "continued outstanding performance," growth guided to moderate | H1 2026 Controls review |

## What would make it a bad deal, from here

The original overpaying/integration risk already resolved favorably, so the live risks are different now: growth moderating faster or further than guided (management's own signal, worth taking seriously rather than dismissing), the group's rising average multiple paid on newer deals (8x LTM average creeping toward 9x on the most recent seven) suggesting less room for another Peerless-sized win, and running out of good targets generally (the stated pipeline is >4,000 opportunities with >60 active, worth checking hasn't thinned).

## Verdict

The original bet worked: bought at a disciplined multiple, delivered above its own target, still performing "outstanding" nearly two years on. That part of the story is no longer debatable, it is a matter of record. What is still genuinely open is the current chapter, whether the guided H2 moderation is ordinary lapping of an exceptional prior period or the first sign the growth was always going to be temporary. The next trading update or full-year results (17 November 2026) is where that gets tested, not the original accretion claim, which already has its answer.

## Sources

- Diploma acquisition announcement RNS, 27 March 2024 (via [LSE news explorer](https://www.londonstockexchange.com/news?tab=news-explorer) — search "Diploma"): price, target financials, financing, stated accretion
- [Diploma H1 2026 results and investor presentation](https://www.diplomaplc.com/investors/financial-presentations/) (19 May 2026): LTM deal multiples (\~8x / \~9x), leverage, Peerless tracking commentary, acquisition pipeline, guided H2 moderation
- [Diploma plc investor relations](https://www.diplomaplc.com/investors): FY2025 results (year-one Peerless outcome) and results calendar (next full-year results 17 November 2026)`,
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
