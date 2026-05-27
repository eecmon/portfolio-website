import { render, screen } from "@testing-library/react";
import { TextSection } from "@/components/customComponents/Sections/TextSection";
import type { PortfolioSection } from "@/api/contentApi";

const baseSection: PortfolioSection = {
  id: "tx1",
  type: "text",
  order: 0,
  title: "About Me",
  subtext: "A few words",
  description: "I build things for the web.",
  data: {},
};

describe("TextSection", () => {
  it("renders title, subtext, and description", () => {
    render(<TextSection section={baseSection} />);
    expect(screen.getByRole("heading", { name: "About Me" })).toBeInTheDocument();
    expect(screen.getByText("A few words")).toBeInTheDocument();
    expect(screen.getByText("I build things for the web.")).toBeInTheDocument();
  });

  it("renders icon when iconUrl is provided", () => {
    const section = { ...baseSection, iconUrl: "https://example.com/icon.svg" };
    const { container } = render(<TextSection section={section} />);
    // icon has alt="" + aria-hidden so it's role="presentation" — query by tag
    const icon = container.querySelector("img");
    expect(icon).toHaveAttribute("src", "https://example.com/icon.svg");
  });

  it("does not render icon when iconUrl is absent", () => {
    const { container } = render(<TextSection section={baseSection} />);
    expect(container.querySelector("img")).not.toBeInTheDocument();
  });
});
