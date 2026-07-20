"use client";

// Shared chrome around every block in the report builder: an editable
// title, move up/down, and remove — so each block editor component only
// has to worry about its own fields.

export default function BlockShell({
  title,
  typeLabel,
  onTitleChange,
  onMoveUp,
  onMoveDown,
  onRemove,
  canMoveUp,
  canMoveDown,
  children,
}: {
  title: string;
  typeLabel: string;
  onTitleChange: (title: string) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border bg-surface p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex-1 min-w-[200px]">
          <span className="mb-1 block text-[10px] uppercase tracking-widest text-muted/70">
            {typeLabel}
          </span>
          <input
            type="text"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            className="w-full rounded-md border border-transparent bg-transparent px-1 py-0.5 font-mono text-sm font-semibold uppercase tracking-widest text-accent focus:border-accent focus:bg-background focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={!canMoveUp}
            title="Move up"
            className="rounded border border-border px-2 py-1 text-xs text-muted hover:border-accent hover:text-accent disabled:opacity-30 disabled:hover:border-border disabled:hover:text-muted"
          >
            ↑
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={!canMoveDown}
            title="Move down"
            className="rounded border border-border px-2 py-1 text-xs text-muted hover:border-accent hover:text-accent disabled:opacity-30 disabled:hover:border-border disabled:hover:text-muted"
          >
            ↓
          </button>
          <button
            type="button"
            onClick={onRemove}
            title="Remove block"
            className="rounded border border-border px-2 py-1 text-xs text-muted hover:border-negative hover:text-negative"
          >
            Remove
          </button>
        </div>
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}
