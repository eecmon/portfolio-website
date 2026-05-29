import { getThemeIntro } from "@/themes/introRegistry";
import type { ThemeIntroProps } from "@/themes/types";

interface ThemeIntroOverlayProps extends ThemeIntroProps {
  theme: string;
}

export function ThemeIntroOverlay({ theme, ...props }: ThemeIntroOverlayProps) {
  const entry = getThemeIntro(theme);
  if (!entry) return null;

  const { Intro } = entry;
  return <Intro {...props} />;
}
