import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { InsightsSection } from "@/components/customComponents/Sections/InsightsSection";
import type { PortfolioSection } from "@/api/contentApi";

const baseSection: PortfolioSection = {
  id: "ins1",
  type: "insights",
  order: 0,
  title: "Projects",
  data: {
    items: [
      {
        id: "item1",
        order: 0,
        name: "Portfolio Site",
        subtext: "Personal project",
        shortDescription: "My personal portfolio built with React.",
        detailBlocks: [
          { id: "b1", order: 0, header: "Tech Stack", description: "React + AWS + CDK." },
          { id: "b2", order: 1, header: "Outcome", description: "Live at mantasec.dev" },
        ],
      },
      {
        id: "item2",
        order: 1,
        name: "Open Source Tool",
        shortDescription: "A CLI utility for developers.",
        detailBlocks: [],
      },
    ],
  },
};

describe("InsightsSection", () => {
  it("renders item cards with name, optional subtext, and description", () => {
    render(<InsightsSection section={baseSection} />);
    expect(screen.getByText("Portfolio Site")).toBeInTheDocument();
    expect(screen.getByText("Personal project")).toBeInTheDocument();
    expect(screen.getByText("My personal portfolio built with React.")).toBeInTheDocument();
    expect(screen.getByText("Open Source Tool")).toBeInTheDocument();
  });

  it("does not render block preview content on cards", () => {
    render(<InsightsSection section={baseSection} />);
    expect(screen.queryByText("Tech Stack")).not.toBeInTheDocument();
    expect(screen.queryByText("React + AWS + CDK.")).not.toBeInTheDocument();
  });

  it("opens modal when View details is clicked", async () => {
    render(<InsightsSection section={baseSection} />);
    await userEvent.click(screen.getAllByRole("button", { name: "View details →" })[0]);
    expect(screen.getByRole("heading", { name: "Portfolio Site" })).toBeInTheDocument();
  });

  it("uses German label when defaultLanguage is de", () => {
    render(<InsightsSection section={baseSection} defaultLanguage="de" />);
    expect(screen.getAllByRole("button", { name: "Details anzeigen →" })).toHaveLength(2);
  });

  it("renders detail blocks inside modal", async () => {
    render(<InsightsSection section={baseSection} />);
    await userEvent.click(screen.getAllByRole("button", { name: "View details →" })[0]);
    expect(screen.getAllByText("Tech Stack").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("React + AWS + CDK.").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Outcome")).toBeInTheDocument();
    expect(screen.getByText("Live at mantasec.dev")).toBeInTheDocument();
  });

  it("shows view more card as sixth slot when there are more than six projects", async () => {
    const manyItems = Array.from({ length: 8 }, (_, index) => ({
      id: `item-${index}`,
      order: index,
      name: `Project ${index + 1}`,
      shortDescription: `Description ${index + 1}`,
      detailBlocks: [],
    }));

    render(
      <InsightsSection
        section={{
          ...baseSection,
          data: { items: manyItems },
        }}
      />
    );

    expect(screen.getByText("Project 1")).toBeInTheDocument();
    expect(screen.getByText("Project 5")).toBeInTheDocument();
    expect(screen.queryByText("Project 6")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "View more" })).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "View more" }));

    expect(screen.getByText("Project 6")).toBeInTheDocument();
    expect(screen.getByText("Project 8")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "View more" })).not.toBeInTheDocument();
  });

  it("applies modern-1 insight card theme wrapper when theme is modern-1", () => {
    const { container } = render(
      <InsightsSection section={baseSection} theme="modern-1" />
    );

    expect(container.querySelector('[data-insight-cards="modern-1"]')).toBeInTheDocument();
  });

  it("uses German view more label when defaultLanguage is de", () => {
    const manyItems = Array.from({ length: 7 }, (_, index) => ({
      id: `item-${index}`,
      order: index,
      name: `Project ${index + 1}`,
      shortDescription: "",
      detailBlocks: [],
    }));

    render(
      <InsightsSection
        section={{
          ...baseSection,
          data: { items: manyItems },
        }}
        defaultLanguage="de"
      />
    );

    expect(screen.getByRole("button", { name: "Mehr anzeigen" })).toBeInTheDocument();
  });
});
