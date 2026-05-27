import type { PortfolioSection } from "@/api/contentApi";
import { sectionRegistry } from "./sectionRegistry";

interface SectionRendererProps {
  sections: PortfolioSection[];
  defaultLanguage?: string;
  multilanguage?: boolean;
}

export function SectionRenderer({
  sections,
  defaultLanguage,
  multilanguage,
}: SectionRendererProps) {
  const sorted = [...sections].sort((a, b) => a.order - b.order);

  if (sorted.length === 0) return null;

  return (
    <>
      {sorted.map((section) => {
        const Component = sectionRegistry[section.type];
        if (!Component) return null;
        return (
          <Component
            key={section.id}
            section={section}
            defaultLanguage={defaultLanguage}
            multilanguage={multilanguage}
          />
        );
      })}
    </>
  );
}
