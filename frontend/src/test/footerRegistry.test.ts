import { describe, expect, it } from "vitest";
import {
  getFooterThemeId,
  themeSupportsFooter,
} from "@/themes/footerRegistry";

describe("footerRegistry", () => {
  it("supports modern-1", () => {
    expect(themeSupportsFooter("modern-1")).toBe(true);
    expect(getFooterThemeId("modern-1")).toBe("modern-1");
  });

  it("returns null for unknown themes", () => {
    expect(themeSupportsFooter("future-theme")).toBe(false);
    expect(getFooterThemeId("future-theme")).toBeNull();
  });
});
