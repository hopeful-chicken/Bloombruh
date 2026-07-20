// The data model for the block-based report builder. Instead of one fixed
// "Your pitch" form, the student assembles a report out of blocks they
// choose and reorder themselves — closer to how a real research note gets
// put together. This file is pure types + helpers (no React, no fetching)
// so it can be shared by the editor UI (client) and the PDF renderer.

export type StatEntry = {
  key: string;
  label: string;
  /** Pre-formatted display value, or null if this data isn't available
   * for free for this company — the stats block shows "Unavailable" and
   * lets the student type in their own number/estimate instead. */
  value: string | null;
};

/** One selectable time series (price, revenue, EBITDA, etc.) for the
 * Chart block — computed server-side from price history or SEC EDGAR
 * fundamentals history, same "registry" pattern as availableStats. */
export type ChartSeriesPoint = { label: string; value: number };
export type ChartSeriesOption = { key: string; label: string; points: ChartSeriesPoint[] };

export type TextBlockData = {
  body: string;
  /** Grey prompt text shown when body is empty, for the guided "lens"
   * sections (Business & Moat, Bear Case, etc.) — never modified after
   * the block is created, just carried along with the block's data. */
  placeholder?: string;
};
export type SwotBlockData = {
  strengths: string;
  weaknesses: string;
  opportunities: string;
  threats: string;
};
export type ListBlockData = { items: string }; // one bullet per line
export type StatsBlockData = {
  /** Which stat keys (from the availableStats registry) this block shows. */
  statKeys: string[];
  /** Student-entered replacement values, keyed by stat key, for any stat
   * that came back unavailable from free data sources. */
  overrides: Record<string, string>;
};
export type CompsBlockData = {
  peerSymbols: string; // comma-separated tickers
  /** Last-fetched comps rows, cached here so they survive into the PDF
   * export (which can't re-fetch — it renders client-side from state). */
  rows: import("./comps").CompRow[];
};

export type LboBlockData = {
  entryEbitda: string;
  entryMultiple: string;
  exitMultiple: string;
  leverageMultiple: string;
  years: string;
  ebitdaGrowthPct: string;
  debtPaydownPct: string;
};

export type MandaBlockData = {
  acquirerNetIncome: string;
  acquirerShares: string;
  acquirerSharePrice: string;
  acquirerDebt: string;
  acquirerEbitda: string;
  targetNetIncome: string;
  targetShares: string;
  targetStockholdersEquity: string;
  targetDebt: string;
  targetEbitda: string;
  targetCurrentPrice: string;
  offerPricePerShare: string;
  cashPct: string;
  newDebtRaised: string;
  interestRatePct: string;
  taxRatePct: string;
  synergiesPreTax: string;
};

export type ChartBlockData = {
  seriesKey: string;
  chartType: "line" | "bar";
};

/** No student-editable fields — content comes entirely from the news
 * articles fetched once, server-side, for this company (see src/lib/news.ts)
 * and passed down as a prop, the same way price/fundamentals data is. */
export type NewsBlockData = Record<string, never>;

export type BlockType =
  | "text"
  | "swot"
  | "list"
  | "stats"
  | "comps"
  | "lbo"
  | "manda"
  | "chart"
  | "news";

export const BLOCK_TYPE_LABELS: Record<BlockType, string> = {
  text: "Text",
  swot: "SWOT",
  list: "Bullet list",
  stats: "Stat grid",
  comps: "Comps table",
  lbo: "LBO calculator",
  manda: "M&A calculator",
  chart: "Chart",
  news: "News",
};

export type BlockDataFor<T extends BlockType> = T extends "text"
  ? TextBlockData
  : T extends "swot"
    ? SwotBlockData
    : T extends "list"
      ? ListBlockData
      : T extends "stats"
        ? StatsBlockData
        : T extends "comps"
          ? CompsBlockData
          : T extends "lbo"
            ? LboBlockData
            : T extends "manda"
              ? MandaBlockData
              : T extends "chart"
                ? ChartBlockData
                : NewsBlockData;

export type Block =
  | { id: string; type: "text"; title: string; data: TextBlockData }
  | { id: string; type: "swot"; title: string; data: SwotBlockData }
  | { id: string; type: "list"; title: string; data: ListBlockData }
  | { id: string; type: "stats"; title: string; data: StatsBlockData }
  | { id: string; type: "comps"; title: string; data: CompsBlockData }
  | { id: string; type: "lbo"; title: string; data: LboBlockData }
  | { id: string; type: "manda"; title: string; data: MandaBlockData }
  | { id: string; type: "chart"; title: string; data: ChartBlockData }
  | { id: string; type: "news"; title: string; data: NewsBlockData };

let idCounter = 0;
export function newBlockId(): string {
  idCounter += 1;
  return `block-${Date.now()}-${idCounter}`;
}

export function parseLines(text: string): string[] {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

// Factory functions — each returns a fresh block with sensible empty/
// default data, used both by the "suggested blocks" starter set and by
// the "add block" menu.

export function createTextBlock(title = "Custom section", placeholder?: string): Block {
  return { id: newBlockId(), type: "text", title, data: { body: "", placeholder } };
}

export function createSwotBlock(title = "SWOT"): Block {
  return {
    id: newBlockId(),
    type: "swot",
    title,
    data: { strengths: "", weaknesses: "", opportunities: "", threats: "" },
  };
}

export function createListBlock(title = "Bullet list"): Block {
  return { id: newBlockId(), type: "list", title, data: { items: "" } };
}

export function createStatsBlock(
  title = "Key stats",
  statKeys: string[] = []
): Block {
  return {
    id: newBlockId(),
    type: "stats",
    title,
    data: { statKeys, overrides: {} },
  };
}

export function createCompsBlock(title = "Comparable companies"): Block {
  return {
    id: newBlockId(),
    type: "comps",
    title,
    data: { peerSymbols: "", rows: [] },
  };
}

export function createLboBlock(
  title = "LBO returns",
  entryEbitda = ""
): Block {
  return {
    id: newBlockId(),
    type: "lbo",
    title,
    data: {
      entryEbitda,
      entryMultiple: "8",
      exitMultiple: "8",
      leverageMultiple: "5",
      years: "5",
      ebitdaGrowthPct: "5",
      debtPaydownPct: "30",
    },
  };
}

export function createMandaBlock(title = "M&A accretion / dilution"): Block {
  return {
    id: newBlockId(),
    type: "manda",
    title,
    data: {
      acquirerNetIncome: "",
      acquirerShares: "",
      acquirerSharePrice: "",
      acquirerDebt: "",
      acquirerEbitda: "",
      targetNetIncome: "",
      targetShares: "",
      targetStockholdersEquity: "",
      targetDebt: "",
      targetEbitda: "",
      targetCurrentPrice: "",
      offerPricePerShare: "",
      cashPct: "50",
      newDebtRaised: "0",
      interestRatePct: "6",
      taxRatePct: "21",
      synergiesPreTax: "0",
    },
  };
}

export function createChartBlock(title = "Chart", seriesKey = "price"): Block {
  return {
    id: newBlockId(),
    type: "chart",
    title,
    data: { seriesKey, chartType: "line" },
  };
}

export function createNewsBlock(title = "In the news"): Block {
  return { id: newBlockId(), type: "news", title, data: {} };
}

// Preset stat-key groups for the "Financials & valuation" library entries —
// single source of truth shared between the block library below and the
// per-report-type starter sets in PitchWorkbench.tsx. Keys must match the
// `key`s produced in the `availableStats` registry built in
// src/app/pitch/[symbol]/page.tsx.
export const CORE_FINANCIAL_STAT_KEYS = [
  "revenue",
  "revenueGrowth",
  "grossMargin",
  "operatingMargin",
  "ebitdaMargin",
  "netMargin",
  "netIncome",
  "epsDiluted",
  "epsGrowth",
  "cash",
  "totalDebt",
  "netDebt",
  "workingCapital",
  "shareholdersEquity",
  "operatingCashFlow",
  "capex",
  "freeCashFlow",
  "sharesOutstandingBasic",
  "sharesOutstandingDiluted",
];

export const VALUATION_STAT_KEYS = [
  "price",
  "marketCap",
  "enterpriseValue",
  "peRatio",
  "evToEbitda",
  "evToEbit",
  "evToSales",
  "priceToBook",
  "fcfYield",
  "dividendYield",
];

export const GROWTH_RETURNS_STAT_KEYS = [
  "revenueGrowth",
  "ebitdaGrowth",
  "epsGrowth",
  "roe",
  "roic",
  "roa",
];

export const CREDIT_WACC_STAT_KEYS = [
  "beta",
  "totalDebt",
  "cash",
  "netDebt",
  "netDebtToEbitda",
  "interestCoverage",
];

// Groups organize the (now fairly long) "Add a block" menu into labeled
// sections that roughly match the four interview "lenses" Adam asked for,
// plus a Core group and a Financials group everyone uses regardless of
// report type. GROUP_ORDER fixes the display order (object key order
// isn't guaranteed to match insertion order once minified/bundled).
export const GROUP_ORDER = [
  "Core",
  "Financials & valuation",
  "Equity research / AM lens",
  "IB / general prep lens",
  "M&A prep lens",
  "LBO / PE prep lens",
] as const;

export const BLOCK_LIBRARY: {
  id: string;
  type: BlockType;
  label: string;
  description: string;
  group: (typeof GROUP_ORDER)[number];
  create: () => Block;
}[] = [
  // --- Core ---
  {
    id: "text-custom",
    type: "text",
    label: "Custom text",
    description: "Free writing under a title you choose — thesis, notes, anything.",
    group: "Core",
    create: () => createTextBlock(),
  },
  {
    id: "swot",
    type: "swot",
    label: "SWOT",
    description: "Strengths, weaknesses, opportunities, threats — your own read.",
    group: "Core",
    create: () => createSwotBlock(),
  },
  {
    id: "list",
    type: "list",
    label: "Bullet list",
    description: "A titled list — catalysts, risks, anything one-point-per-line.",
    group: "Core",
    create: () => createListBlock(),
  },
  {
    id: "chart",
    type: "chart",
    label: "Chart",
    description: "Plot price, revenue, net income, or EBITDA history as a line or bar chart.",
    group: "Core",
    create: () => createChartBlock(),
  },
  {
    id: "news",
    type: "news",
    label: "News (appendix)",
    description:
      "The same headlines always shown in the data view, added here as an appendix (or a spot to quote from) in your exported report.",
    group: "Core",
    create: () => createNewsBlock(),
  },
  {
    id: "stats-custom",
    type: "stats",
    label: "Custom stat grid",
    description: "Pick any numbers yourself. Anything unavailable for free can be filled in by hand.",
    group: "Core",
    create: () => createStatsBlock(),
  },

  // --- Financials & valuation ---
  {
    id: "stats-core-financials",
    type: "stats",
    label: "Core financials",
    description: "Revenue, margins, net income, EPS, balance sheet, and cash flow — the three statements.",
    group: "Financials & valuation",
    create: () => createStatsBlock("Core Financials", CORE_FINANCIAL_STAT_KEYS),
  },
  {
    id: "stats-valuation",
    type: "stats",
    label: "Valuation multiples",
    description: "Market cap, enterprise value, P/E, EV/EBITDA, EV/EBIT, EV/Sales, P/B, FCF yield, dividend yield.",
    group: "Financials & valuation",
    create: () => createStatsBlock("Valuation Multiples", VALUATION_STAT_KEYS),
  },
  {
    id: "stats-growth-returns",
    type: "stats",
    label: "Growth & returns",
    description: "Revenue/EBITDA/EPS growth, ROE, ROIC, ROA.",
    group: "Financials & valuation",
    create: () => createStatsBlock("Growth & Returns", GROWTH_RETURNS_STAT_KEYS),
  },

  // --- Equity research / AM lens ---
  {
    id: "text-business-moat",
    type: "text",
    label: "Business & moat",
    description: "Revenue segmentation and whether the competitive moat is durable.",
    group: "Equity research / AM lens",
    create: () =>
      createTextBlock(
        "Business & Moat",
        "What does this company actually sell, and to whom? Break down revenue by product, geography, and customer type if you can find it. Then make the case for (or against) a durable moat — switching costs, network effects, scale, brand — and say clearly whether you think it holds up."
      ),
  },
  {
    id: "text-industry-market",
    type: "text",
    label: "Industry & market share",
    description: "Industry structure, market share, TAM, and growth runway.",
    group: "Equity research / AM lens",
    create: () =>
      createTextBlock(
        "Industry & Market Share",
        "How is this industry structured — a few dominant players or many small ones? Estimate the company's market share and the total addressable market (TAM), and say how much growth runway is left."
      ),
  },
  {
    id: "text-management-capital",
    type: "text",
    label: "Management & capital allocation",
    description: "Management quality and capital allocation track record.",
    group: "Equity research / AM lens",
    create: () =>
      createTextBlock(
        "Management & Capital Allocation",
        "What's management's track record on capital allocation — reinvesting, paying dividends, buying back stock, or M&A? Any notable wins or mistakes? Use the dividends/buybacks data in the financials block above as a starting point."
      ),
  },
  {
    id: "text-variant-view",
    type: "text",
    label: "Variant view & estimates",
    description: "Consensus vs. your own estimates, guidance, and where you differ.",
    group: "Equity research / AM lens",
    create: () =>
      createTextBlock(
        "Variant View & Estimates",
        "Where do you differ from consensus? State your own revenue/earnings estimates alongside what the Street expects and management's own guidance, and explain the gap — this is your \"variant view.\""
      ),
  },
  {
    id: "text-valuation-catalysts",
    type: "text",
    label: "Valuation & catalysts",
    description: "Valuation across methods, plus catalysts and timing.",
    group: "Equity research / AM lens",
    create: () =>
      createTextBlock(
        "Valuation & Catalysts",
        "Value the company across at least two methods (e.g. a comps multiple and a DCF/FCF-yield check), then list the near-term catalysts that could move the stock and roughly when they'll happen."
      ),
  },
  {
    id: "text-bear-case",
    type: "text",
    label: "Bear case",
    description: "The strongest case against your thesis, and what would prove you wrong.",
    group: "Equity research / AM lens",
    create: () =>
      createTextBlock(
        "Bear Case / What Would Prove You Wrong",
        "Steelman the other side. What's the strongest argument against your thesis, and what specific data point or event would tell you that you were wrong?"
      ),
  },

  // --- IB / general prep lens ---
  {
    id: "comps",
    type: "comps",
    label: "Comps table",
    description: "Enter peer tickers to build a multiples comparison table.",
    group: "IB / general prep lens",
    create: () => createCompsBlock(),
  },
  {
    id: "stats-credit-wacc",
    type: "stats",
    label: "Credit metrics & WACC inputs",
    description: "Net debt/EBITDA, interest coverage, beta, and capital-structure basics for a WACC build.",
    group: "IB / general prep lens",
    create: () => createStatsBlock("Credit Metrics & WACC Inputs", CREDIT_WACC_STAT_KEYS),
  },
  {
    id: "text-ownership",
    type: "text",
    label: "Ownership & shareholder structure",
    description: "Who owns the company, and any notable concentration or structure.",
    group: "IB / general prep lens",
    create: () =>
      createTextBlock(
        "Ownership & Shareholder Structure",
        "Who owns this company — insiders, founders, index funds, activist investors? Note any concentrated stakes, dual-class shares, or recent large ownership changes."
      ),
  },

  // --- M&A prep lens ---
  {
    id: "manda",
    type: "manda",
    label: "M&A accretion/dilution",
    description: "Offer price, financing mix, and synergies → pro-forma EPS impact, goodwill, leverage.",
    group: "M&A prep lens",
    create: () => createMandaBlock(),
  },
  {
    id: "text-deal-synergies",
    type: "text",
    label: "Deal terms & synergies",
    description: "Offer price, premium, financing mix, and how credible the synergies are.",
    group: "M&A prep lens",
    create: () =>
      createTextBlock(
        "Deal Terms & Synergies",
        "Lay out the deal: offer price and premium to the undisturbed share price, financing mix (cash/debt/stock), and the synergies being claimed — split cost vs. revenue synergies and note how credible each side is."
      ),
  },
  {
    id: "text-integration-risk",
    type: "text",
    label: "Integration & regulatory risk",
    description: "Operational integration risk and regulatory/antitrust considerations.",
    group: "M&A prep lens",
    create: () =>
      createTextBlock(
        "Integration & Regulatory Risk",
        "What could go wrong operationally (culture clash, systems integration, key-employee attrition) or on the regulatory side (antitrust, foreign ownership rules)? How long might approval and integration realistically take?"
      ),
  },

  // --- LBO / PE prep lens ---
  {
    id: "lbo",
    type: "lbo",
    label: "LBO calculator",
    description: "Entry/exit EBITDA multiples, leverage, and holding period → IRR and MOIC.",
    group: "LBO / PE prep lens",
    create: () => createLboBlock(),
  },
  {
    id: "text-leverage-debt",
    type: "text",
    label: "Leverage & debt maturities",
    description: "Existing leverage, debt maturities, capex intensity, and collateral base.",
    group: "LBO / PE prep lens",
    create: () =>
      createTextBlock(
        "Leverage & Debt Maturities",
        "How much existing leverage does the target carry, and when do those debt tranches mature? Note capex intensity and the tangible asset base available as collateral for new debt."
      ),
  },
  {
    id: "text-exit-assumptions",
    type: "text",
    label: "Exit assumptions",
    description: "Holding period, exit multiple, and exit route.",
    group: "LBO / PE prep lens",
    create: () =>
      createTextBlock(
        "Exit Assumptions",
        "State your assumed holding period, exit multiple, and exit route (strategic sale, sponsor-to-sponsor, IPO). Justify why the exit multiple you've chosen is reasonable relative to entry."
      ),
  },
];
