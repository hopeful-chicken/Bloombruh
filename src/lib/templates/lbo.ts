// The LBO Model template: buy a company with mostly debt, pay the debt
// down from the business's own cash flow, sell at the end — what did the
// sponsor's equity make? A real year-by-year debt schedule (not the flat
// simplification the site's on-page LBO block uses), with MOIC and IRR as
// the key outputs. One documented simplification: cash available for debt
// paydown is modeled as a % of EBITDA after tax and capex ("FCF
// conversion") rather than a full three-statement build — standard for a
// first LBO model, and stated plainly on the guidance sheet.

import type ExcelJS from "exceljs";
import type { TemplateRequest } from "./types";
import { getSectorGuidance } from "./sectorGuidance";
import type { CompanyPrefill } from "./prefill";
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

function col(n: number): string {
  return String.fromCharCode(64 + n);
}

const A = "Assumptions";

export function buildLboWorkbook(req: TemplateRequest, p: CompanyPrefill): ExcelJS.Workbook {
  const wb = makeWorkbook();
  const sector = getSectorGuidance(req.sector);
  const years = req.holdYears ?? 5;

  addGuidanceSheet(wb, {
    templateName: "LBO Model",
    sector,
    howToUse: [
      "1. The deal: buy the company at an entry EV/EBITDA multiple, funding most of the price with debt. The sponsor's return comes from three sources: EBITDA growth, debt paydown, and any change in the exit multiple. This model shows all three.",
      "2. Assumptions sheet: entry and exit multiples, leverage, the interest rate, EBITDA growth, and FCF conversion (the % of EBITDA left for debt paydown after tax and capex, a documented simplification standing in for a full three-statement build).",
      "3. Model sheet: the debt schedule pays down year by year from real formulas; the returns block computes exit equity, MOIC, and IRR. Exit multiple defaults to entry (flat). That is discipline, not pessimism: underwriting multiple expansion means betting someone will pay more per dollar of earnings than you did.",
      "4. A quick read on the output: sponsors typically target ~20%+ IRR / ~2x+ MOIC over 5 years. If your assumptions cannot get there, the deal does not work at that price. That is the model telling you something real.",
    ],
  });

  const f = p.fundamentals;
  const ws = wb.addWorksheet(A);
  ws.getColumn(1).width = 42;
  ws.getColumn(2).width = 16;
  ws.getColumn(3).width = 90;
  sheetTitle(
    ws,
    p.ticker ? `Assumptions: ${p.companyName} (${p.ticker})` : "Assumptions",
    "Blue cells are yours to change. Blank blue cells had no real data available: enter your own."
  );

  sectionLabel(ws, 4, "Entry");
  labelCell(ws.getCell(5, 1), `LTM EBITDA (FY${f?.fiscalYear ?? "—"}, op. income + D&A)`);
  inputCell(ws.getCell(5, 2), p.ebitda, FMT.usdM);
  noteCell(
    ws.getCell(5, 3),
    p.ebitda !== null
      ? "Prefilled from the company's own filings (operating income + D&A, an estimate, since EBITDA is not a filed line)."
      : "No EBITDA data available. Enter your own from the company's filings."
  );
  const realMultiple = p.valuation?.evToEbitda ?? null;
  labelCell(ws.getCell(6, 1), "Entry EV / EBITDA multiple");
  inputCell(ws.getCell(6, 2), realMultiple !== null ? Math.round(realMultiple * 10) / 10 : 10, FMT.x1);
  noteCell(
    ws.getCell(6, 3),
    realMultiple !== null
      ? "Prefilled with the multiple the market currently pays for this company. A real LBO would need a premium above this."
      : "No market multiple available. 10.0x is a placeholder convention; anchor to real comparable deals."
  );
  labelCell(ws.getCell(7, 1), "Entry enterprise value", { bold: true });
  formulaCell(ws.getCell(7, 2), "B5*B6", FMT.usdM, true);
  labelCell(ws.getCell(8, 1), "Debt (% of purchase price)");
  inputCell(ws.getCell(8, 2), 0.6, FMT.pct0);
  noteCell(ws.getCell(8, 3), "The lever in 'leveraged buyout'. ~50–70% is the classic range; lenders cap it off EBITDA in practice.");
  labelCell(ws.getCell(9, 1), "Debt at entry", { bold: true });
  formulaCell(ws.getCell(9, 2), "B7*B8", FMT.usdM, true);
  labelCell(ws.getCell(10, 1), "Sponsor equity at entry", { bold: true });
  formulaCell(ws.getCell(10, 2), "B7-B9", FMT.usdM, true);

  sectionLabel(ws, 12, "Operating & financing");
  const ebitdaGrowth =
    p.valuation?.ebitdaGrowthPct != null ? p.valuation.ebitdaGrowthPct / 100 : null;
  labelCell(ws.getCell(13, 1), "EBITDA growth (per year)");
  inputCell(ws.getCell(13, 2), ebitdaGrowth ?? 0.05, FMT.pct1);
  noteCell(
    ws.getCell(13, 3),
    ebitdaGrowth !== null
      ? "Prefilled with the company's own latest year-over-year EBITDA growth: one data point, not a trend. Make it defensible."
      : "No EBITDA history available. 5%/yr is a placeholder convention; research the company's real trajectory."
  );
  labelCell(ws.getCell(14, 1), "Interest rate on debt");
  inputCell(ws.getCell(14, 2), 0.08, FMT.pct1);
  noteCell(ws.getCell(14, 3), "Placeholder convention: leveraged-loan pricing moves with base rates and credit quality; check current market levels.");
  labelCell(ws.getCell(15, 1), "FCF conversion (% of EBITDA after tax & capex)");
  inputCell(ws.getCell(15, 2), 0.4, FMT.pct0);
  noteCell(
    ws.getCell(15, 3),
    "The documented simplification: cash available for debt paydown before interest, as a % of EBITDA. A capex-light business converts more; capital-intensive ones much less."
  );

  sectionLabel(ws, 17, "Exit");
  labelCell(ws.getCell(18, 1), "Holding period (years)");
  valueCell(ws.getCell(18, 2), years, FMT.num0, true);
  noteCell(ws.getCell(18, 3), "Chosen at download. Re-download the template to change it (the model columns are built for this length).");
  labelCell(ws.getCell(19, 1), "Exit EV / EBITDA multiple");
  formulaCell(ws.getCell(19, 2), "B6", FMT.x1);
  noteCell(
    ws.getCell(19, 3),
    "Defaults to the entry multiple (flat exit, the disciplined base case). Overwrite with a number to test multiple expansion or compression."
  );

  // --- Model sheet ------------------------------------------------------
  const d = wb.addWorksheet("Model");
  modelColumns(d, years);
  sheetTitle(d, "Debt schedule & returns", "Values in USD.");

  const first = 3;
  const last = first + years - 1;
  const lastL = col(last);

  headerCell(d.getCell(4, 1), "Line");
  valueCell(d.getCell(4, 2), "Entry", undefined, true);
  for (let i = 0; i < years; i++) headerCell(d.getCell(4, first + i), `Year ${i + 1}`);

  labelCell(d.getCell(5, 1), "EBITDA", { bold: true });
  formulaCell(d.getCell(5, 2), `${A}!$B$5`, FMT.usdM);
  labelCell(d.getCell(6, 1), "Debt, start of year");
  labelCell(d.getCell(7, 1), "Interest expense");
  labelCell(d.getCell(8, 1), "Cash available for paydown");
  labelCell(d.getCell(9, 1), "Debt paydown");
  labelCell(d.getCell(10, 1), "Debt, end of year", { bold: true });
  formulaCell(d.getCell(10, 2), `${A}!$B$9`, FMT.usdM, true);

  for (let i = 0; i < years; i++) {
    const L = col(first + i);
    const prevL = col(first + i - 1);
    formulaCell(d.getCell(5, first + i), `${prevL}5*(1+${A}!$B$13)`, FMT.usdM);
    formulaCell(d.getCell(6, first + i), `${prevL}10`, FMT.usdM);
    formulaCell(d.getCell(7, first + i), `${L}6*${A}!$B$14`, FMT.usdM);
    formulaCell(d.getCell(8, first + i), `${L}5*${A}!$B$15-${L}7`, FMT.usdM);
    // Paydown can't exceed remaining debt, and a cash shortfall (negative
    // line 8) pays down nothing rather than magically borrowing more.
    formulaCell(d.getCell(9, first + i), `MIN(MAX(${L}8,0),${L}6)`, FMT.usdM);
    formulaCell(d.getCell(10, first + i), `${L}6-${L}9`, FMT.usdM, true);
  }
  noteCell(
    d.getCell(11, 1),
    "If 'cash available' goes negative, the company cannot cover its interest from operations at these assumptions. In reality that is distress, and here it simply stops paying debt down."
  );
  d.mergeCells(11, 1, 11, years + 2);

  sectionLabel(d, 13, "Exit & returns");
  labelCell(d.getCell(14, 1), `Exit EBITDA (year ${years})`);
  formulaCell(d.getCell(14, 2), `${lastL}5`, FMT.usdM);
  labelCell(d.getCell(15, 1), "Exit enterprise value");
  formulaCell(d.getCell(15, 2), `B14*${A}!$B$19`, FMT.usdM);
  labelCell(d.getCell(16, 1), "Less: remaining debt");
  formulaCell(d.getCell(16, 2), `-${lastL}10`, FMT.usdM);
  labelCell(d.getCell(17, 1), "Equity proceeds at exit", { bold: true });
  formulaCell(d.getCell(17, 2), "B15+B16", FMT.usdM, true);
  labelCell(d.getCell(18, 1), "Sponsor equity at entry");
  formulaCell(d.getCell(18, 2), `${A}!$B$10`, FMT.usdM);
  labelCell(d.getCell(19, 1), "MOIC (multiple on invested capital)", { bold: true });
  keyOutputCell(d.getCell(19, 2), "B17/B18", FMT.x1);
  labelCell(d.getCell(20, 1), "IRR", { bold: true });
  keyOutputCell(d.getCell(20, 2), `(B17/B18)^(1/${years})-1`, FMT.pct1);
  noteCell(
    d.getCell(21, 1),
    "IRR here is the simple compound rate from one cash flow in (entry) to one out (exit). Real deals with interim dividends need a full XIRR."
  );
  d.mergeCells(21, 1, 21, years + 2);

  sectionLabel(d, 23, "Value creation bridge");
  labelCell(d.getCell(24, 1), "From EBITDA growth");
  formulaCell(d.getCell(24, 2), `(B14-${A}!$B$5)*${A}!$B$6`, FMT.usdM);
  labelCell(d.getCell(25, 1), "From multiple change");
  formulaCell(d.getCell(25, 2), `(${A}!$B$19-${A}!$B$6)*B14`, FMT.usdM);
  labelCell(d.getCell(26, 1), "From debt paydown");
  formulaCell(d.getCell(26, 2), `${A}!$B$9-${lastL}10`, FMT.usdM);
  noteCell(
    d.getCell(27, 1),
    "The classic interview question: where did the return come from? Growth, multiple, or leverage. A deal that only works through multiple expansion is a bet on markets, not on the business."
  );
  d.mergeCells(27, 1, 27, years + 2);

  addSourcesSheet(wb, p.sources);
  return wb;
}
