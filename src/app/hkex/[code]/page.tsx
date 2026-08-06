import Link from "next/link";
import { notFound } from "next/navigation";
import { hkCode } from "@/lib/hkex/eodhd";
import { getHkQuote, getPriceHistory } from "@/lib/hkex/yahooFinance";
import { hkexCompanyPageUrl, hkexNewsSearchUrl, yahooFinanceQuoteUrl } from "@/lib/hkex/officialLinks";
import HkexPriceChart from "@/components/hkex/HkexPriceChart";
import NewsFeedSection from "@/components/hkex/NewsFeedSection";

export default async function HkexCompanyPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code: rawCode } = await params;
  const code = hkCode(rawCode);

  let quote;
  let history;
  try {
    const [quoteResult, historyResult] = await Promise.all([getHkQuote(code), getPriceHistory(code, "1Y")]);
    quote = quoteResult;
    history = historyResult.points;
  } catch {
    notFound();
  }

  const isUp = quote.change >= 0;

  return (
    <div>
      <Link href="/hkex" className="text-xs text-muted underline decoration-dotted underline-offset-2 hover:text-accent">
        ← Back to HKEX search
      </Link>

      <div className="mt-4 flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-accent">HKEX Screener</p>
          <h1 className="font-display mt-1 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {quote.name}
          </h1>
          <p className="mt-1 font-mono text-xs text-muted">{code}.HK</p>
        </div>
        <div className="text-right">
          <p className="font-mono text-2xl text-foreground">HK${quote.close.toFixed(2)}</p>
          <p className={`font-mono text-sm ${isUp ? "text-positive" : "text-negative"}`}>
            {isUp ? "+" : ""}
            {quote.change.toFixed(2)} ({isUp ? "+" : ""}
            {quote.changePercent.toFixed(2)}%)
          </p>
        </div>
      </div>

      <section className="mt-8 rounded-sm border border-border bg-surface/40 p-5 sm:p-6">
        <HkexPriceChart code={code} data={history} initialRange="1Y" />
      </section>

      <section className="mt-10">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">
          Financial Statements &amp; Regulatory Filings
        </h2>
        <div className="flex flex-col gap-1">
          <a
            href={yahooFinanceQuoteUrl(code)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-accent hover:underline"
          >
            {quote.name} — key financials on Yahoo Finance →
          </a>
          <a
            href={hkexCompanyPageUrl(code)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-accent hover:underline"
          >
            {quote.name} — company profile on HKEX →
          </a>
        </div>
        <p className="mt-2 text-sm text-muted">
          HKEX&apos;s own site can be slow or briefly unavailable (it sits behind bot
          protection that sometimes blocks even normal browsing) — Yahoo Finance is the more
          reliable of the two. For the full regulatory filing history (annual reports, results
          announcements): HKEXnews has no direct link into a single company&apos;s filings —
          search <span className="font-mono text-foreground">{code}</span> yourself on{" "}
          <a href={hkexNewsSearchUrl()} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
            HKEXnews
          </a>
          .
        </p>
      </section>

      <section className="mt-10">
        <NewsFeedSection
          title="Press Releases (last 3 months)"
          fetchUrl={`/api/hkex/press-releases?code=${encodeURIComponent(code)}&name=${encodeURIComponent(quote.name)}`}
          unmappedMessage="Couldn't find an official press-release page for this company — see the regulatory filings link above for its official announcements instead."
          emptyMessage="Checked the company's official press-release page but didn't find anything dated in the last 3 months."
        />
      </section>

      <section className="mt-10">
        <NewsFeedSection
          title="News (last 3 months)"
          fetchUrl={`/api/hkex/news?name=${encodeURIComponent(quote.name)}`}
        />
      </section>
    </div>
  );
}
