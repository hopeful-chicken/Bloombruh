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
// mapping is spelled out explicitly here instead. The card itself uses
// its module color as a solid left rail rather than a soft tint — the
// same "color is structure, not decoration" language the downloadable
// pitch decks use, not a generic rounded-card hover glow.
const ACCENT_TEXT: Record<NonNullable<ModuleInfo["accentColor"]>, string> = {
  macro: "text-module-macro",
  pokemon: "text-module-pokemon",
  analysis: "text-module-analysis",
};
const ACCENT_RAIL: Record<NonNullable<ModuleInfo["accentColor"]>, string> = {
  macro: "bg-module-macro",
  pokemon: "bg-module-pokemon",
  analysis: "bg-module-analysis",
};

export default function ModuleGrid({ modules }: { modules: ModuleInfo[] }) {
  return (
    <div className="mt-5 grid grid-cols-1 gap-px overflow-hidden rounded-sm border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
      {modules.map((m) => {
        const isClickable = m.status === "live" || m.status === "beta";
        const railClass = m.accentColor ? ACCENT_RAIL[m.accentColor] : "bg-accent";
        const taglineClass = m.accentColor ? ACCENT_TEXT[m.accentColor] : "text-accent";
        const card = (
          <div
            className={[
              "flex h-full items-stretch transition-colors",
              isClickable ? "bg-surface hover:bg-surface-hover" : "bg-surface/40",
            ].join(" ")}
          >
            <span className={`w-1 shrink-0 ${isClickable ? railClass : "bg-border"}`} aria-hidden="true" />
            <div className="flex flex-1 flex-col p-5">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-display text-lg font-medium text-foreground">{m.name}</h3>
                <span
                  className={`shrink-0 rounded-sm px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wide ${BADGE_CLASS[m.status]}`}
                >
                  {BADGE_LABEL[m.status]}
                </span>
              </div>
              <p className={`mt-2 text-sm font-medium ${isClickable ? taglineClass : "text-muted"}`}>{m.tagline}</p>
            </div>
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
