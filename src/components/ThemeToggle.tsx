"use client";

import { useEffect, useState } from "react";

// Small dependency-free light/dark toggle. Light is the default theme; the
// actual theme is applied by adding/removing a `dark` class on <html> (see
// globals.css for the two palettes), and persisted to localStorage so it
// survives reloads. A tiny blocking script in layout.tsx applies the saved
// theme before first paint so there's no flash of the wrong theme.
export default function ThemeToggle() {
  const [isDark, setIsDark] = useState<boolean | null>(null);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
    setIsDark(next);
  }

  // Avoid rendering the wrong icon before we know the real theme (hydration).
  if (isDark === null) {
    return <span className="h-8 w-8 shrink-0" aria-hidden="true" />;
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border text-muted transition-colors hover:border-accent hover:text-accent"
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Switch to light theme" : "Switch to dark theme"}
    >
      {isDark ? (
        // Sun glyph — shown in dark mode, click to go light
        <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
          <circle cx="10" cy="10" r="3.5" stroke="currentColor" strokeWidth="1.4" />
          <path
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            d="M10 2.2v1.8M10 16v1.8M3.6 3.6l1.3 1.3M15.1 15.1l1.3 1.3M2.2 10H4M16 10h1.8M3.6 16.4l1.3-1.3M15.1 4.9l1.3-1.3"
          />
        </svg>
      ) : (
        // Crescent moon glyph — shown in light mode, click to go dark
        <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
          <path
            fill="currentColor"
            d="M16.5 12.3a6.8 6.8 0 0 1-8.8-8.8 7.2 7.2 0 1 0 8.8 8.8Z"
          />
        </svg>
      )}
    </button>
  );
}
