"use client";

// The block-based report builder: the student adds, removes, reorders,
// and retitles blocks to assemble their own report structure instead of
// filling in one fixed form. Blocks state lives one level up (in
// PitchWorkbench) since the PDF export needs it too — this component is
// the editor UI for that state.

import {
  BLOCK_LIBRARY,
  BLOCK_TYPE_LABELS,
  GROUP_ORDER,
  type Block,
  type StatEntry,
  type ChartSeriesOption,
} from "@/lib/reportBlocks";
import type { NewsArticle } from "@/lib/news";
import BlockShell from "./blocks/BlockShell";
import TextBlockEditor from "./blocks/TextBlockEditor";
import SwotBlockEditor from "./blocks/SwotBlockEditor";
import ListBlockEditor from "./blocks/ListBlockEditor";
import StatsBlockEditor from "./blocks/StatsBlockEditor";
import CompsBlockEditor from "./blocks/CompsBlockEditor";
import LboBlockEditor from "./blocks/LboBlockEditor";
import MandaBlockEditor from "./blocks/MandaBlockEditor";
import ChartBlockEditor from "./blocks/ChartBlockEditor";
import NewsBlockEditor from "./blocks/NewsBlockEditor";

export default function ReportBuilder({
  blocks,
  onBlocksChange,
  availableStats,
  availableChartSeries,
  newsArticles,
  defaultEbitda,
}: {
  blocks: Block[];
  onBlocksChange: (blocks: Block[]) => void;
  availableStats: StatEntry[];
  availableChartSeries: ChartSeriesOption[];
  newsArticles: NewsArticle[];
  defaultEbitda: string;
}) {
  function updateBlock(id: string, updater: (b: Block) => Block) {
    onBlocksChange(blocks.map((b) => (b.id === id ? updater(b) : b)));
  }

  function removeBlock(id: string) {
    onBlocksChange(blocks.filter((b) => b.id !== id));
  }

  function moveBlock(id: string, direction: -1 | 1) {
    const index = blocks.findIndex((b) => b.id === id);
    const target = index + direction;
    if (index === -1 || target < 0 || target >= blocks.length) return;
    const next = [...blocks];
    [next[index], next[target]] = [next[target], next[index]];
    onBlocksChange(next);
  }

  function addBlock(libraryId: string) {
    const entry = BLOCK_LIBRARY.find((b) => b.id === libraryId)!;
    let block = entry.create();
    if (block.type === "lbo" && defaultEbitda) {
      block = { ...block, data: { ...block.data, entryEbitda: defaultEbitda } };
    }
    onBlocksChange([...blocks, block]);
  }

  return (
    <div>
      <div className="space-y-5">
        {blocks.map((block, index) => (
          <BlockShell
            key={block.id}
            title={block.title}
            typeLabel={BLOCK_TYPE_LABELS[block.type]}
            onTitleChange={(title) => updateBlock(block.id, (b) => ({ ...b, title }))}
            onMoveUp={() => moveBlock(block.id, -1)}
            onMoveDown={() => moveBlock(block.id, 1)}
            onRemove={() => removeBlock(block.id)}
            canMoveUp={index > 0}
            canMoveDown={index < blocks.length - 1}
          >
            {block.type === "text" && (
              <TextBlockEditor
                data={block.data}
                onChange={(data) => updateBlock(block.id, (b) => ({ ...b, data } as Block))}
              />
            )}
            {block.type === "swot" && (
              <SwotBlockEditor
                data={block.data}
                onChange={(data) => updateBlock(block.id, (b) => ({ ...b, data } as Block))}
              />
            )}
            {block.type === "list" && (
              <ListBlockEditor
                data={block.data}
                onChange={(data) => updateBlock(block.id, (b) => ({ ...b, data } as Block))}
              />
            )}
            {block.type === "stats" && (
              <StatsBlockEditor
                data={block.data}
                availableStats={availableStats}
                onChange={(data) => updateBlock(block.id, (b) => ({ ...b, data } as Block))}
              />
            )}
            {block.type === "comps" && (
              <CompsBlockEditor
                data={block.data}
                onChange={(data) => updateBlock(block.id, (b) => ({ ...b, data } as Block))}
              />
            )}
            {block.type === "lbo" && (
              <LboBlockEditor
                data={block.data}
                onChange={(data) => updateBlock(block.id, (b) => ({ ...b, data } as Block))}
              />
            )}
            {block.type === "manda" && (
              <MandaBlockEditor
                data={block.data}
                onChange={(data) => updateBlock(block.id, (b) => ({ ...b, data } as Block))}
              />
            )}
            {block.type === "chart" && (
              <ChartBlockEditor
                data={block.data}
                availableSeries={availableChartSeries}
                onChange={(data) => updateBlock(block.id, (b) => ({ ...b, data } as Block))}
              />
            )}
            {block.type === "news" && (
              <NewsBlockEditor
                data={block.data}
                articles={newsArticles}
                onChange={(data) => updateBlock(block.id, (b) => ({ ...b, data } as Block))}
              />
            )}
          </BlockShell>
        ))}
      </div>

      {blocks.length === 0 && (
        <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted">
          No blocks yet. Add one below to start building your report.
        </p>
      )}

      <div className="mt-6 rounded-lg border border-border bg-surface p-4">
        <span className="mb-3 block text-xs uppercase tracking-widest text-muted">
          Add a block
        </span>
        {GROUP_ORDER.map((group) => {
          const entries = BLOCK_LIBRARY.filter((entry) => entry.group === group);
          if (entries.length === 0) return null;
          return (
            <div key={group} className="mb-4 last:mb-0">
              <span className="mb-2 block text-[11px] font-semibold uppercase tracking-widest text-accent/80">
                {group}
              </span>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {entries.map((entry) => (
                  <button
                    key={entry.id}
                    type="button"
                    onClick={() => addBlock(entry.id)}
                    className="rounded-md border border-border p-3 text-left text-xs hover:border-accent"
                  >
                    <span className="block font-semibold text-foreground">{entry.label}</span>
                    <span className="mt-1 block text-muted">{entry.description}</span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
