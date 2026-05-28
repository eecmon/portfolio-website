import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { InsightDetailBlock, InsightItem, PortfolioSection } from "@/api/contentApi";
import { SectionShell } from "./SectionShell";

export interface SectionProps {
  section: PortfolioSection;
  defaultLanguage?: string;
  multilanguage?: boolean;
}

function DetailBlockView({ block }: { block: InsightDetailBlock }) {
  return (
    <div className="flex flex-col gap-3">
      {block.imageUrl && (
        <img
          src={block.imageUrl}
          alt={block.header ?? ""}
          className="w-full rounded-xl object-cover"
          loading="lazy"
        />
      )}
      {block.header && (
        <h4 className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>
          {block.header}
        </h4>
      )}
      {block.description && (
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
          {block.description}
        </p>
      )}
    </div>
  );
}

function InsightCard({ item }: { item: InsightItem }) {
  const [open, setOpen] = useState(false);
  const sortedBlocks = [...item.detailBlocks].sort((a, b) => a.order - b.order);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full flex-col gap-2 rounded-xl border border-border p-5 text-left transition-colors hover:border-[var(--color-primary)] hover:bg-muted/30"
      >
        <p className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>
          {item.name}
        </p>
        <p className="text-xs leading-relaxed text-muted-foreground line-clamp-2">
          {item.shortDescription}
        </p>
        <span className="mt-1 text-xs font-medium" style={{ color: "var(--color-primary)" }}>
          View details →
        </span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{item.name}</DialogTitle>
          </DialogHeader>
          {item.shortDescription && (
            <p className="text-sm text-muted-foreground">{item.shortDescription}</p>
          )}
          {sortedBlocks.length > 0 && (
            <div className="flex flex-col gap-6 pt-2">
              {sortedBlocks.map((block) => (
                <DetailBlockView key={block.id} block={block} />
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

export function InsightsSection({ section }: SectionProps) {
  const items = [...((section.data.items as InsightItem[] | undefined) ?? [])].sort(
    (a, b) => a.order - b.order
  );

  return (
    <SectionShell section={section}>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No insights added yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {items.map((item) => (
            <InsightCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </SectionShell>
  );
}
