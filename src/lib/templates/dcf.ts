// The DCF Valuation Model template — the flagship download. Two genuinely
// different structures behind one entry point:
//
//   Standard (all sectors except FIG): project free cash flow from
//   revenue-growth/margin assumptions, discount at a WACC built from real
//   inputs, add a Gordon-growth terminal value, bridge enterprise value →
//   equity value → implied share price vs. today's.
//
//   FIG (banks & insurers): a dividend-discount model instead — project
//   EPS, apply a payout ratio, discount the dividend stream at the cost of
//   equity. Not a simplification: EV-based DCF math is meaningless for a
//   bank (debt is its raw material, not its financing), and pretending
//   otherwise would teach students exactly the wrong lesson. See
//   sectorGuidance.ts.
//
// Every assumption is a live Excel input cell; every computed line is a
// real formula that recalculates when assumptions change. Real data
// prefills inputs where it exists; missing data leaves a blank blue cell
// (never an invented number) — with two labeled exceptions, standard
// classroom conventions rather than data: the risk-free rate / equity risk
// premium defaults, and beta defaulting to 1.00 (market average) when no
// computed beta exists. The guidance sheet says exactly that.

import type ExcelJS from "exceljs";
import type { TemplateRequest } from "./types";
import { getSectorGuidance } from "./sectorGuidance";
import type { CompanyPrefill } from "./prefill";
import { historyCagr } from "./prefill";
import {
  makeWorkbook,
  addGuidanceSheet,
  addSourcesSheet,
  sheetTitle,
  sectionLabel,
  headerCell,
  inputCell,
  formulaCell,
  valueCell,
  labelCell,
  keyOutputCell,
  noteCell,
  modelColumns,
  FMT,
} from "./excelHelpers";

/** Column letter for a 1-based index (A=1). Model sheets never exceed Z. */
function col(n: number): string {
  return String.fromCharCode(64 + n);
}

const A = "Assumptions"; // sheet name used in cross-sheet formulas

export function buildDcfWorkbook(req: TemplateRequest, p: CompanyPrefill): ExcelJS.Workbook {
  const sector = getSectorGuidance(req.sector);
  return sector.usesDividendDiscount ? buildDdm(req, p) : buildStandardDcf(req, p);
}

// ---------------------------------------------------------------------------
// Standard enterprise-value DCF
// ---------------------------------------------------------------------------

function buildStandardDcf(req: TemplateRequest, p: CompanyPrefill): ExcelJS.Workbook {
  const wb = makeWorkbook();
  const sector = getSectorGuidance(req.sector);
  const years = req.forecastYears ?? 5;
  const f = p.fundamentals;

  addGuidanceSheet(wb, {
    templateName: "DCF Valuation Model",
    sector,
    howToUse: [
      "1. Assumptions sheet: work top to bottom. Revenue growth fades linearly from your year-1 rate to your final-year rate; margins and capex hold at the levels you set.",
      "2. The WACC builds from CAPM (risk-free + beta × equity risk premium) blended with after-tax cost of debt at your chosen capital-structure weights.",
      "3. DCF sheet: watch the implied share price and upside/(downside) at the bottom recompute as you change assumptions. Check what share of value sits in the terminal term. If it dominates, your answer is mostly a terminal-assumptions story.",
      req.includeSensitivity !== false
        ? "4. Sensitivity sheet: the implied price across a WACC × terminal-growth grid. Cells where WACC ≤ terminal growth show an error. That combination is mathematically meaningless (perpetuity growing faster than its discount rate), not a bug."
        : "4. (Sensitivity grid not included in this download. Re-download with it enabled to stress your answer.)",
    ],
  });

  // --- Assumptions sheet -----------------------------------------------
  const ws = wb.addWorksheet(A);
  ws.getColumn(1).width = 40;
  ws.getColumn(2).width = 16;
  ws.getColumn(3).width = 90;
  sheetTitle(
    ws,
    p.ticker ? `Assumptions: ${p.companyName} (${p.ticker})` : "Assumptions",
    "Blue cells are yours to change. Blank blue cells had no real data available: enter your own."
  );

  sectionLabel(ws, 4, "Company");
  labelCell(ws.getCell(5, 1), "Share price (USD, per ordinary share)");
  inputCell(ws.getCell(5, 2), p.usdSharePrice, FMT.usd2);
  labelCell(ws.getCell(6, 1), "Diluted shares outstanding");
  inputCell(ws.getCell(6, 2), f?.sharesOutstandingDiluted ?? f?.sharesOutstanding ?? null, FMT.num0);
  labelCell(ws.getCell(7, 1), "Net debt (total debt − cash)");
  inputCell(ws.getCell(7, 2), p.valuation?.netDebt ?? null, FMT.usdM);
  noteCell(ws.getCell(7, 3), "Negative = more cash than debt. Prefilled from the latest filed balance sheet where available.");

  sectionLabel(ws, 9, "Operating assumptions");
  const latestRevenue = f?.revenue ?? null;
  labelCell(ws.getCell(10, 1), `Base-year revenue (FY${f?.fiscalYear ?? "—"}, actual)`);
  inputCell(ws.getCell(10, 2), latestRevenue, FMT.usdM);
  const cagr = f ? historyCagr(f.revenueHistory) : null;
  labelCell(ws.getCell(11, 1), "Revenue growth: year 1");
  inputCell(ws.getCell(11, 2), cagr, FMT.pct1);
  noteCell(
    ws.getCell(11, 3),
    cagr !== null
      ? "Prefilled with the company's own multi-year revenue CAGR from its filings, a starting point, not a forecast. Make it yours."
      : "No revenue history available to suggest a starting rate. Enter your own researched growth assumption."
  );
  labelCell(ws.getCell(12, 1), `Revenue growth: year ${years} (fade target)`);
  inputCell(ws.getCell(12, 2), 0.03, FMT.pct1);
  noteCell(ws.getCell(12, 3), "Growth fades linearly from year 1 to this rate. Near-GDP by the final year is the usual discipline.");
  const ebitMargin =
    f?.operatingIncome != null && f?.revenue ? f.operatingIncome / f.revenue : null;
  labelCell(ws.getCell(13, 1), "EBIT margin (held flat)");
  inputCell(ws.getCell(13, 2), ebitMargin, FMT.pct1);
  labelCell(ws.getCell(14, 1), "Tax rate");
  inputCell(ws.getCell(14, 2), 0.21, FMT.pct1);
  noteCell(ws.getCell(14, 3), "Default = 21% US federal statutory rate, a labeled convention. Replace with the company's real effective rate from its filings.");
  const daPct = f?.depreciationAmortization != null && f?.revenue ? f.depreciationAmortization / f.revenue : null;
  labelCell(ws.getCell(15, 1), "D&A (% of revenue)");
  inputCell(ws.getCell(15, 2), daPct, FMT.pct1);
  const capexPct = f?.capex != null && f?.revenue ? f.capex / f.revenue : null;
  labelCell(ws.getCell(16, 1), "Capex (% of revenue)");
  inputCell(ws.getCell(16, 2), capexPct, FMT.pct1);
  labelCell(ws.getCell(17, 1), "Δ Net working capital (% of revenue growth)");
  inputCell(ws.getCell(17, 2), 0.05, FMT.pct1);
  noteCell(ws.getCell(17, 3), "Cash absorbed as the business grows: 5% of each year's incremental revenue is a placeholder convention; tune to the company's actual working-capital intensity.");

  sectionLabel(ws, 19, "WACC");
  labelCell(ws.getCell(20, 1), "Risk-free rate (10-yr govt yield)");
  inputCell(ws.getCell(20, 2), 0.04, FMT.pct1);
  noteCell(ws.getCell(20, 3), "Convention default: look up today's actual 10-year Treasury yield and replace.");
  labelCell(ws.getCell(21, 1), "Equity risk premium");
  inputCell(ws.getCell(21, 2), 0.05, FMT.pct1);
  labelCell(ws.getCell(22, 1), "Beta");
  inputCell(ws.getCell(22, 2), p.beta ?? 1.0, FMT.num2);
  noteCell(
    ws.getCell(22, 3),
    p.beta !== null
      ? "Real: regressed by Bloombruh from 1 year of daily returns vs. SPY (see Data & Sources)."
      : "No computed beta available for this ticker. 1.00 = market average, a labeled convention. Replace with your own estimate."
  );
  labelCell(ws.getCell(23, 1), "Cost of equity (CAPM)", { bold: true });
  formulaCell(ws.getCell(23, 2), "B20+B22*B21", FMT.pct1, true);
  const costDebt =
    f?.interestExpense != null && f?.totalDebt ? f.interestExpense / f.totalDebt : null;
  labelCell(ws.getCell(24, 1), "Pre-tax cost of debt");
  inputCell(ws.getCell(24, 2), costDebt, FMT.pct1);
  noteCell(
    ws.getCell(24, 3),
    costDebt !== null
      ? "Prefilled as interest expense ÷ total debt from the latest filings, a rough effective rate."
      : "No interest/debt data available. Enter the company's approximate borrowing rate."
  );
  labelCell(ws.getCell(25, 1), "After-tax cost of debt", { bold: true });
  formulaCell(ws.getCell(25, 2), "B24*(1-B14)", FMT.pct1, true);
  const equityWeight =
    p.valuation?.marketCap != null && f?.totalDebt != null && p.valuation.marketCap + f.totalDebt > 0
      ? p.valuation.marketCap / (p.valuation.marketCap + f.totalDebt)
      : null;
  labelCell(ws.getCell(26, 1), "Equity weight (E / (D+E))");
  inputCell(ws.getCell(26, 2), equityWeight ?? 0.8, FMT.pct1);
  noteCell(
    ws.getCell(26, 3),
    equityWeight !== null
      ? "Prefilled from the real current capital structure (market cap vs. filed total debt)."
      : "No capital-structure data. 80% equity is a placeholder; set it from the company's real balance sheet."
  );
  labelCell(ws.getCell(27, 1), "WACC", { bold: true });
  formulaCell(ws.getCell(27, 2), "B26*B23+(1-B26)*B25", FMT.pct1, true);

  sectionLabel(ws, 29, "Terminal value");
  labelCell(ws.getCell(30, 1), "Terminal growth rate");
  inputCell(ws.getCell(30, 2), 0.025, FMT.pct1);
  noteCell(ws.getCell(30, 3), "Perpetuity growth: must sit below long-run nominal GDP (~2–3%) to be defensible, and below WACC to be mathematically valid.");

  // --- DCF sheet --------------------------------------------------------
  const d = wb.addWorksheet("DCF");
  modelColumns(d, years);
  sheetTitle(d, "Discounted cash flow", "Values in USD. Column B is the actual base year; the rest are your projection.");

  const first = 3; // first projection column index (C)
  const last = first + years - 1;
  const lastL = col(last);

  headerCell(d.getCell(4, 1), "Line");
  valueCell(d.getCell(4, 2), f?.fiscalYear ? `FY${f.fiscalYear}A` : "Base yr", undefined, true);
  for (let i = 0; i < years; i++) {
    headerCell(d.getCell(4, first + i), f?.fiscalYear ? `FY${f.fiscalYear + i + 1}E` : `Yr ${i + 1}E`);
  }

  labelCell(d.getCell(5, 1), "Revenue growth", { muted: true });
  formulaCell(d.getCell(5, first), `${A}!$B$11`, FMT.pct1);
  for (let i = 1; i < years; i++) {
    formulaCell(
      d.getCell(5, first + i),
      `${A}!$B$11+(${A}!$B$12-${A}!$B$11)*${i}/${years - 1}`,
      FMT.pct1
    );
  }

  labelCell(d.getCell(6, 1), "Revenue", { bold: true });
  formulaCell(d.getCell(6, 2), `${A}!$B$10`, FMT.usdM);
  for (let i = 0; i < years; i++) {
    formulaCell(d.getCell(6, first + i), `${col(first + i - 1)}6*(1+${col(first + i)}5)`, FMT.usdM);
  }

  labelCell(d.getCell(7, 1), "EBIT");
  labelCell(d.getCell(8, 1), "NOPAT (EBIT × (1 − tax))");
  labelCell(d.getCell(9, 1), "+ D&A");
  labelCell(d.getCell(10, 1), "− Capex");
  labelCell(d.getCell(11, 1), "− Δ Net working capital");
  labelCell(d.getCell(12, 1), "Unlevered free cash flow", { bold: true });
  labelCell(d.getCell(14, 1), "Discount period", { muted: true });
  labelCell(d.getCell(15, 1), "Discount factor", { muted: true });
  labelCell(d.getCell(16, 1), "PV of FCF");
  for (let i = 0; i < years; i++) {
    const L = col(first + i);
    const prevL = col(first + i - 1);
    formulaCell(d.getCell(7, first + i), `${L}6*${A}!$B$13`, FMT.usdM);
    formulaCell(d.getCell(8, first + i), `${L}7*(1-${A}!$B$14)`, FMT.usdM);
    formulaCell(d.getCell(9, first + i), `${L}6*${A}!$B$15`, FMT.usdM);
    formulaCell(d.getCell(10, first + i), `-${L}6*${A}!$B$16`, FMT.usdM);
    formulaCell(d.getCell(11, first + i), `-(${L}6-${prevL}6)*${A}!$B$17`, FMT.usdM);
    formulaCell(d.getCell(12, first + i), `SUM(${L}8:${L}11)`, FMT.usdM, true);
    valueCell(d.getCell(14, first + i), i + 1, FMT.num0);
    formulaCell(d.getCell(15, first + i), `1/(1+${A}!$B$27)^${L}14`, FMT.num2);
    formulaCell(d.getCell(16, first + i), `${L}12*${L}15`, FMT.usdM);
  }

  sectionLabel(d, 18, "Valuation bridge");
  labelCell(d.getCell(19, 1), "Sum of PV of FCF");
  formulaCell(d.getCell(19, 2), `SUM(C16:${lastL}16)`, FMT.usdM);
  labelCell(d.getCell(20, 1), "Terminal value (Gordon growth)");
  formulaCell(
    d.getCell(20, 2),
    `${lastL}12*(1+${A}!$B$30)/(${A}!$B$27-${A}!$B$30)`,
    FMT.usdM
  );
  labelCell(d.getCell(21, 1), "PV of terminal value");
  formulaCell(d.getCell(21, 2), `B20*${lastL}15`, FMT.usdM);
  labelCell(d.getCell(22, 1), "Enterprise value", { bold: true });
  formulaCell(d.getCell(22, 2), "B19+B21", FMT.usdM, true);
  labelCell(d.getCell(23, 1), "Less: net debt");
  formulaCell(d.getCell(23, 2), `-${A}!$B$7`, FMT.usdM);
  labelCell(d.getCell(24, 1), "Equity value", { bold: true });
  formulaCell(d.getCell(24, 2), "B22+B23", FMT.usdM, true);
  labelCell(d.getCell(25, 1), "Diluted shares");
  formulaCell(d.getCell(25, 2), `${A}!$B$6`, FMT.num0);
  labelCell(d.getCell(26, 1), "Implied share price", { bold: true });
  keyOutputCell(d.getCell(26, 2), "B24/B25", FMT.usd2);
  labelCell(d.getCell(27, 1), "Current share price");
  formulaCell(d.getCell(27, 2), `${A}!$B$5`, FMT.usd2);
  labelCell(d.getCell(28, 1), "Upside / (downside)", { bold: true });
  keyOutputCell(d.getCell(28, 2), "B26/B27-1", FMT.pct1);
  labelCell(d.getCell(29, 1), "Terminal value % of EV", { muted: true });
  formulaCell(d.getCell(29, 2), "B21/B22", FMT.pct0);
  noteCell(
    d.getCell(29, 3),
    "If this is above ~80%, your answer is mostly a terminal-assumptions story. Say so in your write-up."
  );

  // --- Sensitivity ------------------------------------------------------
  if (req.includeSensitivity !== false) {
    const s = wb.addWorksheet("Sensitivity");
    s.getColumn(1).width = 14;
    for (let i = 2; i <= 7; i++) s.getColumn(i).width = 13;
    sheetTitle(
      s,
      "Implied share price: WACC × terminal growth",
      "Rows: WACC. Columns: terminal growth. Errors where WACC ≤ growth are mathematically meaningless combinations, not bugs."
    );

    // Column headers: terminal growth offsets around the base assumption.
    const gOffsets = [-0.01, -0.005, 0, 0.005, 0.01];
    const wOffsets = [0.01, 0.005, 0, -0.005, -0.01];
    headerCell(s.getCell(4, 1), "WACC \\ g");
    gOffsets.forEach((g, j) => {
      formulaCell(s.getCell(4, 2 + j), `${A}!$B$30${g >= 0 ? "+" : ""}${g}`, FMT.pct1, true);
    });
    wOffsets.forEach((w, i) => {
      const r = 5 + i;
      formulaCell(s.getCell(r, 1), `${A}!$B$27${w >= 0 ? "+" : ""}${w}`, FMT.pct1, true);
      gOffsets.forEach((_, j) => {
        const wRef = `$A${r}`;
        const gRef = `${col(2 + j)}$4`;
        const formula =
          `(SUMPRODUCT(DCF!$C$12:$${lastL}$12,1/(1+${wRef})^DCF!$C$14:$${lastL}$14)` +
          `+DCF!$${lastL}$12*(1+${gRef})/(${wRef}-${gRef})/(1+${wRef})^${years}` +
          `-${A}!$B$7)/${A}!$B$6`;
        formulaCell(s.getCell(r, 2 + j), formula, FMT.usd2);
      });
    });
    noteCell(
      s.getCell(11, 1),
      "Each cell fully recomputes the model at that WACC/growth pair, using the same projected cash flows. The honest output of a DCF is this range, not any single number."
    );
    s.mergeCells(11, 1, 11, 6);
  }

  addSourcesSheet(wb, p.sources);
  return wb;
}

// ---------------------------------------------------------------------------
// FIG dividend-discount variant
// ---------------------------------------------------------------------------

function buildDdm(req: TemplateRequest, p: CompanyPrefill): ExcelJS.Workbook {
  const wb = makeWorkbook();
  const sector = getSectorGuidance(req.sector);
  const years = req.forecastYears ?? 5;
  const f = p.fundamentals;

  addGuidanceSheet(wb, {
    templateName: "Dividend Discount Model (FIG variant of the DCF)",
    sector,
    howToUse: [
      "1. This is the FIG version: banks and insurers are valued on the equity directly, project earnings per share, apply a payout ratio, discount the dividend stream at the cost of equity. There is no WACC and no enterprise value here on purpose (see the sector guidance below).",
      "2. Assumptions sheet: earnings growth fades linearly from your year-1 rate to your final-year rate; the payout ratio holds at the level you set.",
      "3. Model sheet: implied share price = PV of projected dividends + PV of a Gordon-growth terminal value. Cross-check the implied price-to-book against the bank's ROE. A bank earning above its cost of equity should trade above book.",
      req.includeSensitivity !== false
        ? "4. Sensitivity sheet: implied price across cost-of-equity × terminal-growth. Errors where Ke ≤ growth are meaningless combinations, not bugs."
        : "4. (Sensitivity grid not included in this download.)",
    ],
  });

  const ws = wb.addWorksheet(A);
  ws.getColumn(1).width = 40;
  ws.getColumn(2).width = 16;
  ws.getColumn(3).width = 90;
  sheetTitle(
    ws,
    p.ticker ? `Assumptions: ${p.companyName} (${p.ticker})` : "Assumptions",
    "Blue cells are yours to change. Blank blue cells had no real data available: enter your own."
  );

  sectionLabel(ws, 4, "Company");
  labelCell(ws.getCell(5, 1), "Share price (USD, per ordinary share)");
  inputCell(ws.getCell(5, 2), p.usdSharePrice, FMT.usd2);
  labelCell(ws.getCell(6, 1), "Diluted shares outstanding");
  inputCell(ws.getCell(6, 2), f?.sharesOutstandingDiluted ?? f?.sharesOutstanding ?? null, FMT.num0);
  labelCell(ws.getCell(7, 1), `Base-year net income (FY${f?.fiscalYear ?? "—"}, actual)`);
  inputCell(ws.getCell(7, 2), f?.netIncome ?? null, FMT.usdM);
  labelCell(ws.getCell(8, 1), "Book equity (for the P/B cross-check)");
  inputCell(ws.getCell(8, 2), f?.stockholdersEquity ?? null, FMT.usdM);

  sectionLabel(ws, 10, "Earnings & payout");
  const niCagr = f ? historyCagr(f.netIncomeHistory) : null;
  labelCell(ws.getCell(11, 1), "Earnings growth: year 1");
  inputCell(ws.getCell(11, 2), niCagr, FMT.pct1);
  noteCell(
    ws.getCell(11, 3),
    niCagr !== null
      ? "Prefilled with the multi-year net-income CAGR from the company's own filings, bank earnings are cyclical, so treat with care."
      : "No earnings history available. Enter your own researched growth assumption."
  );
  labelCell(ws.getCell(12, 1), `Earnings growth: year ${years} (fade target)`);
  inputCell(ws.getCell(12, 2), 0.025, FMT.pct1);
  const payout =
    f?.dividendsPaid != null && f?.netIncome ? Math.min(f.dividendsPaid / f.netIncome, 1) : null;
  labelCell(ws.getCell(13, 1), "Dividend payout ratio");
  inputCell(ws.getCell(13, 2), payout, FMT.pct1);
  noteCell(
    ws.getCell(13, 3),
    payout !== null
      ? "Prefilled from the latest filed dividends ÷ net income. Regulatory capital constrains what a bank can really pay out. Treat this as the model's main lever."
      : "No dividend data available. Enter the bank's actual payout ratio from its filings."
  );

  sectionLabel(ws, 15, "Cost of equity (CAPM)");
  labelCell(ws.getCell(16, 1), "Risk-free rate (10-yr govt yield)");
  inputCell(ws.getCell(16, 2), 0.04, FMT.pct1);
  noteCell(ws.getCell(16, 3), "Convention default: look up today's actual 10-year yield and replace.");
  labelCell(ws.getCell(17, 1), "Equity risk premium");
  inputCell(ws.getCell(17, 2), 0.05, FMT.pct1);
  labelCell(ws.getCell(18, 1), "Beta");
  inputCell(ws.getCell(18, 2), p.beta ?? 1.0, FMT.num2);
  noteCell(
    ws.getCell(18, 3),
    p.beta !== null
      ? "Real: regressed by Bloombruh from 1 year of daily returns vs. SPY."
      : "No computed beta. 1.00 = market average, a labeled convention. Replace with your own estimate."
  );
  labelCell(ws.getCell(19, 1), "Cost of equity", { bold: true });
  formulaCell(ws.getCell(19, 2), "B16+B18*B17", FMT.pct1, true);

  sectionLabel(ws, 21, "Terminal value");
  labelCell(ws.getCell(22, 1), "Terminal dividend growth");
  inputCell(ws.getCell(22, 2), 0.02, FMT.pct1);

  // --- Model sheet ------------------------------------------------------
  const d = wb.addWorksheet("DDM");
  modelColumns(d, years);
  sheetTitle(d, "Dividend discount model", "Per-share throughout, in USD.");

  const first = 3;
  const last = first + years - 1;
  const lastL = col(last);

  headerCell(d.getCell(4, 1), "Line");
  valueCell(d.getCell(4, 2), f?.fiscalYear ? `FY${f.fiscalYear}A` : "Base yr", undefined, true);
  for (let i = 0; i < years; i++) {
    headerCell(d.getCell(4, first + i), f?.fiscalYear ? `FY${f.fiscalYear + i + 1}E` : `Yr ${i + 1}E`);
  }

  labelCell(d.getCell(5, 1), "Earnings growth", { muted: true });
  formulaCell(d.getCell(5, first), `${A}!$B$11`, FMT.pct1);
  for (let i = 1; i < years; i++) {
    formulaCell(
      d.getCell(5, first + i),
      `${A}!$B$11+(${A}!$B$12-${A}!$B$11)*${i}/${years - 1}`,
      FMT.pct1
    );
  }

  labelCell(d.getCell(6, 1), "EPS", { bold: true });
  formulaCell(d.getCell(6, 2), `${A}!$B$7/${A}!$B$6`, FMT.usd2);
  labelCell(d.getCell(7, 1), "Dividend per share (EPS × payout)");
  labelCell(d.getCell(9, 1), "Discount period", { muted: true });
  labelCell(d.getCell(10, 1), "Discount factor", { muted: true });
  labelCell(d.getCell(11, 1), "PV of dividend");
  for (let i = 0; i < years; i++) {
    const L = col(first + i);
    formulaCell(d.getCell(6, first + i), `${col(first + i - 1)}6*(1+${L}5)`, FMT.usd2);
    formulaCell(d.getCell(7, first + i), `${L}6*${A}!$B$13`, FMT.usd2);
    valueCell(d.getCell(9, first + i), i + 1, FMT.num0);
    formulaCell(d.getCell(10, first + i), `1/(1+${A}!$B$19)^${L}9`, FMT.num2);
    formulaCell(d.getCell(11, first + i), `${L}7*${L}10`, FMT.usd2);
  }

  sectionLabel(d, 13, "Valuation");
  labelCell(d.getCell(14, 1), "Sum of PV of dividends");
  formulaCell(d.getCell(14, 2), `SUM(C11:${lastL}11)`, FMT.usd2);
  labelCell(d.getCell(15, 1), "Terminal value (Gordon growth)");
  formulaCell(d.getCell(15, 2), `${lastL}7*(1+${A}!$B$22)/(${A}!$B$19-${A}!$B$22)`, FMT.usd2);
  labelCell(d.getCell(16, 1), "PV of terminal value");
  formulaCell(d.getCell(16, 2), `B15*${lastL}10`, FMT.usd2);
  labelCell(d.getCell(17, 1), "Implied share price", { bold: true });
  keyOutputCell(d.getCell(17, 2), "B14+B16", FMT.usd2);
  labelCell(d.getCell(18, 1), "Current share price");
  formulaCell(d.getCell(18, 2), `${A}!$B$5`, FMT.usd2);
  labelCell(d.getCell(19, 1), "Upside / (downside)", { bold: true });
  keyOutputCell(d.getCell(19, 2), "B17/B18-1", FMT.pct1);

  sectionLabel(d, 21, "Cross-check");
  labelCell(d.getCell(22, 1), "Implied price-to-book");
  formulaCell(d.getCell(22, 2), `B17*${A}!$B$6/${A}!$B$8`, FMT.x1);
  labelCell(d.getCell(23, 1), "Base-year ROE");
  formulaCell(d.getCell(23, 2), `${A}!$B$7/${A}!$B$8`, FMT.pct1);
  noteCell(
    d.getCell(24, 1),
    "Sanity check: a bank earning ROE above its cost of equity should trade above book (P/B > 1), and below book if not. If your implied P/B and the ROE tell different stories, revisit your assumptions."
  );
  d.mergeCells(24, 1, 24, 5);

  if (req.includeSensitivity !== false) {
    const s = wb.addWorksheet("Sensitivity");
    s.getColumn(1).width = 14;
    for (let i = 2; i <= 7; i++) s.getColumn(i).width = 13;
    sheetTitle(
      s,
      "Implied share price: cost of equity × terminal growth",
      "Rows: cost of equity. Columns: terminal growth."
    );
    const gOffsets = [-0.01, -0.005, 0, 0.005, 0.01];
    const kOffsets = [0.01, 0.005, 0, -0.005, -0.01];
    headerCell(s.getCell(4, 1), "Ke \\ g");
    gOffsets.forEach((g, j) => {
      formulaCell(s.getCell(4, 2 + j), `${A}!$B$22${g >= 0 ? "+" : ""}${g}`, FMT.pct1, true);
    });
    kOffsets.forEach((k, i) => {
      const r = 5 + i;
      formulaCell(s.getCell(r, 1), `${A}!$B$19${k >= 0 ? "+" : ""}${k}`, FMT.pct1, true);
      gOffsets.forEach((_, j) => {
        const kRef = `$A${r}`;
        const gRef = `${col(2 + j)}$4`;
        const formula =
          `SUMPRODUCT(DDM!$C$7:$${lastL}$7,1/(1+${kRef})^DDM!$C$9:$${lastL}$9)` +
          `+DDM!$${lastL}$7*(1+${gRef})/(${kRef}-${gRef})/(1+${kRef})^${years}`;
        formulaCell(s.getCell(r, 2 + j), formula, FMT.usd2);
      });
    });
  }

  addSourcesSheet(wb, p.sources);
  return wb;
}
