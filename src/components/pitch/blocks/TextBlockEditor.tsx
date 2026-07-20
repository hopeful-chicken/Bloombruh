"use client";

import type { TextBlockData } from "@/lib/reportBlocks";

export default function TextBlockEditor({
  data,
  onChange,
}: {
  data: TextBlockData;
  onChange: (data: TextBlockData) => void;
}) {
  return (
    <textarea
      value={data.body}
      onChange={(e) => onChange({ ...data, body: e.target.value })}
      rows={6}
      placeholder={
        data.placeholder ??
        "Write freely — thesis, a deep dive on one topic, anything."
      }
      className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm leading-relaxed text-foreground focus:border-accent focus:outline-none"
    />
  );
}
