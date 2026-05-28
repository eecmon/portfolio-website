import { Badge } from "@/components/ui/badge";
import type { PortfolioSection, SkillGroup } from "@/api/contentApi";
import { SectionShell } from "./SectionShell";

export interface SectionProps {
  section: PortfolioSection;
  defaultLanguage?: string;
  multilanguage?: boolean;
}

export function SkillsSection({ section }: SectionProps) {
  const groups = [...((section.data.groups as SkillGroup[] | undefined) ?? [])].sort(
    (a, b) => a.order - b.order
  );

  return (
    <SectionShell section={section}>
      {groups.length === 0 ? (
        <p className="text-sm text-muted-foreground">No skills added yet.</p>
      ) : (
        <div className="flex flex-col gap-6">
          {groups.map((group) => (
            <div key={group.id}>
              {group.heading && (
                <h3
                  className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  {group.heading}
                </h3>
              )}
              <ul className="flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <li key={item.id}>
                    <Badge variant="outline">{item.label}</Badge>
                  </li>
                ))}
                {group.items.length === 0 && (
                  <li className="text-xs text-muted-foreground">No items yet.</li>
                )}
              </ul>
            </div>
          ))}
        </div>
      )}
    </SectionShell>
  );
}
