import { useEffect, useRef, useState } from "react";
import type { PortfolioSection } from "@/api/contentApi";
import { isLocalMode } from "@/api/apiMode";
import { computeGitHubHeatmapLayout } from "@/lib/githubHeatmapLayout";
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState(() => computeGitHubHeatmapLayout(640, weeks.length));

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => {
      setLayout(computeGitHubHeatmapLayout(el.clientWidth, weeks.length));
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [weeks.length]);

  const { cell, gap, dayLabelW, totalW, scale } = layout;
  const step = cell + gap;
  const contentHeight = 18 + cell * 7 + gap * 6 + 8 + 24;
  const displayWidth = totalW * scale;
  const displayHeight = contentHeight * scale;

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

  return (
    <div ref={containerRef} className="w-full min-w-0">
      <div
        style={{
          width: scale < 1 ? displayWidth : totalW,
          maxWidth: "100%",
          height: scale < 1 ? displayHeight : undefined,
          overflow: scale < 1 ? "hidden" : undefined,
        }}
      >
        <div
          style={{
            width: totalW,
            transform: scale < 1 ? `scale(${scale})` : undefined,
            transformOrigin: "top left",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
        <div style={{ paddingLeft: dayLabelW, marginBottom: 4, position: "relative", height: 14 }}>
          {monthPositions.map((mp) => (
            <span
              key={mp.label + mp.col}
              className="absolute text-[10px] text-muted-foreground"
              style={{ left: dayLabelW + mp.col * step }}
            >
              {mp.label}
            </span>
          ))}
        </div>

        <div style={{ display: "flex" }}>
          <div style={{ width: dayLabelW, flexShrink: 0 }}>
            {[0, 1, 2, 3, 4, 5, 6].map((dow) => (
              <div
                key={dow}
                style={{
                  height: cell,
                  marginBottom: dow < 6 ? gap : 0,
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

          <div style={{ display: "flex", gap }}>
            {weeks.map((week, colIdx) => {
              const byWeekday: Record<number, ContribDay> = {};
              week.days.forEach((d) => {
                byWeekday[d.weekday] = d;
              });

              return (
                <div key={colIdx} style={{ display: "flex", flexDirection: "column", gap }}>
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
                          width: cell,
                          height: cell,
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

        <p className="text-right text-[11px] leading-relaxed break-words text-muted-foreground">
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
      <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-[auto_minmax(0,1fr)] md:gap-x-10 md:gap-y-6 lg:gap-x-14">
        {/* Left column — title + subtitle, spans both rows on md+ */}
        <div className="flex min-w-0 flex-col gap-4 md:row-span-2 md:max-w-xs lg:max-w-sm">
          {(section.iconUrl || title) && (
            <div className="flex min-w-0 items-center gap-3">
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
                  className="min-w-0 text-2xl font-bold tracking-tight"
                  style={{ color: "var(--color-text)" }}
                >
                  {title}
                </h2>
              )}
            </div>
          )}
          {subtext && (
            <p
              className="min-w-0 text-sm font-medium break-words"
              style={{ color: "var(--color-primary)" }}
            >
              {subtext}
            </p>
          )}
        </div>

        {/* Right column — row 1: graph */}
        <div className="min-w-0 w-full">
          <GitHubGraphPanel
            lang={lang}
            showGraph={showGraph}
            contribData={contribData}
            loadError={loadError}
          />
        </div>

        {/* Right column — row 2: description */}
        {description && (
          <p className="min-w-0 text-sm leading-relaxed break-words text-muted-foreground md:text-[15px]">
            {description}
          </p>
        )}
      </div>
    </section>
  );
}
