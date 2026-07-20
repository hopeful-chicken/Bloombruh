"use client";

// Top navigation bar for the terminal shell.
// Nice-to-have: pressing "/" anywhere focuses the global search box, which
// jumps straight into the Company Profile module on Enter.

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { modules } from "@/lib/modules";
import ThemeToggle from "@/components/ThemeToggle";

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
    <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="shrink-0 font-mono text-sm font-bold tracking-tight text-foreground sm:text-base"
        >
          <span className="text-accent">&gt;</span> BLOOMBRUH
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {modules.map((m) => {
            const isActive = pathname?.startsWith(m.slug);
            return (
              <Link
                key={m.slug}
                href={m.status === "live" ? m.slug : "#"}
                aria-disabled={m.status !== "live"}
                className={[
                  "rounded px-3 py-1.5 text-sm transition-colors",
                  m.status !== "live"
                    ? "cursor-not-allowed text-muted/60"
                    : isActive
                      ? "bg-surface text-accent"
                      : "text-muted hover:bg-surface hover:text-foreground",
                ].join(" ")}
                onClick={(e) => {
                  if (m.status !== "live") e.preventDefault();
                }}
              >
                {m.name}
                {m.status !== "live" && (
                  <span className="ml-1.5 text-[10px] uppercase tracking-wide text-muted/50">
                    soon
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <form onSubmit={handleSubmit} className="ml-auto flex-1 sm:max-w-xs">
          <div className="flex items-center gap-2 rounded border border-border bg-surface px-2.5 py-1.5 focus-within:border-accent">
            <span className="font-mono text-xs text-muted">/</span>
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
    </header>
  );
}
