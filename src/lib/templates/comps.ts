// The Trading Comps template: the subject company against a student-chosen
// peer set, one row per company, with the raw inputs (price, shares, net
// debt, revenue, EBITDA, net income, book equity) as editable cells and
// every multiple a live formula dividing them — edit a peer's price and
// its P/E moves. Peer medians/means are MEDIAN()/AVERAGE() formulas that
// skip blanks, and an implied-value block reprices the subject at the peer
// medians. Same rule as everywhere: real filed data prefills, missing
// data stays blank, never estimated.

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

export function buildCompsWorkbook(
  req: TemplateRequest,
  subject: CompanyPrefill,
  peers: CompanyPrefill[]
): ExcelJS.Workbook {
  const wb = makeWorkbook();
  const sector = getSectorGuidance(req.sector);

  addGuidanceSheet(wb, {
    templateName: "Trading Comps",
    sector,
    howToUse: [
      "1. The skill in comps is the peer set, not the arithmetic: peers should share the subject's business model, growth/margin profile, and rough scale. A 'peer' that is twice the growth at half the margin is not a peer. It is a different bet that happens to share a sector label.",
      "2. Every multiple in the table is a live formula off the raw columns to its left. Edit any input (they are all blue) and the multiples, medians, and implied values recalculate. Multiples that cannot be computed (loss-making P/E, missing EBITDA) stay blank and drop out of the medians automatically.",
      "3. Median beats mean for the summary row: one stretched peer distorts a mean but barely moves a median. Both are shown; know why they differ when they do.",
      "4. The implied-value block reprices the subject at the peer medians. A subject trading below its peers is not automatically cheap. The market may be pricing lower growth, thinner margins, or worse governance. The gap is where your work starts, not where it ends.",
      req.sector === "fig"
        ? "5. FIG note: for banks and insurers, read P/E and P/B. The EV columns (net debt, EV/EBITDA, EV/Sales) are meaningless for financials and will mostly be blank; that is correct, not missing data."
        : "5. If your subject and peers report in different accounting regimes or currencies, this site has already normalized everything to USD, but check fiscal-year ends: a January year-end retailer against December peers is comparing different macro periods.",
    ],
  });

  const rows = [subject, ...peers];
  const ws = wb.addWorksheet("Comps");
  ws.getColumn(1).width = 30;
  ws.getColumn(2).width = 10;
  for (let c = 3; c <= 17; c++) ws.getColumn(c).width = 13;
  sheetTitle(
    ws,
    subject.ticker ? `Trading comps: ${subject.companyName} (${subject.ticker})` : "Trading comps",
    "All values USD. Blue cells are editable inputs; multiples are live formulas and recalculate."
  );

  const headers = [
    "Company",
    "Ticker",
    "Price",
    "Dil. shares",
    "Mkt cap",
    "Net debt",
    "EV",
    "Revenue",
    "EBITDA",
    "Net income",
    "Book equity",
    "Rev growth",
    "EBITDA mgn",
    "P/E",
    "EV/EBITDA",
    "EV/Sales",
    "P/B",
  ];
  const HEAD = 4;
  headers.forEach((h, i) => headerCell(ws.getCell(HEAD, 1 + i), h));

  const firstRow = HEAD + 1; // subject
  const peerFirst = firstRow + 1;
  const peerLast = firstRow + peers.length;

  rows.forEach((p, idx) => {
    const r = firstRow + idx;
    const f = p.fundamentals;
    labelCell(ws.getCell(r, 1), p.companyName || "(enter company)", { bold: idx === 0 });
    labelCell(ws.getCell(r, 2), p.ticker || "—", { bold: idx === 0 });
    inputCell(ws.getCell(r, 3), p.usdSharePrice, FMT.usd2);
    inputCell(ws.getCell(r, 4), f?.sharesOutstandingDiluted ?? f?.sharesOutstanding ?? null, FMT.num0);
    formulaCell(ws.getCell(r, 5), `IFERROR(C${r}*D${r},"")`, FMT.usdM);
    inputCell(ws.getCell(r, 6), p.valuation?.netDebt ?? null, FMT.usdM);
    formulaCell(ws.getCell(r, 7), `IFERROR(E${r}+F${r},"")`, FMT.usdM);
    inputCell(ws.getCell(r, 8), f?.revenue ?? null, FMT.usdM);
    inputCell(ws.getCell(r, 9), p.ebitda, FMT.usdM);
    inputCell(ws.getCell(r, 10), f?.netIncome ?? null, FMT.usdM);
    inputCell(ws.getCell(r, 11), f?.stockholdersEquity ?? null, FMT.usdM);
    const growth =
      f?.revenue != null && f?.revenuePriorYear ? f.revenue / f.revenuePriorYear - 1 : null;
    inputCell(ws.getCell(r, 12), growth, FMT.pct1);
    formulaCell(ws.getCell(r, 13), `IFERROR(I${r}/H${r},"")`, FMT.pct1);
    // Multiples guard against blanks AND nonsense signs (negative earnings
    // P/E is not a multiple, it's a story) by blanking out.
    formulaCell(ws.getCell(r, 14), `IF(OR(J${r}="",J${r}<=0,E${r}=""),"",E${r}/J${r})`, FMT.x1);
    formulaCell(ws.getCell(r, 15), `IF(OR(I${r}="",I${r}<=0,G${r}=""),"",G${r}/I${r})`, FMT.x1);
    formulaCell(ws.getCell(r, 16), `IF(OR(H${r}="",H${r}<=0,G${r}=""),"",G${r}/H${r})`, FMT.x1);
    formulaCell(ws.getCell(r, 17), `IF(OR(K${r}="",K${r}<=0,E${r}=""),"",E${r}/K${r})`, FMT.x1);
  });

  const medianRow = peerLast + 2;
  const meanRow = medianRow + 1;
  labelCell(ws.getCell(medianRow, 1), "Peer median", { bold: true });
  labelCell(ws.getCell(meanRow, 1), "Peer mean", { muted: true });
  for (const c of [12, 13, 14, 15, 16, 17]) {
    const L = String.fromCharCode(64 + c);
    formulaCell(
      ws.getCell(medianRow, c),
      `IFERROR(MEDIAN(${L}${peerFirst}:${L}${peerLast}),"")`,
      c <= 13 ? FMT.pct1 : FMT.x1,
      true
    );
    formulaCell(
      ws.getCell(meanRow, c),
      `IFERROR(AVERAGE(${L}${peerFirst}:${L}${peerLast}),"")`,
      c <= 13 ? FMT.pct1 : FMT.x1
    );
  }
  noteCell(
    ws.getCell(meanRow + 1, 1),
    "Medians/means cover the peer rows only (not the subject) and automatically skip peers whose multiple could not be computed."
  );
  ws.mergeCells(meanRow + 1, 1, meanRow + 1, 8);

  const s = meanRow + 3;
  sectionLabel(ws, s, "Implied value of the subject at peer medians");
  headerCell(ws.getCell(s + 1, 1), "Route");
  headerCell(ws.getCell(s + 1, 2), "");
  headerCell(ws.getCell(s + 1, 3), "Implied share price");
  headerCell(ws.getCell(s + 1, 4), "vs. current");

  labelCell(ws.getCell(s + 2, 1), "Median P/E × subject net income");
  formulaCell(
    ws.getCell(s + 2, 3),
    `IFERROR(N${medianRow}*J${firstRow}/D${firstRow},"")`,
    FMT.usd2
  );
  labelCell(ws.getCell(s + 3, 1), "Median EV/EBITDA × subject EBITDA − net debt");
  formulaCell(
    ws.getCell(s + 3, 3),
    `IFERROR((O${medianRow}*I${firstRow}-F${firstRow})/D${firstRow},"")`,
    FMT.usd2
  );
  labelCell(ws.getCell(s + 4, 1), "Median EV/Sales × subject revenue − net debt");
  formulaCell(
    ws.getCell(s + 4, 3),
    `IFERROR((P${medianRow}*H${firstRow}-F${firstRow})/D${firstRow},"")`,
    FMT.usd2
  );
  for (let i = 2; i <= 4; i++) {
    formulaCell(
      ws.getCell(s + i, 4),
      `IFERROR(C${s + i}/C${firstRow}-1,"")`,
      FMT.pct1
    );
  }
  labelCell(ws.getCell(s + 5, 1), "Current subject price", { bold: true });
  keyOutputCell(ws.getCell(s + 5, 3), `C${firstRow}`, FMT.usd2);
  noteCell(
    ws.getCell(s + 6, 1),
    "Three routes to an implied price. When they disagree sharply, the disagreement is the insight: the market weighs earnings, cash generation, and revenue differently for this subject than for its peers."
  );
  ws.mergeCells(s + 6, 1, s + 6, 8);

  const sources = [
    ...subject.sources.map((x) => ({ ...x, item: `Subject (${subject.ticker || "—"}): ${x.item}` })),
    ...peers.flatMap((p) =>
      p.sources.map((x) => ({ ...x, item: `Peer (${p.ticker || "—"}): ${x.item}` }))
    ),
  ];
  addSourcesSheet(wb, sources);
  return wb;
}
