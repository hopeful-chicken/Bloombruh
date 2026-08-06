// The Bloombruh mark: a small four-bar "chart" icon, one bar per color
// already in use across the site (the brand accent plus the three module
// signature colors — see docs/DECISIONS.md), so the logo isn't an
// invented new palette, it's the site's own color system turned into a
// mark. Reads as a little candlestick/sparkline cluster — on-theme for a
// finance tool — and doubles as a loading/brand flourish anywhere the
// wordmark alone would be too plain.
export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 44 32" className={className} aria-hidden="true">
      <rect x="0" y="16" width="8" height="16" rx="2" className="fill-module-macro" />
      <rect x="12" y="8" width="8" height="24" rx="2" className="fill-accent" />
      <rect x="24" y="20" width="8" height="12" rx="2" className="fill-module-pokemon" />
      <rect x="36" y="0" width="8" height="32" rx="2" className="fill-module-analysis" />
    </svg>
  );
}

export default function Logo({
  size = "sm",
  className = "",
}: {
  size?: "sm" | "lg";
  className?: string;
}) {
  const textClass =
    size === "lg"
      ? "text-6xl sm:text-7xl"
      : "text-xl sm:text-2xl";
  return (
    <span className={`inline-flex items-center gap-2.5 sm:gap-3 ${className}`}>
      <LogoMark className={`${size === "lg" ? "h-8 w-11 sm:h-10 sm:w-14" : "h-6 w-[2.1rem]"} shrink-0`} />
      <span className={`font-logo font-medium tracking-tight text-foreground ${textClass}`}>
        Bloom<span className="text-accent">bruh</span>
      </span>
    </span>
  );
}
