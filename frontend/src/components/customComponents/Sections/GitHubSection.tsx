import { useEffect, useState } from "react";
import type { PortfolioSection } from "@/api/contentApi";
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

const CELL = 11;
const GAP = 2;
const DAY_LABEL_W = 26;
const MONTH_LABELS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAY_LABELS: Record<number, string> = { 1: "Mon", 3: "Wed", 5: "Fri" };

function countToOpacity(count: number): number {
  if (count === 0) return 0;
  if (count <= 3)  return 0.25;
  if (count <= 6)  return 0.5;
  if (count <= 9)  return 0.75;
  return 1;
}

function ContributionHeatmap({ weeks }: { weeks: ContribWeek[] }) {
  // Build month label positions, filtering too-close ones (min 4 weeks apart)
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
      <div style={{ width: totalW, minWidth: totalW }}>
        {/* Month labels */}
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

        {/* Day rows */}
        <div style={{ display: "flex" }}>
          {/* Day-of-week labels */}
          <div style={{ width: DAY_LABEL_W, flexShrink: 0 }}>
            {[0, 1, 2, 3, 4, 5, 6].map((dow) => (
              <div
                key={dow}
                style={{ height: CELL, marginBottom: dow < 6 ? GAP : 0, display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 4 }}
              >
                <span className="text-[9px] text-muted-foreground">{DAY_LABELS[dow] ?? ""}</span>
              </div>
            ))}
          </div>

          {/* Week columns */}
          <div style={{ display: "flex", gap: GAP }}>
            {weeks.map((week, colIdx) => {
              const byWeekday: Record<number, ContribDay> = {};
              week.days.forEach((d) => { byWeekday[d.weekday] = d; });

              return (
                <div key={colIdx} style={{ display: "flex", flexDirection: "column", gap: GAP }}>
                  {[0, 1, 2, 3, 4, 5, 6].map((dow) => {
                    const day = byWeekday[dow];
                    const opacity = day ? countToOpacity(day.count) : 0;
                    return (
                      <div
                        key={dow}
                        title={day ? `${day.date}: ${day.count} contribution${day.count !== 1 ? "s" : ""}` : ""}
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
      </div>
    </div>
  );
}

export function GitHubSection({ section, defaultLanguage = "en" }: SectionProps) {
  const lang = defaultLanguage;
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
    <SectionShell section={section} lang={lang}>
      {!showGraph ? (
        <p className="text-sm text-muted-foreground">Contribution graph is hidden.</p>
      ) : isLocalMode() ? (
        <p className="text-sm text-muted-foreground italic">
          Contribution graph is not available in local preview mode.
        </p>
      ) : loadError ? (
        <p className="text-sm text-muted-foreground italic">Could not load contribution data.</p>
      ) : !contribData ? (
        <div className="h-28 animate-pulse rounded-xl bg-muted" />
      ) : (
        <div className="flex flex-col gap-3">
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
        </div>
      )}
    </SectionShell>
  );
}
