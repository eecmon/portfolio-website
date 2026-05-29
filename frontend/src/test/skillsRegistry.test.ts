import { describe, expect, it } from "vitest";
import {
  getSkillsThemeId,
  themeSupportsSkills,
} from "@/themes/skillsRegistry";

describe("skillsRegistry", () => {
  it("supports modern-1", () => {
    expect(themeSupportsSkills("modern-1")).toBe(true);
    expect(getSkillsThemeId("modern-1")).toBe("modern-1");
  });

  it("returns null for unknown themes", () => {
    expect(themeSupportsSkills("future-theme")).toBe(false);
    expect(getSkillsThemeId("future-theme")).toBeNull();
  });
});
