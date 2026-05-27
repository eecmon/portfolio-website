import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { uploadFile } from "@/api/uploadApi";
import type { PortfolioSection, SkillBadgeItem, SkillGroup } from "@/api/contentApi";
import { t } from "@/i18n";

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

interface GroupEditorProps {
  group: SkillGroup;
  isFirst: boolean;
  isLast: boolean;
  lang: string;
  onUpdate: (patch: Partial<SkillGroup>) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

function GroupEditor({ group, isFirst, isLast, lang, onUpdate, onRemove, onMoveUp, onMoveDown }: GroupEditorProps) {
  const [newLabel, setNewLabel] = useState("");

  function addItem() {
    if (!newLabel.trim()) return;
    const next: SkillBadgeItem[] = [...group.items, { id: uid(), label: newLabel.trim() }];
    onUpdate({ items: next });
    setNewLabel("");
  }

  function removeItem(id: string) {
    onUpdate({ items: group.items.filter((it) => it.id !== id) });
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

      <Input placeholder={t(lang, "skillsSection.heading")} value={group.heading}
        onChange={(e) => onUpdate({ heading: e.target.value })} />

      <div className="flex flex-wrap gap-1.5">
        {group.items.map((item) => (
          <span key={item.id}
            className="flex items-center gap-1 rounded-full border border-border px-2.5 py-0.5 text-xs">
            {item.label}
            <button type="button" onClick={() => removeItem(item.id)}
              className="leading-none text-muted-foreground hover:text-destructive">✕</button>
          </span>
        ))}
      </div>

      <div className="flex gap-2">
        <Input placeholder={t(lang, "skillsSection.label")} value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addItem(); } }} />
        <Button variant="outline" size="sm" onClick={addItem} disabled={!newLabel.trim()}>
          {t(lang, "skillsSection.addItem")}
        </Button>
      </div>
    </div>
  );
}

interface SkillsSectionEditorProps {
  section: PortfolioSection;
  lang?: string;
  onUpdate: (patch: Partial<PortfolioSection>) => void;
}

export function SkillsSectionEditor({ section, lang = "en", onUpdate }: SkillsSectionEditorProps) {
  const iconInputRef = useRef<HTMLInputElement>(null);
  const [uploadingIcon, setUploadingIcon] = useState(false);

  const groups = ([...(section.data.groups ?? [])] as SkillGroup[]).sort(
    (a, b) => a.order - b.order
  );

  function patchGroups(next: SkillGroup[]) {
    onUpdate({ data: { ...section.data, groups: next } });
  }

  function addGroup() {
    const maxOrder = groups.reduce((m, g) => Math.max(m, g.order), -1);
    patchGroups([...groups, { id: uid(), order: maxOrder + 1, heading: "", items: [] }]);
  }

  function updateGroup(id: string, patch: Partial<SkillGroup>) {
    patchGroups(groups.map((g) => (g.id === id ? { ...g, ...patch } : g)));
  }

  function removeGroup(id: string) {
    patchGroups(groups.filter((g) => g.id !== id));
  }

  function moveGroup(id: string, dir: "up" | "down") {
    const idx = groups.findIndex((g) => g.id === id);
    const swapIdx = dir === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= groups.length) return;
    const next = [...groups];
    const aOrder = next[idx].order;
    const bOrder = next[swapIdx].order;
    next[idx] = { ...next[idx], order: bOrder };
    next[swapIdx] = { ...next[swapIdx], order: aOrder };
    patchGroups(next);
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
        <Label htmlFor={`skills-title-${section.id}`}>{t(lang, "section.title")}</Label>
        <Input id={`skills-title-${section.id}`} value={section.title}
          onChange={(e) => onUpdate({ title: e.target.value })} placeholder="Section title" />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`skills-subtext-${section.id}`}>{t(lang, "section.subtext")}</Label>
        <Input id={`skills-subtext-${section.id}`} value={section.subtext ?? ""}
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
          <Label>{t(lang, "sectionType.skills")}</Label>
          <Button variant="outline" size="sm" onClick={addGroup}>
            + {t(lang, "skillsSection.addGroup")}
          </Button>
        </div>
        {groups.length === 0 && (
          <p className="text-xs text-muted-foreground">{t(lang, "skillsSection.noGroups")}</p>
        )}
        {groups.map((group, idx) => (
          <GroupEditor key={group.id} group={group} lang={lang}
            isFirst={idx === 0} isLast={idx === groups.length - 1}
            onUpdate={(patch) => updateGroup(group.id, patch)}
            onRemove={() => removeGroup(group.id)}
            onMoveUp={() => moveGroup(group.id, "up")}
            onMoveDown={() => moveGroup(group.id, "down")} />
        ))}
      </div>
    </div>
  );
}
