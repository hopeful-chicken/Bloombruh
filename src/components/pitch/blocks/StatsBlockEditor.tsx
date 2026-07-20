"use client";

import type { StatEntry, StatsBlockData } from "@/lib/reportBlocks";

export default function StatsBlockEditor({
  data,
  onChange,
  availableStats,
}: {
  data: StatsBlockData;
  onChange: (data: StatsBlockData) => void;
  availableStats: StatEntry[];
}) {
  function toggleStat(key: string) {
    const isSelected = data.statKeys.includes(key);
    onChange({
      ...data,
      statKeys: isSelected
        ? data.statKeys.filter((k) => k !== key)
        : [...data.statKeys, key],
    });
  }

  function setOverride(key: string, value: string) {
    onChange({ ...data, overrides: { ...data.overrides, [key]: value } });
  }

  return (
    <div>
      <p className="mb-3 text-xs text-muted">
        Pick which numbers to include. Anything marked{" "}
        <span className="text-negative">Unavailable</span> has no free data
        source — type in your own figure or estimate instead.
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        {availableStats.map((stat) => {
          const selected = data.statKeys.includes(stat.key);
          return (
            <div
              key={stat.key}
              className={`rounded-md border p-2.5 text-sm ${
                selected ? "border-accent/50 bg-accent/5" : "border-border"
              }`}
            >
              <label className="flex cursor-pointer items-center justify-between gap-2">
                <span className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => toggleStat(stat.key)}
                    className="accent-accent"
                  />
                  <span className="text-foreground">{stat.label}</span>
                </span>
                <span
                  className={`font-mono text-xs ${
                    stat.value === null ? "text-negative" : "text-muted"
                  }`}
                >
                  {stat.value ?? "Unavailable"}
                </span>
              </label>
              {selected && stat.value === null && (
                <input
                  type="text"
                  value={data.overrides[stat.key] ?? ""}
                  onChange={(e) => setOverride(stat.key, e.target.value)}
                  placeholder="Your own figure/estimate"
                  className="mt-2 w-full rounded border border-border bg-background px-2 py-1 font-mono text-xs text-foreground focus:border-accent focus:outline-none"
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
