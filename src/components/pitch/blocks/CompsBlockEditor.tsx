"use client";

// Peer comps table: the student types in tickers, we fetch each one's
// quote + fundamentals (via /api/comps, server-side so the API key stays
// hidden) and build a multiples table. There's no free "give me the
// comps set" endpoint anywhere, so this is the honest substitute — the
// student picks the peer set, same as a real analyst would.

import { useState } from "react";
import type { CompsBlockData } from "@/lib/reportBlocks";
import type { CompRow } from "@/lib/comps";
import { formatUSD, formatPct } from "@/lib/format";

export default function CompsBlockEditor({
  data,
  onChange,
}: {
  data: CompsBlockData;
  onChange: (data: CompsBlockData) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const rows = data.rows;

  async function fetchComps() {
    if (!data.peerSymbols.trim()) return;
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(
        `/api/comps?symbols=${encodeURIComponent(data.peerSymbols)}`
      );
      if (!res.ok) throw new Error("failed");
      const json = (await res.json()) as { rows: CompRow[] };
      onChange({ ...data, rows: json.rows });
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <label className="block text-sm">
        <span className="mb-1 block text-muted">
          Peer tickers (comma-separated, up to 10)
        </span>
        <div className="flex gap-2">
          <input
            type="text"
            value={data.peerSymbols}
            onChange={(e) => onChange({ ...data, peerSymbols: e.target.value })}
            placeholder="MSFT, GOOGL, META"
            className="w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-sm text-foreground focus:border-accent focus:outline-none"
          />
          <button
            type="button"
            onClick={fetchComps}
            disabled={loading}
            className="shrink-0 rounded-md border border-accent px-3 py-2 text-xs text-accent hover:bg-accent/10 disabled:opacity-50"
          >
            {loading ? "Loading…" : "Build table"}
          </button>
        </div>
      </label>

      {error && (
        <p className="mt-2 text-xs text-negative">
          Couldn&apos;t load one or more tickers. Check the symbols and try again.
        </p>
      )}

      {rows.length > 0 && (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-xs">
            <thead>
              <tr className="border-b border-border text-muted">
                <th className="py-2 pr-3">Ticker</th>
                <th className="py-2 pr-3">Price</th>
                <th className="py-2 pr-3">P/E</th>
                <th className="py-2 pr-3">Revenue</th>
                <th className="py-2 pr-3">Rev. growth</th>
                <th className="py-2 pr-3">Gross margin</th>
                <th className="py-2 pr-3">Op. margin</th>
                <th className="py-2 pr-3">Net margin</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.symbol} className="border-b border-border/50">
                  <td className="py-2 pr-3 font-mono text-foreground">{row.symbol}</td>
                  {row.error ? (
                    <td colSpan={7} className="py-2 text-negative">
                      {row.error}
                    </td>
                  ) : (
                    <>
                      <td className="py-2 pr-3 font-mono">
                        {row.price !== null ? formatUSD(row.price) : "—"}
                      </td>
                      <td className="py-2 pr-3 font-mono">
                        {row.peRatio !== null ? `${row.peRatio.toFixed(1)}x` : "—"}
                      </td>
                      <td className="py-2 pr-3 font-mono">
                        {row.revenue !== null ? formatUSD(row.revenue) : "—"}
                      </td>
                      <td className="py-2 pr-3 font-mono">
                        {row.revenueGrowthPct !== null
                          ? formatPct(row.revenueGrowthPct)
                          : "—"}
                      </td>
                      <td className="py-2 pr-3 font-mono">
                        {row.grossMarginPct !== null
                          ? formatPct(row.grossMarginPct)
                          : "—"}
                      </td>
                      <td className="py-2 pr-3 font-mono">
                        {row.operatingMarginPct !== null
                          ? formatPct(row.operatingMarginPct)
                          : "—"}
                      </td>
                      <td className="py-2 pr-3 font-mono">
                        {row.netMarginPct !== null ? formatPct(row.netMarginPct) : "—"}
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
