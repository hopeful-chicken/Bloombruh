// Data + math for the Valuation Desk — the third Simulation Room seat
// (IB / equity-research lens). Unlike the Market Maker (generated price
// feed) and the Portfolio Risk Simulator (illustrative assumptions), this
// seat runs on REAL company data, following the same discipline as the
// rest of the site: every number is either (a) pulled from a primary
// source on a stated date, or (b) derived from those pulls with the
// derivation labeled, or (c) a clearly-marked "desk assumption" that the
// seat itself tells the student to verify before using it in real work.
//
// Sources used for the three cases:
//   - SEC EDGAR companyfacts API (US filers' reported FY figures:
//     revenue, operating income, D&A, net income, cash, debt, capex,
//     shares outstanding) — pulled 18 Aug 2026.
//   - Twelve Data /quote (share prices) — pulled 17 Aug 2026, the same
//     provider the Company Profile module uses.
//   - Adam's own published stock pitch for Diploma PLC (bloombruh.com
//     /analysis, dated 13 Aug 2026), which itself cites Diploma's H1 2026
//     results (19 May 2026), the Q3 FY26 trading update, and the Peerless
//     acquisition RNS.
//
// Nothing here is live. It is a dated snapshot for practice, exactly like
// the "DCF starting inputs" section of each pitch on the site.

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type DataPackRow = {
  label: string;
  value: string;
  source: string; // where it came from + when — shown verbatim in the UI
};

export type ResearchAction = {
  id: string;
  label: string;
  costMinutes: number;
  /** What the student learns — revealed once the action is bought. */
  reveals: string;
};

export type CompEntry = {
  name: string;
  /** Exactly one of these is meaningful per case (see compMetric). null =
   * "not meaningful", which is itself a lesson (negative EBITDA/earnings). */
  evEbitda: number | null;
  evSales: number | null;
  pe: number | null;
  note?: string;
};

export type ValuationCase = {
  id: string;
  company: string;
  ticker: string;
  lens: string; // which desk this sits on
  difficulty: "Standard" | "Hard";
  question: string; // the one-line question the whole case hangs on
  brief: string; // the scenario, desk-memo voice
  currencyNote: string; // the units warning (Diploma is in pence!)
  unitDivisor: number; // financials are in millions; per-share price unit = unitDivisor of a currency unit (100 = pence, 1 = dollars)
  priceUnitLabel: string; // "pence" | "dollars"
  currencySymbol: string; // "£" | "$" — for the millions figures (the build table)
  // --- real inputs (millions of local currency unless noted) ---
  priceNow: number; // in price units (pence or dollars)
  priceAsOf: string;
  fyLabel: string; // e.g. "FY2025 (ended 27 Dec 2025)"
  revenue0: number;
  ebitMargin0: number; // current operating margin (decimal)
  taxRate: number;
  daPct: number; // D&A as % of revenue
  capexPct: number; // capex as % of revenue (current)
  steadyCapexPct: number; // capex as % of revenue the model fades to by the final year (steady-state craft: capex normalizes toward D&A — or toward a stated discipline level for a turnaround)
  nwcPct: number; // incremental NWC as % of revenue
  netDebt: number; // debt minus cash; negative = net cash
  sharesM: number;
  recentGrowth: number; // most recent actual/guided Y1 growth (decimal) — the slider's "what the company just did / guided" marker
  guidedGrowth: number | null; // management-guided growth if one exists (decimal)
  guidedMargin: number | null; // management-guided margin if one exists
  baseExitMargin: number; // neutral exit-margin anchor for the reverse-DCF
  deskBeta: number; // revealed by the "check the beta" action
  riskFree: number; // desk-assumption risk-free rate
  erp: number; // equity risk premium, desk assumption
  dataPack: DataPackRow[];
  researchActions: ResearchAction[];
  comps: CompEntry[];
  compMetric: "EV/EBITDA" | "EV/Sales";
  compNote: string; // why this comp set, and what's missing (honesty)
  riskFlags: string; // revealed by the risk-flags action
  /** The third grill check differs per case: growth-vs-guidance where
   * guidance exists, margin-realism where the whole case IS the margin. */
  thirdCheck:
    | { kind: "growthVsGuidance"; guidedGrowth: number }
    | { kind: "marginRealism"; referenceMargin: number; referenceName: string };
  sliderRanges: {
    y1Growth: [number, number]; // decimals
    exitMargin: [number, number];
  };
  verdictContext: string; // closing line: what a real desk asks next
};

export type Levers = {
  y1Growth: number; // decimal
  exitMargin: number; // decimal, reached in year 5
  wacc: number; // decimal
  terminalGrowth: number; // decimal
};

export type DcfResult = {
  perShare: number; // in price units (pence/dollars)
  enterpriseValue: number; // millions
  equityValue: number; // millions
  pvOfFcf: number;
  pvOfTv: number;
  tvPctOfEv: number; // decimal
  impliedExitEbitda: number | null; // TV ÷ Y5 EBITDA
  impliedExitSales: number | null; // TV ÷ Y5 revenue
  fcfPath: { year: number; revenue: number; ebit: number; fcf: number }[];
};

export type GrillCheck = {
  name: string;
  status: "pass" | "warn" | "fail";
  text: string;
};

// ---------------------------------------------------------------------------
// The DCF itself — the same SHAPE as the downloadable workbook (explicit
// unlevered FCF, Gordon terminal value), with the two adjustments a desk
// makes when sketching a quick range: a 7-year explicit horizon, where the
// first two years hold the year-1 growth rate (the guidance window — the
// bit management actually just told you about) before growth fades
// linearly to the terminal rate by year 7; and a margin that ramps from
// today's actual to the chosen exit margin by year 5, then holds. This is
// deliberately NOT a flat 5-year model: flat models force above-trend
// growth into the terminal value, which is exactly the smuggling the grill
// checks for.
// ---------------------------------------------------------------------------

const EXPLICIT_YEARS = 7;
const GUIDANCE_WINDOW = 2; // years that hold the Y1 growth rate before the fade
const MARGIN_RAMP_YEARS = 5;

export function runDcf(c: ValuationCase, l: Levers): DcfResult {
  const years = EXPLICIT_YEARS;
  const fcfPath: DcfResult["fcfPath"] = [];
  let revenue = c.revenue0;
  let pvOfFcf = 0;

  for (let y = 1; y <= years; y++) {
    // Hold the Y1 rate through the guidance window, then fade linearly to
    // the terminal rate by the final explicit year.
    const growth =
      y <= GUIDANCE_WINDOW
        ? l.y1Growth
        : l.y1Growth +
          (l.terminalGrowth - l.y1Growth) * ((y - GUIDANCE_WINDOW) / (years - GUIDANCE_WINDOW));
    revenue = revenue * (1 + growth);
    // Margin ramps linearly from today's actual to the exit margin, then holds.
    const ramp = Math.min(y / MARGIN_RAMP_YEARS, 1);
    const margin = c.ebitMargin0 + (l.exitMargin - c.ebitMargin0) * ramp;
    const ebit = revenue * margin;
    const nopat = ebit * (1 - c.taxRate);
    const da = revenue * c.daPct;
    // Capex fades from today's actual to the steady-state rate by the final
    // year — in steady state capex normalizes toward D&A (or toward a stated
    // discipline level for a turnaround). Holding today's capex % flat for
    // 7 years is the classic way quick models accidentally kill a recovery.
    const capexPct = c.capexPct + (c.steadyCapexPct - c.capexPct) * (y / years);
    const capex = revenue * capexPct;
    const nwc = revenue * c.nwcPct;
    const fcf = nopat + da - capex - nwc;
    pvOfFcf += fcf / Math.pow(1 + l.wacc, y);
    fcfPath.push({ year: y, revenue, ebit, fcf });
  }

  const y5 = fcfPath[years - 1];
  const terminalFcf = y5.fcf * (1 + l.terminalGrowth);
  const tv = terminalFcf / (l.wacc - l.terminalGrowth);
  const pvOfTv = tv / Math.pow(1 + l.wacc, years);

  const enterpriseValue = pvOfFcf + pvOfTv;
  const equityValue = enterpriseValue - c.netDebt;
  const perShare = (equityValue / c.sharesM) * c.unitDivisor;

  const y5Ebitda = y5.ebit + y5.revenue * c.daPct;

  return {
    perShare,
    enterpriseValue,
    equityValue,
    pvOfFcf,
    pvOfTv,
    tvPctOfEv: enterpriseValue !== 0 ? pvOfTv / enterpriseValue : 0,
    impliedExitEbitda: y5Ebitda > 0 ? tv / y5Ebitda : null,
    impliedExitSales: y5.revenue > 0 ? tv / y5.revenue : null,
    fcfPath,
  };
}

// Reverse DCF: solve for the year-1 growth rate that makes the model value
// EQUAL today's price, holding margin, WACC and terminal assumptions at the
// case's neutral anchors. "What is the market already pricing in?" — the
// single most useful question in a pitch, and the one the grill compares
// the student's own growth against. Plain bisection: boring, 60 iterations,
// always converges inside the clamped range.
export function solveImpliedGrowth(c: ValuationCase, wacc: number, terminalGrowth: number): number | null {
  const base: Levers = { y1Growth: 0, exitMargin: c.baseExitMargin, wacc, terminalGrowth };
  let lo = -0.6;
  let hi = 1.6;
  const valueAt = (g: number) => runDcf(c, { ...base, y1Growth: g }).perShare;
  if (valueAt(lo) > c.priceNow || valueAt(hi) < c.priceNow) return null; // price outside solvable range
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if (valueAt(mid) < c.priceNow) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

// Comps cross-check: implied per-share value from the comp set's median
// multiple applied to the student's OWN year-1 forecast (so this leg moves
// with their assumptions too — that's deliberate, it shows how the two
// methods respond differently to the same lever).
export function compsImpliedValue(c: ValuationCase, l: Levers): number | null {
  const multiples = c.comps
    .map((k) => (c.compMetric === "EV/EBITDA" ? k.evEbitda : k.evSales))
    .filter((m): m is number => m !== null && m > 0)
    .sort((a, b) => a - b);
  if (multiples.length === 0) return null;
  const median = multiples[Math.floor(multiples.length / 2)];

  const y1Revenue = c.revenue0 * (1 + l.y1Growth);
  const y1Margin = c.ebitMargin0 + (l.exitMargin - c.ebitMargin0) * (1 / MARGIN_RAMP_YEARS);
  let impliedEv: number;
  if (c.compMetric === "EV/EBITDA") {
    const y1Ebitda = y1Revenue * y1Margin + y1Revenue * c.daPct;
    impliedEv = median * y1Ebitda;
  } else {
    impliedEv = median * y1Revenue;
  }
  const equity = impliedEv - c.netDebt;
  return (equity / c.sharesM) * c.unitDivisor;
}

export function compMedian(c: ValuationCase): number | null {
  const multiples = c.comps
    .map((k) => (c.compMetric === "EV/EBITDA" ? k.evEbitda : k.evSales))
    .filter((m): m is number => m !== null && m > 0)
    .sort((a, b) => a - b);
  if (multiples.length === 0) return null;
  return multiples[Math.floor(multiples.length / 2)];
}

// ---------------------------------------------------------------------------
// The grill — three defensibility checks, the same red flags a desk head
// (or a pitch judge) runs before anything else. These are the checks the
// site's own pitch workbook tells students to expect out loud.
// ---------------------------------------------------------------------------

export function runGrill(c: ValuationCase, l: Levers, dcf: DcfResult): GrillCheck[] {
  const checks: GrillCheck[] = [];

  // Check 1 — terminal smuggling: what multiple does your Gordon terminal
  // value imply, and how does it sit against the comp set? A terminal value
  // that secretly assumes a re-rating is the oldest way to launder optimism
  // into a DCF.
  const median = compMedian(c);
  const implied = c.compMetric === "EV/EBITDA" ? dcf.impliedExitEbitda : dcf.impliedExitSales;
  if (median !== null && implied !== null) {
    const ratio = implied / median;
    checks.push({
      name: "Terminal smuggling",
      status: ratio > 2 ? "fail" : ratio > 1.3 ? "warn" : "pass",
      text: `Your terminal value implies a ${c.compMetric} of ${implied.toFixed(1)}x at exit, against a comp-set median of ${median.toFixed(1)}x. ${
        ratio > 2
          ? "That is not a valuation, it is a hope — the terminal is doing all the work."
          : ratio > 1.3
            ? "You are quietly assuming a premium exit multiple. Say why, out loud, or bring it down."
            : "Your exit assumption sits inside what the market actually pays for similar businesses. Defensible."
      }`,
    });
  }

  // Check 2 — terminal dependence: how much of the whole answer comes from
  // the terminal value, the part nobody can really forecast. Above ~85% and
  // the model is a terminal-value machine with a forecast attached.
  const tvPct = dcf.tvPctOfEv * 100;
  checks.push({
    name: "Terminal dependence",
    status: tvPct > 85 ? "fail" : tvPct > 75 ? "warn" : "pass",
    text:
      tvPct > 100
        ? `${tvPct.toFixed(0)}% of your enterprise value comes from the terminal value — meaning your explicit forecast period destroys value and the entire answer is the terminal. That is the turnaround case in one number, and it is exactly what a desk will push on hardest.`
        : `${tvPct.toFixed(0)}% of your enterprise value comes from the terminal value. ${
            tvPct > 85
              ? "Almost everything hangs on the least knowable number in the model. Extend the explicit forecast or defend it."
              : tvPct > 75
                ? "Normal for a growing business, but know the number before someone else names it for you."
                : "A healthy share of value comes from the years you actually forecast. Good."
          }`,
  });

  // Check 3 — per case: are you arguing with management's own guidance
  // (fine, but that IS the thesis and you have to say it), or, where the
  // case is a turnaround, is your margin recovery physically plausible
  // against the best operator in the comp set?
  if (c.thirdCheck.kind === "growthVsGuidance") {
    const guided = c.thirdCheck.guidedGrowth;
    const gapPts = (l.y1Growth - guided) * 100;
    // Direction matters: out-promising management needs extraordinary
    // evidence; coming in UNDER guidance is a legitimate bear view (that is
    // literally what a short thesis is), so it gets graded as a call to
    // defend, not a modeling error.
    const status =
      gapPts > 12 ? "fail" : gapPts > 5 ? "warn" : gapPts < -15 ? "warn" : "pass";
    const reading =
      gapPts > 12
        ? "You are promising more than the people running the company dare to. That needs extraordinary evidence — where is it?"
        : gapPts > 5
          ? "Above guidance. Allowed, but that premium is now your whole thesis — say it out loud."
          : gapPts < -15
            ? "A genuinely contrarian call — well below what management is guiding to. That is a legitimate bear thesis, but on a desk you'd better have the reason ready in one sentence."
            : gapPts < -5
              ? "Slightly below guidance — a cautious, defensible stance (it is also quietly a view: you think the guide is rich)."
              : "Your forecast sits close to what management itself is guiding to. Reasonable.";
    checks.push({
      name: "Growth honesty",
      status,
      text: `You forecast ${(l.y1Growth * 100).toFixed(1)}% year-1 growth against management guidance of ${(guided * 100).toFixed(1)}% — a ${gapPts >= 0 ? "+" : ""}${gapPts.toFixed(1)}-point gap. ${reading}`,
    });
  } else {
    const ref = c.thirdCheck.referenceMargin;
    checks.push({
      name: "Margin realism",
      status: l.exitMargin > ref ? "fail" : l.exitMargin > ref * 0.75 ? "warn" : "pass",
      text: `Your exit margin of ${(l.exitMargin * 100).toFixed(1)}% sits against ${c.thirdCheck.referenceName}'s actual ${(ref * 100).toFixed(1)}%. ${
        l.exitMargin > ref
          ? `You are forecasting this company becomes a better operator than ${c.thirdCheck.referenceName}. That is a career-defining call — bring receipts.`
          : l.exitMargin > ref * 0.75
            ? "A full recovery toward best-in-class economics. Possible, but the burden of proof is on you."
            : "A recovery path that stays inside what better operators actually achieve. Plausible."
      }`,
    });
  }

  return checks;
}

// The desk-head verdict. Four tiers, combining the grill (is the build
// defensible?) with where the number lands vs. the price and vs. what the
// price implies (do you have a view, and can you stand behind it?).
export function deskVerdict(
  c: ValuationCase,
  checks: GrillCheck[],
  perShare: number,
  impliedGrowth: number | null,
  yourGrowth: number
): { tier: string; title: string; body: string } {
  const fails = checks.filter((k) => k.status === "fail").length;
  const warns = checks.filter((k) => k.status === "warn").length;
  const gapVsPrice = perShare / c.priceNow - 1;

  const stance =
    gapVsPrice > 0.15 ? "cheap" : gapVsPrice < -0.15 ? "rich" : "roughly fair";
  const impliedLine =
    impliedGrowth !== null
      ? `Today's price already implies year-1 growth of ${(impliedGrowth * 100).toFixed(1)}%; you forecast ${(yourGrowth * 100).toFixed(1)}%.`
      : "";

  if (fails >= 2) {
    return {
      tier: "fail",
      title: "Back to the desk.",
      body: `The number doesn't matter yet — the build doesn't hold up. ${checks.filter((k) => k.status === "fail").map((k) => k.name).join(" and ")} would get this sent back before the first slide printed. Fix the assumptions, then we'll talk about the answer.`,
    };
  }
  if (fails === 1 || warns >= 2) {
    return {
      tier: "warn",
      title: "Right neighbourhood, flimsy scaffolding.",
      body: `Your model says ${c.company} looks ${stance} (${gapVsPrice >= 0 ? "+" : ""}${(gapVsPrice * 100).toFixed(0)}% vs. today's price). ${impliedLine} But ${checks.filter((k) => k.status !== "pass").map((k) => k.name.toLowerCase()).join(" and ")} would come up in the first minute of Q&A. A defensible rough answer beats a precise fragile one.`,
    };
  }
  if (Math.abs(gapVsPrice) <= 0.15) {
    return {
      tier: "pass",
      title: "Send it — with the honest conclusion.",
      body: `Your checks hold up, and your answer is "roughly fair" (${gapVsPrice >= 0 ? "+" : ""}${(gapVsPrice * 100).toFixed(0)}% vs. price). ${impliedLine} That is a legitimate call: sometimes the desk's job is to say the market has it about right. An honest "no edge" is worth more than an invented one.`,
    };
  }
  return {
    tier: "pass",
    title: "Send it — and be ready to defend the gap.",
    body: `Clean build, and a real view: ${c.company} looks ${stance} to you (${gapVsPrice >= 0 ? "+" : ""}${(gapVsPrice * 100).toFixed(0)}% vs. price). ${impliedLine} That gap between your forecast and what the price implies is your pitch. The desk will ask you to defend it in one sentence — have it ready.`,
  };
}

// ---------------------------------------------------------------------------
// The three cases. All figures real and dated; derivations and desk
// assumptions labeled as such. The seat NEVER invents a number silently.
// ---------------------------------------------------------------------------

export const VALUATION_CASES: ValuationCase[] = [
  {
    id: "diploma",
    company: "Diploma PLC",
    ticker: "LSE: DPLM",
    lens: "IB / Asset Management",
    difficulty: "Standard",
    question: "What is Diploma worth after this re-rating?",
    brief:
      "7:40am. Your VP covers UK industrials and has an IC check-in at 8:30. Diploma just raised guidance again and the stock is near a 52-week high after a big re-rating. She doesn't want a model, she wants an answer: is there anything left in this, and what's the number you'd defend? You have five minutes of prep before you build.",
    currencyNote:
      "UK trap: the share price is quoted in PENCE (7,590p), the financials are in £ MILLIONS. Mixing them up is the classic 100x error — the model handles the conversion for you, but a desk will expect you to notice.",
    unitDivisor: 100,
    priceUnitLabel: "pence",
    currencySymbol: "£",
    priceNow: 7590,
    priceAsOf: "mid-Aug 2026 (52-week range 4,970p–7,663p)",
    fyLabel: "LTM to Mar 2026 (derived — see data pack)",
    revenue0: 1650,
    ebitMargin0: 0.245,
    taxRate: 0.25,
    daPct: 0.027,
    capexPct: 0.012,
    steadyCapexPct: 0.027,
    nwcPct: 0.005,
    netDebt: 343.9,
    sharesM: 134.2,
    recentGrowth: 0.15,
    guidedGrowth: 0.14,
    guidedMargin: 0.265,
    baseExitMargin: 0.26,
    deskBeta: 0.9,
    riskFree: 0.045,
    erp: 0.05,
    dataPack: [
      { label: "Share price", value: "7,590p", source: "Pitch (13 Aug 2026), citing Yahoo Finance quote — re-pull live before real work" },
      { label: "Revenue (LTM proxy)", value: "≈ £1,650m", source: "Derived: H1 26 £851.1m actual + H2 25 estimated from H1 25 £728m. Pull the exact FY25 figure from the annual report for real work" },
      { label: "Operating margin (H1 26)", value: "24.5%", source: "Diploma H1 2026 results, 19 May 2026" },
      { label: "Net debt", value: "£343.9m", source: "Diploma H1 2026 results (31 Mar 2026); leverage 0.8x vs <2.0x policy" },
      { label: "Shares (weighted avg)", value: "134.2m", source: "Diploma H1 2026 results" },
      { label: "Effective tax rate", value: "25.0%", source: "Diploma H1 2026 results" },
      { label: "D&A / capex / ΔNWC", value: "2.7% / 1.2% / 0.5% of revenue", source: "Derived from the H1 26 free-cash-flow bridge (£22.7m / £10.1m / £3.9m on £851.1m revenue)" },
      { label: "H1 26 growth", value: "+17% reported, +15% organic", source: "Diploma H1 2026 results" },
      { label: "FY26 guidance", value: "+14% organic, c.26.5% margin", source: "Q3 FY26 trading update, raised from +12% / c.25%" },
    ],
    researchActions: [
      {
        id: "guidance",
        label: "Read the guidance paragraph",
        costMinutes: 2,
        reveals:
          "FY26 guidance, raised twice this year: +14% organic revenue growth (from +12%), operating margin circa 26.5% (from c.25%). Management's stated financial model: 5% organic, ~10% with M&A, 20%+ margins. The slider markers now show you both.",
      },
      {
        id: "comps",
        label: "Pull the comp sheet",
        costMinutes: 2,
        reveals:
          "Fastenal and Grainger, computed from SEC filings and 17 Aug 2026 prices. Bunzl — the closest UK name — isn't in this desk sheet because our free data doesn't cover the LSE; in the real workbook you add it yourself. The comps-implied value leg is now on your football field.",
      },
      {
        id: "beta",
        label: "Check the beta",
        costMinutes: 1,
        reveals:
          "Desk sheet shows Diploma's beta at ~0.9 — a low-beta compounder. CAPM at the desk's 4.5% gilt + 5% ERP puts the cost of equity near 9%. Until you checked, the model was using a generic 1.0.",
      },
      {
        id: "risks",
        label: "Read the risk flags",
        costMinutes: 1,
        reveals:
          "It's a roll-up: 15 deals in the LTM at ~8x average EBIT while the stock trades far above that — the arbitrage is the whole model, and it breaks if they overpay. Management itself flagged Peerless will 'moderate toward more typical growth rates' in H2. The premium price already assumes continued execution.",
      },
    ],
    comps: [
      { name: "Fastenal (NASDAQ: FAST)", evEbitda: 32.0, evSales: 7.2, pe: 46.7, note: "US industrial distribution" },
      { name: "W.W. Grainger (NYSE: GWW)", evEbitda: 22.6, evSales: 3.6, pe: 36.4, note: "US MRO scale player" },
    ],
    compMetric: "EV/EBITDA",
    compNote:
      "Computed from SEC EDGAR FY2025 filings + Twelve Data prices (17-18 Aug 2026). Diploma's own EV/EBITDA at 7,590p is roughly 23x on the LTM proxy — inside this set, and rich versus its own history. Bunzl (LSE) is the natural third comp but isn't covered by our free data.",
    riskFlags:
      "Roll-up overpay risk (multiple paid has ticked from 8x toward 9x); Peerless moderation flagged by management itself; a premium multiple that leaves no room for a disappointing update.",
    thirdCheck: { kind: "growthVsGuidance", guidedGrowth: 0.14 },
    sliderRanges: { y1Growth: [-0.1, 0.35], exitMargin: [0.15, 0.35] },
    verdictContext:
      "Whatever your number: the next question on this desk is always the same — what multiple are they paying for the next deal, and does the arbitrage still work at that price?",
  },
  {
    id: "palantir",
    company: "Palantir Technologies",
    ticker: "NASDAQ: PLTR",
    lens: "Equity Research / S&T",
    difficulty: "Hard",
    question: "What does a DCF say Palantir is worth?",
    brief:
      "Your desk publishes on US software. Palantir beat on everything and ripped 30% to $172.55 — and Michael Burry's disclosed short says it's priced for perfection. Your editor wants to know which side the math is on by the close. Not the narrative — the math: what growth does $172.55 actually require, and is any of it sane?",
    currencyNote:
      "Everything in US dollars — no units trap this time. The trap here is different: at this multiple, the growth slider and the terminal assumptions are loaded weapons.",
    unitDivisor: 1,
    priceUnitLabel: "dollars",
    currencySymbol: "$",
    priceNow: 172.55,
    priceAsOf: "17 Aug 2026 (Twelve Data quote)",
    fyLabel: "FY2025 (ended 31 Dec 2025)",
    revenue0: 4475,
    ebitMargin0: 0.316,
    taxRate: 0.2,
    daPct: 0.006,
    capexPct: 0.008,
    steadyCapexPct: 0.01,
    nwcPct: 0.0,
    netDebt: -2030,
    sharesM: 2402.9,
    recentGrowth: 0.93,
    guidedGrowth: 0.82,
    guidedMargin: null,
    baseExitMargin: 0.35,
    deskBeta: 2.0,
    riskFree: 0.042,
    erp: 0.05,
    dataPack: [
      { label: "Share price", value: "$172.55", source: "Twelve Data quote, 17 Aug 2026" },
      { label: "Revenue (FY2025)", value: "$4,475m", source: "SEC EDGAR 10-K, FY ended 31 Dec 2025" },
      { label: "Operating margin (FY2025)", value: "31.6%", source: "SEC EDGAR: $1,414m operating income on $4,475m revenue" },
      { label: "Net cash", value: "$2,030m (cash; no reported long-term debt)", source: "SEC EDGAR, FY2025 balance sheet — conservative: excludes marketable securities" },
      { label: "Shares outstanding", value: "2,402.9m", source: "SEC EDGAR 10-Q cover page, 30 Jun 2026" },
      { label: "D&A / capex", value: "$26m / $34m (both <1% of revenue)", source: "SEC EDGAR FY2025 — asset-light software economics" },
      { label: "Tax rate", value: "20% (normalized desk assumption)", source: "FY2025 effective rate was ~1% on deferred-tax-asset usage — a real Q&A point, not a modeling choice to copy" },
      { label: "Q2 2026 print", value: "Revenue $1.94bn, +93% YoY", source: "Pitch (5 Aug 2026), citing Q2 2026 earnings" },
      { label: "FY2026 guidance", value: "≈ $8.15bn revenue (+82%)", source: "Pitch (5 Aug 2026), citing raised guidance after the Q2 beat" },
    ],
    researchActions: [
      {
        id: "guidance",
        label: "Read the guidance paragraph",
        costMinutes: 2,
        reveals:
          "FY2026 revenue guidance raised to roughly $8.15bn after Q2 — that's +82% on FY2025. US commercial revenue grew 149%. Government is still ~55% of revenue, anchored by a $10bn multi-year Army contract. The slider marker now shows the guided rate.",
      },
      {
        id: "comps",
        label: "Pull the comp sheet",
        costMinutes: 2,
        reveals:
          "Snowflake's EV/EBITDA is not meaningful — its EBITDA is negative. That's the lesson of this comp set: at this end of software the honest metric is EV/Sales, because margins haven't finished arriving. Your terminal-smuggling check now runs on EV/Sales.",
      },
      {
        id: "beta",
        label: "Check the beta",
        costMinutes: 1,
        reveals:
          "Desk sheet shows a beta near 2.0 — this stock moves twice as much as the market. At a 4.2% risk-free rate and 5% ERP, CAPM says the cost of equity is ~14%. Until you checked, the model was pricing risk like a utility (β = 1.0).",
      },
      {
        id: "risks",
        label: "Read the risk flags",
        costMinutes: 1,
        reveals:
          "Burry's short, in his framing: at ~90x sales / 250x+ trailing earnings, even flawless execution leaves holders relying on the multiple. A growth deceleration from ~60% to 40% — with the business still healthy — could halve the stock. Jefferies kept its Underperform through the beat.",
      },
    ],
    comps: [
      { name: "Snowflake (NYSE: SNOW)", evEbitda: null, evSales: 24.0, pe: null, note: "EBITDA negative — EV/EBITDA and P/E not meaningful" },
    ],
    compMetric: "EV/Sales",
    compNote:
      "Computed from SEC EDGAR (Snowflake FY ended Jan 2026) + Twelve Data prices (17 Aug 2026). Palantir's own EV/Sales is ~92x. C3.ai was excluded: at $250m of revenue with deep negative margins its multiples carry no information. This is the thinnest honest comp set on the desk — that scarcity is itself the finding.",
    riskFlags:
      "~90x EV/Sales vs the closest peer at ~24x; 55% government revenue tied to political alignment; a public short thesis from a famous bear; multiple compression needs no bad news, only slower good news.",
    thirdCheck: { kind: "growthVsGuidance", guidedGrowth: 0.82 },
    sliderRanges: { y1Growth: [-0.2, 1.0], exitMargin: [0.2, 0.5] },
    verdictContext:
      "On this desk the follow-up is always: what multiple does your target REQUIRE? At these levels, state the exit multiple your number depends on — out loud — before anyone asks.",
  },
  {
    id: "intel",
    company: "Intel",
    ticker: "NASDAQ: INTC",
    lens: "IB / Restructuring & Special Situations",
    difficulty: "Hard",
    question: "Is Intel's turnaround already priced in?",
    brief:
      "Intel has re-rated to $103.49 on foundry-turnaround hopes. But the FY2025 10-K says revenue $52.9bn with NEGATIVE operating income and $50bn of gross debt. Your PM asks the only question that matters: what recovery is already in the price, and would you underwrite it? This is the special-situations version of the job: the entire valuation is a margin-recovery assumption.",
    currencyNote:
      "US dollars. No units trap — but watch the FCF bridge: this company spends $14.6bn a year on capex. Growth without margin recovery is worthless here; the cash goes straight back out the door.",
    unitDivisor: 1,
    priceUnitLabel: "dollars",
    currencySymbol: "$",
    priceNow: 103.49,
    priceAsOf: "17 Aug 2026 (Twelve Data quote)",
    fyLabel: "FY2025 (ended 27 Dec 2025)",
    revenue0: 52853,
    ebitMargin0: -0.042,
    taxRate: 0.15,
    daPct: 0.204,
    capexPct: 0.277,
    steadyCapexPct: 0.12,
    nwcPct: 0.0,
    netDebt: 37663,
    sharesM: 5044,
    recentGrowth: -0.02,
    guidedGrowth: null,
    guidedMargin: null,
    baseExitMargin: 0.12,
    deskBeta: 1.3,
    riskFree: 0.042,
    erp: 0.05,
    dataPack: [
      { label: "Share price", value: "$103.49", source: "Twelve Data quote, 17 Aug 2026" },
      { label: "Revenue (FY2025)", value: "$52,853m", source: "SEC EDGAR 10-K, FY ended 27 Dec 2025" },
      { label: "Operating margin (FY2025)", value: "−4.2% (negative)", source: "SEC EDGAR: −$2,214m operating income" },
      { label: "D&A (FY2025)", value: "$10,757m (20.4% of revenue)", source: "SEC EDGAR — fabs are depreciating monsters" },
      { label: "Capex (FY2025)", value: "$14,646m (27.7% of revenue)", source: "SEC EDGAR — one of the most capex-intensive businesses in the index" },
      { label: "Debt / cash", value: "$50,537m / $12,874m → net debt $37,663m", source: "SEC EDGAR FY2025 balance sheet" },
      { label: "Shares outstanding", value: "5,044m", source: "SEC EDGAR 10-Q cover page, 17 Jul 2026" },
      { label: "Tax rate", value: "15% (normalized desk assumption)", source: "FY2025's effective rate (~98%) is loss-distorted and meaningless for a forward model" },
    ],
    researchActions: [
      {
        id: "reality",
        label: "Segment reality check",
        costMinutes: 2,
        reveals:
          "There is no guidance paragraph in this pack — deliberately. All you have is the FY25 print and the price. Negative EBIT, $10.8bn of D&A, $14.6bn of capex: the FCF bridge only works once margins recover. That recovery IS the valuation.",
      },
      {
        id: "comps",
        label: "Pull the comp sheet",
        costMinutes: 2,
        reveals:
          "Nvidia and Broadcom — what 'good' looks like in semis: 60% and 40% operating margins, real free cash flow. Their multiples frame what the market pays for execution. Your margin-realism check now runs against Nvidia's actual margin.",
      },
      {
        id: "beta",
        label: "Check the beta",
        costMinutes: 1,
        reveals:
          "Desk sheet shows a beta near 1.3 — cyclical, story-driven. CAPM at 4.2% + 5% ERP says ~10.7% cost of equity. Until you checked, the model used a generic 1.0.",
      },
      {
        id: "risks",
        label: "Read the risk flags",
        costMinutes: 1,
        reveals:
          "$50.5bn gross debt against $12.9bn cash; capex commitments don't stop for a turnaround; P/E is not meaningful (losses); the re-rating from ~$20s to $103 happened on narrative and government interest, not on reported numbers. If the recovery slips a year, the equity stub is thin.",
      },
    ],
    comps: [
      { name: "NVIDIA (NASDAQ: NVDA)", evEbitda: 40.8, evSales: 25.2, pe: 45.4, note: "60% operating margin — the benchmark" },
      { name: "Broadcom (NASDAQ: AVGO)", evEbitda: 73.4, evSales: 29.9, pe: 80.7, note: "40% operating margin; multiple inflated by $65bn debt" },
    ],
    compMetric: "EV/EBITDA",
    compNote:
      "Computed from SEC EDGAR (NVDA FY ended Jan 2026, AVGO FY ended Nov 2025) + Twelve Data prices (17 Aug 2026). Intel's own EV/EBITDA is ~65x — meaningless for calibration when EBITDA is depressed, useful only as a measure of how much recovery is priced. Treat this set as margin references, not multiple anchors.",
    riskFlags:
      "Negative operating income; $50.5bn gross debt; $14.6bn annual capex that can't easily stop; P/E not meaningful; a re-rating built on narrative rather than filings.",
    thirdCheck: { kind: "marginRealism", referenceMargin: 0.6, referenceName: "Nvidia" },
    sliderRanges: { y1Growth: [-0.15, 0.3], exitMargin: [-0.1, 0.4] },
    verdictContext:
      "The special-situations question: what does the price imply the recovery looks like, and would you sign the underwriting? 'It can't get worse' is not a thesis — a dated margin path is.",
  },
];
