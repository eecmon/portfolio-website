import type { Settings } from "@/api/settingsApi";

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
}
