// The Lessons module: real educational content on the topics this site's
// own gap-analysis flagged as missing for a banking/asset-management
// career — fixed income, three-statement modeling, technical interview
// fundamentals, options/derivatives, FX, and reading a real deal. Built
// as a consistent set (not just the topics Adam personally asked about)
// so the module reads as a real curriculum, not a cherry-picked list.
// Same "never invent a number" discipline as the rest of this site —
// where a lesson uses a real company/market example, it's dated and
// sourced like anything else here.

export type Lesson = {
  slug: string;
  title: string;
  tagline: string;
  category: string;
  body: string;
};

export const LESSONS: Lesson[] = [
  {
    slug: "fixed-income-and-credit",
    title: "Fixed Income & Credit",
    tagline: "Bonds, yield curves, and credit spreads — the half of finance this site had been skipping",
    category: "Markets",
    body: `# Fixed Income & Credit

Everything else on this site leans equity — stock prices, P/E ratios, DCFs. But a huge share of both banking (DCM, leveraged finance, credit) and asset management is fixed income, not equities. This lesson is the foundation: what a bond actually is, how it's priced, what a yield curve means, and how credit risk gets priced into spreads.

## What a bond actually is

A bond is a loan, packaged as a tradeable security. When you buy a bond, you're lending money to whoever issued it (a government, a company) in exchange for two things: regular interest payments (the **coupon**) and your money back at a fixed future date (the **face value**, paid at **maturity**).

That's it — the entire instrument is defined by three numbers: **face value** (usually $1,000 or $100 per bond, the amount you get back), **coupon rate** (the annual interest rate, paid on the face value), and **maturity** (when you get the face value back).

## Why bond prices move opposite to interest rates — the single most important fixed-income intuition

This is the concept every fixed-income interview question eventually circles back to, so get it cold: **when interest rates rise, existing bond prices fall — and vice versa.**

Here's why, with a real mechanism, not just a memorized rule: say you own a bond paying a 3% coupon. If new bonds start being issued paying 5% (because interest rates rose), nobody wants to buy your old 3% bond at its original price anymore — why would they, when they could get a new bond paying more? So the *price* of your old bond has to fall until its effective yield (coupon ÷ price, roughly) becomes competitive with the new 5% bonds. The coupon payment is fixed — it's the price that has to adjust.

## Yield vs. coupon — they're not the same thing

The coupon rate is fixed at issuance and never changes. The **yield** is what you actually earn based on what you *paid* for the bond, which moves with its market price.

- Bond trading at **face value (par)**: yield = coupon rate.
- Bond trading **below** face value (a "discount"): yield > coupon rate (you're getting the same fixed coupon, but you paid less for it, so your effective return is higher).
- Bond trading **above** face value (a "premium"): yield < coupon rate.

**Yield to maturity (YTM)** is the more complete version of this — the total annualized return you'd earn if you bought the bond today and held it to maturity, coupons and all. This is the number that actually gets quoted and compared across bonds.

## The yield curve — what it is, and why an inverted one makes headlines

Plot the yield of bonds from the same issuer (usually the US government, since Treasuries are the cleanest reference point) against their maturities — 3-month, 2-year, 10-year, 30-year — and you get the **yield curve**.

**Normal shape:** longer maturities yield more than shorter ones. This makes intuitive sense — locking your money up for 30 years carries more risk (inflation could erode your fixed coupon, the issuer could face more can-happen-in-30-years risk) than locking it up for 3 months, so investors demand more yield to compensate.

**Inverted yield curve:** short-term yields exceed long-term yields — genuinely unusual, and one of the most closely watched recession-warning signals in markets (specifically the 10-year vs 2-year spread going negative). The logic: if investors expect the central bank to cut rates sharply in the future (because they expect a slowdown), they'll accept a lower yield on long-dated bonds now to lock in today's still-higher rate before it's gone — pulling long-end yields below short-end yields.

You can see a real bank's current policy rate and how it's moved on this site's own [Central Bank Room](/macro) — the policy rate is the anchor the short end of every yield curve is built around.

## Credit spreads — how bond markets price default risk

Not every bond has the same risk of the issuer failing to pay you back. A US Treasury is treated as essentially default-risk-free (the government can, worst case, print the money). A struggling company's bond carries real default risk. The market prices that difference as a **credit spread** — the extra yield a risky bond pays *over* a same-maturity Treasury.

- **Investment grade (IG):** rated BBB-/Baa3 or higher (S&P/Moody's scales) — lower default risk, tighter spreads.
- **High yield (HY, "junk"):** rated below that — real default risk, much wider spreads, more volatile in a downturn (spreads *widen* sharply when investors get nervous about defaults, which is why "credit spreads blowing out" is a classic recession-fear headline).

The mechanics: if a BBB-rated company's bond yields 5.5% while a same-maturity Treasury yields 4%, that company's credit spread is 1.5 percentage points (150 basis points) — the market's real-time price on "how likely is this company to not pay me back."

## Duration — the one number that tells you how much a bond's price will move

**Duration** is a measure of a bond's sensitivity to interest rate changes, expressed in years. As a rule of thumb: a bond with a duration of 7 will lose roughly 7% of its value if rates rise by 1 percentage point (and gain roughly 7% if rates fall by 1 point).

Two things drive duration higher: **longer maturity** (more years for rate changes to matter) and **lower coupon** (more of the bond's value sits in the single final face-value payment, further in the future, rather than being returned earlier via coupons — a zero-coupon bond has the highest duration of all for its maturity).

**Convexity** is the next-level refinement: duration itself isn't perfectly constant — it changes as rates move, and convexity measures that curvature. You don't need to compute convexity by hand for a first-round interview, but knowing that duration is an approximation, not an exact formula, is the kind of nuance that separates a real answer from a memorized one.

## What this actually looks like in an interview

A realistic fixed-income technical question isn't "define duration" — it's something like: *"A company's credit rating gets downgraded from A to BB. What happens to its existing bonds' prices, and why?"* Answer: the credit spread widens (the market now demands more yield for the added default risk), and since the coupon is fixed, the bond's *price* has to fall to make the yield line up with that wider required spread — the exact same "price adjusts because coupon can't" mechanism from earlier in this lesson, just triggered by credit risk instead of rate risk.

That's the actual skill this lesson is trying to build: not memorizing definitions, but being able to trace *why* a bond's price moves, from first principles, under a scenario you haven't seen phrased that exact way before.
`,
  },
  {
    slug: "three-statement-modeling",
    title: "Three-Statement Modeling",
    tagline: "How the income statement, balance sheet, and cash flow statement actually link — the most commonly failed technical question in real interviews",
    category: "Accounting",
    body: `# Three-Statement Modeling

This is, honestly, the single most commonly failed technical question in real banking interviews — not because it's conceptually hard, but because most candidates have only ever seen the three statements separately, never watched them actually move together. This lesson builds the linkage by hand, with one concrete example, rather than just stating the rules.

## The three statements, in one sentence each

- **Income statement:** how much money the company made this period (revenue down to net income) — a *flow* over time.
- **Balance sheet:** what the company owns and owes at one *specific moment* — a snapshot, not a flow.
- **Cash flow statement:** where the company's actual cash came from and went during the period — because net income (an accounting figure, full of non-cash items and timing assumptions) is not the same thing as cash in the bank.

## The classic interview question: "Walk me through what happens to the three statements if depreciation increases by $10"

This is close to the single most common technical question asked in real interviews, precisely because answering it correctly requires you to actually understand the linkage, not just recite definitions. Walk through it slowly:

**1. Income statement:** Depreciation is an operating expense, so a $10 increase in depreciation **reduces operating income (EBIT) by $10**. Assume a 25% tax rate: pre-tax income falls by $10, so taxes owed fall by $10 × 25% = **$2.50**. Net income therefore falls by $10 − $2.50 = **$7.50**.

**2. Cash flow statement:** Start with net income (down $7.50). But depreciation is a **non-cash expense** — the company didn't actually pay out $10 in cash, it just recognized an accounting charge for an asset wearing out. So on the cash flow statement, you **add depreciation back**: −$7.50 (net income) + $10 (add back depreciation) = **cash flow from operations is actually UP $2.50**. This is the single most counter-intuitive, most-tested part of the whole exercise: an expense that *reduces* accounting profit can *increase* real cash — because the tax savings from that non-cash deduction ($2.50) is real cash the company didn't have to pay to the government.

**3. Balance sheet:** Cash is up $2.50 (from the cash flow statement above) → **assets side up $2.50**. Accumulated depreciation is up $10, which reduces net PP&E (property, plant & equipment) by $10 → **assets side down $10 from this**. Net effect on assets: +$2.50 − $10 = **down $7.50**. On the other side: retained earnings (part of equity) falls by the $7.50 drop in net income → **equity down $7.50**. Assets down $7.50, liabilities+equity down $7.50 — **the balance sheet still balances**. That's the whole test, and the reason this question gets asked: if your walk-through doesn't end with the balance sheet actually balancing, something in your logic was wrong.

## Why this matters more than memorizing the mechanic

An interviewer doesn't actually care whether you can recite "depreciation is added back on the cash flow statement" — every prep book says that. What they're testing is whether you understand *why*, well enough to handle a variant you haven't memorized: What if it's an increase in accounts receivable instead of depreciation? (Net income unaffected on the income statement, but cash flow from operations falls — you booked the sale as revenue, but haven't actually collected the cash yet, so accounts receivable, an asset, goes up while cash doesn't.) What about a stock buyback funded by new debt? (Cash out, treasury stock up on equity side — reducing equity — debt up on the liability side, cash swings through financing activities, not operations.)

The skill is tracing *any* transaction through all three statements from first principles — not having three memorized answers for three memorized questions.

## The five words that make this teachable: "where did the cash go"

Every line item on the cash flow statement is answering one question: for this specific change, where did the actual cash go (or come from), and does that match what the income statement or balance sheet implied? If revenue went up but a receivable also went up by the same amount, the honest answer is: the cash hasn't arrived yet. If an expense was booked but no cash left the building (depreciation, stock-based compensation, deferred tax movements), the honest answer is: add it back, because the income statement charged you for something that isn't a real cash outflow this period.

## How to actually practice this

This site's own [Company Profile](/profile) module pulls real 10-K figures for any US-listed company — real revenue, real depreciation, real changes in working capital, straight from SEC filings. Pick a real company, pull up two consecutive years of its balance sheet, and try to explain *every single line item's change* using only its income statement and cash flow statement for that year. If you can't explain a line, that's exactly the kind of gap this exercise is built to surface before an interviewer finds it for you.
`,
  },
  {
    slug: "technical-interview-fundamentals",
    title: "Technical Interview Fundamentals",
    tagline: "Turning this site's own DCF/LBO/M&A/Comps templates into an interview-ready walkthrough, not just tools",
    category: "Valuation",
    body: `# Technical Interview Fundamentals

This site already has real, working DCF, LBO, M&A, and Trading Comps templates in [Model Templates](/templates) — genuinely useful tools once you already know what you're doing. This lesson is the missing piece: turning those same four concepts into the specific, plain-language answers an interviewer is actually listening for.

## "Walk me through a DCF"

This is close to the single most-asked technical question in finance interviews, across every seat type. The full mechanics live in the [valuation learning plan in The Vault](/research#valuation-plan) — here's the compressed, interview-ready version, in the order you should actually say it out loud:

1. **Forecast unlevered free cash flow** for 5ish years — start from revenue, apply a margin assumption to get to EBIT, tax-affect it, add back D&A, subtract capex and the change in net working capital.
2. **Discount those cash flows back to today** using the company's WACC (weighted average cost of capital) — the blended return investors require given the company's mix of debt and equity.
3. **Estimate a terminal value** for everything beyond the forecast window — either a perpetuity growth rate (assume cash flow grows modestly forever) or an exit multiple (assume the business sells for a typical trading multiple in the final year). Discount that back too.
4. **Sum the discounted cash flows and the discounted terminal value** to get Enterprise Value.
5. **Bridge to equity value**: subtract net debt, divide by shares outstanding to get a per-share value.
6. **Compare to the current share price.**

The one line that signals real understanding, not memorization: *"A DCF is only as good as its assumptions — I'd always sensitize it across a range of WACC and terminal growth, not present one number as if it were precise."* Interviewers hear the six-step recitation constantly; they remember the candidate who volunteers the caveat unprompted.

## "Walk me through an LBO"

The core question an LBO answers: can a private equity firm buy this company mostly with borrowed money, use the company's own cash flow to pay that debt down, and sell it later for a return that justifies the risk?

1. **Sources & Uses**: how much of the purchase price comes from debt vs. the sponsor's own equity (typically 60-70% debt in a traditional LBO).
2. **Build a debt paydown schedule**: the company's free cash flow each year goes toward paying down that debt (mandatory amortization plus, often, a cash sweep).
3. **Project an exit** in year 3-7, usually at a similar multiple to what was paid at entry (assuming no multiple expansion, the conservative assumption).
4. **Back out returns**: the sponsor's equity check at entry vs. what they receive at exit (equity value at exit = enterprise value at exit minus remaining debt) gives you IRR and MOIC (multiple on invested capital).

The interview-ready insight: LBO returns come from three levers — **debt paydown** (the company's own cash flow reducing what's owed), **multiple expansion** (selling for a higher multiple than you paid, not guaranteed), and **EBITDA growth** (the business actually getting bigger). A good candidate can name which lever is doing the most work in a given deal, not just recite the mechanic.

## "Walk me through an M&A model" (accretion/dilution)

The question this answers: if Company A buys Company B, does the deal increase or decrease Company A's earnings per share?

1. **Combine the two companies' financials.**
2. **Figure out the financing mix**: cash, new debt, new stock issued, or some blend — this single choice drives almost everything else.
3. **Compute pro forma net income** (combined, adjusted for financing costs — new interest expense if debt-funded, lost interest income if cash-funded).
4. **Compute pro forma shares outstanding** (up, if stock-funded).
5. **Pro forma EPS = pro forma net income ÷ pro forma shares.** Compare to the acquirer's standalone EPS: higher is "accretive," lower is "dilutive."

The nuance interviewers actually want: **a cheap deal funded with cash is almost always accretive; a deal funded with stock is accretive only if the acquirer's own P/E is higher than the target's** (a rule of thumb worth internalizing: buying a company at a lower P/E than your own, funded with your own richly-valued stock, is basically always accretive — that's the entire logic behind why high-multiple acquirers can "buy" earnings growth via stock deals). And, as covered in the valuation plan: **accretive doesn't automatically mean "good deal."** A strategically sound acquisition can be dilutive for a year or two before it pays off — EPS math is not the same thing as value creation.

## "Walk me through a comps analysis"

The simplest of the four, and often underestimated because of that:

1. **Pick a genuinely comparable peer set** — same industry, similar size, similar growth/margin profile (not just "same sector label").
2. **Compute each peer's multiples**: P/E, EV/EBITDA, EV/Sales, P/B.
3. **Take the peer median** (not average — one outlier shouldn't swing the read).
4. **Apply that median multiple to your subject company's own metric** to get an implied valuation, and compare to where it actually trades.

The answer that signals real judgment: *"If my subject trades meaningfully below the peer median, that's not automatically a buy signal — it could mean the market is pricing in something real (weaker growth, more leverage, governance risk) that a simple multiple doesn't capture."* This is the exact discipline this site's own [Hype vs Fundamentals](/hype) module is built around: a gap between price and multiple is a question to investigate, not an automatic conclusion.

## Practice on this site

Every one of these four models exists as a real, downloadable template in [Model Templates](/templates), prefilled with real data for any company you pick — every cell is a live Excel formula, so you can trace exactly how changing one assumption moves the whole output. The [Trading Comps template](/templates) specifically supports up to six real peers with real prefilled multiples, which is the fastest way to build genuine pattern-recognition for what a "normal" versus "unusual" comps table actually looks like.
`,
  },
  {
    slug: "options-and-derivatives",
    title: "Options & Derivatives",
    tagline: "Calls, puts, and the Greeks — how an S&T desk actually thinks about risk",
    category: "Markets",
    body: `# Options & Derivatives

If S&T (sales & trading) is a real door you want to keep open, this is the single biggest content gap on this site to close. Options aren't just a trading product — they're a different *way of thinking about risk* than anything covered in the valuation-focused lessons elsewhere on this site, and interviewers on a trading desk will test for that specific mode of thinking.

## What an option actually is

A **call option** gives you the right (not the obligation) to *buy* an asset at a fixed price (the **strike price**) before or at a fixed date (**expiration**). A **put option** gives you the right to *sell* at a fixed price.

You pay a price for that right — the **premium** — regardless of whether you ever use it. That asymmetry (limited, known downside for the buyer; theoretically much larger potential upside) is the entire appeal of buying options, and it's exactly mirrored by the seller ("writer") of the option taking on the other side of that trade: limited premium income, potentially large risk.

## Intrinsic value vs. time value — the two components of an option's price

An option's premium splits into two pieces:

- **Intrinsic value**: how much the option would be worth if exercised *right now*. A call with a $50 strike on a stock trading at $60 has $10 of intrinsic value (you could exercise, buy at $50, immediately sell at $60). An option with no intrinsic value (strike above the current price, for a call) is "out of the money."
- **Time value**: everything else in the premium — compensation for the *possibility* the option becomes more valuable before expiration. Time value shrinks as expiration approaches (a well-known effect called **theta decay** — more on this below) and hits zero exactly at expiration, when only intrinsic value remains.

## The Greeks — not scary math, just five real, intuitive sensitivities

Each "Greek" answers one specific question: how much does the option's price change if one input changes, holding everything else constant?

- **Delta**: how much the option's price moves for a $1 move in the underlying stock. A call with delta 0.5 gains about $0.50 if the stock rises $1. Delta also doubles as a rough probability estimate: a delta-0.5 option is roughly a coin-flip to finish in the money.
- **Gamma**: how much delta *itself* changes as the stock moves — the rate of change of the rate of change. High gamma means an option's sensitivity is shifting fast, which matters most for options trading near their strike price close to expiration.
- **Theta**: how much value the option loses purely from the passage of one day, all else equal — "time decay." This is why options are sometimes described as a wasting asset: every day that passes without the stock moving in your favor, you lose a little value, just from the clock ticking.
- **Vega**: how much the option's price changes if implied volatility (the market's expectation of future price swings) changes by 1 percentage point. Higher expected volatility makes an option more valuable in both directions (more chance of a big favorable move), so vega is always positive for both calls and puts, for the option *buyer*.
- **Rho**: sensitivity to interest rate changes — real, but the least important of the five for most day-to-day trading intuition.

## Why volatility itself is the product, not just an input

This is the mental shift that separates someone with real options intuition from someone who's just memorized the Greeks: **an option's price is fundamentally a bet on volatility, not just direction.** You can be right about a stock going up and still lose money on a call option, if implied volatility collapses enough after you buy it (a real, common pattern — buying options right before an earnings announcement, then watching volatility crush *after* the announcement even if the stock moved the "right" way).

This is why options traders talk in terms of **implied volatility (IV)** as much as, or more than, they talk about direction — IV is the market's own real-time estimate of how much a stock will move, backed out from actual option prices, and trading IV itself (rather than direction) is a huge part of what an options desk actually does day to day.

## A concrete example, worked through

Say a stock trades at $100. You buy a call with a $105 strike, expiring in one month, for a $3 premium.

- **Break-even at expiration**: $105 (strike) + $3 (premium paid) = **$108**. The stock needs to be above $108 at expiration just for you to break even, not merely above $105.
- **If the stock finishes at $103**: the option is worth $0 (out of the money, below the $105 strike) — you lose the full $3 premium.
- **If the stock finishes at $112**: intrinsic value is $112 − $105 = $7. You paid $3, so your profit is $4 — a genuinely large percentage return on the $3 you risked, which is exactly the "limited downside, leveraged upside" appeal that makes options attractive to buyers.

## What an interviewer is actually testing

A realistic first-round options question sounds like: *"If I own a call option and the stock doesn't move at all, but a week passes, what happens to my option's value, and why?"* The correct answer traces directly back to theta: pure time decay, with no directional move to offset it, means the option loses value — and the ability to say *why* (time value shrinking as expiration approaches, with fewer days left for a favorable move to happen) is the actual skill being tested, not the vocabulary word "theta" on its own.
`,
  },
  {
    slug: "fx-as-an-asset-class",
    title: "FX as an Asset Class",
    tagline: "Why an S&T or macro-fund interviewer will ask for your currency view — and how to actually have one",
    category: "Markets",
    body: `# FX as an Asset Class

"What's your view on GBPUSD, and why?" is a genuinely common S&T and macro-fund interview question, and it trips up candidates who've only ever thought about currencies as a conversion rate rather than something you can have an actual investment view on. This site already uses FX conversion as background plumbing (converting HK$ prices to USD for valuation multiples) — this lesson is about the asset class itself.

## The quoting convention, and why it trips people up

A currency pair like **GBP/USD = 1.27** means 1 British pound buys 1.27 US dollars. GBP is the **base currency** (the thing being priced), USD is the **quote currency** (what it's priced in). If GBP/USD *rises*, the pound has strengthened against the dollar (each pound now buys more dollars) — equivalently, the dollar has weakened against the pound. Every FX move is, by definition, about *both* currencies at once; there's no such thing as "the dollar went down" without some other currency going up against it.

## Interest rate differentials — the single biggest driver of currency moves

This is the concept that connects FX directly to everything the [Central Bank Room](/macro) on this site already covers: **money tends to flow toward the currency offering the higher real (inflation-adjusted) interest rate**, because investors can borrow in a low-yielding currency, convert to a high-yielding one, and earn the spread — a strategy called the **carry trade**.

If the Fed holds rates meaningfully higher than the ECB, all else equal, that tends to support USD strength against EUR — real money is incentivized to hold dollar-denominated assets for the extra yield. This is exactly why a currency trader watches central bank policy decisions as closely as an equity analyst watches earnings: a rate decision is a direct, mechanical input into currency demand, not just background macro noise.

**The real risk in a carry trade, worth knowing for an interview:** it works smoothly until it doesn't — a sudden shift in risk sentiment can cause a rapid, painful unwind (investors rushing to close carry positions all at once), which is why "carry trades unwinding" is a recurring phrase in real market-stress episodes. The extra yield you earn while it's calm is compensation for that tail risk, not free money.

## Purchasing power parity — the long-run anchor, even though it's a bad short-term predictor

**Purchasing Power Parity (PPP)** is the idea that, in the long run, exchange rates should adjust so that the same basket of goods costs the same amount in any currency. The Economist's famous "Big Mac Index" is a real, simplified illustration of this: if a Big Mac costs $5 in the US and the "equivalent" price in another currency implies it should cost $4 there once converted at the current exchange rate, PPP suggests that currency is undervalued relative to the dollar.

The honest caveat, and the reason this matters for an interview answer rather than just trivia: PPP is a genuinely poor *short-term* predictor (exchange rates can deviate from PPP for years, driven by rate differentials, capital flows, and sentiment) but a real anchor over long horizons. A good answer references both — PPP as the long-run gravity, rate differentials and flows as what actually moves the pair day to day.

## Trade balances and capital flows

A country running a persistent **trade deficit** (importing more than it exports) is, mechanically, sending more of its own currency abroad to pay for those imports than it's receiving back — a structural headwind for that currency, all else equal, unless offset by strong capital inflows (foreign investors buying that country's stocks, bonds, or real estate, which requires them to buy the currency first). This is why a country can run a large trade deficit and still have a strong currency, if capital inflows are strong enough to offset it (the US has run persistent trade deficits for decades while the dollar remains the world's reserve currency, precisely because global capital keeps flowing into US assets).

## How to actually build a real FX view — the interview-ready structure

A strong answer to "what's your GBPUSD view" doesn't need to be right — it needs to show you're weighing the real, correct inputs:

1. **Rate differential**: which central bank is more hawkish (higher-for-longer) right now — check this site's own [Central Bank Room](/macro) for the real current Fed and BoE policy rates and their recent trajectory, not a guess.
2. **Growth differential**: which economy's growth outlook is stronger (weaker growth typically pressures a currency, since it implies future rate cuts).
3. **Risk sentiment**: is the market in "risk-on" mode (typically favors higher-yielding, more volatile currencies) or "risk-off" (typically favors safe havens — historically USD, JPY, CHF)?
4. **Flows and positioning**: is there a structural reason capital is flowing into or out of one side (trade balances, large M&A deals requiring currency conversion, sovereign wealth fund rebalancing)?

Naming these four inputs, even briefly, and being explicit about which one you're weighting most heavily and why, is a dramatically stronger answer than a directional guess with no framework behind it.
`,
  },
  {
    slug: "reading-a-real-deal",
    title: "Reading a Real Deal",
    tagline: "What an actual M&A deal announcement contains, and how to read one like an analyst instead of a headline",
    category: "Deals",
    body: `# Reading a Real Deal

Every prep guide teaches the accretion/dilution mechanics of an M&A model (also covered in [Technical Interview Fundamentals](/lessons/technical-interview-fundamentals) on this site). Far fewer teach you how to actually read a real deal announcement and pull out what an analyst would — which is precisely the skill that makes "walk me through a deal you've been following" a genuinely differentiating interview answer instead of a generic one.

## What's actually in a real deal announcement

When two public companies announce an M&A deal, the press release and accompanying filings contain a specific, recurring set of facts worth training yourself to find fast:

- **Consideration**: is the target being bought for cash, stock, or a mix? This single fact tells you more about the deal's real character than almost anything else — an all-cash deal signals the acquirer has (or is borrowing) real capital and wants certainty; a stock deal means target shareholders are betting on the combined company's future, and its value moves with the acquirer's own share price between announcement and close.
- **The premium**: the offer price compared to the target's *undisturbed* share price (typically measured right before the announcement, or averaged over the preceding 30-90 days to avoid one noisy day skewing the read). A takeover premium in the 20-40% range is typical for a negotiated deal; a much lower premium can signal a weak negotiating position for the target's board, or a company already trading near fair value.
- **Deal multiple**: EV/EBITDA or EV/Sales the acquirer is paying, and how that compares to where public peers trade — this is the trading-comps skill from the earlier lesson, applied to a real transaction instead of a hypothetical.
- **Financing**: for a cash deal, is it funded from the acquirer's own balance sheet cash, new debt, or a mix? A highly-levered financing package is a real signal about how confident the acquirer is in the combined company's future cash flow (since that debt has to be serviced from it).
- **Strategic rationale, in management's own words**: every deal press release states a rationale (cost synergies, revenue synergies, market consolidation, vertical integration) — and a real analyst's job is to ask whether that stated rationale is actually the most likely explanation, or a more palatable public framing of something else (defending market share, pre-empting a competitor's bid, management empire-building).
- **Expected close timeline and regulatory conditions**: does the deal need antitrust approval in multiple jurisdictions? A deal combining the two largest players in a concentrated industry faces real regulatory risk that a deal between smaller, non-overlapping players doesn't — which is why the market often prices a real "deal spread" (the target's stock trading below the offer price, reflecting the probability the deal doesn't close) for deals with genuine regulatory uncertainty.

## Why the market's reaction is itself a data point, not just noise

When a deal is announced, watch both stocks, not just the target's (which almost always jumps toward the offer price). **The acquirer's stock reaction is the more informative one**: a falling acquirer share price on deal announcement is the market's real-time verdict that it's skeptical of the price paid, the financing structure, or the strategic logic — a genuinely useful, immediate signal, since the market is pricing in expected value creation (or destruction) within minutes of the announcement, well before any of the promised synergies could possibly have materialized.

## How to actually build this skill

Pick one real, recent, sizable public M&A deal — something large enough to have real analyst coverage and press commentary, not an obscure small-cap transaction. Find the actual announcement and answer, for yourself, in writing: what's the consideration mix, what premium was paid, what multiple does that imply, how did *both* stocks react on announcement day and why, and what regulatory risk (if any) sits between announcement and close. Then find one piece of real analyst or press skepticism about the deal, and one piece of real support for it — the same "evidence on both sides, no forced verdict" discipline this site's own [Hype vs Fundamentals](/hype) module is built around.

Doing this once, properly, for one real deal, and being able to discuss it fluently in an interview — consideration, premium, multiple, market reaction, and a genuine view on the strategic logic — is worth more than being able to recite the accretion/dilution formula for a dozen hypothetical ones. Interviewers can tell the difference between a candidate who followed one real deal closely and one who only ever practiced on textbook examples.
`,
  },
];
