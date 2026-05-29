import type { ComponentType } from "react";

/** Theme ids that have a registered visual theme definition. */
export type ThemeId = "modern-1";

export interface ThemeIntroProps {
  firstName: string;
  lastName: string;
  onReveal: () => void;
  onComplete: () => void;
}

export interface ThemeIntroEntry {
  Intro: ComponentType<ThemeIntroProps>;
}
