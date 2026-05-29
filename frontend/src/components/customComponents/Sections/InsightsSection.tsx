import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { InsightDetailBlock, InsightItem, PortfolioSection } from "@/api/contentApi";
import { SectionShell } from "./SectionShell";
import { t } from "@/i18n";

export interface SectionProps {
  section: PortfolioSection;
  defaultLanguage?: string;
  multilanguage?: boolean;
}

function blockText(block: InsightDetailBlock, lang: string) {
  const header = (lang === "de" ? block.header_de : block.header_en) || block.header;
  const description =
    (lang === "de" ? block.description_de : block.description_en) || block.description;
  return { header, description };
}

function DetailBlockView({ block, lang }: { block: InsightDetailBlock; lang: string }) {
  const { header, description } = blockText(block, lang);

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

function CardBlockPreview({
  blocks,
  lang,
  compact = false,
}: {
  blocks: InsightDetailBlock[];
  lang: string;
  compact?: boolean;
}) {
  const sorted = [...blocks].sort((a, b) => a.order - b.order);
  const preview = sorted[0];
  if (!preview) return null;

  const { header, description } = blockText(preview, lang);

  return (
    <div className="flex flex-col gap-2">
      {!compact && preview.imageUrl && (
        <img
          src={preview.imageUrl}
          alt={header ?? ""}
          className="aspect-[16/9] w-full rounded-lg object-cover"
          loading="lazy"
        />
      )}
      {header && (
        <p className="text-sm font-medium" style={{ color: "var(--color-text)" }}>
          {header}
        </p>
      )}
      {description && (
        <p
          className={[
            "whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground",
            compact ? "line-clamp-3" : "line-clamp-8",
          ].join(" ")}
        >
          {description}
        </p>
      )}
    </div>
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
      <article className="relative flex h-[288px] flex-col overflow-hidden rounded-xl border border-border bg-background transition-colors hover:border-[var(--color-primary)] hover:bg-muted/20">
        <div className="flex flex-1 flex-col gap-2 overflow-hidden p-5 pb-14">
          <p className="text-base font-semibold leading-snug" style={{ color: "var(--color-text)" }}>
            {name}
          </p>
          {shortDescription && (
            <p className="line-clamp-1 text-sm leading-relaxed text-muted-foreground">
              {shortDescription}
            </p>
          )}
          {sortedBlocks.length > 0 ? (
            <CardBlockPreview blocks={sortedBlocks} lang={lang} compact />
          ) : (
            !shortDescription && (
              <p className="text-sm text-muted-foreground">{t(lang, "insightsSection.noDetailContent")}</p>
            )
          )}
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-end bg-gradient-to-t from-background via-background/90 to-transparent px-5 pt-10 pb-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="pointer-events-auto shadow-sm"
            onClick={() => setOpen(true)}
          >
            {t(lang, "insightsSection.viewDetails")}
          </Button>
        </div>
      </article>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className={[
            "flex max-w-none flex-col gap-0 overflow-hidden p-0",
            "h-[min(85vh,720px)] w-[min(720px,calc(100%-2rem))]",
            "sm:max-w-none",
          ].join(" ")}
        >
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

          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
            {sortedBlocks.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t(lang, "insightsSection.noDetailContent")}</p>
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
        <p className="text-sm text-muted-foreground">{t(lang, "insightsSection.noItems")}</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {items.map((item) => (
            <InsightCard key={item.id} item={item} lang={lang} />
          ))}
        </div>
      )}
    </SectionShell>
  );
}
