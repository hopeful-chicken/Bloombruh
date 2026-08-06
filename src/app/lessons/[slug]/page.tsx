import Link from "next/link";
import { notFound } from "next/navigation";
import { COURSE_CHAPTERS } from "@/data/course";
import MarkdownContent from "@/components/research/MarkdownContent";
import TryItCallout from "@/components/lessons/TryItCallout";
import QuizBlock from "@/components/lessons/QuizBlock";

export function generateStaticParams() {
  return COURSE_CHAPTERS.map((chapter) => ({ slug: chapter.slug }));
}

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const index = COURSE_CHAPTERS.findIndex((c) => c.slug === slug);
  if (index === -1) notFound();

  const chapter = COURSE_CHAPTERS[index];
  const prev = COURSE_CHAPTERS[index - 1];
  const next = COURSE_CHAPTERS[index + 1];

  return (
    <div>
      <Link
        href="/lessons"
        className="text-xs text-muted underline decoration-dotted underline-offset-2 hover:text-accent"
      >
        ← Finance 101
      </Link>

      <p className="font-mono mt-4 text-xs uppercase tracking-widest text-accent">
        Chapter {chapter.number} · {chapter.track}
      </p>
      <h1 className="font-display mt-1 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        {chapter.title}
      </h1>
      <p className="mt-2 text-sm text-muted">{chapter.tagline}</p>

      <div className="mt-8 border-t border-border pt-6">
        <MarkdownContent markdown={chapter.body} />
      </div>

      {chapter.templateLink && (
        <div className="mt-8 border border-accent bg-accent/10 p-4 sm:p-5">
          <p className="text-sm text-foreground">
            <Link
              href={chapter.templateLink.href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-accent underline decoration-dotted underline-offset-2 hover:text-accent-dim"
            >
              {chapter.templateLink.label} ↗
            </Link>
          </p>
        </div>
      )}

      <TryItCallout items={chapter.tryIt} />

      <QuizBlock quiz={chapter.quiz} chapterSlug={chapter.slug} />

      <div className="mt-10 flex items-center justify-between gap-4 border-t border-border pt-6 text-sm">
        {prev ? (
          <Link href={`/lessons/${prev.slug}`} className="text-muted hover:text-accent">
            ← Ch. {prev.number}: {prev.title}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={`/lessons/${next.slug}`} className="text-right text-muted hover:text-accent">
            Ch. {next.number}: {next.title} →
          </Link>
        ) : (
          <Link href="/lessons" className="text-right text-accent hover:text-accent-dim">
            Back to course overview →
          </Link>
        )}
      </div>
    </div>
  );
}
