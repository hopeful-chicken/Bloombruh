// The Markets Overview module: a "how is the market doing" module split
// into three layers — the world-situation text panel, a picker over public
// equity sectors, and a picker over private-market segments (via public
// proxies). Each panel is client-driven (segment/period picking + AI
// narrative fetch), so this page itself just assembles static registries
// and Adam's commentary data and hands them down.

import { MARKET_SECTORS } from "@/lib/marketSectors";
import { PRIVATE_MARKET_SEGMENTS, PRIVATE_MARKET_PROXY_DISCLAIMER } from "@/lib/privateMarketSegments";
import { MARKET_COMMENTARY } from "@/data/marketCommentary";
import WorldSituationOverview from "@/components/markets/WorldSituationOverview";
import SegmentOverview from "@/components/markets/SegmentOverview";
import TopMoversPanel from "@/components/markets/TopMoversPanel";

export default function MarketsOverviewPage() {
  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-widest text-accent">Markets Overview</p>
      <h1 className="font-display mt-1 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        How the market is doing
      </h1>
      <p className="mt-1 text-sm text-muted">
        The world situation, then a closer look by equity sector and by private-market segment —
        pick a period, see real numbers, a grounded AI summary, and Adam&apos;s own take.
      </p>

      <div className="mt-6">
        <WorldSituationOverview commentary={MARKET_COMMENTARY} />
      </div>

      <TopMoversPanel />

      <SegmentOverview
        title="Markets by Sector"
        subtitle="Global equities and major sectors, tracked via real sector ETFs."
        segments={MARKET_SECTORS}
        commentary={MARKET_COMMENTARY}
      />

      <SegmentOverview
        title="Private Markets"
        subtitle="Private equity, private credit, and real assets, via public listed proxies."
        segments={PRIVATE_MARKET_SEGMENTS}
        commentary={MARKET_COMMENTARY}
        proxyDisclaimer={PRIVATE_MARKET_PROXY_DISCLAIMER}
      />
    </div>
  );
}
