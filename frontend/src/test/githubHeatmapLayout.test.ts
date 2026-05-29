import { describe, expect, it } from "vitest";
import {
  computeGitHubHeatmapLayout,
  GITHUB_HEATMAP_MAX_CELL,
  GITHUB_HEATMAP_MIN_CELL,
} from "@/lib/githubHeatmapLayout";

describe("computeGitHubHeatmapLayout", () => {
  it("uses full-size cells when the container is wide enough", () => {
    const layout = computeGitHubHeatmapLayout(900, 53);
    expect(layout.cell).toBe(GITHUB_HEATMAP_MAX_CELL);
    expect(layout.totalW).toBeLessThanOrEqual(900);
  });

  it("shrinks cells so the graph fits a narrower container", () => {
    const layout = computeGitHubHeatmapLayout(620, 53);
    expect(layout.cell).toBeLessThan(GITHUB_HEATMAP_MAX_CELL);
    expect(layout.cell).toBeGreaterThanOrEqual(GITHUB_HEATMAP_MIN_CELL);
    expect(layout.totalW * layout.scale).toBeLessThanOrEqual(620 + 1);
  });

  it("applies scale when cells cannot shrink enough for very narrow containers", () => {
    const layout = computeGitHubHeatmapLayout(280, 53);
    expect(layout.scale).toBeLessThan(1);
    expect(layout.totalW * layout.scale).toBeLessThanOrEqual(280 + 1);
  });
});
