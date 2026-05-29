import { useEffect, useState } from "react";
import type { PortfolioSection } from "@/api/contentApi";
import { isLocalMode } from "@/api/apiMode";
import { resolveNavAnchor } from "@/lib/navLabel";
import { t } from "@/i18n";

export interface SectionProps {
  section: PortfolioSection;
  defaultLanguage?: string;
  multilanguage?: boolean;
}

interface ContribDay {
  date: string;
  count: number;
  weekday: number;
}

interface ContribWeek {
  days: ContribDay[];
}

interface GitHubContribData {
  username: string;
  totalContributions: number;
  weeks: ContribWeek[];
}

const CELL = 11;
const GAP = 2;
const DAY_LABEL_W = 26;
const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAY_LABELS: Record<number, string> = { 1: "Mon", 3: "Wed", 5: "Fri" };

function countToOpacity(count: number): number {
  if (count === 0) return 0;
  if (count <= 3) return 0.25;
  if (count <= 6) return 0.5;
  if (count <= 9) return 0.75;
  return 1;
}

function ContributionHeatmap({
  weeks,
  username,
  totalContributions,
}: {
  weeks: ContribWeek[];
  username: string;
  totalContributions: number;
}) {
  const monthPositions: { label: string; col: number }[] = [];
  let lastMonth = -1;
  weeks.forEach((week, colIdx) => {
    const firstDay = week.days[0];
    if (!firstDay) return;
    const month = new Date(firstDay.date).getMonth();
    if (month !== lastMonth) {
      const last = monthPositions[monthPositions.length - 1];
      if (!last || colIdx - last.col >= 4) {
        monthPositions.push({ label: MONTH_LABELS[month], col: colIdx });
      }
      lastMonth = month;
    }
  });

  const gridW = weeks.length * (CELL + GAP) - GAP;
  const totalW = DAY_LABEL_W + gridW;

  return (
    <div className="overflow-x-auto">
      <div style={{ width: totalW, minWidth: totalW, display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ paddingLeft: DAY_LABEL_W, marginBottom: 4, position: "relative", height: 14 }}>
          {monthPositions.map((mp) => (
            <span
              key={mp.label + mp.col}
              className="absolute text-[10px] text-muted-foreground"
              style={{ left: DAY_LABEL_W + mp.col * (CELL + GAP) }}
            >
              {mp.label}
            </span>
          ))}
        </div>

        <div style={{ display: "flex" }}>
          <div style={{ width: DAY_LABEL_W, flexShrink: 0 }}>
            {[0, 1, 2, 3, 4, 5, 6].map((dow) => (
              <div
                key={dow}
                style={{
                  height: CELL,
                  marginBottom: dow < 6 ? GAP : 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  paddingRight: 4,
                }}
              >
                <span className="text-[9px] text-muted-foreground">{DAY_LABELS[dow] ?? ""}</span>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: GAP }}>
            {weeks.map((week, colIdx) => {
              const byWeekday: Record<number, ContribDay> = {};
              week.days.forEach((d) => {
                byWeekday[d.weekday] = d;
              });

              return (
                <div key={colIdx} style={{ display: "flex", flexDirection: "column", gap: GAP }}>
                  {[0, 1, 2, 3, 4, 5, 6].map((dow) => {
                    const day = byWeekday[dow];
                    const opacity = day ? countToOpacity(day.count) : 0;
                    return (
                      <div
                        key={dow}
                        title={
                          day
                            ? `${day.date}: ${day.count} contribution${day.count !== 1 ? "s" : ""}`
                            : ""
                        }
                        style={{
                          width: CELL,
                          height: CELL,
                          borderRadius: 2,
                          flexShrink: 0,
                          backgroundColor:
                            opacity === 0
                              ? "color-mix(in srgb, var(--color-text) 10%, transparent)"
                              : `color-mix(in srgb, var(--color-primary) ${Math.round(opacity * 100)}%, transparent)`,
                        }}
                      />
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>

        <p style={{ textAlign: "right", fontSize: 11, color: "var(--color-muted-foreground, #6b7280)" }}>
          {totalContributions.toLocaleString()} contributions in the last year ·{" "}
          <a
            href={`https://github.com/${username}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--color-primary)" }}
          >
            github.com/{username}
          </a>
        </p>
      </div>
    </div>
  );
}

function GitHubGraphPanel({
  lang,
  showGraph,
  contribData,
  loadError,
}: {
  lang: string;
  showGraph: boolean;
  contribData: GitHubContribData | null;
  loadError: boolean;
}) {
  if (!showGraph) {
    return (
      <p className="text-sm text-muted-foreground">{t(lang, "githubSection.graphHidden")}</p>
    );
  }

  if (isLocalMode()) {
    return (
      <p className="text-sm italic text-muted-foreground">{t(lang, "githubSection.localPreview")}</p>
    );
  }

  if (loadError) {
    return (
      <p className="text-sm italic text-muted-foreground">{t(lang, "githubSection.loadError")}</p>
    );
  }

  if (!contribData) {
    return <div className="h-28 animate-pulse rounded-xl bg-muted" />;
  }

  return (
    <ContributionHeatmap
      weeks={contribData.weeks}
      username={contribData.username}
      totalContributions={contribData.totalContributions}
    />
  );
}

export function GitHubSection({ section, defaultLanguage = "en" }: SectionProps) {
  const lang = defaultLanguage;

  const title =
    (lang === "de" ? section.title_de : section.title_en) || section.title;
  const subtext =
    (lang === "de" ? section.subtext_de : section.subtext_en) || section.subtext;
  const description =
    (lang === "de" ? section.description_de : section.description_en) || section.description;

  const anchorId = resolveNavAnchor(section);

  const data = section.data as { showGraph?: boolean };
  const showGraph = data.showGraph !== false;

  const [contribData, setContribData] = useState<GitHubContribData | null>(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (!showGraph || isLocalMode()) return;

    fetch("/api/github-contributions")
      .then((r) => {
        if (!r.ok) throw new Error(`${r.status}`);
        return r.json() as Promise<GitHubContribData>;
      })
      .then(setContribData)
      .catch(() => setLoadError(true));
  }, [showGraph]);

  return (
    <section id={anchorId} className="mx-auto max-w-5xl scroll-mt-20 px-6 py-14">
      <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-4 md:gap-10 lg:gap-14">
        {/* Left — intro copy (~1/4 on md+) */}
        <div className="flex flex-col gap-4 md:col-span-1 md:pt-1">
          {section.iconUrl && (
            <img
              src={section.iconUrl}
              alt=""
              aria-hidden="true"
              className="size-7 shrink-0 object-contain"
            />
          )}
          {title && (
            <h2
              className="text-2xl font-bold tracking-tight md:text-3xl"
              style={{ color: "var(--color-text)" }}
            >
              {title}
            </h2>
          )}
          {subtext && (
            <p className="text-sm font-medium md:text-base" style={{ color: "var(--color-primary)" }}>
              {subtext}
            </p>
          )}
          {description && (
            <p className="text-sm leading-relaxed text-muted-foreground md:text-[15px]">
              {description}
            </p>
          )}
        </div>

        {/* Right — contribution graph (~3/4 on md+) */}
        <div className="md:col-span-3">
          <GitHubGraphPanel
            lang={lang}
            showGraph={showGraph}
            contribData={contribData}
            loadError={loadError}
          />
        </div>
      </div>
    </section>
  );
}
