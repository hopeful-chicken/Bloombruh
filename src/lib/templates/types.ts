// Shared config shapes for the Model Templates module — the request a
// student assembles in the browser (which template, which company, which
// sector variant, which options) and sends to /api/template, which builds
// the .xlsx server-side. Kept dependency-free so both the client builder
// UI and the server generators can import it.

export type TemplateId =
  | "dcf"
  | "comps"
  | "lbo"
  | "merger"
  | "initiation"
  | "portfolio"
  | "market-update";

export type TemplateSectorId =
  | "generic"
  | "tmt"
  | "fig"
  | "healthcare"
  | "energy"
  | "industrials"
  | "consumer";

export type TemplateRequest = {
  template: TemplateId;
  /** Optional — a template without a ticker downloads blank (structure +
   * formulas + guidance, no prefilled company data). */
  ticker: string | null;
  sector: TemplateSectorId;
  /** DCF: projection length. */
  forecastYears?: 5 | 10;
  /** DCF: include the WACC × terminal-growth sensitivity grid. */
  includeSensitivity?: boolean;
  /** LBO: holding period in years. */
  holdYears?: 3 | 5 | 7;
  /** M&A: optional second ticker for the target's real data. */
  targetTicker?: string | null;
  /** Comps: peer tickers, comma-separated (e.g. "MSFT, GOOGL, META").
   * Capped server-side to keep provider usage sane. */
  peerTickers?: string | null;
  /** M&A: include the synergies block. */
  includeSynergies?: boolean;
  /** Initiation note: include the valuation summary table. */
  includeValuationSummary?: boolean;
  /** Portfolio one-pager: number of holding rows to scaffold. */
  holdingRows?: 10 | 20 | 30;
};

export type TemplateInfo = {
  id: TemplateId;
  name: string;
  desk: string;
  description: string;
  /** Sectors this template is especially recommended for, shown as chips. */
  recommendedFor: TemplateSectorId[];
};

export const TEMPLATES: TemplateInfo[] = [
  {
    id: "dcf",
    name: "DCF Valuation Model",
    desk: "Investment Banking / Equity Research",
    description:
      "Project free cash flow from revenue-growth and margin assumptions, discount at a WACC you build from real inputs, and get an implied share price against today's. Picking the FIG sector switches the whole model to a dividend-discount variant. EV-based DCFs do not work for banks.",
    recommendedFor: ["generic", "tmt", "healthcare", "industrials", "consumer", "energy"],
  },
  {
    id: "comps",
    name: "Trading Comps",
    desk: "Investment Banking / Equity Research",
    description:
      "The most-used analysis in banking: your subject company against a peer set you choose, every multiple a live formula off real filed data, peer medians, and what the subject would be worth at those medians. Picking the peer set well is the actual skill. The guidance sheet says how.",
    recommendedFor: ["generic", "tmt", "fig", "consumer", "industrials"],
  },
  {
    id: "lbo",
    name: "LBO Model",
    desk: "Private Equity / Leveraged Finance",
    description:
      "Entry and exit multiples, a debt schedule that pays down from free cash flow year by year, and the sponsor's MOIC and IRR: the core mechanics of a buyout, with every assumption an editable cell.",
    recommendedFor: ["industrials", "consumer", "healthcare"],
  },
  {
    id: "merger",
    name: "M&A Accretion / Dilution Model",
    desk: "Investment Banking (M&A)",
    description:
      "Acquirer buys target: offer premium, cash/stock/debt financing mix, optional synergies. Does the deal add to or dilute the acquirer's EPS? Prefill both sides with real company data.",
    recommendedFor: ["generic", "fig", "tmt"],
  },
  {
    id: "initiation",
    name: "Equity Research Initiation Note",
    desk: "Equity Research",
    description:
      "The structured skeleton of a real initiation: rating and target price up top, investment thesis, a valuation summary built from the company's real multiples, catalysts, and risks, ready to fill in with your own view.",
    recommendedFor: ["generic", "tmt", "fig", "healthcare"],
  },
  {
    id: "portfolio",
    name: "Portfolio One-Pager",
    desk: "Asset Management",
    description:
      "A holdings sheet where value, weight, and concentration stats compute themselves as you type positions in: the one-page portfolio summary an AM analyst keeps current.",
    recommendedFor: ["generic"],
  },
  {
    id: "market-update",
    name: "Market Update Sheet",
    desk: "Sales & Trading / Macro",
    description:
      "Prefilled with this site's real data at the moment you download it: sector ETF performance and every tracked central bank's current policy rate, plus a structured commentary section for your own morning-note take.",
    recommendedFor: ["generic"],
  },
];

export function getTemplateInfo(id: string): TemplateInfo | undefined {
  return TEMPLATES.find((t) => t.id === id);
}
