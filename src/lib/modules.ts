// Static config for the module cards shown on the landing page and in nav.
// Adding a new module later = add a folder under src/app/ + an entry here.

export type ModuleInfo = {
  name: string;
  slug: string; // route, e.g. "/swf"
  status: "live" | "soon";
  tagline: string;
  description: string;
};

export const modules: ModuleInfo[] = [
  {
    name: "Company Profile",
    slug: "/profile",
    status: "live",
    tagline: "Ticker in, full profile — and your own pitch — out",
    description:
      "A clean company snapshot — price chart, full financials, and a plain-English description, with context on whether the multiples look cheap or expensive — plus the option to build your own rating, thesis, and target price on top and export it as a PDF.",
  },
  {
    name: "Central Bank Room",
    slug: "/macro",
    status: "live",
    tagline: "Fed / ECB / BoE / BoJ and more — real rates, history, news, and Adam's take",
    description:
      "Pick a central bank and see its actual policy rate, a history chart, a timeline of past rate decisions, plain-English context on monetary and fiscal policy, real sourced news headlines, and Adam's own written commentary — each kept clearly separate so you always know what's data, what's education, and what's opinion.",
  },
  {
    name: "Markets Overview",
    slug: "/markets",
    status: "live",
    tagline: "The world situation, by sector and by private market — pick a period, see the numbers",
    description:
      "A plain-English read on how the market is doing: a world-situation summary, then a closer look by equity sector (global equities, TMT, financials, healthcare, energy, industrials, consumer) and by private-market segment (private equity, private credit, real assets, via public proxies) — pick a period (week/month/year/forever) and see real price data, a grounded AI narrative, real news, and Adam's own take, each kept clearly separate.",
  },
  {
    name: "Model Templates",
    slug: "/templates",
    status: "live",
    tagline: "Downloadable Excel models with live formulas — DCF, LBO, M&A, and more, prefilled with real data",
    description:
      "The work analysts actually produce, as personalizable Excel downloads: a DCF (with a dividend-discount variant for banks), LBO and M&A deal models, an equity research initiation note, an asset-management portfolio one-pager, and a sales & trading morning sheet. Pick a company and sector on the site, download a working model prefilled with real data, and make it yours — every file carries its own data-sources sheet, and missing data stays blank rather than estimated.",
  },
  {
    name: "HKEX Screener",
    slug: "/hkex",
    status: "live",
    tagline: "Hong Kong Stock Exchange only — for accounting & advisory firms",
    description:
      "A focused company lookup where every searchable ticker is Hong Kong Stock Exchange-listed, via a second free data provider (EODHD) that covers HKEX where this site's main provider doesn't. Useful for accounting and advisory teams screening HK names. Independent student project, not affiliated with or endorsed by any firm.",
  },
  {
    name: "Hype vs Fundamentals",
    slug: "/hype",
    status: "soon",
    tagline: "Narrative vs numbers",
    description:
      "Mention velocity and sentiment plotted against earnings revisions and valuation — flagging where hype and fundamentals diverge.",
  },
];
