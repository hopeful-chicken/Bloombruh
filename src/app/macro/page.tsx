// The Central Bank Room: pick a central bank and see, in order, (1) its
// actual policy rate data — current rate, history chart, and a decision
// timeline, with general context on what monetary/fiscal policy do — then
// (2) real, sourced news headlines, then (3) Adam's own written take. Kept
// deliberately separate and labeled (see layout.tsx's banner) so a reader
// never mistakes fetched data, general education, or Adam's opinion for one
// another.

import Link from "next/link";
import { CENTRAL_BANKS, getCentralBank } from "@/lib/centralBanks";
import { CENTRAL_BANK_OPINIONS } from "@/data/centralBankOpinions";
import { getCompanyNews } from "@/lib/news";
import { getCentralBankRateData } from "@/lib/centralBankRates";
import { getRegionalIndex } from "@/lib/regionalIndices";
import { getTimeSeries } from "@/lib/marketData";
import NewsList from "@/components/pitch/NewsList";
import Stat from "@/components/Stat";
import RateChart from "@/components/macro/RateChart";
import RateTimeline from "@/components/macro/RateTimeline";
import PolicyExplainer from "@/components/macro/PolicyExplainer";
import GlobalRatesOverview from "@/components/macro/GlobalRatesOverview";
import CountrySituation from "@/components/macro/CountrySituation";
import UsEconomicIndicators from "@/components/macro/UsEconomicIndicators";

/** Plain-text paragraph splitter — same "no markdown, no new dependency"
 * convention as the report builder's text blocks. A blank line starts a
 * new paragraph. */
function paragraphs(body: string): string[] {
  return body
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export default async function CentralBankRoomPage({
  searchParams,
}: {
  searchParams: Promise<{ bank?: string }>;
}) {
  const { bank: bankParam } = await searchParams;
  const bank = getCentralBank(bankParam ?? "") ?? CENTRAL_BANKS[0];
  const regionalIndex = getRegionalIndex(bank.id);

  const [news, opinions, rateData, allBankRates, globalNews, indexSeries] = await Promise.all([
    getCompanyNews(bank.newsQuery),
    Promise.resolve(
      CENTRAL_BANK_OPINIONS.filter((o) => o.bankId === bank.id).sort((a, b) =>
        b.date.localeCompare(a.date)
      )
    ),
    getCentralBankRateData(bank.id),
    // Fetched in parallel across all 8 banks (not one after another) for the
    // "Global Overview" card at the top of the page — same per-bank fetchers
    // as the rest of this page, just called for every bank instead of one.
    Promise.all(CENTRAL_BANKS.map((b) => getCentralBankRateData(b.id))),
    getCompanyNews("global central banks interest rate decisions", 6),
    // ~5 years of daily closes for this region's index proxy — the second
    // line in the "Markets & the economy" overlay chart. Never throws: a
    // failed fetch just leaves that panel's chart empty, honestly.
    getTimeSeries(regionalIndex.proxySymbol, 1300).catch(() => null),
  ]);

  const globalBanks = CENTRAL_BANKS.map((b, i) => ({
    id: b.id,
    shortName: b.shortName,
    data: allBankRates[i],
  }));

  // Index price series → chronological {date, close}[] (ISO dates) for the
  // overlay chart. Twelve Data returns newest-first, so reverse.
  const indexHistory = indexSeries
    ? [...indexSeries.values]
        .reverse()
        .map((v) => ({ date: v.datetime.slice(0, 10), close: parseFloat(v.close) }))
        .filter((p) => Number.isFinite(p.close))
    : [];

  return (
    <div>
      <GlobalRatesOverview banks={globalBanks} news={globalNews} />

      <p className="font-mono text-xs uppercase tracking-widest text-accent">
        Central Bank Room
      </p>
      <h1 className="font-display mt-1 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        {bank.name}
      </h1>
      <p className="mt-1 text-sm text-muted">{bank.region}</p>

      {/* Bank selector — plain links so each bank is a real, shareable,
          server-rendered URL (?bank=ecb) rather than client-only state. */}
      <div className="mt-6 flex flex-wrap gap-2">
        {CENTRAL_BANKS.map((b) => (
          <Link
            key={b.id}
            href={`/macro?bank=${b.id}`}
            className={`rounded-md border px-3 py-1.5 text-xs ${
              b.id === bank.id
                ? "border-accent bg-accent/10 text-accent"
                : "border-border text-muted hover:border-accent hover:text-accent"
            }`}
          >
            {b.shortName}
          </Link>
        ))}
      </div>

      {/* Rates — real data first: current rate, history chart, decision
          timeline, then general context on what it all means. */}
      <section className="mt-8">
        <h2 className="mb-3 font-mono text-sm uppercase tracking-widest text-muted">
          Rates
        </h2>

        {!rateData ? (
          <p className="rounded-lg border border-border bg-surface p-4 text-sm text-muted">
            Rate data for {bank.shortName} is unavailable right now — the live
            source didn&apos;t respond. Try again shortly, or see the news
            below in the meantime.
          </p>
        ) : (
          <div className="space-y-6">
            {rateData.isProxy && (
              <p className="rounded-md border border-border bg-surface/60 px-3 py-2 text-xs text-muted">
                {bank.shortName} doesn&apos;t publish one single official
                daily policy rate the way the Fed or ECB do, so this is the
                closest free market-rate proxy, not an official figure.
              </p>
            )}

            <div className="grid gap-4 sm:grid-cols-3">
              <Stat
                label={rateData.seriesLabel}
                value={`${rateData.currentRate}%`}
                caption={`As of ${rateData.asOfDate}`}
              />
              <Stat
                label="Resolution"
                value={rateData.resolution === "daily" ? "Daily" : "Monthly"}
              />
              <Stat
                label="Last move"
                value={
                  rateData.decisions[0]
                    ? `${rateData.decisions[0].changeBp > 0 ? "+" : ""}${rateData.decisions[0].changeBp}bp`
                    : "No change in window"
                }
                caption={rateData.decisions[0]?.date ?? null}
              />
            </div>

            <div>
              <h3 className="mb-2 text-sm font-semibold text-foreground">
                History
              </h3>
              <RateChart history={rateData.history} />
              <p className="mt-2 text-xs text-muted/70">
                Source:{" "}
                <a
                  href={rateData.sourceUrl}
                  className="underline decoration-dotted underline-offset-2 hover:text-accent"
                >
                  {rateData.source}
                </a>
              </p>
            </div>

            <div>
              <h3 className="mb-2 text-sm font-semibold text-foreground">
                Rate decisions
              </h3>
              <RateTimeline decisions={rateData.decisions} bankName={bank.name} />
            </div>

            <div className="rounded-lg border border-border bg-surface p-4">
              <h3 className="mb-2 text-sm font-semibold text-foreground">
                Monetary &amp; budgetary policy, explained
              </h3>
              <PolicyExplainer bankName={bank.name} />
            </div>
          </div>
        )}
      </section>

      {bank.id === "fed" && <UsEconomicIndicators />}

      {/* Markets & the economy — the region's stock index charted against
          the policy rate, plus a period-scoped narrative and news. Shown
          whenever there's an index series or rate history to work with. */}
      {(indexHistory.length > 0 || rateData) && (
        <CountrySituation
          bankId={bank.id}
          region={bank.region}
          indexName={regionalIndex.indexName}
          proxyName={regionalIndex.proxyName}
          isExactIndex={regionalIndex.isExactIndex}
          currentRate={rateData?.currentRate ?? null}
          rateHistory={rateData?.history ?? []}
          indexHistory={indexHistory}
        />
      )}

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        {/* News — real, sourced headlines */}
        <div>
          <h2 className="mb-2 font-mono text-sm uppercase tracking-widest text-muted">
            In the news
          </h2>
          <NewsList articles={news} />
        </div>

        {/* Opinion — Adam's own commentary, clearly separated and labeled */}
        <div>
          <h2 className="mb-2 font-mono text-sm uppercase tracking-widest text-muted">
            Commentary
          </h2>
          {opinions.length === 0 ? (
            <p className="text-sm text-muted">
              No commentary on {bank.shortName} yet — check back soon.
            </p>
          ) : (
            <div className="space-y-6">
              {opinions.map((o) => (
                <article
                  key={`${o.bankId}-${o.date}-${o.title}`}
                  className="rounded-lg border border-border bg-surface p-4"
                >
                  <p className="font-mono text-[11px] text-muted">{o.date}</p>
                  <h3 className="mt-1 text-base font-semibold text-foreground">
                    {o.title}
                  </h3>
                  <div className="mt-2 space-y-2 text-sm leading-relaxed text-muted">
                    {paragraphs(o.body).map((p, i) => (
                      <p key={i}>{p}</p>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
