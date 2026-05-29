import { resolveNavAnchor } from "@/lib/navLabel";
import type { PortfolioSection } from "@/api/contentApi";

interface SectionShellProps {
  section: PortfolioSection;
  lang?: string;
  children: React.ReactNode;
}

export function SectionShell({ section, lang = "en", children }: SectionShellProps) {
  const title =
    (lang === "de" ? section.title_de : section.title_en) || section.title;
  const subtext =
    (lang === "de" ? section.subtext_de : section.subtext_en) || section.subtext;
  const description =
    (lang === "de" ? section.description_de : section.description_en) || section.description;

  const anchorId = resolveNavAnchor(section);

  return (
    <section id={anchorId} className="mx-auto max-w-5xl px-6 py-14 scroll-mt-20">
      <div className="mb-6 flex items-center gap-3">
        {section.iconUrl && (
          <img
            src={section.iconUrl}
            alt=""
            aria-hidden="true"
            className="size-7 shrink-0 object-contain"
          />
        )}
        <div>
          <h2
            className="text-2xl font-bold tracking-tight"
            style={{ color: "var(--color-text)" }}
          >
            {title}
          </h2>
          {subtext && (
            <p className="mt-0.5 text-sm font-medium" style={{ color: "var(--color-primary)" }}>
              {subtext}
            </p>
          )}
        </div>
      </div>
      {description && (
        <p className="mb-6 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}
      {children}
    </section>
  );
}
