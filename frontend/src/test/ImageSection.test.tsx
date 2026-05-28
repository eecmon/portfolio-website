import { render, screen } from "@testing-library/react";
import { ImageSection } from "@/components/customComponents/Sections/ImageSection";
import type { PortfolioSection } from "@/api/contentApi";

// embla-carousel-react doesn't work in jsdom.
// The factory runs ONCE; every call to the default export returns the same api
// reference — prevents the setApi useEffect from looping infinitely.
vi.mock("embla-carousel-react", () => {
  const api = {
    canScrollNext: () => false,
    canScrollPrev: () => false,
    scrollNext: vi.fn(),
    scrollPrev: vi.fn(),
    scrollTo: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
  };
  return { default: () => [vi.fn(), api] };
});

const baseSection: PortfolioSection = {
  id: "img1",
  type: "image",
  order: 0,
  title: "Gallery",
  subtext: "Photo highlights",
  description: "A collection of memorable moments.",
  data: {
    images: [
      { id: "p1", order: 0, imageUrl: "https://example.com/a.jpg", caption: "First photo" },
      { id: "p2", order: 1, imageUrl: "https://example.com/b.jpg", caption: "" },
    ],
  },
};

describe("ImageSection", () => {
  it("renders title and description", () => {
    render(<ImageSection section={baseSection} />);
    expect(screen.getByRole("heading", { name: "Gallery" })).toBeInTheDocument();
    expect(screen.getByText("A collection of memorable moments.")).toBeInTheDocument();
  });

  it("renders images from data", () => {
    const { container } = render(<ImageSection section={baseSection} />);
    // getAllByRole("img") misses images with alt="" (role=presentation) — query by tag
    const srcs = [...container.querySelectorAll("img")].map((img) => img.getAttribute("src"));
    expect(srcs).toContain("https://example.com/a.jpg");
    expect(srcs).toContain("https://example.com/b.jpg");
  });

  it("renders caption for images that have one", () => {
    render(<ImageSection section={baseSection} />);
    expect(screen.getByText("First photo")).toBeInTheDocument();
  });
});
