// The Equity Research Initiation Note template — the structured skeleton
// of a real initiation, as a workbook: rating and target price up top (the
// implied-upside cell recalculates as you set your target), an investment
// thesis section, a valuation summary prefilled with the company's real
// multiples plus target-multiple cells that convert into implied prices,
// then catalysts and risks. The writing is the student's; the structure
// and the real starting numbers are the template's.

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
  FMT,
} from "./excelHelpers";

export function buildInitiationWorkbook(req: TemplateRequest, p: CompanyPrefill): ExcelJS.Workbook {
  const wb = makeWorkbook();
  const sector = getSectorGuidance(req.sector);
  const withValuation = req.includeValuationSummary !== false;
  const f = p.fundamentals;
  const v = p.valuation;

  addGuidanceSheet(wb, {
    templateName: "Equity Research Initiation Note",
    sector,
    howToUse: [
      "1. This is a writing skeleton with live numbers, not a calculator: the sections mirror how a real initiation is structured — rating and target first, then the thesis that earns it, then valuation, catalysts, and risks.",
      "2. Set your rating and 12-month target price in the header — the implied-upside cell computes against the real current price. A target without a thesis is a guess; write the thesis until the target feels inevitable.",
      "3. The thesis prompts are deliberate: what does the market believe, where exactly do you disagree, and what evidence would change your mind? If you can't fill the third one in, you have a position, not a thesis.",
      withValuation
        ? "4. Valuation summary: the company's real current multiples are prefilled; type your target multiples and the sheet converts them into implied share prices. Your target price should be explainable by at least one of them."
        : "4. (Valuation summary table not included in this download.)",
      "5. Catalysts need dates (an event that can't be scheduled is a hope); risks need your response (what would each one do to your target?).",
    ],
  });

  const ws = wb.addWorksheet("Initiation Note");
  ws.getColumn(1).width = 34;
  ws.getColumn(2).width = 18;
  ws.getColumn(3).width = 18;
  ws.getColumn(4).width = 70;
  sheetTitle(
    ws,
    p.ticker ? `${p.companyName} (${p.ticker}) — Initiation of Coverage` : "Initiation of Coverage",
    `Drafted ${new Date().toISOString().slice(0, 10)} — student research, built with Bloombruh. Not investment advice.`
  );

  sectionLabel(ws, 4, "Rating & target");
  labelCell(ws.getCell(5, 1), "Rating (Buy / Hold / Sell)");
  inputCell(ws.getCell(5, 2), null);
  labelCell(ws.getCell(6, 1), "12-month target price (USD)");
  inputCell(ws.getCell(6, 2), null, FMT.usd2);
  labelCell(ws.getCell(7, 1), "Current price");
  inputCell(ws.getCell(7, 2), p.usdSharePrice, FMT.usd2);
  labelCell(ws.getCell(8, 1), "Implied upside / (downside)", { bold: true });
  keyOutputCell(ws.getCell(8, 2), 'IF(B6="","",B6/B7-1)', FMT.pct1);
  noteCell(ws.getCell(8, 4), "Recomputes when you set a target. A Buy usually implies ~15%+ upside; a target within ±5% of spot is a Hold argument.");

  sectionLabel(ws, 10, "Company snapshot (real data)");
  const snapshot: [string, number | string | null, string | undefined][] = [
    ["Market cap", v?.marketCap ?? null, FMT.usdM],
    [`Revenue (FY${f?.fiscalYear ?? "—"})`, f?.revenue ?? null, FMT.usdM],
    ["Net income", f?.netIncome ?? null, FMT.usdM],
    ["P/E", v?.peRatio ?? null, FMT.x1],
    ["EV / EBITDA", v?.evToEbitda ?? null, FMT.x1],
    ["ROE", v?.roePct != null ? v.roePct / 100 : null, FMT.pct1],
  ];
  snapshot.forEach(([label, value, fmt], i) => {
    labelCell(ws.getCell(11 + i, 1), String(label));
    valueCell(ws.getCell(11 + i, 2), value, fmt);
  });
  noteCell(
    ws.getCell(11, 4),
    f
      ? "Prefilled from the company's real filings and current price — see the Data & Sources sheet."
      : "No filed fundamentals were available for this ticker — research and fill these in; nothing was estimated."
  );

  sectionLabel(ws, 18, "Investment thesis");
  const thesisPrompts = [
    "What does the market currently believe about this company?",
    "Where exactly do you disagree, and why are you right?",
    "What evidence would prove you wrong (and when would you know)?",
  ];
  thesisPrompts.forEach((prompt, i) => {
    const r = 19 + i * 2;
    labelCell(ws.getCell(r, 1), `${i + 1}. ${prompt}`, { bold: true });
    const cell = ws.getCell(r + 1, 1);
    inputCell(cell, null);
    ws.mergeCells(r + 1, 1, r + 1, 4);
    ws.getRow(r + 1).height = 44;
    cell.alignment = { wrapText: true, vertical: "top" };
    ws.mergeCells(r, 1, r, 4);
  });

  let row = 26;
  if (withValuation) {
    sectionLabel(ws, row, "Valuation summary");
    headerCell(ws.getCell(row + 1, 1), "Multiple");
    headerCell(ws.getCell(row + 1, 2), "Current (real)");
    headerCell(ws.getCell(row + 1, 3), "Your target");
    headerCell(ws.getCell(row + 1, 4), "Implied share price");

    const eps = f?.epsDiluted ?? null;
    labelCell(ws.getCell(row + 2, 1), "P/E × diluted EPS");
    valueCell(ws.getCell(row + 2, 2), v?.peRatio ?? null, FMT.x1);
    inputCell(ws.getCell(row + 2, 3), null, FMT.x1);
    formulaCell(
      ws.getCell(row + 2, 4),
      eps !== null ? `IF(C${row + 2}="","",C${row + 2}*${eps})` : `IF(C${row + 2}="","","enter EPS first")`,
      FMT.usd2
    );

    labelCell(ws.getCell(row + 3, 1), "P/B × book value per share");
    valueCell(ws.getCell(row + 3, 2), v?.priceToBook ?? null, FMT.x1);
    inputCell(ws.getCell(row + 3, 3), null, FMT.x1);
    const bvps =
      f?.stockholdersEquity != null && (f.sharesOutstandingDiluted ?? f.sharesOutstanding)
        ? f.stockholdersEquity / (f.sharesOutstandingDiluted ?? f.sharesOutstanding)!
        : null;
    formulaCell(
      ws.getCell(row + 3, 4),
      bvps !== null
        ? `IF(C${row + 3}="","",C${row + 3}*${bvps.toFixed(4)})`
        : `IF(C${row + 3}="","","enter book value first")`,
      FMT.usd2
    );

    labelCell(ws.getCell(row + 4, 1), "Your DCF / DDM output (paste here)");
    valueCell(ws.getCell(row + 4, 2), "—");
    inputCell(ws.getCell(row + 4, 3), null);
    inputCell(ws.getCell(row + 4, 4), null, FMT.usd2);
    noteCell(
      ws.getCell(row + 5, 1),
      "Triangulate: your target price should be explainable by at least one of these routes. Download the DCF template for the intrinsic-value leg."
    );
    ws.mergeCells(row + 5, 1, row + 5, 4);
    row += 7;
  }

  sectionLabel(ws, row, "Catalysts (dated)");
  headerCell(ws.getCell(row + 1, 1), "Catalyst");
  headerCell(ws.getCell(row + 1, 2), "Expected date");
  headerCell(ws.getCell(row + 1, 3), "Direction");
  headerCell(ws.getCell(row + 1, 4), "Why it moves the stock");
  for (let i = 0; i < 3; i++) {
    inputCell(ws.getCell(row + 2 + i, 1), null);
    inputCell(ws.getCell(row + 2 + i, 2), null);
    inputCell(ws.getCell(row + 2 + i, 3), null);
    inputCell(ws.getCell(row + 2 + i, 4), null);
  }
  row += 6;

  sectionLabel(ws, row, "Key risks");
  headerCell(ws.getCell(row + 1, 1), "Risk");
  headerCell(ws.getCell(row + 1, 2), "Likelihood");
  headerCell(ws.getCell(row + 1, 3), "Impact on target");
  headerCell(ws.getCell(row + 1, 4), "Your mitigant / monitoring plan");
  for (let i = 0; i < 3; i++) {
    inputCell(ws.getCell(row + 2 + i, 1), null);
    inputCell(ws.getCell(row + 2 + i, 2), null);
    inputCell(ws.getCell(row + 2 + i, 3), null);
    inputCell(ws.getCell(row + 2 + i, 4), null);
  }

  addSourcesSheet(wb, p.sources);
  return wb;
}
