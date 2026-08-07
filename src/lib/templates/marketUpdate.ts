// The Sales & Trading Market Update sheet — the only template whose
// prefill is market-wide rather than company-specific: it downloads with
// this site's real data as of the moment you generate it (sector ETF
// performance from the same Twelve Data series the Markets Overview module
// charts, and every tracked central bank's current policy rate from the
// same official statistics APIs the Central Bank Room uses), plus a
// structured morning-note section for the student's own written take.
// Anything that fails to fetch shows "unavailable" — never a stale or
// invented figure.

import type ExcelJS from "exceljs";
import type { TemplateRequest } from "./types";
import { getSectorGuidance } from "./sectorGuidance";
import type { SourceLine } from "./prefill";
import { MARKET_SECTORS } from "@/lib/marketSectors";
import { PRIVATE_MARKET_SEGMENTS } from "@/lib/privateMarketSegments";
import { getTimeSeriesForRange } from "@/lib/marketData";
import { CENTRAL_BANKS } from "@/lib/centralBanks";
import { getCentralBankRateData } from "@/lib/centralBankRates";
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
  noteCell,
  FMT,
} from "./excelHelpers";

type SegmentRow = {
  label: string;
  proxy: string;
  oneWeek: number | null;
  oneMonth: number | null;
};

type RatesRow = {
  bank: string;
  rate: number | null;
  asOf: string | null;
  lastMoveBp: number | null;
  isProxy: boolean;
};

async function fetchSegmentRow(label: string, symbol: string, proxyName: string): Promise<SegmentRow> {
  try {
    const series = await getTimeSeriesForRange(symbol, "1M");
    const closes = [...series.values].reverse().map((v) => parseFloat(v.close));
    const last = closes[closes.length - 1];
    const weekAgo = closes.length > 5 ? closes[closes.length - 6] : null;
    const monthAgo = closes[0];
    return {
      label,
      proxy: proxyName,
      oneWeek: weekAgo ? last / weekAgo - 1 : null,
      oneMonth: monthAgo ? last / monthAgo - 1 : null,
    };
  } catch {
    return { label, proxy: proxyName, oneWeek: null, oneMonth: null };
  }
}

export async function buildMarketUpdateWorkbook(req: TemplateRequest): Promise<ExcelJS.Workbook> {
  const wb = makeWorkbook();
  const sector = getSectorGuidance(req.sector);
  const today = new Date().toISOString().slice(0, 10);

  // All real data gathered in parallel; each failure degrades one row.
  const [sectorRows, privateRows, rateResults] = await Promise.all([
    Promise.all(
      MARKET_SECTORS.map((s) => fetchSegmentRow(s.shortLabel, s.tickerSymbol, s.proxyName))
    ),
    Promise.all(
      PRIVATE_MARKET_SEGMENTS.map((s) => fetchSegmentRow(s.label, s.tickerSymbol, s.proxyName))
    ),
    Promise.all(
      CENTRAL_BANKS.map(async (b): Promise<RatesRow> => {
        const data = await getCentralBankRateData(b.id).catch(() => null);
        return {
          bank: b.shortName,
          rate: data?.currentRate ?? null,
          asOf: data?.asOfDate ?? null,
          lastMoveBp: data?.decisions[0]?.changeBp ?? null,
          isProxy: data?.isProxy ?? false,
        };
      })
    ),
  ]);

  addGuidanceSheet(wb, {
    templateName: "Market Update Sheet",
    sector,
    howToUse: [
      "1. The Dashboard sheet is a snapshot of real data as of the moment you downloaded this file: sector performance and central bank policy rates. It does not update itself; re-download for fresh numbers (that is how a morning sheet works anyway).",
      "2. The Morning Note sheet is the structure of a daily desk note: overnight moves, the rates picture, what you're watching today, and the risk that would change your mind. The discipline is writing it before the market opens, in complete sentences.",
      "3. A good morning note connects the dashboard to a view: not 'tech was up', but 'tech outperformed because X, and if Y happens today that reverses'. The data is the start of the sentence, never the whole sentence.",
    ],
  });

  const ws = wb.addWorksheet("Dashboard");
  ws.getColumn(1).width = 26;
  ws.getColumn(2).width = 44;
  ws.getColumn(3).width = 12;
  ws.getColumn(4).width = 12;
  sheetTitle(ws, "Market dashboard", `Real data as of ${today}: see Data & Sources. Re-download for fresh numbers.`);

  sectionLabel(ws, 4, "Equity sectors (via real sector ETFs)");
  ["Sector", "Proxy", "1W", "1M"].forEach((h, i) => headerCell(ws.getCell(5, 1 + i), h));
  sectorRows.forEach((r, i) => {
    const row = 6 + i;
    labelCell(ws.getCell(row, 1), r.label);
    valueCell(ws.getCell(row, 2), r.proxy);
    valueCell(ws.getCell(row, 3), r.oneWeek ?? "unavailable", r.oneWeek !== null ? FMT.pct1 : undefined);
    valueCell(ws.getCell(row, 4), r.oneMonth ?? "unavailable", r.oneMonth !== null ? FMT.pct1 : undefined);
  });

  const pStart = 6 + sectorRows.length + 1;
  sectionLabel(ws, pStart, "Private-market proxies (public stand-ins, not fund NAVs)");
  ["Segment", "Proxy", "1W", "1M"].forEach((h, i) => headerCell(ws.getCell(pStart + 1, 1 + i), h));
  privateRows.forEach((r, i) => {
    const row = pStart + 2 + i;
    labelCell(ws.getCell(row, 1), r.label);
    valueCell(ws.getCell(row, 2), r.proxy);
    valueCell(ws.getCell(row, 3), r.oneWeek ?? "unavailable", r.oneWeek !== null ? FMT.pct1 : undefined);
    valueCell(ws.getCell(row, 4), r.oneMonth ?? "unavailable", r.oneMonth !== null ? FMT.pct1 : undefined);
  });

  const rStart = pStart + 2 + privateRows.length + 1;
  sectionLabel(ws, rStart, "Central bank policy rates");
  ["Bank", "Policy rate", "As of", "Last move"].forEach((h, i) => headerCell(ws.getCell(rStart + 1, 1 + i), h));
  rateResults.forEach((r, i) => {
    const row = rStart + 2 + i;
    labelCell(ws.getCell(row, 1), r.isProxy ? `${r.bank} (market proxy)` : r.bank);
    valueCell(ws.getCell(row, 2), r.rate !== null ? r.rate / 100 : "unavailable", r.rate !== null ? "0.00%" : undefined);
    valueCell(ws.getCell(row, 3), r.asOf ?? "—");
    valueCell(ws.getCell(row, 4), r.lastMoveBp !== null ? `${r.lastMoveBp > 0 ? "+" : ""}${r.lastMoveBp}bp` : "—");
  });
  noteCell(
    ws.getCell(rStart + 2 + rateResults.length, 1),
    "BoJ and PBoC publish no single daily policy rate. Those rows are the closest free market-rate proxies, labeled as such (same convention as the Central Bank Room)."
  );
  ws.mergeCells(rStart + 2 + rateResults.length, 1, rStart + 2 + rateResults.length, 4);

  // Morning note sheet.
  const m = wb.addWorksheet("Morning Note");
  m.getColumn(1).width = 110;
  sheetTitle(m, `Morning note: ${today}`, "Write in the blue cells. Complete sentences: this is a note someone else should be able to trade off.");
  const sections = [
    "Overnight & where we are (2–3 sentences: what moved, why, what it means for today)",
    "Rates & macro (what the dashboard's central-bank picture implies for positioning)",
    "What I'm watching today (specific names/events, with the level or print that matters)",
    "The risk that changes my mind (and what I'd do about it)",
  ];
  let mr = 4;
  for (const s of sections) {
    labelCell(m.getCell(mr, 1), s, { bold: true });
    const cell = m.getCell(mr + 1, 1);
    inputCell(cell, null);
    cell.alignment = { wrapText: true, vertical: "top" };
    m.getRow(mr + 1).height = 60;
    mr += 3;
  }

  const sources: SourceLine[] = [
    {
      item: "Sector & private-market performance (1W/1M)",
      source:
        "Computed from Twelve Data daily closes of each real proxy ETF (may be delayed), same series the Markets Overview module charts. Private-market rows are public listed proxies, not actual private-fund returns.",
    },
    {
      item: "Central bank policy rates",
      source:
        "Each bank's own statistics API (FRED for the Fed and the BoJ/PBoC proxies, ECB SDW, BoE IADB, BoC Valet, SNB, RBA), same sources as the Central Bank Room, fetched at download time.",
    },
    {
      item: `Snapshot date`,
      source: `All figures as of ${today} at generation time. This file does not self-update.`,
    },
  ];
  addSourcesSheet(wb, sources);
  return wb;
}
