// A small "logo" treatment for companies a write-up discusses, without
// hotlinking an actual external logo file. Real company logos are
// trademarked, and pulling one from a random URL means depending on that
// URL staying up and matching this site's own visual language — this mark
// is guaranteed to exist, load, and look consistent for every company
// mentioned, in the site's own terminal/mono style, the same way Bloomberg
// terminal itself renders a ticker mark rather than every issuer's real logo.

export type CompanyBadgeInfo = {
  mark: string; // short letter mark shown in the box, e.g. "SK", "MU"
  name: string;
  tickers: string;
  color?: string; // defaults to the site accent
};

function Badge({ mark, name, tickers, color }: CompanyBadgeInfo) {
  const c = color ?? "var(--accent)";
  return (
    <div className="flex items-center gap-3 rounded-sm border border-border bg-surface/60 px-4 py-3">
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border font-mono text-xs font-bold"
        style={{ borderColor: c, color: c }}
      >
        {mark}
      </div>
      <div className="min-w-0">
        <p className="font-display truncate text-sm font-semibold text-foreground">{name}</p>
        <p className="font-mono text-[11px] text-muted">{tickers}</p>
      </div>
    </div>
  );
}

export default function CompanyBadgeRow({ companies }: { companies: CompanyBadgeInfo[] }) {
  return (
    <div className="my-6 flex flex-wrap gap-3">
      {companies.map((c) => (
        <Badge key={c.name} {...c} />
      ))}
    </div>
  );
}
