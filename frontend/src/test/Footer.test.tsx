import { render, screen } from "@testing-library/react";
import { Footer } from "@/components/customComponents/Footer/Footer";
import type { HeroContent } from "@/api/contentApi";

const baseHero: HeroContent = {
  firstName: "Mantas",
  lastName: "Ercius",
  occupation_en: "Software Engineer",
  occupation_de: "Softwareentwickler",
  summary_en: "",
  summary_de: "",
  profile_image: "",
  links: [],
};

describe("Footer", () => {
  it("renders the i18n 'resume of' phrase in English", () => {
    render(<Footer hero={baseHero} defaultLanguage="en" />);
    expect(screen.getByText(/this is the resume website of/i)).toBeInTheDocument();
  });

  it("renders the i18n 'resume of' phrase in German", () => {
    render(<Footer hero={baseHero} defaultLanguage="de" />);
    expect(screen.getByText(/dies ist die lebenslauf-website von/i)).toBeInTheDocument();
  });

  it("renders English occupation when defaultLanguage is en", () => {
    render(<Footer hero={baseHero} defaultLanguage="en" />);
    expect(screen.getByText("Software Engineer")).toBeInTheDocument();
    expect(screen.queryByText("Softwareentwickler")).not.toBeInTheDocument();
  });

  it("renders German occupation when defaultLanguage is de", () => {
    render(<Footer hero={baseHero} defaultLanguage="de" />);
    expect(screen.getByText("Softwareentwickler")).toBeInTheDocument();
    expect(screen.queryByText("Software Engineer")).not.toBeInTheDocument();
  });

  it("falls back to EN occupation when DE is empty", () => {
    render(<Footer hero={{ ...baseHero, occupation_de: "" }} defaultLanguage="de" />);
    expect(screen.getByText("Software Engineer")).toBeInTheDocument();
  });

  it("renders full name", () => {
    render(<Footer hero={baseHero} defaultLanguage="en" />);
    expect(screen.getByText("Mantas Ercius")).toBeInTheDocument();
  });

  it("renders only first name when lastName is empty", () => {
    render(<Footer hero={{ ...baseHero, lastName: "" }} defaultLanguage="en" />);
    expect(screen.getByText("Mantas")).toBeInTheDocument();
  });

  it("renders hero links as anchor elements", () => {
    const hero: HeroContent = {
      ...baseHero,
      links: [
        { name: "GitHub", href: "https://github.com/user" },
        { name: "LinkedIn", href: "https://linkedin.com/in/user" },
      ],
    };
    render(<Footer hero={hero} defaultLanguage="en" />);
    expect(screen.getByRole("link", { name: /github/i })).toHaveAttribute(
      "href",
      "https://github.com/user"
    );
    expect(screen.getByRole("link", { name: /linkedin/i })).toHaveAttribute(
      "href",
      "https://linkedin.com/in/user"
    );
  });

  it("links open in a new tab", () => {
    const hero: HeroContent = {
      ...baseHero,
      links: [{ name: "GitHub", href: "https://github.com/user" }],
    };
    render(<Footer hero={hero} defaultLanguage="en" />);
    expect(screen.getByRole("link", { name: /github/i })).toHaveAttribute("target", "_blank");
  });

  it("renders nothing when all fields are empty and no links", () => {
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
    const { container } = render(<Footer hero={empty} defaultLanguage="en" />);
    expect(container.firstChild).toBeNull();
  });

  it("renders when only links are present and no name/occupation", () => {
    const hero: HeroContent = {
      firstName: "",
      lastName: "",
      occupation_en: "",
      occupation_de: "",
      summary_en: "",
      summary_de: "",
      profile_image: "",
      links: [{ name: "Portfolio", href: "https://example.com" }],
    };
    render(<Footer hero={hero} defaultLanguage="en" />);
    expect(screen.getByRole("link", { name: /portfolio/i })).toBeInTheDocument();
  });

  it("applies modern-1 footer theme wrapper when theme is modern-1", () => {
    const { container } = render(
      <Footer hero={baseHero} defaultLanguage="en" theme="modern-1" />
    );

    expect(container.querySelector('[data-footer="modern-1"]')).toBeInTheDocument();
  });
});
