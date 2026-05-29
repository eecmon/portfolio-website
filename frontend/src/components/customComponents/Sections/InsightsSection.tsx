import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { InsightDetailBlock, InsightItem } from "@/api/contentApi";
import { getInsightCardsThemeId } from "@/themes/insightsCardsRegistry";
import { SectionShell } from "./SectionShell";
import type { SectionProps } from "./TimelineSection";
import { t } from "@/i18n";

const CARD_WIDTH = 300;
const CARD_HEIGHT = 230;
const INITIAL_VISIBLE_COUNT = 5;

const cardFrameClassName = "insight-card relative shrink-0 overflow-hidden rounded-xl";
const cardFrameStyle = {
  width: CARD_WIDTH,
  maxWidth: "100%",
  height: CARD_HEIGHT,
} as const;

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
          className="h-auto max-w-full w-auto rounded-xl"
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
  const subtext = (lang === "de" ? item.subtext_de : item.subtext_en) || item.subtext;
  const description =
    (lang === "de" ? item.shortDescription_de : item.shortDescription_en) ||
    item.shortDescription;

  return (
    <>
      <article className={`${cardFrameClassName} flex flex-col border-2 border-border bg-background`} style={cardFrameStyle}>
        <div className="insight-card__body flex min-h-0 flex-1 flex-col gap-1.5 overflow-hidden p-4 pb-12">
          <p
            className="line-clamp-2 text-base font-semibold leading-snug"
            style={{ color: "var(--color-text)" }}
          >
            {name}
          </p>
          {subtext && (
            <p
              className="line-clamp-1 text-sm font-medium leading-snug"
              style={{ color: "var(--color-primary)" }}
            >
              {subtext}
            </p>
          )}
          {description && (
            <p className="min-h-0 flex-1 text-sm leading-relaxed text-muted-foreground line-clamp-[6]">
              {description}
            </p>
          )}
        </div>

        <div className="insight-card__actions pointer-events-none absolute inset-x-0 bottom-0 flex justify-end px-4 pt-8 pb-3">
          <Button
            type="button"
            variant="default"
            size="sm"
            className="pointer-events-auto border-transparent shadow-sm hover:opacity-90"
            style={{
              backgroundColor: "var(--color-primary)",
              color: "var(--color-primary-foreground, #ffffff)",
            }}
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
            "h-[min(92vh,960px)] w-[min(720px,calc(100vw-2rem))]",
            "!max-w-none sm:!max-w-none",
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
            {subtext && (
              <p className="mt-2 text-base font-medium" style={{ color: "var(--color-primary)" }}>
                {subtext}
              </p>
            )}
            {description && (
              <p className="mt-2 text-base leading-relaxed text-muted-foreground">{description}</p>
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

function ViewMoreCard({ lang, onClick }: { lang: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${cardFrameClassName} flex flex-col items-center justify-center border-2 border-border bg-background text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2`}
      style={cardFrameStyle}
      aria-label={t(lang, "insightsSection.viewMore")}
    >
      <span className="insight-card__body text-lg font-semibold" style={{ color: "var(--color-text)" }}>
        {t(lang, "insightsSection.viewMore")}
      </span>
    </button>
  );
}

export function InsightsSection({ section, defaultLanguage = "en", theme }: SectionProps) {
  const lang = defaultLanguage;
  const [showAll, setShowAll] = useState(false);
  const items = [...((section.data.items as InsightItem[] | undefined) ?? [])].sort(
    (a, b) => a.order - b.order
  );
  const hasMore = items.length > INITIAL_VISIBLE_COUNT + 1;
  const visibleItems = showAll || !hasMore ? items : items.slice(0, INITIAL_VISIBLE_COUNT);
  const insightCardsThemeId = theme ? getInsightCardsThemeId(theme) : null;

  return (
    <SectionShell section={section} lang={lang}>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t(lang, "insightsSection.noItems")}</p>
      ) : (
        <div
          className="flex flex-wrap gap-5"
          {...(insightCardsThemeId ? { "data-insight-cards": insightCardsThemeId } : {})}
        >
          {visibleItems.map((item) => (
            <InsightCard key={item.id} item={item} lang={lang} />
          ))}
          {hasMore && !showAll && (
            <ViewMoreCard lang={lang} onClick={() => setShowAll(true)} />
          )}
        </div>
      )}
    </SectionShell>
  );
}
