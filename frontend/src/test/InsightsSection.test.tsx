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
  it("renders item cards with name and short description", () => {
    render(<InsightsSection section={baseSection} />);
    expect(screen.getByText("Portfolio Site")).toBeInTheDocument();
    expect(screen.getByText("My personal portfolio built with React.")).toBeInTheDocument();
    expect(screen.getByText("Open Source Tool")).toBeInTheDocument();
  });

  it("renders block preview inside card", () => {
    render(<InsightsSection section={baseSection} />);
    expect(screen.getByText("Tech Stack")).toBeInTheDocument();
    expect(screen.getByText("React + AWS + CDK.")).toBeInTheDocument();
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
});
