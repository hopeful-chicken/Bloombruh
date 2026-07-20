"use client";

import type { ListBlockData } from "@/lib/reportBlocks";

export default function ListBlockEditor({
  data,
  onChange,
}: {
  data: ListBlockData;
  onChange: (data: ListBlockData) => void;
}) {
  return (
    <textarea
      value={data.items}
      onChange={(e) => onChange({ items: e.target.value })}
      rows={4}
      placeholder={"One point per line\ne.g. Earnings on [date]\nNew product launch"}
      className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm leading-relaxed text-foreground focus:border-accent focus:outline-none"
    />
  );
}
