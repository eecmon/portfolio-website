import type { PortfolioSection, TimelineItem } from "@/api/contentApi";
import { SectionShell } from "./SectionShell";

export interface SectionProps {
  section: PortfolioSection;
  defaultLanguage?: string;
  multilanguage?: boolean;
}

export function TimelineSection({ section }: SectionProps) {
  const items = ([...(section.data.items ?? [])] as TimelineItem[]).sort(
    (a, b) => a.order - b.order
  );

  return (
    <SectionShell section={section}>
      <ol className="relative border-l border-border pl-6">
        {items.map((item) => (
          <li key={item.id} className="mb-8 last:mb-0">
            <span
              className="absolute -left-[5px] mt-1.5 size-2.5 rounded-full border border-background"
              style={{ backgroundColor: "var(--color-primary)" }}
            />
            <time className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {item.date}
            </time>
            <p className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>
              {item.title}
            </p>
            {item.description && (
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {item.description}
              </p>
            )}
          </li>
        ))}
        {items.length === 0 && (
          <p className="text-sm text-muted-foreground">No entries yet.</p>
        )}
      </ol>
    </SectionShell>
  );
}
