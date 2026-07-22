// The Asset Management Portfolio One-Pager: a holdings sheet where value,
// weight, and concentration stats compute themselves as positions are
// typed in — the living one-page summary an AM analyst keeps current. If a
// ticker was chosen at download, it seeds the first row with the real name
// and price; everything else is the student's portfolio to build.

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
  labelCell,
  keyOutputCell,
  noteCell,
  FMT,
} from "./excelHelpers";

export function buildPortfolioWorkbook(req: TemplateRequest, p: CompanyPrefill): ExcelJS.Workbook {
  const wb = makeWorkbook();
  const sector = getSectorGuidance(req.sector);
  const rows = req.holdingRows ?? 20;

  addGuidanceSheet(wb, {
    templateName: "Portfolio One-Pager",
    sector,
    howToUse: [
      "1. Type positions into the blue cells — ticker, name, shares, price. Value, weight, and the summary stats recalculate as you go. Keep prices current by hand (or via your own data source): this is a snapshot sheet, not a live feed.",
      "2. The cash row matters: cash is a position with a weight, and 'fully invested vs. holding dry powder' is a real portfolio decision, not an afterthought.",
      "3. Watch the concentration stats: the top-5 weight tells you how much of the portfolio's fate sits in its five biggest ideas. There's no right number — but you should know yours and be able to defend it.",
      "4. The thesis column is the discipline: one line per holding on why you own it. If you can't fill it in, that's the sheet telling you something.",
    ],
  });

  const ws = wb.addWorksheet("Portfolio");
  ws.getColumn(1).width = 12;
  ws.getColumn(2).width = 30;
  ws.getColumn(3).width = 12;
  ws.getColumn(4).width = 12;
  ws.getColumn(5).width = 14;
  ws.getColumn(6).width = 10;
  ws.getColumn(7).width = 52;
  sheetTitle(ws, "Portfolio one-pager", `As of ${new Date().toISOString().slice(0, 10)} — update prices by hand to keep it current.`);

  const headRow = 4;
  ["Ticker", "Name", "Shares", "Price", "Value", "Weight", "Why we own it (one line)"].forEach(
    (h, i) => headerCell(ws.getCell(headRow, 1 + i), h)
  );

  const firstData = headRow + 1;
  const lastData = headRow + rows;
  const cashRow = lastData + 1;
  const totalRow = cashRow + 1;

  for (let r = firstData; r <= lastData; r++) {
    const seedFirst = r === firstData && p.ticker;
    inputCell(ws.getCell(r, 1), seedFirst ? p.ticker : null);
    inputCell(ws.getCell(r, 2), seedFirst ? p.companyName : null);
    inputCell(ws.getCell(r, 3), null, FMT.num0);
    inputCell(ws.getCell(r, 4), seedFirst ? p.usdSharePrice : null, FMT.usd2);
    formulaCell(ws.getCell(r, 5), `IF(OR(C${r}="",D${r}=""),"",C${r}*D${r})`, FMT.usd0);
    formulaCell(ws.getCell(r, 6), `IF(E${r}="","",E${r}/$E$${totalRow})`, FMT.pct1);
    inputCell(ws.getCell(r, 7), null);
  }

  labelCell(ws.getCell(cashRow, 2), "Cash", { bold: true });
  inputCell(ws.getCell(cashRow, 5), null, FMT.usd0);
  formulaCell(ws.getCell(cashRow, 6), `IF(E${cashRow}="","",E${cashRow}/$E$${totalRow})`, FMT.pct1);

  labelCell(ws.getCell(totalRow, 2), "Total portfolio value", { bold: true });
  keyOutputCell(ws.getCell(totalRow, 5), `SUM(E${firstData}:E${cashRow})`, FMT.usd0);

  const s = totalRow + 2;
  sectionLabel(ws, s, "Summary");
  labelCell(ws.getCell(s + 1, 2), "Number of positions");
  formulaCell(ws.getCell(s + 1, 5), `COUNT(E${firstData}:E${lastData})`, FMT.num0);
  labelCell(ws.getCell(s + 2, 2), "Largest position weight");
  formulaCell(
    ws.getCell(s + 2, 5),
    `IF(E${totalRow}=0,"",MAX(E${firstData}:E${lastData})/E${totalRow})`,
    FMT.pct1
  );
  labelCell(ws.getCell(s + 3, 2), "Top-5 concentration");
  formulaCell(
    ws.getCell(s + 3, 5),
    `IF(COUNT(E${firstData}:E${lastData})<5,"",SUM(LARGE(E${firstData}:E${lastData},1),LARGE(E${firstData}:E${lastData},2),LARGE(E${firstData}:E${lastData},3),LARGE(E${firstData}:E${lastData},4),LARGE(E${firstData}:E${lastData},5))/E${totalRow})`,
    FMT.pct1
  );
  labelCell(ws.getCell(s + 4, 2), "Cash weight");
  formulaCell(ws.getCell(s + 4, 5), `IF(E${cashRow}="","",E${cashRow}/E${totalRow})`, FMT.pct1);
  noteCell(
    ws.getCell(s + 5, 2),
    "Top-5 concentration needs at least five priced positions before it shows a number."
  );
  ws.mergeCells(s + 5, 2, s + 5, 7);

  addSourcesSheet(wb, p.sources);
  return wb;
}
