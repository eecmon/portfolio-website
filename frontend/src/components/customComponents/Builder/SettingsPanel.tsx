import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import type { Settings } from "@/api/settingsApi";

interface SettingsPanelProps {
  settings: Settings;
  onChange: (patch: Partial<Settings>) => void;
}

// Labelled color swatch + native <input type="color">
function ColorField({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (hex: string) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <Label htmlFor={id} className="shrink-0">
        {label}
      </Label>
      <div className="flex items-center gap-2">
        <span className="font-mono text-xs text-muted-foreground">{value}</span>
        <label
          htmlFor={id}
          className={cn(
            "size-8 cursor-pointer overflow-hidden rounded-md border border-border shadow-sm",
            "transition-shadow hover:shadow-md focus-within:ring-2 focus-within:ring-ring"
          )}
          style={{ backgroundColor: value }}
        >
          <input
            id={id}
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="sr-only"
          />
        </label>
      </div>
    </div>
  );
}

export function SettingsPanel({ settings, onChange }: SettingsPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Global Settings</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        {/* Theme */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="theme">Theme</Label>
          <Select
            value={settings.theme}
            onValueChange={(val) => val && onChange({ theme: val })}
          >
            <SelectTrigger id="theme" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="modern-1">Modern 1</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Colors */}
        <div className="flex flex-col gap-3">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Colors
          </span>
          <ColorField
            id="primaryColor"
            label="Primary"
            value={settings.primaryColor}
            onChange={(hex) => onChange({ primaryColor: hex })}
          />
          <ColorField
            id="secondaryColor"
            label="Secondary"
            value={settings.secondaryColor}
            onChange={(hex) => onChange({ secondaryColor: hex })}
          />
          <ColorField
            id="textColor"
            label="Text"
            value={settings.textColor}
            onChange={(hex) => onChange({ textColor: hex })}
          />
        </div>

        {/* Language */}
        <div className="flex flex-col gap-3">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Language
          </span>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="defaultLanguage">Default Language</Label>
            <Select
              value={settings.defaultLanguage}
              onValueChange={(val) => val && onChange({ defaultLanguage: val })}
            >
              <SelectTrigger id="defaultLanguage" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="de">Deutsch</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-0.5">
              <Label htmlFor="multilanguage">Multilanguage</Label>
              <span className="text-xs text-muted-foreground">
                {settings.multilanguage
                  ? "EN + DE fields both visible"
                  : `Only ${settings.defaultLanguage.toUpperCase()} fields visible`}
              </span>
            </div>
            <Switch
              id="multilanguage"
              checked={settings.multilanguage}
              onCheckedChange={(val) => onChange({ multilanguage: val })}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
