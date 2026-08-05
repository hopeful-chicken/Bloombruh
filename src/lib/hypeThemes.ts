// Registry of *current*, ongoing "is the narrative outrunning the
// fundamentals" watch themes — the counterpart to hypeCases.ts's closed
// historical episodes. These are live and unresolved: nobody knows yet
// whether they'll turn out like the dot-com bubble (Cisco still hasn't
// fully recovered 25 years later) or like Amazon post-2001 (survived the
// crash and the hype turned out to have been directionally right, just
// early). The module never asserts which — see hypeNarrative.ts's
// explicit no-verdict instruction.

export type HypeThemeId = "ai-semis" | "quantum-computing";

export type HypeTheme = {
  id: HypeThemeId;
  name: string;
  tickers: { symbol: string; role: string }[];
  blurb: string;
  newsQuery: string;
};

export const HYPE_THEMES: HypeTheme[] = [
  {
    id: "ai-semis",
    name: "AI & Semiconductors",
    tickers: [
      { symbol: "NVDA", role: "Nvidia — the single biggest beneficiary of AI infrastructure spend" },
      { symbol: "SMH", role: "VanEck Semiconductor ETF — a broader basket, not just one winner" },
    ],
    blurb:
      "Capital spending on AI infrastructure has been real and large — the question this section tracks is whether prices have moved further or faster than the revenue and earnings actually delivered so far.",
    newsQuery: "AI stocks valuation bubble concerns semiconductor spending",
  },
  {
    id: "quantum-computing",
    name: "Quantum Computing",
    tickers: [
      { symbol: "IONQ", role: "IonQ — a pure-play, still pre-scale quantum hardware company" },
      { symbol: "RGTI", role: "Rigetti Computing — another early-stage quantum hardware bet" },
    ],
    blurb:
      "Quantum computing is a genuinely early-stage technology — commercially useful, fault-tolerant quantum computers don't exist yet. This section tracks how far the stocks have run relative to the (currently small and early) real revenue.",
    newsQuery: "quantum computing stocks valuation hype IonQ Rigetti",
  },
];

export function getHypeTheme(id: string): HypeTheme | undefined {
  return HYPE_THEMES.find((t) => t.id === id);
}
