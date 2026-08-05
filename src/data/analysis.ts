// Adam's own running research notebook — dated, sourced write-ups on
// breaking macro/market stories, written for himself first. Same
// discipline as the rest of this site: every factual claim traces to a
// real, cited source at the time it was written; nothing here is
// fabricated, and content is a dated snapshot, not a live feed. Where a
// source's framing looks commercially motivated (e.g. a vendor blog
// promoting its own product), that's flagged explicitly rather than
// presented as neutral fact.

export type AnalysisEntry = {
  id: string;
  title: string;
  tagline: string;
  date: string;
  body: string;
};

export const ANALYSIS_ENTRIES: AnalysisEntry[] = [
  {
    id: "sk-hynix-nasdaq-kospi-volatility",
    title: "Korean Equity Volatility Following SK Hynix's $26.5bn Nasdaq Listing",
    tagline: "A record US listing on Wednesday, a 15% Seoul selloff by the following week — and what it says about how tied together these two markets now are",
    date: "2026-08-05",
    body: `# Korean equity volatility following SK Hynix's $26.5bn Nasdaq listing

This is the one that made me want to build this section in the first place — a story that looked like a straightforward "record IPO" headline on day one and turned into a real lesson on cross-market plumbing by day four.

## The listing itself

On 10 July 2026, SK Hynix completed the Nasdaq debut of its American Depositary Receipts, raising **$26.5bn** — the second-largest US listing on record. The ADRs priced at $149 each (177.9m ADRs sold, each representing one-tenth of a common share), and the deal was reportedly oversubscribed roughly 7x before pricing. The stock closed its first day at $168, a **13% gain**. SK Hynix said the proceeds would go toward expanding its South Korean manufacturing capacity and buying equipment, including EUV lithography scanners — the same category of machine at the center of the ASML story covered elsewhere on this site.

## Four days later, the mood in Seoul flipped

On **14 July**, SK Hynix's *Seoul-listed* common shares — a separate line of stock from the new US ADR — fell **15.37% in a single session**, closing at ₩1.85m (about $1,230). Foreign investors sold roughly ₩1.41 trillion of stock that day; institutional investors sold a further ₩1.47 trillion. The drop cascaded into the wider KOSPI index, which fell over 9% and triggered trading halts.

## Why a US listing would hit the Korean market this hard

A few things compounded at once, and untangling them is the actual interesting part of this story:

1. **Genuine dilution.** 177.9m new ADRs is real new supply of SK Hynix stock that didn't exist the week before — all else equal, more shares outstanding means each existing share is worth a smaller slice of the company.
2. **A liquidity migration.** With a newly liquid, dollar-denominated way to hold SK Hynix stock now trading on Nasdaq, some foreign and institutional holders of the Seoul-listed shares appear to have rotated out of the local listing — exactly the kind of flow a brand-new ADR line can trigger in its first days, before the two listings settle into a stable arbitrage relationship.
3. **A real earnings reassessment, not just flow.** Korea Investment & Securities cut its Q2 operating profit estimate for SK Hynix to ₩60.4tn — 8% below the ₩65tn consensus — and trimmed its 2026 and 2027 estimates by 9% and 11% respectively. So part of the move wasn't just mechanical flow, it was analysts genuinely marking down the forward numbers.

## The bigger structural point

SK Hynix and Samsung Electronics together make up more than half of the KOSPI index's weight, which is why a single company's US listing was able to move the *entire* Korean market, not just one stock. Separately, the 60-day rolling correlation between the KOSPI and the Nasdaq 100 has climbed to roughly 0.50 — its highest level since 2021 — reflecting how much more tied together these two markets have become as Korean chipmakers' fortunes increasingly move with the same AI-infrastructure demand story driving US tech.

## What I'm still watching

Whether the Seoul/Nasdaq price gap closes into a stable arbitrage band over the coming weeks, or whether it stays volatile — that's the tell for whether this was a one-off listing-week flow shock or a more durable repricing of how SK Hynix's Korean and US shares relate to each other going forward.

**Sources:** [SK Hynix Nasdaq debut, $26.5bn ADR listing](https://finance.yahoo.com/markets/stocks/articles/sk-hynix-nasdaq-debut-26-113118390.html), [Capital exodus hits KOSPI after SK Hynix's Nasdaq debut — Korea JoongAng Daily](https://www.koreajoongangdaily.com/business/capital-exodus-hits-kospi-after-sk-hynixs-blockbuster-nasdaq-debut/12769678), [SK Hynix shares plunge, deepening Korea selloff — Advisor Perspectives](https://www.advisorperspectives.com/articles/2026/07/13/sk-hynix-shares-plunge-record-deepening-korea-selloff), [Nasdaq/KOSPI correlation and Wall Street-Korea market ties — CNBC](https://www.cnbc.com/2026/07/28/nasdaq-kospi-wall-street-korea-markets-skhynox-samsung.html)
`,
  },
  {
    id: "ai-hedge-fund-analyst-roles",
    title: "What AI Is Actually Doing to Hedge Fund and Bank Analyst Roles",
    tagline: "Not a replacement story — a real labor-market study says the picture is more specific than that, and more interesting",
    date: "2026-08-05",
    body: `# What AI is actually doing to hedge fund and bank analyst roles

The "AI is coming for analyst jobs" headline is everywhere. I wanted to check what the actual labor-market data says, rather than just repeat the headline — and it turns out the real picture is more specific, and more useful, than a flat "replace or not."

## What Goldman Sachs and Morgan Stanley's own research actually found

Both banks published labor-market studies in 2026 that scored occupations by how exposed they are to AI — separating jobs that can be largely *substituted* by AI (their example: proofreader) from jobs that are *complemented* by it (their example: doctor — work that leans on judgment, accountability, and interpersonal interaction AI can't replace).

Goldman's finding: AI exposure has genuinely moved the unemployment rate in both directions at once — a **0.16 percentage point rise** in unemployment in easily-substituted occupations, versus a **0.06 point fall** in unemployment in AI-augmented occupations. Morgan Stanley ran a similar analysis and reached a similar order of magnitude: AI has added **at most 10 basis points** to the overall unemployment rate so far. Small in aggregate — but not nothing, and clearly uneven across job types.

## Where that leaves research and analyst roles specifically

Within banking itself, Goldman, Morgan Stanley, and JPMorgan have all said publicly that AI is augmenting analysts rather than replacing them so far — the way it shows up is banks getting more output per person, not cutting headcount outright. Two concrete, more specific data points sit underneath that:

- Some firms have reportedly trimmed their entry-level analyst class sizes by an estimated **10-20%** — a real, if modest, effect on the number of junior seats available, even without wholesale replacement of existing analysts.
- Routine, well-defined tasks — pitch-book drafting, first-pass document review — are the parts genuinely being automated first. That tracks with the substitutable-vs-augmented framing above: the more standardized a task, the more exposed it is.

## The honest caveat on the more dramatic claims

Some industry commentary (mostly from AI-research-tool vendors themselves) makes bigger claims — one vendor blog I found while researching this cited hedge funds using generative AI achieving "3-5% higher annualized returns" than non-adopters. I'm not including that as a fact here: a company selling AI research tools has an obvious commercial interest in that framing, and I couldn't find it corroborated by an independent source. Worth remembering that "AI and finance" content is itself a hype-prone category — exactly the kind of gap between what's promised and what's shown that this site's own Hype vs Fundamentals module is built to flag.

## My actual read

The realistic shape for someone starting out in this industry isn't "will I be replaced" — it's "the standardized parts of the job are shrinking, and the judgment/interpretation/client-facing parts are where the value (and the entry-level seats) will concentrate." That's a genuinely different thing to prepare for than either the doom headlines or the vendor hype suggest.

**Sources:** [AI's impact on the job market is starting to show up in the data — Axios](https://www.axios.com/2026/04/07/ai-jobs-goldman-sach-morgan-stanley), [Can AI Replace Wall Street Analysts in 2026? — Impact Wealth](https://impactwealth.org/ai-replace-wall-street-analysts/), [AI in Hedge Funds: Use Cases, Risks, and Best Practices — AlphaSense](https://www.alpha-sense.com/blog/trends/generative-ai-in-hedge-funds/)
`,
  },
];
