import type { ThemeId } from "@/themes/types";

/** Maps theme id → value used on [data-footer]. */
const THEME_FOOTERS: Partial<Record<ThemeId, ThemeId>> = {
  "modern-1": "modern-1",
};

export function themeSupportsFooter(theme: string): boolean {
  return theme in THEME_FOOTERS;
}

export function getFooterThemeId(theme: string): ThemeId | null {
  return THEME_FOOTERS[theme as ThemeId] ?? null;
}
