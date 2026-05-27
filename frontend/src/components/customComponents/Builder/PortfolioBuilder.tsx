import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { SettingsPanel } from "./SettingsPanel";
import { SectionEditor } from "./SectionEditor";

import { NavBar } from "@/components/customComponents/NavBar";
import { HeroComponent } from "@/components/customComponents/HeroComponent";
import { SectionRenderer } from "@/components/customComponents/Sections/SectionRenderer";

import { uploadFile } from "@/api/uploadApi";
import { applySettings } from "@/lib/applySettings";
import type { Settings } from "@/api/settingsApi";
import type { Content, HeroContent, HeroLink, PortfolioSection, SectionType } from "@/api/contentApi";
import { t } from "@/i18n";

// ── Helpers ───────────────────────────────────────────────────────

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

function sectionTypeLabels(lang: string): Record<SectionType, string> {
  return {
    timeline: t(lang, "sectionType.timeline"),
    text: t(lang, "sectionType.text"),
    image: t(lang, "sectionType.image"),
    skills: t(lang, "sectionType.skills"),
    insights: t(lang, "sectionType.insights"),
  };
}

function makeSection(type: SectionType, order: number): PortfolioSection {
  return { id: uid(), type, order, title: "", data: {} };
}

// ── Link row sub-component (own ref + upload state per link) ──────

interface LinkRowProps {
  link: HeroLink;
  index: number;
  lang: string;
  onUpdate: (patch: Partial<HeroLink>) => void;
  onRemove: () => void;
}

function LinkRow({ link, index, lang, onUpdate, onRemove }: LinkRowProps) {
  const iconInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingIcon, setIsUploadingIcon] = useState(false);

  async function handleIconUpload(file: File) {
    setIsUploadingIcon(true);
    try {
      const url = await uploadFile(file);
      onUpdate({ iconUrl: url });
    } finally {
      setIsUploadingIcon(false);
    }
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border p-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">Link {index + 1}</span>
        <button
          type="button"
          className="text-xs text-destructive hover:underline"
          onClick={onRemove}
        >
          {t(lang, "common.remove")}
        </button>
      </div>

      <Input
        placeholder="Name (e.g. GitHub)"
        value={link.name}
        onChange={(e) => onUpdate({ name: e.target.value })}
      />
      <Input
        placeholder="URL (https://…)"
        value={link.href}
        onChange={(e) => onUpdate({ href: e.target.value })}
      />

      {/* Icon upload */}
      <div className="flex items-center gap-2">
        {link.iconUrl && (
          <img
            src={link.iconUrl}
            alt=""
            className="size-6 shrink-0 rounded object-contain"
          />
        )}
        <input
          ref={iconInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleIconUpload(file);
            e.target.value = "";
          }}
        />
        <Button
          variant="outline"
          size="sm"
          disabled={isUploadingIcon}
          onClick={() => iconInputRef.current?.click()}
        >
          {isUploadingIcon
            ? t(lang, "common.uploading")
            : link.iconUrl
              ? t(lang, "common.changeIcon")
              : t(lang, "common.uploadIcon")}
        </Button>
        {link.iconUrl && (
          <button
            type="button"
            className="text-xs text-muted-foreground hover:text-destructive"
            onClick={() => onUpdate({ iconUrl: undefined })}
          >
            {t(lang, "common.removeIcon")}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Main builder ──────────────────────────────────────────────────

interface PortfolioBuilderProps {
  initialSettings: Settings;
  initialContent: Content;
  onSaveSettings: (s: Settings) => Promise<void>;
  onSaveContent: (c: Content) => Promise<void>;
  onClose: () => void;
}

export function PortfolioBuilder({
  initialSettings,
  initialContent,
  onSaveSettings,
  onSaveContent,
  onClose,
}: PortfolioBuilderProps) {
  const [settings, setSettings] = useState<Settings>(initialSettings);
  const [content, setContent] = useState<Content>({
    ...initialContent,
    sections: initialContent.sections ?? [],
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [insertMenuAt, setInsertMenuAt] = useState<number | null>(null);
  const [previewLang, setPreviewLang] = useState<string>(initialSettings.defaultLanguage);
  const profileInputRef = useRef<HTMLInputElement>(null);

  function patchSettings(patch: Partial<Settings>) {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      applySettings(next);
      return next;
    });
  }

  function patchHero(patch: Partial<HeroContent>) {
    setContent((prev) => ({
      ...prev,
      hero: { ...prev.hero, ...patch },
    }));
  }

  function addLink() {
    patchHero({ links: [...content.hero.links, { name: "", href: "" }] });
  }

  function updateLink(index: number, patch: Partial<HeroLink>) {
    patchHero({
      links: content.hero.links.map((l, i) => (i === index ? { ...l, ...patch } : l)),
    });
  }

  function removeLink(index: number) {
    patchHero({ links: content.hero.links.filter((_, i) => i !== index) });
  }

  async function handleProfileUpload(file: File) {
    setIsUploadingImage(true);
    try {
      const url = await uploadFile(file);
      patchHero({ profile_image: url });
    } finally {
      setIsUploadingImage(false);
    }
  }

  // ── Sections helpers ──────────────────────────────────────────

  const sortedSections = [...content.sections].sort((a, b) => a.order - b.order);

  // Insert a new section at a specific position, then renumber all orders cleanly
  function insertSectionAt(insertIdx: number, type: SectionType) {
    const sorted = [...content.sections].sort((a, b) => a.order - b.order);
    sorted.splice(insertIdx, 0, makeSection(type, 0));
    setContent((prev) => ({
      ...prev,
      sections: sorted.map((s, i) => ({ ...s, order: i })),
    }));
    setInsertMenuAt(null);
  }

  function updateSection(id: string, patch: Partial<PortfolioSection>) {
    setContent((prev) => ({
      ...prev,
      sections: prev.sections.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    }));
  }

  function removeSection(id: string) {
    setContent((prev) => ({
      ...prev,
      sections: prev.sections.filter((s) => s.id !== id),
    }));
  }

  function moveSectionUp(id: string) {
    const sorted = [...content.sections].sort((a, b) => a.order - b.order);
    const idx = sorted.findIndex((s) => s.id === id);
    if (idx <= 0) return;
    const prev = sorted[idx - 1];
    const curr = sorted[idx];
    setContent((c) => ({
      ...c,
      sections: c.sections.map((s) => {
        if (s.id === curr.id) return { ...s, order: prev.order };
        if (s.id === prev.id) return { ...s, order: curr.order };
        return s;
      }),
    }));
  }

  function moveSectionDown(id: string) {
    const sorted = [...content.sections].sort((a, b) => a.order - b.order);
    const idx = sorted.findIndex((s) => s.id === id);
    if (idx < 0 || idx >= sorted.length - 1) return;
    const next = sorted[idx + 1];
    const curr = sorted[idx];
    setContent((c) => ({
      ...c,
      sections: c.sections.map((s) => {
        if (s.id === curr.id) return { ...s, order: next.order };
        if (s.id === next.id) return { ...s, order: curr.order };
        return s;
      }),
    }));
  }

  async function handleSave() {
    setIsSaving(true);
    try {
      await Promise.all([onSaveSettings(settings), onSaveContent(content)]);
      onClose();
    } finally {
      setIsSaving(false);
    }
  }

  const lang = settings.defaultLanguage;
  const showEn = settings.multilanguage || lang === "en";
  const showDe = settings.multilanguage || lang === "de";
  const typeLabels = sectionTypeLabels(lang);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* ── Left panel: editor forms ──────────────────────────── */}
      <div className="flex w-full shrink-0 flex-col overflow-y-auto border-r border-border sm:w-[40%]">
        {/* Toolbar — sticky so it stays visible while scrolling */}
        <div className="sticky top-0 z-10 flex shrink-0 items-center justify-between border-b border-border bg-background px-4 py-3">
          <span className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>
            {t(lang, "builder.title")}
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              {t(lang, "common.cancel")}
            </Button>
            <Button size="sm" onClick={handleSave} disabled={isSaving}>
              {isSaving ? t(lang, "common.saving") : t(lang, "common.save")}
            </Button>
          </div>
        </div>

        {/* Form area */}
        <div className="flex flex-col gap-4 p-4">
          {/* ── 1. Global Settings ───────────────────────── */}
          <SettingsPanel settings={settings} onChange={patchSettings} />

          {/* ── 2. Hero Content ──────────────────────────── */}
          <Card>
            <CardHeader>
              <CardTitle>{t(lang, "hero.card")}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {/* Name */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="firstName">{t(lang, "hero.firstName")}</Label>
                  <Input
                    id="firstName"
                    value={content.hero.firstName}
                    onChange={(e) => patchHero({ firstName: e.target.value })}
                    placeholder="Mantas"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="lastName">{t(lang, "hero.lastName")}</Label>
                  <Input
                    id="lastName"
                    value={content.hero.lastName}
                    onChange={(e) => patchHero({ lastName: e.target.value })}
                    placeholder="Versus"
                  />
                </div>
              </div>

              <Separator />

              {/* Occupation */}
              {showEn && (
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="occupation_en">{t(lang, "hero.occupationEn")}</Label>
                  <Input
                    id="occupation_en"
                    value={content.hero.occupation_en}
                    onChange={(e) => patchHero({ occupation_en: e.target.value })}
                    placeholder="Software Engineer"
                  />
                </div>
              )}
              {showDe && (
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="occupation_de">{t(lang, "hero.occupationDe")}</Label>
                  <Input
                    id="occupation_de"
                    value={content.hero.occupation_de}
                    onChange={(e) => patchHero({ occupation_de: e.target.value })}
                    placeholder="Softwareentwickler"
                  />
                </div>
              )}

              <Separator />

              {/* Summary */}
              {showEn && (
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="summary_en">{t(lang, "hero.summaryEn")}</Label>
                  <Textarea
                    id="summary_en"
                    value={content.hero.summary_en}
                    onChange={(e) => patchHero({ summary_en: e.target.value })}
                    placeholder="Background, skills, goals…"
                  />
                </div>
              )}
              {showDe && (
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="summary_de">{t(lang, "hero.summaryDe")}</Label>
                  <Textarea
                    id="summary_de"
                    value={content.hero.summary_de}
                    onChange={(e) => patchHero({ summary_de: e.target.value })}
                    placeholder="Hintergrund, Fähigkeiten, Ziele…"
                  />
                </div>
              )}

              <Separator />

              {/* Profile Image */}
              <div className="flex flex-col gap-2">
                <Label>{t(lang, "hero.profileImage")}</Label>
                {content.hero.profile_image && (
                  <img
                    src={content.hero.profile_image}
                    alt="Profile preview"
                    className="h-20 w-20 rounded-xl object-cover"
                  />
                )}
                <input
                  ref={profileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void handleProfileUpload(file);
                    e.target.value = "";
                  }}
                />
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isUploadingImage}
                  onClick={() => profileInputRef.current?.click()}
                >
                  {isUploadingImage
                    ? t(lang, "common.uploading")
                    : content.hero.profile_image
                      ? t(lang, "common.changeImage")
                      : t(lang, "common.uploadImage")}
                </Button>
              </div>

              <Separator />

              {/* Links */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <Label>{t(lang, "hero.links")}</Label>
                  <Button variant="outline" size="sm" onClick={addLink}>
                    {t(lang, "hero.addLink")}
                  </Button>
                </div>

                {content.hero.links.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    {t(lang, "hero.noLinks")}
                  </p>
                )}

                {content.hero.links.map((link, i) => (
                  <LinkRow
                    key={i}
                    link={link}
                    index={i}
                    lang={lang}
                    onUpdate={(patch) => updateLink(i, patch)}
                    onRemove={() => removeLink(i)}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* ── 3. Sections ──────────────────────────── */}
          <div className="flex flex-col">
            {/* Section group header — no button here, button lives at the bottom */}
            <div className="mb-3 flex items-center gap-2">
              <span className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>
                {t(lang, "sections.heading")}
              </span>
              {sortedSections.length > 0 && (
                <span className="rounded-full bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                  {sortedSections.length}
                </span>
              )}
            </div>

            {sortedSections.length === 0 && (
              <p className="mb-3 text-xs text-muted-foreground">
                {t(lang, "sections.empty")}
              </p>
            )}

            {sortedSections.map((section, idx) => (
              <div key={section.id} className="flex flex-col">
                <SectionEditor
                  section={section}
                  isFirst={idx === 0}
                  isLast={idx === sortedSections.length - 1}
                  lang={lang}
                  onUpdate={(patch) => updateSection(section.id, patch)}
                  onRemove={() => removeSection(section.id)}
                  onMoveUp={() => moveSectionUp(section.id)}
                  onMoveDown={() => moveSectionDown(section.id)}
                />

                {/* Insert-between divider (shown between consecutive sections) */}
                {idx < sortedSections.length - 1 && (
                  <div className="relative my-2 flex items-center">
                    <div className="flex-1 border-t border-dashed border-border" />
                    <div className="relative mx-2 shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          setInsertMenuAt(insertMenuAt === idx + 1 ? null : idx + 1)
                        }
                        className="flex items-center gap-1 rounded-full border border-dashed border-border bg-background px-2.5 py-0.5 text-xs text-muted-foreground transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                      >
                        {t(lang, "sections.insert")}
                      </button>
                      {insertMenuAt === idx + 1 && (
                        <div className="absolute left-1/2 top-full z-20 mt-1 w-40 -translate-x-1/2 overflow-hidden rounded-lg border border-border bg-background shadow-lg">
                          {(Object.keys(typeLabels) as SectionType[]).map((type) => (
                            <button
                              key={type}
                              type="button"
                              className="w-full px-3 py-2 text-left text-sm hover:bg-muted"
                              onClick={() => insertSectionAt(idx + 1, type)}
                            >
                              {typeLabels[type]}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 border-t border-dashed border-border" />
                  </div>
                )}
              </div>
            ))}

            {/* Bottom add — always at end of list */}
            <div className="relative mt-3">
              <button
                type="button"
                onClick={() =>
                  setInsertMenuAt(
                    insertMenuAt === sortedSections.length ? null : sortedSections.length
                  )
                }
                className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-border py-2.5 text-sm text-muted-foreground transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
              >
                {t(lang, "sections.add")}
              </button>
              {insertMenuAt === sortedSections.length && (
                <div className="absolute bottom-full left-1/2 z-20 mb-1 w-44 -translate-x-1/2 overflow-hidden rounded-lg border border-border bg-background shadow-lg">
                  {(Object.keys(typeLabels) as SectionType[]).map((type) => (
                    <button
                      key={type}
                      type="button"
                      className="w-full px-3 py-2 text-left text-sm hover:bg-muted"
                      onClick={() => insertSectionAt(sortedSections.length, type)}
                    >
                      {typeLabels[type]}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Right panel: live preview ──────────────────────────── */}
      <div className="hidden flex-1 flex-col overflow-y-auto sm:flex">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background/80 px-4 py-2 backdrop-blur-sm">
          <span className="text-xs text-muted-foreground">{t(lang, "builder.livePreview")}</span>

          {/* Language switcher — only when multilanguage is on */}
          {settings.multilanguage && (
            <div className="flex items-center gap-0.5 rounded-md border border-border bg-muted/40 p-0.5">
              {(["en", "de"] as const).map((l) => {
                const isActive = previewLang === l;
                return (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setPreviewLang(l)}
                    className={[
                      "rounded px-2.5 py-1 text-xs font-semibold uppercase tracking-wide transition-colors",
                      isActive
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground",
                    ].join(" ")}
                  >
                    {l.toUpperCase()}
                  </button>
                );
              })}
            </div>
          )}
        </div>
        <div className="flex-1 bg-background">
          <NavBar
            firstName={content.hero.firstName}
            lastName={content.hero.lastName}
            editorAllowed={false}
            isEditing={false}
            onToggleEdit={() => {}}
            multilanguage={settings.multilanguage}
            displayLanguage={previewLang}
          />
          <HeroComponent
            content={content.hero}
            defaultLanguage={previewLang}
            multilanguage={settings.multilanguage}
          />
          <SectionRenderer
            sections={content.sections}
            defaultLanguage={previewLang}
            multilanguage={settings.multilanguage}
          />
        </div>
      </div>
    </div>
  );
}
