import Link from "next/link";
import type { Holding } from "@/lib/types";
import { formatUSD } from "@/lib/search";

function slugifyCountry(country: string): string {
  return country.toLowerCase().replace(/\s+/g, "-");
}

export default function HoldingsTable({ holdings }: { holdings: Holding[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b border-border bg-surface text-left text-xs uppercase tracking-wide text-muted">
            <th className="px-4 py-2.5 font-medium">#</th>
            <th className="px-4 py-2.5 font-medium">Company</th>
            <th className="px-4 py-2.5 font-medium">Country</th>
            <th className="px-4 py-2.5 font-medium">Sector</th>
            <th className="px-4 py-2.5 text-right font-mono font-medium">Stake</th>
            <th className="px-4 py-2.5 text-right font-mono font-medium">% owned</th>
            <th className="px-4 py-2.5 text-right font-mono font-medium">% of portfolio</th>
          </tr>
        </thead>
        <tbody>
          {holdings.map((h, i) => (
            <tr
              key={h.id}
              className="border-b border-border/60 last:border-b-0 hover:bg-surface/60"
            >
              <td className="px-4 py-2.5 font-mono text-muted">{i + 1}</td>
              <td className="px-4 py-2.5">
                <span className="font-medium text-foreground">{h.name}</span>
                {h.ticker && (
                  <span className="ml-1.5 font-mono text-xs text-muted">
                    {h.ticker}
                  </span>
                )}
              </td>
              <td className="px-4 py-2.5">
                <Link
                  href={`/swf/country/${slugifyCountry(h.country)}`}
                  className="text-muted hover:text-accent hover:underline"
                >
                  {h.country}
                </Link>
              </td>
              <td className="px-4 py-2.5 text-muted">{h.sector}</td>
              <td className="px-4 py-2.5 text-right font-mono text-accent">
                {formatUSD(h.marketValueUSD)}
              </td>
              <td className="px-4 py-2.5 text-right font-mono text-foreground">
                {h.ownershipPct.toFixed(2)}%
              </td>
              <td className="px-4 py-2.5 text-right font-mono text-foreground">
                {h.portfolioPct.toFixed(3)}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
