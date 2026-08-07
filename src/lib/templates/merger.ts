// The M&A Accretion/Dilution template: acquirer buys target — does the
// combined company earn more or less per acquirer share than before? The
// deal is funded by a mix of cash on hand (which stops earning interest),
// new debt (which starts costing interest), and new shares (which dilute).
// Both companies prefill with real data when tickers are chosen; the
// classic caveat — accretion ≠ value creation — is stated on the guidance
// sheet, not buried.

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
  inputCell,
  formulaCell,
  labelCell,
  keyOutputCell,
  noteCell,
  FMT,
} from "./excelHelpers";

export function buildMergerWorkbook(
  req: TemplateRequest,
  acquirer: CompanyPrefill,
  target: CompanyPrefill
): ExcelJS.Workbook {
  const wb = makeWorkbook();
  const sector = getSectorGuidance(req.sector);
  const withSynergies = req.includeSynergies !== false;

  addGuidanceSheet(wb, {
    templateName: "M&A Accretion / Dilution Model",
    sector,
    howToUse: [
      "1. Two companies: the acquirer (whose shareholders we care about) and the target (being bought at a premium to its market price). Prefill both by choosing tickers at download, or type the inputs yourself.",
      "2. Financing mix is the heart of the model: cash on hand gives up the interest it was earning, new debt adds interest cost, new stock adds shares. The three percentages must sum to 100%. The model checks.",
      "3. The key output is pro-forma EPS vs. the acquirer's standalone EPS. Accretive means the combined company earns more per acquirer share; dilutive means less.",
      "4. The classic trap, stated plainly: accretion is arithmetic, not value creation. Overpaying with cheap debt can still look 'accretive'. Whether the deal creates value depends on what the target is actually worth and whether synergies are real. Never present accretion alone as the answer.",
      withSynergies
        ? "5. Synergies default to zero: a deliberate discipline. Enter a number you can defend (cost synergies are bankable; revenue synergies mostly are not) and note they are taxed like any other profit."
        : "5. (Synergies block not included in this download. Re-download with it enabled to model them.)",
    ],
  });

  const fA = acquirer.fundamentals;
  const fT = target.fundamentals;
  const ws = wb.addWorksheet("Model");
  ws.getColumn(1).width = 44;
  ws.getColumn(2).width = 16;
  ws.getColumn(3).width = 90;
  sheetTitle(
    ws,
    acquirer.ticker || target.ticker
      ? `${acquirer.companyName || "Acquirer"} acquires ${target.companyName || "Target"}`
      : "M&A accretion / dilution",
    "Blue cells are yours to change. Blank blue cells had no real data available: enter your own."
  );

  sectionLabel(ws, 4, "Acquirer");
  labelCell(ws.getCell(5, 1), `Share price (USD)${acquirer.ticker ? ` (${acquirer.ticker})` : ""}`);
  inputCell(ws.getCell(5, 2), acquirer.usdSharePrice, FMT.usd2);
  labelCell(ws.getCell(6, 1), "Diluted shares outstanding");
  inputCell(ws.getCell(6, 2), fA?.sharesOutstandingDiluted ?? fA?.sharesOutstanding ?? null, FMT.num0);
  labelCell(ws.getCell(7, 1), `Net income (FY${fA?.fiscalYear ?? "—"})`);
  inputCell(ws.getCell(7, 2), fA?.netIncome ?? null, FMT.usdM);
  labelCell(ws.getCell(8, 1), "Standalone EPS", { bold: true });
  formulaCell(ws.getCell(8, 2), "B7/B6", FMT.usd2, true);

  sectionLabel(ws, 10, "Target");
  labelCell(ws.getCell(11, 1), `Share price (USD)${target.ticker ? ` (${target.ticker})` : ""}`);
  inputCell(ws.getCell(11, 2), target.usdSharePrice, FMT.usd2);
  labelCell(ws.getCell(12, 1), "Diluted shares outstanding");
  inputCell(ws.getCell(12, 2), fT?.sharesOutstandingDiluted ?? fT?.sharesOutstanding ?? null, FMT.num0);
  labelCell(ws.getCell(13, 1), `Net income (FY${fT?.fiscalYear ?? "—"})`);
  inputCell(ws.getCell(13, 2), fT?.netIncome ?? null, FMT.usdM);

  sectionLabel(ws, 15, "The offer");
  labelCell(ws.getCell(16, 1), "Offer premium (over target's price)");
  inputCell(ws.getCell(16, 2), 0.25, FMT.pct0);
  noteCell(ws.getCell(16, 3), "~20–40% is the historical norm for control premia. The premium is what makes overpaying easy.");
  labelCell(ws.getCell(17, 1), "Offer price per target share", { bold: true });
  formulaCell(ws.getCell(17, 2), "B11*(1+B16)", FMT.usd2, true);
  labelCell(ws.getCell(18, 1), "Equity purchase price", { bold: true });
  formulaCell(ws.getCell(18, 2), "B17*B12", FMT.usdM, true);

  sectionLabel(ws, 20, "Financing mix (must sum to 100%)");
  labelCell(ws.getCell(21, 1), "% funded with cash on hand");
  inputCell(ws.getCell(21, 2), 0.3, FMT.pct0);
  labelCell(ws.getCell(22, 1), "% funded with new debt");
  inputCell(ws.getCell(22, 2), 0.4, FMT.pct0);
  labelCell(ws.getCell(23, 1), "% funded with new stock");
  inputCell(ws.getCell(23, 2), 0.3, FMT.pct0);
  labelCell(ws.getCell(24, 1), "Check: total");
  formulaCell(ws.getCell(24, 2), 'IF(B21+B22+B23=1,"OK ✓","≠100%: fix the mix")', undefined, true);
  labelCell(ws.getCell(25, 1), "Interest rate on new debt");
  inputCell(ws.getCell(25, 2), 0.06, FMT.pct1);
  labelCell(ws.getCell(26, 1), "Yield lost on cash used");
  inputCell(ws.getCell(26, 2), 0.04, FMT.pct1);
  noteCell(ws.getCell(26, 3), "Cash spent on the deal was earning something. That foregone interest is a real cost of the cash-funded slice.");
  labelCell(ws.getCell(27, 1), "Tax rate");
  inputCell(ws.getCell(27, 2), 0.21, FMT.pct1);

  let row = 29;
  if (withSynergies) {
    sectionLabel(ws, row, "Synergies");
    labelCell(ws.getCell(row + 1, 1), "Pre-tax annual synergies");
    inputCell(ws.getCell(row + 1, 2), 0, FMT.usdM);
    noteCell(
      ws.getCell(row + 1, 3),
      "Deliberately zero by default. Enter only what you can defend. Cost synergies (overlap you can actually cut) are bankable; revenue synergies usually are not."
    );
    row += 3;
  }
  const synRef = withSynergies ? "B30" : "0";

  sectionLabel(ws, row, "Pro-forma");
  const r0 = row + 1;
  labelCell(ws.getCell(r0, 1), "New shares issued");
  formulaCell(ws.getCell(r0, 2), "B18*B23/B5", FMT.num0);
  labelCell(ws.getCell(r0 + 1, 1), "New debt raised");
  formulaCell(ws.getCell(r0 + 1, 2), "B18*B22", FMT.usdM);
  labelCell(ws.getCell(r0 + 2, 1), "Cash used");
  formulaCell(ws.getCell(r0 + 2, 2), "B18*B21", FMT.usdM);
  labelCell(ws.getCell(r0 + 3, 1), "After-tax cost of new debt interest");
  formulaCell(ws.getCell(r0 + 3, 2), `B${r0 + 1}*B25*(1-B27)`, FMT.usdM);
  labelCell(ws.getCell(r0 + 4, 1), "After-tax foregone interest on cash");
  formulaCell(ws.getCell(r0 + 4, 2), `B${r0 + 2}*B26*(1-B27)`, FMT.usdM);
  labelCell(ws.getCell(r0 + 5, 1), "After-tax synergies");
  formulaCell(ws.getCell(r0 + 5, 2), `${synRef}*(1-B27)`, FMT.usdM);
  labelCell(ws.getCell(r0 + 6, 1), "Pro-forma net income", { bold: true });
  formulaCell(ws.getCell(r0 + 6, 2), `B7+B13+B${r0 + 5}-B${r0 + 3}-B${r0 + 4}`, FMT.usdM, true);
  labelCell(ws.getCell(r0 + 7, 1), "Pro-forma shares", { bold: true });
  formulaCell(ws.getCell(r0 + 7, 2), `B6+B${r0}`, FMT.num0, true);
  labelCell(ws.getCell(r0 + 8, 1), "Pro-forma EPS", { bold: true });
  keyOutputCell(ws.getCell(r0 + 8, 2), `B${r0 + 6}/B${r0 + 7}`, FMT.usd2);
  labelCell(ws.getCell(r0 + 9, 1), "Accretion / (dilution)", { bold: true });
  keyOutputCell(ws.getCell(r0 + 9, 2), `B${r0 + 8}/B8-1`, FMT.pct1);
  noteCell(
    ws.getCell(r0 + 10, 1),
    "Positive = accretive, negative = dilutive: to the acquirer's EPS, at these financing assumptions. It says nothing by itself about whether the price paid was right."
  );
  ws.mergeCells(r0 + 10, 1, r0 + 10, 3);

  // Merge both companies' source lines, labeled per side.
  const sources = [
    ...acquirer.sources.map((s) => ({ ...s, item: `Acquirer: ${s.item}` })),
    ...target.sources.map((s) => ({ ...s, item: `Target: ${s.item}` })),
  ];
  addSourcesSheet(wb, sources);
  return wb;
}
