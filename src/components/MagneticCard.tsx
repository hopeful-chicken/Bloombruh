"use client";

import { useState, type ReactNode } from "react";

type Props = {
  /** Signature color for whatever this wraps, e.g. "var(--module-macro)" */
  accent: string;
  children: ReactNode;
  className?: string;
  /** Full tilt range in degrees (so the card moves ±maxTilt/2). Default 12. */
  maxTilt?: number;
  /** Whether the card also lifts (translateY) toward the cursor. Off by
   * default for tight, seamless grids (see ModuleGrid.tsx) where a lift
   * would visually pop the card out of its shared hairline border. */
  lift?: boolean;
};

export function MagneticCard({ accent, children, className = "", maxTilt = 12, lift = false }: Props) {
  const [tilt, setTilt] = useState<{ mx: number; my: number; rx: number; ry: number } | null>(null);

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (e.pointerType !== "mouse") return; // no tilt on touch
    const r = e.currentTarget.getBoundingClientRect();
    const mx = e.clientX - r.left;
    const my = e.clientY - r.top;
    setTilt({
      mx: Math.round(mx),
      my: Math.round(my),
      rx: (mx / r.width - 0.5) * maxTilt,
      ry: (my / r.height - 0.5) * maxTilt,
    });
  }

  return (
    <div
      onPointerMove={onPointerMove}
      onPointerLeave={() => setTilt(null)}
      className={`relative overflow-hidden transition-transform duration-150 ease-out motion-reduce:transform-none ${className}`}
      style={{
        transform: tilt
          ? `perspective(700px) rotateX(${(-tilt.ry).toFixed(2)}deg) rotateY(${tilt.rx.toFixed(2)}deg)${lift ? " translateY(-4px)" : ""}`
          : "perspective(700px)",
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: tilt
            ? `radial-gradient(260px circle at ${tilt.mx}px ${tilt.my}px, color-mix(in srgb, ${accent} 13%, transparent), transparent 70%)`
            : "none",
        }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}
