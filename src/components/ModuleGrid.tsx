import Link from "next/link";
import type { ModuleInfo } from "@/lib/modules";

const BADGE_LABEL: Record<ModuleInfo["status"], string> = {
  live: "Live",
  beta: "Beta",
  soon: "Coming soon",
};

const BADGE_CLASS: Record<ModuleInfo["status"], string> = {
  live: "bg-positive/15 text-positive",
  beta: "bg-accent/15 text-accent",
  soon: "bg-muted/15 text-muted",
};

// Module signature colors (see docs/DECISIONS.md, Aug 2026) — Tailwind
// can't resolve a dynamic `text-module-${x}` string at build time, so the
// mapping is spelled out explicitly here instead.
const ACCENT_TEXT: Record<NonNullable<ModuleInfo["accentColor"]>, string> = {
  macro: "text-module-macro",
  pokemon: "text-module-pokemon",
  analysis: "text-module-analysis",
};
const ACCENT_HOVER_BORDER: Record<NonNullable<ModuleInfo["accentColor"]>, string> = {
  macro: "hover:border-module-macro/50",
  pokemon: "hover:border-module-pokemon/50",
  analysis: "hover:border-module-analysis/50",
};
const ACCENT_DOT: Record<NonNullable<ModuleInfo["accentColor"]>, string> = {
  macro: "bg-module-macro",
  pokemon: "bg-module-pokemon",
  analysis: "bg-module-analysis",
};

export default function ModuleGrid({ modules }: { modules: ModuleInfo[] }) {
  return (
    <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {modules.map((m) => {
        const isClickable = m.status === "live" || m.status === "beta";
        const taglineClass = m.accentColor ? ACCENT_TEXT[m.accentColor] : "text-accent";
        const hoverBorderClass = m.accentColor
          ? ACCENT_HOVER_BORDER[m.accentColor]
          : "hover:border-accent/50";
        const card = (
          <div
            className={[
              "flex h-full flex-col rounded-2xl border p-6 transition-colors",
              isClickable
                ? `border-border bg-surface ${hoverBorderClass}`
                : "border-border/60 bg-surface/40",
            ].join(" ")}
          >
            <div className="flex items-start justify-between gap-2">
              <h3 className="flex items-center gap-2 font-display text-lg font-medium text-foreground">
                {m.accentColor && (
                  <span
                    className={`h-1.5 w-1.5 shrink-0 rounded-full ${ACCENT_DOT[m.accentColor]}`}
                    aria-hidden="true"
                  />
                )}
                {m.name}
              </h3>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${BADGE_CLASS[m.status]}`}
              >
                {BADGE_LABEL[m.status]}
              </span>
            </div>
            <p className={`mt-2 text-sm font-medium ${taglineClass}`}>{m.tagline}</p>
          </div>
        );

        return isClickable ? (
          <Link key={m.slug} href={m.slug} className="block h-full">
            {card}
          </Link>
        ) : (
          <div key={m.slug} className="h-full cursor-not-allowed">
            {card}
          </div>
        );
      })}
    </div>
  );
}
