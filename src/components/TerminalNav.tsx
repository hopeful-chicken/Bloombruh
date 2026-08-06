"use client";

// Top navigation bar for the terminal shell.
// Nice-to-have: pressing "/" anywhere focuses the global search box, which
// jumps straight into the Company Profile module on Enter.

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { modules, type ModuleInfo } from "@/lib/modules";
import ThemeToggle from "@/components/ThemeToggle";

// Module signature colors (see docs/DECISIONS.md, Aug 2026) — same
// mapping as ModuleGrid, spelled out because Tailwind can't resolve a
// dynamic `text-module-${x}` class string at build time.
const ACTIVE_TEXT: Record<NonNullable<ModuleInfo["accentColor"]>, string> = {
  macro: "text-module-macro",
  pokemon: "text-module-pokemon",
  analysis: "text-module-analysis",
};

export default function TerminalNav() {
  const router = useRouter();
  const pathname = usePathname();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const isTyping =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);
      if (e.key === "/" && !isTyping) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/profile?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex items-center gap-5 py-3.5">
          <Link
            href="/"
            className="font-logo shrink-0 text-xl font-medium tracking-tight text-foreground sm:text-2xl"
          >
            Bloombruh
          </Link>

          <form onSubmit={handleSubmit} className="ml-auto flex-1 sm:max-w-xs">
            <div className="flex items-center gap-2 rounded-sm border border-border bg-surface px-3 py-1.5 transition-colors focus-within:border-accent">
              <svg
                viewBox="0 0 20 20"
                fill="none"
                className="h-3.5 w-3.5 shrink-0 text-muted"
                aria-hidden="true"
              >
                <circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="1.4" />
                <path d="M17 17l-4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search a ticker…"
                className="w-full bg-transparent font-mono text-sm text-foreground placeholder:text-muted/60 focus:outline-none"
              />
            </div>
          </form>

          <ThemeToggle />
        </div>

        <nav className="hidden flex-wrap items-center gap-6 md:flex">
          {/* Only the modules Adam stands behind get a permanent spot in
              nav — beta modules are real and reachable, but only from
              their own homepage section, not the persistent top bar. */}
          {modules
            .filter((m) => m.status === "live")
            .map((m) => {
            const isActive = pathname?.startsWith(m.slug);
            const activeTextClass = m.accentColor ? ACTIVE_TEXT[m.accentColor] : "text-accent";
            return (
              <Link
                key={m.slug}
                href={m.slug}
                className={[
                  "shrink-0 border-b-2 pb-3 font-mono text-[11px] uppercase tracking-wider transition-colors",
                  isActive
                    ? `border-current ${activeTextClass}`
                    : "border-transparent text-muted hover:text-foreground",
                ].join(" ")}
              >
                {m.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
