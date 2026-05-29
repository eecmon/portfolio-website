import { isLocalMode } from "./apiMode";

export interface Settings {
  theme: string;
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
  fontFamily: string;
  multilanguage: boolean;
  defaultLanguage: string;
}

const STORAGE_KEY = "portfolio.settings";

const defaultSettings: Settings = {
  theme: "modern-1",
  primaryColor: "#2563eb",
  secondaryColor: "#64748b",
  textColor: "#111827",
  fontFamily: "geist",
  multilanguage: false,
  defaultLanguage: "en",
};

export async function getSettings(): Promise<Settings> {
  if (isLocalMode()) {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...defaultSettings, ...(JSON.parse(raw) as Partial<Settings>) } : { ...defaultSettings };
  }

  const res = await fetch("/api/settings");
  if (!res.ok) throw new Error(`GET /api/settings failed: ${res.status}`);
  return res.json() as Promise<Settings>;
}

export async function putSettings(settings: Settings): Promise<void> {
  if (isLocalMode()) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    return;
  }

  const res = await fetch("/api/settings", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(settings),
  });
  if (!res.ok) throw new Error(`PUT /api/settings failed: ${res.status}`);
}
