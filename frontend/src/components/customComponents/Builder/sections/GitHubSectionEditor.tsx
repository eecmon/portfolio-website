import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { uploadFile } from "@/api/uploadApi";
import type { GitHubStat, PortfolioSection } from "@/api/contentApi";
import { t } from "@/i18n";

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

interface GitHubSectionEditorProps {
  section: PortfolioSection;
  lang?: string;
  showEn?: boolean;
  showDe?: boolean;
  onUpdate: (patch: Partial<PortfolioSection>) => void;
}

export function GitHubSectionEditor({
  section,
  lang = "en",
  showEn = true,
  showDe = false,
  onUpdate,
}: GitHubSectionEditorProps) {
  const iconInputRef = useRef<HTMLInputElement>(null);
  const [uploadingIcon, setUploadingIcon] = useState(false);
  const multilanguage = showEn && showDe;

  const data = section.data as { showGraph?: boolean; stats?: GitHubStat[] };
  const showGraph = data.showGraph !== false;
  const stats: GitHubStat[] = Array.isArray(data.stats) ? data.stats : [];

  function patchData(patch: Partial<{ showGraph: boolean; stats: GitHubStat[] }>) {
    onUpdate({ data: { ...data, ...patch } });
  }

  function addStat() {
    patchData({ stats: [...stats, { id: uid(), label: "", value: "" }] });
  }

  function updateStat(id: string, patch: Partial<GitHubStat>) {
    patchData({ stats: stats.map((s) => (s.id === id ? { ...s, ...patch } : s)) });
  }

  function removeStat(id: string) {
    patchData({ stats: stats.filter((s) => s.id !== id) });
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
      {/* Title */}
      {multilanguage ? (
        <>
          <div className="flex flex-col gap-1.5">
            <Label>{t(lang, "section.titleEn")}</Label>
            <Input value={section.title_en ?? ""}
              onChange={(e) => onUpdate({ title_en: e.target.value })}
              placeholder="Section title (EN)" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>{t(lang, "section.titleDe")}</Label>
            <Input value={section.title_de ?? ""}
              onChange={(e) => onUpdate({ title_de: e.target.value })}
              placeholder="Abschnittstitel (DE)" />
          </div>
        </>
      ) : (
        <div className="flex flex-col gap-1.5">
          <Label>{t(lang, "section.title")}</Label>
          <Input value={section.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            placeholder="Section title" />
        </div>
      )}

      {/* Subtext */}
      {multilanguage ? (
        <>
          <div className="flex flex-col gap-1.5">
            <Label>{t(lang, "section.subtextEn")}</Label>
            <Input value={section.subtext_en ?? ""}
              onChange={(e) => onUpdate({ subtext_en: e.target.value })}
              placeholder="Short subtitle (EN)" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>{t(lang, "section.subtextDe")}</Label>
            <Input value={section.subtext_de ?? ""}
              onChange={(e) => onUpdate({ subtext_de: e.target.value })}
              placeholder="Untertitel (DE)" />
          </div>
        </>
      ) : (
        <div className="flex flex-col gap-1.5">
          <Label>{t(lang, "section.subtext")}</Label>
          <Input value={section.subtext ?? ""}
            onChange={(e) => onUpdate({ subtext: e.target.value })}
            placeholder="Short subtitle (optional)" />
        </div>
      )}

      {/* Description */}
      {multilanguage ? (
        <>
          <div className="flex flex-col gap-1.5">
            <Label>{t(lang, "section.descriptionEn")}</Label>
            <Textarea value={section.description_en ?? ""}
              onChange={(e) => onUpdate({ description_en: e.target.value })}
              placeholder="Introductory paragraph (EN)" className="min-h-[60px]" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>{t(lang, "section.descriptionDe")}</Label>
            <Textarea value={section.description_de ?? ""}
              onChange={(e) => onUpdate({ description_de: e.target.value })}
              placeholder="Einleitungsabsatz (DE)" className="min-h-[60px]" />
          </div>
        </>
      ) : (
        <div className="flex flex-col gap-1.5">
          <Label>{t(lang, "section.description")}</Label>
          <Textarea value={section.description ?? ""}
            onChange={(e) => onUpdate({ description: e.target.value })}
            placeholder="Introductory paragraph (optional)" className="min-h-[60px]" />
        </div>
      )}

      {/* Icon */}
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

      {/* GitHub-specific settings */}
      <div className="flex flex-col gap-3">
        <p className="text-xs text-muted-foreground rounded-lg border border-border bg-muted/40 px-3 py-2">
          {t(lang, "githubSection.tokenNote")}
        </p>

        {/* Show graph toggle */}
        <div className="flex items-center justify-between">
          <Label>{t(lang, "githubSection.showGraph")}</Label>
          <button
            type="button"
            onClick={() => patchData({ showGraph: !showGraph })}
            className={[
              "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors",
              showGraph ? "bg-[var(--color-primary)]" : "bg-muted-foreground/30",
            ].join(" ")}
          >
            <span
              className={[
                "pointer-events-none inline-block size-4 rounded-full bg-white shadow transition-transform",
                showGraph ? "translate-x-4" : "translate-x-0",
              ].join(" ")}
            />
          </button>
        </div>
      </div>

      <Separator />

      {/* Stat cards */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <Label>{t(lang, "githubSection.stats")}</Label>
          <Button variant="outline" size="sm" onClick={addStat}>
            {t(lang, "githubSection.addStat")}
          </Button>
        </div>

        {stats.length === 0 && (
          <p className="text-xs text-muted-foreground">{t(lang, "githubSection.noStats")}</p>
        )}

        {stats.map((stat, idx) => (
          <div key={stat.id} className="flex flex-col gap-2 rounded-lg border border-border p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                {t(lang, "githubSection.stat")} {idx + 1}
              </span>
              <button type="button" className="text-xs text-destructive hover:underline"
                onClick={() => removeStat(stat.id)}>
                {t(lang, "common.remove")}
              </button>
            </div>
            <Input
              placeholder={t(lang, "githubSection.statValue")}
              value={stat.value}
              onChange={(e) => updateStat(stat.id, { value: e.target.value })}
            />
            <Input
              placeholder={t(lang, "githubSection.statLabel")}
              value={stat.label}
              onChange={(e) => updateStat(stat.id, { label: e.target.value })}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
