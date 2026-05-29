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

function DetailBlockView({ block, lang }: { block: InsightDetailBlock; lang: string }) {
  const header = (lang === "de" ? block.header_de : block.header_en) || block.header;
  const description =
    (lang === "de" ? block.description_de : block.description_en) || block.description;

  return (
    <article className="flex flex-col gap-4 border-b border-border pb-8 last:border-b-0 last:pb-0">
      {block.imageUrl && (
        <img
          src={block.imageUrl}
          alt={header ?? ""}
          className="aspect-[16/9] w-full rounded-xl object-cover"
          loading="lazy"
        />
      )}
      {header && (
        <h3 className="text-lg font-semibold tracking-tight" style={{ color: "var(--color-text)" }}>
          {header}
        </h3>
      )}
      {description && (
        <p className="whitespace-pre-wrap text-base leading-7 text-muted-foreground">
          {description}
        </p>
      )}
    </article>
  );
}

function InsightCard({ item, lang }: { item: InsightItem; lang: string }) {
  const [open, setOpen] = useState(false);
  const sortedBlocks = [...item.detailBlocks].sort((a, b) => a.order - b.order);
  const name = (lang === "de" ? item.name_de : item.name_en) || item.name;
  const shortDescription =
    (lang === "de" ? item.shortDescription_de : item.shortDescription_en) ||
    item.shortDescription;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full flex-col gap-2 rounded-xl border border-border p-5 text-left transition-colors hover:border-[var(--color-primary)] hover:bg-muted/30"
      >
        <p className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>
          {name}
        </p>
        <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
          {shortDescription}
        </p>
        <span className="mt-1 text-xs font-medium" style={{ color: "var(--color-primary)" }}>
          View details →
        </span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className={[
            "flex max-w-none flex-col gap-0 overflow-hidden p-0",
            "h-[min(85vh,720px)] w-[min(720px,calc(100%-2rem))]",
            "sm:max-w-none",
          ].join(" ")}
        >
          {/* Fixed header — same for every project */}
          <div className="shrink-0 border-b border-border px-6 py-5 pr-14">
            <DialogHeader className="gap-2">
              <DialogTitle
                className="text-2xl font-bold leading-tight tracking-tight"
                style={{ color: "var(--color-text)" }}
              >
                {name}
              </DialogTitle>
            </DialogHeader>
            {shortDescription && (
              <p className="mt-2 text-base leading-relaxed text-muted-foreground">
                {shortDescription}
              </p>
            )}
          </div>

          {/* Scrollable blog body — fixed window, content scrolls inside */}
          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
            {sortedBlocks.length === 0 ? (
              <p className="text-sm text-muted-foreground">No detail content yet.</p>
            ) : (
              <div className="flex flex-col gap-8">
                {sortedBlocks.map((block) => (
                  <DetailBlockView key={block.id} block={block} lang={lang} />
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function InsightsSection({ section, defaultLanguage = "en" }: SectionProps) {
  const lang = defaultLanguage;
  const items = [...((section.data.items as InsightItem[] | undefined) ?? [])].sort(
    (a, b) => a.order - b.order
  );

  return (
    <SectionShell section={section} lang={lang}>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No insights added yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {items.map((item) => (
            <InsightCard key={item.id} item={item} lang={lang} />
          ))}
        </div>
      )}
    </SectionShell>
  );
}
