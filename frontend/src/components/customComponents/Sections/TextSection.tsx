import type { PortfolioSection } from "@/api/contentApi";

export interface SectionProps {
  section: PortfolioSection;
  defaultLanguage?: string;
  multilanguage?: boolean;
}

export function TextSection({ section }: SectionProps) {
  return (
    <section className="mx-auto max-w-5xl px-6 py-14">
      {/* Header */}
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
            {section.title}
          </h2>
          {section.subtext && (
            <p className="mt-0.5 text-sm font-medium" style={{ color: "var(--color-primary)" }}>
              {section.subtext}
            </p>
          )}
        </div>
      </div>

      {/* Body */}
      {section.description && (
        <p
          className="max-w-2xl whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground"
        >
          {section.description}
        </p>
      )}
    </section>
  );
}
