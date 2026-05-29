import type { ThemeId } from "@/themes/types";

/** Maps theme id → value used on [data-insight-cards]. */
const THEME_INSIGHT_CARDS: Partial<Record<ThemeId, ThemeId>> = {
  "modern-1": "modern-1",
};

export function themeSupportsInsightCards(theme: string): boolean {
  return theme in THEME_INSIGHT_CARDS;
}

export function getInsightCardsThemeId(theme: string): ThemeId | null {
  return THEME_INSIGHT_CARDS[theme as ThemeId] ?? null;
}
