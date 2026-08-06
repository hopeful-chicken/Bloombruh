import Link from "next/link";
import { notFound } from "next/navigation";
import { TRACKS } from "@/data/tracks";
import MarkdownContent from "@/components/research/MarkdownContent";
import TryItCallout from "@/components/lessons/TryItCallout";
import QuizBlock from "@/components/lessons/QuizBlock";

export function generateStaticParams() {
  return TRACKS.flatMap((track) =>
    track.chapters.map((chapter) => ({ trackId: track.id, slug: chapter.slug }))
  );
}

export default async function TrackChapterPage({
  params,
}: {
  params: Promise<{ trackId: string; slug: string }>;
}) {
  const { trackId, slug } = await params;
  const track = TRACKS.find((t) => t.id === trackId);
  if (!track) notFound();

  const index = track.chapters.findIndex((c) => c.slug === slug);
  if (index === -1) notFound();

  const chapter = track.chapters[index];
  const prev = track.chapters[index - 1];
  const next = track.chapters[index + 1];

  return (
    <div>
      <Link
        href={`/lessons/track/${track.id}`}
        className="text-xs text-muted underline decoration-dotted underline-offset-2 hover:text-accent"
      >
        ← {track.name}
      </Link>

      <p className="font-mono mt-4 text-xs uppercase tracking-widest text-accent">
        {track.name} · {index + 1} of {track.chapters.length}
      </p>
      <h1 className="font-display mt-1 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        {chapter.title}
      </h1>
      <p className="mt-2 text-sm text-muted">{chapter.tagline}</p>

      <div className="mt-8 border-t border-border pt-6">
        <MarkdownContent markdown={chapter.body} />
      </div>

      <TryItCallout items={chapter.tryIt} />

      <QuizBlock quiz={chapter.quiz} chapterSlug={`track-${track.id}-${chapter.slug}`} />

      <div className="mt-10 flex items-center justify-between gap-4 border-t border-border pt-6 text-sm">
        {prev ? (
          <Link href={`/lessons/track/${track.id}/${prev.slug}`} className="text-muted hover:text-accent">
            ← {prev.title}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={`/lessons/track/${track.id}/${next.slug}`} className="text-right text-muted hover:text-accent">
            {next.title} →
          </Link>
        ) : (
          <Link href="/lessons" className="text-right text-accent hover:text-accent-dim">
            Back to Lessons →
          </Link>
        )}
      </div>
    </div>
  );
}
