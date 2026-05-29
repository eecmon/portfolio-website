import { Modern1IntroOverlay } from "@/themes/modern-1/IntroOverlay";
import type { ThemeId, ThemeIntroEntry } from "@/themes/types";

const THEME_INTROS: Record<ThemeId, ThemeIntroEntry> = {
  "modern-1": { Intro: Modern1IntroOverlay },
};

export function getThemeIntro(theme: string): ThemeIntroEntry | null {
  return THEME_INTROS[theme as ThemeId] ?? null;
}

export function themeHasIntro(theme: string): boolean {
  return getThemeIntro(theme) != null;
}

export function shouldShowThemeIntro(
  theme: string,
  firstName: string,
  lastName: string
): boolean {
  if (!themeHasIntro(theme)) return false;
  if (!firstName.trim() && !lastName.trim()) return false;
  if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return false;
  }
  return true;
}
