// The Model Templates module: downloadable, personalizable Excel models —
// the work analysts actually produce across investment banking, equity
// research, asset management, and sales & trading, prefilled with this
// site's real data. All configuration happens client-side in
// TemplateGallery; generation happens server-side in /api/template.

import TemplateGallery from "@/components/templates/TemplateGallery";

export default function TemplatesPage() {
  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-widest text-accent">
        Model Templates
      </p>
      <h1 className="font-display mt-1 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        Build what analysts build
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
        Pick a template, choose a company and sector, and download a working
        Excel model prefilled with real data — then make it yours. DCF and
        deal models for the banking side, an initiation note for equity
        research, a portfolio one-pager for asset management, a morning
        market sheet for the trading floor. Each one teaches the shape of
        the real thing, tells you which assumptions matter, and adapts its
        guidance to the sector you pick.
      </p>

      <TemplateGallery />
    </div>
  );
}
