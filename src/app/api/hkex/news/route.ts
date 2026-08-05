import { NextRequest, NextResponse } from "next/server";
import { getReliableNews } from "@/lib/hkex/news";
import { summarizeItems } from "@/lib/hkex/summarize";

export async function GET(request: NextRequest) {
  const companyName = request.nextUrl.searchParams.get("name") ?? "";
  if (!companyName.trim()) {
    return NextResponse.json({ error: "Missing company name" }, { status: 400 });
  }

  try {
    const items = await getReliableNews(companyName, 10);

    let summary: string | null = null;
    if (items.length > 0) {
      try {
        summary = await summarizeItems({ companyName, kind: "news coverage", items });
      } catch (error) {
        console.error("HKEX news summary failed:", error);
      }
    }

    return NextResponse.json({ items, summary });
  } catch (error) {
    console.error("HKEX news fetch failed:", error);
    return NextResponse.json({ error: "Failed to load news" }, { status: 502 });
  }
}
