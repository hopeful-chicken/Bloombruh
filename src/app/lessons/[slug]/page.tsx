import Link from "next/link";
import { notFound } from "next/navigation";
import { LESSONS } from "@/data/lessons";
import MarkdownContent from "@/components/research/MarkdownContent";

export function generateStaticParams() {
  return LESSONS.map((lesson) => ({ slug: lesson.slug }));
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const index = LESSONS.findIndex((l) => l.slug === slug);
  if (index === -1) notFound();

  const lesson = LESSONS[index];
  const prev = LESSONS[index - 1];
  const next = LESSONS[index + 1];

  return (
    <div>
      <Link
        href="/lessons"
        className="text-xs text-muted underline decoration-dotted underline-offset-2 hover:text-accent"
      >
        ← All lessons
      </Link>

      <p className="font-mono mt-4 text-xs uppercase tracking-widest text-accent">
        {lesson.category}
      </p>
      <h1 className="font-display mt-1 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        {lesson.title}
      </h1>
      <p className="mt-2 text-sm text-muted">{lesson.tagline}</p>

      <div className="mt-8 border-t border-border pt-6">
        <MarkdownContent markdown={lesson.body} />
      </div>

      <div className="mt-10 flex items-center justify-between gap-4 border-t border-border pt-6 text-sm">
        {prev ? (
          <Link
            href={`/lessons/${prev.slug}`}
            className="text-muted hover:text-accent"
          >
            ← {prev.title}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={`/lessons/${next.slug}`}
            className="text-right text-muted hover:text-accent"
          >
            {next.title} →
          </Link>
        ) : (
          <span />
        )}
      </div>
    </div>
  );
}
