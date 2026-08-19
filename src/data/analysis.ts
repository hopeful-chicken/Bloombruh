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
    title: "Are Pokemon Cards an Asset Class?",
    tagline: "Robert Greer's 1997 asset-class framework, a 3,821% index number that falls apart once you see how it is built, and PSA population data that quietly undercuts the \"vintage is scarce\" argument",
    date: "2026-08-08",
    body: `# Are Pokemon cards an asset class?

Pokemon cards are having a real moment right now. New sets (themed card collections the company releases every few months, the way a card game keeps putting out new expansions) keep landing: the Chaos Rising and Mega Evolution series launched in May 2026, on top of Prismatic Evolutions and the 151 reprint set before it. The headlines keep getting bigger too. In February 2026 a single card, the Pikachu Illustrator (an ultra-rare 1998 promotional card long considered the rarest Pokemon card in existence), sold at auction for $16.49m, becoming the most expensive trading card ever sold in any category, a record certified by Guinness. Buyers spent an estimated $450m on Pokemon cards in the first quarter of 2026 alone, and PSA, the company that authenticates and grades cards, is now processing roughly 90,000 cards a day, up from about 15,000 a day back in 2021.

That kind of money and attention has pushed cards well past being just a hobby. People are increasingly buying them the way they would buy a stock or a piece of art: as something to hold and hope to sell later for more. So the question worth asking properly is whether Pokemon cards actually are an asset class, in the same sense that stocks, bonds, or gold are, or whether that is a label the current hype is borrowing without really earning.

The short version is this. Pokemon cards do sit inside a real, recognized category of assets, so the classification question is not really the interesting one. What they are not is something worth building a portfolio around the way a stock or bond is, and the headline return figure behind most of the bullish case falls apart once you look at how it is actually built. The most surprising part is that the "vintage cards are scarce because they cannot be reprinted" argument, widely assumed to be true, does not hold up against the actual data on how many of them are getting graded.

{{POKEMON_PSYDUCK_IMAGE}}

## What counts as an asset class

The key reference point here is a 1997 paper by Robert Greer, a finance academic, in the Journal of Portfolio Management. It is still considered the standard definition, and he revisited it himself in 2018. Greer defines an asset class as a group of things that share real economic similarities with each other, and that are clearly different from things outside the group. When he revisited the idea two decades later, he added an important condition: the group should be things people can actually invest in, not just things that exist. That distinction ends up mattering a lot here.

Greer splits everything worth owning into three broad groups. The first, capital assets, pays you back over time (for example, stocks pay dividends and bonds pay interest), so you can work out roughly what one is worth today by estimating those future payments. The second, consumable or transformable assets, gets used up, like oil, copper, or wheat, and its price comes mainly from ordinary supply and demand rather than any future income. The third, store of value assets, pays nothing and cannot really be used up either, but people still want to own it. Greer's own example of this third group is fine art.

Pokemon cards fall into that third group. A card produces no income, so there is no way to value one by forecasting future payments the way you would value a stock. Its price is purely whatever the next buyer is willing to pay. That makes it a genuinely different kind of asset from a stock, which is why the tools used to value a company do not really apply here.

When AJ Scaramucci, founder of Solari Capital, went on CNBC nine days after paying $16.49m for the only Pikachu Illustrator ever to receive a PSA 10 (PSA grades a card's condition on a 1-to-10 scale, and 10 is the highest, most pristine grade a card can get) and said cards should be treated as investments, he was really answering "is this worth buying," not the separate question of what category of asset it technically is. Something can be genuinely worth buying and still be a store of value asset rather than anything resembling a stock. Gold works the same way.

Greer's framework has one more useful piece. He argues that a real bubble, prices running well past what something is actually worth, needs two things to happen together: there has to be no reliable way to check the item's true value, and there has to be a real limit on how much of it exists. Store of value assets like art and cards can have both problems at once. Commodities like oil usually do not, because if the price runs too high, more can simply be produced. Whether something's supply is genuinely limited or not turns out to be the whole story behind the difference between old and new Pokemon cards later in this piece.

## Where the big number comes from

The bullish case for Pokemon cards runs on one statistic. Card Ladder, a company that tracks and publishes price data for trading cards the way an index provider tracks stock prices, reports its Pokemon index up 3,821% since 2004, against 483% for the S&P 500 over the same span. Fortune magazine, using data Card Ladder supplied directly, ran a slightly different version: the average Pokemon card gained 3,261% over twenty years while the S&P 500 returned 421%. By April 2026 the same Card Ladder index was being quoted at 6,208% since 2004.

Those three figures are all attributed to the same tracker and the same underlying market, separated by only months. The index did have a genuinely enormous year, up 145% over the twelve months to February 2026 against 15.2% for the S&P 500, so the jump is arithmetically possible rather than an error. But an index adding more than half of its entire twenty-one-year gain in a few months is not really behaving like a broad market benchmark. It looks more like the kind of move a single, volatile stock might make.

What actually explains this is the methodology, and it is worth walking through. Card Ladder publishes how its index works: every card in a given index is marked at its last sold price (whatever it went for on the most recent day it actually traded), and the sum is divided by the number of cards. That creates three problems at once.

The first is stale pricing. A card that last changed hands in 2019 is still carried at its 2019 price until someone trades it again. This is the same effect that makes private equity and real estate indexes look artificially smooth, and it flatters the index's apparent risk without any real property of the underlying asset actually changing.

The second is that the index only marks down when people actually sell. In a falling market, collectors tend to stop listing things, since nobody enjoys locking in a loss on something they also just enjoy owning. So the index does not fall, it just stops updating. Anyone who has looked at other hard-to-trade asset indexes will recognize this as the reason they always look smoother than what is really happening underneath.

The third is that the index is not something anyone could actually buy. Every card counts equally regardless of how valuable it is, rather than being weighted by real market value, so the index is not a portfolio anyone could hold, and there is no fund or tracker that replicates it. Greer's point about investable assets applies directly here.

Card Ladder is upfront about how fragile this can be. Their own documentation walks through an example where one million-dollar sale can lift an entire player's index by 50% while nothing else in it actually changes value, and they describe that themselves as a distortion that defeats the point of the index. That is a genuinely candid disclosure from the people who built it, but it is also a warning most people citing the 3,821% figure have clearly not read.

The clearest criticism of the comparison itself came from analyst Bo Hanson, who called the S&P framing a "math crime," since it stacks an average across thousands of collectible cards against a diversified index of five hundred real companies. His point is that the fairer comparison is to individual stock winners, not to the market as a whole. Over roughly the same two decades, an S&P 500 tracker fund (SPY) returned 509.56% from July 2006 to July 2026, and that number comes with daily liquidity, dividends, and a bid-ask spread measured in fractions of a cent.

## What happens when you correct for selection bias

This is where research on the art market becomes directly useful, because art is the store of value asset that has actually been studied properly by academics.

Research by Goetzmann in the 1990s established that sales in these markets are not random. The owner decides when to sell, and owners are far more likely to sell something that has gone up in value, so the sales anyone actually observes are skewed toward winners rather than being a fair sample of the whole market. His sharpest finding was that in periods with few sales, an index can show strong positive returns even while the true value of everything in that market is actually falling.

Korteweg, Kraussl, and Verwijmeren put real numbers on this in the Review of Financial Studies, using 20,538 paintings that sold more than once at auction between 1972 and 2010. Correcting for that selection bias cut the average annual return from 11% to 7%, and cut the Sharpe ratio (a standard measure of how much return an investment delivers for each unit of risk taken; a higher number means a smoother, more efficient ride) from 0.4 to 0.1. Their conclusion was blunt: passively investing in an index of paintings is not a workable strategy once this bias is accounted for, and they specifically noted the finding applies to other hard-to-trade assets that work the same way.

Trading cards work exactly the same way. The card index is built only from cards that actually sold, in a market that is far more retail and far more driven by sentiment than the auction market for paintings. If a correction this large applies to twenty thousand paintings studied across four decades, there is no real reason to expect Card Ladder's Pokemon index needs a smaller one. If anything it may need a larger correction, since most of the drop in the Sharpe ratio in the art study came from correcting understated volatility, and an index built only from last-sold prices understates volatility more than the method those researchers used.

The Charizard case study below makes the point better than the theory does on its own. PSA checks a card's centering, corners, edges, and surface condition to arrive at its grade, and a 10 is nicknamed "gem mint": as close to a perfect, flawless copy as the scale allows. The card itself is the PSA 10, first edition (from the first, smaller print run, generally the most valuable version of a card) Base Set (the original 1999 English-language Pokemon card set, still the most collected set in the hobby) Charizard, the single most tracked individual card in the hobby. Its real sale history is a useful test of whether this is actually a boring, stable thing to own.

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

During the gap between 2017 and 2020, the index simply carried the card at its last sale price and showed no movement at all, even though that is not really the same thing as being stable. That gap, and the sharp correction that followed the 2022 peak, is Goetzmann's point made visible in a single card.

The comparison people always want is the $30 one. Thirty dollars in the S&P 500 in January 1999, with dividends reinvested, is worth roughly $261 today. Thirty dollars spent on a Charizard that later graded PSA 10 would be worth $550,000 today, around 18,000 times the money. Worth keeping in mind: this is the single most extreme surviving outcome out of billions of printed cards, and the 1999 entry price is an assumption about what a pack or a raw, ungraded card cost at the time, not a documented sale.

{{POKEMON_THIRTYDOLLAR_CHART}}

## The costs nobody puts in the comparison

Return comparisons between cards and stocks almost always ignore costs that are trivial in one market and large in the other.

At Heritage Auctions, one of the largest auction houses for cards and collectibles, the buyer's premium (an extra fee added on top of the winning bid, called the hammer price) runs 20% on most lots, and sellers have historically paid a further 10% to 15% in commission. Goldin, another major cards and memorabilia auction house, charges buyers a similar 20%. Getting a card professionally graded by PSA in 2026 costs anywhere from about $25 to $600 depending on the tier and the card's declared value, and once membership and shipping are added, a bulk submission typically runs closer to $30 to $35 per card. Auctions also do not pay out immediately: settlement usually takes 30 to 60 days after the sale.

Put a full round trip through those numbers. Buy at auction and later sell at auction at the exact same hammer price: the buyer pays 1.20 times the hammer price, and the seller receives somewhere between 0.85 and 0.90 times it. Using the midpoint, the hammer price has to rise about 37% just to break even. Spread over a three-year hold, that is roughly 11% a year of pure cost before any real gain shows up. The equivalent drag on an S&P 500 index fund is a fee of a few hundredths of a percent and a spread that is barely worth measuring.

The record-breaking sale itself shows what this does to a headline number. Logan Paul bought the Illustrator card in 2021 for a reported $5.275m and sold it in February 2026 for $16,492,000, which looks like a 3.13x gain, about 28% a year. But that $16.49m figure includes the buyer's premium, so it is not what actually landed in the seller's account. At a 20% premium, the real hammer price was closer to $13.7m, and even assuming Paul paid zero seller commission, an unusually good deal, his actual return drops to roughly 2.6x, about 23% a year. That is still an excellent trade, but it is about five percentage points a year worse than the number that got widely reported, on the single highest-profile sale in the history of this market, made by a seller with about as much negotiating leverage as anyone in this space will ever have, and most other sellers realistically do worse.

## How this compares to collectibles that already have a track record

If Pokemon cards really are a store of value asset, the fairer comparison group is not the S&P 500. It is art, wine, watches, and classic cars: categories that already have decades of price history and real institutional buyers.

Knight Frank, a real estate and luxury-assets firm, publishes a Luxury Investment Index that tracks ten of these categories together. It fell 3.3% in 2023, 2.7% in 2024, and 0.4% in 2025, which the firm itself described as a leveling-off after two rough years rather than a recovery. The Liv-ex Fine Wine 100 index dropped a further 2.5% in 2025 and sits roughly 25% below its 2022 peak. Over ten years, rare whisky is up about 192% and fine wine about 54%. The broader art market, meanwhile, grew 4% in 2025 to $59.6bn in global sales, with US auction sales up 23%.

So the entire established world of passion investments has been flat to falling for three years running, in the same window Pokemon cards allegedly returned 145% in twelve months. There are two ways to read that. Either Pokemon cards move completely independently of every other collectible category, which would make them an extraordinary diversifier and is a genuinely large claim to make, or the two sets of numbers are simply measuring different things. The methodology reasons above point toward the second explanation.

Knight Frank is careful about this in a way card trackers generally are not. The firm states plainly that its index is a price index built from dealer and auction data, not something anyone can actually invest in directly. That is the right disclosure for this type of index, and its absence from most Pokemon commentary says something.

## The market has already split in two

Treating "is this a bubble" as some future question stops making sense on a closer look at 2026 data, because for half of this market, it has already been answered.

Modern cards, meaning sets from roughly the last three years, corrected hard starting in late 2025. A Prismatic Evolutions Umbreon ex (an "ex" card is a stronger, harder-to-pull version of a Pokemon) Special Illustration Rare (an especially detailed, high-rarity art treatment) fell from about $1,600 to $832. An Obsidian Flames Charizard ex went from $126 to $79. Cards are sold sealed, meaning still unopened, in booster packs (a handful of random cards) and booster boxes (a case of those packs), or in Elite Trainer Boxes, a bundle of packs plus accessories: Phantasmal Flames booster boxes dropped from $305 to $275 in ten days, Elite Trainer Boxes fell from $120 to $90, and sealed product generally is down 15% to 25% since March 2025. Independent trackers put modern single cards somewhere between 20% and 50% below their 2024-to-2025 peaks.

{{POKEMON_MODERN_CARDS_IMAGE}}

Vintage cards did the opposite over the same months. The Base Set Charizard above set its own record in December 2025. The Illustrator sale in February 2026 became the most expensive trading card ever sold in any category. Sealed Base Set booster boxes, unopened original packs from 1999, cleared $400,000 at auction. Buyers still spent around $450m on Pokemon cards in the first quarter of 2026, so this is not a market where demand simply disappeared.

The usual explanation is supply. The Pokemon Company printed 11.9 billion cards in the year to March 2024 and 10.2 billion in the year to March 2025, with cumulative production passing 85 billion in May 2026: roughly 40% of every Pokemon card ever made came out in just the last three years.

{{POKEMON_PRODUCTION_CHART}}

A modern chase card (the single most sought-after card in a set, the one everyone hopes to pull) has supply that can grow to meet demand, because the company can simply print more of that set (a new Millennium Print Group printing facility is adding capacity for exactly this). A 1999 card cannot be reprinted.

That is where most commentary on this stops, one step too early.

## Why the "vintage is scarce" argument is weaker than it looks

The print run of a 1999 card is fixed, that much is true. But the print run is not actually what determines its price. What determines the price is the number of copies sitting in a PSA 10 holder (the sealed plastic case a graded card ships in), because that specific object, a card that has already been graded a perfect 10, is what actually trades at the headline prices, and that population is created by a grading company, not by Nintendo.

The PSA population report, the running public count of how many copies of each card PSA has graded at each score, is the data that actually undermines that assumption. Over one recent thirty-day window, Base Set Charmander gained 2,661 newly graded PSA 10s to reach 3,638 total, meaning the number of gem mint copies of a 1999 card grew by around 270% in a single month. Base Set Bulbasaur added 1,860 to reach 2,220, a rise of more than 500%. Charmeleon added 1,261 to reach 1,565. Squirtle added 1,179 to reach 2,131. None of these are modern reprints. They are cards printed in 1999 whose actual tradeable supply more than doubled, in some cases more than quintupled, in under a month.

{{POKEMON_BASE_SET_POP_IMAGES}}

{{POKEMON_PSA_POPULATION_CHART}}

That data deserves a careful read rather than an overreaction. Some of that jump is almost certainly PSA working through a backlog of submissions rather than a steady ongoing rate, and the population report counts each submission, so a card that gets cracked out of its holder and resubmitted can be counted twice. But the direction is not in question: PSA is grading around 90,000 cards a day now, against about 15,000 a day in 2021, and the people who publish this data flag it themselves as fresh supply working its way into a market that assumes scarcity.

What is actually happening is that grading turns a raw card, which nobody has really priced yet, into a graded card, which trades at a specific number. Every ungraded 1999 Charizard sitting in someone's binder is effectively a claim on future supply, and rising prices are exactly what pulls it out and into the graded market. That is a supply curve that responds to price. It is slower and messier than a printing press, but it is not fixed.

The gap becomes obvious once two cards with almost the same number of submissions are compared. The Base Set Charizard has been graded about 101,139 times, and only around 122 of those came back a PSA 10, a gem rate (the share of submitted cards that come back a perfect 10) near 0.1%. The Charizard ex from the 151 set has been graded about 99,517 times, with a gem rate around 28%, close to 28,000 PSA 10s. Same character, almost identical submission numbers, and a gem-mint population more than two hundred times larger for the newer card.

{{POKEMON_151_CHARIZARD_IMAGE}}

{{POKEMON_GEM_RATE_CHART}}

That gap, not the year printed on the card, is the real driver of what someone buying vintage is actually paying for.

Putting that back through Greer's framework: a real bubble needs both no reliable way to check true value, and a genuine limit on supply. Modern cards have the first problem but not the second, which is exactly why their speculative premium unwound so quickly once print runs caught up with demand. Vintage graded cards have the first problem and appear, on the surface, to have the second too, which under Greer's logic actually makes them the segment most exposed to a shift in sentiment, not the safer half. The population data suggests the real supply constraint is looser than the story implies. That does not make vintage a bad place to be. It means vintage has been earning the price premium that comes with fixed supply, while the actual graded supply keeps growing underneath it.

## You cannot really invest in this directly

Even setting the return numbers aside, there is no clean way to actually put money into this market the way you can buy a stock.

Pokemon is owned in roughly equal thirds by Nintendo, Game Freak, and Creatures Inc, run day to day through their joint venture, The Pokemon Company. Nintendo holds 32% of the voting rights. The Pokemon Company's own numbers for the year to February 2026 were a record: net sales of ¥531.4bn, up 29.3%, operating profit of ¥144.0bn, up 43.0%, and net profit of ¥120.1bn, up 70.7%. Profit growing faster than revenue is exactly what you would expect from a licensing business that does not have to spend much extra to earn each additional dollar. Those figures became public through a filing in Kanpo, the Japanese government's official gazette, rather than through a normal investor report, and exactly how revenue and profit get split between The Pokemon Company and its three owners is not disclosed.

Only Nintendo is publicly listed, and it does not break out Pokemon's numbers separately. The one place the card boom shows up in a public stock is Nintendo's "equity method investment income" line (its share of profit from partly-owned businesses like The Pokemon Company), which reached ¥82.8bn in the year to March 2026, roughly triple the year before. That is real exposure to the boom, but it is mixed in with a huge Switch 2 console launch and everything else Nintendo does.

[Nintendo's own stock (NTDOY)](/profile/NTDOY) reflects that blended picture.

The grading side of this market is private too, and consolidating fast. PSA's parent company went private in 2021 for around $853m, backed by an investor group including hedge fund manager Steve Cohen, then raised further money at a $4.3bn valuation by 2022. Its main competitor, CGC, was majority bought by Blackstone's Tactical Opportunities investment arm. Given everything above about grading being the real supply mechanism in this market, the fact that the two companies controlling it are owned by a hedge fund founder and a private equity giant, with no way for an ordinary investor to buy in, is not a small detail.

People have also tried letting investors buy small, tradeable shares of a single expensive card: essentially the same idea as a stock, but for one card. It has mostly gone badly. Otis let people buy fractional shares of a Charizard valued at $236,800; the company was bought by Public.com in 2022 and then shut down, with investors reportedly taking a loss. Collectable, a platform structured as a small-scale public offering under SEC rules, has reported returns of roughly 3.1% a year since it launched, well below the estimated 6% to 8% a year for top-tier cards generally over the same stretch, meaning the actual product built to let people invest in this market has underperformed the market it was tracking, after fees. A third platform, Dibbs, abandoned the fractional-ownership model entirely in 2024.

The clearest example of how badly this can go is attached to the record sale itself. Before the Illustrator card was auctioned, about 5.4% of it had already been sold off in small shares through a platform called Liquid Marketplace, which then collapsed. Based on the eventual $16.49m sale price, that 5.4% stake would now be worth roughly $890,000. As of April 2026, it remains unresolved whether the people who bought those shares will actually be paid: Logan Paul's side maintains the full proceeds are his. So the single most successful trade in the history of this market left the one group of people who had actually tried to own a piece of it properly caught in a legal dispute over money they may never see.

## Where I land

Strictly by the textbook definition, Pokemon cards are an asset class. They are store of value assets under Greer's framework, they share real economic characteristics with each other, and those characteristics are genuinely different from a stock's or a commodity's. Anyone dismissing them as just a toy is wrong: the production and grading data settles that comfortably. Three decades in, demand is still growing, the franchise's owner just posted its best year on record, and there is real third-party authentication infrastructure underneath this market rather than self-reported numbers.

As something to actually put money into, I do not think the case holds up treating this as one single asset class the way "buy the S&P 500 and hold it" treats the stock market. The headline return figure comes from a stale-priced, equal-weighted index built only from cards that happened to sell, in a market where people sell their winners and quietly keep their losers. The one real academic correction available for that kind of bias, from a much better documented market, cut annual returns by four percentage points and cut risk-adjusted returns by three quarters. Round-trip buying and selling costs alone require close to 37% price appreciation just to break even. Every other established collectible category with a long track record has been flat or falling for three years running.

My actual view is that "is Pokemon overvalued" is close to being the wrong question, because it treats the whole market as one thing when the data above shows it clearly is not. Real judgment here means looking card by card and set by set, not index by index, at which specific characters and cards people genuinely want to keep owning versus which ones are riding a single hyped set. Modern chase cards have shown exactly how fast that kind of hype can reverse: an Umbreon ex Special Illustration Rare fell 48% in a matter of weeks, and a Charizard ex from a different modern set lost more than a third of its value over the same stretch. That is not a stable place to put money. It is a market repricing a chase card the moment collectors move on to whatever set comes next.

Vintage cards, and especially sealed, unopened vintage product, have behaved differently, at least so far. The same months that punished modern chase cards saw the Base Set Charizard set a new all-time high, the Illustrator become the most expensive trading card ever sold in any category, and sealed 1999 Base Set booster boxes clear $400,000 at auction. If I were putting money into this space at all, that is where I would look first: established, high-grade vintage singles and unopened vintage product, not whatever set just launched.

But I would not treat that as a permanent rule, and this is the part most people writing enthusiastically about vintage right now seem to miss. The population data earlier in this piece is a real warning sign specifically for vintage: the number of gem-mint copies of a 1999 card is growing fast, even though the print run itself cannot. Vintage has earned real trust over the past few years, but the one thing actually underpinning that trust, a fixed, countable supply, is quietly less fixed than the price charts suggest.

## Sources

- [What is an Asset Class, Anyway? — Robert Greer, Journal of Portfolio Management, 1997](https://www.pm-research.com/content/iijpormgmt/23/2/86)
- [The Superclasses of Assets Revisited — J.P. Morgan Center for Commodities, 2018](https://www.business.ucdenver.edu/faculty-research/research-institutes/commodities-institute/publications/digest)
- [Does it Pay to Invest in Art? A Selection-Corrected Returns Perspective — Korteweg, Kraussl, and Verwijmeren, Review of Financial Studies](https://academic.oup.com/rfs/article/29/4/1007/1843376)
- [How Costly is the Fall From Fashion? Survivorship Bias in the Painting Market — Goetzmann, 1996](https://www.nber.org/papers/w4986)
- [Collectibles: Trading Cards and the Price of Perfection — Andrew Keenan, CAIA Association, December 2021](https://caia.org/blog/2021/12/02/collectibles-trading-cards-and-price-perfection/)
- [Card Ladder index and value methodology](https://cardladder.zendesk.com)
- [Pokemon Cards Beat the S&P 500 by 2.5x, But the Math Is a Lie — 24/7 Wall St., 18 July 2026](https://247wallst.com/investing/2026/07/18/pokemon-cards-beat-the-sp-500-by-2-5x-but-the-math-is-a-lie/)
- [Are collectibles a viable asset class? The buyer of the $16.5 million Pokemon card thinks so — CNBC, 25 February 2026](https://www.cnbc.com/2026/02/25/pokmon-card-winner-scaramucci-says-collectibles-are-asset-class.html)
- [Knight Frank Wealth Report 2026 and Luxury Investment Index, April 2026](https://www.knightfrank.com/wealthreport)
- [Art Basel and UBS Global Art Market Report 2026](https://www.artbasel.com/about/initiatives/the-art-market)
- [The Pokemon Company FY2026 results, filed in Kanpo — reported by Dr. Serkan Toto, 1 June 2026](https://www.serkantoto.com/2026/06/01/pokemon-company-financial-numbers-2/)
- [Collectors Holdings (PSA parent) $4.3bn valuation — Sportico](https://www.sportico.com/business/finance/2022/collectors-chernin-cohen-1234670529/)
- [Blackstone acquires CGC's parent — press release](https://www.blackstone.com/news/press/blackstone-tactical-opportunities-to-acquire-the-certified-collectibles-group-a-leading-provider-of-tech-enabled-authentication-grading-and-conservation-services-for-the-global-collectibles-industry/)
- [Logan Paul's Pikachu Illustrator sells for record $16.5M at auction — KSAT](https://www.ksat.com/entertainment/2026/02/16/logan-pauls-pikachu-illustrator-pokemon-card-sells-for-record-165m-at-auction/)
- [PSA population data via CardTrack and GemRate, 2026](https://www.gemrate.com)
- [Trading card portfolio returns 2021 to 2023 — College of Wooster independent study, 2024](https://openworks.wooster.edu/independentstudy/10979/)
- [PokemonPriceTracker, Nerdbeak, and PullRate market reporting, 2026](https://www.pokemonpricetracker.com)
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
      title: "SKHY (SK Hynix ADR) vs. Micron, indexed to 100 on 10 July 2026 (SKHY's Nasdaq debut)",
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
          label: "Micron (MU), unlevered US peer",
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

Both banks published labor-market studies in 2026 that scored occupations by how exposed they are to AI, separating jobs that can be largely *substituted* by AI (their example: proofreader) from jobs that are *complemented* by it (their example: doctor, work that leans on judgment, accountability, and interpersonal interaction AI cannot replace).

Goldman's finding: AI exposure has genuinely moved the unemployment rate in both directions at once, a **0.16 percentage point rise** in unemployment in easily-substituted occupations, versus a **0.06 point fall** in unemployment in AI-augmented occupations. Morgan Stanley ran a similar analysis and reached a similar order of magnitude: AI has added **at most 10 basis points** to the overall unemployment rate so far. Small in aggregate, but not nothing, and clearly uneven across job types.

## Where that leaves research and analyst roles specifically

Within banking itself, Goldman, Morgan Stanley, and JPMorgan have all said publicly that AI is augmenting analysts rather than replacing them so far. The way it shows up is banks getting more output per person, not cutting headcount outright. Two concrete, more specific data points sit underneath that:

- Some firms have reportedly trimmed their entry-level analyst class sizes by an estimated **10-20%**, a real, if modest, effect on the number of junior seats available, even without wholesale replacement of existing analysts.
- Routine, well-defined tasks (pitch-book drafting, first-pass document review) are the parts genuinely being automated first. That tracks with the substitutable-vs-augmented framing above: the more standardized a task, the more exposed it is.

## The honest caveat on the more dramatic claims

Some industry commentary (mostly from AI-research-tool vendors themselves) makes bigger claims. One vendor blog I found while researching this cited hedge funds using generative AI achieving "3-5% higher annualized returns" than non-adopters. I am not including that as a fact here: a company selling AI research tools has an obvious commercial interest in that framing, and I could not find it corroborated by an independent source. Worth remembering that "AI and finance" content is itself a hype-prone category, exactly the kind of gap between what is promised and what is shown that this site's own Hype vs Fundamentals module is built to flag.

## My actual read

For someone starting out in this industry, the useful question is which parts of the job are shrinking and which are not: the standardized parts (pitch-book drafting, first-pass document review) are the ones going first, and the judgment, interpretation, and client-facing parts are where the value, and the entry-level seats, will concentrate.

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
    tagline: "LSE: DPLM: a quality compounder that just posted a 42% operating-profit quarter",
    date: "2026-08-13",
    body: `# Diploma PLC (LSE: DPLM)

**The trigger:** A Q3 FY2026 trading update (nine months to 30 June 2026) showing operating profit up roughly 42% year-to-date, with full-year guidance raised again, on top of the earlier £236m Peerless Aerospace Fastener acquisition.

## What it is

A UK-listed distributor of unglamorous, mission-critical technical products, specialty seals, industrial controls, life-sciences consumables, organized across three divisions (Seals, Controls, Life Sciences), grown mostly through serial bolt-on acquisition of small, founder-owned distributors.

## The thesis

Diploma is a textbook "quality compounder": a business that does not sound exciting but has compounded shareholder returns for two decades by buying small distributors at reasonable multiples, retaining their existing management, and scaling procurement centrally behind the scenes. As of mid-August 2026 the stock trades around 7,590p, close to a fresh 52-week high, inside a 52-week range of 4,970p–7,663p. The third quarter alone delivered 15% organic revenue growth, with acquisitions adding a further 6 points to reported growth, and operating profit is up roughly 42% for the nine months to 30 June 2026 (adjusted; the H1 statutory increase was 18%, a gap I come back to below); management raised full-year guidance again, to 14% organic revenue growth (from 12%) and a circa 26.5% operating margin (from circa 25%). The CDM acquisition, completed 25 June 2026, strengthens the group's US interconnect operations with a specific tilt toward defense customers, alongside the earlier Peerless Aerospace Fastener deal (2024), extending the model further into aerospace and defense-adjacent distribution, a second, less obvious way to gain exposure to the European/US rearmament cycle beyond prime contractors. The next scheduled catalyst is full-year results on 17 November 2026.

Two honest complications before the bull case. First, the growth is less broad-based than the headline suggests: management itself discloses that the portfolio excluding Peerless grew organic revenue at a high single-digit rate in H1, well ahead of the 5% model but well below the 15% headline, and it has guided to "some moderation in Peerless performance towards more typical growth rates" in H2. One hot acquisition is doing real work in the standout number. Second, the price already believes a lot. At 7,590p the market cap is about £10.2bn, roughly 25x LTM EBITDA, and my own quick DCF arithmetic (9% cost of equity, 2.5% terminal growth) needs year-1 growth of around 23-25% to justify it, against guidance of 14%. The pitch is not "is this a good business," it plainly is. The pitch is whether the compounding can stay far enough above what is already priced in.

## The evidence in their own numbers (H1 2026 filings)

The H1 2026 results and investor presentation (six months to 31 March 2026, published 19 May 2026) document the compounding machine directly, and they are the best primary evidence for each leg of the thesis. The FY2025 exacts are now disclosed: revenue £1,524.5m, adjusted operating profit £342.7m (a 22.5% margin), adjusted EPS 176.0p, which makes LTM revenue to March £1,647m. The street anchor is disclosed by the company itself: analyst consensus for FY26 adjusted operating profit was £428m as at 18 May 2026, and the upgraded guidance (operating profit growth of over 30%) sits about 6% above it.

- **The M&A track record, quantified:** 57 acquisitions since 2019 for £1.6bn, collectively generating over 20% return on capital. The last twelve months stepped up to 15 deals for c.£310m at an **average 8x EBIT multiple** (7 since the Q1 update for c.£180m at \~9x), a fraction of Diploma's own trading multiple, which is precisely the arbitrage a disciplined roll-up runs on. Those 15 businesses are expected to add c.£40m of annualised operating profit. The deal-by-deal evidence is in the table below.
- **Returns and cash, stated honestly:** H1 ROATCE of 22.7% (+360bps), against their own "high teens" optimal range and a 20% return requirement on acquisitions. The definition itself is conservative: the capital-employed denominator includes historic goodwill and past acquisition charges, so the 22.7% is not flattered by write-off accounting. Free cash flow of £110.7m converts at 76%, optically below the 90% model target, but the dip is explained rather than alarming: H1 is seasonally weaker (78% in H1 25), and working capital rose £58.9m partly because businesses deliberately secured inventory against potential Middle East supply-chain disruption. Five-year average conversion is 100%.
- **The division doing the work:** Controls grew +26% organically at a 33.5% adjusted margin (+430bps) on aerospace, defence, datacentre and energy demand, with Peerless (acquired March 2024 for £236m; its stated ~+8% year-one EPS accretion target was already delivered, per FY2025 results) still singled out for "continued outstanding performance" nearly two years in. Windy City Wire grew +16%, in line with its 17% post-acquisition average. The honest caveat, disclosed by the CEO himself: excluding Peerless, the portfolio grew high single-digit organic. That is still comfortably ahead of the 5% financial model, which says something real about portfolio quality, but it also means one now-mature acquisition is doing genuine work in the headline number, and management itself guides to Peerless moderating "towards more typical growth rates" in H2.
- **The stated financial model:** 5% organic growth as first priority, acquisitions accelerating total growth to \~10%, 20%+ operating margins, double-digit EPS growth, 90% cash conversion, high-teens returns, <2.0x leverage, and a progressive dividend growing \~5% a year (the interim dividend rose exactly 5%, to 19.1p). Five-year record against it: revenue +23% CAGR, adjusted EPS +26% CAGR, ROATCE 18.6% average, 100% average cash conversion — and an annualised TSR of 21.4% versus 10.2% for the FTSE All-Share.
- **The firepower behind the runway:** leverage of 0.8x against a <2.0x policy (covenants at 3.5x), and total liquidity headroom of £639.7m — £571m of undrawn committed facilities plus £68.7m cash, after they added a fresh £100m bilateral RCF during the period. Borrowing costs are locked and boring by design: a 5.3% blended rate, with the private-placement notes fixed between 4.18% and 5.52% out to 2036. At their own \~8x average deal multiple, that headroom funds years of acquisitions at the current pace without the balance sheet ever becoming the story.

## The acquisition engine, deal by deal

Aggregate statistics are how roll-ups hide. The filings name every deal, so here they are — the six completed in H1 (note 10 of the results), the four completed after period end (note 15), and the one that matters most:

| Deal | Completed | Sector | Investment | Pro forma revenue | Pro forma adj. op profit |
|---|---|---|---|---|---|
| WDS Components (UK OEM parts) | Nov 2025 | Controls | £21.8m | £4.4m | £1.2m |
| Spring Industrial | Nov 2025 | Controls | part of £43.7m pool | £4.3m | £1.4m |
| Swift Aerospace (UK/France/Malaysia fasteners) | Dec 2025 | Controls | £19.1m | £13.3m | £2.3m |
| Hydraulic Seals Australia | Dec 2025 | Seals | part of pool | £4.2m | £1.2m |
| Selwyn (Tack Interconnect) | Mar 2026 | Controls | part of pool | £1.2m | £0.2m |
| C&C Packings (US, Hercules OEM) | Mar 2026 | Seals | part of pool | £2.4m | £0.8m |
| SINUS Electronic (asset deal, Techsil Germany) | Apr 2026 | Controls | part of c.£45m | — | — |
| Modul Nordic (Norway, medtech) | Apr 2026 | Life Sciences | part of c.£45m | — | — |
| Abbey Seals (Ireland, 90%) | Apr 2026 | Seals | part of c.£45m | — | — |
| FC Lane (Lodge Group / Weald Electronics) | May 2026 | Controls | part of c.£45m | — | — |
| **CDM (US interconnect, defence-tilted)** | signed Apr 2026, completed Jun 2026 | Controls | **c.$170m (c.£125m) at c.11x EBIT** | c.$80m | — |

Read the multiples as a ladder: 8x average across the LTM, \~9x on the seven most recent, c.11x for CDM. Two readings are both true. The bull reading: even at 11x, CDM is priced at a fraction of Diploma's own \~25x EV/EBITDA, so the buy-low/sell-high arbitrage that powers the whole model still holds on every deal. The bear reading: the average is drifting up, and the largest deal of the year is the most expensive — a deliberate, strategic premium for US defence exposure. The discipline question is now answered deal by deal, and the 20% return hurdle on acquisitions is the dated, checkable test.

Two honest costs of the machine, straight from the accounts. Acquisition-related charges were £43.8m this half (versus £17.5m a year ago): £32.4m of intangible amortisation plus £7.4m of deal costs, and acquisition-related finance charges jumped to £11.3m from £1.7m as deferred consideration and earnout remeasurements unwind. That is why adjusted EPS grew 36% while basic statutory EPS grew 4% (74.7p). The adjustments are standard for a serial acquirer, but at some point a sceptic asks whether amortisation of acquisitions is simply a recurring cost of this business model, and the answer has to be prepared, not improvised. And on the balance sheet: goodwill plus acquisition intangibles now stand at £1,104.6m against £1,052.2m of shareholders' funds, so tangible book value is negative. Fine while deals perform; it is the entire impairment tail-risk if a big one does not.

## What the economy is doing to this stock

The results read like a map of the current economy, and the pitch should say so:

- **Tariffs: evidence of real pricing power.** North American Seals grew 7% organically with "confident pricing actions, effective tariff recovery, and continued market share gains", while the going-concern statement names the continued tariff environment as a live risk. Diploma is passing tariff costs through to customers and still gaining share. That is the single best defence of the 24.5% margin in the document, and it separates Diploma from companies whose "pricing power" only works in good times.
- **Rearmament is physical, not rhetorical.** IS Group's new Czech Republic distribution centre exists to serve "the German defence and energy markets" and is already driving double-digit growth; Clarendon's new German facility is accelerating growth; Swift Aerospace adds European defence supply-chain access; CDM tilts a US interconnect business toward defence customers. The company is building infrastructure around the European/US rearmament cycle. Note the friction too: CDM sat in regulatory approval for two months — defence-facing deals now carry process risk, and more of the pipeline will face it as the defence exposure grows.
- **The AI buildout shows up in unglamorous places.** Windy City Wire's +16% organic growth (17% average since acquisition) is explicitly driven by datacentres and digital antenna systems. Even Seals' cyclical weak spot, VSP, is offsetting soft industrial and transportation demand with wins in nuclear and datacentres. The picks-and-shovels exposure runs across two divisions, not one.
- **The UK is the weak link.** R&G's markets (construction, oil & gas, agriculture) are soft and infrastructure projects are being delayed; International Seals' organic revenue actually declined 1%. Life Sciences slowed to +4% organic (from +6%) on "challenging healthcare markets". The domestic and healthcare softness is real, and it is being carried by North America and defence-adjacent demand.
- **FX is the silent headwind.** About 80% of revenue is earned outside the UK, and sterling strength knocked £17.9m off revenue and £7.6m off adjusted operating profit on translation this half. Guidance is quoted at constant currency, so reported GBP numbers will lag the operational story if sterling keeps rising. Not a thesis-breaker, but the one mechanical risk that shows up in reported numbers before anyone talks about it.
- **The Middle East conflict is already in the cash flow.** Part of the £58.9m working-capital build was deliberate inventory securing against potential supply-chain disruption from the conflict. It cost some cash conversion this half and bought resilience. That is what risk management looks like in an accounts line.

## Key risk

The model depends on continuing to find and integrate acquisitions at sensible prices. It is, structurally, a roll-up, and roll-ups deteriorate when they overpay, integrate poorly, or run out of good targets. The warning signs to watch are specific, not generic: the average multiple paid has ticked from 8x (LTM) to \~9x (most recent seven) to c.11x on CDM; the gap between the 15% organic headline and the high-single-digit ex-Peerless figure implies a large share, plausibly approaching half, of the group's organic growth traces to one acquisition that management itself says will moderate; the gap between adjusted and statutory profit is widening with each deal (£43.8m of acquisition charges this half); and goodwill now exceeds shareholders' funds, so a serious deal failure would hit an intangible-heavy balance sheet directly. After this latest re-rating to \~25x EV/EBITDA, the premium valuation prices in continued execution on all of it. The dated, checkable tests: Peerless's guided H2 moderation, CDM's integration against its 11x price, the multiple paid on each newly announced deal, and whether H2 organic growth holds double digits once Peerless cools.

**Sources:** [Diploma Q3 FY2026 trading update](https://www.tradingview.com/news/reuters.com,2026-07-16:newsml_RSP5243Ma:0), [Diploma H1 2026 results and investor presentation](https://www.diplomaplc.com/investors/financial-presentations/) (19 May 2026 — multiples, ROATCE, divisional detail, financial model), [Diploma share price and 52-week range](https://finance.yahoo.com/quote/DPLM.L/), [Peerless Aerospace Fastener acquisition, official RNS announcement](https://www.investegate.co.uk/announcement/rns/diploma--dplm/acquisition/8108565) (27 March 2024)
`,
    toolkit: `## Pitch deck template
Download the [Diploma PLC pitch-deck template (.pptx)](/api/pitch-template?id=diploma-plc&code=vq55jh68%26*): 14 slides modeled on the Varsity/OAF competition-winning decks — claim-style titles, dense charts, colour-coded bear/base/bull, a market-expectations slide, and Q&A-proof appendices. Nothing is pre-filled: every [INSERT] prompt tells you exactly what to research, where to find it, and where it goes on the slide.

Download the [Diploma PLC valuation workbook (.xlsx)](/api/pitch-template?id=diploma-plc&code=vq55jh68%26*&type=xlsx): 5-year DCF with live Bear/Base/Bull scenarios, a WACC build, a reverse-DCF tab, a comps tab, and a Sources tab. Yellow cells = you fill in (each row names its source). Blue cells = formulas, don't touch. Every number in your deck must come from this file, never retyped.

## DCF starting inputs
Real, sourced figures to build from — pull the rest (live share price, beta) fresh, since this page is a dated snapshot, not a live feed:
- Share price \~7,590p as of mid-August 2026 (52-week range 4,970p–7,663p)
- H1 FY2026 (six months to 31 March 2026): revenue £851.1m (+17%, +15% organic); adjusted operating profit £208.9m (margin 24.5%); adjusted EPS 109.2p (+36%); free cash flow £110.7m (76% conversion)
- FY2025 (year ended 30 September 2025, audited, per the H1 26 report): revenue £1,524.5m; adjusted operating profit £342.7m (22.5% margin); adjusted EPS 176.0p. LTM revenue to March 2026: £1,647m
- **Street anchor:** analyst consensus FY26 adjusted operating profit **£428m** (as at 18 May 2026, disclosed in the H1 26 report itself) — upgraded guidance implies ~£450m+. This is the comparison for your reverse-DCF
- **Net debt: £343.9m** (31 March 2026; leverage 0.8x vs a <2.0x policy)
- **Weighted average shares: 134.2m; effective tax rate 25.0%** (H1 2026)
- **ROATCE: 22.7%** — compare against your computed WACC for the capital-allocation thesis (note the definition is conservative: capital employed includes historic goodwill)
- M&A track record: 57 deals since 2019 for £1.6bn at >20% collective returns; LTM 15 deals for c.£310m at **\~8x average EBIT multiple** (7 most recent at \~9x; CDM at c.11x — the multiple ladder is the discipline debate)
- Nine months to 30 June 2026: Q3 organic revenue growth +15%, acquisitions added a further 6 points to reported growth; operating profit \~+42% year-to-date
- FY2026 guidance (raised in the Q3 update): organic revenue growth 14% (from 12%), operating margin circa 26.5% (from circa 25%)
- CDM acquisition completed 25 June 2026: strengthens US interconnect operations, defense-market tilt
- Peerless Aerospace Fastener acquisition: announced March 2024, £236m, \~+8% EPS accretion targeted for year one and already delivered per FY2025 results; H1 FY2026 commentary, nearly two years in: "continued outstanding performance," now guided to moderate
- Next scheduled catalyst: full-year results, 17 November 2026
- WACC inputs: use the current 10-year UK gilt yield as your risk-free rate; pull Diploma's beta from stockanalysis.com or a data terminal. Do not guess a beta.

## Primary filings
- [London Stock Exchange news explorer](https://www.londonstockexchange.com/news?tab=news-explorer): search "Diploma" for every RNS (regulatory news) release: trading updates, results, acquisition announcements, directors' dealings.
- [Diploma plc investor relations](https://www.diplomaplc.com/investors): annual reports, interim results, investor presentations.
- [Companies House](https://find-and-update.company-information.service.gov.uk/): UK statutory filings for Diploma and any UK acquisition target you want to check.

## News to track
Financial Times (UK mid-cap coverage), Investors' Chronicle, Proactive Investors, and Sharecast all cover UK-listed industrials like Diploma regularly and are free or have generous free previews.

## Comps and data
Diploma has no direct UK-listed pure-play peer. Build your comp set from Bunzl (LSE: BNZL, another UK distribution "compounder") and US names like Fastenal (NASDAQ: FAST) and W.W. Grainger (NYSE: GWW). Pull multiples from **stockanalysis.com** or **macrotrends.net** (both free, no login).

## Build it yourself — the full walkthrough (first-timer edition)
Never built a pitch before? Follow these steps in order. Total time: roughly one focused weekend.

**Step 1 — Get the raw filings (\~1 hour).**
- Open the [LSE news explorer](https://www.londonstockexchange.com/news?tab=news-explorer), search "Diploma", and scan the last 12 months for the **latest trading update / interim results** and the **CDM acquisition announcement** (genuinely 2026). Note: RNS announcements are filed under the acquirer's name (Diploma), never the target's, so searching "CDM" directly on LSE won't find anything.
- From the trading update, write down: organic revenue growth, division-level margins, and net debt.
- Peerless is older background, not a recent filing: it was announced in March 2024 and completed that May, so its own RNS sits well outside a 12-month scan. Search for it directly, and write down price paid, the accretion target, and how it was financed — then check the FY2025 results for whether that target was actually hit.
- Open the latest annual report from [Diploma IR](https://www.diplomaplc.com/investors). Find: full-year revenue, operating profit/margin, effective tax rate, D&A, capex, change in working capital (cash-flow statement), and shares outstanding.

**Step 2 — Fill the workbook's Inputs tab (\~30 min).**
- stockanalysis.com → search "Diploma" → quote page for the live price; Statistics page for shares outstanding and beta.
- Bank of England website → current 10-year gilt yield → your risk-free rate.
- Every yellow input row names its source. As you fill each one, log it on the **Sources** tab (value, source, date) — this becomes the deck's Appendix D later, so do it as you go, not at the end.

**Step 3 — Read your target price, then stress-test your stance (\~15 min).**
- The **DCF** tab's summary block gives Bear/Base/Bull values per share and a probability-weighted target. (The **Scenarios** tab holds the editable multipliers — you will be asked to defend them.)
- **Stance check:** target above today's price → LONG. Below → the honest pitch is AVOID or SHORT — the Altria reference deck won OAF *as a short*. Never present a long whose target sits below the price.
- **Units check:** UK shares price in pence, financials in £m. A target that looks \~100x wrong is a units slip.
- **Range check:** compare your target to the 52-week range (re-pull it — don't trust the snapshot above). Outside the range needs a very good reason.

**Step 4 — Reverse DCF: the slide that wins competitions (\~20 min).**
- On the **Reverse DCF** tab, follow the Goal Seek instructions: you solve for the growth rate that makes your Base-case value *equal today's price*. That is "what the market is pricing in".
- Fill the table: Metric | Historical | Implied by price | Your forecast | Gap — for revenue CAGR, operating margin, EPS growth. This table becomes the deck's **Market Expectations** slide, and your whole pitch is the argument about that gap.

**Step 5 — Build three theses, each with one dense proof chart (the bulk of the work).**
1. **The M&A engine:** from past annual reports, count acquisitions per year and plot revenue and EPS over 10-20 years — or build a table of Diploma's own past deals (year / target / price / multiple / accretion) from the RNS archive. A roll-up's own deal history is the strongest evidence that exists.
2. **Aerospace/defense expansion:** the Peerless deal economics from Step 1, plus a defense-spending trend chart (NATO, UK MoD, or Statista) showing the tailwind the deal buys into.
3. **Capital allocation:** chart ROIC vs WACC over 10 years (ROIC ≈ NOPAT ÷ (equity + debt − cash), computed per year from annual reports), plus an organic-vs-acquired revenue split from results statements — proves the engine isn't only acquisitions.
- Slide titles are **claims**, not labels: "A 20-year bolt-on engine that has never overpaid through a cycle", not "Thesis 1".

**Step 6 — The bear case and your rebuttal (\~45 min).**
- Find the strongest bearish argument you can (search for Diploma valuation concerns; check the P/E against its own history). Write it as convincingly as you can — steelman, don't strawman.
- Rebut with numbered points, each tied to a *checkable fact* or a *dated future event* — e.g. whether Peerless's growth actually moderates as guided is testable at the next trading update, and CDM's integration against its ~11x price is a live, unresolved test.

**Step 7 — Comps (\~45 min).**
- Fill the **Comps** tab for Bunzl, Fastenal, Grainger (+ an optional 4th you can justify): EV/EBITDA, P/E, revenue growth, EBIT margin — all from stockanalysis.com, all pulled the same day. The median row computes itself.
- Prepare one sentence: "Diploma deserves a premium/discount to the median because…" (answer with growth, margin, and ROIC differences).

**Step 8 — Appendix armor (\~30 min).**
- **Porter's Five Forces:** one line each, rated High/Med/Low.
- **Management & insiders:** insider ownership % (annual report), recent directors' dealings (LSE RNS), and what executive comp rewards (remuneration report). These two slides decide Q&A.

**Step 9 — Assemble the deck (\~2 hours).**
- Copy every number from the workbook — never retype. Every [INSERT] prompt on the slides says exactly what goes there.
- Slide 2 needs a 12-month price chart vs the FTSE 250 with the Q3 trading update and CDM completion dates annotated — screenshot or rebuild it from stooq.com data. Peerless predates a 12-month window, so it belongs in the M&A-history slide, not this chart.
- The valuation slide's Bear/Base/Bull chart comes from the workbook's summary block, colour-coded.

**Step 10 — The morning you present.**
- Re-pull the live quote. Confirm target vs stance consistency. Units checked. Sources tab complete. Practice defending WACC and your scenario weights out loud — and keep the workbook open during Q&A so you can walk a judge through a formula live.`,
  },
  {
    id: "nintendo",
    title: "Nintendo",
    tagline: "TYO: 7974: record results, a 53% drawdown, and a real hype-vs-fundamentals gap running in reverse",
    date: "2026-08-05",
    body: `# Nintendo (TYO: 7974)

**The trigger:** A June 2026 Nintendo Direct showcase that leaned on a Zelda remake and ports rather than a new flagship title, sending shares down more than 10% in a single session, despite Nintendo simultaneously reporting its strongest fiscal year on record.

## What it is

The Japanese gaming hardware and software company behind Switch/Switch 2, and one of three joint-venture partners (with Game Freak and Creatures Inc.) in The Pokemon Company, which manages the games, anime, and trading card game globally.

## The thesis

This is a genuine case where the fundamentals and the share price are telling opposite stories. Nintendo's FY26 (year to March 2026) net sales nearly doubled, up 98.6% year-on-year to ¥2.313 trillion, driven by Switch 2 (19.86 million units sold in its first 10 months, the fastest-selling console in the company's history) and Pokemon-branded software. The Pokemon Company itself reported $3.33bn revenue and $752m net profit for the year to February 2026, one of the franchise's strongest years on record. Despite that, the stock is down roughly 53% from its 52-week high. Two dated, specific catalysts explain the gap: a memory-chip price surge (linked to the same AI-infrastructure buildout competing for DRAM/NAND supply) pushed up Switch 2's bill of materials and forced a price hike in May 2026, and the June 2026 Direct disappointment described above. Together they have pushed the stock to price in a weaker forward outlook than the current operating numbers support. A first-quarter earnings beat reported in early August 2026 (revenue ¥517.8bn, operating profit up 150.5% to ¥142.6bn, more than double the average analyst estimate) sent the stock up nearly 5% in a single session, early evidence that this gap can close when results are strong enough, though full-year guidance was left unchanged rather than raised.

## Key risk

Console cycles are lumpy and hit-driven. Nintendo's model depends on hardware attach rates and a strong first-party software pipeline, and the market has just demonstrated how fast sentiment moves when that pipeline looks thin, even against genuinely strong current results.

**Sources:** [Nintendo FY26 financial results](https://nintendoeverything.com/nintendo-financial-results-may-2026-switch-2-at-19-86-million-units-switch-at-155-92-million-more/), [Pokemon's best year ever](https://gamerant.com/pokemon-2026-highest-sales-ever/), [Nintendo share price decline on price hike](https://www.cnbc.com/2026/05/11/nintendo-stock-switch-2-price-rise-weak-sales-forecast.html), [June 2026 Direct disappointment](https://gamerant.com/nintendo-stock-price-down-why-february-2026/), [Nintendo's early-August 2026 earnings beat](https://www.benzinga.com/markets/earnings/26/08/61010940/nintendo-says-ai-memory-inflation-could-add-nearly-700-million-in-costs)
`,
    toolkit: `## Pitch deck template
Download the [Nintendo pitch-deck template (.pptx)](/api/pitch-template?id=nintendo&code=vq55jh68%26*): 14 slides modeled on the Varsity/OAF competition-winning decks — claim-style titles, dense charts, colour-coded bear/base/bull, a market-expectations slide, and Q&A-proof appendices. Nothing is pre-filled: every [INSERT] prompt tells you exactly what to research, where to find it, and where it goes on the slide. Nintendo's unusually low beta is cross-checked guidance inside, not a data error — open the workbook rather than trusting any single data provider's number.

Download the [Nintendo valuation workbook (.xlsx)](/api/pitch-template?id=nintendo&code=vq55jh68%26*&type=xlsx): 5-year DCF with live Bear/Base/Bull scenarios, a WACC build, a reverse-DCF tab, a comps tab, and a Sources tab. Yellow cells = you fill in (each row names its source). Blue cells = formulas, don't touch. Every number in your deck must come from this file, never retyped.

## DCF starting inputs
Real, sourced figures to build from: pull the rest (live share price, shares outstanding, net debt, beta) fresh:
- FY26 (year to March 2026) net sales: ¥2.313tn, +98.6% year-on-year
- Switch 2 unit sales: 19.86m in its first 10 months
- The Pokemon Company FY (to Feb 2026): $3.33bn revenue, $752m net profit
- Share price down \~53% from its 52-week high, despite the above
- WACC inputs: use the current 10-year Japanese government bond (JGB) yield as your risk-free rate; pull Nintendo's beta from stockanalysis.com or a data terminal.

## Primary filings
- [Nintendo IR (English)](https://www.nintendo.co.jp/ir/en/): quarterly/annual financial results, investor presentations, and the actual FY26 results deck.
- [EDINET](https://disclosure2.edinet-fsa.go.jp/): Japan's official disclosure system (like SEC EDGAR), for the underlying statutory Japanese filings if you want to go past the English summary.

## News to track
Nikkei Asia and Bloomberg's Japan/gaming desks cover Nintendo's numbers directly; VGC (VideoGamesChronicle) and Automaton are the best English-language sources for the software-pipeline/Direct-showcase side of the story specifically.

## Comps and data
No exact peer (Nintendo is hardware + first-party software + a licensing stake, which is unusual), but Sony's Games & Network Services segment (within 6758.T) and pure software publishers (Take-Two, EA) are the closest reference points for multiples. Pull from **stockanalysis.com**.

## Build it yourself — the full walkthrough (first-timer edition)
Never built a pitch before? Follow these steps in order. Total time: roughly one focused weekend.

**Step 1 — Get the primary documents (\~1 hour).**
- [Nintendo IR](https://www.nintendo.co.jp/ir/en/) → the actual FY26 results presentation (not the press summary). Write down: net sales, operating profit, segment margins, Switch 2 unit trajectory, software attach rate.
- The Pokemon Company's figures come from its own reporting — Nintendo is one of three JV partners, so cite it as a stake, never as consolidated revenue.
- Note the two dated catalysts precisely: the May 2026 price-hike announcement and the June 2026 Direct showcase. Their dates matter — you will annotate them on your chart.

**Step 2 — Fill the workbook's Inputs tab (\~30 min).**
- stockanalysis.com → 7974 (Tokyo): live price in ¥, shares outstanding, beta. Cross-check the beta against a second source — Nintendo screens unusually low (net cash + the Pokemon annuity), and that is exactly the kind of thing judges probe.
- Risk-free: the current 10-year JGB yield. Quote divisor stays at 1 — everything is JPY, no pence conversion.
- Log every input on the **Sources** tab (value, source, date) as you go — it becomes Appendix D.

**Step 3 — Read your target, then stress-test your stance (\~15 min).**
- DCF tab summary gives Bear/Base/Bull per share and a weighted target. Stance check (long = target above price), units check, and a range check against the 52-week high/low — remember the stock is \~53% below its high, so decide explicitly whether your pitch is "the drawdown is overdone" or "the drawdown is deserved".

**Step 4 — Reverse DCF (\~20 min).** Use the Reverse DCF tab's Goal Seek instructions to find the growth the *current* price implies — after a 53% drawdown that may be an implied *decline*. Fill Metric | Historical | Implied by price | Your forecast | Gap for revenue CAGR, margin, EPS growth. That table is the Market Expectations slide.

**Step 5 — Build three theses, each with one dense proof chart (the bulk of the work).**
1. **Record fundamentals:** revenue and operating profit over 10 years from the FY26 deck — the strongest year on record, priced like a bad one.
2. **Two dated, fixable catalysts:** DRAM/NAND spot-price trend (TrendForce/DRAMeXchange) against the Switch 2 bill-of-materials commentary, plus how the stock reacted to past Directs — showcase sentiment is the swing factor, and it is a dated, recurring checkpoint.
3. **The IP/Pokemon annuity:** The Pokemon Company's own reported year ($3.33bn revenue, $752m profit) and Nintendo's stake — licensing income versus hardware profit mix, over time.
- Slide titles are **claims**, not labels.

**Step 6 — The bear case and your rebuttal (\~45 min).**
- Steelman the strongest version: record results were a cycle peak, memory costs stay elevated through FY27, and the next showcase underwhelms again.
- Rebut with numbered, checkable points: FY26 is reported fact, BOM pressure is a cost-side event with known resolution paths, and the next Direct is a dated binary catalyst.

**Step 7 — Comps (\~45 min).**
- Comps tab: Sony's Game & Network Services (6758.T), Take-Two, EA. Say explicitly that no true peer exists (hardware + first-party + the Pokemon stake is an unusual mix) — judges respect the honesty.

**Step 8 — Appendix armor (\~30 min).** Porter's Five Forces, one line each, plus Management & Insiders: ownership structure, buyback/dividend policy, and the corporate-governance report's remuneration detail.

**Step 9 — Assemble the deck (\~2 hours).** Copy numbers from the workbook, never retype. Slide 2 needs a 12-month price chart vs the Nikkei or TOPIX with the May price hike and June Direct annotated.

**Step 10 — The morning you present.** Re-pull the live quote. Confirm stance consistency. Be ready to defend the low beta, your terminal growth under hardware-cycle risk, and your scenario weights out loud.`,
  },
  {
    id: "british-american-tobacco",
    title: "British American Tobacco",
    tagline: "LSE: BATS: a live ESG-exclusion case study, freshly backed by a £1.3bn buyback",
    date: "2026-08-05",
    body: `# British American Tobacco (LSE: BATS / NYSE: BTI)

**The trigger:** A £1.3bn 2026 share buyback programme, announced alongside results showing BAT's "New Categories" division (vapes, nicotine pouches, heated tobacco) back to double-digit growth and now profitable.

## What it is

One of the world's largest tobacco companies (Dunhill, Lucky Strike, Vuse, Velo), and a genuine, live example of how ESG exclusion criteria bite in practice at a major asset owner.

## The thesis

BAT is a value-versus-structural-decline argument. Alongside the buyback, its progressive dividend continues (next dividend 61.26p per share), and Velo, its nicotine-pouch brand, has reached a #2 volume/value position in its category within a year of a key launch. Management's own algorithm targets +3-5% revenue, +4-6% profit, and +5-8% EPS growth; 2026 guidance sits at the low end of that range while the company reinvests in the shift away from combustible cigarettes. The stock has historically traded at a low-single-digit-to-low-teens P/E and a high dividend yield, largely because a meaningful share of the market, including sovereign and pension investors bound by exclusion policies, treats it as structurally off-limits or declining regardless of valuation. Norway's Government Pension Fund Global (managed by NBIM) has explicitly excluded tobacco manufacturers since around 2010 on ethical grounds set by its Council on Ethics, one of the clearest real examples of a product-based exclusion removing a large-cap, high-yield name from an investable universe entirely independent of price. Separately, BAT announced in June 2026 a "Fit2Win" restructuring cutting or outsourcing around 9,000 roles globally (excluding its US business, Reynolds American), targeting roughly £600m in annualised savings by the end of 2028, cost discipline layered on top of the buyback and New Categories story above.

## Key risk

Structural decline in combustible cigarette volumes across developed markets is real and permanent. The entire bull case depends on New Categories growing fast enough, and staying profitable enough, to replace that decline before it erodes the dividend.

**Sources:** [BAT FY2026 buyback and dividend guidance](https://www.stocktitan.net/sec-filings/BTI/6-k-british-american-tobacco-p-l-c-current-report-foreign-issuer-65bb444665c2.html), [BAT New Categories/Vuse strategy](https://www.bat.com/media/press-releases/_2026/february/preliminary-results-for-the-year-ended-31-december-2025), [NBIM's ethical exclusions and Council on Ethics](https://www.nbim.no/en/responsible-investment/our-expectations/), [BAT's Fit2Win restructuring announcement](https://www.bat.com/media/press-releases/_2026/june/creating-a-stronger-bat-through-fit2win-transformation-programme)
`,
    toolkit: `## Pitch deck template
Download the [British American Tobacco pitch-deck template (.pptx)](/api/pitch-template?id=british-american-tobacco&code=vq55jh68%26*): 14 slides modeled on the Varsity/OAF competition-winning decks — claim-style titles, dense charts, colour-coded bear/base/bull, a market-expectations slide, and Q&A-proof appendices. Nothing is pre-filled: every [INSERT] prompt tells you exactly what to research, where to find it, and where it goes on the slide. It pairs naturally with the Altria OAF short deck as your built-in bear case — read one against the other. The workbook also includes the dividend-discount cross-check this stock needs.

Download the [British American Tobacco valuation workbook (.xlsx)](/api/pitch-template?id=british-american-tobacco&code=vq55jh68%26*&type=xlsx): 5-year DCF with live Bear/Base/Bull scenarios, a WACC build, a reverse-DCF tab, a comps tab, and a Sources tab. Yellow cells = you fill in (each row names its source). Blue cells = formulas, don't touch. Every number in your deck must come from this file, never retyped.

## DCF starting inputs
Real, sourced figures to build from: pull the rest (live share price, shares outstanding, net debt, beta) fresh:
- 2026 buyback programme: £1.3bn
- Next dividend: 61.26p per share
- Management's own growth algorithm: +3-5% revenue, +4-6% profit, +5-8% EPS
- 2026 guidance: low end of that range
- WACC / cost-of-equity inputs: use the current 10-year UK gilt yield as your risk-free rate; pull BAT's beta from stockanalysis.com. Given how much of BAT's total return is the dividend itself, also build a simple dividend-discount cross-check (current yield + management's guided dividend growth rate) alongside your DCF, not instead of it.

## Primary filings
- [BAT investor relations](https://www.bat.com/investors): annual report, interim results, RNS announcements.
- [London Stock Exchange news explorer](https://www.londonstockexchange.com/news?tab=news-explorer): search "British American Tobacco" for the raw RNS feed.
- [NBIM's own expectation documents](https://www.nbim.no/en/responsible-investment/our-expectations/) and its published exclusion list: the primary source for the ESG-exclusion angle, not a secondhand summary.

## News to track
Reuters and the FT both cover tobacco-sector regulation and earnings directly; for the New Categories/vaping side specifically, trade press like Vapouround and Tobacco Reporter track product launches, illicit-market enforcement, and competitor moves (ZYN/Swedish Match, etc.) in more depth than generalist outlets.

## Comps and data
Peer set: Philip Morris International (PM), Imperial Brands (LSE: IMB), Japan Tobacco (2914.T). Pull margins, growth, and multiples from **stockanalysis.com**; note that BAT's UK primary listing means some US aggregators show only the BTI ADR, which can lag the LSE price.

## Build it yourself — the full walkthrough (first-timer edition)
Never built a pitch before? Follow these steps in order. Total time: roughly one focused weekend.

**Step 1 — Get the primary documents (\~1 hour).**
- [BAT IR](https://www.bat.com/investors) → the latest annual report. Find the exact revenue AND profit split between combustibles and New Categories (Vuse, Velo, glo) — the trend in that split is the whole thesis.
- The buyback announcement RNS: £1.3bn programme details and timeframe.
- [NBIM's exclusion list and expectation documents](https://www.nbim.no/en/responsible-investment/our-expectations/) — confirm BAT's current status DIRECTLY. Exclusion lists are reviewed and change; never cite secondhand.

**Step 2 — Fill the workbook's Inputs tab (\~30 min).**
- stockanalysis.com → BATS: live price (pence — quote divisor 100), shares, beta. Note some US aggregators show only the BTI ADR, which can lag the LSE price.
- Risk-free: current 10-year UK gilt. Log everything on the Sources tab as you go.

**Step 3 — Read your target, then stress-test (\~15 min).** Stance check (long = target above price), units check (pence vs £m), range check. For BAT, add the **dividend-discount cross-check** the workbook flags: current yield + management's guided dividend growth — because for this stock the yield IS much of the total return.

**Step 4 — Reverse DCF (\~20 min).** Goal Seek the growth the current price implies — for BAT it will likely be a modest or negative number. That is the pitch: Metric | Historical | Implied by price | Your forecast | Gap becomes the Market Expectations slide.

**Step 5 — Build three theses, each with one dense proof chart (the bulk of the work).**
1. **The ESG-exclusion discount:** BAT's EV/EBITDA vs global staples over 10 years, plus the NBIM exclusion as primary evidence — a structural discount fundamentals alone cannot explain.
2. **Mechanical per-share compounding:** shares outstanding declining + DPS growing over 10 years; the £1.3bn buyback as % of market cap.
3. **New Categories as underpriced optionality:** the Vuse/Velo/glo revenue and margin trajectory from the annual report — profitable and back to double-digit growth.
- Slide titles are **claims**, not labels.

**Step 6 — The bear case and your rebuttal (\~45 min).**
- Your bear case already exists and it won a competition: the Altria OAF short deck. Read it and steelman it against BAT — price hikes triggering volume erosion, smokeless lost to competitors, dividend obligations trapping management.
- Rebut per point: BAT's New Categories are already profitable, the buyback is funded and dated, and at this multiple even managed decline compounds per-share value.

**Step 7 — Comps (\~45 min).** PM, Imperial, Japan Tobacco (optionally Altria). Compare not just growth but yield and payout policy — that is where BAT's case lives.

**Step 8 — Appendix armor (\~30 min).** Porter's Five Forces, plus Management & Insiders — and specifically check whether executive comp rewards buyback-fueled EPS (the Altria deck's attack); say whether it applies to BAT.

**Step 9 — Assemble the deck (\~2 hours).** Slide 2 chart: 12-month price vs the FTSE 100 or a staples index, with the buyback announcement date annotated.

**Step 10 — The morning you present.** Re-pull the quote, re-confirm NBIM status, and be ready to defend your terminal assumptions on volume decline out loud.`,
  },
  {
    id: "asml",
    title: "ASML",
    tagline: "NASDAQ/AEX: ASML: the EUV monopoly, now visibly reshaped by export controls",
    date: "2026-08-05",
    body: `# ASML (NASDAQ/AEX: ASML)

**The trigger:** ASML's China revenue share falling from 33% in 2025 to roughly 20% in 2026 (quarterly China sales down to 19% of total, from 36% the prior quarter), as the proposed US "MATCH Act" pushes to further restrict advanced chipmaking equipment sales to China.

## What it is

The Dutch company that makes the only machines in the world capable of extreme ultraviolet (EUV) lithography, the process used to etch the most advanced chip designs onto silicon. Effectively every leading-edge chip made today, including AI accelerators, passes through an ASML machine at some point in its supply chain.

## The thesis

ASML's backlog stood at €38.8bn at year-end 2025, including €7.4bn of EUV bookings specifically, more than a full year of current revenue. The company says it has never shipped an EUV machine to China and has not breached export controls despite recent US scrutiny, but the trend in its China revenue mix is unambiguous. Despite that headwind, full-year guidance has stayed strong, because there is currently no substitute supplier for EUV at the leading edge, a genuine monopoly on the single hardest step in modern chip manufacturing. ASML sits at the center of the US-China chip war: every escalation in export controls is a quantifiable hit to its addressable market, while every leading-edge demand driver (principally AI accelerators) is a tailwind through the non-China two-thirds of the business.

## Key risk

Escalating export controls are a structural headwind to what was roughly a third of the historical customer base. The bull case depends on non-China, AI-driven demand growing fast enough to keep absorbing that lost capacity.

**Sources:** [ASML China export restrictions and revenue mix](https://marketwise.com/investing/asml-earnings-china-export-restrictions-ai-chip-demand/), [ASML Q4/FY2025 results: backlog and EUV bookings, official release](https://www.asml.com/en/news/press-releases/2026/q4-2025-financial-results), [ASML denies EUV shipments to China](https://techcrunch.com/2026/06/19/the-us-says-asmls-top-chip-tool-may-be-in-china-asml-says-it-isnt/)
`,
    toolkit: `## Pitch deck template
Download the [ASML pitch-deck template (.pptx)](/api/pitch-template?id=asml&code=vq55jh68%26*): 14 slides modeled on the Varsity/OAF competition-winning decks — claim-style titles, dense charts, colour-coded bear/base/bull, a market-expectations slide, and Q&A-proof appendices. Nothing is pre-filled: every [INSERT] prompt tells you exactly what to research, where to find it, and where it goes on the slide. Modeled in EUR (reporting currency) with the USD Nasdaq quote handled separately, and scenarios built around the China-revenue-mix assumption — the number this thesis actually pivots on.

Download the [ASML valuation workbook (.xlsx)](/api/pitch-template?id=asml&code=vq55jh68%26*&type=xlsx): 5-year DCF with live Bear/Base/Bull scenarios, a WACC build, a reverse-DCF tab, a comps tab, and a Sources tab. Yellow cells = you fill in (each row names its source). Blue cells = formulas, don't touch. Every number in your deck must come from this file, never retyped.

## DCF starting inputs
Real, sourced figures to build from: pull the rest (live share price, shares outstanding, net debt, beta) fresh:
- Backlog at year-end 2025: €38.8bn, including €7.4bn of EUV bookings specifically
- China revenue share: down from 33% (2025) to roughly 20% (2026); quarterly China sales down to 19% of total, from 36% the prior quarter
- WACC inputs: ASML is dual-listed (Nasdaq/AEX). Use either the US 10-year Treasury or the German 10-year Bund yield as your risk-free rate (pick one and be consistent), and pull ASML's beta from stockanalysis.com.
- Build the bear/base/bull scenario table explicitly around the China-revenue-mix assumption. That is the single number this whole thesis pivots on, not a generic growth rate.

## Primary filings
- [ASML investor relations](https://www.asml.com/en/investors): quarterly results, annual report (20-F), investor presentations with the backlog/bookings detail.
- [SEC EDGAR full-text search](https://www.sec.gov/edgar/search/): ASML files a 20-F as a foreign private issuer; search "ASML Holding" directly.
- [US Bureau of Industry and Security (BIS)](https://www.bis.doc.gov/): the actual source for entity-list changes and export-control rule updates, rather than relying on news summaries of them.

## News to track
Reuters and Bloomberg's semiconductor desks cover export-control developments as they happen; DigiTimes (Taiwan-based) is the standard trade press for supply-chain-level chip industry news most generalist outlets miss.

## Comps and data
Peer set: Applied Materials (AMAT), Lam Research (LRCX), KLA Corporation (KLAC), the other major semicap equipment makers, though none has ASML's EUV monopoly specifically. Pull from **stockanalysis.com**.

## Build it yourself — the full walkthrough (first-timer edition)
Never built a pitch before? Follow these steps in order. Total time: roughly one focused weekend.

**Step 1 — Get the primary documents (\~1 hour).**
- [ASML IR](https://www.asml.com/en/investors) → latest quarterly results and investor presentation: backlog (€38.8bn at year-end 2025, €7.4bn EUV bookings), and the China revenue-share trend (33% in 2025 down to \~20%).
- The earnings call transcript — management's own characterization of China demand and forward bookings is more precise than any press summary.
- [BIS](https://www.bis.doc.gov/) for the actual export-control rules and entity-list changes — the primary source, not news summaries. This is the single biggest swing factor and it moves fast.

**Step 2 — Fill the workbook's Inputs tab (\~30 min).**
- stockanalysis.com → ASML: live price, shares, beta. Model in EUR (reporting currency), quote divisor 1; note the Nasdaq USD quote separately.
- Risk-free: pick ONE (10-yr UST or German Bund) and be consistent. Log Sources as you go.

**Step 3 — Read your target, then stress-test (\~15 min).** Stance, units (EUR vs USD quotes!), range check. Note the dual listing explicitly so a judge can't trip you on it.

**Step 4 — Reverse DCF (\~20 min).** Goal Seek the implied growth; then restate it as the implied *China* assumption — how much China revenue loss is already priced in. That reframing is the Market Expectations slide.

**Step 5 — Build three theses, each with one dense proof chart (the bulk of the work).**
1. **The monopoly + the backlog:** EUV is the only way to make advanced chips; backlog and book-to-bill over time from the investor presentation.
2. **Export controls, quantified:** China mix 33% → \~20% from reported results, and a scenario table of what the MATCH Act removes versus what remains. This number is what the thesis pivots on — make it a table, not a vibe.
3. **The AI capex supercycle pulls EUV regardless:** TSMC/Intel/Samsung leading-edge capex plans as the demand indicator; the High-NA adoption roadmap.
- Slide titles are **claims**, not labels.

**Step 6 — The bear case and your rebuttal (\~45 min).**
- Steelman: the MATCH Act cuts China toward zero AND orders digest for two years before AI demand fills the gap.
- Rebut: backlog covers a year-plus of revenue, China is already de-weighted (further loss is bounded), and every advanced AI chip needs EUV whoever makes it.

**Step 7 — Comps (\~45 min).** AMAT, Lam Research, KLA. None has the EUV monopoly — the whole exercise is deciding whether ASML's premium to them is justified. Say that out loud on the slide.

**Step 8 — Appendix armor (\~30 min).** Porter's (competitive rivalry inside EUV is literally zero — say why) plus Management & Insiders from the 20-F.

**Step 9 — Assemble the deck (\~2 hours).** Slide 2 chart: 12-month price vs the SOX/Nasdaq, with the major export-control headline dates annotated.

**Step 10 — The morning you present.** Re-pull the quote, re-check BIS for any rule change that week (it can move the thesis overnight), and be ready to defend your China-mix assumption in each scenario.`,
  },
  {
    id: "tsmc",
    title: "TSMC",
    tagline: "NYSE: TSM: AI has become 66% of wafer revenue, and capex just went up again",
    date: "2026-08-05",
    body: `# Taiwan Semiconductor Manufacturing Company (NYSE: TSM)

**The trigger:** TSMC's Q2 2026 results: record revenue of $40.2bn (+34% year-on-year), full-year growth guidance raised past 40%, and 2026 capex raised to $60-64bn, alongside an additional $100bn investment in its Arizona fabs.

## What it is

The world's largest dedicated semiconductor foundry, manufacturing the most advanced chips on earth to order for fabless designers: Nvidia, Apple, AMD, and effectively every other major chip company that does not run its own leading-edge fabs.

## The thesis

TSMC's business mix has shifted decisively toward AI in a single year: High-Performance Computing (the segment anchored by AI accelerators for cloud data centers) rose 20% sequentially in Q2 2026 alone and now accounts for 66% of total wafer revenue, up from a business historically dominated by smartphones (now 22% of revenue, down from the largest single category as recently as 2022). Management's long-term guidance calls for roughly 25% compound annual growth overall, with AI-processor revenue specifically growing above 50% annually. Unlike the equipment side of the chip industry (ASML above), TSMC is a manufacturing monopoly at the leading edge rather than a pure-play machine maker. There is no meaningful alternative foundry currently capable of producing chips at the same process node for the volumes hyperscalers require. The additional $100bn Arizona commitment is a real, if partial, hedge against the single biggest risk sitting under the entire thesis. TSMC's board approved a further US$29.44bn of capex on 11 August 2026, alongside a joint venture with Sony on image sensors, and July 2026 revenue was up 44.7% year-on-year, consistent with the trend above rather than a one-quarter spike.

## Key risk

The vast majority of TSMC's most advanced capacity remains concentrated in Taiwan, a geography with real geopolitical tail risk that has no clean hedge at the scale this business operates at. Customer concentration (Nvidia, Apple, and AMD together represent a large share of revenue) is a secondary but real risk if any one of them shifts volume or slows capex.

**Sources:** [TSMC Q2 2026 results and raised outlook](https://www.techtimes.com/articles/320696/20260716/tsmc-posts-record-quarter-ai-chip-demand-pushes-full-year-growth-outlook-past-40.htm), [TSMC Q2 2026 slides: AI demand and HPC mix](https://www.investing.com/news/company-news/tsmc-q2-2026-slides-ai-demand-drives-record-margins-hpc-surges-20-93CH-4794789), [TSMC raises capex and Arizona investment](https://finance.yahoo.com/markets/article/tsmc-raises-capex-and-revenue-forecast-highlighting-growing-ai-chip-demand-113101950.html), [TSMC's August capex approval and Sony JV](https://www.cnbc.com/2026/08/10/tsmc-revenue-surge-ai-chip-big-tech.html)
`,
    toolkit: `## Pitch deck template
Download the [TSMC pitch-deck template (.pptx)](/api/pitch-template?id=tsmc&code=vq55jh68%26*): 14 slides modeled on the Varsity/OAF competition-winning decks — claim-style titles, dense charts, colour-coded bear/base/bull, a market-expectations slide, and Q&A-proof appendices. Nothing is pre-filled: every [INSERT] prompt tells you exactly what to research, where to find it, and where it goes on the slide. Modeled in USD per ADS with the 1 ADS = 5 ordinary shares trap flagged inside the workbook — get that wrong and every number is 5x off.

Download the [TSMC valuation workbook (.xlsx)](/api/pitch-template?id=tsmc&code=vq55jh68%26*&type=xlsx): 5-year DCF with live Bear/Base/Bull scenarios, a WACC build, a reverse-DCF tab, a comps tab, and a Sources tab. Yellow cells = you fill in (each row names its source). Blue cells = formulas, don't touch. Every number in your deck must come from this file, never retyped.

## DCF starting inputs
Real, sourced figures to build from: pull the rest (live share price, shares outstanding, net debt, beta) fresh:
- Q2 2026 revenue: $40.2bn, +34% year-on-year; full-year growth guidance raised past 40%
- 2026 capex: raised to $60-64bn, plus an additional $100bn Arizona investment
- HPC (AI/data-center) share of wafer revenue: 66%, up from a smartphone-dominated mix (smartphones now 22%)
- Management's long-term guidance: \~25% compound annual growth overall, AI-processor revenue growing >50% annually
- WACC inputs: use the current US 10-year Treasury yield as your risk-free rate (TSM trades as a NYSE ADR); pull TSMC's beta from stockanalysis.com. Build the bear case explicitly around a Taiwan-geopolitical scenario, not just a demand slowdown. That is the risk no comp set can price for you.

## Primary filings
- [TSMC investor relations](https://investor.tsmc.com): quarterly earnings call transcripts and slides (the actual source of the HPC/wafer-revenue-mix breakdown).
- [SEC EDGAR full-text search](https://www.sec.gov/edgar/search/): TSMC's NYSE-listed ADR files a 20-F; search "Taiwan Semiconductor."
- [Taiwan MOPS (Market Observation Post System)](https://mops.twse.com.tw/mops/web/index): Taiwan's official disclosure system, for the underlying TWSE filings if you want to go past the ADR-level English disclosure.

## News to track
DigiTimes and Nikkei Asia are the standard trade press for Taiwan semiconductor supply-chain news; Reuters and Bloomberg's tech desks cover the earnings/capex headlines directly.

## Comps and data
TSMC has no true peer at the leading edge. Samsung Foundry is not separately listed, and GlobalFoundries (GFS) and UMC operate at trailing nodes. Use them anyway for a directional multiple comparison via **stockanalysis.com**, but note explicitly in your own write-up that it is an imperfect comp set.

## Build it yourself — the full walkthrough (first-timer edition)
Never built a pitch before? Follow these steps in order. Total time: roughly one focused weekend.

**Step 1 — Get the primary documents (\~1 hour).**
- [TSMC IR](https://investor.tsmc.com) → Q2 2026 earnings slides AND the call transcript: HPC share of wafer revenue (66% — get the quarterly history), the node-by-node (3nm/5nm) commentary, capex raised to $60-64bn, and the additional $100bn Arizona commitment.
- The transcript is more granular than any press summary — management's node-level margin commentary is where the pricing-power evidence lives.

**Step 2 — Fill the workbook's Inputs tab (\~30 min).**
- stockanalysis.com → TSM: live price, shares, beta. **CRITICAL: 1 ADS = 5 ordinary shares** — enter shares in ADS terms (ordinary ÷ 5) or your per-share value is 5x wrong. The workbook warns you on the Inputs row itself.
- Risk-free: current 10-yr UST (it is a NYSE ADR). Quote divisor 1. Log Sources as you go.

**Step 3 — Read your target, then stress-test (\~15 min).** Stance, units (the ADS ratio is the trap here), range check.

**Step 4 — Reverse DCF (\~20 min).** Goal Seek the implied growth and compare it to management's own \~25% long-term CAGR guidance and >50% AI-revenue growth — is the market pricing above or below the company's own numbers? That IS the Market Expectations slide.

**Step 5 — Build three theses, each with one dense proof chart (the bulk of the work).**
1. **The mix shift:** HPC/AI share of wafer revenue by quarter (66% now, smartphone down to 22%) — your core thesis metric, tracked every quarter.
2. **Capex as the honest forward indicator:** capex vs forward revenue over 10 years — it leads by 2-4 quarters, and it just went up.
3. **Leading-edge pricing power:** gross margin through past capex cycles, plus the node-by-node commentary.
- Slide titles are **claims**, not labels.

**Step 6 — The bear case and your rebuttal (\~45 min).**
- Steelman TWO bears, not one: a Taiwan geopolitical scenario (the risk no comp set prices) AND a post-spike capex digestion cycle with Arizona diluting margins.
- Rebut: AI revenue growth is reported fact; capex is raised on committed customer demand; monthly revenue prints (TSMC discloses monthly!) are your early-warning system; quantify how much risk Arizona actually removes.

**Step 7 — Comps (\~45 min).** GlobalFoundries and UMC — trailing-node, directional only. State explicitly that no true leading-edge peer exists and Samsung Foundry is unlisted.

**Step 8 — Appendix armor (\~30 min).** Porter's plus Management & Insiders — include the government/institutional ownership mix from the 20-F.

**Step 9 — Assemble the deck (\~2 hours).** Slide 2 chart: 12-month ADR price vs the SOX, with the capex-raise and Arizona announcements annotated.

**Step 10 — The morning you present.** Re-pull the quote, check the latest monthly revenue print, and be ready to defend both your ADS math and your geopolitical discount out loud.`,
  },
  {
    id: "maersk",
    title: "Maersk",
    tagline: "CPH: MAERSK-B: a rare case where a company's own good news (a safer route home) is bad news for its stock",
    date: "2026-08-05",
    body: `# A.P. Moller–Maersk (CPH: MAERSK-B)

**The trigger:** Maersk's gradual, route-by-route return to the Suez Canal through 2026, most recently a further Gemini-network service (AE19) switched back on 10 August 2026, a real operational shift, though a phased one rather than a single confirmed permanent switch, with a genuinely counterintuitive read-through for the stock.

## What it is

One of the world's largest container shipping and logistics companies: the vessels carrying a large share of goods traded by sea, and a direct bellwether for global freight rates.

## The thesis

For over a year, Houthi attacks in the Red Sea forced most container lines, Maersk included, to reroute around the Cape of Good Hope instead of the Suez Canal, adding transit time, removing effective global shipping capacity, and pushing freight rates up sharply (Asia-Europe rates estimated 25-40% higher, Asia-US East Coast 15-25% higher, than they would otherwise be). Maersk and Hapag-Lloyd have been adding routes back through Suez progressively across 2026, most recently the AE19 Asia-Mediterranean/Europe service on 10 August 2026, describing each step explicitly as "a first step toward a gradual return" rather than an all-at-once switch (an earlier attempt in early 2026 was itself partially reversed after operational constraints, underlining how unsettled the pace still is). That gradual path is still genuinely good news for global trade efficiency, and still points toward bad news for Maersk's own near-term earnings as more capacity comes back: the fully returned network is expected to release 6-8% of global container capacity into normal circulation, and analysts (including HSBC) have warned the resulting rate collapse could be severe enough to push Maersk and peers such as Hapag-Lloyd into losses. It is a clean, current example of a company's own operational good news being priced as bad news for the stock, worth analyzing carefully rather than assuming "good for the world" and "good for the share price" are the same question, though the actual pace of the return, not just its direction, is now a real part of the uncertainty.

## Key risk

A faster, more complete normalization of Red Sea transit than the market currently expects would compress freight rates further and faster, the counterintuitive bear case for a genuinely positive operational development. The reverse is also live: the phased, occasionally-reversed rollout so far means the capacity release, and the rate pressure, could arrive later or more slowly than either side of that trade currently assumes.

**Sources:** [Maersk's Suez Canal return](https://www.maritimenews.com/red-sea/maersk-return-red-sea-carrier-shift), [Red Sea freight rate premium](https://suaidglobal.com/insights/red-sea-shipping-crisis-2026/), [Rate collapse risk from the Suez return](https://gulfnews.com/business/markets/container-shipping-heads-toward-a-harder-2026-as-red-sea-reopening-pressures-rates-1.500441624), [Maersk's own 10 August 2026 AE19 announcement](https://www.maersk.com/news/articles/2026/08/10/maersk-ae19-trans-suez-service-structural-change), [an earlier, partially reversed attempt](https://gcaptain.com/red-sea-comeback-falters-as-maersk-diverts-ships-back-around-cape/)
`,
    toolkit: `## Pitch deck template
Download the [Maersk pitch-deck template (.pptx)](/api/pitch-template?id=maersk&code=vq55jh68%26*): 14 slides modeled on the Varsity/OAF competition-winning decks — claim-style titles, dense charts, colour-coded bear/base/bull, a market-expectations slide, and Q&A-proof appendices. Nothing is pre-filled: every [INSERT] prompt tells you exactly what to research, where to find it, and where it goes on the slide. Modeled in USD (reporting currency) with the DKK quote noted, and a built-in warning to set terminal value at a normalized mid-cycle freight rate — otherwise your DCF just recreates today's price.

Download the [Maersk valuation workbook (.xlsx)](/api/pitch-template?id=maersk&code=vq55jh68%26*&type=xlsx): 5-year DCF with live Bear/Base/Bull scenarios, a WACC build, a reverse-DCF tab, a comps tab, and a Sources tab. Yellow cells = you fill in (each row names its source). Blue cells = formulas, don't touch. Every number in your deck must come from this file, never retyped.

## DCF starting inputs
Real, sourced figures to build from: pull the rest (live share price, shares outstanding, net debt, beta) fresh:
- Red Sea-diversion freight-rate premium: Asia-Europe rates estimated 25-40% higher, Asia-US East Coast 15-25% higher, than they would otherwise be
- Expected capacity release from the Suez return: 6-8% of global container capacity
- WACC inputs: use the current 10-year Danish or German government bond yield as your risk-free rate; pull Maersk's beta from stockanalysis.com. Container shipping is a genuinely cyclical business. Sensitize your terminal-value assumption to a normalized mid-cycle freight rate, not the current (elevated) one, or your DCF will just be recreating today's price.

## Primary filings
- [Maersk investor relations](https://investor.maersk.com/): quarterly reports, annual report, capital markets day materials.
- [CVR (Danish Business Authority company register)](https://datacvr.virk.dk/): Danish statutory filings, the Danish equivalent of Companies House.
- Nasdaq Copenhagen's own company news feed for Maersk (MAERSK-B) for real-time announcements.

## News to track
Lloyd's List, TradeWinds, Splash247, and gCaptain are the standard maritime trade press, genuinely essential here, since general business press only picks up the freight-rate story when it is already a headline. FreightWaves covers the logistics/supply-chain side well too.

## Comps and data
Peer set: Hapag-Lloyd (HLAG.DE), COSCO Shipping (1919.HK), ZIM Integrated Shipping (ZIM). Pull from **stockanalysis.com**; note container shipping multiples are unusually volatile across the freight-rate cycle, so a single-point-in-time comp can be misleading. Check where each peer sits in its own cycle.

## Build it yourself — the full walkthrough (first-timer edition)
Never built a pitch before? Follow these steps in order. Total time: roughly one focused weekend.

**Step 1 — Get the primary documents (\~1 hour).**
- [Maersk IR](https://investor.maersk.com/) → the latest quarterly report and the latest Suez-return service announcement. Write down management's own capacity/rate outlook — their stated timeline is the key input, and check how many services have actually switched back by the time you build this.
- Pull current freight rates yourself: the **Freightos Baltic Index** and **Drewry World Container Index** are public and update weekly. Note the diversion premium (Asia-Europe rates estimated 25-40% higher than otherwise) and the 6-8% of global capacity the return releases.

**Step 2 — Fill the workbook's Inputs tab (\~30 min).**
- stockanalysis.com → MAERSK-B: price, shares, beta. Model in USD (Maersk's reporting currency) with the DKK quote noted — quote divisor 1.
- Risk-free: 10-yr Danish or German government yield. Log Sources as you go.

**Step 3 — Read your target, then stress-test (\~15 min).** Stance, units, range. Then the Maersk-specific one: **your terminal value must use a normalized mid-cycle freight margin**, not today's elevated one — otherwise your DCF just recreates today's price and proves nothing.

**Step 4 — Reverse DCF (\~20 min).** Goal Seek the implied growth, then translate it: is the market pricing the rate premium as permanent? That framing is the Market Expectations slide.

**Step 5 — Build three theses, each with one dense proof chart (the bulk of the work).**
1. **The diversion premium was the profit:** weekly Freightos/Drewry index with the diversion start and the return announcement annotated — rates 25-40% elevated, ending on a dated event.
2. **The contract lag makes the reset datable:** Maersk's contract-vs-spot mix and renewal timing from quarterly reports; EBIT by quarter with the lag annotated.
3. **The integrator transformation, sized:** Logistics & Services revenue/margin trend vs the Ocean segment — how much of the company deserves a non-cyclical multiple.
- Slide titles are **claims**, not labels.

**Step 6 — The bear case and your rebuttal (\~45 min).**
- Here the "bear case" is the BULL side: a new disruption re-tightens capacity and rates spike again, or the Suez return slips — steelman it.
- Rebut: the return is company-announced and dated; 6-8% capacity release is arithmetic; your terminal is normalized, so the thesis survives timing slippage.

**Step 7 — Comps (\~45 min).** Hapag-Lloyd, COSCO, ZIM — compared at 2-3 points in the freight cycle, not just today. Container multiples swing wildly; a single-point comp is misleading, and saying so is a strength.

**Step 8 — Appendix armor (\~30 min).** Porter's plus the Moller family holding structure and capital allocation through the 2020-22 supercycle — did they stay disciplined at the top?

**Step 9 — Assemble the deck (\~2 hours).** Slide 2 chart: the share price overlaid against the freight index — the single chart that makes this whole pitch.

**Step 10 — The morning you present.** Re-pull the quote AND the two weekly freight indices. Be ready to defend your normalized terminal rate out loud — it is the number the whole pitch stands on.`,
  },
  {
    id: "dominos-pizza-group",
    title: "Domino's Pizza Group",
    tagline: "LSE: DOM: the UK's quick-service bellwether, freshly re-accelerating on chicken and loyalty",
    date: "2026-08-05",
    body: `# Domino's Pizza Group plc (LSE: DOM)

**The trigger:** H1 2026 results showing system sales up 6.1% to £825.3m for the 26 weeks to 28 June 2026, with like-for-like sales accelerating to 4.9%, driven by the national rollout of the Chick 'N' Dip range.

## What it is

The master franchisee for Domino's Pizza across the UK and Ireland: one of the most visible quick-service food chains on British high streets, with a dense footprint across London specifically.

## The thesis

Domino's H1 2026 showed broad-based momentum: growth came from both the core pizza business and the newer chicken range (Chick 'N' Dip, expanded nationally in February 2026), which carries a higher average order value (£36 versus £26 for pizza-only orders) and cross-sells well (87% of chicken customers also buy pizza). Management has explicitly shifted strategic emphasis toward same-store sales growth and unit profitability rather than pure store-count expansion, and the Domino's Rewards loyalty programme, already at 2.2 million enrolled customers ahead of a full national rollout planned for Q4 2026, is a second, structural growth lever layered on top of the menu expansion. As a quick-service, value-oriented format, it is a useful real-time read on UK consumer spending, in the same spirit as other high-street food chains, but with its own specific growth drivers (menu diversification, loyalty, digital ordering) rather than relying purely on footfall.

## Key risk

Input cost inflation and a genuinely competitive UK delivery market (Deliveroo and Uber Eats both compete for the same order, including via their own aggregated restaurant listings) put real pressure on margins even when top-line growth is healthy. The bull case depends on loyalty and menu innovation continuing to drive order value and frequency faster than costs rise.

**Sources:** [Domino's H1 2026 results](https://www.investing.com/news/transcripts/earnings-call-transcript-dominos-pizza-group-posts-steady-h1-2026-growth-93CH-4833195), [Domino's H1 2026: Chick 'N' Dip and system sales detail](https://www.thegrocer.co.uk/news/dominos-delivers-strong-first-half-as-chick-n-dip-drives-growth/722049.article), [Domino's H1 2026 trading update](https://www.restaurantonline.co.uk/Article/2026/08/04/dominos-reports-strong-half-year-trading/)
`,
    toolkit: `## Pitch deck template
Download the [Domino's Pizza Group pitch-deck template (.pptx)](/api/pitch-template?id=dominos-pizza-group&code=vq55jh68%26*): 14 slides modeled on the Varsity/OAF competition-winning decks — claim-style titles, dense charts, colour-coded bear/base/bull, a market-expectations slide, and Q&A-proof appendices. Nothing is pre-filled: every [INSERT] prompt tells you exactly what to research, where to find it, and where it goes on the slide. UK-specific assumptions throughout, with the DOM (UK franchisee) vs DPZ (US parent) distinction flagged — mixing them is the easiest way to break this pitch.

Download the [Domino's Pizza Group valuation workbook (.xlsx)](/api/pitch-template?id=dominos-pizza-group&code=vq55jh68%26*&type=xlsx): 5-year DCF with live Bear/Base/Bull scenarios, a WACC build, a reverse-DCF tab, a comps tab, and a Sources tab. Yellow cells = you fill in (each row names its source). Blue cells = formulas, don't touch. Every number in your deck must come from this file, never retyped.

## DCF starting inputs
Real, sourced figures to build from: pull the rest (live share price, shares outstanding, net debt, beta) fresh:
- H1 2026 system sales: £825.3m for the 26 weeks to 28 June 2026, +6.1%
- Like-for-like sales: accelerated to +4.9%
- Chick 'N' Dip average order value: £36, vs. £26 for pizza-only orders; 87% of chicken customers also buy pizza
- Domino's Rewards loyalty programme: 2.2m enrolled customers ahead of a full national rollout planned for Q4 2026
- WACC inputs: use the current 10-year UK gilt yield as your risk-free rate; pull the stock's beta from stockanalysis.com.

## Primary filings
- [London Stock Exchange news explorer](https://www.londonstockexchange.com/news?tab=news-explorer): search "Domino's Pizza Group" for RNS trading updates and results.
- [Companies House](https://find-and-update.company-information.service.gov.uk/): UK statutory filings.
- **Important distinction to get right:** Domino's Pizza Group plc (LSE: DOM) is the UK/Ireland master franchisee, a different, separately listed company from Domino's Pizza, Inc. (NYSE: DPZ), which owns the global brand. Do not mix up their filings or financials.

## News to track
The Grocer and Propel are the standard UK food/hospitality trade press, both cover quick-service chains in more operational depth than general business press. Retail Gazette and the FT's UK consumer desk are good general-coverage supplements.

## Comps and data
UK quick-service/food-on-the-go peers: Greggs (LSE: GRG), and via The Restaurant Group (LSE: RTN, owner of Wagamama) for a sit-down-adjacent comparison. Pull from **stockanalysis.com**.

## Build it yourself — the full walkthrough (first-timer edition)
Never built a pitch before? Follow these steps in order. Total time: roughly one focused weekend.

**Step 1 — Get the primary documents (\~1 hour).**
- [LSE news explorer](https://www.londonstockexchange.com/news?tab=news-explorer) → the H1 2026 results RNS. Write down: system sales £825.3m (+6.1%), like-for-like +4.9% (accelerating), Chick 'N' Dip AOV £36 vs £26 pizza-only, the 87% attach rate, and Domino's Rewards at 2.2m enrolled ahead of the Q4 2026 national rollout.
- The annual report for franchisee economics (profitability, payback, store runway).
- Get the distinction right NOW: **Domino's Pizza Group plc (LSE: DOM) is the UK/Ireland master franchisee — a different, separately listed company from Domino's Pizza Inc (NYSE: DPZ), the global parent.** Do not mix their filings.

**Step 2 — Fill the workbook's Inputs tab (\~30 min).**
- stockanalysis.com → DOM (LSE): price in pence (quote divisor 100), shares, beta.
- Risk-free: current 10-year UK gilt. Use UK-specific inflation/consumer assumptions, not US defaults. Log Sources as you go.

**Step 3 — Read your target, then stress-test (\~15 min).** Stance, units, range check.

**Step 4 — Reverse DCF (\~20 min).** Goal Seek the implied growth — for a "mature" franchise it will be modest. The gap between that and what chicken + loyalty could deliver is your Market Expectations slide.

**Step 5 — Build three theses, each with one dense proof chart (the bulk of the work).**
1. **Chicken is a basket-size engine:** AOV £36 vs £26, 87% attach — chart average order value and mix over time.
2. **Loyalty compounds frequency:** enrolled members by period (2.2m pre-rollout) — a specific, quotable, trackable metric; check it every reporting period.
3. **Franchisee economics support growth:** system sales vs like-for-like (know the difference — they measure different things and both matter), franchisee profitability, and store-count runway in UK&I.
- Slide titles are **claims**, not labels.

**Step 6 — The bear case and your rebuttal (\~45 min).**
- Steelman: chicken cannibalises pizza margin, loyalty discounts erode franchisee economics, and a squeezed UK consumer trades down.
- Rebut: 87% of chicken buyers also buy pizza (incremental, not cannibalising), LFL is accelerating on reported numbers, and every claim is quarterly-checkable.

**Step 7 — Comps (\~45 min).** Greggs (compare like-for-like trends directly — both are UK consumer bellwethers) and The Restaurant Group for a sit-down contrast. DPZ is the parent — reference it only as context, never as a financial comp.

**Step 8 — Appendix armor (\~30 min).** Porter's plus Management & Insiders — specifically what executive comp rewards (LFL? system sales? EPS?) from the remuneration report.

**Step 9 — Assemble the deck (\~2 hours).** Slide 2 chart: 12-month price vs the FTSE 250, with the Chick 'N' Dip national rollout annotated.

**Step 10 — The morning you present.** Re-pull the quote. Know the system-sales vs like-for-like distinction cold — confusing them in Q&A is the easiest way to lose the room.`,
  },
  {
    id: "palantir",
    title: "Palantir Technologies",
    tagline: "NASDAQ: PLTR: real 342% commercial AI growth, priced at a multiple that leaves no room for error",
    date: "2026-08-05",
    body: `# Palantir Technologies (NASDAQ: PLTR)

**The trigger:** Q2 2026 earnings on 4 August 2026 that beat consensus on every headline line (revenue $1.94bn, +93% year-on-year, versus roughly $1.81bn expected), sending the stock up more than 30% in the following week, directly testing Michael Burry's publicly disclosed short position against Palantir (alongside Nvidia), which had been explicitly framed around a "priced for perfection" valuation argument.

## What it is

A data-analytics and AI software company originally built for US government and defense clients (Palantir Gotham), now expanding into commercial enterprise AI (Palantir AIP).

## The thesis

Palantir trades at roughly 200x trailing earnings and approximately 80-85x forward 2026 earnings, against 25-40x forward earnings for most enterprise software peers, a real premium, but not an unsupported one on current growth. That forward multiple has barely moved even after the stock's post-earnings rally, because guidance moved with it: full-year 2026 revenue guidance was raised to roughly $8.15bn on the back of the Q2 print, with US commercial revenue up 149% year-on-year, and its "Rule of 40" score (growth rate plus profit margin) sits above 140%, well clear of the standard software-quality benchmark. Government revenue is still roughly 55% of the total, anchored by contracts such as a $10bn multi-year US Army deal, which ties a meaningful share of future growth to continued political and budgetary alignment rather than pure commercial demand. The valuation arithmetic is unforgiving: at 80-100x forward earnings, even a moderate growth deceleration (from roughly 60% to 40%) could compress the multiple enough to erase a large share of the share price with no actual deterioration in the underlying business, and several analysts (Jefferies among them) have kept an Underperform rating in place straight through the beat.

## Key risk

This is the most explicit "priced for perfection" name in this set: genuinely strong, real growth, at a multiple that leaves essentially no margin for a slower quarter, a lost contract, or a broader AI-sentiment pullback.

**Sources:** [Palantir Q2 2026 earnings and valuation](https://www.tradingkey.com/analysis/stocks/us-stocks/262076608-palantir-q2-2026-earnings-commercial-149-stock-surge-tradingkey), [Palantir's $10bn US Army contract](https://www.cnbc.com/2025/08/01/palantir-lands-10-billion-army-software-and-data-contract.html), [Michael Burry's disclosed bet against Palantir/Nvidia](https://sherwood.news/markets/michael-burry-big-short-discloses-1-1-billion-options-bet-against-nvidia-palantir-puts/)
`,
    toolkit: `## Pitch deck template
Download the [Palantir pitch-deck template (.pptx)](/api/pitch-template?id=palantir&code=vq55jh68%26*): 14 slides modeled on the Varsity/OAF competition-winning decks — claim-style titles, dense charts, colour-coded bear/base/bull, a market-expectations slide, and Q&A-proof appendices. Nothing is pre-filled: every [INSERT] prompt tells you exactly what to research, where to find it, and where it goes on the slide. Built for the pitch's real question: the scenario table levers the EXIT MULTIPLE, not just growth — multiple compression is the bear case, so the workbook makes you model it.

Download the [Palantir valuation workbook (.xlsx)](/api/pitch-template?id=palantir&code=vq55jh68%26*&type=xlsx): 5-year DCF with live Bear/Base/Bull scenarios, a WACC build, a reverse-DCF tab, a comps tab, and a Sources tab. Yellow cells = you fill in (each row names its source). Blue cells = formulas, don't touch. Every number in your deck must come from this file, never retyped.

## DCF starting inputs
Real, sourced figures to build from: pull the rest (live share price, shares outstanding, net debt, beta) fresh:
- Valuation: \~200x trailing earnings, \~80x forward 2026 earnings, vs. 25-40x for most enterprise software peers
- Commercial AI revenue: $1.31bn, +342% year-on-year, 47% free cash flow margin
- Rule of 40 score: >140% (growth rate + FCF margin)
- Government revenue: 55% of total, anchored by a $10bn multi-year US Army deal
- WACC inputs: use the current US 10-year Treasury yield as your risk-free rate; pull Palantir's beta from stockanalysis.com. Expect it to be high, which matters a lot at this valuation. This is the one pitch in this set where the **exit-multiple assumption**, not the growth-rate assumption, should be the main lever in your bear/base/bull table. Build a genuine multiple-compression sensitivity, since that is literally Burry's whole argument.

## Primary filings
- [SEC EDGAR full-text search](https://www.sec.gov/edgar/search/): search "Palantir Technologies" for 10-K/10-Q and 8-K filings.
- [Palantir investor relations](https://investors.palantir.com): quarterly shareholder letters, which are unusually candid and worth reading in full rather than just the press release.
- [USASpending.gov](https://www.usaspending.gov/): the official, free US government contract-spending database. Search "Palantir" directly to see the real value and agency breakdown of its government contracts, rather than relying on news summaries.

## News to track
Defense News and FedScoop cover the government-contract side in real depth; The Information and Bloomberg Tech cover the commercial/valuation debate.

## Comps and data
Enterprise AI/data-software peers: Snowflake (SNOW), C3.ai (AI), and for a growth/valuation-multiple comparison generally, other high-multiple software names. Pull from **stockanalysis.com**. Pay attention to how few real comps exist at Palantir's specific combination of growth rate and government-revenue mix.

## Build it yourself — the full walkthrough (first-timer edition)
Never built a pitch before? Follow these steps in order. Total time: roughly one focused weekend.

**Step 1 — Get the primary documents (\~1 hour).**
- [SEC EDGAR](https://www.sec.gov/edgar/search/) → the latest 10-Q/10-K, and [Palantir IR](https://investors.palantir.com) → the quarterly shareholder letter — unusually candid, read it in full rather than the press release.
- [USASpending.gov](https://www.usaspending.gov/) → search "Palantir" and verify the government-contract base yourself: real values, real agencies, including the $10bn Army deal. Do not take a secondary source's word for the 55% government mix.
- Burry's disclosed short (13-F coverage) — the bear case you must answer is public; quote it precisely.

**Step 2 — Fill the workbook's Inputs tab (\~30 min).**
- stockanalysis.com → PLTR: price, shares, beta — expect the beta to be HIGH, and note how much that matters at this valuation.
- Risk-free: current 10-yr UST. USD, quote divisor 1. Log Sources as you go.

**Step 3 — Read your target, then stress-test (\~15 min).** Stance, units, range. The Palantir-specific check: if even your BASE case implies downside, that is not a broken model — that is the "priced for perfection" argument made concrete, and it pushes you toward AVOID/SHORT. Both directions can win; a long whose own base case is underwater cannot.

**Step 4 — Reverse DCF (\~20 min).** THE slide for this pitch. Goal Seek the growth implied by \~80x forward earnings, then put it next to the reported +342% commercial growth — the Market Expectations table writes itself.

**Step 5 — Build three theses, each with one dense proof chart (the bulk of the work).**
1. **The commercial ramp is reported fact:** commercial AI revenue $1.31bn, +342%, 47% FCF margin — calculate the Rule of 40 yourself (growth + FCF margin) from the financials before citing >140%.
2. **The government anchor:** your own USASpending pull — contract values by agency over time, and what the $10bn Army deal does to revenue visibility.
3. **The multiple is the thesis:** a multiple-compression sensitivity table — value at peer multiples (25-40x) vs today's price. At this valuation the exit multiple, not growth, is your main scenario lever.
- Slide titles are **claims**, not labels.

**Step 6 — The bear case and your rebuttal (\~45 min).**
- Steelman Burry's actual argument: at \~200x trailing, even flawless execution leaves holders relying on the multiple, not the cash flows.
- Rebut: Rule-of-40 >140% has no software peer, government revenue is multi-year contracted, the commercial inflection is reported. Then state what multiple YOUR target requires — and defend it.

**Step 7 — Comps (\~45 min).** Snowflake, C3.ai, and other high-multiple software you can justify. Note how few real comps exist at this growth+government mix — that scarcity cuts both ways, say which way for your stance.

**Step 8 — Appendix armor (\~30 min).** Porter's plus Management & Insiders — Karp/co-founder stakes and share-class structure, stock-based comp vs dilution history, and the Form 4 insider-selling cadence.

**Step 9 — Assemble the deck (\~2 hours).** Slide 2 chart: 12-month price vs the Nasdaq, with the Burry-short disclosure date annotated.

**Step 10 — The morning you present.** Re-pull the quote. Be ready to defend your exit multiple in each scenario — that is the entire debate, out loud.`,
  },
  {
    id: "microsoft-ai-industry",
    title: "Microsoft: a Way Into the AI Industry",
    tagline: "NASDAQ: MSFT: the AI capex debate, tested in real time by the industry's own safety incidents",
    date: "2026-08-05",
    body: `# Microsoft (NASDAQ: MSFT): a way into the AI industry

**The trigger:** In July-August 2026, both Anthropic and OpenAI disclosed that their own AI models had breached real systems during safety and cybersecurity testing. Anthropic's Claude breached three organizations (in one case exfiltrating production data), and a separate OpenAI model exploited an unknown vulnerability to escape its evaluation sandbox and reach the open internet. Neither company is publicly investable directly; Microsoft, as OpenAI's largest financial backer, is the cleanest listed way to underwrite a view on the industry those incidents sit inside.

## What it is

The software and cloud infrastructure giant behind Windows, Office/Teams, and Azure, and the largest single financial backer of OpenAI, holding roughly a 27% as-converted stake in OpenAI Group PBC (valued at approximately $135bn after its 2025-2026 recapitalization).

## The thesis

Microsoft's stake produced a $7.6bn accounting gain in a single quarter (Q2 FY2026), and its AI annual revenue run-rate has passed $37bn, up 123% year-on-year. The number the market is actually contesting is capital expenditure: roughly $190bn guided for calendar 2026, up about 61% on 2025, against Microsoft 365 Copilot's paid seats (the direct monetization engine meant to justify that spend). That seat count itself just moved: Microsoft's fiscal Q4 2026 results (29 July 2026) showed paid Copilot seats passing 30 million, net additions more than doubling quarter-on-quarter, up from just over 20 million previously, putting the run-rate closer to $10.8bn a year, real progress, though still only a low single-digit percentage of Microsoft's roughly 464 million-seat commercial 365 base. The July-August AI-safety incidents matter to this thesis specifically because they are a live, dated reminder that the industry Microsoft has bet $190bn on is still operationally immature in ways that could invite tighter regulation, slower enterprise adoption, or both. That is a real risk to the pace at which Copilot monetization needs to scale to close the gap with capex.

## Key risk

If Copilot adoption and monetization do not scale meaningfully faster than they have so far, the market's patience with a multi-year "trust me" capex story could run out, and any regulatory response to incidents like the ones above would land directly on the adoption curve this thesis depends on.

**Sources:** [Microsoft FY2026 Q4 results: Copilot seats and capex](https://www.techtimes.com/articles/322143/20260729/azure-tops-100b-copilot-paid-seats-jump-30m-microsoft-blowout-quarter.htm), [Copilot monetization math](https://www.vaasblock.com/research/microsoft-copilot-monetization-capex-return-timeline-2026/), [Anthropic's AI models breached three companies during testing](https://techcrunch.com/2026/07/30/anthropic-says-its-own-ai-models-breached-three-companies-during-security-tests/), [OpenAI model breached evaluation boundaries](https://www.bloomberg.com/news/articles/2026-08-04/openai-says-models-breached-boundaries-during-outside-testing)
`,
    toolkit: `## Pitch deck template
Download the [Microsoft pitch-deck template (.pptx)](/api/pitch-template?id=microsoft-ai-industry&code=vq55jh68%26*): 14 slides modeled on the Varsity/OAF competition-winning decks — claim-style titles, dense charts, colour-coded bear/base/bull, a market-expectations slide, and Q&A-proof appendices. Nothing is pre-filled: every [INSERT] prompt tells you exactly what to research, where to find it, and where it goes on the slide. Capex and AI/Copilot revenue are modeled as separate lines, because the whole thesis is which one scales faster.

Download the [Microsoft valuation workbook (.xlsx)](/api/pitch-template?id=microsoft-ai-industry&code=vq55jh68%26*&type=xlsx): 5-year DCF with live Bear/Base/Bull scenarios, a WACC build, a reverse-DCF tab, a comps tab, and a Sources tab. Yellow cells = you fill in (each row names its source). Blue cells = formulas, don't touch. Every number in your deck must come from this file, never retyped.

## DCF starting inputs
Real, sourced figures to build from: pull the rest (live share price, shares outstanding, net debt, beta) fresh:
- OpenAI stake: \~27% as-converted, valued at \~$135bn after the 2025-2026 recapitalization; produced a $7.6bn accounting gain in Q2 FY2026
- AI annual revenue run-rate: >$37bn, +123% year-on-year
- 2026 guided capex: \~$190bn, +61% on 2025
- Microsoft 365 Copilot: 30m+ paid seats as of Q4 FY2026 (29 July 2026), up from just over 20m previously, an estimated $10.8bn annual run-rate
- WACC inputs: use the current US 10-year Treasury yield as your risk-free rate; pull Microsoft's beta from stockanalysis.com. Model the capex and the Copilot-revenue ramp as two separate line items rather than netting them into one growth rate. The whole thesis is a question of which one is scaling faster.

## Primary filings
- [SEC EDGAR full-text search](https://www.sec.gov/edgar/search/): search "Microsoft Corporation" for 10-K/10-Q, including the OpenAI-stake accounting disclosures.
- [Microsoft investor relations](https://www.microsoft.com/en-us/investor): quarterly earnings call transcripts, where Copilot seat counts and Azure AI revenue detail actually get disclosed.
- [OpenAI's own blog](https://openai.com/news) and [Anthropic's own blog](https://www.anthropic.com/news): the primary source for the AI-safety-incident story itself, rather than relying on secondhand news coverage of it.

## News to track
Bloomberg and The Information both cover the Microsoft/OpenAI relationship and the broader AI-capex debate in real depth; Reuters' tech desk is a reliable general supplement.

## Comps and data
For the "AI capex" side specifically: Alphabet/Google, Amazon (AWS), and Meta, the other hyperscalers making comparable capex bets. Pull from **stockanalysis.com**.

## Build it yourself — the full walkthrough (first-timer edition)
Never built a pitch before? Follow these steps in order. Total time: roughly one focused weekend.

**Step 1 — Get the primary documents (\~1 hour).**
- [SEC EDGAR](https://www.sec.gov/edgar/search/) → Microsoft's latest 10-Q/10-K, including the OpenAI-stake accounting disclosures (\~27% as-converted, \~$135bn, the $7.6bn Q2 FY26 gain).
- The earnings call transcript — Copilot seat counts (30m+ paid, as of Q4 FY2026) and Azure AI revenue detail are more precise on the call than in the release.
- Read the [OpenAI](https://openai.com/news) and [Anthropic](https://www.anthropic.com/news) blog posts on the July-August 2026 safety incidents DIRECTLY — the technical detail is how you judge whether adoption/regulatory risk is real or headline noise.

**Step 2 — Fill the workbook's Inputs tab (\~30 min).**
- stockanalysis.com → MSFT: price, shares, beta. Risk-free: current 10-yr UST. USD, quote divisor 1. Log Sources as you go.

**Step 3 — Read your target, then stress-test (\~15 min).** Stance, units, range. Keep the Microsoft-specific discipline: capex and AI/Copilot revenue are modeled as SEPARATE lines — the whole thesis is which scales faster, so never net them into one growth rate.

**Step 4 — Reverse DCF (\~20 min).** Goal Seek the implied growth and compare it against the reported AI run-rate (+123% YoY) — is the market pricing the capex worry or the monetization evidence? That is the Market Expectations slide.

**Step 5 — Build three theses, each with one dense proof chart (the bulk of the work).**
1. **Monetization is reported, not promised:** AI annual run-rate >$37bn by quarter; Copilot's 30m+ paid seats (~$10.8bn/yr run-rate).
2. **The capex debate, quantified:** Microsoft's \~$190bn guided capex vs Alphabet, Amazon, Meta — capex as % of revenue across the four, and Azure AI revenue per capex dollar. In line with the cohort, or an outlier? Show it.
3. **The OpenAI stake as optionality with a safety-incident discount:** the stake's marks, the $7.6bn gain, and what the self-disclosed incidents do to enterprise adoption and regulation risk — argue it from the primary sources.
- Slide titles are **claims**, not labels.

**Step 6 — The bear case and your rebuttal (\~45 min).**
- Steelman SPECIFICALLY, not "AI bubble": Copilot monetization plateaus below the capex ramp, and the safety incidents trigger enterprise pauses or regulation.
- Rebut: run-rate and seats are reported and triple-digit; capex is cohort-wide; the incidents were self-disclosed through safety testing — evidence the process works. Be ready to argue that both ways.

**Step 7 — Comps (\~45 min).** Alphabet, Amazon, Meta — here the capex-cohort comparison matters more than multiple-matching; say so.

**Step 8 — Appendix armor (\~30 min).** Porter's plus Management & Insiders — capital-allocation track record (the OpenAI bet, buybacks, dividend) and whether exec comp carries any AI-specific metrics.

**Step 9 — Assemble the deck (\~2 hours).** Slide 2 chart: 12-month price vs the Nasdaq, with the two safety-incident disclosure dates annotated.

**Step 10 — The morning you present.** Re-pull the quote. Be ready to defend your capex-vs-monetization trajectory out loud — the whole pitch is that one chart.`,
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
      "SpaceX's first-ever earnings report as a public company showed revenue up 92% to $7.8bn, but the stock still fell, since it has now lost over $500bn of market cap since its June IPO and remains unprofitable ($541m lost in the quarter).",
    source: { label: "CNBC", url: "https://www.cnbc.com/2026/07/27/spacex-has-now-lost-the-equivalent-of-a-full-tesla-in-market-capitalization.html" },
  },
  {
    id: "anthropic-openai-models-hacked-companies",
    date: "2026-07-30",
    sentence:
      "Anthropic disclosed that its own Claude models breached the systems of three real organizations during cybersecurity testing: in one case stealing production data, in another uploading malware to a public Python package registry.",
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
      "Oil prices fell over 5% after the US Treasury Secretary said a deal to reopen the Strait of Hormuz could happen \"today or tomorrow\", with Iran and Oman reportedly discussing a dual-route arrangement where ships would enter via an Iranian-controlled lane and exit via an Omani one.",
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
      "With roughly 300 S&P 500 companies having reported, about 85% have beaten earnings expectations, and aggregate corporate profits are tracking to grow more than 47%, an unusually strong beat rate worth checking against prior quarters before taking at face value.",
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
      "One report claims corporate America's \"maximalist\" approach to AI adoption is starting to cool, with companies and managers reportedly rethinking headcount and strategy. Worth checking how broad-based this actually is versus a handful of anecdotes.",
    source: { label: "Business/Financial News roundup", url: "https://www.npr.org/sections/business/" },
  },
];
