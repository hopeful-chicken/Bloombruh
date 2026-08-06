import Link from "next/link";

// The homepage's terminal window — styled with the site's own theme
// tokens (surface/border/accent) rather than a hardcoded black box, so it
// reads as part of the page in both light and dark mode instead of a
// foreign dark rectangle dropped onto a cream background. Lines stagger
// in once on load via CSS animation-delay — no JS typing simulation, so
// no hydration/timing complexity, but it still reads as the terminal
// "booting."

type Line =
  | { kind: "prompt"; command: string }
  | { kind: "output"; text: string }
  | { kind: "list"; items: { text: string; colorClass: string }[] }
  | { kind: "link"; href: string; label: string };

const LINES: Line[] = [
  { kind: "prompt", command: "whoami" },
  { kind: "output", text: "Adam — 2nd year economics, UCL. Building this between lectures." },
  { kind: "prompt", command: "ls modules/ --live" },
  {
    kind: "list",
    items: [
      { text: "company-profile/", colorClass: "text-accent" },
      { text: "central-bank-room/", colorClass: "text-module-macro" },
      { text: "pokemon-cards/", colorClass: "text-module-pokemon" },
      { text: "my-analysis/", colorClass: "text-module-analysis" },
    ],
  },
  { kind: "prompt", command: "cat todo.txt" },
  { kind: "output", text: "Add three more modules. Fix the bug I found this morning. Sleep." },
  { kind: "prompt", command: "open profile" },
  { kind: "link", href: "/profile", label: "Open Company Profile" },
];

export default function TerminalHero() {
  let delay = 0;
  return (
    <div className="overflow-hidden border border-border bg-surface">
      {/* window chrome */}
      <div className="flex items-center gap-2 border-b border-border bg-surface-hover px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-[#e2685a]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#e0b84a]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#55b685]" />
        <span className="ml-2 font-mono text-[11px] text-muted">adam@bloombruh — zsh</span>
      </div>

      {/* body */}
      <div className="relative min-h-[280px] px-5 py-5 sm:px-6 sm:py-6">
        {LINES.map((line, i) => {
          delay += line.kind === "prompt" ? 0.5 : 0.3;
          const style = { animationDelay: `${delay}s` };
          if (line.kind === "prompt") {
            return (
              <p key={i} className="term-line mt-3 font-mono text-[13px] leading-relaxed first:mt-0 sm:text-sm" style={style}>
                <span className="text-accent">adam@bloombruh</span>
                <span className="text-muted"> ~ % </span>
                <span className="text-foreground">{line.command}</span>
              </p>
            );
          }
          if (line.kind === "output") {
            return (
              <p key={i} className="term-line font-mono text-[13px] leading-relaxed text-muted sm:text-sm" style={style}>
                {line.text}
              </p>
            );
          }
          if (line.kind === "list") {
            return (
              <p key={i} className="term-line font-mono text-[13px] leading-relaxed sm:text-sm" style={style}>
                {line.items.map((item, j) => (
                  <span key={item.text} className={item.colorClass}>
                    {item.text}
                    {j < line.items.length - 1 ? "  " : ""}
                  </span>
                ))}
              </p>
            );
          }
          return (
            <Link
              key={i}
              href={line.href}
              className="term-line mt-1 inline-flex items-center gap-2 border border-accent px-4 py-2 font-mono text-[13px] font-semibold text-accent transition-colors hover:bg-accent hover:text-accent-foreground sm:text-sm"
              style={style}
            >
              {line.label} <span aria-hidden="true">→</span>
            </Link>
          );
        })}
        <span
          className="term-line term-cursor mt-3 inline-block h-3.5 w-2 bg-accent align-middle"
          style={{ animationDelay: `${delay + 0.5}s` }}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
