"use client";

import type { SwotBlockData } from "@/lib/reportBlocks";

export default function SwotBlockEditor({
  data,
  onChange,
}: {
  data: SwotBlockData;
  onChange: (data: SwotBlockData) => void;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="block text-sm">
        <span className="mb-1 block text-muted">Strengths</span>
        <textarea
          value={data.strengths}
          onChange={(e) => onChange({ ...data, strengths: e.target.value })}
          rows={3}
          placeholder={"Strong brand loyalty\nHigh margins"}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm leading-relaxed text-foreground focus:border-accent focus:outline-none"
        />
      </label>
      <label className="block text-sm">
        <span className="mb-1 block text-muted">Weaknesses</span>
        <textarea
          value={data.weaknesses}
          onChange={(e) => onChange({ ...data, weaknesses: e.target.value })}
          rows={3}
          placeholder={"Reliant on one product line\nHigh customer concentration"}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm leading-relaxed text-foreground focus:border-accent focus:outline-none"
        />
      </label>
      <label className="block text-sm">
        <span className="mb-1 block text-muted">Opportunities</span>
        <textarea
          value={data.opportunities}
          onChange={(e) => onChange({ ...data, opportunities: e.target.value })}
          rows={3}
          placeholder={"New market expansion\nProduct diversification"}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm leading-relaxed text-foreground focus:border-accent focus:outline-none"
        />
      </label>
      <label className="block text-sm">
        <span className="mb-1 block text-muted">Threats</span>
        <textarea
          value={data.threats}
          onChange={(e) => onChange({ ...data, threats: e.target.value })}
          rows={3}
          placeholder={"New competitor\nRegulatory pressure"}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm leading-relaxed text-foreground focus:border-accent focus:outline-none"
        />
      </label>
    </div>
  );
}
