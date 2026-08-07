// Shared between MarkdownContent (which stamps ids on rendered <h2>s) and
// extractSections (which reads the raw markdown to build a section nav) —
// both need to produce the exact same id for the same heading text, or the
// nav's anchor links silently go nowhere.
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}
