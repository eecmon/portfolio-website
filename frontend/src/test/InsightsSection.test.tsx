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

  it("opens modal on card click", async () => {
    render(<InsightsSection section={baseSection} />);
    const [firstCard] = screen.getAllByText("View details →");
    await userEvent.click(firstCard);
    // Dialog title should be the item name
    expect(screen.getByRole("heading", { name: "Portfolio Site" })).toBeInTheDocument();
  });

  it("renders detail blocks inside modal", async () => {
    render(<InsightsSection section={baseSection} />);
    await userEvent.click(screen.getAllByText("View details →")[0]);
    expect(screen.getByText("Tech Stack")).toBeInTheDocument();
    expect(screen.getByText("React + AWS + CDK.")).toBeInTheDocument();
    expect(screen.getByText("Outcome")).toBeInTheDocument();
    expect(screen.getByText("Live at mantasec.dev")).toBeInTheDocument();
  });
});
