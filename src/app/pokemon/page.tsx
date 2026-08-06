import Link from "next/link";
import { getCard } from "@/lib/pokemonCards";
import {
  PRODUCTION_MILESTONES,
  CHARIZARD_PRICE_HISTORY,
  THIRTY_DOLLAR_COMPARISON,
  MARKET_STATS,
  SWOT,
} from "@/lib/pokemonMarket";
import MarketChart from "@/components/pokemon/MarketChart";
import CharizardChart from "@/components/pokemon/CharizardChart";
import ThirtyDollarChart from "@/components/pokemon/ThirtyDollarChart";
import Stat from "@/components/Stat";

export const dynamic = "force-dynamic";

export default async function PokemonPage() {
  const charizard = await getCard("en", "base1-4");
  const liveHolo = charizard?.pricing?.tcgplayer?.holofoil;

  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-widest text-module-pokemon">Pokemon Cards</p>
      <h1 className="font-display mt-1 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        The collectible commodity
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
        Most trading-card and collectible waves are pure hype: a spike, a crash, and a
        decade of being worth less than the shipping box they came in. Pokemon&apos;s own
        thirty-year sales record looks structurally different — closer to a real,
        persistently-in-demand commodity than a fad. This is the real data behind that
        claim, the real volatility inside it, and what an honest analyst would still flag
        as risk.
      </p>

      {/* Market overview */}
      <section className="mt-10">
        <h2 className="font-mono text-sm uppercase tracking-widest text-muted">
          The Market, By The Numbers
        </h2>
        <p className="mt-0.5 text-xs text-muted/70">
          Real production milestones and secondary-market liquidity proxies — sourced, dated below.
        </p>
        <div className="mt-4 rounded-sm border border-border bg-surface/40 p-5">
          <p className="text-sm text-foreground">
            Cumulative Pokemon TCG cards printed worldwide crossed{" "}
            <span className="font-semibold">85 billion in May 2026</span> — and roughly{" "}
            <span className="font-semibold">40% of every card ever printed</span>{" "}
            was printed in just the last three fiscal years. That&apos;s not the shape of a
            fad cooling off; it&apos;s a demand curve still bending upward three decades in.
          </p>
          <div className="mt-4">
            <MarketChart data={PRODUCTION_MILESTONES} />
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {MARKET_STATS.map((s) => (
              <Stat key={s.label} label={s.label} value={s.value} caption={s.note} />
            ))}
          </div>
        </div>
      </section>

      {/* Institutional landscape */}
      <section className="mt-10">
        <h2 className="font-mono text-sm uppercase tracking-widest text-muted">
          Who Else Is Actually Doing This
        </h2>
        <p className="mt-0.5 text-xs text-muted/70">
          Dedicated price-tracking infrastructure, a failed wave of fractional-investing startups, and what
          Wall Street and academia have actually published, sourced and confidence-rated below.
        </p>

        <div className="mt-4 rounded-sm border border-border bg-surface/40 p-5">
          <h3 className="text-sm font-semibold text-foreground">
            The price-tracking infrastructure is real, and it&apos;s more fragmented than it looks
          </h3>
          <p className="mt-2 text-sm text-muted">
            There is no single &ldquo;stock exchange&rdquo; for trading cards, but there is genuine,
            purpose-built infrastructure behind the numbers this page (and every other source) relies on —
            it&apos;s just split across a few products that each cover a different slice of the market.
          </p>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li>
              <span className="font-semibold text-foreground">Card Ladder</span> — the source most often
              cited for Pokemon-specific index performance (WSJ, CNBC). Builds nightly &ldquo;player/character
              indexes&rdquo; from every card tied to a character, weighted by last-sold value, across ~13
              marketplaces. Runs a dedicated Pokemon index.
            </li>
            <li>
              <span className="font-semibold text-foreground">PWCC / Fanatics Collect</span> — PWCC built the
              PWCC 500, the best-known trading-card price index, but it&apos;s worth being precise here: that
              index covers pre-2000 <em>sports</em> cards only, sourced from PSA-graded auction data. PWCC was
              acquired by Fanatics in 2023 and folded into Fanatics Collect in 2024 — it isn&apos;t, and never
              was, a Pokemon-specific product.
            </li>
            <li>
              <span className="font-semibold text-foreground">GemRate</span> — tracks grading <em>volume</em>,
              not price: its most recent full-year report counted 26.6 million cards graded industry-wide in
              2025 (+32% year-over-year), with PSA holding 72% overall share. Its most relevant finding for
              this page: TCG submissions have overtaken sports cards, and 9 of the top 10 most-graded TCG cards
              in 2025 were Pokemon (Pikachu and Charizard leading).
            </li>
            <li>
              <span className="font-semibold text-foreground">TCGplayer</span> — a transaction-based
              &ldquo;Market Price&rdquo; (a filtered average of actual recent sales, not asking prices), and
              the de facto standard for <em>raw, ungraded, modern</em> Pokemon singles specifically — a
              different segment from the graded-vintage focus of Card Ladder and PWCC.
            </li>
            <li>
              <span className="font-semibold text-foreground">PriceCharting</span> — aggregates eBay and its
              own marketplace sales into set-specific indexes, but its card indexes explicitly cover only
              ungraded base-set cards, no parallels — narrower in scope than it&apos;s sometimes presented as.
            </li>
          </ul>
          <p className="mt-3 text-xs text-muted">
            The honest read: every index above measures something genuinely real, but a different, specific
            slice of the market (graded vs. raw, vintage vs. modern, price vs. volume). Any single headline
            number — including the ones later in this section — is only as good as knowing which of these it
            actually came from.
          </p>
        </div>

        <div className="mt-4 rounded-sm border border-border bg-surface/40 p-5">
          <h3 className="text-sm font-semibold text-foreground">
            Fractional card-investing platforms have, so far, mostly failed
          </h3>
          <p className="mt-2 text-sm text-muted">
            Between 2020 and 2022 a wave of startups let retail investors buy fractional shares of individual
            cards, the way you&apos;d buy a share of a REIT. It&apos;s a more useful data point than it might
            seem — a real, market-tested answer to &ldquo;can this be securitized cleanly,&rdquo; and so far
            the answer has mostly been no:
          </p>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li>
              <span className="font-semibold text-foreground">Otis</span> fractionalized a Charizard at a
              $236,800 valuation, was acquired by Public.com in 2022, then liquidated — investors reportedly
              took a loss.
            </li>
            <li>
              <span className="font-semibold text-foreground">Collectable</span>, an SEC Regulation A+
              platform, discloses (per aggregator MoneyMade, not its own primary filing) roughly 3.1%
              annualized returns since launch — against an estimated 6-8% for the broader blue-chip card
              category over the same period, i.e. the actual product underperformed the market it was built to
              track, after fees.
            </li>
            <li>
              <span className="font-semibold text-foreground">Dibbs</span> pivoted away from fractional
              ownership in 2024 and was acquired by Bastion in 2025. <span className="font-semibold text-foreground">Rally</span>{" "}
              is still operating, but per industry trade coverage most of its sports-card assets remain
              underwater, having been acquired near the 2020-2021 price peak.
            </li>
          </ul>
          <p className="mt-3 text-xs text-muted">
            The pattern across all of them: platforms bought inventory near the 2020-21 peak, secondary-market
            liquidity for the fractional shares themselves never really showed up, and layered fees (cited
            estimates run 15-25% of returns across acquisition, management, and sale) ate further into any
            gain. That&apos;s a real, specific reason to distinguish &ldquo;the underlying card market has done
            well&rdquo; from &ldquo;a retail investment product wrapped around it worked&rdquo; — historically,
            those have not been the same claim.
          </p>
        </div>

        <div className="mt-4 rounded-sm border border-border bg-surface/40 p-5">
          <h3 className="text-sm font-semibold text-foreground">
            What Wall Street coverage and academic research actually say
          </h3>
          <p className="mt-2 text-sm text-muted">
            The <span className="font-semibold text-foreground">Wall Street Journal</span> (citing Card
            Ladder) reported a 3,821% cumulative return for its Pokemon index from 2004 to August 2025, against
            483% for the S&amp;P 500 over the same span. Separately, <span className="font-semibold text-foreground">CNBC</span>{" "}
            cited the same index up 145% trailing-year after AJ Scaramucci paid $16.49m for the only PSA-10
            &ldquo;Pikachu Illustrator&rdquo; card and went on air arguing collectibles are now a legitimate
            asset class. Worth being precise about both: they&apos;re two different time windows that shouldn&apos;t
            be blended into one headline figure, and the second is one buyer&apos;s argument after a record
            purchase, not a bank or analyst publishing research.
          </p>
          <p className="mt-2 text-sm text-muted">
            The pushback is real too. <span className="font-semibold text-foreground">24/7 Wall St.</span> ran
            a piece arguing the &ldquo;beats the S&amp;P 500&rdquo; framing is a category error — a card
            produces no cash flow or dividend, so comparing it to an equity index the way you&apos;d compare
            two stocks is methodologically off; a financial adviser quoted called it a &ldquo;math
            crime.&rdquo; Two Northeastern University finance professors, on record, land on opposite sides:
            one cautiously open (value drawn from scarcity and cultural appeal, similar to art), one openly
            skeptical (&ldquo;this is a very speculative market&hellip; there&apos;s no proven multi-decade
            outperformance track record&rdquo;).
          </p>
          <p className="mt-2 text-sm text-muted">
            The most rigorous work found is from <span className="font-semibold text-foreground">CAIA</span>{" "}
            (the Chartered Alternative Investment Analyst Association) — a 2021 study by Andrew Keenan (CAIA,
            CFA, Credit Suisse) analyzing 109 cards in the PWCC 500 found buyers pay an average ~1,487% premium
            for a PSA 10 over a PSA 9 of the identical card, and that PSA-10 portfolios returned ~42%
            annualized over the study window versus ~35% for PSA-9. It&apos;s sports cards, not Pokemon, but
            it&apos;s the clearest quantitative treatment of the &ldquo;grading changes everything&rdquo;
            effect that this page&apos;s own Charizard case study above illustrates anecdotally.
          </p>
          <p className="mt-2 text-sm text-muted">
            For Pokemon specifically, the peer-reviewed literature doesn&apos;t really exist yet. The one
            direct, methodical attempt found is an undergraduate independent study at the College of Wooster
            (2024) using PriceCharting data from 2021-2023 — it found a portfolio of Pokemon cards returned
            <span className="font-semibold text-foreground"> -4.72% annualized</span> over that specific
            window, underperforming the S&amp;P 500. It&apos;s a real, named, institution-affiliated study —
            just not a peer-reviewed one, and a different three-year window than the WSJ&apos;s 20-year figure
            above. Both can be true at once: this is a genuinely young, volatile market where the answer
            depends heavily on which years you happen to measure.
          </p>
          <p className="mt-3 text-xs text-muted">
            One claim repeated across industry commentary — that trading cards have &ldquo;low correlation to
            equities&rdquo; — could not be traced to any actual computed correlation coefficient or published
            study in this research. Treat it as an unverified industry talking point, not an established fact,
            until a source that actually shows the math turns up.
          </p>
        </div>

        <p className="mt-4 text-xs text-muted/70">
          Sources for this section:{" "}
          <a href="https://www.gemrate.com/november-2025-recap" target="_blank" rel="noreferrer" className="underline decoration-dotted underline-offset-2 hover:text-accent">GemRate 2025 grading recap</a>,{" "}
          <a href="https://www.cardladder.com/about" target="_blank" rel="noreferrer" className="underline decoration-dotted underline-offset-2 hover:text-accent">Card Ladder</a>,{" "}
          <a href="https://help.tcgplayer.com/hc/en-us/articles/213588017-TCGplayer-Market-Price" target="_blank" rel="noreferrer" className="underline decoration-dotted underline-offset-2 hover:text-accent">TCGplayer Market Price methodology</a>,{" "}
          <a href="https://www.moneymade.io/discover/collectable" target="_blank" rel="noreferrer" className="underline decoration-dotted underline-offset-2 hover:text-accent">Collectable returns (via MoneyMade)</a>,{" "}
          <a href="https://www.securitiesdocket.com/2025/09/12/the-hot-investment-with-a-3000-return-pokemon-cards-wsj/" target="_blank" rel="noreferrer" className="underline decoration-dotted underline-offset-2 hover:text-accent">WSJ, &ldquo;The Hot Investment With a 3,000% Return&rdquo;</a>,{" "}
          <a href="https://www.cnbc.com/2026/02/25/pokmon-card-winner-scaramucci-says-collectibles-are-asset-class.html" target="_blank" rel="noreferrer" className="underline decoration-dotted underline-offset-2 hover:text-accent">CNBC, Scaramucci interview</a>,{" "}
          <a href="https://247wallst.com/investing/2026/07/18/pokemon-cards-beat-the-sp-500-by-2-5x-but-the-math-is-a-lie/" target="_blank" rel="noreferrer" className="underline decoration-dotted underline-offset-2 hover:text-accent">24/7 Wall St. critique</a>,{" "}
          <a href="https://news.northeastern.edu/2026/03/20/pokemon-cards-should-you-invest/" target="_blank" rel="noreferrer" className="underline decoration-dotted underline-offset-2 hover:text-accent">Northeastern faculty commentary</a>,{" "}
          <a href="https://caia.org/blog/2021/12/02/collectibles-trading-cards-and-price-perfection/" target="_blank" rel="noreferrer" className="underline decoration-dotted underline-offset-2 hover:text-accent">CAIA, &ldquo;Price of Perfection&rdquo;</a>, and the{" "}
          <a href="https://openworks.wooster.edu/independentstudy/10979/" target="_blank" rel="noreferrer" className="underline decoration-dotted underline-offset-2 hover:text-accent">College of Wooster independent study</a>.
        </p>
      </section>

      {/* Follow the money: the company, its adjacent infrastructure, and the industry beyond cards */}
      <section className="mt-10">
        <h2 className="font-mono text-sm uppercase tracking-widest text-muted">
          Follow the Money — Who Actually Owns This
        </h2>
        <p className="mt-0.5 text-xs text-muted/70">
          The IP holder, the grading infrastructure that prices what it certifies, and the industry beyond
          cards entirely — and, for an investor, who you actually can and can&apos;t buy a share of.
        </p>

        <div className="mt-4 rounded-sm border border-border bg-surface/40 p-5">
          <h3 className="text-sm font-semibold text-foreground">
            The IP holder is a private joint venture, not a company you can buy
          </h3>
          <p className="mt-2 text-sm text-muted">
            Pokemon itself is owned in roughly equal thirds by <span className="font-semibold text-foreground">Nintendo, Game Freak, and Creatures Inc.</span>,
            with <span className="font-semibold text-foreground">The Pokemon Company</span> run as their joint venture to manage the brand day to day —
            Game Freak builds the core games, Creatures co-created the character designs and the trading card
            game specifically and handles a large share of licensing. None of the three is separately
            investable; only Nintendo (TYO: 7974 / OTC: NTDOY) is public, and Nintendo doesn&apos;t break out a
            Pokemon-specific revenue line in its own segment reporting — so even that exposure is real but
            blended, not a clean pure-play read (see this site&apos;s own Nintendo stock pitch for the full case).
          </p>
          <p className="mt-3 text-sm text-muted">
            The Pokemon Company&apos;s own financials, for what they&apos;re worth as a private-company
            disclosure, were a record in its most recent fiscal year (to Feb 2026): revenue of{" "}
            <span className="font-semibold text-foreground">¥531.4bn (~$3.34bn), up 29.3%</span>; operating
            profit of <span className="font-semibold text-foreground">¥144.0bn (~$904m), up 43.0%</span>; net
            profit of <span className="font-semibold text-foreground">¥120.1bn (~$754m), up 70.7%</span> — profit
            growing meaningfully faster than revenue, which is the kind of operating leverage a licensing
            business with low incremental cost is supposed to show.
          </p>
        </div>

        <div className="mt-4 rounded-sm border border-border bg-surface/40 p-5">
          <h3 className="text-sm font-semibold text-foreground">
            The grading infrastructure is private too — and consolidating fast
          </h3>
          <p className="mt-2 text-sm text-muted">
            <span className="font-semibold text-foreground">PSA</span>, the dominant grader by volume (see the
            GemRate share data above), is owned by Collectors Universe — taken private in February 2021 by an
            investor group led by Nat Turner with D1 Capital Partners and Cohen Private Ventures (Steve Cohen),
            for roughly <span className="font-semibold text-foreground">$853m</span> after a bidding process
            pushed the price up from an initial $700m offer. By 2022 the renamed Collectors Holdings had raised
            a further $100m at a <span className="font-semibold text-foreground">$4.3bn valuation</span>{" "}
            (Sportico) — a real, if private, mark of how much capital now sits behind the authentication layer
            of this market, not just the cards themselves.
          </p>
          <p className="mt-2 text-sm text-muted">
            <span className="font-semibold text-foreground">CGC</span>, the fastest-growing challenger, is
            owned by Certified Collectibles Group, majority-acquired by{" "}
            <span className="font-semibold text-foreground">Blackstone&apos;s Tactical Opportunities</span> arm
            in a deal valuing CCG north of $500m. CGC&apos;s card-grading volume was up 631% in H1 2025
            year-on-year off a small base, and it has reportedly built roughly 7% sports-card share in four
            years — real, fast growth, but still a distant second to PSA&apos;s scale.
          </p>
          <p className="mt-3 text-xs text-muted">
            The pattern across both threads above: every layer of this market&apos;s actual infrastructure —
            the IP owner, the dominant grader, and its main challenger — is privately held or PE/hedge-fund
            backed. There is no clean public equity for the grading side of this trade either, which is itself
            a relevant data point if you&apos;re trying to size up how &ldquo;investable&rdquo; this space
            really is beyond buying the cards directly.
          </p>
        </div>

        <div className="mt-4 rounded-sm border border-border bg-surface/40 p-5">
          <h3 className="text-sm font-semibold text-foreground">
            Cards are a fraction of a much bigger franchise
          </h3>
          <p className="mt-2 text-sm text-muted">
            Guinness World Records — which says its figure is built from The Pokemon Company&apos;s own
            audited statements plus licensee-reported merchandise sales, not a single clean number — credits
            Pokemon with roughly <span className="font-semibold text-foreground">$150bn in cumulative revenue</span> through
            December 2024, split roughly $30bn+ from video games and $100bn+ from licensed merchandise (toys,
            apparel, and the rest — cards are a sliver of that merchandise figure, not the majority of it).
            Other trackers land on different totals depending on methodology and cutoff date — figures as low
            as $100bn and as high as $288bn are both in circulation — so treat the exact number the way this
            page treats every other disputed market-size figure: directionally enormous, not a single audited
            fact.
          </p>
          <p className="mt-2 text-sm text-muted">
            The two components with real, countable numbers behind them:
          </p>
          <ul className="mt-2 space-y-1.5 text-sm text-muted">
            <li>
              <span className="font-semibold text-foreground">Games:</span> the mainline series has shipped{" "}
              <span className="font-semibold text-foreground">515m+ units lifetime</span> as of March 2026 (up
              from 489m a year earlier); Scarlet/Violet alone has sold 28.28m copies — the second best-selling
              entry ever after the original Red/Green/Blue (31.38m) — and sold 10m copies in its first three
              days, the fastest launch of any Nintendo title.
            </li>
            <li>
              <span className="font-semibold text-foreground">Anime and film:</span> the TV series is estimated
              to reach 1bn+ viewers across 183 countries over its run; the film spinoffs have sold 190m+ tickets
              and grossed over $1.8bn worldwide, with <em>Detective Pikachu</em> the highest-grossing single
              entry in North America (~$144m).
            </li>
          </ul>
          <p className="mt-3 text-sm text-muted">
            On the licensing side specifically, The Pokemon Company International was ranked among the
            industry&apos;s top global licensors in <span className="font-semibold text-foreground">License
            Global&apos;s Top Global Licensors report</span> (7th globally in the 2024 edition), with the most
            recent clean breakout found putting Pokemon-licensed retail sales at{" "}
            <span className="font-semibold text-foreground">$10.8bn in 2023</span> — its second-highest year on
            record, below the $11.6bn peak in 2022 and above the pandemic-era $8.5bn in 2021. That&apos;s a real,
            trade-publication-sourced number for the licensing business specifically, distinct from (and much
            smaller than) the all-time cumulative franchise figures above.
          </p>
        </div>

        <div className="mt-4 rounded-lg border border-border bg-background/60 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-foreground">
            The finance takeaway
          </p>
          <p className="mt-1.5 text-xs text-muted">
            Every layer of this ecosystem that actually captures the economics — the IP joint venture, the
            dominant grader, its main challenger — is privately held. Nintendo stock is the only real, liquid,
            public way to underwrite a view on any of this, and even that is an imperfect proxy: Pokemon is one
            input into a diversified hardware-and-software business, not a segment Nintendo discloses on its
            own. That gap between &ldquo;a genuinely massive, growing franchise&rdquo; and &ldquo;no clean way
            to buy it&rdquo; is arguably the single most important thing an equity-minded reader should take
            from this page — see this site&apos;s own Nintendo pitch for how that specific trade is actually
            framed.
          </p>
        </div>

        <p className="mt-4 text-xs text-muted/70">
          Sources for this section:{" "}
          <a href="https://legalclarity.org/who-owns-pokemon-nintendo-game-freak-creatures/" target="_blank" rel="noreferrer" className="underline decoration-dotted underline-offset-2 hover:text-accent">Pokemon ownership structure</a>,{" "}
          <a href="https://www.serkantoto.com/2026/06/01/pokemon-company-financial-numbers-2/" target="_blank" rel="noreferrer" className="underline decoration-dotted underline-offset-2 hover:text-accent">The Pokemon Company FY26 financial results</a>,{" "}
          <a href="https://legalclarity.org/who-owns-psa-grading-parent-company-and-investors/" target="_blank" rel="noreferrer" className="underline decoration-dotted underline-offset-2 hover:text-accent">PSA/Collectors Universe take-private</a>,{" "}
          <a href="https://www.sportico.com/business/finance/2022/collectors-chernin-cohen-1234670529/" target="_blank" rel="noreferrer" className="underline decoration-dotted underline-offset-2 hover:text-accent">Collectors Holdings $4.3bn valuation — Sportico</a>,{" "}
          <a href="https://www.blackstone.com/news/press/blackstone-tactical-opportunities-to-acquire-the-certified-collectibles-group-a-leading-provider-of-tech-enabled-authentication-grading-and-conservation-services-for-the-global-collectibles-industry/" target="_blank" rel="noreferrer" className="underline decoration-dotted underline-offset-2 hover:text-accent">Blackstone acquires CCG — press release</a>,{" "}
          <a href="https://www.sportico.com/business/commerce/2025/cgc-cards-grading-collectibles-blackstone-1234865659/" target="_blank" rel="noreferrer" className="underline decoration-dotted underline-offset-2 hover:text-accent">CGC Cards growth vs. PSA — Sportico</a>,{" "}
          <a href="https://www.guinnessworldrecords.com/world-records/738103-highest-grossing-anime-franchise" target="_blank" rel="noreferrer" className="underline decoration-dotted underline-offset-2 hover:text-accent">Guinness World Records, highest-grossing media franchise</a>,{" "}
          <a href="https://www.vgchartz.com/article/467940/pokemon-series-has-sold-over-515-million-units/" target="_blank" rel="noreferrer" className="underline decoration-dotted underline-offset-2 hover:text-accent">515m+ lifetime game units — VGChartz</a>,{" "}
          <a href="https://www.statista.com/statistics/1347322/pokemon-scarlet-and-violet-units-sold" target="_blank" rel="noreferrer" className="underline decoration-dotted underline-offset-2 hover:text-accent">Scarlet/Violet unit sales — Statista</a>, and the{" "}
          <a href="https://www.pocketmonsters.net/news/7784" target="_blank" rel="noreferrer" className="underline decoration-dotted underline-offset-2 hover:text-accent">License Global Top Global Licensors ranking</a>.
        </p>
      </section>

      {/* Case study */}
      <section className="mt-10">
        <h2 className="font-mono text-sm uppercase tracking-widest text-muted">
          Case Study — Is It Actually Volatile?
        </h2>
        <p className="mt-0.5 text-xs text-muted/70">
          PSA 10, 1st Edition Base Set Charizard — the single most-tracked card in the hobby.
        </p>
        <div className="mt-4 rounded-sm border border-border bg-surface/40 p-5">
          <p className="text-sm text-foreground">
            Real answer: yes, individual cards are genuinely volatile — but the shape of
            that volatility matters. A PSA 10 1st-edition Charizard sold for{" "}
            <span className="font-semibold">$18,900 in July 2017</span> — and then, per
            data tracker Card Ladder, has{" "}
            <span className="font-semibold">no publicly recorded sale at all until 2020</span>,
            a real documented gap in the market itself, not a hole in this research. From
            there it went to a{" "}
            <span className="font-semibold">$420,000 peak in March 2022</span>, corrected
            roughly 40% to the $250,000s by late 2022 — and then set a{" "}
            <span className="font-semibold">new all-time record of $550,000</span>{" "}
            at Heritage Auctions in December 2025. That&apos;s a real drawdown sitting inside a
            longer structural uptrend, not the one-way collapse that defines an actual
            crashed asset (see the sports-card comparison below).
          </p>
          <div className="mt-4">
            <CharizardChart data={CHARIZARD_PRICE_HISTORY} />
          </div>
          {liveHolo && (
            <p className="mt-3 text-xs text-muted">
              For comparison — a live, ungraded/unlimited-edition holo Charizard (a
              completely different, far more common card than the graded 1st-edition
              above) currently trades for a real market price of{" "}
              <span className="font-semibold text-foreground">
                ${liveHolo.marketPrice?.toFixed(2)}
              </span>{" "}
              on TCGPlayer, via this module&apos;s own live feed.{" "}
              <Link href="/pokemon/base1-4?lang=en" className="underline decoration-dotted underline-offset-2 hover:text-accent">
                See the live card page →
              </Link>
            </p>
          )}
        </div>
      </section>

      {/* $30 in 1999 comparison */}
      <section className="mt-10">
        <h2 className="font-mono text-sm uppercase tracking-widest text-muted">
          $30 In 1999 — Card Vs. Market
        </h2>
        <p className="mt-0.5 text-xs text-muted/70">
          A PSA 10 1st-Edition Charizard against $30 in the S&amp;P 500, dividends reinvested.
        </p>
        <div className="mt-4 rounded-sm border border-border bg-surface/40 p-5">
          <p className="text-sm text-foreground">
            $30 in the S&amp;P 500 in January 1999 — dividends reinvested, real Yahoo
            Finance adjusted-close data — is worth about{" "}
            <span className="font-semibold">$261 today</span>, roughly 9x. The same $30
            put toward a 1st-Edition Charizard that later graded a PSA 10 would be
            worth <span className="font-semibold">$550,000</span>{" "}
            as of its most recent public auction record — over 18,000x. That gap is real and enormous, and
            it&apos;s also the least representative comparison possible: it&apos;s the
            single most valuable specific outcome in the entire hobby, not a typical one.
          </p>
          <div className="mt-4">
            <ThirtyDollarChart data={THIRTY_DOLLAR_COMPARISON} />
          </div>
          <div className="mt-4 rounded-lg border border-border bg-background/60 p-4 text-xs text-muted">
            <p className="font-semibold text-foreground">
              Exactly how solid each side of this chart actually is:
            </p>
            <p className="mt-1.5">
              <span className="font-semibold text-foreground">The S&amp;P 500 line is fully real</span>{" "}
              — pulled directly from Yahoo Finance&apos;s own public chart data, using
              the dividend-and-split-adjusted (&ldquo;Adj Close&rdquo;) price, the
              correct basis for a genuine total-return comparison rather than raw price
              appreciation alone.
            </p>
            <p className="mt-1.5">
              <span className="font-semibold text-foreground">The Charizard line is honestly weaker before mid-2017.</span>{" "}
              The $30 starting point is the entry price this comparison was asked to
              use — treated here as a stated assumption (roughly what a raw copy or a
              few packs cost at release), not a documented sale. A specific, dated
              PSA 10 sale record for 1999 through mid-2017 isn&apos;t something this
              research could verify: PriceCharting, PWCC, and Heritage Auctions all
              blocked automated access when checked directly. From July 2017 (a real
              $18,900 sale via PWCC, documented by Beckett News) onward, every point is
              a real, publicly reported sale — including the documented fact, per data
              tracker Card Ladder, that no PSA 10 sale of this card is publicly
              recorded at all between 2017 and 2021 — the hollow dashed dot on the
              chart is the one assumption (1999); every filled dot is a real transaction.
            </p>
          </div>
        </div>
      </section>

      {/* Why hasn't it crashed */}
      <section className="mt-10">
        <h2 className="font-mono text-sm uppercase tracking-widest text-muted">
          The Comparison That Actually Matters
        </h2>
        <p className="mt-0.5 text-xs text-muted/70">
          Every hype cycle eventually gets compared to something that crashed. Here&apos;s the honest one.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded-sm border border-border bg-surface/40 p-5">
            <h3 className="text-sm font-semibold text-foreground">
              1990s &ldquo;Junk Wax&rdquo; baseball cards — the real cautionary tale
            </h3>
            <p className="mt-2 text-sm text-muted">
              At the peak of the early-1990s craze, manufacturers printed an estimated{" "}
              <span className="font-semibold text-foreground">81 billion baseball cards a year</span>{" "}
              — about 325 for every person in America — chasing demand with no regard for
              scarcity. When the 1994 MLB strike broke collector confidence, the market
              never recovered: revenue fell to roughly{" "}
              <span className="font-semibold text-foreground">1/7th of its peak</span>, and
              most of that era&apos;s cards are worth about a cent each today.
            </p>
          </div>
          <div className="rounded-sm border border-border bg-surface/40 p-5">
            <h3 className="text-sm font-semibold text-foreground">
              Pokemon is running the same risk — just hasn&apos;t hit it (yet)
            </h3>
            <p className="mt-2 text-sm text-muted">
              Being honest about the parallel: Pokemon&apos;s own print runs are
              accelerating too — the same &ldquo;print more to chase demand&rdquo;
              instinct that broke the sports-card market. What&apos;s different so far is
              that demand has kept pace (PSA grading volume up 95% year-over-year, not
              declining) — but a real structural stress-test (a recession, a sharp fall in
              new-collector demand) is something this specific boom hasn&apos;t faced yet.
              The comparison isn&apos;t reassuring by default; it&apos;s a real risk worth
              tracking, not dismissing.
            </p>
          </div>
        </div>
      </section>

      {/* SWOT */}
      <section className="mt-10">
        <h2 className="font-mono text-sm uppercase tracking-widest text-muted">
          SWOT — Investing In The Category
        </h2>
        <p className="mt-0.5 text-xs text-muted/70">
          Framed the way an analyst would frame any alternative asset — not advice, see the disclosure below.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <SwotBlock title="Strengths" entries={SWOT.strengths} tone="positive" />
          <SwotBlock title="Weaknesses" entries={SWOT.weaknesses} tone="negative" />
          <SwotBlock title="Opportunities" entries={SWOT.opportunities} tone="positive" />
          <SwotBlock title="Threats" entries={SWOT.threats} tone="negative" />
        </div>
      </section>

      {/* Honesty section */}
      <section className="mt-10 rounded-sm border border-border bg-surface/40 p-5">
        <h2 className="font-mono text-sm uppercase tracking-widest text-muted">
          What Isn&apos;t Actually Knowable Here
        </h2>
        <ul className="mt-3 space-y-2 text-sm text-muted">
          <li>
            <span className="font-semibold text-foreground">No continuous 30-year demand series exists.</span>{" "}
            The Pokemon Company discloses cumulative production at scattered points, not a
            clean annual series back to 1996 — the chart above only covers 2020 onward
            because that&apos;s genuinely as far back as public, dated figures go.
          </li>
          <li>
            <span className="font-semibold text-foreground">
              &ldquo;Market size&rdquo; estimates disagree by 3-5x across research firms
            </span>{" "}
            (figures found ranging from roughly $9bn to $52bn for what&apos;s nominally the
            same 2026 market), depending entirely on methodology and what&apos;s counted —
            there is no single authoritative number, and any report presenting one without
            that caveat is oversimplifying.
          </li>
          <li>
            <span className="font-semibold text-foreground">
              There is no real &ldquo;dollar trading volume&rdquo; figure
            </span>{" "}
              the way a stock exchange publishes one. PSA grading volume and eBay&apos;s
            share of listings are real, genuine liquidity proxies — not the same thing as
            an actual consolidated trading tape, which doesn&apos;t exist for this market.
          </li>
        </ul>
      </section>

      <p className="mt-8 text-xs text-muted/70">
        Real, sourced data as of July 2026 — not investment advice, and not a recommendation
        to buy, sell, or collect anything.
      </p>
    </div>
  );
}

function SwotBlock({
  title,
  entries,
  tone,
}: {
  title: string;
  entries: { point: string; detail: string }[];
  tone: "positive" | "negative";
}) {
  return (
    <div className="rounded-sm border border-border bg-surface/40 p-5">
      <h3
        className={`text-sm font-semibold ${tone === "positive" ? "text-positive" : "text-negative"}`}
      >
        {title}
      </h3>
      <ul className="mt-2 space-y-3">
        {entries.map((e) => (
          <li key={e.point}>
            <p className="text-sm font-medium text-foreground">{e.point}</p>
            <p className="mt-0.5 text-xs text-muted">{e.detail}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
