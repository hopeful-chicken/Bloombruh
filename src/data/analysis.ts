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

// Stock pitches — carried over from what used to be "The Vault" (now
// retired as a browsable page in favor of the downloadable Word doc
// linked in the footer), merged in here since this page is now the one
// place for Adam's own market opinions generally, not just macro
// write-ups. Same sourcing discipline as everything else on this page.
export const STOCK_PITCHES: AnalysisEntry[] = [
  {
    id: "stock-pitches",
    title: "10 Stock Pitches",
    tagline: "Diploma PLC, a Pokemon pick, two controversial names, and the AI/geopolitics trades running right now",
    date: "2026-07-22",
    body: `# 10 stock pitches — researched July 2026

Spans quality compounders, mega-cap AI exposure, a Pokemon/gaming name, two ESG-sensitive/controversial names, three geopolitically-driven names, one everyday UK consumer name, and one uranium/nuclear equity riding the AI power-demand theme. Mostly equities, one commodity-adjacent miner, as asked.

---

## 1. Diploma PLC (LSE: DPLM) — the mandatory one, and the UK "quality compounder" case study

**What it is:** A UK-listed distributor of unglamorous, mission-critical technical products — specialty seals, industrial controls, life-sciences consumables — through three divisions (Seals, Controls, Life Sciences), grown mostly by serial bolt-on acquisition of small, founder-owned distributors.

**The pitch:** Diploma is the textbook UK "compounder" — a business that doesn't sound exciting (nobody dreams of owning a seals distributor) but has quietly compounded shareholder returns for two decades by buying small distributors at reasonable multiples, keeping their entrepreneurial management in place, and cross-selling/scaling procurement behind the scenes. As of 22 July 2026 the stock trades around 7,525p, inside a 52-week range of 4,558p–7,295p (so it's actually pushed to a new high very recently). Q1 FY2026 EPS was up 36% year-on-year, revenue up 17% (15% organic — well above its own five-year average), and operating margin expanded 300bps to 24.5%. Full-year guidance was upgraded to over 30% operating profit growth. It's also been active on the acquisition trail in 2026: a £236m deal for Peerless Aerospace Fastener (a US aerospace-fastener distributor, expected to add ~8% to group EPS in year one), a £38m bolt-on for UK seals/gaskets specialist PAR Group, and a CDM acquisition specifically to build out US defense-market exposure — quietly picking up some of the same European-rearmament tailwind as BAE Systems (#5 below), just through the industrial-distribution side rather than the prime contractor.

**Macro angle:** Diploma is a pure-play bet on "boring but necessary" industrial replacement demand — seals and controls don't get cut from budgets in a downturn the way discretionary capex does, which is part of why it's held up through multiple rate cycles. Its US exposure (a majority of revenue) also makes it a levered play on US industrial/reshoring capex and, now, US defense-adjacent spending specifically.

**Personal-connection angle:** You've almost certainly never bought anything from Diploma directly — that's the point. But if you've been anywhere near a UK investing society, a "quality compounder" podcast, or a UK equities course at UCL, Diploma is one of the most-cited FTSE 250/100 case studies for "how do you compound at 15-20%+ for two decades without doing anything sexy" — it's the kind of name that comes up constantly in exactly the circles you're already in.

**Key risk:** The entire model depends on continuing to find and integrate acquisitions at sensible prices — it's a "roll-up," and roll-ups can go wrong if they overpay, integrate badly, or run out of good targets. Its valuation (well above the market multiple) already prices in a lot of continued execution.

**Sources:** [Diploma Q1/H1 2026 results and acquisitions](https://www.tipranks.com/news/company-announcements/diploma-plc-expands-with-strategic-acquisition), [Diploma share price](https://www.investing.com/equities/diploma--plc), [Peerless Aerospace Fastener acquisition](https://www.tipranks.com/news/global-markets/uk-stocks-diploma-dplm-shares-rally-on-peerless-acquisition)

---

## 2. Nintendo (TYO: 7974) — the Pokemon pick, and a genuine "hype vs. fundamentals" gap

**What it is:** The Japanese gaming giant, owner of Switch/Switch 2 hardware, and one of three joint-venture partners (with Game Freak and Creatures Inc., each holding roughly a one-third stake) in The Pokemon Company, which manages the games, anime, and trading card game globally.

**The pitch — and this one is genuinely interesting because the *fundamentals* and the *stock price* are currently telling opposite stories.** Nintendo's FY26 (year to March 2026) net sales nearly doubled, up 98.6% year-on-year to ¥2.313 trillion, driven by Switch 2 (19.86 million units sold in its first 10 months — the fastest-selling console in Nintendo's history) and Pokemon-branded software like Pokemon Pokopia (over 4 million copies in five weeks). The Pokemon Company itself reported $3.33bn revenue and $752m net profit for the year to February 2026. By any normal reading, that's one of the best years the Pokemon franchise has ever had.

And yet the stock is down roughly 53% from its 52-week high (¥14,795) to where it trades today (¥6,969) — near the bottom of its 52-week range. Why? Two real, dated catalysts: a memory-chip price surge (driven by — yes — the AI infrastructure buildout competing for the same DRAM/NAND supply) pushed up Switch 2's bill of materials, forcing a price hike that spooked investors about future unit sales (shares fell ~7-8% on 11 May 2026 on this news), and a June 2026 Nintendo Direct showcase disappointed by leaning on a Zelda remake and ports rather than a new mainline 3D Mario or other blockbuster, sending shares down over 10% in a single day.

**This is the exact "hype vs. fundamentals" tension the site's own module is built to explore, just running in the opposite direction from most of the cases there** — not a story priced far *above* the numbers, but arguably a real operating story (record hardware cycle, record Pokemon year) currently priced *below* what the numbers alone would suggest, because of a genuinely unrelated cost shock (AI-driven memory prices) and a software-pipeline scare.

**Macro/geopolitical angle:** Nintendo hardware margins are now directly exposed to the same AI-driven memory-chip supercycle that's inflating data-center capex everywhere else on this list — a rare case of the "AI trade" reaching all the way into a Japanese toy company's bill of materials.

**Personal-connection angle:** This is the direct one — if you've ever played a Pokemon game, owned any Nintendo console, or opened a booster pack, you're a direct consumer of both halves of this stock's business.

**Key risk:** Console cycles are lumpy and hit-driven — Nintendo's whole model depends on hardware attach rates and a strong first-party software pipeline, and the market just showed you exactly how fast sentiment swings when that pipeline looks thin, even against genuinely strong current numbers.

**Sources:** [Nintendo FY26 financial results](https://nintendoeverything.com/nintendo-financial-results-may-2026-switch-2-at-19-86-million-units-switch-at-155-92-million-more/), [Pokemon's best year ever](https://gamerant.com/pokemon-2026-highest-sales-ever/), [Nintendo share price decline on price hike](https://www.cnbc.com/2026/05/11/nintendo-stock-switch-2-price-rise-weak-sales-forecast.html), [June 2026 Direct disappointment](https://gamerant.com/nintendo-stock-price-down-why-february-2026/), [Pokemon Company ownership structure](https://legalclarity.org/who-owns-pokemon-nintendo-game-freak-creatures/)

---

## 3. Microsoft (NASDAQ: MSFT) — the "common" pick, and the center of the AI-capex debate

**What it is:** The software giant you already use every day for UCL coursework — Windows, Office/Teams — now also the largest single financial backer of OpenAI and the company spending more on AI infrastructure than almost anyone on earth.

**The pitch:** Microsoft owns roughly a 27% as-converted stake in OpenAI Group PBC, valued at about $135bn after the 2025-2026 recapitalization, and booked a $7.6bn accounting gain from that stake in Q2 FY2026 alone. Its AI annual revenue run-rate has passed $37bn, up 123% year-on-year. But the number everyone is actually arguing about is capex: Microsoft guided to roughly $190bn of capital expenditure for calendar 2026 (up ~61% on 2025), while Microsoft 365 Copilot's paid seats — the actual monetization engine meant to justify that spend — sit at just over 20 million, generating an estimated $3-5bn a year. That gap between $190bn spent and single-digit-billions earned back so far is the single cleanest number in this whole list of pitches for framing the AI-bubble question directly.

**Macro/geopolitical angle:** Microsoft is as close to a pure read on "is the AI capex cycle justified" as a mega-cap gets — it sits at the intersection of the compute buildout (data centers, chips), the platform bet (OpenAI), and the actual paying-customer monetization (Copilot), so its own numbers are a live scoreboard for the debate this site's Hype vs Fundamentals module runs on AI & Semiconductors generally.

**Personal-connection angle:** You are quite literally using Microsoft's products to write your university coursework right now, and if Copilot has started appearing inside Word/Teams/Outlook at UCL or in any part-time work, you've already met the exact product this $190bn bet is riding on.

**Key risk:** If Copilot adoption/monetization doesn't scale meaningfully faster than it has so far, the market's patience with a multi-year "trust me" capex story could run out — this is precisely the AI-bubble tension already live in this site's Hype vs Fundamentals section.

**Sources:** [Microsoft OpenAI stake and Q3 FY2026 capex](https://www.kalkine.com/news/artificial-intelligence/microsoft-stock-msft-analysis-2026-azure-acceleration-copilot-scale-and-the-190b-capex-question), [Copilot monetization math](https://www.vaasblock.com/research/microsoft-copilot-monetization-capex-return-timeline-2026/)

---

## 4. British American Tobacco (LSE: BATS / NYSE: BTI) — the controversial one, with a direct NBIM tie-in

**What it is:** One of the world's largest tobacco companies (Dunhill, Lucky Strike, Vuse vapes, Velo nicotine pouches), and a genuine, live example of the ESG-exclusion debate you'll run into directly if you end up at NBIM.

**The pitch:** BAT is the classic "value trap or deep value" argument. It's committed to a £1.3bn 2026 share buyback programme on top of a progressive dividend (next dividend 61.26p per share), and its "New Categories" (vapes, nicotine pouches, heated tobacco) business is back to double-digit growth, led by Velo, which reached a #2 volume/value position in its category within a year of a key launch and is already profitable. Management's own financial algorithm targets +3-5% revenue, +4-6% profit, +5-8% EPS growth — 2026 guidance sits at the low end of that range while the company keeps reinvesting in the transition away from combustible cigarettes. The stock has historically traded at a low single-digit-to-low-teens P/E and a high dividend yield precisely because so much of the market treats it as structurally declining/excluded — which is exactly the "is the discount justified or is the market wrong" question a value analyst has to answer.

**The direct NBIM angle, and why this pitch matters for your specific goal:** Norway's Government Pension Fund Global has publicly and explicitly excluded tobacco *manufacturers* (not just producers of some component) from its investable universe since around 2010, on ethical grounds set by Norway's own Council on Ethics — this is one of the cleanest real-world examples of NBIM's exclusion criteria actually removing a large-cap, high-yield stock from consideration, entirely independent of valuation. If you want to understand how NBIM's responsible-investment framework actually bites in practice (versus BAE Systems below, where conventional defense is *not* broadly excluded — a genuinely interesting contrast), BAT vs. BAE is the single clearest pair to study.

**Macro angle:** Regulatory risk (flavour bans, nicotine caps, illicit vape enforcement) is the dominant variable here, more than any macro cycle — the "illicit proliferation" problem specifically called out in BAT's own 2026 commentary on Vuse is a real, ongoing headwind independent of consumer demand.

**Personal-connection angle:** Even if you don't smoke or vape yourself, Vuse and other vape products are one of the most visible consumer-goods categories among UK students right now — hard to walk past a corner shop or a student night out without seeing the category BAT is fighting to own.

**Key risk:** Structural decline in combustible cigarette volumes in developed markets is real and permanent; the entire bull case rests on New Categories growing fast enough, and staying profitable enough, to replace that decline before it erodes the dividend.

**Sources:** [BAT FY2026 buyback and dividend guidance](https://www.stocktitan.net/sec-filings/BTI/6-k-british-american-tobacco-p-l-c-current-report-foreign-issuer-65bb444665c2.html), [BAT New Categories/Vuse strategy](https://www.bat.com/media/press-releases/_2026/february/preliminary-results-for-the-year-ended-31-december-2025), [NBIM's ethical exclusions and Council on Ethics](https://www.nbim.no/en/responsible-investment/our-expectations/)

---

## 5. BAE Systems (LSE: BA.) — the geopolitical one, and the mirror image of the BAT ESG question

**What it is:** Britain's largest defense contractor — submarines, fighter aircraft (Typhoon, F-35 components), naval vessels, electronic warfare and air-defense systems — and the direct commercial face of Europe's post-Ukraine rearmament.

**The pitch:** BAE's order backlog hit a record £83.6bn in 2025 (up £5.8bn from 2024), with 2025 order intake of £36.8bn. Management guided to 7-9% sales growth in 2026 and cumulative free cash flow above £6bn across 2026-2028. A specific, vivid data point: roughly £1.1bn of that order growth came from MBDA missile systems (Aster, VL MICA, Mistral) — a direct, traceable response to European governments scrambling to rebuild air-defense stockpiles after watching missile and drone warfare play out in Ukraine in real time.

**Macro/geopolitical angle:** This is as close to a pure geopolitical-risk-premium trade as a FTSE 100 stock gets — the entire re-rating of European defense names since 2022 is a direct market reaction to Russia's invasion of Ukraine and the resulting collapse of the post-Cold-War assumption that European defense budgets could stay permanently low. NATO members' commitments to raise defense spending as a share of GDP are the structural tailwind behind BAE's order book, not a cyclical one — this is a genuine "has the world changed" macro thesis, not just a quarter-to-quarter earnings story.

**The BAT contrast, worth thinking through explicitly:** NBIM does *not* broadly exclude conventional defense manufacturers the way it excludes tobacco — its product-based exclusions specifically target things like cluster munitions, anti-personnel landmines, and nuclear weapons components, not conventional arms manufacturing generally. That means a stock like BAE sits inside NBIM's investable universe while BAT sits outside it — a genuinely useful real case study in how "controversial" and "ESG-excluded" are not the same category, which is exactly the kind of nuance an NBIM-track analyst should be able to explain, not just gesture at.

**Personal-connection angle:** Less a "you bought this" connection and more a "you've been living through the actual news story this stock is priced on" — every headline about Ukraine, NATO spending targets, or European rearmament that you've read as an econ student for the past few years is the macro backdrop directly driving this stock's re-rating.

**Key risk:** A durable ceasefire or major de-escalation in Ukraine, or a serious pullback in NATO members' stated spending commitments, is the single biggest re-rating risk in the other direction — this stock's valuation has moved a long way on the assumption that elevated defense spending is now structural, not temporary.

**Sources:** [BAE record £83.6bn order backlog](https://kalkine.co.uk/news/industrials/bae-systems-in-2026-how-a-record-836bn-order-backlog-is-reshaping-a-ftse-100-defence-giant), [BAE Systems and European rearmament, CNBC](https://www.cnbc.com/2026/02/18/bae-systems-defense-spending-europe-military-geopolitics-weapons.html), [BAE MBDA missile orders and Ukraine](https://thedefensepost.com/2026/02/19/bae-systems-backlog-profit/)

---

## 6. ASML (NASDAQ/AEX: ASML) — the semiconductor-geopolitics one

**What it is:** The Dutch company that makes the only machines in the world capable of extreme ultraviolet (EUV) lithography — the process that etches the most advanced chip designs onto silicon. Every leading-edge chip on Earth, from Nvidia's AI accelerators to the processor in your phone, passes through an ASML machine at some point in its supply chain.

**The pitch:** ASML's backlog stood at €38.8bn at year-end 2025 (including €7.4bn of EUV bookings specifically) — more than a full year of current revenue, and not the kind of order book that gets cancelled on a whim. The company has never shipped an EUV machine to China and says it hasn't breached export controls despite recent US scrutiny, but the broader trend is unmistakable: China's share of ASML's system sales is expected to fall from 33% in 2025 to roughly 20% in 2026, with quarterly China sales already down to 19% of total (from 36% the prior quarter), as the 2025-2026 "MATCH Act" proposal in the US Congress pushes to further restrict advanced chipmaking equipment sales to China. Despite that headwind, guidance remains strong because there is currently no substitute supplier for EUV at the leading edge — this is a genuine monopoly on the single hardest step in modern chip manufacturing.

**Macro/geopolitical angle:** ASML is the cleanest possible single-stock proxy for the US-China chip war. Every escalation in export controls is a real, quantifiable hit to its addressable market (China revenue mix), while every leading-edge chip demand story (AI accelerators specifically) is a tailwind through the non-China two-thirds of its business — it's simultaneously a direct casualty and a direct beneficiary of the same broader tech-decoupling story, which makes it a genuinely interesting one to actually model rather than just read headlines about.

**Personal-connection angle:** This is the "you don't see it but you use it constantly" pitch — the chip inside your laptop, your phone, and (per Microsoft's capex above) the servers running the AI you're using right now were almost certainly patterned using an ASML machine at some point, even though you've never heard of the company from a consumer-facing angle.

**Key risk:** Escalating export controls are a real, structural headwind to a third of the historical customer base — the bull case depends on non-China (especially AI-driven) demand growing fast enough to keep absorbing that capacity.

**Sources:** [ASML China export restrictions and revenue mix](https://marketwise.com/investing/asml-earnings-china-export-restrictions-ai-chip-demand/), [ASML backlog and EUV monopoly](https://www.heygotrade.com/en/blog/asml-investment-case-euv-monopoly-semi-capex/), [ASML denies EUV shipments to China](https://techcrunch.com/2026/06/19/the-us-says-asmls-top-chip-tool-may-be-in-china-asml-says-it-isnt/)

---

## 7. Maersk (CPH: MAERSK-B) — the shipping/geopolitics one, and a live "what happens when the crisis ends" case study

**What it is:** One of the world's largest container shipping and logistics companies — the literal ships carrying much of what you buy online across oceans.

**The pitch:** For over a year, Houthi attacks in the Red Sea forced most container lines (Maersk included) to reroute around the Cape of Good Hope instead of the Suez Canal — adding transit time, removing effective global shipping capacity, and pushing freight rates up sharply (Asia-Europe rates 25-40% higher, Asia-US East Coast 15-25% higher than they'd otherwise be, adding $800-1,500 to a typical 40ft container). Maersk has just started reversing that: it completed test voyages and announced a permanent transition of its MECL service back through the Suez Canal in 2026, after 14 months of diversion. That's genuinely good news for global trade efficiency — and genuinely bad news for Maersk's own near-term earnings, because the return of that rerouted capacity to the market is expected to release 6-8% of global container capacity back into normal circulation, and analysts (HSBC among them) have warned the resulting rate collapse could be severe enough to push Maersk and peers like Hapag-Lloyd into losses.

**This is a rare, clean example of a company's own operational good news (safer, faster, cheaper routing) being bad news for its stock (rates collapsing as capacity floods back)** — worth sitting with, because "is this good or bad for the company" is not always the same question as "is this good or bad for the world," and untangling that distinction is a real analytical skill.

**Macro/geopolitical angle:** This is the most directly geopolitical pitch on the list — the entire multi-year freight-rate story has been driven by the Israel-Hamas war's regional spillover into Yemen/Houthi attacks on Red Sea shipping, and its resolution (or non-resolution) is a pure geopolitical call, not an economic one.

**Personal-connection angle:** Every import-heavy product you've bought online in the last 18 months has had some of that $800-1,500-per-container Red Sea premium baked into its price, whether you noticed or not — this is a case where "the news" and "your own cost of living" were the same story the whole time.

**Key risk:** A full, durable normalization of Red Sea transit could compress freight rates faster than the market currently expects, which — counterintuitively for a "good news" geopolitical outcome — is the actual bear case for the stock.

**Sources:** [Maersk's Suez Canal return](https://www.maritimenews.com/red-sea/maersk-return-red-sea-carrier-shift), [Red Sea freight rate premium](https://suaidglobal.com/insights/red-sea-shipping-crisis-2026/), [Rate collapse risk from Suez return](https://gulfnews.com/business/markets/container-shipping-heads-toward-a-harder-2026-as-red-sea-reopening-pressures-rates-1.500441624)

---

## 8. Greggs (LSE: GRG) — the everyday UK one

**What it is:** The UK's ubiquitous bakery/food-on-the-go chain — sausage rolls, the Chicken Roll, meal deals — and one of the most recognizable high-street names to any UK student.

**The pitch:** Greggs posted £800m of sales in the first 19 weeks of 2026, up 7.5% on the same period in 2025, with like-for-like sales in company-managed shops accelerating to 3.3% in the most recent 10 weeks — helped in part by April 2026's Chicken Roll launch, described as a genuine customer favourite. Shares rose over 5% on the update. The strategic story going forward is about capital discipline finally catching up to years of estate expansion: heavy capex is set to fall from £287.5m in 2025 toward £200m in 2026 and £150-170m from 2027, which should free up cash and improve returns on capital as the newer, already-built sites mature rather than continuing to add new ones at the same pace.

**Macro angle:** Greggs is a genuine "value/discretionary" bellwether for UK consumer spending — its whole positioning (cheap, fast, no-frills) means it tends to be relatively resilient (sometimes even benefits from "trading down") when household budgets tighten, which makes its like-for-like sales trend a useful real-time read on UK consumer health more broadly.

**Personal-connection angle:** This is the most direct connection on the entire list — if you've ever grabbed a meal deal between lectures at UCL, you've been a Greggs customer, full stop.

**Key risk:** The bull case now depends on margin/returns discipline (slower capex, better returns on the existing estate) rather than pure growth — if like-for-like sales momentum fades just as capex is being cut back, there's less growth to fall back on.

**Sources:** [Greggs H1 2026 sales growth](https://www.asktraders.com/analysis/greggs-shares-rise-as-sales-top-800m-and-trading-momentum-builds/), [Greggs capex reduction plan](https://www.morningstar.com/news/alliance-news/1778574964231309100/greggs-says-sales-growth-picks-up-despite-challenging-market)

---

## 9. Palantir Technologies (NASDAQ: PLTR) — the second controversial one, and the cleanest "is this the top" stock on the whole list

**What it is:** A data-analytics/AI software company built originally for US government and defense clients (Palantir Gotham), now expanding aggressively into commercial AI (Palantir AIP).

**The pitch, and why it's genuinely controversial rather than just "another AI stock":** Palantir trades at roughly 200x trailing earnings and ~80x forward 2026 earnings — versus 25-40x forward earnings for most enterprise software peers — despite genuinely exceptional growth (a "Rule of 40" score above 140%, meaning growth rate plus profit margin comfortably clears the usual software-quality bar several times over). Commercial AI revenue surged 342% year-on-year to $1.31bn, with 47% free cash flow margins — real numbers, not vapourware. But government revenue is still 55% of the total, anchored by contracts like a $10bn multi-year US Army deal, which makes future growth partly a bet on continued political/budgetary alignment rather than pure market demand. The valuation math is brutally simple: at 85-100x forward earnings, even a modest miss (growth slowing from 60% to 40%) can compress the multiple enough to wipe out 40% of the share price with zero actual deterioration in the underlying business — pure multiple compression, nothing else. Michael Burry (of "The Big Short" fame) publicly disclosed a bet against both Palantir and Nvidia in late 2025, explicitly on this "priced for perfection" argument.

**Macro/geopolitical angle:** Palantir's government-contract concentration ties its growth partly to US defense/intelligence budget cycles and political priorities (much like BAE Systems above, but through software rather than hardware) — it's genuinely exposed to both the AI-adoption macro story and the same defense-spending macro story as #5, in one stock.

**Personal-connection angle:** Less a product you've used and more a company you've almost certainly seen argued about — Palantir is one of the most-discussed, most-polarizing names in any finance/tech discussion right now, precisely the kind of "everyone has a hot take" stock worth being able to actually value rather than just repeat a side of.

**Key risk:** This is the single most explicit "hype vs. fundamentals" stock on this entire list — genuinely strong, real growth, priced at a multiple that leaves essentially no room for anything to go even slightly wrong.

**Sources:** [Palantir valuation and Rule of 40](https://www.ainvest.com/news/palantir-stock-valuation-growth-sustainability-2026-government-contracts-ai-adoption-justify-hype-2512/), [Palantir government contract concentration](https://intellectia.ai/news/stock/palantir-secures-major-government-contracts-amid-valuation-concerns), [Michael Burry's bet against Palantir/Nvidia](https://www.ainvest.com/news/palantir-stock-buy-2026-balancing-ai-ambition-valuation-regulatory-risks-2512/)

---

## 10. Cameco (NYSE/TSX: CCJ) — the uranium/commodity-adjacent one, and the AI story's power-demand mirror image

**What it is:** One of the world's largest uranium producers, giving direct exposure to the uranium price and the broader nuclear-fuel-cycle — the one commodity-linked pick on this list, expressed as an equity rather than the raw commodity itself, as you asked.

**The pitch:** Uranium spot prices surged roughly 25% in January 2026, breaking above $100/lb for the first time in two years, before settling near $86/lb more recently; long-term contract prices reached $90/lb by Q1 2026, the highest since 2008. Cameco's Q1 2026 results beat expectations, with net earnings up 87% year-on-year and uranium-segment adjusted EBITDA up from C$286m to C$423m, on both higher volumes and a higher realized price ($66.21/lb vs $62.55/lb a year earlier). The driver is the same AI infrastructure buildout showing up everywhere else on this list, but through its electricity-demand side rather than its chip-demand side: hyperscalers are signing direct long-term power purchase agreements with nuclear operators to guarantee carbon-free, always-on electricity for data centers — Meta alone signed for up to 7.8 gigawatts of nuclear capacity in Q1 2026, and Microsoft (the same Microsoft from pitch #3) executed agreements for over 800 megawatts specifically for data-center operations.

**Macro angle:** This is the cleanest "second-order AI trade" on the list — rather than betting directly on AI chips or software, Cameco is a bet that the AI buildout's electricity appetite (which nobody disputes is real and growing, unlike the software-monetization question in pitch #3) flows through into sustained uranium demand, in a market where new mine supply takes years to bring online regardless of price.

**Personal-connection angle:** Every AI query you've run for this university project, and every one I've run researching it for you tonight, is part of the exact electricity-demand story this stock is priced on — about as direct a "you personally are the demand driver" connection as any pick on this list.

**Key risk:** Uranium is a notoriously cyclical, historically volatile commodity market (long memory of the post-Fukushima crash) — a slowdown in the AI capex cycle itself (the same risk sitting under Microsoft and Palantir above) would hit the demand story this stock depends on, even though the electricity-demand thesis is arguably more durable than the software-monetization one.

**Sources:** [Uranium price surge and AI data center demand](https://carboncredits.com/uranium-prices-2026-supply-crunch-and-rising-demand-fuel-a-nuclear-bull-market/), [Cameco Q1 2026 results](https://www.indexbox.io/blog/cameco-the-largest-pure-play-nuclear-company-amid-rising-uranium-demand/), [Meta and Microsoft nuclear power purchase agreements](https://www.investorideas.com/news/2026/energy/05131-nuclear-stocks-ai-power-demand.asp)
`,
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
