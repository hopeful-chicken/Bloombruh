"use client";

import { useEffect, useState } from "react";

// Small dependency-free dark/light toggle. The actual theme is applied by
// adding/removing a `light` class on <html> (see globals.css for the two
// palettes), and persisted to localStorage so it survives reloads. A tiny
// blocking script in layout.tsx applies the saved theme before first paint
// so there's no flash of the wrong theme.
export default function ThemeToggle() {
  const [isLight, setIsLight] = useState<boolean | null>(null);

  useEffect(() => {
    setIsLight(document.documentElement.classList.contains("light"));
  }, []);

  function toggle() {
    const next = !document.documentElement.classList.contains("light");
    document.documentElement.classList.toggle("light", next);
    localStorage.setItem("theme", next ? "light" : "dark");
    setIsLight(next);
  }

  // Avoid rendering the wrong label before we know the real theme (hydration).
  if (isLight === null) {
    return <span className="w-14" aria-hidden="true" />;
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="rounded border border-border px-2 py-1 font-mono text-xs text-muted transition-colors hover:border-accent hover:text-foreground"
      aria-label="Toggle light/dark theme"
    >
      {isLight ? "LIGHT" : "DARK"}
    </button>
  );
}
