import { describe, expect, it } from "vitest";
import {
  getHeroBackgroundThemeId,
  themeSupportsHeroBackground,
} from "@/themes/heroBackgroundRegistry";

describe("heroBackgroundRegistry", () => {
  it("supports modern-1", () => {
    expect(themeSupportsHeroBackground("modern-1")).toBe(true);
    expect(getHeroBackgroundThemeId("modern-1")).toBe("modern-1");
  });

  it("returns null for unknown themes", () => {
    expect(themeSupportsHeroBackground("future-theme")).toBe(false);
    expect(getHeroBackgroundThemeId("future-theme")).toBeNull();
  });
});
