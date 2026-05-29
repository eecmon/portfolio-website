import { useEffect, useState } from "react";
import type { GitHubStat, PortfolioSection } from "@/api/contentApi";
import { isLocalMode } from "@/api/apiMode";
import { SectionShell } from "./SectionShell";

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

// Map contribution count → opacity level for the primary color
function countToOpacity(count: number): number {
  if (count === 0) return 0;
  if (count <= 3) return 0.25;
  if (count <= 6) return 0.5;
  if (count <= 9) return 0.75;
  return 1;
}

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAY_LABELS: Record<number, string> = { 1: "Mon", 3: "Wed", 5: "Fri" };

function ContributionHeatmap({ weeks }: { weeks: ContribWeek[] }) {
  // Derive month label positions: find the first week where a new month starts
  const monthPositions: { label: string; col: number }[] = [];
  let lastMonth = -1;
  weeks.forEach((week, colIdx) => {
    const firstDay = week.days[0];
    if (!firstDay) return;
    const month = new Date(firstDay.date).getMonth();
    if (month !== lastMonth) {
      monthPositions.push({ label: MONTH_LABELS[month], col: colIdx });
      lastMonth = month;
    }
  });

  return (
    <div className="overflow-x-auto">
      <div className="inline-flex min-w-full flex-col gap-1">
        {/* Month labels row */}
        <div className="flex" style={{ marginLeft: "1.75rem" }}>
          {weeks.map((_, colIdx) => {
            const mp = monthPositions.find((m) => m.col === colIdx);
            return (
              <div key={colIdx} className="shrink-0" style={{ width: "13px", marginRight: "2px" }}>
                {mp && (
                  <span className="text-[9px] text-muted-foreground whitespace-nowrap">{mp.label}</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Grid: day-of-week rows × week columns */}
        <div className="flex gap-0">
          {/* Day labels */}
          <div className="flex flex-col gap-0.5 mr-1">
            {[0, 1, 2, 3, 4, 5, 6].map((dow) => (
              <div key={dow} className="flex items-center justify-end" style={{ height: "13px" }}>
                <span className="text-[9px] text-muted-foreground pr-1">
                  {DAY_LABELS[dow] ?? ""}
                </span>
              </div>
            ))}
          </div>

          {/* Week columns */}
          {weeks.map((week, colIdx) => {
            const daysByWeekday: Record<number, ContribDay> = {};
            week.days.forEach((d) => { daysByWeekday[d.weekday] = d; });

            return (
              <div key={colIdx} className="flex flex-col gap-0.5 mr-0.5">
                {[0, 1, 2, 3, 4, 5, 6].map((dow) => {
                  const day = daysByWeekday[dow];
                  const opacity = day ? countToOpacity(day.count) : 0;
                  return (
                    <div
                      key={dow}
                      title={day ? `${day.date}: ${day.count} contribution${day.count !== 1 ? "s" : ""}` : ""}
                      className="rounded-sm"
                      style={{
                        width: "13px",
                        height: "13px",
                        backgroundColor:
                          opacity === 0
                            ? "var(--color-border, #e5e7eb)"
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
    </div>
  );
}

export function GitHubSection({ section, defaultLanguage = "en" }: SectionProps) {
  const lang = defaultLanguage;
  const data = section.data as {
    showGraph?: boolean;
    stats?: GitHubStat[];
  };

  const showGraph = data.showGraph !== false;
  const stats: GitHubStat[] = Array.isArray(data.stats) ? data.stats : [];

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

  const hasContent = showGraph || stats.length > 0;

  return (
    <SectionShell section={section} lang={lang}>
      {!hasContent ? (
        <p className="text-sm text-muted-foreground">No GitHub data configured yet.</p>
      ) : (
        <div className="flex flex-col gap-8">
          {/* Contribution heatmap */}
          {showGraph && (
            <div className="flex flex-col gap-3">
              {isLocalMode() ? (
                <p className="text-xs text-muted-foreground italic">
                  Contribution graph is not available in local preview mode.
                </p>
              ) : loadError ? (
                <p className="text-xs text-muted-foreground italic">
                  Could not load contribution data.
                </p>
              ) : !contribData ? (
                <div className="h-24 animate-pulse rounded-xl bg-muted" />
              ) : (
                <>
                  <ContributionHeatmap weeks={contribData.weeks} />
                  <p className="text-right text-xs text-muted-foreground">
                    {contribData.totalContributions.toLocaleString()} contributions in the last year ·{" "}
                    <a
                      href={`https://github.com/${contribData.username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                      style={{ color: "var(--color-primary)" }}
                    >
                      github.com/{contribData.username}
                    </a>
                  </p>
                </>
              )}
            </div>
          )}

          {/* Manual stat cards */}
          {stats.length > 0 && (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {stats.map((stat) => (
                <li
                  key={stat.id}
                  className="flex flex-col gap-1 rounded-xl border border-border bg-muted/30 px-4 py-4"
                >
                  <span
                    className="text-2xl font-bold tabular-nums"
                    style={{ color: "var(--color-primary)" }}
                  >
                    {stat.value}
                  </span>
                  <span className="text-xs text-muted-foreground">{stat.label}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </SectionShell>
  );
}
