import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PortfolioBuilder } from "@/components/customComponents/Builder/PortfolioBuilder";
import type { Content } from "@/api/contentApi";
import type { Settings } from "@/api/settingsApi";

vi.mock("@/lib/applySettings", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/applySettings")>();
  return { ...actual, applySettings: vi.fn() };
});
vi.mock("@/api/uploadApi", () => ({ uploadFile: vi.fn() }));
// embla stub — stable api reference prevents infinite setApi loop
vi.mock("embla-carousel-react", () => {
  const api = { canScrollNext: () => false, canScrollPrev: () => false, scrollNext: vi.fn(), scrollTo: vi.fn(), on: vi.fn(), off: vi.fn() };
  return { default: () => [vi.fn(), api] };
});

const baseSettings: Settings = {
  theme: "modern-1",
  primaryColor: "#2563eb",
  secondaryColor: "#64748b",
  textColor: "#111827",
  fontFamily: "geist",
  multilanguage: false,
  defaultLanguage: "en",
};

const baseContent: Content = {
  hero: {
    firstName: "Test",
    lastName: "User",
    occupation_en: "",
    occupation_de: "",
    summary_en: "",
    summary_de: "",
    profile_image: "",
    links: [],
  },
  sections: [],
};

function renderBuilder(content: Content = baseContent) {
  return render(
    <PortfolioBuilder
      initialSettings={baseSettings}
      initialContent={content}
      onSaveSettings={vi.fn()}
      onSaveContent={vi.fn()}
      onClose={vi.fn()}
    />
  );
}

describe("PortfolioBuilder — sections", () => {
  it("shows Add Section button below the Hero editor card", () => {
    renderBuilder();
    expect(screen.getByRole("button", { name: /add section/i })).toBeInTheDocument();
  });

  it("adding a section shows it in the editor and updates the live preview", async () => {
    renderBuilder();

    // Open type picker
    await userEvent.click(screen.getByRole("button", { name: /add section/i }));
    // Pick "Text"
    await userEvent.click(screen.getByRole("button", { name: "Text" }));

    // TextSectionEditor appears in the left panel (has "Section title" placeholder)
    const titleInput = screen.getByPlaceholderText("Section title");
    expect(titleInput).toBeInTheDocument();

    // Type a title — live preview should reflect it immediately
    await userEvent.type(titleInput, "Hello Preview");

    // The heading appears in the right-panel preview (the only h2 with this text)
    expect(screen.getByRole("heading", { name: "Hello Preview" })).toBeInTheDocument();
  });

  it("move up/down reorders sections in the editor", async () => {
    const content: Content = {
      ...baseContent,
      sections: [
        { id: "s1", type: "text", order: 0, title: "Alpha", data: {} },
        { id: "s2", type: "text", order: 1, title: "Beta", data: {} },
      ],
    };
    renderBuilder(content);

    // Both section titles appear in editor cards
    const cards = screen.getAllByText(/Alpha|Beta/);
    const titles = cards.map((el) => el.textContent);
    expect(titles[0]).toBe("Alpha");
    expect(titles[1]).toBe("Beta");

    // Move Alpha down — its ↓ button is the first "Move down" button
    const moveDownButtons = screen.getAllByTitle("Move down");
    await userEvent.click(moveDownButtons[0]);

    // After reorder: Beta should appear before Alpha
    const reordered = screen.getAllByText(/Alpha|Beta/);
    expect(reordered[0].textContent).toBe("Beta");
    expect(reordered[1].textContent).toBe("Alpha");
  });

  it("removing a section deletes it from the editor", async () => {
    const content: Content = {
      ...baseContent,
      sections: [{ id: "s1", type: "text", order: 0, title: "DeleteMe", data: {} }],
    };
    renderBuilder(content);
    // Appears in editor card header AND live preview — both should be gone after remove
    expect(screen.getAllByText("DeleteMe").length).toBeGreaterThan(0);

    await userEvent.click(screen.getByTitle("Remove section"));

    expect(screen.queryAllByText("DeleteMe")).toHaveLength(0);
  });
});
