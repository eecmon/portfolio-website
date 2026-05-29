import { describe, it, expect } from "vitest";
import { resolveNavLabel, resolveNavAnchor, buildNavItems } from "@/lib/navLabel";
import type { HeroContent, PortfolioSection } from "@/api/contentApi";

const heroBase: HeroContent = {
  firstName: "M",
  lastName: "E",
  occupation_de: "",
  occupation_en: "",
  summary_de: "",
  summary_en: "",
  profile_image: "",
  links: [],
};

describe("resolveNavLabel", () => {
  it("returns language-specific label when set", () => {
    expect(
      resolveNavLabel("en", { navLabel_en: "About", navLabel_de: "Über mich" }),
    ).toBe("About");
    expect(
      resolveNavLabel("de", { navLabel_en: "About", navLabel_de: "Über mich" }),
    ).toBe("Über mich");
  });

  it("falls back to the other language variant", () => {
    expect(resolveNavLabel("en", { navLabel_de: "Kontakt" })).toBe("Kontakt");
    expect(resolveNavLabel("de", { navLabel_en: "Contact" })).toBe("Contact");
  });

  it("falls back to base navLabel", () => {
    expect(resolveNavLabel("en", { navLabel: "Skills" })).toBe("Skills");
  });
});

describe("resolveNavAnchor", () => {
  it("uses a stable anchor from EN first, then DE, then base", () => {
    expect(
      resolveNavAnchor({ navLabel_en: "About Me", navLabel_de: "Über mich" }),
    ).toBe("about-me");
    expect(resolveNavAnchor({ navLabel_de: "Über mich" })).toBe("ber-mich");
    expect(resolveNavAnchor({ navLabel: "Contact" })).toBe("contact");
  });
});

describe("buildNavItems", () => {
  it("builds ordered nav items with language-specific labels", () => {
    const sections: PortfolioSection[] = [
      {
        id: "s1",
        type: "text",
        order: 1,
        title: "T",
        navLabel_en: "Contact",
        navLabel_de: "Kontakt",
        data: {},
      },
    ];

    const enItems = buildNavItems(
      { ...heroBase, navLabel_en: "About", navLabel_de: "Über mich" },
      sections,
      "en",
    );
    expect(enItems).toEqual([
      { label: "About", anchor: "about" },
      { label: "Contact", anchor: "contact" },
    ]);

    const deItems = buildNavItems(
      { ...heroBase, navLabel_en: "About", navLabel_de: "Über mich" },
      sections,
      "de",
    );
    expect(deItems[0].label).toBe("Über mich");
    expect(deItems[0].anchor).toBe("about");
    expect(deItems[1].label).toBe("Kontakt");
    expect(deItems[1].anchor).toBe("contact");
  });
});
