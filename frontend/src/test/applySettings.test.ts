import { applySettings } from "@/lib/applySettings";
import type { Settings } from "@/api/settingsApi";

const settings: Settings = {
  theme: "modern-1",
  primaryColor: "#2563eb",
  secondaryColor: "#64748b",
  textColor: "#111827",
  multilanguage: false,
  defaultLanguage: "en",
};

describe("applySettings", () => {
  it("sets data-theme on documentElement", () => {
    applySettings(settings);
    expect(document.documentElement.dataset.theme).toBe("modern-1");
  });

  it("sets --color-primary CSS variable", () => {
    applySettings(settings);
    expect(
      document.documentElement.style.getPropertyValue("--color-primary")
    ).toBe("#2563eb");
  });

  it("sets --color-secondary CSS variable", () => {
    applySettings(settings);
    expect(
      document.documentElement.style.getPropertyValue("--color-secondary")
    ).toBe("#64748b");
  });

  it("sets --color-text CSS variable", () => {
    applySettings(settings);
    expect(
      document.documentElement.style.getPropertyValue("--color-text")
    ).toBe("#111827");
  });

  it("mirrors --primary to match primaryColor", () => {
    applySettings(settings);
    expect(
      document.documentElement.style.getPropertyValue("--primary")
    ).toBe("#2563eb");
  });

  it("updates values when called again with different settings", () => {
    applySettings({ ...settings, primaryColor: "#ff0000", theme: "modern-1" });
    expect(
      document.documentElement.style.getPropertyValue("--color-primary")
    ).toBe("#ff0000");
    expect(document.documentElement.dataset.theme).toBe("modern-1");
  });
});
