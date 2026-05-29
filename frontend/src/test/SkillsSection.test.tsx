import { render, screen } from "@testing-library/react";
import { SkillsSection } from "@/components/customComponents/Sections/SkillsSection";
import type { PortfolioSection } from "@/api/contentApi";

const baseSection: PortfolioSection = {
  id: "sk1",
  type: "skills",
  order: 0,
  title: "Skills",
  data: {
    groups: [
      {
        id: "g1",
        order: 0,
        heading: "Languages",
        items: [
          { id: "i1", label: "TypeScript" },
          { id: "i2", label: "Python" },
        ],
      },
      {
        id: "g2",
        order: 1,
        heading: "Frameworks",
        items: [{ id: "i3", label: "React" }],
      },
    ],
  },
};

describe("SkillsSection", () => {
  it("renders all groups with headings", () => {
    render(<SkillsSection section={baseSection} />);
    expect(screen.getByText("Languages")).toBeInTheDocument();
    expect(screen.getByText("Frameworks")).toBeInTheDocument();
  });

  it("renders skill items as badges", () => {
    render(<SkillsSection section={baseSection} />);
    expect(screen.getByText("TypeScript")).toBeInTheDocument();
    expect(screen.getByText("Python")).toBeInTheDocument();
    expect(screen.getByText("React")).toBeInTheDocument();
  });

  it("applies modern-1 skills theme wrapper when theme is modern-1", () => {
    const { container } = render(
      <SkillsSection section={baseSection} theme="modern-1" />
    );

    expect(container.querySelector('[data-skills="modern-1"]')).toBeInTheDocument();
  });
});
