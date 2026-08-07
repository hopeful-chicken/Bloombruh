// "Finance 101" — a 13-chapter, start-to-end course for someone who just
// got into finance and doesn't yet know which seat they want: S&T, IBD,
// asset management, research, whatever. Replaces the old flat, six-lesson
// "Lessons" module (src/data/lessons.ts, now folded in here) with an
// actual curriculum that has a beginning and an end, chapter numbers, and
// — the whole point — is deliberately woven into the rest of this site.
// Every chapter ends with a short MCQ quiz (instant right/wrong feedback,
// see QuizBlock.tsx) and a "try it" section pointing at a real, live
// module on this site, so studying a concept here creates an actual
// reason to go use Company Profile, Central Bank Room, Markets Overview,
// Simulations, or Model Templates — not just read about them.
//
// Same discipline as the rest of the site: nothing here states a specific
// "recent" number or deal as fact, since that would go stale and break
// the site's own "never invent a number" rule. Where a chapter needs
// current examples (recent M&A, today's market trends), it points at
// My Analysis and Markets Overview — this site's own live, dated,
// sourced coverage — instead of writing something that expires.

export type QuizQuestion = {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

export type TryIt = {
  label: string;
  href: string;
  moduleColor?: "macro" | "pokemon" | "analysis";
  description: string;
};

export type Chapter = {
  number: number;
  slug: string;
  title: string;
  track: string;
  tagline: string;
  body: string;
  tryIt: TryIt[];
  templateLink?: { label: string; href: string };
  quiz: QuizQuestion[];
};

export const COURSE_CHAPTERS: Chapter[] = [
  // ————————————————————————————————————————————————————————————
  // 1. Welcome
  // ————————————————————————————————————————————————————————————
  {
    number: 1,
    slug: "how-the-industry-fits-together",
    title: "How the Industry Fits Together",
    track: "Foundations",
    tagline: "Buy-side vs. sell-side, and what every major seat in finance actually does day to day",
    body: `# How the Industry Fits Together

If you're new to finance, the job titles alone are confusing — "S&T," "IBD," "buy-side," "sell-side," "the Street." This chapter is the map: what each major seat actually does, who it serves, and how it makes money. Nothing here requires prior knowledge — that's the point of starting here.

## The one distinction that organizes everything else: buy-side vs. sell-side

**Sell-side** firms sell something to clients — advice, market access, research, capital-raising services. Investment banks are the classic sell-side example: they don't (mostly) invest their own money for their own account; they serve *other people's* money and other companies' needs, and get paid fees or spread for doing it.

**Buy-side** firms manage actual pools of money and invest it directly — asset managers, hedge funds, private equity firms, pension funds. They're the sell-side's clients. When you hear "the buy-side," think: the people actually deciding what to buy and sell with real capital.

Almost every seat in finance is one or the other. Keep this framing in your head through the rest of this course.

## Investment Banking (IBD) — sell-side

Investment bankers advise companies on two things: **raising capital** (helping a company sell new stock via an IPO — Equity Capital Markets, ECM — or issue new bonds — Debt Capital Markets, DCM) and **M&A advisory** (advising a company that's buying or selling another company). Banks get paid a fee, often a percentage of the deal or capital raised — which is why bankers are motivated to get deals *done*, not just to give good advice in the abstract.

**Worked example:** fee = deal value × fee %. A bank advises on a $2 billion acquisition and charges a 1% advisory fee: $2,000M × 1% = **$20 million**, typically paid on successful closing — nothing if the deal falls apart, which is exactly why "get it done" is such a strong incentive.

## Sales & Trading (S&T) — sell-side

S&T sits between the bank's clients (asset managers, hedge funds, corporations) and the market. **Sales** maintains the client relationships and takes their orders; **trading** executes those orders and manages the resulting risk, often by *making markets* — quoting both a buy and sell price and profiting from the spread between them. S&T doesn't (mostly) make big directional bets on where markets are going; it makes money on client flow and the spread, at scale.

## Equity Research — sell-side

Research analysts publish opinions (buy/hold/sell ratings, price targets) and detailed models on public companies, mostly to support the bank's S&T and banking clients — genuinely useful, independent-*seeming* analysis, though always worth reading with the awareness that the bank issuing it often also wants that company's future banking business.

## Asset Management (AM) — buy-side

Asset managers invest money on behalf of clients — pension funds, insurance companies, mutual fund investors, wealthy individuals — and charge a **management fee**, typically a small percentage of assets under management (AUM) per year, regardless of performance. The core job: build and manage a portfolio that matches a stated mandate (growth, income, a specific benchmark) as well as possible.

## Hedge Funds — buy-side

Similar to asset management in that they invest pooled capital, but with far more flexible mandates — they can short stocks, use leverage, trade derivatives, and pursue strategies public mutual funds usually can't. The classic fee structure, "**2 and 20**," means a 2% annual management fee plus 20% of profits — which is why hedge funds are far more performance-incentivized than a typical asset manager.

**Worked example:** a fund manages $500 million and returns 15% this year (a $75M profit).
- Management fee: 2% × $500M = **$10M**.
- Performance fee: 20% × $75M = **$15M**.
- Total fees this year: **$25M** — noticeably more than a pure management-fee-only structure (Asset Management, below) would generate on the same $500M, precisely because of that performance component.

## Private Equity (PE) — buy-side

PE firms buy entire companies (often using significant borrowed money — a **leveraged buyout**, or LBO), try to improve them operationally over a multi-year hold period, and sell them for a profit. Different time horizon and skill set from public-markets investing — PE is closer to operating a business than trading a security.

## Where this course is going

This course doesn't assume you already know which of these seats you want — most first-years don't. It's built to give you a real, working knowledge of all the major asset classes (equities, fixed income, commodities, FX) and both sides of the business (the deal-making side and the markets side), with hands-on exercises using this site's own live tools, so you can actually figure out what pulls you in rather than guessing from a job title.`,
    tryIt: [
      {
        label: "Open Company Profile",
        href: "/profile",
        description:
          "A quick tour before you dive in — pull up any real company and look at what a research analyst or an investor would actually see first.",
      },
      {
        label: "Try the Simulations",
        href: "/simulations",
        description:
          "Two of the seats above are directly playable on this site: run a trading book like an S&T desk, or build and stress-test a portfolio like an asset manager.",
      },
      {
        label: "Read My Analysis",
        href: "/analysis",
        moduleColor: "analysis",
        description: "Real, dated research write-ups and stock pitches — a look at what buy-side-style output actually reads like.",
      },
    ],
    quiz: [
      {
        question: "Which of these is a buy-side firm?",
        options: ["An investment bank's M&A advisory team", "A hedge fund", "An equity research department", "A bank's sales desk"],
        correctIndex: 1,
        explanation: "Hedge funds manage and invest pooled capital directly — the defining trait of the buy-side. The other three all serve clients rather than invest their own money for their own account.",
      },
      {
        question: "How does investment banking (IBD) primarily get paid?",
        options: ["A management fee on assets under management", "Fees, often tied to the size of a deal or capital raised", "A performance fee on trading profits", "Interest income on client deposits"],
        correctIndex: 1,
        explanation: "IBD is fee-based, usually a percentage of the deal value or capital raised — which is also why bankers are incentivized to get deals done, not just advise.",
      },
      {
        question: "What's the core difference between sales & trading and asset management?",
        options: [
          "S&T only trades bonds, AM only trades stocks",
          "S&T serves clients and captures spread on flow; AM invests client capital directly to meet a mandate",
          "There's no real difference",
          "AM is sell-side, S&T is buy-side",
        ],
        correctIndex: 1,
        explanation: "S&T is sell-side — it serves clients and makes money on spread and flow. AM is buy-side — it makes actual investment decisions with client money to meet a stated goal.",
      },
      {
        question: "What does \"2 and 20\" refer to?",
        options: [
          "A bond's coupon and maturity",
          "A typical hedge fund fee structure: 2% management fee, 20% of profits",
          "A P/E ratio benchmark",
          "The standard IPO discount",
        ],
        correctIndex: 1,
        explanation: "2% of assets under management per year, plus 20% of any profits generated — the classic hedge fund fee structure, and why hedge funds are unusually performance-incentivized.",
      },
    ],
  },

  // ————————————————————————————————————————————————————————————
  // 2. Equities
  // ————————————————————————————————————————————————————————————
  {
    number: 2,
    slug: "equities",
    title: "Equities: What a Stock Actually Is",
    track: "Asset Classes",
    tagline: "Ownership, market cap, and the handful of numbers everyone quotes without explaining",
    body: `# Equities: What a Stock Actually Is

Equities (stocks) are the asset class most people already have some intuition for — everyone's heard of the stock market. This chapter makes that intuition precise: what you actually own, how a company gets its shares onto a market in the first place, and the handful of numbers (market cap, P/E, EPS) that get quoted constantly without much explanation.

## A share is a slice of ownership, literally

If a company has 1,000,000 shares outstanding and you own 1,000 of them, you own 0.1% of that company — a tiny, literal slice of its assets, earnings, and future decisions (each share typically carries one vote at shareholder meetings). Stock isn't an abstract number that moves around; it's a legal claim on a real business.

## Market cap — the single most-quoted number in equities

**Market capitalization** = share price × shares outstanding. If a company trades at $50/share with 20 million shares outstanding, its market cap is $1 billion. This is "what the market currently thinks the whole company is worth" — and it's the number that determines whether a company gets called small-cap, mid-cap, or large-cap.

Market cap is *not* the same as **enterprise value (EV)** — a concept that comes up constantly in valuation work. EV = market cap + total debt − cash. The intuition: if you actually bought the whole company, you'd inherit its debt (a cost to you) and its cash (money you'd immediately get back) — EV captures what you'd really be paying for the underlying business, independent of how it happens to be financed.

**Worked example:** Company X has a $2,000M market cap, $500M of debt, and $200M of cash. EV = $2,000M + $500M − $200M = **$2,300M** — $300M more than market cap alone suggests, exactly reflecting the net debt an acquirer would actually inherit.

## How a company's shares end up tradeable in the first place

A private company's shares aren't publicly tradeable. An **IPO (Initial Public Offering)** is the process of selling shares to the public for the first time, usually with an investment bank's ECM team running the process — this is the **primary market** (the company itself receives the money raised). Every trade after that — you buying a share from someone else on an exchange — is the **secondary market**: the company itself doesn't receive a cent from those trades, but the trading is exactly what determines the share price the company's own performance gets measured against.

## The handful of numbers everyone quotes

- **EPS (Earnings Per Share)**: net income ÷ shares outstanding. If a company earns $100 million with 50 million shares out, EPS is $2.
- **P/E ratio (Price-to-Earnings)**: share price ÷ EPS. A stock trading at $40 with $2 EPS has a P/E of 20 — meaning investors are paying $20 for every $1 of current annual earnings. A higher P/E generally signals the market expects faster future growth (or, sometimes, that the stock is simply expensive relative to what it delivers — the same "is this justified or not" judgment call that shows up everywhere in this course).
- **Dividends vs. buybacks**: two ways a company returns cash to shareholders. A dividend is a direct cash payment per share. A **buyback** is the company repurchasing its own shares on the open market, which reduces shares outstanding — mechanically raising EPS for everyone who still holds shares, without paying anyone directly.

## Reading a real price chart

A **52-week range** shows a stock's lowest and highest price over the past year — a quick gut-check for whether a current price is near its highs (often read as strength or, less charitably, as "expensive") or lows (weakness, or "cheap" — the same ambiguity as a low P/E). **Volume** — how many shares traded — matters alongside price: a big price move on unusually high volume signals real conviction behind the move; the same move on thin volume is a weaker signal.`,
    tryIt: [
      {
        label: "Open Company Profile",
        href: "/profile",
        description:
          "Pull up any real, familiar company and find its actual market cap, P/E ratio, and EPS — the numbers in this chapter, but on a real business you recognize.",
      },
    ],
    quiz: [
      {
        question: "A company trades at $80/share with 10 million shares outstanding. What's its market cap?",
        options: ["$8 million", "$80 million", "$800 million", "$8 billion"],
        correctIndex: 2,
        explanation: "$80 × 10,000,000 = $800,000,000 — market cap is simply share price × shares outstanding.",
      },
      {
        question: "Why is enterprise value usually different from market cap?",
        options: [
          "EV ignores shares outstanding entirely",
          "EV adjusts market cap for the company's debt and cash, reflecting what you'd really pay to own the whole business",
          "EV is just market cap measured in a different currency",
          "They're always the same number",
        ],
        correctIndex: 1,
        explanation: "EV = market cap + debt − cash. Buying the whole company means inheriting its debt and immediately recovering its cash, so EV captures the real cost of the underlying business.",
      },
      {
        question: "What actually happens to a company's own cash balance when its stock trades on the secondary market?",
        options: [
          "The company receives the sale proceeds each time",
          "Nothing — the company only receives cash from primary-market issuance like an IPO",
          "The company's cash balance falls",
          "It depends on the exchange",
        ],
        correctIndex: 1,
        explanation: "Secondary-market trades are between investors — the company itself isn't a party to the transaction and receives no cash from it, even though the trading sets the price the company gets judged on.",
      },
      {
        question: "A company buys back 5% of its own shares. All else equal, what happens to EPS?",
        options: ["EPS falls", "EPS is unaffected", "EPS rises, since net income is now divided by fewer shares", "It depends on the share price"],
        correctIndex: 2,
        explanation: "EPS = net income ÷ shares outstanding. Fewer shares outstanding, same net income, means EPS mechanically rises — without the company having actually grown its earnings.",
      },
    ],
  },

  // ————————————————————————————————————————————————————————————
  // 3. Fixed Income & Credit  (adapted from the old lessons.ts entry)
  // ————————————————————————————————————————————————————————————
  {
    number: 3,
    slug: "fixed-income-and-credit",
    title: "Fixed Income & Credit",
    track: "Asset Classes",
    tagline: "Bonds, yield curves, and credit spreads — the other half of the market that isn't stocks",
    body: `# Fixed Income & Credit

Chapter 2 covered equities. This chapter covers the asset class that's actually larger by total value and just as central to both banking (DCM, leveraged finance) and asset management: fixed income. What a bond actually is, how it's priced, what a yield curve means, and how credit risk gets priced into spreads.

## What a bond actually is

A bond is a loan, packaged as a tradeable security. When you buy a bond, you're lending money to whoever issued it (a government, a company) in exchange for two things: regular interest payments (the **coupon**) and your money back at a fixed future date (the **face value**, paid at **maturity**).

That's it — the entire instrument is defined by three numbers: **face value** (usually $1,000 or $100 per bond, the amount you get back), **coupon rate** (the annual interest rate, paid on the face value), and **maturity** (when you get the face value back).

## Why bond prices move opposite to interest rates

This is the single most important fixed-income intuition, so get it cold: **when interest rates rise, existing bond prices fall — and vice versa.**

Here's the mechanism: say you own a bond paying a 3% coupon. If new bonds start being issued paying 5% (because interest rates rose), nobody wants to buy your old 3% bond at its original price anymore — why would they, when they could get a new bond paying more? So the *price* of your old bond has to fall until its effective yield becomes competitive with the new 5% bonds. The coupon payment is fixed — it's the price that has to adjust.

## Yield vs. coupon — not the same thing

The coupon rate is fixed at issuance and never changes. The **yield** is what you actually earn based on what you *paid* for the bond, which moves with its market price.

- Bond trading at **face value (par)**: yield = coupon rate.
- Bond trading **below** face value (a "discount"): yield > coupon rate.
- Bond trading **above** face value (a "premium"): yield < coupon rate.

**Yield to maturity (YTM)** is the more complete version — the total annualized return you'd earn if you bought the bond today and held it to maturity. This is the number that actually gets quoted and compared across bonds.

**Worked example (current yield, the simplest version):** current yield = annual coupon ÷ price. A bond with a $1,000 face value and a 4% coupon pays $40/year. If it's trading at $950: current yield = $40 ÷ $950 = **4.2%** — already above the 4% coupon rate, exactly because you're paying less than face value for the same fixed $40 payment. (Full YTM refines this further by also folding in the gain from $950 back up to $1,000 at maturity — current yield is the quick approximation.)

## The yield curve

Plot the yield of bonds from the same issuer (usually a government) against their maturities — 3-month, 2-year, 10-year, 30-year — and you get the **yield curve**.

**Normal shape:** longer maturities yield more than shorter ones — locking money up for longer carries more risk, so investors demand more yield to compensate.

**Inverted yield curve:** short-term yields exceed long-term yields — one of the most closely watched recession-warning signals in markets. The logic: if investors expect the central bank to cut rates sharply later (because they expect a slowdown), they'll accept a lower yield on long-dated bonds now to lock in today's still-higher rate before it disappears.

The policy rate you can look up in this site's own Central Bank Room is the anchor the short end of every yield curve is built around.

## Credit spreads — pricing default risk

Not every bond has the same risk of the issuer failing to pay you back. The market prices that difference as a **credit spread** — the extra yield a risky bond pays *over* a same-maturity government bond.

- **Investment grade (IG):** rated BBB-/Baa3 or higher — lower default risk, tighter spreads.
- **High yield (HY, "junk"):** rated below that — real default risk, much wider spreads, and spreads *widen* sharply when investors get nervous ("credit spreads blowing out" is a classic recession-fear headline).

## Duration — one number that tells you how much a bond's price will move

**Duration**, expressed in years, is a bond's sensitivity to rate changes. Rule of thumb: a bond with a duration of 7 will lose roughly 7% of its value if rates rise by 1 percentage point. Two things drive duration higher: **longer maturity** and **lower coupon** (a zero-coupon bond has the highest duration of all for its maturity, since all its value sits in one distant final payment).`,
    tryIt: [
      {
        label: "Open Central Bank Room",
        href: "/macro",
        moduleColor: "macro",
        description:
          "Look up a real central bank's actual current policy rate and its recent rate-decision history — the anchor for the short end of every yield curve you just read about.",
      },
    ],
    quiz: [
      {
        question: "If interest rates rise sharply, what happens to the price of a bond you already own?",
        options: ["It rises", "It falls", "It's unaffected", "It depends only on the issuer's credit rating"],
        correctIndex: 1,
        explanation: "Existing bond prices fall when rates rise, because new bonds now offer a more competitive rate — your fixed coupon becomes relatively less attractive, so the price has to adjust down.",
      },
      {
        question: "A bond trades below its face value. What does that tell you about its yield vs. its coupon rate?",
        options: ["Yield equals the coupon rate", "Yield is lower than the coupon rate", "Yield is higher than the coupon rate", "There's no relationship"],
        correctIndex: 2,
        explanation: "Buying below face value for the same fixed coupon payment means a higher effective return — yield rises above the coupon rate when a bond trades at a discount.",
      },
      {
        question: "What does an inverted yield curve typically signal?",
        options: [
          "Strong, accelerating economic growth ahead",
          "Markets expect the central bank to cut rates later, often due to a slowdown",
          "A bond default is imminent",
          "Nothing — it's a random, meaningless pattern",
        ],
        correctIndex: 1,
        explanation: "Short yields exceeding long yields usually reflects investors locking in today's higher long-term rate before an expected future round of rate cuts — one of the most closely watched recession signals.",
      },
      {
        question: "Which bond has the highest duration, all else equal?",
        options: [
          "A 2-year bond with a 6% coupon",
          "A 30-year zero-coupon bond",
          "A 5-year bond trading at a premium",
          "A 1-year Treasury bill",
        ],
        correctIndex: 1,
        explanation: "Longer maturity and lower coupon both push duration up — a 30-year zero-coupon bond has the maximum of both, so it has by far the highest sensitivity to rate changes.",
      },
    ],
  },

  // ————————————————————————————————————————————————————————————
  // 4. Commodities & FX
  // ————————————————————————————————————————————————————————————
  {
    number: 4,
    slug: "commodities-and-fx",
    title: "Commodities & FX",
    track: "Asset Classes",
    tagline: "Physical goods and currencies — the two asset classes even finance students tend to skip",
    body: `# Commodities & FX

Equities and fixed income get most of the attention in a typical finance education. Commodities and currencies are just as real an asset class, and "what's your view on GBPUSD" or a question about oil markets is a genuinely common S&T and macro-fund interview topic that trips up candidates who've never thought seriously about either.

## Commodities: hard, soft, and why they trade as futures

Commodities split broadly into **hard commodities** (extracted or mined — oil, gold, copper, natural gas) and **soft commodities** (grown or farmed — wheat, coffee, cotton, cattle). Almost nobody trading commodities professionally wants to take physical delivery of 1,000 barrels of oil — instead, the vast majority of commodity trading happens through **futures contracts**: an agreement to buy or sell a set quantity at a set price on a future date.

Futures let producers and consumers **hedge** real physical risk (an airline locking in future fuel costs; a farmer locking in a sale price before harvest) and let speculators take a view on price direction without ever touching a barrel of anything.

## Contango and backwardation — the futures-curve concept worth knowing

Plot commodity futures prices against how far out they expire, and you get a futures curve, with two possible shapes:

- **Contango**: futures prices are *higher* than the current spot price — common when storage costs matter (you're paying someone to hold the physical commodity until you need it) or supply is currently ample.
- **Backwardation**: futures prices are *lower* than the current spot price — often signals near-term scarcity: the market is willing to pay more for the commodity *right now* than for delivery later, a real, urgent supply-demand signal.

**Worked example:** oil's spot price is $70/barrel; the 6-month futures price is $73/barrel. Since futures ($73) > spot ($70), this is **contango** — here, roughly reflecting the cost of storing that oil for six months. If the futures price were instead $67 (below the $70 spot), that would be **backwardation**.

This site's own Pokemon Cards write-up (in My Analysis) treats trading cards as a genuine collectible-commodity case study — real production data, a real price-volatility episode, and a direct comparison to a past physical-collectible market crash. Worth a look as a concrete, low-stakes example of commodity-like supply/demand dynamics before you apply the same thinking to oil or gold.

## FX: the quoting convention that trips people up

A currency pair like **GBP/USD = 1.27** means 1 British pound buys 1.27 US dollars. GBP is the **base currency**, USD is the **quote currency**. If GBP/USD *rises*, the pound has strengthened against the dollar. Every FX move is, by definition, about *both* currencies at once — there's no such thing as "the dollar went down" without some other currency going up against it.

## Interest rate differentials — the single biggest driver of currency moves

This connects FX directly to the Central Bank Room on this site: **money tends to flow toward the currency offering the higher real (inflation-adjusted) interest rate**, because investors can borrow in a low-yielding currency, convert to a high-yielding one, and earn the spread — a strategy called the **carry trade**.

If the Fed holds rates meaningfully higher than the ECB, that tends to support USD strength against EUR, all else equal — real money is incentivized to hold dollar-denominated assets for the extra yield. This is why an FX trader watches central bank decisions as closely as an equity analyst watches earnings.

**Worked example:** Currency A yields 5%, Currency B yields 1% — a 4-percentage-point differential. Borrow 1,000,000 units of B, convert to A, earn the differential: 1,000,000 × 4% = **40,000 units/year** of carry, before accounting for any move in the exchange rate itself, transaction costs, or the risk of a sudden unwind.

**Worth knowing for an interview:** carry trades work smoothly until they don't — a sudden shift in risk sentiment can cause a rapid, painful unwind, which is why "carry trades unwinding" is a recurring phrase in real market-stress episodes.

## Purchasing power parity — the long-run anchor

**Purchasing Power Parity (PPP)** is the idea that, in the long run, exchange rates should adjust so the same basket of goods costs the same amount in any currency (the Economist's "Big Mac Index" is a real, simplified illustration). PPP is a genuinely poor *short-term* predictor — rates can deviate from it for years — but a real anchor over long horizons. A strong interview answer references both: PPP as the long-run gravity, rate differentials and flows as what actually moves a pair day to day.

## Building an actual FX view — the interview-ready structure

1. **Rate differential** — which central bank is more hawkish right now (check real current policy rates in Central Bank Room, not a guess).
2. **Growth differential** — which economy's outlook is stronger.
3. **Risk sentiment** — "risk-on" typically favors higher-yielding currencies; "risk-off" favors safe havens (historically USD, JPY, CHF).
4. **Flows and positioning** — is there a structural reason capital is flowing into or out of one side?

Naming these four inputs, and being explicit about which one you're weighting most and why, is a dramatically stronger interview answer than a directional guess with no framework behind it.`,
    tryIt: [
      {
        label: "Read the Pokemon Cards write-up",
        href: "/analysis/pokemon-cards-as-an-asset-class",
        moduleColor: "pokemon",
        description: "A real, concrete commodity-like market — production data, a real volatility case study, and an actual verdict on whether it's worth treating as an asset class.",
      },
      {
        label: "Open Central Bank Room",
        href: "/macro",
        moduleColor: "macro",
        description: "Compare two real central banks' current policy rates — the rate differential that's the biggest single driver of currency moves.",
      },
    ],
    quiz: [
      {
        question: "Why do most commodity traders use futures contracts instead of buying the physical commodity?",
        options: [
          "Futures are always cheaper",
          "Physical delivery is illegal for most traders",
          "Futures let you hedge or speculate on price without handling or storing the physical good",
          "Commodities can't legally be traded any other way",
        ],
        correctIndex: 2,
        explanation: "Futures let producers, consumers, and speculators manage or take a view on price risk without ever touching the underlying physical commodity — the actual mechanism most commodity trading runs on.",
      },
      {
        question: "A commodity's futures price is lower than its current spot price. What's this called, and what does it often signal?",
        options: [
          "Contango — ample current supply",
          "Backwardation — near-term scarcity",
          "Parity — no real signal",
          "Discounting — a data error",
        ],
        correctIndex: 1,
        explanation: "Backwardation (futures below spot) often signals the market is paying a premium for the commodity right now, implying near-term tightness in supply.",
      },
      {
        question: "If GBP/USD rises from 1.25 to 1.30, what happened?",
        options: [
          "The pound weakened against the dollar",
          "The pound strengthened against the dollar",
          "Both currencies weakened",
          "This tells you nothing about either currency",
        ],
        correctIndex: 1,
        explanation: "GBP is the base currency — a rising GBP/USD means each pound now buys more dollars, i.e. the pound has strengthened (equivalently, the dollar has weakened against it).",
      },
      {
        question: "What is a \"carry trade\"?",
        options: [
          "Borrowing in a low-yielding currency to invest in a higher-yielding one, earning the spread",
          "A trade executed entirely on margin",
          "Buying a commodity and physically carrying/storing it",
          "A type of bond duration strategy",
        ],
        correctIndex: 0,
        explanation: "The carry trade borrows cheap (low rate currency) and invests where yield is higher, profiting from the rate differential — until risk sentiment shifts and it unwinds, sometimes sharply.",
      },
    ],
  },

  // ————————————————————————————————————————————————————————————
  // 5. Sales & Trading
  // ————————————————————————————————————————————————————————————
  {
    number: 5,
    slug: "sales-and-trading",
    title: "Sales & Trading: How Markets Actually Trade",
    track: "The Seats",
    tagline: "Market makers, spreads, and order books — what a trading desk does that isn't just guessing direction",
    body: `# Sales & Trading: How Markets Actually Trade

Chapter 1 introduced S&T as a seat. This chapter is about the actual mechanics — what "making a market" means, why a trading desk's job isn't mostly about predicting whether a stock goes up or down, and how liquidity itself becomes something to manage.

## Making a market: the core S&T mechanic

A **market maker** quotes two prices simultaneously: a **bid** (the price they'll buy at) and an **ask** (the price they'll sell at). The ask is always higher than the bid — that gap, the **bid-ask spread**, is the market maker's compensation for standing ready to trade instantly with whoever shows up next, in either direction.

Say a stock's quote is $50.00 bid / $50.05 ask. A market maker buying at $50.00 from one client and selling at $50.05 to the next pockets the $0.05 spread — not by betting on direction, but by providing continuous liquidity and capturing the toll for it. Multiply a few cents by enormous trading volume, all day, and that's a real, non-directional business.

## Order types — how a trade actually gets placed

- **Market order**: execute immediately at whatever the current best available price is. Guarantees execution, not price.
- **Limit order**: execute only at a specified price or better. Guarantees price (if it fills at all), not execution — a limit order can simply sit unfilled if the market never reaches it.

## Why the bid-ask spread isn't constant

The spread widens or narrows based on real risk. A highly liquid, heavily traded stock (huge daily volume, many market participants) typically has a tight spread — lots of competition to make that market keeps it efficient. A thinly traded stock, or *any* stock right before a highly uncertain event (an earnings announcement, a major macro release), sees spreads widen — the market maker is compensating themselves for the extra risk of being caught holding inventory right as the price potentially jumps.

## Managing inventory risk — the actual skill

When a market maker buys from a client, they now hold that position — **inventory** — and are exposed to the price moving against them before they can offload it. A real trading desk isn't trying to predict where the market goes; it's trying to manage the risk of the inventory that client flow *forces* it to hold, often by adjusting quotes (skewing the bid/ask to attract flow that reduces an unwanted position) or hedging with a related, more liquid instrument.

## What a trading desk's day actually looks like

Far less "placing directional bets" than pop culture suggests, and far more: taking client orders, managing the resulting inventory and risk in real time, adjusting quotes as conditions change, and coordinating with sales on what clients are asking for. The desks that do take more directional risk (often called "prop-adjacent" flow, though true proprietary trading at banks is heavily regulated today) are a smaller slice of what most of S&T actually does day to day.

## Try it yourself

The best way to build real intuition for this chapter isn't reading more about it — it's doing it. This site has an actual, playable market maker simulation below.`,
    tryIt: [
      {
        label: "Play the Market Maker game",
        href: "/simulations",
        description:
          "Quote a live bid/ask spread against a randomly generated price feed and see exactly what happens to your P&L and inventory as simulated client flow trades against you — this chapter, hands-on.",
      },
    ],
    quiz: [
      {
        question: "A market maker quotes $99.90 bid / $100.10 ask. What is this spread compensating them for?",
        options: [
          "A guaranteed profit on every single trade",
          "Standing ready to trade instantly in either direction, and the inventory risk that comes with it",
          "Nothing — it's an arbitrary regulatory requirement",
          "The cost of executing on a specific exchange",
        ],
        correctIndex: 1,
        explanation: "The bid-ask spread compensates a market maker for providing continuous liquidity and for the risk of holding inventory that could move against them before it's offloaded.",
      },
      {
        question: "What does a limit order guarantee that a market order doesn't?",
        options: ["Immediate execution", "A specific price (or better), though it may not fill at all", "Lower fees", "Priority over all other orders"],
        correctIndex: 1,
        explanation: "A limit order only executes at your specified price or better — you control price, but not whether or when it fills. A market order guarantees execution, not price.",
      },
      {
        question: "Why do bid-ask spreads typically widen right before a major earnings announcement?",
        options: [
          "Exchanges raise fees around earnings",
          "Trading is paused, so spreads become meaningless",
          "Market makers demand more compensation for the higher risk of holding inventory into an uncertain, potentially sharp price move",
          "It's a fixed rule with no real economic reason",
        ],
        correctIndex: 2,
        explanation: "Wider spreads around uncertain events reflect market makers pricing in the higher risk of being caught holding a position right as new information causes a large price move.",
      },
      {
        question: "What best describes most of S&T's actual day-to-day activity?",
        options: [
          "Making large, direction-based bets on where markets are headed",
          "Executing client orders and managing the resulting inventory/risk, largely non-directionally",
          "Only advising companies on M&A",
          "Passive index investing",
        ],
        correctIndex: 1,
        explanation: "Most of S&T's real activity is client-flow-driven: taking orders, making markets, and managing the risk that flow creates — closer to a service business than a directional betting desk.",
      },
    ],
  },

  // ————————————————————————————————————————————————————————————
  // 6. Options & Derivatives (adapted from the old lessons.ts entry)
  // ————————————————————————————————————————————————————————————
  {
    number: 6,
    slug: "options-and-derivatives",
    title: "Options & Derivatives",
    track: "The Seats",
    tagline: "Calls, puts, and the Greeks — how an S&T desk actually thinks about risk beyond spot price",
    body: `# Options & Derivatives

The last chapter covered market-making in a stock itself. Options are a different, related product family — and a different *way of thinking about risk* than anything covered so far. If S&T is a real door you want to keep open, this is one of the biggest concepts to have cold.

## What an option actually is

A **call option** gives you the right (not the obligation) to *buy* an asset at a fixed price (the **strike price**) before or at a fixed date (**expiration**). A **put option** gives you the right to *sell* at a fixed price.

You pay a price for that right — the **premium** — regardless of whether you ever use it. That asymmetry (limited, known downside for the buyer; theoretically much larger potential upside) is the entire appeal of buying options.

## Intrinsic value vs. time value

An option's premium splits into two pieces:

- **Intrinsic value**: how much the option would be worth if exercised *right now*. A call with a $50 strike on a stock trading at $60 has $10 of intrinsic value. An option with no intrinsic value is "out of the money."
- **Time value**: everything else in the premium — compensation for the *possibility* the option becomes more valuable before expiration. Time value shrinks as expiration approaches (**theta decay**) and hits zero exactly at expiration.

## The Greeks — five real, intuitive sensitivities

Each "Greek" answers: how much does the option's price change if one input changes, holding everything else constant?

- **Delta**: how much the option's price moves for a $1 move in the underlying stock. Also doubles as a rough probability estimate — a delta-0.5 option is roughly a coin-flip to finish in the money.
- **Gamma**: how much delta *itself* changes as the stock moves.
- **Theta**: how much value the option loses purely from one day passing, all else equal.
- **Vega**: how much the option's price changes if implied volatility changes by 1 percentage point. Higher expected volatility makes an option more valuable, so vega is always positive for both calls and puts, for the buyer.
- **Rho**: sensitivity to interest rate changes — real, but the least important of the five for day-to-day trading intuition.

## Volatility is the product, not just an input

**An option's price is fundamentally a bet on volatility, not just direction.** You can be right about a stock going up and still lose money on a call option, if implied volatility collapses enough after you buy it — a real, common pattern around earnings announcements. This is why options traders talk about **implied volatility (IV)** as much as direction — and trading IV itself is a huge part of what an options desk actually does.

## A concrete example

Stock trades at $100. You buy a call with a $105 strike, expiring in one month, for a $3 premium.

- **Break-even at expiration**: $105 + $3 = **$108**.
- **If the stock finishes at $103**: option worth $0 — you lose the full $3 premium.
- **If the stock finishes at $112**: intrinsic value is $7. Profit: $4 — a large percentage return on the $3 risked.

## What this connects back to

The market-making chapter showed a desk managing risk from client flow in the underlying stock. Options desks manage a wider set of risks simultaneously (delta, gamma, vega all at once) — the same core skill of continuously hedging and re-pricing risk, just across more dimensions.`,
    tryIt: [
      {
        label: "Play the Market Maker game",
        href: "/simulations",
        description:
          "Same desk mentality as options market-making, one dimension simpler: manage inventory risk in real time as flow trades against your quotes.",
      },
    ],
    quiz: [
      {
        question: "A call option's strike is $50, and the stock trades at $45. What's its intrinsic value?",
        options: ["$5", "$0", "$45", "-$5"],
        correctIndex: 1,
        explanation: "The call is out of the money (strike above current price) — exercising it would mean buying at $50 something worth $45, which nobody would do, so intrinsic value is $0.",
      },
      {
        question: "You own a call option. A week passes and the stock doesn't move at all. What happens to your option's value, and why?",
        options: [
          "It's unchanged, since the stock didn't move",
          "It rises, due to gamma",
          "It falls, due to theta (time decay) with no offsetting favorable move",
          "It's impossible to say without knowing delta",
        ],
        correctIndex: 2,
        explanation: "With no directional move to offset it, pure time decay (theta) erodes the option's time value as expiration approaches — this is the classic \"options are a wasting asset\" effect.",
      },
      {
        question: "What does it mean to say \"an option's price is a bet on volatility, not just direction\"?",
        options: [
          "Options only ever pay off if the stock is volatile",
          "You can be directionally right and still lose money if implied volatility falls enough after you buy",
          "Volatility has no real effect on option pricing",
          "Only puts are affected by volatility",
        ],
        correctIndex: 1,
        explanation: "Vega means an option's value depends on expected future volatility, not just the stock's level — a common real pattern is IV collapsing right after an earnings event even if the stock moved the \"right\" direction.",
      },
      {
        question: "Which Greek measures how much delta itself changes as the stock price moves?",
        options: ["Theta", "Vega", "Gamma", "Rho"],
        correctIndex: 2,
        explanation: "Gamma is the rate of change of delta — how fast an option's directional sensitivity itself is shifting as the underlying moves.",
      },
    ],
  },

  // ————————————————————————————————————————————————————————————
  // 7. Asset & Investment Management
  // ————————————————————————————————————————————————————————————
  {
    number: 7,
    slug: "asset-and-investment-management",
    title: "Asset & Investment Management",
    track: "The Seats",
    tagline: "Active vs. passive, portfolio construction, and the risk metrics a real portfolio manager watches",
    body: `# Asset & Investment Management

Chapters 5 and 6 covered the sell-side markets business. This chapter is the buy-side counterpart: what an asset manager actually does with the client capital described back in Chapter 1, and the handful of risk concepts that show up in every real portfolio review.

## Active vs. passive — the industry's biggest ongoing debate

A **passive** fund simply tracks an index (like the S&P 500) as closely and cheaply as possible — no attempt to pick winners, just broad, low-cost exposure. An **active** fund's manager makes deliberate decisions to deviate from an index, aiming to outperform it, and charges a higher fee for that attempt.

The honest, well-documented tension: most active managers, most of the time, don't reliably beat their benchmark after fees — which is exactly why passive investing has grown enormously. The counter-argument active managers make: markets aren't perfectly efficient everywhere, and skilled stock-picking or risk management can add real value, particularly in less-covered corners of the market. Both sides of this debate are real and worth understanding, not a settled question.

## How asset managers actually get paid

A **management fee** — typically a small percentage of assets under management (AUM) per year — is the core AM revenue model, earned regardless of performance in a given year (unlike a hedge fund's performance fee, from Chapter 1). This is precisely why AUM growth itself (through both investment performance and new client inflows) is such a central business metric for an asset management firm, separate from any single year's investment returns.

## Portfolio construction: why diversification is a mathematical fact, not just a cliché

Holding many uncorrelated assets reduces a portfolio's overall volatility *without necessarily sacrificing expected return* — a genuine, provable result (not just conventional wisdom), because assets that don't move in lockstep smooth out each other's swings. The key word is **uncorrelated**: two stocks in the same industry provide much less real diversification benefit than a stock and a government bond, which often move independently or even in opposite directions during a market stress event.

## The risk metrics a real portfolio review actually uses

- **Sharpe ratio**: (portfolio return − risk-free rate) ÷ portfolio volatility. A measure of *return per unit of risk taken*, not just raw return — a portfolio returning 8% with low volatility can have a better Sharpe ratio than one returning 12% with much higher volatility, and a real portfolio manager cares about both numbers, not just the headline return.

**Worked example:** risk-free rate is 4%. Portfolio A returns 10% with 8% volatility: Sharpe = (10% − 4%) ÷ 8% = **0.75**. Portfolio B returns 14% with 20% volatility: Sharpe = (14% − 4%) ÷ 20% = **0.50**. Despite the lower headline return, Portfolio A delivered more return per unit of risk taken — the number a real risk review actually leads with.
- **VaR (Value at Risk)**: an estimate of the maximum loss a portfolio is likely to experience over a given time horizon, at a given confidence level. "1-day 95% VaR of $1 million" means: on 95% of days, you don't expect to lose more than $1 million — and, importantly, on the remaining 5% of days, you could lose more, sometimes significantly more (VaR describes a threshold, not a worst-case cap).
- **CVaR (Conditional VaR)**: the *average* loss in exactly those worst-case scenarios VaR doesn't fully describe — a more complete picture of true tail risk.

## Try it yourself

This site's own Portfolio Risk Simulator computes exactly these numbers — Sharpe ratio, VaR, CVaR — on a real portfolio you build across 10 asset classes, via an actual 500-path Monte Carlo simulation. Reading about these concepts is one thing; watching your own portfolio's Sharpe ratio change as you add an uncorrelated asset class is a much faster way to actually understand diversification.`,
    tryIt: [
      {
        label: "Try the Portfolio Risk Simulator",
        href: "/simulations",
        description:
          "Build a real portfolio across 10 asset classes and watch its Sharpe ratio, VaR, and CVaR update — this chapter's risk metrics, computed on a portfolio you actually built.",
      },
      {
        label: "Download the AM one-pager template",
        href: "/templates",
        description: "The actual document format asset management analysts produce to summarize a portfolio's positioning and risk.",
      },
    ],
    quiz: [
      {
        question: "What's the core difference between active and passive investing?",
        options: [
          "Passive funds only hold bonds",
          "Active managers try to deviate from a benchmark to outperform it; passive funds simply track it",
          "Active funds are always cheaper",
          "There's no meaningful difference",
        ],
        correctIndex: 1,
        explanation: "Passive investing tracks an index as closely and cheaply as possible; active investing makes deliberate bets to try to beat that index, at a higher fee.",
      },
      {
        question: "How does a typical asset management firm make money?",
        options: [
          "Solely from a performance fee on profits",
          "A management fee, usually a percentage of assets under management, earned regardless of a given year's performance",
          "Trading commissions only",
          "Interest on client cash deposits",
        ],
        correctIndex: 1,
        explanation: "The core AM revenue model is a management fee on AUM — which is why growing AUM (via performance and new inflows) is such a central business goal for these firms.",
      },
      {
        question: "Why does adding an uncorrelated asset to a portfolio typically reduce overall volatility?",
        options: [
          "It doesn't — more assets always means more risk",
          "Because assets that don't move in lockstep smooth out each other's price swings",
          "Only if the new asset has a higher expected return",
          "Diversification is a myth with no mathematical basis",
        ],
        correctIndex: 1,
        explanation: "This is a genuine, provable result: combining assets whose price moves aren't tightly linked reduces the combined portfolio's volatility, since their swings partially offset rather than compound.",
      },
      {
        question: "A portfolio's 1-day 95% VaR is $1 million. What does that actually mean?",
        options: [
          "The portfolio can never lose more than $1 million in a day",
          "On 95% of days, losses are expected to stay under $1 million — on the remaining 5%, losses could exceed it",
          "The portfolio loses exactly $1 million once every 20 days",
          "It's a guarantee, not an estimate",
        ],
        correctIndex: 1,
        explanation: "VaR is a threshold at a stated confidence level, not a hard cap — the tail scenarios beyond that 5% are exactly what CVaR is built to describe more fully.",
      },
    ],
  },

  // ————————————————————————————————————————————————————————————
  // 8. Three-Statement Modeling (adapted from the old lessons.ts entry)
  // ————————————————————————————————————————————————————————————
  {
    number: 8,
    slug: "three-statement-modeling",
    title: "Three-Statement Modeling",
    track: "Foundations of Analysis",
    tagline: "How the income statement, balance sheet, and cash flow statement actually link — the most commonly failed technical question in real interviews",
    body: `# Three-Statement Modeling

This is, honestly, the single most commonly failed technical question in real banking interviews — not because it's conceptually hard, but because most candidates have only ever seen the three statements separately, never watched them actually move together. Everything from here to the end of this course (M&A, valuation, reading a real deal) leans on this linkage, so it's worth building properly now.

## The three statements, in one sentence each

- **Income statement:** how much money the company made this period (revenue down to net income) — a *flow* over time.
- **Balance sheet:** what the company owns and owes at one *specific moment* — a snapshot, not a flow.
- **Cash flow statement:** where the company's actual cash came from and went during the period — because net income (an accounting figure, full of non-cash items and timing assumptions) is not the same thing as cash in the bank.

## The classic interview question: "Walk me through what happens to the three statements if depreciation increases by $10"

**1. Income statement:** Depreciation is an operating expense, so a $10 increase **reduces operating income (EBIT) by $10**. Assume a 25% tax rate: pre-tax income falls by $10, taxes owed fall by $10 × 25% = **$2.50**. Net income falls by $10 − $2.50 = **$7.50**.

**2. Cash flow statement:** Start with net income (down $7.50). But depreciation is a **non-cash expense** — no actual $10 left the building. So you **add depreciation back**: −$7.50 + $10 = **cash flow from operations is actually UP $2.50**. This is the single most counter-intuitive part of the exercise: an expense that *reduces* accounting profit can *increase* real cash — because the tax savings from that non-cash deduction ($2.50) is real cash the company didn't have to pay to the government.

**3. Balance sheet:** Cash is up $2.50 → assets up $2.50 from that. Accumulated depreciation is up $10, reducing net PP&E by $10 → assets down $10 from that. Net effect on assets: +$2.50 − $10 = **down $7.50**. Retained earnings (equity) falls by the $7.50 drop in net income → **equity down $7.50**. Assets down $7.50, liabilities+equity down $7.50 — **the balance sheet still balances**. If your walk-through doesn't end with the balance sheet balancing, something in your logic was wrong.

## Why this matters more than memorizing the mechanic

An interviewer doesn't care whether you can recite "depreciation is added back" — every prep book says that. What's being tested is whether you understand *why*, well enough to handle a variant you haven't memorized: What if it's an increase in accounts receivable instead? (Net income unaffected, but cash flow from operations falls — you booked the sale as revenue, but haven't collected the cash yet.) A stock buyback funded by new debt? (Cash out and treasury stock up on the equity side — reducing equity — debt up on liabilities, cash swings through financing activities, not operations.)

The skill is tracing *any* transaction through all three statements from first principles — not three memorized answers for three memorized questions.

## The five words that make this teachable: "where did the cash go"

Every cash flow statement line item answers one question: for this specific change, where did the actual cash go (or come from), and does that match what the income statement or balance sheet implied? If revenue went up but a receivable also went up by the same amount, the cash hasn't arrived yet. If an expense was booked but no cash left the building, add it back — the income statement charged you for something that isn't a real cash outflow this period.`,
    tryIt: [
      {
        label: "Open Company Profile",
        href: "/profile",
        description:
          "Pick a real company, pull up two consecutive years of its balance sheet, and try to explain every line item's change using only its income statement and cash flow statement for that year — the gap-finding exercise this chapter is built for.",
      },
    ],
    quiz: [
      {
        question: "Depreciation increases by $10. What happens to net income, assuming a 25% tax rate?",
        options: ["Falls by $10", "Falls by $7.50", "Rises by $2.50", "Unaffected"],
        correctIndex: 1,
        explanation: "EBIT falls $10, taxes fall $2.50 (25% of $10), so net income falls by $10 − $2.50 = $7.50.",
      },
      {
        question: "Why is depreciation added back on the cash flow statement?",
        options: [
          "It's a mistake in the income statement that needs correcting",
          "Because it's a non-cash expense — no actual cash left the company for it",
          "To make cash flow look artificially higher",
          "Depreciation is never added back",
        ],
        correctIndex: 1,
        explanation: "Depreciation reduces accounting profit but isn't an actual cash outflow — adding it back reconciles net income to real cash generated.",
      },
      {
        question: "Accounts receivable increases by $20 (a customer was billed but hasn't paid yet). What happens to cash flow from operations?",
        options: [
          "It rises by $20",
          "It falls, since the revenue was booked but the cash hasn't been collected",
          "It's unaffected",
          "It only affects the balance sheet, never the cash flow statement",
        ],
        correctIndex: 1,
        explanation: "An increase in receivables means revenue was recognized without matching cash collection yet — this reduces cash flow from operations relative to net income.",
      },
      {
        question: "After any correctly modeled transaction, what must always remain true on the balance sheet?",
        options: [
          "Assets must increase",
          "Cash must increase",
          "Assets must equal liabilities plus equity",
          "Net income must be positive",
        ],
        correctIndex: 2,
        explanation: "The balance sheet must always balance — assets = liabilities + equity — which is exactly the check that catches an error in your three-statement logic.",
      },
    ],
  },

  // ————————————————————————————————————————————————————————————
  // 9. Investment Banking & M&A
  // ————————————————————————————————————————————————————————————
  {
    number: 9,
    slug: "investment-banking-and-ma",
    title: "Investment Banking & M&A: Historical and Recent",
    track: "Corporate Finance",
    tagline: "What IBD actually sells, why companies merge, and two famous deals worth knowing as case studies",
    body: `# Investment Banking & M&A: Historical and Recent

Chapter 1 introduced IBD at a high level. This chapter goes deeper into the two things banks actually sell — capital-raising and M&A advisory — why companies actually pursue mergers, and a couple of widely studied historical deals worth knowing by name.

## What IBD actually does, in more detail

**Capital markets** work (ECM and DCM, from Chapter 1) is about *raising* money — helping a company sell new shares or issue new bonds, and pricing that offering correctly (price it too high and it doesn't sell; too low and the company leaves money on the table).

**M&A advisory** splits into **sell-side** (advising a company being acquired — running a process to get the best price and terms) and **buy-side** (advising the acquirer — finding targets, valuing them, structuring and negotiating the deal). The same bank might do sell-side on one deal and buy-side on another, though never both sides of the *same* deal at once.

## Why companies actually merge

- **Growth**: organic growth (building new products, entering new markets yourself) is often slower than buying a company that's already there.
- **Consolidation**: combining with a competitor reduces competition and can increase pricing power — a major reason regulators scrutinize mergers between direct rivals closely.
- **Vertical integration**: acquiring a supplier or a distributor to control more of your own supply chain.
- **Diversification**: reducing reliance on a single product or market.
- **Acquiring talent or technology** (sometimes called an "acquihire"): buying a smaller company primarily for its team or its technology, not necessarily its current revenue.

## Two widely studied historical deals

**AOL–Time Warner (2000)** is one of the most commonly cited cautionary tales in M&A history — a merger announced near the peak of the dot-com boom, between an internet company (AOL) and a traditional media conglomerate (Time Warner), that's widely regarded as having destroyed enormous shareholder value in the years after, largely due to a severe culture clash between the two organizations and the collapse of the dot-com valuation the deal was priced on. It's taught constantly as the case study for "a strategically plausible-sounding deal can still fail badly if the price is wrong or the two organizations simply can't integrate."

**Disney–Pixar (2006)** is often cited as close to the opposite case study: an acquisition widely regarded as successful, largely because Disney structured the deal to retain Pixar's creative leadership and culture rather than fully absorbing and standardizing it — a deliberate contrast to the AOL–Time Warner integration failure, and a real example of "how" a deal gets integrated mattering as much as "why" it made sense on paper.

The lesson from both, together: a deal's strategic logic on a press release slide and its actual outcome years later are two different questions, and the second one usually comes down to price discipline and integration execution, not the initial rationale.

## Recent M&A — why this chapter won't give you a list

Any specific "recent deals" written into this chapter would be stale within months, which runs against this site's own rule of never stating a number or fact as current when it might not be anymore. Instead: this site's own My Analysis section carries real, dated write-ups on breaking market and deal stories as they happen, and Markets Overview tracks sector-level trends in real time — genuinely current, sourced, and a far better way to stay on top of "recent M&A" than any static paragraph could be.`,
    tryIt: [
      {
        label: "Read My Analysis",
        href: "/analysis",
        moduleColor: "analysis",
        description: "Real, dated write-ups on breaking market and deal stories — the actual current-events layer this chapter deliberately doesn't try to replace.",
      },
      {
        label: "Open Markets Overview",
        href: "/markets",
        description: "Sector-by-sector trends, which is usually where you'll first spot the conditions (consolidation pressure, cheap financing, a struggling sub-sector) that precede a wave of M&A.",
      },
    ],
    quiz: [
      {
        question: "What's the difference between sell-side and buy-side M&A advisory?",
        options: [
          "Sell-side advises the acquirer, buy-side advises the target",
          "Sell-side advises the company being acquired; buy-side advises the acquirer",
          "They're the same role with different names",
          "Sell-side only applies to public companies",
        ],
        correctIndex: 1,
        explanation: "Sell-side advisory represents the company being sold (running the process to get the best outcome); buy-side advisory represents the acquirer.",
      },
      {
        question: "Why do regulators scrutinize mergers between direct competitors especially closely?",
        options: [
          "They don't — regulators only care about foreign buyers",
          "Consolidating direct rivals can reduce competition and increase pricing power",
          "It's purely a tax issue",
          "All mergers face identical scrutiny regardless of the industry structure",
        ],
        correctIndex: 1,
        explanation: "Combining two direct competitors is the scenario most likely to meaningfully reduce competition in a market, which is exactly what antitrust review is designed to catch.",
      },
      {
        question: "What is AOL–Time Warner most commonly cited as an example of?",
        options: [
          "A textbook-perfect successful integration",
          "A deal that destroyed significant value, largely due to culture clash and being priced at a market peak",
          "The first-ever hostile takeover",
          "A deal that never actually closed",
        ],
        correctIndex: 1,
        explanation: "It's one of the most widely taught cautionary case studies in M&A — a strategically plausible deal that's broadly regarded as having failed badly post-close.",
      },
      {
        question: "Why doesn't this chapter list specific \"recent\" M&A deals?",
        options: [
          "Recent deals don't matter for learning M&A",
          "Static content about \"recent\" deals goes stale — the site instead points to its own live, dated coverage in My Analysis and Markets Overview",
          "There's no way to research real deals",
          "IBD deals are always confidential",
        ],
        correctIndex: 1,
        explanation: "A fixed list of \"recent\" deals would quickly become outdated. Live, continuously updated coverage is a better and more honest source for anything genuinely current.",
      },
    ],
  },

  // ————————————————————————————————————————————————————————————
  // 10. Valuation & Technical Interview Fundamentals (adapted)
  // ————————————————————————————————————————————————————————————
  {
    number: 10,
    slug: "valuation-fundamentals",
    title: "Valuation & Technical Interview Fundamentals",
    track: "Foundations of Analysis",
    tagline: "DCF, LBO, M&A models, and comps — turning this site's own templates into a real, walkthrough-ready skill",
    body: `# Valuation & Technical Interview Fundamentals

Chapter 8 built the accounting foundation; Chapter 9 covered why deals happen. This chapter is the actual technical skill that sits under both: the four valuation methodologies that come up in essentially every finance technical interview, and that this site has real, downloadable templates for.

## "Walk me through a DCF"

This is close to the single most-asked technical question in finance interviews, across every seat type.

1. **Forecast unlevered free cash flow** for 5ish years — start from revenue, apply a margin assumption to get to EBIT, tax-affect it, add back D&A, subtract capex and the change in net working capital.
2. **Discount those cash flows back to today** using the company's WACC (weighted average cost of capital) — the blended return investors require given the company's mix of debt and equity.
3. **Estimate a terminal value** for everything beyond the forecast window — either a perpetuity growth rate or an exit multiple. Discount that back too.
4. **Sum the discounted cash flows and the discounted terminal value** to get Enterprise Value.
5. **Bridge to equity value**: subtract net debt, divide by shares outstanding to get a per-share value.
6. **Compare to the current share price.**

**Worked example, simplified to one year plus a terminal value:** Year-1 unlevered FCF = $100M, WACC = 10%, terminal growth = 2%.
- Discount factor formula: 1 ÷ (1 + WACC)ⁿ. For year 1: 1 ÷ 1.10 = 0.909.
- PV of Year-1 FCF = $100M × 0.909 = **$90.9M**.
- Terminal value formula: FCF × (1 + g) ÷ (WACC − g) = $100M × 1.02 ÷ (0.10 − 0.02) = $102M ÷ 0.08 = **$1,275M**.
- PV of terminal value = $1,275M × 0.909 = **$1,159M**.
- Enterprise Value ≈ $90.9M + $1,159M = **$1,250M**.

A real DCF repeats the first step for 5 years instead of 1, but the mechanics — discount factor = 1/(1+WACC)ⁿ, terminal value = FCF×(1+g)/(WACC−g) — are exactly this, just repeated.

The line that signals real understanding, not memorization: *"A DCF is only as good as its assumptions — I'd always sensitize it across a range of WACC and terminal growth, not present one number as if it were precise."*

## "Walk me through an LBO"

The core question: can a private equity firm buy this company mostly with borrowed money, use the company's own cash flow to pay that debt down, and sell it later for a return that justifies the risk?

1. **Sources & Uses**: how much of the purchase price comes from debt vs. the sponsor's own equity (typically 60-70% debt in a traditional LBO).
2. **Build a debt paydown schedule**: the company's free cash flow each year pays down that debt.
3. **Project an exit** in year 3-7, usually at a similar multiple to entry (the conservative, no-multiple-expansion assumption).
4. **Back out returns**: equity at entry vs. equity value at exit gives you IRR and MOIC.

LBO returns come from three levers — **debt paydown**, **multiple expansion**, and **EBITDA growth**. A good candidate can name which lever is doing the most work in a given deal.

**Worked example:** buy a company for 8x its $125M EBITDA = **$1,000M**, financed 65% debt ($650M) / 35% equity ($350M). Five years later, EBITDA has grown to $175M; assume the *same* 8x exit multiple (no multiple expansion): exit EV = 8 × $175M = **$1,400M**. Debt has been paid down from $650M to $300M over those five years.
- Exit equity value = exit EV − remaining debt = $1,400M − $300M = **$1,100M**.
- MOIC = exit equity ÷ entry equity = $1,100M ÷ $350M = **3.14x**.
- Approximate IRR over 5 years: 3.14^(1/5) − 1 ≈ **26%**.

Notice this 3.14x came entirely from EBITDA growth and debt paydown — multiple expansion contributed nothing (entry and exit multiples are both 8x) — exactly the kind of "which lever is doing the work" answer that signals real understanding.

## "Walk me through an M&A model" (accretion/dilution)

Does the deal increase or decrease the acquirer's earnings per share?

1. **Combine the two companies' financials.**
2. **Figure out the financing mix**: cash, new debt, new stock — this single choice drives almost everything else.
3. **Compute pro forma net income** (adjusted for financing costs).
4. **Compute pro forma shares outstanding** (up, if stock-funded).
5. **Pro forma EPS = pro forma net income ÷ pro forma shares.** Higher than the acquirer's standalone EPS is "accretive," lower is "dilutive."

**Worked example (all-cash deal):** Acquirer: net income $500M, 100M shares, EPS = $500M ÷ 100M = **$5.00**. Target: net income $100M, 50M shares, trading at a $30/share offer price → deal value = 50M × $30 = **$1,500M**, paid entirely in cash. That cash was earning 3% interest; losing it costs $1,500M × 3% = $45M pre-tax, or $45M × (1 − 25% tax) = **$33.75M** after-tax.
- Pro forma net income = $500M + $100M − $33.75M = **$566.25M**.
- Pro forma shares = 100M (unchanged — it's a cash deal).
- Pro forma EPS = $566.25M ÷ 100M = **$5.66**.
- vs. standalone $5.00 → **accretive by ($5.66 − $5.00) ÷ $5.00 = 13.2%.**

The real nuance: **a cheap deal funded with cash is almost always accretive; a deal funded with stock is accretive only if the acquirer's own P/E is higher than the target's.** And — worth remembering from Chapter 9's AOL–Time Warner example — **accretive doesn't automatically mean "good deal."**

## "Walk me through a comps analysis"

1. **Pick a genuinely comparable peer set** — same industry, similar size, similar growth/margin profile.
2. **Compute each peer's multiples**: P/E, EV/EBITDA, EV/Sales.
3. **Take the peer median** (not average — one outlier shouldn't swing the read).
4. **Apply that median multiple to your subject company's own metric** to get an implied valuation.

**Worked example:** five peers trade at P/E multiples of 18x, 19x, 20x, 22x, and 35x (one clear outlier). Median = **20x** (the average would be a distorted 22.8x — exactly why median is preferred). Subject company's EPS = $3.00 → implied price = 20 × $3.00 = **$60**. If it's actually trading at $50, that's a **20% gap** to where peers suggest it should trade ((60 − 50) ÷ 50).

The answer that signals real judgment: *"If my subject trades meaningfully below the peer median, that's not automatically a buy signal — it could mean the market is pricing in something real that a simple multiple doesn't capture."* This is exactly the discipline this site's own Hype vs Fundamentals module is built around.

## Practice on this site

Every one of these four models exists as a real, downloadable template, prefilled with real data for any company you pick — every cell is a live Excel formula, so you can trace exactly how changing one assumption moves the whole output.`,
    tryIt: [
      {
        label: "Open Company Profile",
        href: "/profile",
        description: "Pick a real company to build your DCF or comps set around before downloading a template for it.",
      },
    ],
    templateLink: { label: "Download a DCF, LBO, M&A, or Comps template", href: "/templates" },
    quiz: [
      {
        question: "In a DCF, what does WACC represent?",
        options: [
          "The company's tax rate",
          "The blended return investors require, given the company's mix of debt and equity",
          "The growth rate of free cash flow",
          "The company's current P/E ratio",
        ],
        correctIndex: 1,
        explanation: "WACC (weighted average cost of capital) is the discount rate used precisely because it reflects what investors — both debt and equity holders — require to fund the company, blended by their respective weights.",
      },
      {
        question: "What are the three levers that drive LBO returns?",
        options: [
          "Revenue growth, tax rate, and interest rates",
          "Debt paydown, multiple expansion, and EBITDA growth",
          "Stock price, dividend yield, and buybacks",
          "Working capital, capex, and depreciation",
        ],
        correctIndex: 1,
        explanation: "Debt paydown, multiple expansion, and EBITDA growth are the three sources of LBO equity returns — a strong answer identifies which is doing the most work in a specific deal.",
      },
      {
        question: "A deal funded entirely with stock is accretive to the acquirer's EPS. What does that likely tell you?",
        options: [
          "The acquirer's P/E is lower than the target's",
          "The acquirer's P/E is higher than the target's",
          "The deal used no debt at all, which is irrelevant to accretion",
          "Accretion has nothing to do with financing mix",
        ],
        correctIndex: 1,
        explanation: "A stock-funded deal is typically accretive only when the acquirer's own (richer) P/E is higher than the target's — effectively \"buying\" earnings at a cheaper multiple using expensive stock as currency.",
      },
      {
        question: "In a comps analysis, why use the peer median instead of the average?",
        options: [
          "The median is always a larger number",
          "One outlier peer can skew an average, while the median is more resistant to that",
          "Averages are illegal in valuation work",
          "There's no real difference between the two",
        ],
        correctIndex: 1,
        explanation: "A median resists distortion from one unusually high or low peer multiple, giving a more representative sense of where the peer group actually trades.",
      },
    ],
  },

  // ————————————————————————————————————————————————————————————
  // 11. Reading a Real Deal (adapted from the old lessons.ts entry)
  // ————————————————————————————————————————————————————————————
  {
    number: 11,
    slug: "reading-a-real-deal",
    title: "Reading a Real Deal",
    track: "Corporate Finance",
    tagline: "What an actual M&A deal announcement contains, and how to read one like an analyst instead of a headline",
    body: `# Reading a Real Deal

Chapter 9 covered why deals happen and two historical case studies. Chapter 10 covered the accretion/dilution mechanics. This chapter is the missing piece between them: how to actually read a real deal announcement and pull out what an analyst would — precisely the skill that makes "walk me through a deal you've been following" a genuinely differentiating interview answer instead of a generic one.

## What's actually in a real deal announcement

- **Consideration**: is the target being bought for cash, stock, or a mix? This single fact tells you more about the deal's real character than almost anything else — an all-cash deal signals the acquirer has (or is borrowing) real capital and wants certainty; a stock deal means target shareholders are betting on the combined company's future.
- **The premium**: the offer price compared to the target's *undisturbed* share price (typically right before announcement, or averaged over the preceding 30-90 days). A takeover premium in the 20-40% range is typical for a negotiated deal; a much lower premium can signal a weak negotiating position for the target's board.

**Worked example:** premium = (offer price − undisturbed price) ÷ undisturbed price. Target traded at $40/share before any deal rumors; the acquirer offers $52/share cash. Premium = ($52 − $40) ÷ $40 = **30%** — squarely in the typical negotiated-deal range from above.
- **Deal multiple**: EV/EBITDA or EV/Sales the acquirer is paying, compared to where public peers trade — the trading-comps skill from Chapter 10, applied to a real transaction.
- **Financing**: for a cash deal, is it funded from balance sheet cash, new debt, or a mix? A highly-levered financing package is a real signal about how confident the acquirer is in the combined company's future cash flow.
- **Strategic rationale, in management's own words**: every press release states one (cost synergies, revenue synergies, consolidation, vertical integration) — a real analyst's job is to ask whether that's actually the most likely explanation, or a more palatable framing of something else (defending market share, pre-empting a competitor, empire-building).
- **Expected close timeline and regulatory conditions**: does the deal need antitrust approval in multiple jurisdictions? A deal combining the two largest players in a concentrated industry (the exact risk flagged in Chapter 9) faces real regulatory risk a deal between smaller, non-overlapping players doesn't — which is why the market often prices a real "deal spread" (the target's stock trading below the offer price) for deals with genuine regulatory uncertainty.

## Why the market's reaction is itself a data point

Watch both stocks, not just the target's (which almost always jumps toward the offer price). **The acquirer's stock reaction is the more informative one**: a falling acquirer share price on announcement is the market's real-time verdict that it's skeptical of the price paid, the financing structure, or the strategic logic — a genuinely useful signal, priced in within minutes, well before any promised synergies could possibly have materialized.

## How to actually build this skill

Pick one real, recent, sizable public M&A deal — something large enough to have real analyst coverage, not an obscure small-cap transaction. This site's own My Analysis is a good place to find one already being tracked. Answer, in writing: what's the consideration mix, what premium was paid, what multiple does that imply, how did *both* stocks react on announcement day and why, and what regulatory risk sits between announcement and close. Then find one piece of real analyst or press skepticism about the deal, and one piece of real support for it — the same "evidence on both sides, no forced verdict" discipline this site's own Hype vs Fundamentals module is built around.`,
    tryIt: [
      {
        label: "Read My Analysis",
        href: "/analysis",
        moduleColor: "analysis",
        description: "Find a real, dated deal or market write-up to practice this chapter's exercise on directly.",
      },
      {
        label: "Open Hype vs Fundamentals",
        href: "/hype",
        description: "The same \"evidence on both sides, no forced verdict\" discipline this chapter asks you to apply to a real deal.",
      },
    ],
    quiz: [
      {
        question: "Why does the consideration mix (cash vs. stock) matter so much when reading a deal?",
        options: [
          "It only affects the acquirer's accountants",
          "It signals the acquirer's confidence and capital position, and determines whether target shareholders are betting on the combined future",
          "It has no real impact on how the deal is read",
          "Stock deals are always better for target shareholders",
        ],
        correctIndex: 1,
        explanation: "Cash signals certainty and available capital; stock ties target shareholders' outcome directly to the combined company's future performance — a fundamentally different bet.",
      },
      {
        question: "A typical negotiated-deal takeover premium falls roughly in what range?",
        options: ["0-5%", "20-40%", "80-100%", "There's no typical range"],
        correctIndex: 1,
        explanation: "20-40% over the undisturbed share price is a typical range for a negotiated deal — a much lower premium can signal a weaker negotiating position for the target's board.",
      },
      {
        question: "Why is the acquirer's stock reaction on announcement day considered especially informative?",
        options: [
          "It never actually moves",
          "It reflects the market's real-time judgment on the price paid and strategic logic, before any synergies could have materialized",
          "It only reflects unrelated market noise",
          "It's illegal to trade the acquirer's stock around announcement",
        ],
        correctIndex: 1,
        explanation: "Since the target's stock almost always jumps toward the offer price regardless of deal quality, the acquirer's reaction is the more genuine, immediate signal of market skepticism or approval.",
      },
      {
        question: "What creates a real \"deal spread\" (target trading below the announced offer price)?",
        options: [
          "A typo in the press release",
          "Genuine market-priced uncertainty about whether the deal will actually close, often regulatory risk",
          "The target company's own choice",
          "Deal spreads never actually happen"
        ],
        correctIndex: 1,
        explanation: "A deal spread reflects the market pricing in real probability the deal doesn't close as announced — regulatory risk (especially in concentrated industries) is a common driver.",
      },
    ],
  },

  // ————————————————————————————————————————————————————————————
  // 12. Reading the Market Today
  // ————————————————————————————————————————————————————————————
  {
    number: 12,
    slug: "reading-the-market-today",
    title: "Reading the Market Today",
    track: "Corporate Finance",
    tagline: "How to actually read a day's market move — sector rotation, narrative vs. fundamentals, and why it all connects",
    body: `# Reading the Market Today

Every earlier chapter built one piece: equities, rates, FX, commodities, deals, valuation. This chapter is about putting those pieces together into an actual daily habit — how to look at "the market" on any given day and have a real, structured read on what's happening, instead of just reacting to headlines.

## Sector rotation — money moving, not just totals moving

Markets rarely move as one uniform block. **Sector rotation** describes money flowing out of one part of the market and into another as the economic cycle, interest rate expectations, or a specific narrative shifts — for example, money moving from richly-valued growth/tech names into cheaper, more defensive sectors when investors get nervous about rates or growth, and the reverse when optimism returns. Watching *which* sectors are leading or lagging a broad index move, not just the index level itself, is usually more informative than the headline number alone.

## Narrative vs. fundamentals — the distinction that matters most

A price move can be driven by two very different things: **fundamentals** (an actual, measurable change — an earnings beat, a rate decision, a real change in demand) or **narrative** (a story gaining momentum — excitement, fear, a theme catching on — that outruns any current, measurable evidence for it). Both are real and both move prices; the skill is telling them apart, and asking, for any given move: *what specific evidence is this being priced on, and is that evidence actually here yet, or just expected?*

This is precisely the discipline this site's own Hype vs Fundamentals module is built around — real historical cases where a narrative ran ahead of the numbers (and what eventually happened), plus current, unresolved themes tracked the same way, without forcing a premature verdict on which one they are.

## How central bank policy filters through everything you've learned

A single rate decision touches every asset class covered in this course simultaneously: bond prices move immediately (Chapter 3's core mechanism), currencies react through the rate-differential logic from Chapter 4, and equities react both directly (a company's own borrowing costs, and the discount rate in every DCF from Chapter 10) and indirectly (via risk sentiment). Reading "the market" on a rate-decision day means checking all of these together, not just the headline equity index move — this site's own Central Bank Room is built to make exactly that real-time context available in one place.

## A practical framework for reading any day's market move

1. **What actually moved**, specifically — which sectors, which asset classes, not just "stocks were up."
2. **Why** — is there a specific, identifiable trigger (a data release, a rate decision, an earnings report, a real news event), or is it unclear?
3. **Fundamentals or narrative** — is the move backed by something measurable that happened today, or is it running ahead of the evidence?
4. **Is it durable** — a move with a clear fundamental driver behind it tends to be more durable than a narrative-only move, though narratives can run for a genuinely long time before they resolve either way.

This is a habit, not a one-time lesson — the more real days you run this framework against, the faster it becomes second nature.`,
    tryIt: [
      {
        label: "Open Markets Overview",
        href: "/markets",
        description: "See real, current sector-level performance and an AI summary grounded in real news — practice the sector-rotation read from this chapter on today's actual market.",
      },
      {
        label: "Open Central Bank Room",
        href: "/macro",
        moduleColor: "macro",
        description: "Real policy rates and recent decisions across major central banks — the input that touches every asset class in this course at once.",
      },
      {
        label: "Open Hype vs Fundamentals",
        href: "/hype",
        description: "Real cases where narrative ran ahead of the numbers, and current themes tracked the same honest way.",
      },
    ],
    quiz: [
      {
        question: "What does \"sector rotation\" describe?",
        options: [
          "A company changing its industry classification",
          "Money flowing out of one part of the market and into another as conditions or narratives shift",
          "A scheduled quarterly rebalancing required by regulators",
          "A single stock rotating through different exchanges",
        ],
        correctIndex: 1,
        explanation: "Sector rotation is capital moving between sectors as the cycle or sentiment shifts — often more informative to watch than a broad index's single headline number.",
      },
      {
        question: "A stock rallies hard on genuine excitement about a theme, well before any company in the space reports the earnings to support it. This is best described as:",
        options: [
          "A fundamentals-driven move",
          "A narrative-driven move, running ahead of current evidence",
          "Impossible — prices only move on real data",
          "A sector rotation",
        ],
        correctIndex: 1,
        explanation: "This is the classic narrative-ahead-of-fundamentals pattern — real, capable of persisting a long time, but distinct from a move backed by current, measurable evidence.",
      },
      {
        question: "Why does a single central bank rate decision affect equities, bonds, and currencies all at once?",
        options: [
          "It doesn't — rate decisions only affect bond prices",
          "Because it changes the discount rate in equity valuation, the direct bond-price mechanism, and the rate-differential driver of currencies, simultaneously",
          "Only currencies react to rate decisions",
          "The effect is purely psychological with no real mechanism",
        ],
        correctIndex: 1,
        explanation: "A rate change is a genuine, mechanical input into bond pricing (Ch.3), FX rate differentials (Ch.4), and equity discount rates (Ch.10) all at once — which is why it's one of the most closely watched events across every asset class.",
      },
      {
        question: "In the practical framework from this chapter, what's the last question to ask about any market move?",
        options: [
          "What's the ticker symbol?",
          "Is the move durable, or likely to fade?",
          "What time zone did it happen in?",
          "Who reported it first?",
        ],
        correctIndex: 1,
        explanation: "After identifying what moved, why, and whether it's fundamentals- or narrative-driven, the final practical question is durability — whether the move is likely to persist or fade.",
      },
    ],
  },

  // ————————————————————————————————————————————————————————————
  // 13. Capstone
  // ————————————————————————————————————————————————————————————
  {
    number: 13,
    slug: "capstone-build-your-own-pitch",
    title: "Capstone: Build Your Own Pitch",
    track: "Capstone",
    tagline: "Put every chapter together into one real, defensible stock pitch — the actual output this whole course has been building toward",
    body: `# Capstone: Build Your Own Pitch

Twelve chapters in, you've covered every major asset class, most of the major seats in the industry, the accounting foundation, and the four core valuation methods. This capstone doesn't teach a new concept — it's the exercise that makes you actually use all of them together, on one real company, the way an analyst genuinely would.

## What a real pitch actually contains

A defensible investment pitch isn't a prediction — it's a structured argument, and every genuinely good one contains the same core pieces:

1. **A clear thesis** — one or two sentences stating what you believe and why, specific enough to be provably right or wrong later (not "this is a good company," but "the market is underpricing X because of Y").
2. **Valuation** — a real number, built from a real method (Chapter 10's DCF or comps), not a vibe. What's it worth, and why.
3. **Catalysts** — specific, identifiable events that could cause the market to re-price the stock toward your thesis (an earnings report, a product launch, a macro shift from Chapter 12).
4. **The bear case, argued honestly** — the strongest real argument *against* your own thesis, not a straw man. A pitch that can't articulate a real bear case hasn't actually stress-tested itself.
5. **Sources** — every real number traced back to where it came from, in the same discipline this entire site has followed throughout.

## Step by step, using this site's own tools

1. **Pick a real company** you actually find interesting — via Company Profile. Read its plain-English snapshot, financials, and current multiples first.
2. **Build a real valuation** — download a DCF (or comps) template from Model Templates for that company, prefilled with real data, and work through the mechanics from Chapter 10 yourself.
3. **Form your thesis** — using everything from this course: is this an equities story (Chapter 2), does it have a fixed-income or credit angle (Chapter 3), is it exposed to FX or commodities (Chapter 4), does current market positioning (Chapter 12) support or fight your view?
4. **Write the bear case honestly** — the discipline from Chapter 11's "evidence on both sides" approach, applied to your own idea instead of someone else's deal.
5. **Compare your work to the real thing** — this site's own My Analysis section has ten full, real stock pitches, each with a sourced DCF, WACC, and Bear/Base/Bull scenarios, built exactly this way. Reading a few before or after building your own is one of the fastest ways to see what a genuinely rigorous pitch looks like end to end.

## Where to go from here

There's no next chapter after this one — that's the point. The rest of this site is where the course actually gets used: pull up a new company in Company Profile whenever something catches your interest, check Central Bank Room and Markets Overview as a regular habit rather than a one-time lesson, and come back to Model Templates whenever you want to actually build something instead of just read about it. That loop — curious about something, go find the real data, build the real number — is the actual job, in miniature.`,
    tryIt: [
      {
        label: "Open Company Profile",
        href: "/profile",
        description: "Pick your company and build your own rating, thesis, and target price directly on its page.",
      },
      {
        label: "Read the real stock pitches",
        href: "/analysis",
        moduleColor: "analysis",
        description: "Ten full, sourced pitches — DCF, WACC, Bear/Base/Bull — built with the same structure this capstone asks you to follow.",
      },
    ],
    templateLink: { label: "Download a DCF template to build your valuation", href: "/templates" },
    quiz: [
      {
        question: "What separates a real investment thesis from a vague opinion?",
        options: [
          "Length — longer is always better",
          "It's specific enough to be provably right or wrong later, not just a general good feeling",
          "It must always be bullish",
          "It doesn't need any supporting valuation",
        ],
        correctIndex: 1,
        explanation: "\"This is a good company\" can't really be tested. \"The market is underpricing X because of Y\" can — that specificity is what makes a thesis a real, checkable claim rather than just a vibe.",
      },
      {
        question: "Why does a genuinely good pitch include an honestly argued bear case?",
        options: [
          "It's a formality nobody actually reads",
          "Because a thesis that can't survive its strongest counterargument hasn't actually been stress-tested",
          "To make the pitch longer",
          "Bear cases are only required for short pitches",
        ],
        correctIndex: 1,
        explanation: "Arguing the real, strongest case against your own thesis — not a straw man — is what actually tests whether the thesis holds up, the same discipline from Chapter 11's deal-reading exercise.",
      },
      {
        question: "According to this capstone, what's the actual point of comparing your own pitch to the real ones in My Analysis?",
        options: [
          "To copy the exact numbers",
          "To see what a genuinely rigorous pitch looks like end to end, and check your own work against that standard",
          "There's no real value in doing this",
          "Only to check spelling and formatting",
        ],
        correctIndex: 1,
        explanation: "Reading real, fully worked pitches — sourced valuation, honest bear case and all — is the fastest way to calibrate what \"rigorous\" actually looks like before or after building your own.",
      },
    ],
  },
];
