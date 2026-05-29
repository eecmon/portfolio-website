import type { ThemeId } from "@/themes/types";

/** Maps theme id → value used on [data-hero-background]. */
const THEME_HERO_BACKGROUNDS: Partial<Record<ThemeId, ThemeId>> = {
  "modern-1": "modern-1",
};

export function themeSupportsHeroBackground(theme: string): boolean {
  return theme in THEME_HERO_BACKGROUNDS;
}

export function getHeroBackgroundThemeId(theme: string): ThemeId | null {
  return THEME_HERO_BACKGROUNDS[theme as ThemeId] ?? null;
}
