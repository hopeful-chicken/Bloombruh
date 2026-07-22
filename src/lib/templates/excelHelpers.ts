// Shared Excel vocabulary for every downloadable template, so all six
// workbooks read as one product: the same input-cell convention (blue on
// pale yellow — the classic banking-model convention for "type here"),
// the same formula/output styling, and the same standard sheets (guidance,
// data & sources) built the same way everywhere.
//
// Server-only: exceljs is a heavy dependency and lives behind
// /api/template — never import this from a "use client" component.

import ExcelJS from "exceljs";
import type { SectorGuidance } from "./sectorGuidance";
import type { SourceLine } from "./prefill";

// Colors (ARGB). Deliberately close to the site's warm palette, with the
// one industry-standard exception: editable inputs are blue — anyone
// who's opened a banking model knows blue = assumption you can change.
const C = {
  header: "FF26241F", // warm near-black
  headerText: "FFF7F5EE",
  accent: "FFBC5B33", // terracotta
  inputText: "FF1F4E9E", // classic model-input blue
  inputFill: "FFFDF6DC", // pale yellow
  outputFill: "FFF3F1EA",
  border: "FFE3E0D3",
  muted: "FF6F6B60",
} as const;

export const FONT = "Calibri";

export function makeWorkbook(): ExcelJS.Workbook {
  const wb = new ExcelJS.Workbook();
  wb.creator = "Bloombruh (student project — bloombruh)";
  wb.created = new Date();
  return wb;
}

type CellRef = ExcelJS.Cell;

function thinBorder(): Partial<ExcelJS.Borders> {
  const side: ExcelJS.Border = { style: "thin", color: { argb: C.border } };
  return { top: side, bottom: side, left: side, right: side };
}

/** Big sheet title in row 1. */
export function sheetTitle(ws: ExcelJS.Worksheet, title: string, subtitle?: string) {
  const t = ws.getCell("A1");
  t.value = title;
  t.font = { name: FONT, size: 16, bold: true, color: { argb: C.header } };
  if (subtitle) {
    const s = ws.getCell("A2");
    s.value = subtitle;
    s.font = { name: FONT, size: 10, italic: true, color: { argb: C.muted } };
  }
}

/** Section label row (e.g. "ASSUMPTIONS"). */
export function sectionLabel(ws: ExcelJS.Worksheet, row: number, text: string) {
  const cell = ws.getCell(row, 1);
  cell.value = text.toUpperCase();
  cell.font = { name: FONT, size: 10, bold: true, color: { argb: C.accent } };
}

/** Column header cell (dark fill, light text). */
export function headerCell(cell: CellRef, text: string) {
  cell.value = text;
  cell.font = { name: FONT, size: 10, bold: true, color: { argb: C.headerText } };
  cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: C.header } };
  cell.alignment = { horizontal: "center", vertical: "middle" };
  cell.border = thinBorder();
}

/** Editable assumption cell — blue text on pale yellow, the convention the
 * guidance sheet explains. Pass null to leave it blank for the student
 * (missing real data is shown as an empty input, never invented). */
export function inputCell(cell: CellRef, value: number | string | null, numFmt?: string) {
  cell.value = value;
  cell.font = { name: FONT, size: 10, bold: true, color: { argb: C.inputText } };
  cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: C.inputFill } };
  cell.border = thinBorder();
  if (numFmt) cell.numFmt = numFmt;
}

/** Live-formula cell — recalculates when inputs change. */
export function formulaCell(cell: CellRef, formula: string, numFmt?: string, bold = false) {
  cell.value = { formula } as ExcelJS.CellFormulaValue;
  cell.font = { name: FONT, size: 10, bold, color: { argb: C.header } };
  cell.border = thinBorder();
  if (numFmt) cell.numFmt = numFmt;
}

/** Static value cell (historical/prefilled data — real, not editable-by-convention). */
export function valueCell(cell: CellRef, value: number | string | null, numFmt?: string, bold = false) {
  cell.value = value;
  cell.font = { name: FONT, size: 10, bold, color: { argb: C.header } };
  cell.border = thinBorder();
  if (numFmt) cell.numFmt = numFmt;
}

/** Row label in column A (or given column). */
export function labelCell(cell: CellRef, text: string, opts?: { bold?: boolean; indent?: number; muted?: boolean }) {
  cell.value = text;
  cell.font = {
    name: FONT,
    size: 10,
    bold: opts?.bold ?? false,
    color: { argb: opts?.muted ? C.muted : C.header },
  };
  if (opts?.indent) cell.alignment = { indent: opts.indent };
}

/** Key-output cell: bold on the warm output fill, for the numbers the
 * whole model exists to produce (implied price, IRR, accretion %). */
export function keyOutputCell(cell: CellRef, formula: string, numFmt?: string) {
  cell.value = { formula } as ExcelJS.CellFormulaValue;
  cell.font = { name: FONT, size: 11, bold: true, color: { argb: C.accent } };
  cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: C.outputFill } };
  cell.border = thinBorder();
  if (numFmt) cell.numFmt = numFmt;
}

/** Small explanatory note under a section. */
export function noteCell(cell: CellRef, text: string) {
  cell.value = text;
  cell.font = { name: FONT, size: 9, italic: true, color: { argb: C.muted } };
  cell.alignment = { wrapText: true, vertical: "top" };
}

// Common number formats.
export const FMT = {
  usd0: '"$"#,##0',
  usd2: '"$"#,##0.00',
  usdM: '"$"#,##0,,"m"',
  pct1: "0.0%",
  pct0: "0%",
  x1: '0.0"x"',
  num0: "#,##0",
  num2: "#,##0.00",
} as const;

/** The standard "How to use this" guidance sheet: model conventions,
 * sector-specific guidance, and the honesty disclaimer. First sheet in
 * every workbook so it's what opens by default. */
export function addGuidanceSheet(
  wb: ExcelJS.Workbook,
  params: {
    templateName: string;
    howToUse: string[];
    sector: SectorGuidance;
  }
) {
  const ws = wb.addWorksheet("Read Me — Guidance");
  ws.getColumn(1).width = 110;
  sheetTitle(ws, `${params.templateName} — how to use this model`);

  let row = 3;
  const put = (text: string, opts?: { bold?: boolean; muted?: boolean }) => {
    const cell = ws.getCell(row, 1);
    cell.value = text;
    cell.font = {
      name: FONT,
      size: 10,
      bold: opts?.bold ?? false,
      italic: opts?.muted ?? false,
      color: { argb: opts?.muted ? C.muted : C.header },
    };
    cell.alignment = { wrapText: true, vertical: "top" };
    row += 1;
  };

  put("Conventions", { bold: true });
  put(
    "Blue cells on a pale-yellow background are assumptions — change them and the model recalculates. Everything else is either real prefilled data or a live formula; edit those only if you know why."
  );
  put(
    "Blank blue cells mean no real data was available to prefill — enter your own researched figure. Nothing in this file is estimated or invented; see the “Data & sources” sheet for where every prefilled number came from."
  );
  row += 1;

  put("How this model works", { bold: true });
  for (const line of params.howToUse) put(line);
  row += 1;

  put(`Sector guidance — ${params.sector.label}`, { bold: true });
  for (const note of params.sector.notes) put(note);
  row += 1;

  put("Honesty notes", { bold: true });
  put(
    "Built with Bloombruh (a free student project) for learning — this is an educational template, not investment advice, and its output is only as good as the assumptions you type into it."
  );
}

/** The standard "Data & sources" sheet — one line per prefilled item. */
export function addSourcesSheet(wb: ExcelJS.Workbook, sources: SourceLine[]) {
  const ws = wb.addWorksheet("Data & Sources");
  ws.getColumn(1).width = 55;
  ws.getColumn(2).width = 95;
  sheetTitle(ws, "Where every prefilled number comes from");
  headerCell(ws.getCell(3, 1), "Item");
  headerCell(ws.getCell(3, 2), "Source");
  sources.forEach((s, i) => {
    const r = 4 + i;
    valueCell(ws.getCell(r, 1), s.item);
    const src = ws.getCell(r, 2);
    src.value = s.source;
    src.font = { name: FONT, size: 10, color: { argb: C.muted } };
    src.alignment = { wrapText: true, vertical: "top" };
    src.border = thinBorder();
  });
  const noteRow = 5 + sources.length;
  noteCell(
    ws.getCell(noteRow, 1),
    `Generated ${new Date().toISOString().slice(0, 10)} by Bloombruh — free public data only; quotes may be delayed. Anything not listed here was left blank for you to research, never estimated.`
  );
  ws.mergeCells(noteRow, 1, noteRow, 2);
}

/** Standard column widths for model sheets: wide labels, medium years. */
export function modelColumns(ws: ExcelJS.Worksheet, yearCount: number) {
  ws.getColumn(1).width = 38;
  for (let i = 0; i < yearCount + 1; i++) ws.getColumn(2 + i).width = 13;
}
