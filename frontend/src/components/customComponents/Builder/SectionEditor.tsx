import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { uploadFile } from "@/api/uploadApi";

import { TextSectionEditor } from "./sections/TextSectionEditor";
import { ImageSectionEditor } from "./sections/ImageSectionEditor";
import { SkillsSectionEditor } from "./sections/SkillsSectionEditor";
import { InsightsSectionEditor } from "./sections/InsightsSectionEditor";

import type { PortfolioSection, TimelineItem } from "@/api/contentApi";
import { t } from "@/i18n";

// ── Helpers ───────────────────────────────────────────────────────

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

// ── Timeline editor (no dedicated file yet — kept inline) ─────────

function TimelineEditor({
  items,
  lang,
  onChange,
}: {
  items: TimelineItem[];
  lang: string;
  onChange: (items: TimelineItem[]) => void;
}) {
  function addItem() {
    const maxOrder = items.reduce((m, it) => Math.max(m, it.order), -1);
    onChange([...items, { id: uid(), order: maxOrder + 1, date: "", title: "", description: "" }]);
  }
  function update(id: string, patch: Partial<TimelineItem>) {
    onChange(items.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  }
  function remove(id: string) {
    onChange(items.filter((it) => it.id !== id));
  }

  return (
    <div className="flex flex-col gap-3">
      {items.map((item, idx) => (
        <div key={item.id} className="flex flex-col gap-2 rounded-lg border border-border p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              {t(lang, "sectionType.timeline")} {idx + 1}
            </span>
            <button type="button" className="text-xs text-destructive hover:underline"
              onClick={() => remove(item.id)}>{t(lang, "common.remove")}</button>
          </div>
          <Input placeholder={t(lang, "timelineSection.date")} value={item.date}
            onChange={(e) => update(item.id, { date: e.target.value })} />
          <Input placeholder={t(lang, "timelineSection.entryTitle")} value={item.title}
            onChange={(e) => update(item.id, { title: e.target.value })} />
          <Textarea placeholder={t(lang, "timelineSection.description")} value={item.description ?? ""}
            onChange={(e) => update(item.id, { description: e.target.value })}
            className="min-h-[60px]" />
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={addItem}>
        + {t(lang, "timelineSection.addEntry")}
      </Button>
    </div>
  );
}

// ── Generic common-fields editor (used by timeline only now) ──────

function CommonFields({
  section,
  lang,
  onUpdate,
  iconInputRef,
  uploadingIcon,
  setUploadingIcon,
}: {
  section: PortfolioSection;
  lang: string;
  onUpdate: (patch: Partial<PortfolioSection>) => void;
  iconInputRef: React.RefObject<HTMLInputElement | null>;
  uploadingIcon: boolean;
  setUploadingIcon: (v: boolean) => void;
}) {
  return (
    <>
      <div className="flex flex-col gap-1.5">
        <Label>{t(lang, "section.title")}</Label>
        <Input value={section.title}
          onChange={(e) => onUpdate({ title: e.target.value })} placeholder="Section title" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>{t(lang, "section.subtext")}</Label>
        <Input value={section.subtext ?? ""}
          onChange={(e) => onUpdate({ subtext: e.target.value })}
          placeholder="Short subtitle (optional)" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>{t(lang, "section.description")}</Label>
        <Textarea value={section.description ?? ""}
          onChange={(e) => onUpdate({ description: e.target.value })}
          placeholder="Introductory paragraph (optional)" className="min-h-[60px]" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>{t(lang, "section.icon")}</Label>
        <div className="flex items-center gap-2">
          {section.iconUrl && (
            <img src={section.iconUrl} alt="" className="size-6 rounded object-contain" />
          )}
          <input ref={iconInputRef} type="file" accept="image/*" className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void (async () => {
                setUploadingIcon(true);
                try {
                  const url = await uploadFile(file);
                  onUpdate({ iconUrl: url });
                } finally {
                  setUploadingIcon(false);
                }
              })();
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
    </>
  );
}

// ── SectionEditor — card shell + type dispatch ────────────────────

export interface SectionEditorProps {
  section: PortfolioSection;
  isFirst: boolean;
  isLast: boolean;
  lang?: string;
  onUpdate: (patch: Partial<PortfolioSection>) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

export function SectionEditor({
  section,
  isFirst,
  isLast,
  lang = "en",
  onUpdate,
  onRemove,
  onMoveUp,
  onMoveDown,
}: SectionEditorProps) {
  const iconInputRef = useRef<HTMLInputElement>(null);
  const [uploadingIcon, setUploadingIcon] = useState(false);

  const typeLabel = t(lang, `sectionType.${section.type}`);

  // Dedicated editors own ALL their fields (including title/subtext/icon)
  const hasDedicatedEditor =
    section.type === "text" ||
    section.type === "image" ||
    section.type === "skills" ||
    section.type === "insights";

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            {section.iconUrl && (
              <img src={section.iconUrl} alt="" className="size-5 shrink-0 object-contain" />
            )}
            <span className="truncate text-sm font-semibold" style={{ color: "var(--color-text)" }}>
              {section.title || typeLabel}
            </span>
            <span className="shrink-0 rounded-md bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
              {typeLabel}
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <button type="button" disabled={isFirst} onClick={onMoveUp}
              className="rounded p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"
              title={t(lang, "section.moveUp")}>↑</button>
            <button type="button" disabled={isLast} onClick={onMoveDown}
              className="rounded p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"
              title={t(lang, "section.moveDown")}>↓</button>
            <button type="button" onClick={onRemove}
              className="rounded p-1 text-destructive hover:opacity-70"
              title={t(lang, "section.remove")}>✕</button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {hasDedicatedEditor ? (
          // Dedicated editors own title + subtext + description + icon + data
          section.type === "text" ? (
            <TextSectionEditor section={section} lang={lang} onUpdate={onUpdate} />
          ) : section.type === "image" ? (
            <ImageSectionEditor section={section} lang={lang} onUpdate={onUpdate} />
          ) : section.type === "skills" ? (
            <SkillsSectionEditor section={section} lang={lang} onUpdate={onUpdate} />
          ) : (
            <InsightsSectionEditor section={section} lang={lang} onUpdate={onUpdate} />
          )
        ) : (
          // Timeline still uses generic common fields + inline data editor
          <>
            <CommonFields
              section={section}
              lang={lang}
              onUpdate={onUpdate}
              iconInputRef={iconInputRef}
              uploadingIcon={uploadingIcon}
              setUploadingIcon={setUploadingIcon}
            />
            <Separator />
            <TimelineEditor
              items={(section.data.items ?? []) as TimelineItem[]}
              lang={lang}
              onChange={(items) => onUpdate({ data: { items } })}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}
