import { Badge } from "@/components/ui/badge";
import type { PortfolioSection, SkillGroup } from "@/api/contentApi";
import { getSkillsThemeId } from "@/themes/skillsRegistry";
import { SectionShell } from "./SectionShell";
import type { SectionProps } from "./TimelineSection";
import { t } from "@/i18n";

function SkillGroupRow({ group, lang }: { group: SkillGroup; lang: string }) {
  const hasHeading = Boolean(group.heading?.trim());

  return (
    <div className="skills-group grid w-full grid-cols-1 gap-y-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,5fr)] sm:items-start sm:gap-x-4 sm:gap-y-0">
      {hasHeading && (
        <h3 className="skills-group__heading min-w-0 sm:col-start-1 sm:row-start-1">
          {group.heading}
        </h3>
      )}
      <ul
        className={[
          "skills-group__badges flex min-w-0 flex-wrap gap-2",
          hasHeading ? "sm:col-start-2 sm:row-start-1" : "sm:col-span-2",
        ].join(" ")}
      >
        {group.items.map((item) => (
          <li key={item.id}>
            <Badge variant="outline" className="skill-badge">
              {item.label}
            </Badge>
          </li>
        ))}
        {group.items.length === 0 && (
          <li className="text-xs text-muted-foreground">{t(lang, "skillsSection.noItems")}</li>
        )}
      </ul>
    </div>
  );
}

export function SkillsSection({ section, defaultLanguage = "en", theme }: SectionProps) {
  const lang = defaultLanguage;
  const groups = [...((section.data.groups as SkillGroup[] | undefined) ?? [])].sort(
    (a, b) => a.order - b.order
  );
  const skillsThemeId = theme ? getSkillsThemeId(theme) : null;

  return (
    <SectionShell section={section} lang={lang}>
      {groups.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t(lang, "skillsSection.noGroups")}</p>
      ) : (
        <div
          className="flex flex-col gap-5 md:gap-6"
          {...(skillsThemeId ? { "data-skills": skillsThemeId } : {})}
        >
          {groups.map((group) => (
            <SkillGroupRow key={group.id} group={group} lang={lang} />
          ))}
        </div>
      )}
    </SectionShell>
  );
}
