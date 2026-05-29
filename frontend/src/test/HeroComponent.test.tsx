import { render, screen } from "@testing-library/react";
import { HeroComponent } from "@/components/customComponents/HeroComponent/HeroComponent";
import type { HeroContent } from "@/api/contentApi";

const baseContent: HeroContent = {
  firstName: "Mantas",
  lastName: "Ercius",
  occupation_en: "Software Engineer",
  occupation_de: "Softwareentwickler",
  summary_en: "Building things on the web.",
  summary_de: "Dinge im Web bauen.",
  profile_image: "",
  links: [],
};

describe("HeroComponent", () => {
  it("renders full name", () => {
    render(
      <HeroComponent content={baseContent} defaultLanguage="en" multilanguage={false} />
    );
    expect(screen.getByRole("heading", { name: /mantas ercius/i })).toBeInTheDocument();
  });

  it("renders English occupation when defaultLanguage is en", () => {
    render(
      <HeroComponent content={baseContent} defaultLanguage="en" multilanguage={false} />
    );
    expect(screen.getByText("Software Engineer")).toBeInTheDocument();
    expect(screen.queryByText("Softwareentwickler")).not.toBeInTheDocument();
  });

  it("renders German occupation when defaultLanguage is de", () => {
    render(
      <HeroComponent content={baseContent} defaultLanguage="de" multilanguage={false} />
    );
    expect(screen.getByText("Softwareentwickler")).toBeInTheDocument();
    expect(screen.queryByText("Software Engineer")).not.toBeInTheDocument();
  });

  it("renders English summary when defaultLanguage is en", () => {
    render(
      <HeroComponent content={baseContent} defaultLanguage="en" multilanguage={false} />
    );
    expect(screen.getByText("Building things on the web.")).toBeInTheDocument();
  });

  it("renders German summary when defaultLanguage is de", () => {
    render(
      <HeroComponent content={baseContent} defaultLanguage="de" multilanguage={false} />
    );
    expect(screen.getByText("Dinge im Web bauen.")).toBeInTheDocument();
  });

  it("renders profile image when profile_image is set", () => {
    const content = { ...baseContent, profile_image: "https://example.com/photo.jpg" };
    render(
      <HeroComponent content={content} defaultLanguage="en" multilanguage={false} />
    );
    expect(screen.getByRole("img", { name: /mantas ercius/i })).toHaveAttribute(
      "src",
      "https://example.com/photo.jpg"
    );
  });

  it("does not render an img when profile_image is empty and no initials placeholder img", () => {
    render(
      <HeroComponent content={baseContent} defaultLanguage="en" multilanguage={false} />
    );
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("renders links", () => {
    const content = {
      ...baseContent,
      links: [
        { name: "GitHub", href: "https://github.com/user" },
        { name: "LinkedIn", href: "https://linkedin.com/in/user" },
      ],
    };
    render(
      <HeroComponent content={content} defaultLanguage="en" multilanguage={false} />
    );
    expect(screen.getByRole("link", { name: /github/i })).toHaveAttribute(
      "href",
      "https://github.com/user"
    );
    expect(screen.getByRole("link", { name: /linkedin/i })).toBeInTheDocument();
  });

  it("renders empty state when all fields are empty", () => {
    const empty: HeroContent = {
      firstName: "",
      lastName: "",
      occupation_en: "",
      occupation_de: "",
      summary_en: "",
      summary_de: "",
      profile_image: "",
      links: [],
    };
    render(
      <HeroComponent content={empty} defaultLanguage="en" multilanguage={false} />
    );
    expect(screen.getByText(/your portfolio is empty/i)).toBeInTheDocument();
  });

  // ── scroll anchor ─────────────────────────────────────────────────

  it("sets id on the section element when navLabel is provided", () => {
    const { container } = render(
      <HeroComponent
        content={{ ...baseContent, navLabel: "About Me" }}
        defaultLanguage="en"
        multilanguage={false}
      />
    );
    const section = container.querySelector("section");
    expect(section).toHaveAttribute("id", "about-me");
  });

  it("does not set id on the section element when navLabel is absent", () => {
    const { container } = render(
      <HeroComponent content={baseContent} defaultLanguage="en" multilanguage={false} />
    );
    const section = container.querySelector("section");
    expect(section).not.toHaveAttribute("id");
  });

  it("slugifies the navLabel for the id (special chars stripped)", () => {
    const { container } = render(
      <HeroComponent
        content={{ ...baseContent, navLabel: "Hello, World!" }}
        defaultLanguage="en"
        multilanguage={false}
      />
    );
    expect(container.querySelector("section")).toHaveAttribute("id", "hello-world");
  });

  it("applies modern-1 hero background when enabled", () => {
    const { container } = render(
      <HeroComponent
        content={{ ...baseContent, secondaryBackground: true }}
        defaultLanguage="en"
        multilanguage={false}
        theme="modern-1"
      />
    );
    expect(container.querySelector("section")).toHaveAttribute("data-hero-background", "modern-1");
  });

  it("does not apply hero background when disabled", () => {
    const { container } = render(
      <HeroComponent
        content={{ ...baseContent, secondaryBackground: false }}
        defaultLanguage="en"
        multilanguage={false}
        theme="modern-1"
      />
    );
    expect(container.querySelector("section")).not.toHaveAttribute("data-hero-background");
  });
});
