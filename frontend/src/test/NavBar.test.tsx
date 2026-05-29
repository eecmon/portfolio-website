import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NavBar } from "@/components/customComponents/NavBar/NavBar";

const base = {
  firstName: "Mantas",
  lastName: "Ercius",
  editorAllowed: false,
  isEditing: false,
  onToggleEdit: vi.fn(),
};

describe("NavBar", () => {
  it("renders initials from firstName and lastName", () => {
    render(<NavBar {...base} />);
    expect(screen.getByText("ME")).toBeInTheDocument();
  });

  it("shows ? when both names are empty", () => {
    render(<NavBar {...base} firstName="" lastName="" />);
    expect(screen.getByText("?")).toBeInTheDocument();
  });

  it("hides Edit button when editorAllowed is false", () => {
    render(<NavBar {...base} editorAllowed={false} />);
    expect(screen.queryByRole("button", { name: /edit/i })).not.toBeInTheDocument();
  });

  it("shows Edit button when editorAllowed is true", () => {
    render(<NavBar {...base} editorAllowed={true} />);
    expect(screen.getByRole("button", { name: /edit/i })).toBeInTheDocument();
  });

  it("shows Done label when isEditing is true", () => {
    render(<NavBar {...base} editorAllowed={true} isEditing={true} />);
    expect(screen.getByRole("button", { name: /done/i })).toBeInTheDocument();
  });

  it("calls onToggleEdit when Edit is clicked", async () => {
    const onToggleEdit = vi.fn();
    render(<NavBar {...base} editorAllowed={true} onToggleEdit={onToggleEdit} />);
    await userEvent.click(screen.getByRole("button", { name: /edit/i }));
    expect(onToggleEdit).toHaveBeenCalledOnce();
  });

  // ── navItems ─────────────────────────────────────────────────────

  it("renders nav item labels when navItems is provided", () => {
    render(
      <NavBar
        {...base}
        navItems={[
          { label: "About", anchor: "about" },
          { label: "Skills", anchor: "skills" },
        ]}
      />
    );
    expect(screen.getByRole("button", { name: "About" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Skills" })).toBeInTheDocument();
  });

  it("renders no nav item buttons when navItems is empty", () => {
    render(<NavBar {...base} navItems={[]} />);
    // Only the Edit button (or none) — no section nav buttons
    expect(screen.queryByRole("button", { name: "About" })).not.toBeInTheDocument();
  });

  it("scrolls to target element when a nav item is clicked", async () => {
    const scrollIntoView = vi.fn();
    const el = document.createElement("section");
    el.id = "about";
    el.scrollIntoView = scrollIntoView;
    document.body.appendChild(el);

    render(
      <NavBar {...base} navItems={[{ label: "About", anchor: "about" }]} />
    );
    await userEvent.click(screen.getByRole("button", { name: "About" }));
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: "smooth", block: "start" });

    document.body.removeChild(el);
  });

  it("does not throw when nav item anchor has no matching element", async () => {
    render(
      <NavBar {...base} navItems={[{ label: "Ghost", anchor: "does-not-exist" }]} />
    );
    // Should not throw
    await userEvent.click(screen.getByRole("button", { name: "Ghost" }));
  });

  // ── floating={false} (builder preview mode) ───────────────────────

  it("renders a sticky header when floating is false", () => {
    const { container } = render(<NavBar {...base} floating={false} />);
    const header = container.querySelector("header");
    expect(header?.className).toMatch(/sticky/);
    expect(header?.className).not.toMatch(/fixed/);
  });

  it("renders nav items in non-floating mode too", () => {
    render(
      <NavBar
        {...base}
        floating={false}
        navItems={[{ label: "Experience", anchor: "experience" }]}
      />
    );
    expect(screen.getByRole("button", { name: "Experience" })).toBeInTheDocument();
  });

  // ── language switcher ─────────────────────────────────────────────

  it("hides language switcher when multilanguage is false", () => {
    render(<NavBar {...base} multilanguage={false} />);
    expect(screen.queryByRole("button", { name: "EN" })).not.toBeInTheDocument();
  });

  it("shows EN and DE buttons when multilanguage is true", () => {
    render(<NavBar {...base} multilanguage={true} displayLanguage="en" />);
    expect(screen.getByRole("button", { name: "EN" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "DE" })).toBeInTheDocument();
  });

  it("calls onLanguageChange with correct lang when language button is clicked", async () => {
    const onLanguageChange = vi.fn();
    render(
      <NavBar
        {...base}
        multilanguage={true}
        displayLanguage="en"
        onLanguageChange={onLanguageChange}
      />
    );
    await userEvent.click(screen.getByRole("button", { name: "DE" }));
    expect(onLanguageChange).toHaveBeenCalledWith("de");
  });
});
