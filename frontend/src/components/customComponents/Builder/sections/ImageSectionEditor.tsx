import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { uploadFile } from "@/api/uploadApi";
import type { PortfolioSection, SectionImage } from "@/api/contentApi";
import { t } from "@/i18n";

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

interface ImageRowProps {
  image: SectionImage;
  isFirst: boolean;
  isLast: boolean;
  lang: string;
  onUpdate: (patch: Partial<SectionImage>) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

function ImageRow({ image, isFirst, isLast, lang, onUpdate, onRemove, onMoveUp, onMoveDown }: ImageRowProps) {
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
    <div className="flex flex-col gap-2 rounded-lg border border-border p-3">
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

      {image.imageUrl && (
        <img src={image.imageUrl} alt="" className="h-28 w-full rounded-lg object-cover" />
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
          : image.imageUrl
            ? t(lang, "common.changeImage")
            : t(lang, "common.uploadImage")}
      </Button>
      <Input placeholder={t(lang, "imageSection.caption")} value={image.caption ?? ""}
        onChange={(e) => onUpdate({ caption: e.target.value })} />
    </div>
  );
}

interface ImageSectionEditorProps {
  section: PortfolioSection;
  lang?: string;
  onUpdate: (patch: Partial<PortfolioSection>) => void;
}

export function ImageSectionEditor({ section, lang = "en", onUpdate }: ImageSectionEditorProps) {
  const iconInputRef = useRef<HTMLInputElement>(null);
  const [uploadingIcon, setUploadingIcon] = useState(false);

  const images = ([...(section.data.images ?? [])] as SectionImage[]).sort(
    (a, b) => a.order - b.order
  );

  function patchImages(next: SectionImage[]) {
    onUpdate({ data: { ...section.data, images: next } });
  }

  function addImage() {
    const maxOrder = images.reduce((m, i) => Math.max(m, i.order), -1);
    patchImages([...images, { id: uid(), imageUrl: "", caption: "", order: maxOrder + 1 }]);
  }

  function updateImage(id: string, patch: Partial<SectionImage>) {
    patchImages(images.map((img) => (img.id === id ? { ...img, ...patch } : img)));
  }

  function removeImage(id: string) {
    patchImages(images.filter((img) => img.id !== id));
  }

  function moveImage(id: string, dir: "up" | "down") {
    const idx = images.findIndex((img) => img.id === id);
    const swapIdx = dir === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= images.length) return;
    const next = [...images];
    const aOrder = next[idx].order;
    const bOrder = next[swapIdx].order;
    next[idx] = { ...next[idx], order: bOrder };
    next[swapIdx] = { ...next[swapIdx], order: aOrder };
    patchImages(next);
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
        <Label htmlFor={`img-title-${section.id}`}>{t(lang, "section.title")}</Label>
        <Input id={`img-title-${section.id}`} value={section.title}
          onChange={(e) => onUpdate({ title: e.target.value })} placeholder="Section title" />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`img-subtext-${section.id}`}>{t(lang, "section.subtext")}</Label>
        <Input id={`img-subtext-${section.id}`} value={section.subtext ?? ""}
          onChange={(e) => onUpdate({ subtext: e.target.value })} placeholder="Short subtitle (optional)" />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`img-desc-${section.id}`}>{t(lang, "section.description")}</Label>
        <Textarea id={`img-desc-${section.id}`} value={section.description ?? ""}
          onChange={(e) => onUpdate({ description: e.target.value })}
          placeholder="Shown left of carousel (optional)" className="min-h-[80px]" />
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
          <Label>{t(lang, "sectionType.image")}</Label>
          <Button variant="outline" size="sm" onClick={addImage}>
            + {t(lang, "imageSection.addImage")}
          </Button>
        </div>
        {images.length === 0 && (
          <p className="text-xs text-muted-foreground">{t(lang, "imageSection.noImages")}</p>
        )}
        {images.map((img, idx) => (
          <ImageRow key={img.id} image={img} lang={lang}
            isFirst={idx === 0} isLast={idx === images.length - 1}
            onUpdate={(patch) => updateImage(img.id, patch)}
            onRemove={() => removeImage(img.id)}
            onMoveUp={() => moveImage(img.id, "up")}
            onMoveDown={() => moveImage(img.id, "down")} />
        ))}
      </div>
    </div>
  );
}
