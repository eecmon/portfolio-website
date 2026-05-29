import type { Settings } from "@/api/settingsApi";

export interface FontOption {
  id: string;
  label: string;
  /** Full CSS font-family stack */
  stack: string;
  /** Google Fonts URL family param (null = already bundled) */
  googleFont: string | null;
}

export const FONT_OPTIONS: FontOption[] = [
  {
    id: "geist",
    label: "Geist",
    stack: '"Geist Variable", system-ui, sans-serif',
    googleFont: null,
  },
  {
    id: "inter",
    label: "Inter",
    stack: '"Inter", system-ui, sans-serif',
    googleFont: "Inter:ital,opsz,wght@0,14..32,100..900",
  },
  {
    id: "jakarta",
    label: "Plus Jakarta Sans",
    stack: '"Plus Jakarta Sans", system-ui, sans-serif',
    googleFont: "Plus+Jakarta+Sans:wght@300..700",
  },
  {
    id: "dm-sans",
    label: "DM Sans",
    stack: '"DM Sans", system-ui, sans-serif',
    googleFont: "DM+Sans:ital,opsz,wght@0,9..40,100..1000",
  },
  {
    id: "lato",
    label: "Lato",
    stack: '"Lato", system-ui, sans-serif',
    googleFont: "Lato:wght@300;400;700",
  },
  {
    id: "merriweather",
    label: "Merriweather",
    stack: '"Merriweather", Georgia, serif',
    googleFont: "Merriweather:wght@300;400;700",
  },
  {
    id: "jetbrains",
    label: "JetBrains Mono",
    stack: '"JetBrains Mono", ui-monospace, monospace',
    googleFont: "JetBrains+Mono:wght@300..700",
  },
];

function loadGoogleFont(font: FontOption): void {
  if (!font.googleFont) return;
  const linkId = `gfont-${font.id}`;
  if (document.getElementById(linkId)) return;
  const link = document.createElement("link");
  link.id = linkId;
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${font.googleFont}&display=swap`;
  document.head.appendChild(link);
}

/**
 * Applies fetched settings to the document root.
 * Called once on load (from SiteSettingsContext) and on every live-preview
 * change inside PortfolioBuilder. DynamoDB / the API is the source of truth —
 * this function never reads from localStorage.
 */
export function applySettings(settings: Settings): void {
  const root = document.documentElement;

  // Theme token
  root.dataset.theme = settings.theme;

  // Portfolio color vars
  root.style.setProperty("--color-primary", settings.primaryColor);
  root.style.setProperty("--color-secondary", settings.secondaryColor);
  root.style.setProperty("--color-text", settings.textColor);

  // Mirror into shadcn tokens so components (Button, Switch…) stay on-brand
  root.style.setProperty("--primary", settings.primaryColor);
  root.style.setProperty("--foreground", settings.textColor);

  // Font — override the compiled Tailwind base-layer font-family via inline style
  const font =
    FONT_OPTIONS.find((f) => f.id === settings.fontFamily) ?? FONT_OPTIONS[0];
  loadGoogleFont(font);
  root.style.fontFamily = font.stack;
}
