import { slugify } from "@/lib/utils";

describe("slugify", () => {
  it("converts spaces to hyphens", () => {
    expect(slugify("About Me")).toBe("about-me");
  });

  it("lowercases all characters", () => {
    expect(slugify("SKILLS")).toBe("skills");
  });

  it("collapses multiple consecutive spaces into a single hyphen", () => {
    expect(slugify("My  Work   Experience")).toBe("my-work-experience");
  });

  it("removes special characters", () => {
    expect(slugify("Hello, World!")).toBe("hello-world");
  });

  it("trims leading and trailing whitespace", () => {
    expect(slugify("  about  ")).toBe("about");
  });

  it("returns empty string for empty input", () => {
    expect(slugify("")).toBe("");
  });

  it("keeps hyphens and numbers", () => {
    expect(slugify("Work 2024")).toBe("work-2024");
  });

  it("handles non-ASCII characters by removing them", () => {
    expect(slugify("Über mich")).toBe("ber-mich");
  });

  it("produces stable anchors — same input always gives same output", () => {
    const a = slugify("Career Timeline");
    const b = slugify("Career Timeline");
    expect(a).toBe(b);
  });
});
