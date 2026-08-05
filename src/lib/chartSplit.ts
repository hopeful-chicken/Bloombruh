// Splits a single price/return series into "above baseline" and "below
// baseline" halves so a chart can render green above / red below a
// reference value (a period's starting price, an indexed chart's 100 line,
// or an instrument's previous close) — with the crossing itself inserted
// as a shared point at exactly the baseline value, so the color change
// happens right where the line actually crosses, not at the nearest real
// data point on either side.
//
// Why a shared crossing point works: at the moment a series crosses
// baseline, its value *is* the baseline by definition — no interpolation
// needed beyond placing that value at the correct position in the
// sequence. Giving that row a value in both the "above" and "below" keys
// lets Recharts draw the outgoing color's line right up to the crossing
// and the incoming color's line starting from it, with no visual gap.

export type SplitInput = { date: string; close: number };
export type SplitRow = { date: string; above: number | null; below: number | null };

export function splitAtBaseline(points: SplitInput[], baseline: number): SplitRow[] {
  const rows: SplitRow[] = [];
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    const isAbove = p.close >= baseline;
    rows.push({ date: p.date, above: isAbove ? p.close : null, below: isAbove ? null : p.close });

    const next = points[i + 1];
    if (next) {
      const nextIsAbove = next.close >= baseline;
      if (isAbove !== nextIsAbove) {
        // Crossing between this point and the next — shared boundary row.
        // Reuses the next point's date label rather than inventing a
        // fractional one: this is a categorical (not numeric) x-axis, so
        // the label just needs to sit between the two ticks, not encode a
        // precise interpolated time.
        rows.push({ date: next.date, above: baseline, below: baseline });
      }
    }
  }
  return rows;
}
