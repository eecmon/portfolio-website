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
});
