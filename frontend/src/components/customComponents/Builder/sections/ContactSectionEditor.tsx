import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { uploadFile } from "@/api/uploadApi";
import type { PortfolioSection } from "@/api/contentApi";
import { t } from "@/i18n";

interface ContactSectionEditorProps {
  section: PortfolioSection;
  lang?: string;
  showEn?: boolean;
  showDe?: boolean;
  onUpdate: (patch: Partial<PortfolioSection>) => void;
}

export function ContactSectionEditor({
  section,
  lang = "en",
  showEn = true,
  showDe = false,
  onUpdate,
}: ContactSectionEditorProps) {
  const iconInputRef = useRef<HTMLInputElement>(null);
  const [uploadingIcon, setUploadingIcon] = useState(false);
  const multilanguage = showEn && showDe;

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

      <p className="text-xs text-muted-foreground rounded-lg border border-border bg-muted/40 px-3 py-2">
        {t(lang, "contactSection.editorNote")}
      </p>
    </div>
  );
}
