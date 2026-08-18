// Static config for the module cards shown on the landing page and in nav.
// Adding a new module later = add a folder under src/app/ + an entry here.

export type ModuleInfo = {
  name: string;
  slug: string; // route, e.g. "/swf"
  // "live": ready, Adam stands behind it. "beta": fully built and
  // browsable, but not yet polished/verified enough to call finished —
  // still real, not fake data, just labeled honestly as in-progress.
  // "soon": not built yet, not linkable.
  status: "live" | "beta" | "soon";
  tagline: string;
  description: string;
  // Optional module "signature color" (see docs/DECISIONS.md, Aug 2026) —
  // used for this module's own eyebrow label, active nav pill, and card
  // accent on the homepage. Omitted = falls back to the shared brand
  // accent. Kept to the four "live" modules only, deliberately, so this
  // stays a small function-coded palette rather than one color per card.
  accentColor?: "macro" | "pokemon" | "analysis";
  // Optional small handwritten-style aside rendered in the card corner
  // (see ModuleGrid.tsx / the `font-hand` note pattern from the homepage
  // hero, Aug 2026). Sparingly used — a note on every card would just be
  // noise, so only add one where it's actually worth saying something.
  note?: string;
};

export const modules: ModuleInfo[] = [
  {
    name: "Company Profile",
    slug: "/profile",
    status: "live",
    tagline: "Ticker in, full profile and your own pitch out",
    description:
      "A clean company snapshot: price chart, full financials, and a plain-English description, with context on whether the multiples look cheap or expensive, plus the option to build your own rating, thesis, and target price on top and export it as a PDF.",
  },
  {
    name: "Central Bank Room",
    slug: "/macro",
    status: "live",
    tagline: "Real rates, history, news, and Adam's take on the Fed, ECB, BoE, BoJ and more",
    description:
      "Pick a central bank and see its actual policy rate, a history chart, a timeline of past rate decisions, plain-English context on monetary and fiscal policy, real sourced news headlines, and Adam's own written commentary, each kept clearly separate so you always know what is data, what is education, and what is opinion.",
    accentColor: "macro",
  },
  {
    name: "Markets Overview",
    slug: "/markets",
    status: "beta",
    tagline: "Pick a period, see the numbers, by sector and by private market",
    description:
      "A plain-English read on how the market is doing: a world-situation summary, then a closer look by equity sector (global equities, TMT, financials, healthcare, energy, industrials, consumer) and by private-market segment (private equity, private credit, real assets, via public proxies). Pick a period (week/month/year/forever) and see real price data, a grounded AI narrative, real news, and Adam's own take, each kept clearly separate.",
  },
  {
    name: "Model Templates",
    slug: "/templates",
    status: "beta",
    tagline: "Downloadable Excel models with live formulas, prefilled with real data",
    description:
      "The work analysts actually produce, as personalizable Excel downloads: a DCF (with a dividend-discount variant for banks), LBO and M&A deal models, an equity research initiation note, an asset-management portfolio one-pager, and a sales & trading morning sheet. Pick a company and sector on the site, download a working model prefilled with real data, and make it yours. Every file carries its own data-sources sheet, and missing data stays blank rather than estimated.",
  },
  {
    name: "HKEX Screener",
    slug: "/hkex",
    status: "beta",
    tagline: "Real HKEX filings, press releases, and news, AI-summarized",
    description:
      "A focused Hong Kong Stock Exchange research tool: search any HKEX-listed company and get a dedicated page with a real price chart (up to 10 years, via Yahoo Finance), direct links to official filings, the company's own press releases scraped from its official page where one is curated, and reliable third-party news, each with a strictly source-grounded AI recap. Useful for accounting and advisory teams screening HK names. Independent student project, not affiliated with or endorsed by any firm.",
  },
  {
    name: "Hype vs Fundamentals",
    slug: "/hype",
    status: "beta",
    tagline: "Historical cases with known outcomes, current themes that are not",
    description:
      "Real historical cases (the dot-com bubble, the meme-stock mania, the cannabis stock boom) with real computed run-up/drawdown stats and hindsight, then real current themes (AI & semiconductors, quantum computing) with real price returns and revenue growth side by side. The current-themes AI narrative is explicitly instructed to present evidence, never a verdict on whether something is a bubble.",
  },
  {
    name: "Lessons",
    slug: "/lessons",
    status: "live",
    tagline: "A 13-chapter course from equities to M&A, plus a deep dive per chapter",
    description:
      "A start-to-end course for anyone new to finance: equities, fixed income, commodities & FX, how markets actually trade, options, asset management, three-statement modeling, M&A, valuation, and reading the market today. Thirteen chapters, each with a quiz, a direct link to go use Company Profile, Central Bank Room, Markets Overview, Simulations, or Model Templates for real, and a deeper-dive companion article for whichever topics actually grab you.",
  },
  {
    name: "Simulations",
    slug: "/simulations",
    status: "live",
    tagline: "Value a company before the call, run a trading book, answer to a client — the actual job",
    description:
      "Three simulations, three seats: the Valuation Desk (an IB/research seat — pick a real brief from Diploma PLC, Palantir, or Intel, triage your prep under a time budget, build a quick DCF range on real sourced figures, then survive the desk head's grill: terminal smuggling, terminal dependence, growth honesty, and a reverse-DCF that shows what the price already believes); a Market Maker game (an S&T seat — quote a spread against a generated price feed with informed flow and vol storms, manage inventory and mark-to-market P&L, get graded at the close); and a Portfolio Risk Simulator (an AM/risk seat — take a real client mandate with hard constraints and run a 500-path Monte Carlo to see if your portfolio actually meets it). Real sourced data for the Valuation Desk, generated data elsewhere, labeled plainly per seat.",
  },
  {
    name: "Test Prep",
    slug: "/test-prep",
    status: "beta",
    tagline: "Firm processes, a technical/case question bank, real Pymetrics games, and HireVue practice",
    description:
      "Recruiting-process breakdowns for bulge bracket and boutique IB, asset management, and MBB/other consulting; a filterable technical and case question bank (accounting, valuation, deals); all 12 real Pymetrics games explained, with a playable Balloon Game; and a write-and-time practice tool for real HireVue-style prompts, saved locally in your browser.",
  },
  {
    name: "My Analysis",
    slug: "/analysis",
    status: "live",
    tagline: "Independent research, stock pitches, and a running leads list, all on the record",
    description:
      "Adam's own running research notebook: dated, sourced write-ups on breaking macro and market stories as they happen, 10 stock pitches, and a lighter-weight \"worth digging into\" leads list, one real sentence and a source each, not yet deep-researched, kept as a starting point rather than a finished conclusion. Written for himself first, kept here because it is worth coming back to.",
    accentColor: "analysis",
    note: "my actual opinions",
  },
];
