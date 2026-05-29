import type { ThemeId } from "@/themes/types";

/** Maps theme id → value used on [data-skills]. */
const THEME_SKILLS: Partial<Record<ThemeId, ThemeId>> = {
  "modern-1": "modern-1",
};

export function themeSupportsSkills(theme: string): boolean {
  return theme in THEME_SKILLS;
}

export function getSkillsThemeId(theme: string): ThemeId | null {
  return THEME_SKILLS[theme as ThemeId] ?? null;
}
