// Semicircular 0-100 gauge (red-to-green band + needle) for the Snapshot
// panel's "Technical strength" and "Fundamental quality" scores. Plain SVG
// rather than forcing Recharts' bar-chart primitives into a gauge shape —
// simpler to get the needle and banded track looking right.

const CX = 100;
const CY = 92;
const R = 78;

/** A point on the gauge's semicircle at angle `deg` (180 = leftmost/red
 * end, 0 = rightmost/green end), at radius `radius`. */
function pointOnArc(deg: number, radius: number) {
  const rad = (deg * Math.PI) / 180;
  return { x: CX + radius * Math.cos(rad), y: CY - radius * Math.sin(rad) };
}

function arcPath(fromDeg: number, toDeg: number, radius: number): string {
  const start = pointOnArc(fromDeg, radius);
  const end = pointOnArc(toDeg, radius);
  const largeArc = Math.abs(fromDeg - toDeg) > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

export default function ScoreGauge({
  score,
  label,
  subtitle,
}: {
  score: number | null;
  label: string;
  subtitle: string;
}) {
  // score=0 -> needle at 180deg (red end); score=100 -> needle at 0deg (green end)
  const needleDeg = score === null ? 90 : 180 - (score / 100) * 180;
  const needleTip = pointOnArc(needleDeg, R - 14);

  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <svg viewBox="0 0 200 110" className="w-full">
        <path
          d={arcPath(180, 120, R)}
          stroke="#c0392b"
          strokeWidth={14}
          fill="none"
          strokeLinecap="round"
        />
        <path
          d={arcPath(120, 60, R)}
          stroke="#c9a227"
          strokeWidth={14}
          fill="none"
        />
        <path
          d={arcPath(60, 0, R)}
          stroke="#3e7d57"
          strokeWidth={14}
          fill="none"
          strokeLinecap="round"
        />
        {score !== null && (
          <line
            x1={CX}
            y1={CY}
            x2={needleTip.x}
            y2={needleTip.y}
            stroke="currentColor"
            className="text-foreground"
            strokeWidth={2.5}
            strokeLinecap="round"
          />
        )}
        <circle cx={CX} cy={CY} r={4} fill="currentColor" className="text-foreground" />
      </svg>
      <p className="text-center font-mono text-2xl font-semibold text-foreground">
        {score === null ? "—" : score}
      </p>
      <p className="text-center text-xs font-medium text-foreground">{label}</p>
      <p className="text-center text-[11px] text-muted">{subtitle}</p>
    </div>
  );
}
