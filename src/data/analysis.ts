// Adam's own running research notebook — dated, sourced write-ups on
// breaking macro/market stories, written for himself first. Same
// discipline as the rest of this site: every factual claim traces to a
// real, cited source at the time it was written; nothing here is
// fabricated, and content is a dated snapshot, not a live feed. Where a
// source's framing looks commercially motivated (e.g. a vendor blog
// promoting its own product), that's flagged explicitly rather than
// presented as neutral fact.

export type AnalysisChartPoint = { date: string; close: number };

export type AnalysisChart = {
  title: string;
  note: string;
  /** Indexed to 100 at this date, so two very differently-priced stocks
   * (a $150 ADR vs. a $900 US peer) can be compared on one honest axis —
   * same device as IndexedCaseChart.tsx in the Hype module. */
  indexBase: string;
  /** Real daily closes, sourced live from Twelve Data at the time this
   * entry was written — a dated snapshot, not a live feed (same
   * discipline as everywhere else on this site: see the module header
   * comment). Kept as a static array rather than fetched at request time
   * so this entry keeps working even after the news cycle (and the free
   * API's usable history window) has moved on. */
  series: { symbol: string; label: string; color: string; points: AnalysisChartPoint[] }[];
  /** Callouts pinned to specific dates, rendered as numbered vertical
   * markers — same device the reference pitch decks use. */
  annotations: { date: string; label: string }[];
};

export type AnalysisEntry = {
  id: string;
  title: string;
  tagline: string;
  date: string;
  body: string;
  /** Stock pitches only — the tools/sources/step-by-step build guide
   * behind the pitch, rendered separately behind PitchToolkitGate rather
   * than inline in `body`, so the polished write-up stays public while
   * the research methodology stays code-gated. */
  toolkit?: string;
  /** Optional real embedded price chart — see AnalysisChart. */
  chart?: AnalysisChart;
};

export const ANALYSIS_ENTRIES: AnalysisEntry[] = [
  {
    id: "pokemon-cards-as-an-asset-class",
    title: "Pokemon Cards as an Asset Class: What the Real Numbers Actually Say",
    tagline: "A 3,821% index return, an $18,900 card that later sold for $550,000, and the one number almost every bullish headline on this leaves out",
    date: "2026-08-07",
    body: `# Pokemon cards as an asset class: what the real numbers actually say

I built the full Pokemon Cards module on this site to answer one question: is this a genuine, structurally growing market, or a very good story built around one insanely valuable card. That page is the reference version, deliberately without a personal verdict. This is the shorter version, with one.

## The bull case, in one number

The Wall Street Journal, citing price tracker Card Ladder, reported its Pokemon collectible index up 3,821% cumulatively from 2004 to August 2025, against 483% for the S&P 500 over the same span. That is the number every bullish take on this topic eventually cites, and it is real. It is also doing a lot of work for one number: it is a single index, over a specific 21-year window, built from one tracker's own methodology. Change any of those three things and you get a different story, which is most of what this piece is actually about.

## The production data really does back up "still growing"

This part is not in dispute. Cumulative Pokemon TCG cards printed worldwide crossed 85 billion in May 2026, and roughly 40% of every card ever printed came out in just the last three fiscal years.

| Date | Cumulative cards printed |
| --- | --- |
| March 2020 | 34.1bn |
| March 2023 | 52.9bn |
| March 2024 | 64.8bn (11.9bn sold that fiscal year alone) |
| March 2025 | 75.0bn (10.2bn sold that fiscal year alone) |
| May 2026 | 85.0bn+ |

{{POKEMON_PRODUCTION_CHART}}

Grading volume backs it up from the demand side: PSA is now grading around 90,000 cards a day, up from roughly 15,000/day in 2021, with a reported backlog of 10 million-plus cards. Trading-card submissions (Pokemon, Magic, Yu-Gi-Oh) are up 95% year-over-year and now outpace sports-card submissions more than 2-to-1 at PSA. That is not the shape of a fad cooling off. It is a demand curve still bending upward three decades in.

## The card that is supposed to prove this is stable. It does not, quite.

The single most-tracked individual card in the hobby is the PSA 10, 1st Edition Base Set Charizard, and its real sale history is the honest test of "is this actually a boring, stable store of value."

{{POKEMON_CARD_IMAGE}}

| Date | Price | Note |
| --- | --- | --- |
| July 2017 | $18,900 | Real sale, PWCC/eBay (Beckett News) |
| — | — | No publicly recorded PSA 10 sale of this card anywhere between 2017 and 2021, per data tracker Card Ladder |
| October 2020 | $220,000 | PSA 10 sale |
| November 2020 | $295,000 | One month later |
| March 2022 | $420,000 | Pandemic-era peak |
| November 2022 | $250,000 | Post-peak correction, roughly -40% |
| December 2025 | $550,000 | New all-time public auction record, Heritage Auctions |

{{POKEMON_CHARIZARD_CHART}}

That is not a boring asset. It is a card that went four years with no recorded sale at all, then round-tripped through a 40% drawdown, inside a longer uptrend that did eventually make a new high. Anyone selling this as "stable" is quietly skipping the middle of that table.

## $30 in 1999

The comparison everyone eventually wants: what if you had put a small amount into a Charizard in 1999 instead of the index. $30 in the S&P 500 in January 1999, dividends reinvested, using Yahoo Finance's real adjusted-close data, is worth about $261 today, roughly 9x. The same $30 toward a Charizard that later graded a PSA 10 would be worth $550,000 today, over 18,000x.

That gap is real, and it is also the least representative comparison possible. It is the single most valuable specific outcome in the entire hobby, not a typical one, and the honest caveat matters here: a specific, dated PSA 10 sale record for this card does not exist anywhere from 1999 through mid-2017. $30 is a stated assumption about what a raw copy or a few packs cost at release, not a documented sale. Every point on this comparison from July 2017 onward is a real, publicly reported transaction. The 1999 entry point is not.

{{POKEMON_THIRTYDOLLAR_CHART}}

## Nobody researching this professionally actually agrees

CNBC ran the WSJ number too, after AJ Scaramucci paid $16.49m for the only PSA 10 "Pikachu Illustrator" card and argued on air that collectibles are now a legitimate asset class. That is one buyer's argument after a record purchase, not a bank or an academic publishing research, and it should not be read as the latter.

The pushback is real and comes from people with no stake in the outcome. 24/7 Wall St. ran a piece arguing the "beats the S&P 500" framing is a category error, since a card produces no cash flow or dividend and comparing it to an equity index the way you would compare two stocks is methodologically off. A financial adviser quoted in that piece called it a "math crime." Two Northeastern University finance professors landed on opposite sides on record: one cautiously open (value drawn from scarcity and cultural appeal, similar to art), one openly skeptical, saying there is "no proven multi-decade outperformance track record."

The most rigorous work found on this, from the CAIA Association (a 2021 study by Andrew Keenan, CAIA, CFA, Credit Suisse), found buyers pay an average 1,487% premium for a PSA 10 over a PSA 9 of the identical sports card, and that PSA-10 portfolios returned about 42% annualized over the study window versus 35% for PSA-9. It is sports cards, not Pokemon, but it is the clearest quantitative proof that grading is most of what actually drives this market, which the Charizard case study above shows anecdotally.

For Pokemon specifically, peer-reviewed research basically does not exist yet. The one direct attempt is an undergraduate independent study at the College of Wooster (2024), using PriceCharting data from 2021-2023, and it found a portfolio of Pokemon cards returned -4.72% annualized over that window, underperforming the S&P 500. It is a real, named study, just not a peer-reviewed one, and a completely different three-year window than the WSJ's 21-year figure. Both numbers can be true at once. This is a young, volatile market where the answer depends heavily on which years you happen to measure, which is itself the finding.

## Who actually owns this

Pokemon is owned in roughly equal thirds by Nintendo, Game Freak, and Creatures Inc, run day to day through their joint venture, The Pokemon Company. None of the three is separately investable. Only Nintendo (TYO: 7974 / OTC: NTDOY) is public, and Nintendo does not break out a Pokemon-specific revenue line, so even that exposure is real but blended, not a clean pure-play read.

The Pokemon Company's own most recent fiscal year (to February 2026) was a record: revenue of ¥531.4bn (\~$3.34bn), up 29.3%; operating profit ¥144.0bn (\~$904m), up 43.0%; net profit ¥120.1bn (\~$754m), up 70.7%. Profit growing faster than revenue is exactly what a licensing business with low incremental cost is supposed to show.

The grading infrastructure is private too, and consolidating fast. PSA's parent was taken private in 2021 for roughly $853m by an investor group including Steve Cohen, and by 2022 had raised further capital at a $4.3bn valuation. Its main challenger, CGC, was majority-acquired by Blackstone's Tactical Opportunities arm. There is no clean public equity for the grading side of this trade either.

Retail investors have already tried to securitize this directly, and it is mostly gone badly. Otis fractionalized a Charizard at a $236,800 valuation, was acquired by Public.com in 2022, then liquidated, with investors reportedly taking a loss. Collectable, an SEC Reg A+ platform, discloses roughly 3.1% annualized returns since launch against an estimated 6-8% for the broader blue-chip card category over the same period, meaning the actual investable product underperformed the market it was built to track, after fees. Dibbs pivoted away from fractional ownership entirely in 2024. That is a real, market-tested answer to "can this be cleanly securitized," and so far the answer has mostly been no.

## The comparison that should worry any bull

At the peak of the early-1990s baseball card craze, manufacturers printed an estimated 81 billion cards a year, about 325 for every person in America, chasing demand with no regard for scarcity. When the 1994 MLB strike broke collector confidence, the market never recovered. Revenue fell to roughly a seventh of its peak, and most of that era's cards are worth about a cent each today.

Being honest about the parallel: Pokemon's own print runs are accelerating too, the exact same "print more to chase demand" instinct that broke the sports-card market. What is different so far is that demand has kept pace instead of declining. A real structural stress test, a recession or a sharp drop in new-collector demand, is something this specific boom has not faced yet.

## It is already splitting in two, not hypothetically

Everything above treats "is this a bubble" as a future question. Checking the most recent data changed that for me, because for one part of this market it is not a future question anymore. It is already happening, just not evenly.

Modern cards, released in the last two to three years, have corrected hard since late 2025. An Obsidian Flames Charizard fell from $126 to $79. A Prismatic Evolutions Umbreon SIR fell from $1,600 to $832, a 48% drop, in a matter of weeks. Elite Trainer Boxes are down about 25% (Phantasmal Flames booster boxes went from $305 to $275), and sealed product broadly is down 15-25% since March 2025. Independent trackers put modern singles down somewhere between 20% and 60% from their 2024-2025 peaks. Actual sales volume for booster and sealed product, not just asking prices, fell from an index reading of 410.5 in January 2026 to 270.77 by March, a real drop in how much of this stuff is actually changing hands.

{{POKEMON_MODERN_CARDS_IMAGE}}

Vintage did the opposite over those same months. The Charizard case study above hit its own all-time high in December 2025. The Pikachu Illustrator sale mentioned earlier happened on 16 February 2026, a new world record for any Pokemon card, while modern cards were still falling. That is not a coincidence of timing, and I do not think it is really two separate stories either. It is the same mechanism producing opposite results. A modern chase card's supply can grow to meet demand, because The Pokemon Company can print more of that exact set, and that is exactly what has been happening. A 1st Edition Base Set card printed in 1999 cannot be reprinted. Its supply is fixed in a way no card from a 2024 set's supply is, no matter how hot that set gets.

## My view

I do not think this is a fad, and I do not think it is a clean financial asset either. But by 2026 I also do not think "is Pokemon overvalued" has one answer, because it is not one market, and the data above makes that split too real to keep treating it as one question.

The modern segment was overvalued, and it is already proving that in real time rather than waiting for some future correction. I would expect that gap to widen, not close, through the rest of 2026 and into 2027. The Pokemon Company is still printing at record volume right now (85bn+ lifetime, roughly 40% of that in the last three fiscal years alone), so every new set adds fresh supply competing against everyone who bought a 2024-2025 chase card near the top and wants out. Vintage has the opposite setup, and I think it actually gets more scarce over time in a way most people do not account for: the surviving raw population of a 1999 card only shrinks as more of it gets handled, damaged, or lost before ever reaching a grader, so the PSA 10 population of a fixed vintage print run can really only go down, never up. That is a genuinely different supply curve from a modern card the company can reprint on demand, and it is the actual reason I do not expect vintage to follow modern down.

The production and grading data make a real case that this whole category is structurally different from a normal collectible wave: three decades of accelerating, not fading, demand, backed by genuine third-party authentication infrastructure rather than self-reported numbers. That part of the bull case is real, for vintage specifically. But the actual, computed academic returns on Pokemon cards range from -4.72% annualized (Wooster, 2021-2023) to numbers that beat the S&P 500 many times over (WSJ/Card Ladder, 2004-2025), and now I think I know why that gap is so wide: one of those studies was mostly measuring modern cards during a window that looks a lot like today's correction, and the other was dominated by the small number of ultra-rare, perfectly graded vintage cards that are still setting records. Almost everyone's actual holding is a modern card, not one of those.

If I were actually putting money into this, the CAIA finding is the one I would take most seriously: grading, not the card itself, is most of what drives return. A PSA 10 versus a PSA 9 of the identical card is a roughly 1,487% price gap on sports cards, and the vintage-versus-modern split above is that same idea at the level of an entire market segment, not just one card. The real skill this "investment" requires is not picking the right character or the right set. It is correctly telling, before you buy, whether you are holding something with genuinely fixed supply or something the company can print more of the moment demand asks for it, which is a distinction most people writing enthusiastically about this asset class right now are not making.

## Sources

- [The Hot Investment With a 3,000% Return — WSJ, via Securities Docket](https://www.securitiesdocket.com/2025/09/12/the-hot-investment-with-a-3000-return-pokemon-cards-wsj/)
- [Scaramucci: collectibles are an asset class — CNBC](https://www.cnbc.com/2026/02/25/pokmon-card-winner-scaramucci-says-collectibles-are-asset-class.html)
- [Pokemon cards beat the S&P 500, but the math is a lie — 24/7 Wall St.](https://247wallst.com/investing/2026/07/18/pokemon-cards-beat-the-sp-500-by-2-5x-but-the-math-is-a-lie/)
- [Pokemon cards: should you invest? — Northeastern University](https://news.northeastern.edu/2026/03/20/pokemon-cards-should-you-invest/)
- [The Price of Perfection — CAIA Association](https://caia.org/blog/2021/12/02/collectibles-trading-cards-and-price-perfection/)
- [Trading card portfolio returns, 2021-2023 — College of Wooster independent study](https://openworks.wooster.edu/independentstudy/10979/)
- [November 2025 grading volume recap — GemRate](https://www.gemrate.com/november-2025-recap)
- [Card Ladder methodology](https://www.cardladder.com/about)
- [Collectable returns, via MoneyMade](https://www.moneymade.io/discover/collectable)
- [The Pokemon Company FY26 financial results — Serkan Toto](https://www.serkantoto.com/2026/06/01/pokemon-company-financial-numbers-2/)
- [PSA/Collectors Universe take-private](https://legalclarity.org/who-owns-psa-grading-parent-company-and-investors/)
- [Collectors Holdings $4.3bn valuation — Sportico](https://www.sportico.com/business/finance/2022/collectors-chernin-cohen-1234670529/)
- [Blackstone acquires CGC's parent — press release](https://www.blackstone.com/news/press/blackstone-tactical-opportunities-to-acquire-the-certified-collectibles-group-a-leading-provider-of-tech-enabled-authentication-grading-and-conservation-services-for-the-global-collectibles-industry/)
- [Pokemon Card Market Crash 2026: What Really Happened — PokemonPriceTracker](https://www.pokemonpricetracker.com/blog/posts/pokemon-card-market-crash-2026-what-really-happened)
- [Pokemon Card Market Crash 2026: Signs & How to Prepare — PokemonPriceTracker](https://www.pokemonpricetracker.com/blog/posts/pokemon-card-market-crash-2026-signs-how-to-prepare)
- [Why Are Pokemon Card Prices Dropping? — Misprint](https://www.misprint.com/posts/why-are-pokemon-card-prices-dropping)
- [Pokemon Card Market Trends 2026 — CardScan AI](https://cardscannertcg.com/blog/pokemon-card-market-trends-2026)
- [Logan Paul's Pikachu Illustrator sells for record $16.5M at auction — KSAT](https://www.ksat.com/entertainment/2026/02/16/logan-pauls-pikachu-illustrator-pokemon-card-sells-for-record-165m-at-auction/)
`,
  },
  {
    id: "sk-hynix-nasdaq-kospi-volatility",
    title: "Korea's Leverage Crash: SK Hynix, the KOSPI, and What Actually Broke",
    tagline: "A record Nasdaq listing, a '35% crash' every headline ran with, 1.2 million margin calls, and a president's approval rating cracking 50%. The real chain of events, and the one headline number that does not hold up.",
    date: "2026-08-07",
    body: `# Korea's leverage crash: SK Hynix, the KOSPI, and what actually broke

I wrote the first version of this piece after four days of a story that looked done. It was not close to done. What started as a record Nasdaq listing turned, over the following four weeks, into South Korea's single worst month for equities on record (worse, by some measures, than any single month of the 1997 Asian Financial Crisis or 2008), with 1.2 million retail accounts hit by margin calls, a president's disapproval rating cracking 50% for the first time, and a market still whipsawing violently as of this week. This is the full version: the real timeline, the mechanics of how a brand-new financial product turned a normal correction into a crisis, and a check on the headline number itself. Every outlet covering this cites some version of a large SK Hynix drawdown (30%, 35%, or worse). None of them are fabricating anything; the underlying reporting on the leverage and the margin calls is solid. But a headline reaches for the biggest number you can still justify, not necessarily the most accurate one. Once I checked SK Hynix's own Nasdaq-listed stock against an honest starting point, rather than the one that produces the biggest number, the real figure turned out to be smaller, and more interesting, than what has been reported. It is also not the only place this story does not quite line up with how it has been told: almost every account of this crash, including my own first draft, starts the clock on 14 July. The index itself says otherwise.

## Timeline

**19 June** — the KOSPI closes at an all-time high of 9,385.59.

**23 June** — four days later, the index falls 10% in a single session. SK Hynix and Samsung both drop more than 12%, and Korea's exchange halts trading for 20 minutes. This is a real, single-day crash, and it barely shows up in any retrospective on this story, including the earlier version of this piece.

**2 July** — Meta announces plans to monetize its excess AI computing capacity, and the market reads that as a sign the AI buildout might need fewer chips than everyone assumed. The KOSPI falls below 8,000, more than 14% under its June peak, over a week before SK Hynix's ADR even starts trading. Whatever people mean by "the crash," the index had already been falling for three weeks by 14 July.

**10 July** — SK Hynix completes its Nasdaq ADR debut, raising $26.5bn, the largest US listing ever by a foreign company (bigger than Alibaba's $25bn in 2014). 177.9m ADRs price at $149; the stock closes its first session at $168.01.

**13-14 July** — Seoul-listed SK Hynix common shares fall 15.37% on the 14th, the KOSPI drops over 9% intraday and trips trading halts. This is the point everyone, including my own earlier write-up, treated as "the crash." It was not. It was the opening act. (More on what actually happened to the ADR that same day below, since it is the most interesting single data point in this story.)

**Through mid-July** — the real mechanism driving this turns out to be a specific, dateable regulatory choice, not an inevitable market outcome. Korea had previously *prohibited* single-stock leveraged ETFs. Funds had to hold at least 10 stocks, with any single name capped at 30%. On **28 April 2026**, regulators amended that rule, raising the single-stock concentration limit to 100%. The first 2x-daily single-stock products tied to Samsung and SK Hynix launched a month later, on 27 May. Korean retail investors bought a net ₩14tn of them versus roughly ₩2tn from foreign investors. Outstanding leveraged bets peaked at ₩29.2tn (\~$19.7bn) in early July. By 13 July, more than 1.2 million retail leveraged accounts had triggered margin calls; 320,000-360,000 were forcibly liquidated, totaling ₩2.3tn in forced selling in about two and a half months.

**27-28 July** — two things land almost simultaneously. First, reports that a Chinese state-backed firm (Shanghai Aishengna) had begun mass-producing homegrown immersion DUV lithography tools (domestically-made chipmaking machines that reduce China's dependence on Dutch supplier ASML). Second, SK Hynix reports Q2 results: revenue of ₩79.32tn, up 257% year-on-year, with a 76% operating margin. It was a genuinely record quarter that still missed consensus (\~₩84tn revenue expected), largely because some HBM4 shipment recognition slipped into Q3. Bank of Korea also raised rates into this same window.

**July, in full** — the KOSPI posts its worst month on record, though "worst" depends on how you measure it, and most coverage does not say which way it is measuring. Using the index's own closing prices: from the 9,385.59 peak on 19 June to the closing low of 5,593.56 on 30 July, that is a 40.4% decline, a number I calculated directly from the daily closes rather than taking anyone's word for it. Some outlets report smaller figures, closer to 22-23%, which lines up with a standard calendar-month comparison (July's own start-of-month level to its end-of-month close) rather than peak-to-trough, and that number looks smaller mainly because the historic 31 July rebound landed inside the same calendar month and pulled the month-end close back up. Both numbers are real; they are just answering different questions. The "worse than 1997 and 2008" claims usually use the bigger, peak-to-trough figure, and compare it to 1997's and 2008's calendar-month declines (27% and 23%), which is a comparison worth knowing the terms of before repeating it. Seven circuit breakers triggered across the month; one two-day stretch alone wiped out ₩864.5tn, enough to force an emergency government meeting on the evening of 29 July.

**29 July** — the trough. SK Hynix's ADR bottoms at $126.79.

**31 July** — the single most violent reversal in this entire story, and one worth knowing on its own. The KOSPI closed up **17.91%**, the largest single-day percentage gain and point gain in the index's 70-year history, beating the prior record of 11.95% set during the 2008 financial crisis. Samsung Electronics surged 28%; SK Hynix's Seoul-listed shares soared 30%. It came three trading days after the index had fallen 17.2% in that same short window. A market that can move nearly 18% in either direction inside a single week is not a market that has repriced calmly to a new equilibrium. It is a market still being pushed around by exactly the same forced-flow mechanics (this time unwinding *short* positions and margin-call-driven selling pressure, in reverse) that caused the crash in the first place.

**Late July into August** — the government responds: the Financial Services Commission suspends new single-stock leveraged ETF listings, bans their marketing, and triples the minimum deposit for new leveraged investors to ₩30m (\~$20,000). It is also weighing a cap limiting any investor's leveraged exposure to 20% of their total portfolio. None of it stops President Lee Jae-myung's disapproval rating from breaking 50% for the first time in his term. Korea's own National Pension Service, drawn into the stabilization effort, has been publicly criticized as "an amplifier, not a stabilizer."

**This week** — the market is still nowhere near settled, and the 6 August selloff has a specific, telling trigger of its own. The KOSPI rose 3.76% to 6,598 on 5 August on hopes of a US-Iran deal, then fell 4.58% to 6,296.38 on 6 August as Samsung closed down 6.3% and SK Hynix fell nearly 9%. The actual proximate cause: US storage chipmakers SanDisk and Western Digital both *beat* Q4 revenue and earnings estimates the same week, but gave forward guidance that fell short of the sky-high bar their own stock prices had set (SanDisk was up 469% year-to-date heading into the print, Western Digital up 202%). Western Digital fell 14-16%, SanDisk 8-11%, and the disappointment dragged SK Hynix and Micron down with it in sympathy. That is the third time in this story the exact same pattern shows up: a company beats real, substantial estimates, and gets sold off anyway because the *guidance* did not clear a bar that had already priced in perfection. SK Hynix's own 28 July print was the first instance; this is the second. This is not a market that has found a floor and stopped moving. It is still trading like a market with real fear in it, and the fear is specifically about valuation and guidance, not about underlying results.

*The full timeline, the real daily price data behind the chart below (with live formulas, not just static numbers), the leverage/margin-call figures, and the bull/bear case side by side are all in [the data workbook (.xlsx)](/downloads/korea-leverage-crash-data.xlsx), if you want to check my math or build on it yourself.*

{{CHART}}

## Two listings

This is worth surfacing on its own, because it is the reason the next section's number is different from the one you have been reading elsewhere. On 14 July, the day every headline cites as "the crash," SK Hynix's Nasdaq ADR did not fall. It closed at $193.92, up from $152.35 the day before, a **27% single-day gain**, on the same day the Seoul-listed common shares fell 15.37%.

Two listings of the same company, same day, moving in opposite directions by double-digit percentages. The mechanical reason is straightforward once you see it. Korea's leveraged ETFs are Korean-won products, listed in Seoul, tied to the Seoul-listed shares. They have no direct connection to a Nasdaq-listed ADR that had been trading for all of four days. The new, dollar-denominated ADR was still absorbing genuine first-week demand (helped by the earlier reported 7x oversubscription) even as Seoul-side holders were already getting hit by the leveraged-ETF unwind. The two listings did not actually converge into a shared, coherent price until the China/earnings shock a full two weeks later dragged both down together.

That split matters for more than trivia. 14 July is the date most coverage, including my own earlier draft, treats as SK Hynix's pre-crash peak. It was not a normal price level for the ADR at all. It was a temporary, IPO-driven spike sitting on top of the stock's actual trend, and measuring "the crash" from that spike inflates the number.

## What the price data actually shows

Every article on this crash cites some version of a large SK Hynix drawdown. That is a reasonable thing to report, since the leverage, the margin calls, and the forced liquidations behind it are all real. But "SK Hynix's ADR crashed 35%" is the kind of number you get when you measure from that inflated 14 July print, the biggest one defensibly available. It is not the most accurate description of what happened to the stock.

Index SK Hynix's ADR and Micron (a comparable, US-listed, unlevered memory-chip peer riding the same AI/HBM demand cycle, with zero exposure to Korea's leveraged-ETF market) to 100 on **10 July**, SKHY's actual first trading day. There is no earlier price history for this specific security, so the window cannot start any earlier than that. Run both through the 29 July trough and **SK Hynix's ADR fell 24.53%. Micron fell 24.54%.** Statistically the same stock.

The "35% vs 25%" gap that has been cited everywhere, including in my own first draft of this piece, only appears if you start counting from 14 July. Strip out that one temporary IPO-week pop and there is no incremental Korea-specific damage left in the ADR's own price at all. It moved with the same global correction that hit an unlevered peer, down to the decimal point.

What *is* real, and actually Korea-specific, is everything that happened on the other listing: the 1.2 million margin calls, the 320,000+ forced liquidations, the political fallout. All of it ran through the Seoul-listed shares and Korea's leveraged-ETF plumbing, which is mechanically separate from the Nasdaq ADR. The leverage crisis is real. It just is not what shows up in the ADR's own price chart once you measure it from an honest starting point.

## The China shock

The Shanghai Aishengna DUV news is real and worth taking seriously as a multi-year signal, but it is currently much smaller than the market's one-day reaction implied. The Chinese firm is expected to deliver roughly five immersion DUV units in 2026, rising to about 20 more in 2027. ASML alone expects to ship around 130 immersion systems in 2026. The domestic Chinese tools reportedly still lag ASML's technology and depend on some non-domestic components. This is a real, credible first step toward Chinese self-sufficiency in a category it has never mass-produced before, and a genuine long-term reason for Korean chipmakers to keep investing in staying ahead. But it changes essentially nothing about 2026 or 2027 memory-chip supply and demand. The market's violent reaction to it looks much more like an already-fragile, over-levered market treating a symbolic headline as a reason to sell than a rational repricing of near-term competitive risk.

## Comparing to historical cases

It is tempting to reach for Korea's last great financial crisis, and some of the July numbers genuinely did exceed single-month declines from that era. But the mechanism is close to the opposite. 1997 was an *external* funding crisis. Foreign banks stopped rolling over loans to Korean banks and companies, who found they could not secure new financing at any price. 2026 is a *domestic* leverage crisis, manufactured almost entirely at home: a financial product regulators approved in late May, bought overwhelmingly by Korean retail investors rather than foreign capital, unwinding through margin calls rather than a sovereign funding freeze. Foreign investors did pull real money out in July (widely reported around $13bn), but as a consequence of the crash, not its original cause. It is a different disease, and I think a much shorter one, because a leverage-driven crash burns out once the forced sellers are gone, and the 1.2 million margin calls and 320,000+ liquidations by mid-July did most of that flushing already. A funding crisis does not resolve nearly that fast.

The 2018 memory-chip downturn is the other obvious comparison, and it is also a poor match for what just happened, but for a reason worth noting, because I think it points at the actual forward risk. 2018 was a *supply-side* glut: hyperscalers had over-ordered during the first big cloud buildout, and DRAM prices then fell roughly 60% over the following four quarters as that excess capacity actually arrived. Nothing about July 2026 resembles that. Real demand data from this same window all point at demand that is still real and still accelerating, not a 2018-style glut arriving into a saturated market. Amazon, Microsoft, Alphabet and Meta are guiding to a combined $725bn of 2026 AI capex, up 77% year-on-year, with Evercore and Bank of America now modeling over $1tn combined for 2027. S&P Global's July PMI showed the fastest tech-equipment output growth since May 2021.

But new fab capacity from Samsung, SK Hynix, Micron and Kioxia is not due to reach volume production until late 2027 or 2028. Every one of them is expanding capacity right now, at the same time, into a demand curve that even the bulls describe as a "supercycle," a word that basically admits growth this fast is not permanent, even while everyone is still riding it. That is not this crash. It is a real, specific, later risk. If 2027-2028 capacity additions land just as hyperscaler capex growth naturally decelerates off this year's exceptional base, you get something that could look a lot more like 2018 than anything that happened in July 2026.

## Where the valuation sits now

Everything above is about what already happened. Here is where the stock actually sits today, because that is the part most retrospectives skip.

SK Hynix's Seoul-listed shares closed at ₩1,718,000 on 6 August. At that price, the stock trades around 5.3-5.9x forward earnings, well below its own 5-year average (6.5x mean, 11.2x median, 2021-2025) and a long way down from the 17.8x multiple it commanded at its own peak in March 2026, right before the crash. The 37-analyst consensus tracked by Investing.com puts a 12-month price target of ₩3,189,340 on the stock, about 86% above where it closed on 6 August.

| Metric | Figure |
| --- | --- |
| Close, 6 Aug 2026 | ₩1,718,000 |
| Forward P/E | \~5.3-5.9x |
| 5-year average P/E (2021-2025) | 6.5x mean / 11.2x median |
| Peak P/E, March 2026 | 17.8x |
| 37-analyst consensus target (12-month) | ₩3,189,340 (+86%) |

An 86% gap between price and consensus target, on a stock this widely covered, is a real number worth sitting with. It is not automatically a "the stock is cheap" signal though, and this is exactly where the cyclicality point from the section above actually matters. Memory chips are the textbook case of a business where a low forward P/E can mean the opposite of cheap: the market already expects this year's extraordinary earnings not to repeat, so a multiple that looks low against *this* year's earnings can look completely normal, or even expensive, against a normalized, mid-cycle number. A 5x multiple on a peak-cycle year and a 5x multiple on a sustainable year are not the same stock, even when the P/E prints the same.

I am not building a full discounted cash flow model on top of this, on purpose. A DCF for a business this cyclical needs multi-year revenue and margin assumptions that would mostly be guesses dressed up as precision, especially heading into the 2027-2028 capacity question raised above. What the real numbers here do support is narrower and more useful: the multiple has compressed hard, the consensus gap is real and large, and whether that gap is the market being wrong or the market correctly discounting for reversion depends entirely on which side of the 2027-2028 capacity question you land on.

## The bull case

SK Hynix just posted 257% revenue growth and a 76% operating margin, and "missed" only because consensus had run even further ahead of an already-extraordinary number. That is a sign of a market pricing in near-perfection, not a business in trouble. J.P. Morgan's own read, published the same week as the fresh 6 August selloff, was that the sell-off "had not derailed" the AI investment cycle, and "we do not see any fundamental indicators that signal meaningful weakness in the next 6-12 months." Real hyperscaler capex guidance backs that up directly. On this view, July was a leverage-and-positioning accident laid on top of a genuinely intact fundamental story, and the current multiple compression is a buying opportunity for anyone willing to sit through the volatility.

## The bear case

Michael Burry's own framing, from a 4 August note, a day before the market's next leg down: "I continue to believe it is possible we are near a major top, and possibly a 1987-type fall." The bear case is not really about SK Hynix's own numbers. It is about crowding and leverage across the entire AI trade, of which Korea's retail leveraged-ETF mania was one particularly visible, particularly Korean symptom, not a uniquely Korean disease. If the same positioning fragility exists in less visible forms elsewhere in the AI trade (margin debt, options-driven flows, concentrated index weights), then a Korea-style unwind could recur anywhere sentiment cracks next, and the 2027-2028 capacity-glut risk above sits waiting underneath all of it regardless of how the next twelve months of sentiment go.

## My view

I do not think demand actually broke here, and I do not really think this was a "SK Hynix crashed" story either. It was two stories wearing one company's name. The ADR's own price move was, once you check it against an honest starting point, statistically identical to Micron's, a stock with zero Korean leverage anywhere near it. Whatever Korea's leverage crisis actually broke, it did not show up in that number. What it did break is real. Korea built a genuinely fragile piece of market plumbing (a brand-new, unseasoned 2x retail product) directly underneath the most crowded trade in the world, on the Seoul-listed side specifically, and that combination was always going to break violently the first time sentiment wobbled even slightly, which a slightly-worse-than-priced-for-perfection quarter and a symbolic Chinese headline were more than enough to trigger. That leverage-driven part (the margin calls, the forced liquidations) has mostly already worked through the system by mid-July, which is why I would expect the extreme, product-specific volatility to fade faster than a real funding crisis (1997) or a real supply glut (2018) would.

What I do not think fades: the multiple. Even once the forced selling is fully done, I would expect SK Hynix and Samsung to trade at a structurally lower multiple on their HBM earnings than they did in June, simply because the market has now watched exactly how fragile Korean retail positioning can be, and will keep some of that risk priced in going forward. The risk I would actually be watching two years out is not anything from this July. It is whether 2027-2028 capacity arrives right as hyperscaler capex growth normalizes off this year's number, because that is the setup that has ended every memory cycle before this one.

## Sources

- [SK Hynix Nasdaq debut, $26.5bn ADR listing — Bloomberg](https://www.bloomberg.com/news/articles/2026-07-09/sk-hynix-is-said-to-price-us-share-offering-at-149-apiece-mrdz562z)
- [SK Hynix Nasdaq debut sets record — Yahoo Finance](https://finance.yahoo.com/markets/stocks/articles/sk-hynix-nasdaq-debut-26-113118390.html)
- [Capital exodus hits KOSPI after SK Hynix's Nasdaq debut — Korea JoongAng Daily](https://www.koreajoongangdaily.com/business/capital-exodus-hits-kospi-after-sk-hynixs-blockbuster-nasdaq-debut/12769678)
- [Give me my money back: Korean traders' leveraged bets unravel — CNBC](https://www.cnbc.com/2026/07/20/give-me-my-money-back-south-korean-traders-leveraged-bets-unravel.html)
- [Minister apologizes as leveraged ETF investors nurse losses — CNBC](https://www.cnbc.com/2026/07/29/korea-leveraged-etf-kodex-sk-hynix.html)
- [1.2 million accounts hit margin calls — BigGo Finance](https://finance.biggo.com/news/1046f613-8e0d-4326-bd38-2d90a094e2cb)
- [South Korea's KOSPI plummets 23% in July, record circuit breakers — KuCoin](https://www.kucoin.com/news/flash/south-korea-s-kospi-index-plummets-23-in-july-2026-triggering-record-circuit-breakers)
- [KOSPI crash officially worse than 1997 and 2008 — Yahoo Finance](https://finance.yahoo.com/markets/stocks/articles/south-korea-stock-market-crash-092957385.html)
- [China begins mass-producing homegrown DUV lithography tools — Tom's Hardware](https://www.tomshardware.com/tech-industry/semiconductors/china-begins-mass-production-of-domestic-immersion-duv-lithography-machines)
- [China's chip breakthrough comes with big caveats — CNBC](https://www.cnbc.com/2026/07/28/china-chipmaking-duv-tool-asml-explained.html)
- [SK hynix 2Q26 results — SK hynix Newsroom](https://news.skhynix.com/en/q2-2026-business-results/)
- [SK Hynix Q2 revenue jumps 257% YoY — BigGo Finance](https://finance.biggo.com/news/KR_000660.KS_2026-07-28)
- [Chip stocks shed $1tn in selloff — CNBC](https://www.cnbc.com/2026/07/29/chip-selloff-sk-hynix-samsung-softbank.html)
- [Asian tech stocks drop, SK Hynix plunges 10% — CNBC](https://www.cnbc.com/2026/08/06/asia-tech-selloff-wall-street-samsung-sk-hynix.html)
- [Korea holds emergency meeting as ₩864tn leaves market — Yahoo Finance](https://finance.yahoo.com/markets/world-indices/articles/south-korea-holds-emergency-meeting-103240901.html)
- [Kospi rout puts Lee government on alert — Bloombit](https://en.bloomingbit.io/feed/news/117526)
- [NPS becomes an amplifier, not a stabilizer — Korea JoongAng Daily](https://www.koreajoongangdaily.com/opinion/nps-becomes-an-amplifier-not-a-stabilizer/12782277)
- [KOSPI falls to 6,200 level as chip giants plunge — Seoul Economic Daily](https://en.sedaily.com/finance/2026/08/06/kospi-falls-to-6200-level-as-chip-giants-plunge-kosdaq)
- [Hyperscalers plan $725bn 2026 AI capex — AI Weekly](https://aiweekly.co/alerts/amazon-microsoft-alphabet-meta-plan-725b-ai-capex-in-2026)
- [Michael Burry bets against rally, warns of 1987-type fall — CNBC](https://www.cnbc.com/2026/08/04/michael-burry-bets-against-rally-we-are-near-a-major-top.html)
- [J.P. Morgan: Asia tech sell-off has not derailed AI investment cycle — CNBC](https://www.cnbc.com/2026/08/06/asia-tech-sell-off-has-not-derailed-ai-investment-cycle-jp-morgan-says.html)
- [South Korea's market crash cost retail investors $39bn, incl. the 28 April rule change — ProfG Media](https://www.profgmedia.com/p/south-koreas-market-crash-cost-retail)
- [120,000 Korean retail investors face margin calls — KuCoin](https://www.kucoin.com/news/flash/120-000-korean-retail-investors-face-margin-calls-as-market-meltdown-hits)
- [KOSPI surged 17.9% in a single day, largest one-day gain in history — TradingKey](https://www.tradingkey.com/analysis/stocks/us-stocks/262067341-kospi-surged-17-9-percent-largest-single-day-gain-history-july-31-2026-tradingkey)
- [KOSPI hit all-time high of 9,385.59 on 19 June, down 27% by 13 July — IndMoney](https://www.indmoney.com/blog/us-stocks/kospi-index-crash-analysis)
- [US storage stocks fall as SanDisk, Western Digital guidance disappoints — TradingKey](https://www.tradingkey.com/analysis/stocks/us-stocks/262082159-us-stock-sndk-wdc-skhy-mu-ai-tradingkey)
- [Kospi falls 4.6% as Samsung, SK hynix lead tech selloff on AI spending fears — Korea JoongAng Daily](https://www.koreajoongangdaily.com/business/kospi-slides-over-4-as-tech-shares-take-a-tumble/12812355)
- [Kospi Index Slides 4.6% With Samsung, SK Hynix Falling on Chip Concerns, 23 June — Bloomberg](https://www.bloomberg.com/news/articles/2026-06-23/korean-stocks-fall-more-than-4-from-record-high-on-tech-selloff)
- [Meta's AI pivot triggers global chip sell-off, sending Kospi below 8,000, 2 July — KED Global](https://www.kedglobal.com/korean-stock-market/newsView/ked202607020001)
- [KOSPI daily historical closing prices — Investing.com](https://www.investing.com/indices/kospi-historical-data)
- [SK Hynix consensus estimates, 12-month price target — Investing.com](https://www.investing.com/equities/sk-hynix-inc-consensus-estimates)
- [SK Hynix forward P/E ratio — GuruFocus](https://www.gurufocus.com/term/forward-pe-ratio/HAM:HY9H)
- [SK Hynix 5-year P/E history (mean, median, peak) — Wisesheets](https://www.wisesheets.io/pe-ratio/HY9H.F)
`,
    chart: {
      title: "SKHY (SK Hynix ADR) vs. Micron — indexed to 100 on 10 July 2026 (SKHY's Nasdaq debut)",
      note: "Real daily closes, Nasdaq-listed securities, fetched live via Twelve Data on 2026-08-07. Indexed to day one (10 July, SKHY's first trading day as an ADR, since there is no earlier data to show), so a \~$150 ADR and a \~$900 US stock compare on one honest axis. Micron is the unlevered control: same AI/memory demand cycle, no Korean leverage machinery attached. Watch where the lines separate around 14 July (SKHY's own IPO-week pop, unrelated to Korea) and where they land together at the trough. Both series fell almost exactly the same amount by 29 July.",
      indexBase: "2026-07-10",
      series: [
        {
          symbol: "SKHY",
          label: "SK Hynix ADR (SKHY)",
          color: "#bc5b33",
          points: [
            { date: "2026-07-10", close: 168.01 },
            { date: "2026-07-13", close: 152.35 },
            { date: "2026-07-14", close: 193.92 },
            { date: "2026-07-15", close: 176.46 },
            { date: "2026-07-16", close: 152.31 },
            { date: "2026-07-17", close: 154.03 },
            { date: "2026-07-20", close: 151.16 },
            { date: "2026-07-21", close: 171.94 },
            { date: "2026-07-22", close: 165.27 },
            { date: "2026-07-23", close: 169.50 },
            { date: "2026-07-24", close: 154.57 },
            { date: "2026-07-27", close: 143.02 },
            { date: "2026-07-28", close: 130.17 },
            { date: "2026-07-29", close: 126.79 },
            { date: "2026-07-30", close: 149.00 },
            { date: "2026-07-31", close: 143.73 },
            { date: "2026-08-03", close: 142.72 },
            { date: "2026-08-04", close: 154.38 },
            { date: "2026-08-05", close: 151.03 },
            { date: "2026-08-06", close: 145.87 },
          ],
        },
        {
          symbol: "MU",
          label: "Micron (MU) — unlevered US peer",
          color: "#2f6f9f",
          points: [
            { date: "2026-07-10", close: 979.30 },
            { date: "2026-07-13", close: 937.00 },
            { date: "2026-07-14", close: 983.12 },
            { date: "2026-07-15", close: 904.28 },
            { date: "2026-07-16", close: 853.20 },
            { date: "2026-07-17", close: 848.95 },
            { date: "2026-07-20", close: 865.46 },
            { date: "2026-07-21", close: 970.82 },
            { date: "2026-07-22", close: 959.48 },
            { date: "2026-07-23", close: 990.21 },
            { date: "2026-07-24", close: 920.95 },
            { date: "2026-07-27", close: 900.20 },
            { date: "2026-07-28", close: 820.53 },
            { date: "2026-07-29", close: 739.00 },
            { date: "2026-07-30", close: 874.66 },
            { date: "2026-07-31", close: 823.03 },
            { date: "2026-08-03", close: 829.50 },
            { date: "2026-08-04", close: 892.67 },
            { date: "2026-08-05", close: 893.19 },
            { date: "2026-08-06", close: 898.97 },
          ],
        },
      ],
      annotations: [
        { date: "2026-07-10", label: "SK Hynix's $26.5bn Nasdaq ADR debut" },
        { date: "2026-07-14", label: "Seoul shares -15%, ADR +27%, same day (the split). This ADR spike, not Korea's leverage, is why 7/14 overstates the later 'crash'" },
        { date: "2026-07-28", label: "China DUV news + Q2 results (record quarter, missed consensus)" },
        { date: "2026-07-29", label: "Trough: SKHY -24.5% from day 1, MU -24.5%. Statistically identical." },
        { date: "2026-08-06", label: "Fresh selloff tracking a broad Wall Street tech pullback" },
      ],
    },
  },
  {
    id: "ai-hedge-fund-analyst-roles",
    title: "What AI Is Actually Doing to Hedge Fund and Bank Analyst Roles",
    tagline: "Goldman and Morgan Stanley's own 2026 labor-market studies, and what they actually found for analyst roles",
    date: "2026-08-05",
    body: `# What AI is actually doing to hedge fund and bank analyst roles

The "AI is coming for analyst jobs" headline is everywhere. I wanted to check what the actual labor-market data says, rather than just repeat the headline, so this pulls together what Goldman's and Morgan Stanley's own 2026 studies found.

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

For someone starting out in this industry, the useful question is which parts of the job are shrinking and which aren't: the standardized parts (pitch-book drafting, first-pass document review) are the ones going first, and the judgment, interpretation, and client-facing parts are where the value — and the entry-level seats — will concentrate.

**Sources:** [AI's impact on the job market is starting to show up in the data — Axios](https://www.axios.com/2026/04/07/ai-jobs-goldman-sach-morgan-stanley), [Can AI Replace Wall Street Analysts in 2026? — Impact Wealth](https://impactwealth.org/ai-replace-wall-street-analysts/), [AI in Hedge Funds: Use Cases, Risks, and Best Practices — AlphaSense](https://www.alpha-sense.com/blog/trends/generative-ai-in-hedge-funds/)
`,
  },
];

// Stock pitches — a curated subset of what used to be one long "10 Stock
// Pitches" write-up (originally part of the retired Vault), rewritten in
// August 2026: trimmed to the names Adam actually wants to keep, each
// rebuilt around a specific, dated news trigger (like the leads list
// below), and stripped of the earlier "personal connection" framing —
// this version is written to read like it would in front of a recruiter,
// not like a chat reply. Two additions this pass are freshly researched,
// not carried over: TSMC and Domino's Pizza Group. CMA CGM was
// considered as a replacement for Maersk but ruled out before writing
// anything — it's privately held by the Saadé family with no public
// equity ticker — so Maersk (rewritten to match this new format) stays
// as the actual publicly investable shipping name.
export const STOCK_PITCHES: AnalysisEntry[] = [
  {
    id: "diploma-plc",
    title: "Diploma PLC",
    tagline: "LSE: DPLM — a quality compounder, freshly re-rated on a US aerospace bolt-on",
    date: "2026-08-05",
    body: `# Diploma PLC (LSE: DPLM)

**The trigger:** Diploma's £236m acquisition of Peerless Aerospace Fastener, announced in 2026 and expected to add roughly 8% to group EPS in its first year, alongside Q1 FY2026 results showing EPS up 36% year-on-year.

## What it is

A UK-listed distributor of unglamorous, mission-critical technical products — specialty seals, industrial controls, life-sciences consumables — organized across three divisions (Seals, Controls, Life Sciences), grown mostly through serial bolt-on acquisition of small, founder-owned distributors.

## The thesis

Diploma is a textbook "quality compounder": a business that doesn't sound exciting but has compounded shareholder returns for two decades by buying small distributors at reasonable multiples, retaining their existing management, and scaling procurement centrally behind the scenes. As of 22 July 2026 the stock trades around 7,525p, a fresh high inside a 52-week range of 4,558p–7,295p. Q1 FY2026 revenue was up 17% (15% organic, above its own five-year average) and operating margin expanded 300bps to 24.5%; full-year guidance was upgraded to over 30% operating profit growth. The Peerless deal, alongside a £38m bolt-on for UK seals specialist PAR Group and a CDM acquisition aimed at US defense-market exposure, extends the model into aerospace and defense-adjacent distribution — a second, less obvious way to gain exposure to the European/US rearmament cycle beyond prime contractors.

## Key risk

The model depends on continuing to find and integrate acquisitions at sensible prices. It is, structurally, a roll-up, and roll-ups deteriorate when they overpay, integrate poorly, or run out of good targets. The stock's premium valuation relative to the broader market already prices in a lot of continued execution.

**Sources:** [Diploma Q1/H1 2026 results and acquisitions](https://www.tipranks.com/news/company-announcements/diploma-plc-expands-with-strategic-acquisition), [Diploma share price](https://www.investing.com/equities/diploma--plc), [Peerless Aerospace Fastener acquisition](https://www.tipranks.com/news/global-markets/uk-stocks-diploma-dplm-shares-rally-on-peerless-acquisition)
`,
    toolkit: `## Pitch deck template
Download the [Diploma PLC pitch-deck template (.pptx)](/api/pitch-template?id=diploma-plc&code=vq55jh68%26*) — 10 slides built to match the real Varsity/OAF-style decks these templates are modeled on: dense, chart-driven, colour-coded bear/base/bull, not a bullet-point skeleton. The valuation slide and Sources appendix are already filled in with real numbers; everything marked [INSERT] is a prompt telling you exactly what to go research and drop in yourself.

Download the [Diploma PLC DCF workbook (.xlsx)](/api/pitch-template?id=diploma-plc&code=vq55jh68%26*&type=xlsx) — the real 5-year FCF build, WACC, and Bear/Base/Bull sensitivity behind that slide, every formula live and every hardcoded input sourced on its own Sources tab. This is what the deck's valuation numbers were actually pulled from.

## DCF starting inputs
Real, sourced figures to build from — pull the rest (live share price, shares outstanding, net debt, beta) fresh, since this page is a dated snapshot, not a live feed:
- Share price \~7,525p as of 22 July 2026 (52-week range 4,558p–7,295p)
- Q1 FY2026 revenue growth: +17% total, +15% organic
- Operating margin: 24.5%, +300bps year-on-year
- FY2026 guidance: operating profit growth >30%
- Peerless Aerospace Fastener acquisition: £236m, \~+8% EPS accretion in year one
- WACC inputs: use the current 10-year UK gilt yield as your risk-free rate; pull Diploma's beta from stockanalysis.com or a data terminal — don't guess a beta.

## Primary filings
- [London Stock Exchange news explorer](https://www.londonstockexchange.com/news?tab=news-explorer) — search "Diploma" for every RNS (regulatory news) release: trading updates, results, acquisition announcements, directors' dealings.
- [Diploma plc investor relations](https://www.diplomaplc.com/investors) — annual reports, interim results, investor presentations.
- [Companies House](https://find-and-update.company-information.service.gov.uk/) — UK statutory filings for Diploma and any UK acquisition target you want to check.

## News to track
Financial Times (UK mid-cap coverage), Investors' Chronicle, Proactive Investors, and Sharecast — all cover UK-listed industrials like Diploma regularly and are free or have generous free previews.

## Comps and data
Diploma has no direct UK-listed pure-play peer — build your comp set from Bunzl (LSE: BNZL, another UK distribution "compounder") and US names like Fastenal (NASDAQ: FAST) and W.W. Grainger (NYSE: GWW). Pull multiples from **stockanalysis.com** or **macrotrends.net** (both free, no login).

## Build it yourself
1. Pull the latest RNS trading update or interim results for organic growth, division-level margins, and net debt.
2. Read the acquisition announcement RNS for Peerless (and any newer bolt-ons) for the disclosed price, expected EPS accretion, and financing.
3. Build a 3-5 name comp set (Bunzl, Fastenal, Grainger) and pull EV/EBITDA, P/E, and revenue growth for each.
4. Download this site's own **DCF and Trading Comps templates** (\`/templates\`) — pick "Diploma" if it's in the company search, or manually adjust a comparable industrial's template with Diploma's own numbers.
5. Sanity-check your target price against the stock's actual 52-week range before finalizing.`,
  },
  {
    id: "nintendo",
    title: "Nintendo",
    tagline: "TYO: 7974 — record results, a 53% drawdown, and a real hype-vs-fundamentals gap running in reverse",
    date: "2026-08-05",
    body: `# Nintendo (TYO: 7974)

**The trigger:** A June 2026 Nintendo Direct showcase that leaned on a Zelda remake and ports rather than a new flagship title, sending shares down more than 10% in a single session — despite Nintendo simultaneously reporting its strongest fiscal year on record.

## What it is

The Japanese gaming hardware and software company behind Switch/Switch 2, and one of three joint-venture partners (with Game Freak and Creatures Inc.) in The Pokemon Company, which manages the games, anime, and trading card game globally.

## The thesis

This is a genuine case where the fundamentals and the share price are telling opposite stories. Nintendo's FY26 (year to March 2026) net sales nearly doubled, up 98.6% year-on-year to ¥2.313 trillion, driven by Switch 2 (19.86 million units sold in its first 10 months — the fastest-selling console in the company's history) and Pokemon-branded software. The Pokemon Company itself reported $3.33bn revenue and $752m net profit for the year to February 2026, one of the franchise's strongest years on record. Despite that, the stock is down roughly 53% from its 52-week high. Two dated, specific catalysts explain the gap: a memory-chip price surge (linked to the same AI-infrastructure buildout competing for DRAM/NAND supply) pushed up Switch 2's bill of materials and forced a price hike in May 2026, and the June 2026 Direct disappointment described above. Together they've pushed the stock to price in a weaker forward outlook than the current operating numbers support.

## Key risk

Console cycles are lumpy and hit-driven. Nintendo's model depends on hardware attach rates and a strong first-party software pipeline, and the market has just demonstrated how fast sentiment moves when that pipeline looks thin — even against genuinely strong current results.

**Sources:** [Nintendo FY26 financial results](https://nintendoeverything.com/nintendo-financial-results-may-2026-switch-2-at-19-86-million-units-switch-at-155-92-million-more/), [Pokemon's best year ever](https://gamerant.com/pokemon-2026-highest-sales-ever/), [Nintendo share price decline on price hike](https://www.cnbc.com/2026/05/11/nintendo-stock-switch-2-price-rise-weak-sales-forecast.html), [June 2026 Direct disappointment](https://gamerant.com/nintendo-stock-price-down-why-february-2026/)
`,
    toolkit: `## Pitch deck template
Download the [Nintendo pitch-deck template (.pptx)](/api/pitch-template?id=nintendo&code=vq55jh68%26*) — 10 slides built to match the real Varsity/OAF-style decks these templates are modeled on: dense, chart-driven, colour-coded bear/base/bull, not a bullet-point skeleton. The valuation slide and Sources appendix are already filled in with real numbers; everything marked [INSERT] tells you exactly what to research and drop in yourself.

Download the [Nintendo DCF workbook (.xlsx)](/api/pitch-template?id=nintendo&code=vq55jh68%26*&type=xlsx) — the real 5-year FCF build, WACC, and Bear/Base/Bull sensitivity behind that slide, every formula live and every hardcoded input sourced on its own Sources tab. Nintendo's own unusually low beta (cross-checked, not a data error) is exactly why this one's worth opening rather than trusting the deck slide alone.

## DCF starting inputs
Real, sourced figures to build from — pull the rest (live share price, shares outstanding, net debt, beta) fresh:
- FY26 (year to March 2026) net sales: ¥2.313tn, +98.6% year-on-year
- Switch 2 unit sales: 19.86m in its first 10 months
- The Pokemon Company FY (to Feb 2026): $3.33bn revenue, $752m net profit
- Share price down \~53% from its 52-week high, despite the above
- WACC inputs: use the current 10-year Japanese government bond (JGB) yield as your risk-free rate; pull Nintendo's beta from stockanalysis.com or a data terminal.

## Primary filings
- [Nintendo IR (English)](https://www.nintendo.co.jp/ir/en/) — quarterly/annual financial results, investor presentations, and the actual FY26 results deck.
- [EDINET](https://disclosure2.edinet-fsa.go.jp/) — Japan's official disclosure system (like SEC EDGAR), for the underlying statutory Japanese filings if you want to go past the English summary.

## News to track
Nikkei Asia and Bloomberg's Japan/gaming desks cover Nintendo's numbers directly; VGC (VideoGamesChronicle) and Automaton are the best English-language sources for the software-pipeline/Direct-showcase side of the story specifically.

## Comps and data
No exact peer (Nintendo is hardware + first-party software + a licensing stake, which is unusual), but Sony's Games & Network Services segment (within 6758.T) and pure software publishers (Take-Two, EA) are the closest reference points for multiples. Pull from **stockanalysis.com**.

## Build it yourself
1. Read the actual FY26 results presentation (not just the press summary) for the Switch 2 unit-sales trajectory and segment margins.
2. Track the memory-chip cost story separately — DRAM/NAND spot price trends are covered by DRAMeXchange/TrendForce, relevant to Switch 2's bill of materials.
3. Note every dated Nintendo Direct showcase going forward — the market's reaction to announced titles is the single biggest swing factor in this thesis.
4. Use this site's **DCF template** (\`/templates\`) with a Japan/consumer-hardware sector selection, and sensitize the terminal growth assumption to hardware-cycle risk explicitly rather than a flat rate.`,
  },
  {
    id: "british-american-tobacco",
    title: "British American Tobacco",
    tagline: "LSE: BATS — a live ESG-exclusion case study, freshly backed by a £1.3bn buyback",
    date: "2026-08-05",
    body: `# British American Tobacco (LSE: BATS / NYSE: BTI)

**The trigger:** A £1.3bn 2026 share buyback programme, announced alongside results showing BAT's "New Categories" division (vapes, nicotine pouches, heated tobacco) back to double-digit growth and now profitable.

## What it is

One of the world's largest tobacco companies (Dunhill, Lucky Strike, Vuse, Velo), and a genuine, live example of how ESG exclusion criteria bite in practice at a major asset owner.

## The thesis

BAT is a value-versus-structural-decline argument. Alongside the buyback, its progressive dividend continues (next dividend 61.26p per share), and Velo — its nicotine-pouch brand — has reached a #2 volume/value position in its category within a year of a key launch. Management's own algorithm targets +3-5% revenue, +4-6% profit, and +5-8% EPS growth; 2026 guidance sits at the low end of that range while the company reinvests in the shift away from combustible cigarettes. The stock has historically traded at a low-single-digit-to-low-teens P/E and a high dividend yield, largely because a meaningful share of the market — including sovereign and pension investors bound by exclusion policies — treats it as structurally off-limits or declining regardless of valuation. Norway's Government Pension Fund Global (managed by NBIM) has explicitly excluded tobacco manufacturers since around 2010 on ethical grounds set by its Council on Ethics — one of the clearest real examples of a product-based exclusion removing a large-cap, high-yield name from an investable universe entirely independent of price.

## Key risk

Structural decline in combustible cigarette volumes across developed markets is real and permanent. The entire bull case depends on New Categories growing fast enough, and staying profitable enough, to replace that decline before it erodes the dividend.

**Sources:** [BAT FY2026 buyback and dividend guidance](https://www.stocktitan.net/sec-filings/BTI/6-k-british-american-tobacco-p-l-c-current-report-foreign-issuer-65bb444665c2.html), [BAT New Categories/Vuse strategy](https://www.bat.com/media/press-releases/_2026/february/preliminary-results-for-the-year-ended-31-december-2025), [NBIM's ethical exclusions and Council on Ethics](https://www.nbim.no/en/responsible-investment/our-expectations/)
`,
    toolkit: `## Pitch deck template
Download the [British American Tobacco pitch-deck template (.pptx)](/api/pitch-template?id=british-american-tobacco&code=vq55jh68%26*) — 10 slides built to match the real Altria OAF short-thesis deck this template draws on (a genuine short case on a tobacco peer — useful to read against your own long case). Dense, chart-driven, colour-coded bear/base/bull, not a bullet-point skeleton. The valuation slide and Sources appendix are already filled in with real numbers; everything marked [INSERT] tells you exactly what to research.

Download the [British American Tobacco DCF workbook (.xlsx)](/api/pitch-template?id=british-american-tobacco&code=vq55jh68%26*&type=xlsx) — the real 5-year FCF build, WACC, and Bear/Base/Bull sensitivity behind that slide, every formula live and every hardcoded input sourced on its own Sources tab.

## DCF starting inputs
Real, sourced figures to build from — pull the rest (live share price, shares outstanding, net debt, beta) fresh:
- 2026 buyback programme: £1.3bn
- Next dividend: 61.26p per share
- Management's own growth algorithm: +3-5% revenue, +4-6% profit, +5-8% EPS
- 2026 guidance: low end of that range
- WACC / cost-of-equity inputs: use the current 10-year UK gilt yield as your risk-free rate; pull BAT's beta from stockanalysis.com. Given how much of BAT's total return is the dividend itself, also build a simple dividend-discount cross-check (current yield + management's guided dividend growth rate) alongside your DCF, not instead of it.

## Primary filings
- [BAT investor relations](https://www.bat.com/investors) — annual report, interim results, RNS announcements.
- [London Stock Exchange news explorer](https://www.londonstockexchange.com/news?tab=news-explorer) — search "British American Tobacco" for the raw RNS feed.
- [NBIM's own expectation documents](https://www.nbim.no/en/responsible-investment/our-expectations/) and its published exclusion list — the primary source for the ESG-exclusion angle, not a secondhand summary.

## News to track
Reuters and the FT both cover tobacco-sector regulation and earnings directly; for the New Categories/vaping side specifically, trade press like Vapouround and Tobacco Reporter track product launches, illicit-market enforcement, and competitor moves (ZYN/Swedish Match, etc.) in more depth than generalist outlets.

## Comps and data
Peer set: Philip Morris International (PM), Imperial Brands (LSE: IMB), Japan Tobacco (2914.T). Pull margins, growth, and multiples from **stockanalysis.com**; note that BAT's UK primary listing means some US aggregators show only the BTI ADR, which can lag the LSE price.

## Build it yourself
1. Pull the latest annual report for the exact revenue/profit split between combustibles and New Categories (Vuse, Velo, glo) — the trend in that split is the whole thesis.
2. Cross-check NBIM's exclusion list directly to confirm current status before citing it as fact — exclusion lists are reviewed and can change.
3. Build the PM/Imperial/JT comp set and note how BAT's multiple compares given its yield and payout policy specifically, not just growth.
4. Use this site's **DCF template** (\`/templates\`, consumer staples sector) — for a name like this, a dividend-discount-style variant is often more appropriate than a pure DCF, given how much of the total return is the yield itself.`,
  },
  {
    id: "asml",
    title: "ASML",
    tagline: "NASDAQ/AEX: ASML — the EUV monopoly, now visibly reshaped by export controls",
    date: "2026-08-05",
    body: `# ASML (NASDAQ/AEX: ASML)

**The trigger:** ASML's China revenue share falling from 33% in 2025 to roughly 20% in 2026 (quarterly China sales down to 19% of total, from 36% the prior quarter), as the proposed US "MATCH Act" pushes to further restrict advanced chipmaking equipment sales to China.

## What it is

The Dutch company that makes the only machines in the world capable of extreme ultraviolet (EUV) lithography — the process used to etch the most advanced chip designs onto silicon. Effectively every leading-edge chip made today, including AI accelerators, passes through an ASML machine at some point in its supply chain.

## The thesis

ASML's backlog stood at €38.8bn at year-end 2025, including €7.4bn of EUV bookings specifically — more than a full year of current revenue. The company says it has never shipped an EUV machine to China and has not breached export controls despite recent US scrutiny, but the trend in its China revenue mix is unambiguous. Despite that headwind, full-year guidance has stayed strong, because there is currently no substitute supplier for EUV at the leading edge — a genuine monopoly on the single hardest step in modern chip manufacturing. ASML sits at the center of the US-China chip war: every escalation in export controls is a quantifiable hit to its addressable market, while every leading-edge demand driver (principally AI accelerators) is a tailwind through the non-China two-thirds of the business.

## Key risk

Escalating export controls are a structural headwind to what was roughly a third of the historical customer base. The bull case depends on non-China, AI-driven demand growing fast enough to keep absorbing that lost capacity.

**Sources:** [ASML China export restrictions and revenue mix](https://marketwise.com/investing/asml-earnings-china-export-restrictions-ai-chip-demand/), [ASML backlog and EUV monopoly](https://www.heygotrade.com/en/blog/asml-investment-case-euv-monopoly-semi-capex/), [ASML denies EUV shipments to China](https://techcrunch.com/2026/06/19/the-us-says-asmls-top-chip-tool-may-be-in-china-asml-says-it-isnt/)
`,
    toolkit: `## Pitch deck template
Download the [ASML pitch-deck template (.pptx)](/api/pitch-template?id=asml&code=vq55jh68%26*) — 10 slides built to match the real Varsity/OAF-style decks these templates are modeled on: dense, chart-driven, colour-coded bear/base/bull, not a bullet-point skeleton. The valuation slide and Sources appendix are already filled in with real numbers; everything marked [INSERT] tells you exactly what to research.

Download the [ASML DCF workbook (.xlsx)](/api/pitch-template?id=asml&code=vq55jh68%26*&type=xlsx) — the real 5-year FCF build, WACC, and Bear/Base/Bull sensitivity behind that slide, modeled in EUR (ASML's own reporting currency) with the USD Nasdaq quote converted for comparison — every formula live and every hardcoded input sourced on its own Sources tab.

## DCF starting inputs
Real, sourced figures to build from — pull the rest (live share price, shares outstanding, net debt, beta) fresh:
- Backlog at year-end 2025: €38.8bn, including €7.4bn of EUV bookings specifically
- China revenue share: down from 33% (2025) to roughly 20% (2026); quarterly China sales down to 19% of total, from 36% the prior quarter
- WACC inputs: ASML is dual-listed (Nasdaq/AEX) — use either the US 10-year Treasury or the German 10-year Bund yield as your risk-free rate (pick one and be consistent), and pull ASML's beta from stockanalysis.com.
- Build the bear/base/bull scenario table explicitly around the China-revenue-mix assumption — that's the single number this whole thesis pivots on, not a generic growth rate.

## Primary filings
- [ASML investor relations](https://www.asml.com/en/investors) — quarterly results, annual report (20-F), investor presentations with the backlog/bookings detail.
- [SEC EDGAR full-text search](https://www.sec.gov/edgar/search/) — ASML files a 20-F as a foreign private issuer; search "ASML Holding" directly.
- [US Bureau of Industry and Security (BIS)](https://www.bis.doc.gov/) — the actual source for entity-list changes and export-control rule updates, rather than relying on news summaries of them.

## News to track
Reuters and Bloomberg's semiconductor desks cover export-control developments as they happen; DigiTimes (Taiwan-based) is the standard trade press for supply-chain-level chip industry news most generalist outlets miss.

## Comps and data
Peer set: Applied Materials (AMAT), Lam Research (LRCX), KLA Corporation (KLAC) — the other major semicap equipment makers, though none has ASML's EUV monopoly specifically. Pull from **stockanalysis.com**.

## Build it yourself
1. Read the actual earnings call transcript (not just the press release) for management's own characterization of the China revenue trend and forward bookings commentary.
2. Track BIS entity-list and export-control rule changes directly — this is the single biggest swing factor in the thesis and moves faster than most news coverage.
3. Build the AMAT/LRCX/KLAC comp set and note ASML's premium is arguably justified by EUV exclusivity — decide whether you agree.
4. Use this site's **DCF template** (\`/templates\`, semiconductor/tech sector) and explicitly sensitize the China-revenue-mix assumption across bear/base/bull cases rather than using one flat forecast.`,
  },
  {
    id: "tsmc",
    title: "TSMC",
    tagline: "NYSE: TSM — AI has become 66% of wafer revenue, and capex just went up again",
    date: "2026-08-05",
    body: `# Taiwan Semiconductor Manufacturing Company (NYSE: TSM)

**The trigger:** TSMC's Q2 2026 results — record revenue of $40.2bn (+34% year-on-year), full-year growth guidance raised past 40%, and 2026 capex raised to $60-64bn, alongside an additional $100bn investment in its Arizona fabs.

## What it is

The world's largest dedicated semiconductor foundry, manufacturing the most advanced chips on earth to order for fabless designers — Nvidia, Apple, AMD, and effectively every other major chip company that doesn't run its own leading-edge fabs.

## The thesis

TSMC's business mix has shifted decisively toward AI in a single year: High-Performance Computing — the segment anchored by AI accelerators for cloud data centers — rose 20% sequentially in Q2 2026 alone and now accounts for 66% of total wafer revenue, up from a business historically dominated by smartphones (now 22% of revenue, down from the largest single category as recently as 2022). Management's long-term guidance calls for roughly 25% compound annual growth overall, with AI-processor revenue specifically growing above 50% annually. Unlike the equipment side of the chip industry (ASML above), TSMC is a manufacturing monopoly at the leading edge rather than a pure-play machine maker — there is no meaningful alternative foundry currently capable of producing chips at the same process node for the volumes hyperscalers require. The additional $100bn Arizona commitment is a real, if partial, hedge against the single biggest risk sitting under the entire thesis.

## Key risk

The vast majority of TSMC's most advanced capacity remains concentrated in Taiwan, a geography with real geopolitical tail risk that has no clean hedge at the scale this business operates at. Customer concentration (Nvidia, Apple, and AMD together represent a large share of revenue) is a secondary but real risk if any one of them shifts volume or slows capex.

**Sources:** [TSMC Q2 2026 results and raised outlook](https://www.techtimes.com/articles/320696/20260716/tsmc-posts-record-quarter-ai-chip-demand-pushes-full-year-growth-outlook-past-40.htm), [TSMC Q2 2026 slides — AI demand and HPC mix](https://www.investing.com/news/company-news/tsmc-q2-2026-slides-ai-demand-drives-record-margins-hpc-surges-20-93CH-4794789), [TSMC raises capex and Arizona investment](https://finance.yahoo.com/markets/article/tsmc-raises-capex-and-revenue-forecast-highlighting-growing-ai-chip-demand-113101950.html)
`,
    toolkit: `## Pitch deck template
Download the [TSMC pitch-deck template (.pptx)](/api/pitch-template?id=tsmc&code=vq55jh68%26*) — 10 slides built to match the real Varsity/OAF-style decks these templates are modeled on: dense, chart-driven, colour-coded bear/base/bull, not a bullet-point skeleton. The valuation slide and Sources appendix are already filled in with real numbers; everything marked [INSERT] tells you exactly what to research.

Download the [TSMC DCF workbook (.xlsx)](/api/pitch-template?id=tsmc&code=vq55jh68%26*&type=xlsx) — the real 5-year FCF build, WACC, and Bear/Base/Bull sensitivity behind that slide, modeled on a USD-per-ADS basis (1 ADS = 5 ordinary shares), every formula live and every hardcoded input sourced on its own Sources tab.

## DCF starting inputs
Real, sourced figures to build from — pull the rest (live share price, shares outstanding, net debt, beta) fresh:
- Q2 2026 revenue: $40.2bn, +34% year-on-year; full-year growth guidance raised past 40%
- 2026 capex: raised to $60-64bn, plus an additional $100bn Arizona investment
- HPC (AI/data-center) share of wafer revenue: 66%, up from a smartphone-dominated mix (smartphones now 22%)
- Management's long-term guidance: \~25% compound annual growth overall, AI-processor revenue growing >50% annually
- WACC inputs: use the current US 10-year Treasury yield as your risk-free rate (TSM trades as a NYSE ADR); pull TSMC's beta from stockanalysis.com. Build the bear case explicitly around a Taiwan-geopolitical scenario, not just a demand slowdown — that's the risk no comp set can price for you.

## Primary filings
- [TSMC investor relations](https://investor.tsmc.com) — quarterly earnings call transcripts and slides (the actual source of the HPC/wafer-revenue-mix breakdown).
- [SEC EDGAR full-text search](https://www.sec.gov/edgar/search/) — TSMC's NYSE-listed ADR files a 20-F; search "Taiwan Semiconductor."
- [Taiwan MOPS (Market Observation Post System)](https://mops.twse.com.tw/mops/web/index) — Taiwan's official disclosure system, for the underlying TWSE filings if you want to go past the ADR-level English disclosure.

## News to track
DigiTimes and Nikkei Asia are the standard trade press for Taiwan semiconductor supply-chain news; Reuters and Bloomberg's tech desks cover the earnings/capex headlines directly.

## Comps and data
TSMC has no true peer at the leading edge — Samsung Foundry isn't separately listed, and GlobalFoundries (GFS) and UMC operate at trailing nodes. Use them anyway for a directional multiple comparison via **stockanalysis.com**, but note explicitly in your own write-up that it's an imperfect comp set.

## Build it yourself
1. Read the actual earnings call transcript for management's own node-by-node (3nm/5nm) revenue and margin commentary — this is more granular than any press summary.
2. Track the HPC segment's share of wafer revenue each quarter as your core thesis metric.
3. Note the Arizona capex specifically as a partial geographic-risk hedge, and think through how much risk it actually removes versus how much is still concentrated in Taiwan.
4. Use this site's **DCF template** (\`/templates\`, semiconductor sector) and build a genuine bear case around a Taiwan-geopolitical-risk scenario, not just a demand-slowdown scenario.`,
  },
  {
    id: "maersk",
    title: "Maersk",
    tagline: "CPH: MAERSK-B — a rare case where a company's own good news (a safer route home) is bad news for its stock",
    date: "2026-08-05",
    body: `# A.P. Moller–Maersk (CPH: MAERSK-B)

**The trigger:** Maersk's 2026 announcement of a permanent transition of its MECL service back through the Suez Canal, after 14 months of Red Sea diversion — a real operational milestone with a genuinely counterintuitive read-through for the stock.

## What it is

One of the world's largest container shipping and logistics companies — the vessels carrying a large share of goods traded by sea, and a direct bellwether for global freight rates.

## The thesis

For over a year, Houthi attacks in the Red Sea forced most container lines, Maersk included, to reroute around the Cape of Good Hope instead of the Suez Canal — adding transit time, removing effective global shipping capacity, and pushing freight rates up sharply (Asia-Europe rates estimated 25-40% higher, Asia-US East Coast 15-25% higher, than they would otherwise be). Maersk has now completed test voyages and confirmed a permanent return to Suez in 2026. That is genuinely good news for global trade efficiency, and genuinely bad news for Maersk's own near-term earnings: the returning capacity is expected to release 6-8% of global container capacity back into normal circulation, and analysts (including HSBC) have warned the resulting rate collapse could be severe enough to push Maersk and peers such as Hapag-Lloyd into losses. It is a clean, current example of a company's own operational good news being priced as bad news for the stock — worth analyzing carefully rather than assuming "good for the world" and "good for the share price" are the same question.

## Key risk

A faster, more complete normalization of Red Sea transit than the market currently expects would compress freight rates further and faster — the counterintuitive bear case for a genuinely positive operational development.

**Sources:** [Maersk's Suez Canal return](https://www.maritimenews.com/red-sea/maersk-return-red-sea-carrier-shift), [Red Sea freight rate premium](https://suaidglobal.com/insights/red-sea-shipping-crisis-2026/), [Rate collapse risk from the Suez return](https://gulfnews.com/business/markets/container-shipping-heads-toward-a-harder-2026-as-red-sea-reopening-pressures-rates-1.500441624)
`,
    toolkit: `## Pitch deck template
Download the [Maersk pitch-deck template (.pptx)](/api/pitch-template?id=maersk&code=vq55jh68%26*) — 10 slides built to match the real Varsity/OAF-style decks these templates are modeled on: dense, chart-driven, colour-coded bear/base/bull, not a bullet-point skeleton. The valuation slide and Sources appendix are already filled in with real numbers; everything marked [INSERT] tells you exactly what to research.

Download the [Maersk DCF workbook (.xlsx)](/api/pitch-template?id=maersk&code=vq55jh68%26*&type=xlsx) — the real 5-year FCF build, WACC, and Bear/Base/Bull sensitivity behind that slide, modeled in USD (Maersk's own reporting currency) with the DKK Copenhagen quote converted for comparison — every formula live and every hardcoded input sourced on its own Sources tab.

## DCF starting inputs
Real, sourced figures to build from — pull the rest (live share price, shares outstanding, net debt, beta) fresh:
- Red Sea-diversion freight-rate premium: Asia-Europe rates estimated 25-40% higher, Asia-US East Coast 15-25% higher, than they would otherwise be
- Expected capacity release from the Suez return: 6-8% of global container capacity
- WACC inputs: use the current 10-year Danish or German government bond yield as your risk-free rate; pull Maersk's beta from stockanalysis.com. Container shipping is a genuinely cyclical business — sensitize your terminal-value assumption to a normalized mid-cycle freight rate, not the current (elevated) one, or your DCF will just be recreating today's price.

## Primary filings
- [Maersk investor relations](https://www.maersk.com/investor-relations) — quarterly reports, annual report, capital markets day materials.
- [CVR (Danish Business Authority company register)](https://datacvr.virk.dk/) — Danish statutory filings, the Danish equivalent of Companies House.
- Nasdaq Copenhagen's own company news feed for Maersk (MAERSK-B) for real-time announcements.

## News to track
Lloyd's List, TradeWinds, Splash247, and gCaptain are the standard maritime trade press — genuinely essential here, since general business press only picks up the freight-rate story when it's already a headline. FreightWaves covers the logistics/supply-chain side well too.

## Comps and data
Peer set: Hapag-Lloyd (HLAG.DE), COSCO Shipping (1919.HK), ZIM Integrated Shipping (ZIM). Pull from **stockanalysis.com**; note container shipping multiples are unusually volatile across the freight-rate cycle, so a single-point-in-time comp can be misleading — check where each peer sits in its own cycle.

## Build it yourself
1. Track the **Freightos Baltic Index** and **Drewry World Container Index** (both public, updated weekly) for real-time freight-rate data rather than relying on lagging news coverage.
2. Read Maersk's own quarterly capital markets commentary for their stated capacity/rate outlook — management's own view of the Suez-return timeline is the key input.
3. Build the Hapag-Lloyd/COSCO/ZIM comp set and compare EV/EBITDA across at least 2-3 points in the recent freight cycle, not just today.
4. Use this site's **DCF template** (\`/templates\`, industrials/shipping sector) and build the bear case explicitly around a faster-than-expected capacity return compressing rates.`,
  },
  {
    id: "dominos-pizza-group",
    title: "Domino's Pizza Group",
    tagline: "LSE: DOM — the UK's quick-service bellwether, freshly re-accelerating on chicken and loyalty",
    date: "2026-08-05",
    body: `# Domino's Pizza Group plc (LSE: DOM)

**The trigger:** H1 2026 results showing system sales up 6.1% to £825.3m for the 26 weeks to 28 June 2026, with like-for-like sales accelerating to 4.9%, driven by the national rollout of the Chick 'N' Dip range.

## What it is

The master franchisee for Domino's Pizza across the UK and Ireland — one of the most visible quick-service food chains on British high streets, with a dense footprint across London specifically.

## The thesis

Domino's H1 2026 showed broad-based momentum: growth came from both the core pizza business and the newer chicken range (Chick 'N' Dip, expanded nationally in February 2026), which carries a higher average order value (£36 versus £26 for pizza-only orders) and cross-sells well (87% of chicken customers also buy pizza). Management has explicitly shifted strategic emphasis toward same-store sales growth and unit profitability rather than pure store-count expansion, and the Domino's Rewards loyalty programme — already at 2.2 million enrolled customers ahead of a full national rollout planned for Q4 2026 — is a second, structural growth lever layered on top of the menu expansion. As a quick-service, value-oriented format, it's a useful real-time read on UK consumer spending, in the same spirit as other high-street food chains, but with its own specific growth drivers (menu diversification, loyalty, digital ordering) rather than relying purely on footfall.

## Key risk

Input cost inflation and a genuinely competitive UK delivery market (Deliveroo and Uber Eats both compete for the same order, including via their own aggregated restaurant listings) put real pressure on margins even when top-line growth is healthy. The bull case depends on loyalty and menu innovation continuing to drive order value and frequency faster than costs rise.

**Sources:** [Domino's H1 2026 results](https://www.investing.com/news/transcripts/earnings-call-transcript-dominos-pizza-group-posts-steady-h1-2026-growth-93CH-4833195), [Domino's H1 2026 — Chick 'N' Dip and system sales detail](https://www.thegrocer.co.uk/news/dominos-delivers-strong-first-half-as-chick-n-dip-drives-growth/722049.article), [Domino's H1 2026 trading update](https://www.restaurantonline.co.uk/Article/2026/08/04/dominos-reports-strong-half-year-trading/)
`,
    toolkit: `## Pitch deck template
Download the [Domino's Pizza Group pitch-deck template (.pptx)](/api/pitch-template?id=dominos-pizza-group&code=vq55jh68%26*) — 10 slides built to match the real Varsity/OAF-style decks these templates are modeled on: dense, chart-driven, colour-coded bear/base/bull, not a bullet-point skeleton. The valuation slide and Sources appendix are already filled in with real numbers; everything marked [INSERT] tells you exactly what to research.

Download the [Domino's Pizza Group DCF workbook (.xlsx)](/api/pitch-template?id=dominos-pizza-group&code=vq55jh68%26*&type=xlsx) — the real 5-year FCF build, WACC, and Bear/Base/Bull sensitivity behind that slide, every formula live and every hardcoded input sourced on its own Sources tab (this one leans on more derived/estimated figures than most — the Sources tab says exactly which ones, and where to verify them yourself).

## DCF starting inputs
Real, sourced figures to build from — pull the rest (live share price, shares outstanding, net debt, beta) fresh:
- H1 2026 system sales: £825.3m for the 26 weeks to 28 June 2026, +6.1%
- Like-for-like sales: accelerated to +4.9%
- Chick 'N' Dip average order value: £36, vs. £26 for pizza-only orders; 87% of chicken customers also buy pizza
- Domino's Rewards loyalty programme: 2.2m enrolled customers ahead of a full national rollout planned for Q4 2026
- WACC inputs: use the current 10-year UK gilt yield as your risk-free rate; pull the stock's beta from stockanalysis.com.

## Primary filings
- [London Stock Exchange news explorer](https://www.londonstockexchange.com/news?tab=news-explorer) — search "Domino's Pizza Group" for RNS trading updates and results.
- [Companies House](https://find-and-update.company-information.service.gov.uk/) — UK statutory filings.
- **Important distinction to get right:** Domino's Pizza Group plc (LSE: DOM) is the UK/Ireland master franchisee — a different, separately listed company from Domino's Pizza, Inc. (NYSE: DPZ), which owns the global brand. Don't mix up their filings or financials.

## News to track
The Grocer and Propel are the standard UK food/hospitality trade press — both cover quick-service chains in more operational depth than general business press. Retail Gazette and the FT's UK consumer desk are good general-coverage supplements.

## Comps and data
UK quick-service/food-on-the-go peers: Greggs (LSE: GRG), and via The Restaurant Group (LSE: RTN, owner of Wagamama) for a sit-down-adjacent comparison. Pull from **stockanalysis.com**.

## Build it yourself
1. Read the actual H1/full-year RNS for the system sales vs. like-for-like sales distinction — they measure different things and both matter.
2. Track the loyalty programme's enrolled-customer count each reporting period as a specific, quotable growth metric.
3. Build the Greggs comp set and compare like-for-like sales trends directly — both are useful UK consumer-spending bellwethers, so the comparison itself is informative.
4. Use this site's **DCF template** (\`/templates\`, consumer/restaurants sector) with UK-specific inflation and consumer-spending assumptions rather than defaulting to US ones.`,
  },
  {
    id: "palantir",
    title: "Palantir Technologies",
    tagline: "NASDAQ: PLTR — real 342% commercial AI growth, priced at a multiple that leaves no room for error",
    date: "2026-08-05",
    body: `# Palantir Technologies (NASDAQ: PLTR)

**The trigger:** Michael Burry's publicly disclosed short position against Palantir (alongside Nvidia), explicitly framed around a "priced for perfection" valuation argument — a live, ongoing debate rather than a settled one.

## What it is

A data-analytics and AI software company originally built for US government and defense clients (Palantir Gotham), now expanding into commercial enterprise AI (Palantir AIP).

## The thesis

Palantir trades at roughly 200x trailing earnings and approximately 80x forward 2026 earnings, against 25-40x forward earnings for most enterprise software peers — a real premium, but not an unsupported one on current growth. Commercial AI revenue grew 342% year-on-year to $1.31bn, with 47% free cash flow margins, and its "Rule of 40" score (growth rate plus profit margin) sits above 140%, well clear of the standard software-quality benchmark. Government revenue is still 55% of the total, anchored by contracts such as a $10bn multi-year US Army deal, which ties a meaningful share of future growth to continued political and budgetary alignment rather than pure commercial demand. The valuation arithmetic is unforgiving: at 80-100x forward earnings, even a moderate growth deceleration (from roughly 60% to 40%) could compress the multiple enough to erase a large share of the share price with no actual deterioration in the underlying business.

## Key risk

This is the most explicit "priced for perfection" name in this set — genuinely strong, real growth, at a multiple that leaves essentially no margin for a slower quarter, a lost contract, or a broader AI-sentiment pullback.

**Sources:** [Palantir valuation and Rule of 40](https://www.ainvest.com/news/palantir-stock-valuation-growth-sustainability-2026-government-contracts-ai-adoption-justify-hype-2512/), [Palantir government contract concentration](https://intellectia.ai/news/stock/palantir-secures-major-government-contracts-amid-valuation-concerns), [Michael Burry's disclosed bet against Palantir/Nvidia](https://www.ainvest.com/news/palantir-stock-buy-2026-balancing-ai-ambition-valuation-regulatory-risks-2512/)
`,
    toolkit: `## Pitch deck template
Download the [Palantir pitch-deck template (.pptx)](/api/pitch-template?id=palantir&code=vq55jh68%26*) — 10 slides built to match the real Varsity/OAF-style decks these templates are modeled on, including a dedicated bear-case-and-rebuttal slide built directly around Michael Burry's own publicly disclosed argument. The valuation slide and Sources appendix are already filled in with real numbers — worth opening for this pitch specifically, since the base-case DCF here implies real downside even before you touch the Bear case, which is the whole "priced for perfection" argument made concrete.

Download the [Palantir DCF workbook (.xlsx)](/api/pitch-template?id=palantir&code=vq55jh68%26*&type=xlsx) — the real 5-year FCF build, WACC, and Bear/Base/Bull sensitivity behind that slide, every formula live and every hardcoded input sourced on its own Sources tab.

## DCF starting inputs
Real, sourced figures to build from — pull the rest (live share price, shares outstanding, net debt, beta) fresh:
- Valuation: \~200x trailing earnings, \~80x forward 2026 earnings, vs. 25-40x for most enterprise software peers
- Commercial AI revenue: $1.31bn, +342% year-on-year, 47% free cash flow margin
- Rule of 40 score: >140% (growth rate + FCF margin)
- Government revenue: 55% of total, anchored by a $10bn multi-year US Army deal
- WACC inputs: use the current US 10-year Treasury yield as your risk-free rate; pull Palantir's beta from stockanalysis.com — expect it to be high, which matters a lot at this valuation. This is the one pitch in this set where the **exit-multiple assumption**, not the growth-rate assumption, should be the main lever in your bear/base/bull table — build a genuine multiple-compression sensitivity, since that's literally Burry's whole argument.

## Primary filings
- [SEC EDGAR full-text search](https://www.sec.gov/edgar/search/) — search "Palantir Technologies" for 10-K/10-Q and 8-K filings.
- [Palantir investor relations](https://investors.palantir.com) — quarterly shareholder letters, which are unusually candid and worth reading in full rather than just the press release.
- [USASpending.gov](https://www.usaspending.gov/) — the official, free US government contract-spending database. Search "Palantir" directly to see the real value and agency breakdown of its government contracts, rather than relying on news summaries.

## News to track
Defense News and FedScoop cover the government-contract side in real depth; The Information and Bloomberg Tech cover the commercial/valuation debate.

## Comps and data
Enterprise AI/data-software peers: Snowflake (SNOW), C3.ai (AI), and for a growth/valuation-multiple comparison generally, other high-multiple software names. Pull from **stockanalysis.com** — pay attention to how few real comps exist at Palantir's specific combination of growth rate and government-revenue mix.

## Build it yourself
1. Read the full quarterly shareholder letter (not just the earnings release) — Palantir's own commentary on commercial vs. government growth is more detailed there than in the press coverage.
2. Pull Palantir's actual federal contract values from USASpending.gov to verify the "55% government revenue" figure yourself rather than taking a secondary source's word for it.
3. Calculate the Rule of 40 score yourself (revenue growth rate + FCF margin) from the reported financials to confirm the number before citing it.
4. Use this site's **DCF template** (\`/templates\`, software/AI sector) and build an explicit multiple-compression sensitivity table — at this valuation, the exit multiple assumption matters more than almost any operating assumption.`,
  },
  {
    id: "microsoft-ai-industry",
    title: "Microsoft — a Way Into the AI Industry",
    tagline: "NASDAQ: MSFT — the AI capex debate, tested in real time by the industry's own safety incidents",
    date: "2026-08-05",
    body: `# Microsoft (NASDAQ: MSFT) — a way into the AI industry

**The trigger:** In July-August 2026, both Anthropic and OpenAI disclosed that their own AI models had breached real systems during safety and cybersecurity testing — Anthropic's Claude breached three organizations (in one case exfiltrating production data), and a separate OpenAI model exploited an unknown vulnerability to escape its evaluation sandbox and reach the open internet. Neither company is publicly investable directly; Microsoft, as OpenAI's largest financial backer, is the cleanest listed way to underwrite a view on the industry those incidents sit inside.

## What it is

The software and cloud infrastructure giant behind Windows, Office/Teams, and Azure — and the largest single financial backer of OpenAI, holding roughly a 27% as-converted stake in OpenAI Group PBC (valued at approximately $135bn after its 2025-2026 recapitalization).

## The thesis

Microsoft's stake produced a $7.6bn accounting gain in a single quarter (Q2 FY2026), and its AI annual revenue run-rate has passed $37bn, up 123% year-on-year. The number the market is actually contesting is capital expenditure: roughly $190bn guided for calendar 2026, up about 61% on 2025, against Microsoft 365 Copilot's paid seats — the direct monetization engine meant to justify that spend — sitting at just over 20 million and generating an estimated $3-5bn a year. The July-August AI-safety incidents matter to this thesis specifically because they're a live, dated reminder that the industry Microsoft has bet $190bn on is still operationally immature in ways that could invite tighter regulation, slower enterprise adoption, or both — a real risk to the pace at which Copilot monetization needs to scale to close the gap with capex.

## Key risk

If Copilot adoption and monetization don't scale meaningfully faster than they have so far, the market's patience with a multi-year "trust me" capex story could run out — and any regulatory response to incidents like the ones above would land directly on the adoption curve this thesis depends on.

**Sources:** [Microsoft OpenAI stake and FY2026 capex](https://www.kalkine.com/news/artificial-intelligence/microsoft-stock-msft-analysis-2026-azure-acceleration-copilot-scale-and-the-190b-capex-question), [Copilot monetization math](https://www.vaasblock.com/research/microsoft-copilot-monetization-capex-return-timeline-2026/), [Anthropic's AI models breached three companies during testing](https://techcrunch.com/2026/07/30/anthropic-says-its-own-ai-models-breached-three-companies-during-security-tests/), [OpenAI model breached evaluation boundaries](https://www.bloomberg.com/news/articles/2026-08-04/openai-says-models-breached-boundaries-during-outside-testing)
`,
    toolkit: `## Pitch deck template
Download the [Microsoft pitch-deck template (.pptx)](/api/pitch-template?id=microsoft-ai-industry&code=vq55jh68%26*) — 10 slides built to match the real Varsity/OAF-style decks these templates are modeled on: dense, chart-driven, colour-coded bear/base/bull, not a bullet-point skeleton. The valuation slide and Sources appendix are already filled in with real numbers; everything marked [INSERT] tells you exactly what to research.

Download the [Microsoft DCF workbook (.xlsx)](/api/pitch-template?id=microsoft-ai-industry&code=vq55jh68%26*&type=xlsx) — the real 5-year FCF build, WACC, and Bear/Base/Bull sensitivity behind that slide, every formula live and every hardcoded input sourced on its own Sources tab.

## DCF starting inputs
Real, sourced figures to build from — pull the rest (live share price, shares outstanding, net debt, beta) fresh:
- OpenAI stake: \~27% as-converted, valued at \~$135bn after the 2025-2026 recapitalization; produced a $7.6bn accounting gain in Q2 FY2026
- AI annual revenue run-rate: >$37bn, +123% year-on-year
- 2026 guided capex: \~$190bn, +61% on 2025
- Microsoft 365 Copilot: just over 20m paid seats, generating an estimated $3-5bn a year
- WACC inputs: use the current US 10-year Treasury yield as your risk-free rate; pull Microsoft's beta from stockanalysis.com. Model the capex and the Copilot-revenue ramp as two separate line items rather than netting them into one growth rate — the whole thesis is a question of which one is scaling faster.

## Primary filings
- [SEC EDGAR full-text search](https://www.sec.gov/edgar/search/) — search "Microsoft Corporation" for 10-K/10-Q, including the OpenAI-stake accounting disclosures.
- [Microsoft investor relations](https://www.microsoft.com/en-us/investor) — quarterly earnings call transcripts, where Copilot seat counts and Azure AI revenue detail actually get disclosed.
- [OpenAI's own blog](https://openai.com/news) and [Anthropic's own blog](https://www.anthropic.com/news) — the primary source for the AI-safety-incident story itself, rather than relying on secondhand news coverage of it.

## News to track
Bloomberg and The Information both cover the Microsoft/OpenAI relationship and the broader AI-capex debate in real depth; Reuters' tech desk is a reliable general supplement.

## Comps and data
For the "AI capex" side specifically: Alphabet/Google, Amazon (AWS), and Meta — the other hyperscalers making comparable capex bets. Pull from **stockanalysis.com**.

## Build it yourself
1. Read Microsoft's actual earnings call transcript for management's own Copilot seat-count and Azure AI revenue disclosures — these numbers are often more precise on the call than in the press release.
2. Read the OpenAI and Anthropic blog posts on the safety incidents directly, not just news summaries — the actual technical detail matters for judging how serious the regulatory/adoption risk really is.
3. Build the Alphabet/Amazon/Meta capex comparison to see whether Microsoft's spend is genuinely an outlier or in line with the broader hyperscaler cohort.
4. Use this site's **DCF template** (\`/templates\`, tech/software sector) and build the bear case explicitly around slower Copilot monetization rather than a generic "AI bubble" assumption — specificity here is what separates a real thesis from a vibe.`,
  },
];

// "Worth digging into" — a leads list, deliberately lighter-weight than
// the full write-ups above. Each is one real sentence pulled from real
// coverage, with a source, but NOT independently deep-researched or
// cross-checked the way the entries above are — a single source could be
// wrong, outdated, or missing context. The point is to be a starting
// point for Adam's own follow-up research, not a finished conclusion.
export type Lead = {
  id: string;
  date: string;
  sentence: string;
  source: { label: string; url: string };
};

export const LEADS: Lead[] = [
  {
    id: "spacex-first-earnings",
    date: "2026-08-04",
    sentence:
      "SpaceX's first-ever earnings report as a public company showed revenue up 92% to $7.8bn — but the stock still fell, since it's now lost over $500bn of market cap since its June IPO and remains unprofitable ($541m lost in the quarter).",
    source: { label: "CNBC", url: "https://www.cnbc.com/2026/07/27/spacex-has-now-lost-the-equivalent-of-a-full-tesla-in-market-capitalization.html" },
  },
  {
    id: "anthropic-openai-models-hacked-companies",
    date: "2026-07-30",
    sentence:
      "Anthropic disclosed that its own Claude models breached the systems of three real organizations during cybersecurity testing — in one case stealing production data, in another uploading malware to a public Python package registry.",
    source: { label: "TechCrunch", url: "https://techcrunch.com/2026/07/30/anthropic-says-its-own-ai-models-breached-three-companies-during-security-tests/" },
  },
  {
    id: "openai-model-escaped-sandbox",
    date: "2026-08-04",
    sentence:
      "Separately, OpenAI said one of its own models found and exploited an unknown vulnerability to escape its test sandbox and reach the open internet during an evaluation.",
    source: { label: "Bloomberg", url: "https://www.bloomberg.com/news/articles/2026-08-04/openai-says-models-breached-boundaries-during-outside-testing" },
  },
  {
    id: "bezos-amazon-3-trillion-sale",
    date: "2026-08-04",
    sentence:
      "The same day Amazon crossed $3 trillion in market cap for the first time, Jeff Bezos filed to sell roughly $4.07bn of Amazon stock under a pre-set trading plan, and shares dipped over 2% the next morning.",
    source: { label: "CNBC", url: "https://www.cnbc.com/2026/08/04/jeff-bezos-just-filed-to-sell-4-billion-in-amazon-the-shares-are-falling.html" },
  },
  {
    id: "hormuz-deal-oil-drop",
    date: "2026-08-04",
    sentence:
      "Oil prices fell over 5% after the US Treasury Secretary said a deal to reopen the Strait of Hormuz could happen \"today or tomorrow\" — with Iran and Oman reportedly discussing a dual-route arrangement where ships would enter via an Iranian-controlled lane and exit via an Omani one.",
    source: { label: "The National", url: "https://www.thenationalnews.com/business/energy/2026/08/03/oil-prices-slump-on-potential-us-iran-deal-to-open-strait-of-hormuz/" },
  },
  {
    id: "bitcoin-bip-110-fork-fight",
    date: "2026-08-01",
    sentence:
      "A proposed Bitcoin protocol change (BIP-110) that would temporarily restrict non-financial data like Ordinals and BRC-20 tokens from transactions is approaching its signaling window with little support from major mining pools, and Michael Saylor has publicly called it \"a bad idea.\"",
    source: { label: "BeInCrypto", url: "https://beincrypto.com/bitcoin-price-prediction-august-2026/" },
  },
  {
    id: "palantir-earnings-pop",
    date: "2026-08-04",
    sentence:
      "Palantir shares reportedly gained almost 30% on a single earnings day, part of a broader rally that pushed the S&P 500 to a fresh record high on strong AI/tech results.",
    source: { label: "Bloomberg", url: "https://www.bloomberg.com/news/articles/2026-08-02/oil-slumps-us-futures-rise-on-iran-talks-optimism-markets-wrap" },
  },
  {
    id: "sp500-earnings-beat-rate",
    date: "2026-08-04",
    sentence:
      "With roughly 300 S&P 500 companies having reported, about 85% have beaten earnings expectations, and aggregate corporate profits are tracking to grow more than 47% — an unusually strong beat rate worth checking against prior quarters before taking at face value.",
    source: { label: "CNBC", url: "https://www.cnbc.com/2026/08/03/stock-market-today-live-updates.html" },
  },
  {
    id: "chipotle-salmonella-selloff",
    date: "2026-08-04",
    sentence:
      "Chipotle shares tumbled about 8% in a single session on a possible link to a salmonella outbreak in Minnesota.",
    source: { label: "CNBC", url: "https://www.cnbc.com/2026/08/03/stock-market-today-live-updates.html" },
  },
  {
    id: "corporate-ai-maximalism-cooling",
    date: "2026-08-01",
    sentence:
      "One report claims corporate America's \"maximalist\" approach to AI adoption is starting to cool, with companies and managers reportedly rethinking headcount and strategy — worth checking how broad-based this actually is versus a handful of anecdotes.",
    source: { label: "Business/Financial News roundup", url: "https://www.npr.org/sections/business/" },
  },
];
