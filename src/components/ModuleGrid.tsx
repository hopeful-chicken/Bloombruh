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

export default function ModuleGrid({ modules }: { modules: ModuleInfo[] }) {
  return (
    <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {modules.map((m) => {
        const isClickable = m.status === "live" || m.status === "beta";
        const card = (
          <div
            className={[
              "flex h-full flex-col rounded-2xl border p-6 transition-colors",
              isClickable
                ? "border-border bg-surface hover:border-accent/50"
                : "border-border/60 bg-surface/40",
            ].join(" ")}
          >
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-display text-lg font-medium text-foreground">{m.name}</h3>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${BADGE_CLASS[m.status]}`}
              >
                {BADGE_LABEL[m.status]}
              </span>
            </div>
            <p className="mt-2 text-sm font-medium text-accent">{m.tagline}</p>
            <p className="mt-2 text-sm leading-relaxed text-muted">{m.description}</p>
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
