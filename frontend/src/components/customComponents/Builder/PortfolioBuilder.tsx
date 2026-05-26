import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { SettingsPanel } from "./SettingsPanel";

import { NavBar } from "@/components/customComponents/NavBar";
import { HeroComponent } from "@/components/customComponents/HeroComponent";

import { uploadFile } from "@/api/uploadApi";
import { applySettings } from "@/lib/applySettings";
import type { Settings } from "@/api/settingsApi";
import type { Content, HeroContent, HeroLink } from "@/api/contentApi";

// ── Link row sub-component (own ref + upload state per link) ──────

interface LinkRowProps {
  link: HeroLink;
  index: number;
  onUpdate: (patch: Partial<HeroLink>) => void;
  onRemove: () => void;
}

function LinkRow({ link, index, onUpdate, onRemove }: LinkRowProps) {
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
          Remove
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
          {isUploadingIcon ? "Uploading…" : link.iconUrl ? "Change Icon" : "Upload Icon"}
        </Button>
        {link.iconUrl && (
          <button
            type="button"
            className="text-xs text-muted-foreground hover:text-destructive"
            onClick={() => onUpdate({ iconUrl: undefined })}
          >
            Remove icon
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
  const [content, setContent] = useState<Content>(initialContent);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
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

  async function handleSave() {
    setIsSaving(true);
    try {
      await Promise.all([onSaveSettings(settings), onSaveContent(content)]);
      onClose();
    } finally {
      setIsSaving(false);
    }
  }

  const showEn = settings.multilanguage || settings.defaultLanguage === "en";
  const showDe = settings.multilanguage || settings.defaultLanguage === "de";

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* ── Left panel: editor forms ──────────────────────────── */}
      <div className="flex w-full shrink-0 flex-col overflow-y-auto border-r border-border sm:w-[40%]">
        {/* Toolbar — sticky so it stays visible while scrolling */}
        <div className="sticky top-0 z-10 flex shrink-0 items-center justify-between border-b border-border bg-background px-4 py-3">
          <span className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>
            Portfolio Builder
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving…" : "Save"}
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
              <CardTitle>Hero</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {/* Name */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={content.hero.firstName}
                    onChange={(e) => patchHero({ firstName: e.target.value })}
                    placeholder="Mantas"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="lastName">Last Name</Label>
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
                  <Label htmlFor="occupation_en">Occupation (EN)</Label>
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
                  <Label htmlFor="occupation_de">Occupation (DE)</Label>
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
                  <Label htmlFor="summary_en">Summary (EN)</Label>
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
                  <Label htmlFor="summary_de">Summary (DE)</Label>
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
                <Label>Profile Image</Label>
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
                    ? "Uploading…"
                    : content.hero.profile_image
                      ? "Change Image"
                      : "Upload Image"}
                </Button>
              </div>

              <Separator />

              {/* Links */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <Label>Links</Label>
                  <Button variant="outline" size="sm" onClick={addLink}>
                    Add Link
                  </Button>
                </div>

                {content.hero.links.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    No links yet. Click Add Link to add one.
                  </p>
                )}

                {content.hero.links.map((link, i) => (
                  <LinkRow
                    key={i}
                    link={link}
                    index={i}
                    onUpdate={(patch) => updateLink(i, patch)}
                    onRemove={() => removeLink(i)}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Right panel: live preview ──────────────────────────── */}
      <div className="hidden flex-1 flex-col overflow-y-auto sm:flex">
        <div className="sticky top-0 z-10 border-b border-border bg-background/80 px-4 py-2 backdrop-blur-sm">
          <span className="text-xs text-muted-foreground">Live Preview</span>
        </div>
        <div className="flex-1 bg-background">
          <NavBar
            firstName={content.hero.firstName}
            lastName={content.hero.lastName}
            editorAllowed={false}
            isEditing={false}
            onToggleEdit={() => {}}
          />
          <HeroComponent
            content={content.hero}
            defaultLanguage={settings.defaultLanguage}
            multilanguage={settings.multilanguage}
          />
        </div>
      </div>
    </div>
  );
}
