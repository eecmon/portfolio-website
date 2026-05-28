import { render, screen } from "@testing-library/react";
import { TimelineSection } from "@/components/customComponents/Sections/TimelineSection";
import type { PortfolioSection } from "@/api/contentApi";

const baseSection: PortfolioSection = {
  id: "tl1",
  type: "timeline",
  order: 0,
  title: "My Career",
  subtext: "The journey so far",
  description: "A summary of my work history.",
  data: {
    items: [
      // stored out-of-order; component must sort by order
      { id: "i1", order: 1, date: "2022 – 2024", title: "Senior Dev", description: "Led the team." },
      { id: "i2", order: 0, date: "2019 – 2022", title: "Junior Dev", description: "Started out." },
    ],
  },
};

describe("TimelineSection", () => {
  it("renders title, subtext, and description", () => {
    render(<TimelineSection section={baseSection} />);
    expect(screen.getByRole("heading", { name: "My Career" })).toBeInTheDocument();
    expect(screen.getByText("The journey so far")).toBeInTheDocument();
    expect(screen.getByText("A summary of my work history.")).toBeInTheDocument();
  });

  it("renders items sorted by order", () => {
    render(<TimelineSection section={baseSection} />);
    const items = screen.getAllByRole("listitem");
    // order 0 (Junior Dev) should come before order 1 (Senior Dev)
    expect(items[0]).toHaveTextContent("Junior Dev");
    expect(items[1]).toHaveTextContent("Senior Dev");
  });

  it("renders timeline markers for each item", () => {
    render(<TimelineSection section={baseSection} />);
    // The ol contains one li per item
    const list = screen.getByRole("list");
    expect(list.querySelectorAll("li")).toHaveLength(2);
    // Each item has a coloured dot span inside
    expect(list.querySelectorAll("span")).toHaveLength(2);
  });
});
