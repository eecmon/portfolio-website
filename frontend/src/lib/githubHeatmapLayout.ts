export const GITHUB_HEATMAP_MAX_CELL = 11;
export const GITHUB_HEATMAP_MIN_CELL = 3;
export const GITHUB_HEATMAP_GAP = 2;
export const GITHUB_HEATMAP_DAY_LABEL_W = 26;

export interface GitHubHeatmapLayout {
  cell: number;
  gap: number;
  dayLabelW: number;
  totalW: number;
  scale: number;
}

export function computeGitHubHeatmapLayout(
  containerWidth: number,
  weekCount: number
): GitHubHeatmapLayout {
  if (weekCount <= 0 || containerWidth <= 0) {
    return {
      cell: GITHUB_HEATMAP_MAX_CELL,
      gap: GITHUB_HEATMAP_GAP,
      dayLabelW: GITHUB_HEATMAP_DAY_LABEL_W,
      totalW: 0,
      scale: 1,
    };
  }

  const idealTotal =
    GITHUB_HEATMAP_DAY_LABEL_W +
    weekCount * (GITHUB_HEATMAP_MAX_CELL + GITHUB_HEATMAP_GAP) -
    GITHUB_HEATMAP_GAP;

  let cell = GITHUB_HEATMAP_MAX_CELL;
  if (containerWidth < idealTotal) {
    cell = Math.max(
      GITHUB_HEATMAP_MIN_CELL,
      Math.floor(
        (containerWidth - GITHUB_HEATMAP_DAY_LABEL_W + GITHUB_HEATMAP_GAP) / weekCount -
          GITHUB_HEATMAP_GAP
      )
    );
  }

  const gridW = weekCount * (cell + GITHUB_HEATMAP_GAP) - GITHUB_HEATMAP_GAP;
  const totalW = GITHUB_HEATMAP_DAY_LABEL_W + gridW;
  const scale = totalW > containerWidth ? containerWidth / totalW : 1;

  return {
    cell,
    gap: GITHUB_HEATMAP_GAP,
    dayLabelW: GITHUB_HEATMAP_DAY_LABEL_W,
    totalW,
    scale,
  };
}
