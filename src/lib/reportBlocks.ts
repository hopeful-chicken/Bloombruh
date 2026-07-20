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

export type TextBlockData = { body: string };
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

export type BlockType =
  | "text"
  | "swot"
  | "list"
  | "stats"
  | "comps"
  | "lbo"
  | "manda";

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
            : MandaBlockData;

export type Block =
  | { id: string; type: "text"; title: string; data: TextBlockData }
  | { id: string; type: "swot"; title: string; data: SwotBlockData }
  | { id: string; type: "list"; title: string; data: ListBlockData }
  | { id: string; type: "stats"; title: string; data: StatsBlockData }
  | { id: string; type: "comps"; title: string; data: CompsBlockData }
  | { id: string; type: "lbo"; title: string; data: LboBlockData }
  | { id: string; type: "manda"; title: string; data: MandaBlockData };

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

export function createTextBlock(title = "Custom section"): Block {
  return { id: newBlockId(), type: "text", title, data: { body: "" } };
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

export const BLOCK_LIBRARY: {
  type: BlockType;
  label: string;
  description: string;
  create: () => Block;
}[] = [
  {
    type: "text",
    label: "Custom text",
    description: "Free writing under a title you choose — thesis, notes, anything.",
    create: () => createTextBlock(),
  },
  {
    type: "swot",
    label: "SWOT",
    description: "Strengths, weaknesses, opportunities, threats — your own read.",
    create: () => createSwotBlock(),
  },
  {
    type: "list",
    label: "Bullet list",
    description: "A titled list — catalysts, risks, anything one-point-per-line.",
    create: () => createListBlock(),
  },
  {
    type: "stats",
    label: "Stat grid",
    description: "Pick which numbers to show. Anything unavailable for free can be filled in by hand.",
    create: () => createStatsBlock(),
  },
  {
    type: "comps",
    label: "Comps table",
    description: "Enter peer tickers to build a multiples comparison table.",
    create: () => createCompsBlock(),
  },
  {
    type: "lbo",
    label: "LBO calculator",
    description: "Entry/exit EBITDA multiples, leverage, and holding period → IRR and MOIC.",
    create: () => createLboBlock(),
  },
  {
    type: "manda",
    label: "M&A accretion/dilution",
    description: "Offer price, financing mix, and synergies → pro-forma EPS impact, goodwill, leverage.",
    create: () => createMandaBlock(),
  },
];
