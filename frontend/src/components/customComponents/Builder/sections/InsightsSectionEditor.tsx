import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { uploadFile } from "@/api/uploadApi";
import type {
  InsightDetailBlock,
  InsightItem,
  PortfolioSection,
} from "@/api/contentApi";
import { t } from "@/i18n";

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

// ── Detail block editor ───────────────────────────────────────────

interface DetailBlockEditorProps {
  block: InsightDetailBlock;
  isFirst: boolean;
  isLast: boolean;
  lang: string;
  onUpdate: (patch: Partial<InsightDetailBlock>) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

function DetailBlockEditor({ block, isFirst, isLast, lang, onUpdate, onRemove, onMoveUp, onMoveDown }: DetailBlockEditorProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleUpload(file: File) {
    setUploading(true);
    try {
      const url = await uploadFile(file);
      onUpdate({ imageUrl: url });
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2 rounded border border-dashed border-border bg-muted/20 p-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button type="button" disabled={isFirst} onClick={onMoveUp}
            className="rounded p-0.5 text-xs text-muted-foreground hover:text-foreground disabled:opacity-30">↑</button>
          <button type="button" disabled={isLast} onClick={onMoveDown}
            className="rounded p-0.5 text-xs text-muted-foreground hover:text-foreground disabled:opacity-30">↓</button>
        </div>
        <button type="button" onClick={onRemove}
          className="text-xs text-destructive hover:underline">
          {t(lang, "common.remove")}
        </button>
      </div>

      <Input placeholder={t(lang, "insightsSection.blockHeader")} value={block.header ?? ""}
        onChange={(e) => onUpdate({ header: e.target.value })} />
      <Textarea placeholder={t(lang, "insightsSection.blockDescription")} value={block.description ?? ""}
        onChange={(e) => onUpdate({ description: e.target.value })} className="min-h-[60px]" />

      <div className="flex items-center gap-2">
        {block.imageUrl && (
          <img src={block.imageUrl} alt="" className="h-12 w-16 shrink-0 rounded object-cover" />
        )}
        <input ref={fileRef} type="file" accept="image/*" className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleUpload(file);
            e.target.value = "";
          }}
        />
        <Button variant="outline" size="sm" disabled={uploading}
          onClick={() => fileRef.current?.click()}>
          {uploading
            ? t(lang, "common.uploading")
            : block.imageUrl
              ? t(lang, "common.changeImage")
              : t(lang, "imageSection.addImage")}
        </Button>
        {block.imageUrl && (
          <button type="button" className="text-xs text-muted-foreground hover:text-destructive"
            onClick={() => onUpdate({ imageUrl: undefined })}>
            {t(lang, "common.removeIcon")}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Insight item editor ───────────────────────────────────────────

interface ItemEditorProps {
  item: InsightItem;
  isFirst: boolean;
  isLast: boolean;
  lang: string;
  onUpdate: (patch: Partial<InsightItem>) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

function ItemEditor({ item, isFirst, isLast, lang, onUpdate, onRemove, onMoveUp, onMoveDown }: ItemEditorProps) {
  const sortedBlocks = [...item.detailBlocks].sort((a, b) => a.order - b.order);

  function addBlock() {
    const maxOrder = sortedBlocks.reduce((m, b) => Math.max(m, b.order), -1);
    const next: InsightDetailBlock[] = [
      ...item.detailBlocks,
      { id: uid(), order: maxOrder + 1 },
    ];
    onUpdate({ detailBlocks: next });
  }

  function updateBlock(id: string, patch: Partial<InsightDetailBlock>) {
    onUpdate({
      detailBlocks: item.detailBlocks.map((b) => (b.id === id ? { ...b, ...patch } : b)),
    });
  }

  function removeBlock(id: string) {
    onUpdate({ detailBlocks: item.detailBlocks.filter((b) => b.id !== id) });
  }

  function moveBlock(id: string, dir: "up" | "down") {
    const idx = sortedBlocks.findIndex((b) => b.id === id);
    const swapIdx = dir === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sortedBlocks.length) return;
    const a = sortedBlocks[idx];
    const swap = sortedBlocks[swapIdx];
    onUpdate({
      detailBlocks: item.detailBlocks.map((b) => {
        if (b.id === a.id) return { ...b, order: swap.order };
        if (b.id === swap.id) return { ...b, order: a.order };
        return b;
      }),
    });
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button type="button" disabled={isFirst} onClick={onMoveUp}
            className="rounded p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-30">↑</button>
          <button type="button" disabled={isLast} onClick={onMoveDown}
            className="rounded p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-30">↓</button>
        </div>
        <button type="button" onClick={onRemove}
          className="text-xs text-destructive hover:underline">
          {t(lang, "common.remove")}
        </button>
      </div>

      <Input placeholder={t(lang, "insightsSection.name")} value={item.name}
        onChange={(e) => onUpdate({ name: e.target.value })} />
      <Textarea placeholder={t(lang, "insightsSection.shortDescription")} value={item.shortDescription}
        onChange={(e) => onUpdate({ shortDescription: e.target.value })} className="min-h-[60px]" />

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">
            {t(lang, "insightsSection.addBlock").replace("Add ", "").replace("hinzufügen", "").trim()}
          </span>
          <Button variant="outline" size="sm" onClick={addBlock}>
            + {t(lang, "insightsSection.addBlock")}
          </Button>
        </div>
        {sortedBlocks.map((block, idx) => (
          <DetailBlockEditor key={block.id} block={block} lang={lang}
            isFirst={idx === 0} isLast={idx === sortedBlocks.length - 1}
            onUpdate={(patch) => updateBlock(block.id, patch)}
            onRemove={() => removeBlock(block.id)}
            onMoveUp={() => moveBlock(block.id, "up")}
            onMoveDown={() => moveBlock(block.id, "down")} />
        ))}
      </div>
    </div>
  );
}

// ── Main editor ───────────────────────────────────────────────────

interface InsightsSectionEditorProps {
  section: PortfolioSection;
  lang?: string;
  onUpdate: (patch: Partial<PortfolioSection>) => void;
}

export function InsightsSectionEditor({ section, lang = "en", onUpdate }: InsightsSectionEditorProps) {
  const iconInputRef = useRef<HTMLInputElement>(null);
  const [uploadingIcon, setUploadingIcon] = useState(false);

  const items = [...((section.data.items as InsightItem[] | undefined) ?? [])].sort(
    (a, b) => a.order - b.order
  );

  function patchItems(next: InsightItem[]) {
    onUpdate({ data: { ...section.data, items: next } });
  }

  function addItem() {
    const maxOrder = items.reduce((m, it) => Math.max(m, it.order), -1);
    patchItems([
      ...items,
      { id: uid(), order: maxOrder + 1, name: "", shortDescription: "", detailBlocks: [] },
    ]);
  }

  function updateItem(id: string, patch: Partial<InsightItem>) {
    patchItems(items.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  }

  function removeItem(id: string) {
    patchItems(items.filter((it) => it.id !== id));
  }

  function moveItem(id: string, dir: "up" | "down") {
    const idx = items.findIndex((it) => it.id === id);
    const swapIdx = dir === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= items.length) return;
    const next = [...items];
    const aOrder = next[idx].order;
    const bOrder = next[swapIdx].order;
    next[idx] = { ...next[idx], order: bOrder };
    next[swapIdx] = { ...next[swapIdx], order: aOrder };
    patchItems(next);
  }

  async function handleIconUpload(file: File) {
    setUploadingIcon(true);
    try {
      const url = await uploadFile(file);
      onUpdate({ iconUrl: url });
    } finally {
      setUploadingIcon(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`ins-title-${section.id}`}>{t(lang, "section.title")}</Label>
        <Input id={`ins-title-${section.id}`} value={section.title}
          onChange={(e) => onUpdate({ title: e.target.value })} placeholder="Section title" />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`ins-subtext-${section.id}`}>{t(lang, "section.subtext")}</Label>
        <Input id={`ins-subtext-${section.id}`} value={section.subtext ?? ""}
          onChange={(e) => onUpdate({ subtext: e.target.value })} placeholder="Short subtitle (optional)" />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>{t(lang, "section.icon")}</Label>
        <div className="flex items-center gap-2">
          {section.iconUrl && (
            <img src={section.iconUrl} alt="" className="size-6 shrink-0 rounded object-contain" />
          )}
          <input ref={iconInputRef} type="file" accept="image/*" className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleIconUpload(file);
              e.target.value = "";
            }}
          />
          <Button variant="outline" size="sm" disabled={uploadingIcon}
            onClick={() => iconInputRef.current?.click()}>
            {uploadingIcon
              ? t(lang, "common.uploading")
              : section.iconUrl
                ? t(lang, "common.changeIcon")
                : t(lang, "common.uploadIcon")}
          </Button>
          {section.iconUrl && (
            <button type="button" className="text-xs text-muted-foreground hover:text-destructive"
              onClick={() => onUpdate({ iconUrl: undefined })}>
              {t(lang, "common.removeIcon")}
            </button>
          )}
        </div>
      </div>

      <Separator />

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <Label>{t(lang, "sectionType.insights")}</Label>
          <Button variant="outline" size="sm" onClick={addItem}>
            + {t(lang, "insightsSection.addItem")}
          </Button>
        </div>
        {items.length === 0 && (
          <p className="text-xs text-muted-foreground">{t(lang, "insightsSection.noItems")}</p>
        )}
        {items.map((item, idx) => (
          <ItemEditor key={item.id} item={item} lang={lang}
            isFirst={idx === 0} isLast={idx === items.length - 1}
            onUpdate={(patch) => updateItem(item.id, patch)}
            onRemove={() => removeItem(item.id)}
            onMoveUp={() => moveItem(item.id, "up")}
            onMoveDown={() => moveItem(item.id, "down")} />
        ))}
      </div>
    </div>
  );
}
