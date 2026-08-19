import Link from "next/link";
import { notFound } from "next/navigation";
import { DEAL_TEARDOWNS } from "@/data/dealTeardowns";
import ArticleBody from "@/components/research/ArticleBody";
import MarkdownContent from "@/components/research/MarkdownContent";

export function generateStaticParams() {
  return DEAL_TEARDOWNS.map((deal) => ({ slug: deal.id }));
}

export default async function DealTeardownPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const deal = DEAL_TEARDOWNS.find((d) => d.id === slug);
  if (!deal) notFound();

  return (
    <div>
      <Link
        href="/deals"
        className="text-xs text-muted underline decoration-dotted underline-offset-2 hover:text-accent"
      >
        ← All Deal Teardowns
      </Link>

      <p className="font-mono mt-4 text-[11px] text-muted">{deal.date}</p>
      <h1 className="font-display mt-1 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        {deal.title}
      </h1>
      <p className="mt-1 text-sm text-muted">{deal.tagline}</p>

      <div className="mt-6 rounded-lg border border-border bg-surface/40 p-4">
        <p className="font-mono text-[11px] uppercase tracking-wide text-muted">The facts</p>
        <div className="mt-3 grid gap-x-6 gap-y-3 sm:grid-cols-2">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted">Acquirer</p>
            <p className="mt-0.5 text-sm text-foreground">{deal.acquirer}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted">Target</p>
            <p className="mt-0.5 text-sm text-foreground">{deal.target}</p>
          </div>
          {deal.facts.map((f) => (
            <div key={f.label}>
              <p className="text-[11px] uppercase tracking-wide text-muted">{f.label}</p>
              <p className="mt-0.5 text-sm text-foreground">{f.value}</p>
              {f.note && <p className="mt-0.5 text-xs text-muted">{f.note}</p>}
            </div>
          ))}
        </div>
        <p className="mt-4 border-t border-border pt-3 text-xs text-accent">{deal.stance}</p>
      </div>

      <div className="mt-8">
        <ArticleBody body={deal.body} />
      </div>

      <div className="mt-12 border-t border-border pt-6">
        <MarkdownContent markdown={deal.walkthrough} />
      </div>
    </div>
  );
}
