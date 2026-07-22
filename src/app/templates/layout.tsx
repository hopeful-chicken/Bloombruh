export default function TemplatesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="mb-6 rounded-md border border-border bg-surface/60 px-4 py-2 text-xs text-muted">
        Every template downloads as a real Excel workbook with live formulas —
        change an assumption and the model recalculates. Prefilled numbers come
        from the same free sources as the rest of this site (Twelve Data, EODHD
        for Hong Kong, SEC EDGAR) and every file carries its own &ldquo;Data
        &amp; Sources&rdquo; sheet; anything with no real data stays a blank
        input, never an estimate. Educational templates, not investment advice.
      </div>
      {children}
    </div>
  );
}
