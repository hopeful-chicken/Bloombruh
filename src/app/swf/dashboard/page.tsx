import {
  getHoldingsData,
  getTopHoldings,
  groupByRegion,
  groupBySector,
  listCountries,
} from "@/lib/holdings";
import { formatUSD } from "@/lib/search";
import RegionChart from "@/components/swf/RegionChart";
import SectorChart from "@/components/swf/SectorChart";
import HoldingsTable from "@/components/swf/HoldingsTable";

export default function DashboardPage() {
  const { totalPortfolioValueUSD, companyCount } = getHoldingsData();
  const top20 = getTopHoldings(20);
  const byRegion = groupByRegion();
  const bySector = groupBySector();
  const countryCount = listCountries().length;

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        Portfolio Overview
      </h1>

      {/* EDITORIAL: Adam to review/replace this callout with his own voice */}
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
        NBIM owns on average ~1.5% of every listed company in the world —
        this dashboard shows what the world&apos;s largest equity owner
        actually holds, broken down by region and sector.
      </p>

      {/* Headline numbers */}
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <HeadlineStat label="Total portfolio value" value={formatUSD(totalPortfolioValueUSD)} />
        <HeadlineStat label="Companies held" value={companyCount.toString()} />
        <HeadlineStat label="Countries" value={countryCount.toString()} />
        <HeadlineStat label="Sectors" value={bySector.length.toString()} />
      </div>

      {/* Charts */}
      <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div>
          <h2 className="mb-3 font-mono text-sm uppercase tracking-widest text-muted">
            By region
          </h2>
          <RegionChart data={byRegion} />
        </div>
        <div>
          <h2 className="mb-3 font-mono text-sm uppercase tracking-widest text-muted">
            By sector
          </h2>
          <SectorChart data={bySector} />
        </div>
      </div>

      {/* Top 20 table */}
      <div className="mt-12">
        <h2 className="mb-3 font-mono text-sm uppercase tracking-widest text-muted">
          Top 20 holdings
        </h2>
        <HoldingsTable holdings={top20} />
      </div>
    </div>
  );
}

function HeadlineStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <p className="font-mono text-xl font-semibold text-accent sm:text-2xl">
        {value}
      </p>
      <p className="mt-1 text-xs text-muted">{label}</p>
    </div>
  );
}
