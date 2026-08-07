// Insider transactions, institutional holdings, sentiment-scored news, and
// the next earnings date — real data from Alpha Vantage, layered on top of
// (not replacing) the rest of Company Profile. Server component: all data
// arrives pre-fetched as props (see src/app/profile/[symbol]/page.tsx),
// same pattern as the rest of the page. Every sub-section handles an empty
// state honestly rather than hiding itself silently, so a visitor can tell
// "nothing found" apart from "this section doesn't exist."

import type {
  InsiderTransaction,
  InstitutionalHoldingsSummary,
  SentimentNewsItem,
  UpcomingEarnings,
} from "@/lib/alphaVantage";

function sentimentColor(label: string): string {
  const l = label.toLowerCase();
  if (l.includes("bullish")) return "text-positive";
  if (l.includes("bearish")) return "text-negative";
  return "text-muted";
}

export default function MarketIntelSection({
  companyName,
  insiderTransactions,
  institutionalHoldings,
  sentimentNews,
  nextEarnings,
}: {
  companyName: string;
  insiderTransactions: InsiderTransaction[];
  institutionalHoldings: InstitutionalHoldingsSummary | null;
  sentimentNews: SentimentNewsItem[];
  nextEarnings: UpcomingEarnings | null;
}) {
  const hasAnything =
    insiderTransactions.length > 0 ||
    institutionalHoldings !== null ||
    sentimentNews.length > 0 ||
    nextEarnings !== null;

  if (!hasAnything) return null;

  return (
    <section className="mt-10 border-t border-border pt-8">
      <p className="font-mono text-xs uppercase tracking-widest text-accent">Market Intel</p>
      <h2 className="font-display mt-1 text-xl font-semibold text-foreground">
        Ownership, activity &amp; sentiment
      </h2>
      <p className="mt-1 max-w-2xl text-sm text-muted">
        Who is buying and selling, who owns the float, and how recent news is scoring on
        sentiment: real data from Alpha Vantage, alongside (not replacing) the news above.
      </p>

      {nextEarnings && (
        <div className="mt-5 rounded-lg border border-border bg-surface/40 p-4">
          <p className="text-[11px] uppercase tracking-wide text-muted/70">Next earnings</p>
          <p className="mt-1 text-sm text-foreground">
            {new Date(nextEarnings.reportDate).toLocaleDateString(undefined, {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
            {nextEarnings.timeOfDay && (
              <span className="text-muted"> · {nextEarnings.timeOfDay.replace("-", " ")}</span>
            )}
            {nextEarnings.estimate !== null && (
              <span className="text-muted">
                {" "}
                · consensus estimate ${nextEarnings.estimate.toFixed(2)} {nextEarnings.currency}/share
              </span>
            )}
          </p>
        </div>
      )}

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <div>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">
            Recent Insider Activity
          </h3>
          {insiderTransactions.length === 0 ? (
            <p className="text-sm text-muted">No recent insider transactions found.</p>
          ) : (
            <ul className="divide-y divide-border border-y border-border">
              {insiderTransactions.map((t, i) => (
                <li key={i} className="py-2.5 text-sm">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-foreground">{t.executive}</span>
                    <span
                      className={`font-mono text-xs ${
                        t.acquisitionOrDisposal === "A" ? "text-positive" : "text-negative"
                      }`}
                    >
                      {t.acquisitionOrDisposal === "A" ? "Bought" : "Sold"} {t.shares.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-muted">
                    {t.executiveTitle} · {t.transactionDate}
                    {t.sharePrice !== null && ` · $${t.sharePrice.toFixed(2)}`}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">
            Institutional Ownership
          </h3>
          {institutionalHoldings === null || institutionalHoldings.topHolders.length === 0 ? (
            <p className="text-sm text-muted">No institutional holdings data found.</p>
          ) : (
            <>
              <p className="mb-2 text-sm text-muted">
                {institutionalHoldings.totalHolders.toLocaleString()} institutional holders ·{" "}
                {institutionalHoldings.totalOwnershipPercentage} of shares outstanding
              </p>
              <ul className="divide-y divide-border border-y border-border">
                {institutionalHoldings.topHolders.map((h, i) => (
                  <li key={i} className="py-2.5 text-sm">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-foreground">{h.holderName}</span>
                      <span className="font-mono text-xs text-muted">
                        {h.sharesHeld.toLocaleString()} shares
                      </span>
                    </div>
                    <p
                      className={`text-xs ${
                        h.changeType === "increased"
                          ? "text-positive"
                          : h.changeType === "decreased"
                            ? "text-negative"
                            : "text-muted"
                      }`}
                    >
                      {h.changeType} {h.sharesChangedPercentage} · reported {h.lastReported}
                    </p>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>

      <div className="mt-5">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">
          News Sentiment
        </h3>
        {sentimentNews.length === 0 ? (
          <p className="text-sm text-muted">No recent sentiment-scored articles found for {companyName}.</p>
        ) : (
          <ul className="divide-y divide-border border-y border-border">
            {sentimentNews.map((item, i) => (
              <li key={i} className="py-2.5">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-accent hover:underline"
                >
                  {item.title}
                </a>
                <div className="mt-0.5 flex items-center gap-2 text-xs text-muted">
                  <span>{item.source}</span>
                  <span aria-hidden="true">·</span>
                  <span>{item.timePublished.slice(0, 10)}</span>
                  <span aria-hidden="true">·</span>
                  <span className={sentimentColor(item.sentimentLabel)}>
                    {item.sentimentLabel} ({item.sentimentScore.toFixed(2)})
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
