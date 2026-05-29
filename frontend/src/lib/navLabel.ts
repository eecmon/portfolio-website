import { slugify } from "@/lib/utils";
import type { HeroContent, PortfolioSection } from "@/api/contentApi";
import type { NavItem } from "@/components/customComponents/NavBar/NavBar";

export interface NavLabelFields {
  navLabel?: string;
  navLabel_en?: string;
  navLabel_de?: string;
}

/** Display label for the active language, falling back across variants. */
export function resolveNavLabel(lang: string, item: NavLabelFields): string | undefined {
  const label =
    lang === "de"
      ? item.navLabel_de || item.navLabel_en || item.navLabel
      : item.navLabel_en || item.navLabel_de || item.navLabel;
  const trimmed = label?.trim();
  return trimmed || undefined;
}

/** Stable scroll anchor — same id regardless of display language. */
export function resolveNavAnchor(item: NavLabelFields): string | undefined {
  const stable = (item.navLabel_en || item.navLabel_de || item.navLabel)?.trim();
  return stable ? slugify(stable) : undefined;
}

export function buildNavItems(
  hero: HeroContent,
  sections: PortfolioSection[],
  lang: string,
): NavItem[] {
  const items: NavItem[] = [];

  const heroLabel = resolveNavLabel(lang, hero);
  const heroAnchor = resolveNavAnchor(hero);
  if (heroLabel && heroAnchor) {
    items.push({ label: heroLabel, anchor: heroAnchor });
  }

  for (const section of [...sections].sort((a, b) => a.order - b.order)) {
    const label = resolveNavLabel(lang, section);
    const anchor = resolveNavAnchor(section);
    if (label && anchor) {
      items.push({ label, anchor });
    }
  }

  return items;
}
