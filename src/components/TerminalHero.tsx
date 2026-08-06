import Link from "next/link";

// The homepage's real centerpiece — an actual terminal window, not a
// generic hero graphic or a stat strip. Committed fully to dark/amber
// regardless of site theme (see globals.css), same "commit to one
// register" move the reference pitch decks make on their own title
// slides. Lines stagger in once on load via CSS animation-delay — no JS
// typing simulation, so no hydration/timing complexity, but it still
// reads as the terminal "booting."

type Line =
  | { kind: "prompt"; command: string }
  | { kind: "output"; text: string }
  | { kind: "list"; items: string[] }
  | { kind: "link"; href: string; label: string };

const LINES: Line[] = [
  { kind: "prompt", command: "whoami" },
  { kind: "output", text: "A free, terminal-style research site — built by one UCL econ student. Not a company." },
  { kind: "prompt", command: "ls modules/ --live" },
  { kind: "list", items: ["company-profile/", "central-bank-room/", "pokemon-cards/", "my-analysis/"] },
  { kind: "prompt", command: "cat rules.txt" },
  { kind: "output", text: "Real prices. Real filings. Real central-bank data. Zero fabricated numbers." },
  { kind: "prompt", command: "open profile" },
  { kind: "link", href: "/profile", label: "Open Company Profile" },
];

export default function TerminalHero() {
  let delay = 0;
  return (
    <div className="overflow-hidden border border-[#2a2f28] bg-[#0c0f0a] shadow-[0_0_60px_-15px_rgba(224,184,74,0.25)]">
      {/* window chrome */}
      <div className="flex items-center gap-2 border-b border-[#2a2f28] bg-[#14180f] px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-[#e2685a]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#e0b84a]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#55b685]" />
        <span className="ml-2 font-mono text-[11px] text-[#6f7a5e]">adam@bloombruh — zsh</span>
      </div>

      {/* body */}
      <div className="term-scanlines relative min-h-[280px] px-5 py-5 sm:px-6 sm:py-6">
        {LINES.map((line, i) => {
          delay += line.kind === "prompt" ? 0.5 : 0.3;
          const style = { animationDelay: `${delay}s` };
          if (line.kind === "prompt") {
            return (
              <p key={i} className="term-line mt-3 font-mono text-[13px] leading-relaxed first:mt-0 sm:text-sm" style={style}>
                <span className="text-[#e0b84a]">adam@bloombruh</span>
                <span className="text-[#6f7a5e]"> ~ % </span>
                <span className="text-[#f1eee5]">{line.command}</span>
              </p>
            );
          }
          if (line.kind === "output") {
            return (
              <p key={i} className="term-line font-mono text-[13px] leading-relaxed text-[#a9b39a] sm:text-sm" style={style}>
                {line.text}
              </p>
            );
          }
          if (line.kind === "list") {
            return (
              <p key={i} className="term-line font-mono text-[13px] leading-relaxed text-[#6fa8dc] sm:text-sm" style={style}>
                {line.items.join("  ")}
              </p>
            );
          }
          return (
            <Link
              key={i}
              href={line.href}
              className="term-line mt-1 inline-flex items-center gap-2 border border-[#e0b84a] px-4 py-2 font-mono text-[13px] font-semibold text-[#e0b84a] transition-colors hover:bg-[#e0b84a] hover:text-[#0c0f0a] sm:text-sm"
              style={style}
            >
              {line.label} <span aria-hidden="true">→</span>
            </Link>
          );
        })}
        <span
          className="term-line term-cursor mt-3 inline-block h-3.5 w-2 bg-[#e0b84a] align-middle"
          style={{ animationDelay: `${delay + 0.5}s` }}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
