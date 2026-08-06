import Link from "next/link";
import type { TryIt } from "@/data/course";

// The whole reason this course exists: turn a concept just taught into an
// actual reason to go use a live module. Opens in a new tab on purpose —
// so going to try something on Company Profile or Central Bank Room
// doesn't cost you your place in the chapter. Module colors match the
// same accentColor system used in ModuleGrid.tsx/lib/modules.ts.
const RAIL_CLASS: Record<NonNullable<TryIt["moduleColor"]>, string> = {
  macro: "bg-module-macro",
  pokemon: "bg-module-pokemon",
  analysis: "bg-module-analysis",
};

export default function TryItCallout({ items }: { items: TryIt[] }) {
  if (items.length === 0) return null;

  return (
    <div className="mt-10 border-t border-border pt-8">
      <h2 className="font-mono text-xs font-semibold uppercase tracking-widest text-muted">
        Try it on this site
      </h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <Link
            key={item.href + item.label}
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-stretch overflow-hidden border border-border bg-surface/40 transition-colors hover:bg-surface/70"
          >
            <span
              className={`w-1 shrink-0 ${item.moduleColor ? RAIL_CLASS[item.moduleColor] : "bg-accent"}`}
              aria-hidden="true"
            />
            <div className="flex-1 p-4">
              <p className="text-sm font-semibold text-foreground group-hover:text-accent">
                {item.label} <span aria-hidden="true">↗</span>
              </p>
              <p className="mt-1 text-xs leading-relaxed text-muted">{item.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
