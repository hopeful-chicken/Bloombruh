// Sector registry for the Model Templates module: which sectors a student
// can pick, what picking one changes, and the written "why" that lands in
// every downloaded workbook's guidance sheet. One structural rule matters
// most and is enforced in code, not just prose: FIG (banks/insurers)
// switches the DCF to a dividend-discount model, because enterprise-value
// math is meaningless for a bank — debt IS its raw material, not its
// financing, so "EV = equity + net debt" and "free cash flow after capex"
// don't describe anything real about the business. Everything else is
// honest guidance text plus tailored assumption labels, not fake
// sector-specific math.

import type { TemplateSectorId } from "./types";

export type SectorGuidance = {
  id: TemplateSectorId;
  label: string;
  /** Guidance paragraphs written into the workbook's guidance sheet. */
  notes: string[];
  /** True for FIG: the DCF template swaps to the dividend-discount variant. */
  usesDividendDiscount: boolean;
};

export const TEMPLATE_SECTORS: SectorGuidance[] = [
  {
    id: "generic",
    label: "Generic / All sectors",
    usesDividendDiscount: false,
    notes: [
      "This is the standard, sector-neutral version of the template. The structure is the same one used across most industries; pick a specific sector instead if you want guidance and defaults tuned to it.",
    ],
  },
  {
    id: "tmt",
    label: "TMT (Tech, Media & Telecom)",
    usesDividendDiscount: false,
    notes: [
      "Growth carries most of a TMT valuation, so the revenue-growth assumptions are where your work should go: fade growth toward a mature rate over the projection rather than holding a high rate flat, and be able to defend year one against the company's actual reported growth.",
      "Watch stock-based compensation: many tech companies report strong \"adjusted\" profitability that excludes SBC even though it dilutes you every year. If you add back D&A but ignore SBC dilution, your per-share value is quietly overstated.",
      "Terminal value will likely dominate the total. Check what share of your enterprise value comes from the terminal term (the model shows this). Above ~80%, your \"5-year model\" is really a terminal-assumptions model, and you should say so in your write-up.",
    ],
  },
  {
    id: "fig",
    label: "FIG (Banks & Insurers)",
    usesDividendDiscount: true,
    notes: [
      "This template uses a dividend-discount model, not an enterprise-value DCF: that is deliberate, not a simplification. For a bank, debt and deposits are the raw material of the business rather than financing on top of it, so \"enterprise value\" and \"free cash flow after capex\" do not describe anything meaningful. FIG analysts value the equity directly: project earnings, apply a payout ratio, discount the dividend stream at the cost of equity.",
      "The cost of equity comes from CAPM (risk-free rate + beta × equity risk premium). There is no WACC here because there is no meaningful \"cost of capital blend\" for a bank.",
      "Cross-check your answer against price-to-book and return on equity: a bank earning returns above its cost of equity should trade above book value, and below it if not. If your DDM answer implies a P/B wildly out of line with the bank's ROE, revisit your assumptions.",
      "Regulatory capital constrains payouts in reality. A bank cannot pay out earnings its capital ratios need. Treat the payout-ratio assumption as the lever it really is.",
    ],
  },
  {
    id: "healthcare",
    label: "Healthcare & Pharma",
    usesDividendDiscount: false,
    notes: [
      "For revenue-stage pharma and medtech, the standard DCF works, but patent cliffs make flat growth assumptions dangerous: a single product losing exclusivity can remove a third of revenue in two years. Model the fade deliberately.",
      "For pre-revenue or single-asset biotech, this template is the wrong tool used naively: real biotech valuation risk-adjusts each pipeline asset by its probability of approval (an rNPV). If you use this DCF anyway, say clearly in your write-up that your revenue line embeds an implicit success probability.",
      "R&D is this sector's real capex: the reported capex line understates what it costs to sustain the business. Consider whether your margin assumptions leave room for the R&D needed to replace revenue that patents will eventually take away.",
    ],
  },
  {
    id: "energy",
    label: "Energy & Commodities",
    usesDividendDiscount: false,
    notes: [
      "An energy company's revenue is price × volume where the price is a commodity nobody can forecast well, so your revenue-growth cells are really commodity-price views in disguise. Be explicit with yourself about what oil/gas price your growth assumptions imply.",
      "Use the sensitivity grid more seriously here than in any other sector: the honest output of an energy DCF is a range across commodity scenarios, not a single number.",
      "Reserves deplete: without ongoing capex there is no flat \"terminal year\". The maintenance-capex assumption matters more than in most sectors, and a terminal growth rate above inflation is hard to defend.",
    ],
  },
  {
    id: "industrials",
    label: "Industrials",
    usesDividendDiscount: false,
    notes: [
      "Industrials are cyclical: anchor year-one growth to where we are in the cycle, not just to last year's print. Mid-cycle margins are usually the defensible terminal assumption, not peak or trough.",
      "Capex and working capital are real cash consumers here. The NWC-change and capex assumptions deserve as much attention as growth. A grower that ties up cash in inventory and receivables generates less FCF than its P&L suggests.",
    ],
  },
  {
    id: "consumer",
    label: "Consumer & Retail",
    usesDividendDiscount: false,
    notes: [
      "Split growth mentally into like-for-like growth vs. expansion (new stores, new markets): like-for-like fades toward inflation, expansion requires capex. If you assume strong growth AND falling capex, you are probably double-counting.",
      "Margins mean-revert hard in consumer: competition arbitrages away unusually high margins. A terminal margin well above the company's own history needs a genuinely defensible moat argument in your write-up.",
    ],
  },
];

export function getSectorGuidance(id: string): SectorGuidance {
  return TEMPLATE_SECTORS.find((s) => s.id === id) ?? TEMPLATE_SECTORS[0];
}
