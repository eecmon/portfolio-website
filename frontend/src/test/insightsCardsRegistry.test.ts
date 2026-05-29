import { describe, expect, it } from "vitest";
import {
  getInsightCardsThemeId,
  themeSupportsInsightCards,
} from "@/themes/insightsCardsRegistry";

describe("insightsCardsRegistry", () => {
  it("supports modern-1", () => {
    expect(themeSupportsInsightCards("modern-1")).toBe(true);
    expect(getInsightCardsThemeId("modern-1")).toBe("modern-1");
  });

  it("returns null for unknown themes", () => {
    expect(themeSupportsInsightCards("future-theme")).toBe(false);
    expect(getInsightCardsThemeId("future-theme")).toBeNull();
  });
});
