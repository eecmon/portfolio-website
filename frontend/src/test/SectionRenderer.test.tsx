import { render, screen } from "@testing-library/react";
import { SectionRenderer } from "@/components/customComponents/Sections/SectionRenderer";
import type { PortfolioSection } from "@/api/contentApi";

const textSection = (id: string, order: number, title: string): PortfolioSection => ({
  id,
  type: "text",
  order,
  title,
  description: `description-${id}`,
  data: {},
});

describe("SectionRenderer", () => {
  it("renders sections sorted by order", () => {
    const sections = [
      textSection("b", 2, "Section B"),
      textSection("a", 0, "Section A"),
      textSection("c", 1, "Section C"),
    ];
    render(<SectionRenderer sections={sections} />);

    const headings = screen.getAllByRole("heading", { level: 2 });
    const names = headings.map((h) => h.textContent);
    expect(names).toEqual(["Section A", "Section C", "Section B"]);
  });

  it("renders correct component by type", () => {
    const sections: PortfolioSection[] = [
      { id: "t1", type: "text", order: 0, title: "Text Section", description: "Body text", data: {} },
      { id: "t2", type: "skills", order: 1, title: "Skills Section", data: { groups: [] } },
    ];
    render(<SectionRenderer sections={sections} />);
    expect(screen.getByRole("heading", { name: "Text Section" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Skills Section" })).toBeInTheDocument();
  });

  it("skips unknown section type safely without throwing", () => {
    const sections = [
      { id: "u1", type: "unknown" as PortfolioSection["type"], order: 0, title: "Ghost", data: {} },
    ];
    expect(() => render(<SectionRenderer sections={sections} />)).not.toThrow();
    expect(screen.queryByText("Ghost")).not.toBeInTheDocument();
  });
});
