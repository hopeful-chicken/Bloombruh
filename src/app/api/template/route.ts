// Generates a downloadable .xlsx model template server-side and streams it
// back. POST rather than GET since the config is a structured object, and
// exceljs + the data-provider keys must stay server-side (same reasoning
// as every other API route here). Each generation fetches the chosen
// company's real data fresh through the same libs the profile page uses —
// no separate data path to drift out of sync.

import { NextRequest, NextResponse } from "next/server";
import type { TemplateRequest, TemplateId, TemplateSectorId } from "@/lib/templates/types";
import { getTemplateInfo } from "@/lib/templates/types";
import { TEMPLATE_SECTORS } from "@/lib/templates/sectorGuidance";
import { getCompanyPrefill, blankPrefill, type CompanyPrefill } from "@/lib/templates/prefill";
import { buildDcfWorkbook } from "@/lib/templates/dcf";
import { buildCompsWorkbook } from "@/lib/templates/comps";
import { buildLboWorkbook } from "@/lib/templates/lbo";
import { buildMergerWorkbook } from "@/lib/templates/merger";
import { buildInitiationWorkbook } from "@/lib/templates/initiation";
import { buildPortfolioWorkbook } from "@/lib/templates/portfolio";
import { buildMarketUpdateWorkbook } from "@/lib/templates/marketUpdate";

async function prefillOrBlank(ticker: string | null | undefined): Promise<CompanyPrefill> {
  if (!ticker?.trim()) return blankPrefill();
  try {
    return await getCompanyPrefill(ticker);
  } catch {
    // A bad ticker or provider hiccup downloads a blank template rather
    // than failing the whole request — the sources sheet says it's blank.
    return blankPrefill();
  }
}

export async function POST(request: NextRequest) {
  let body: TemplateRequest;
  try {
    body = (await request.json()) as TemplateRequest;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const info = getTemplateInfo(body.template as TemplateId);
  if (!info) {
    return NextResponse.json({ error: "Unknown template" }, { status: 400 });
  }
  if (!TEMPLATE_SECTORS.some((s) => s.id === body.sector)) {
    body.sector = "generic" as TemplateSectorId;
  }

  try {
    const wb = await (async () => {
      switch (info.id) {
        case "dcf":
          return buildDcfWorkbook(body, await prefillOrBlank(body.ticker));
        case "comps": {
          // Peer list: comma-separated, deduped, subject excluded, capped
          // at 6 to keep free-tier provider usage sane per download.
          const peerSymbols = [
            ...new Set(
              (body.peerTickers ?? "")
                .split(",")
                .map((t) => t.trim().toUpperCase())
                .filter((t) => t && t !== body.ticker?.trim().toUpperCase())
            ),
          ].slice(0, 6);
          const [subject, ...peerData] = await Promise.all([
            prefillOrBlank(body.ticker),
            ...peerSymbols.map((t) => prefillOrBlank(t)),
          ]);
          return buildCompsWorkbook(body, subject, peerData);
        }
        case "lbo":
          return buildLboWorkbook(body, await prefillOrBlank(body.ticker));
        case "merger": {
          const [acq, tgt] = await Promise.all([
            prefillOrBlank(body.ticker),
            prefillOrBlank(body.targetTicker),
          ]);
          return buildMergerWorkbook(body, acq, tgt);
        }
        case "initiation":
          return buildInitiationWorkbook(body, await prefillOrBlank(body.ticker));
        case "portfolio":
          return buildPortfolioWorkbook(body, await prefillOrBlank(body.ticker));
        case "market-update":
          return buildMarketUpdateWorkbook(body);
      }
    })();

    const buffer = await wb.xlsx.writeBuffer();
    const tickerPart = body.ticker?.trim()
      ? `-${body.ticker.trim().toUpperCase().replace(/[^A-Z0-9.]/g, "")}`
      : "";
    const filename = `bloombruh-${info.id}${tickerPart}.xlsx`;

    return new NextResponse(Buffer.from(buffer), {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Template generation failed:", error);
    return NextResponse.json({ error: "Failed to generate the template" }, { status: 502 });
  }
}
