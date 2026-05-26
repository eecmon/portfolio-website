import { Button } from "@/components/ui/button";

interface NavBarProps {
  firstName: string;
  lastName: string;
  editorAllowed: boolean;
  isEditing: boolean;
  onToggleEdit: () => void;
}

function getInitials(firstName: string, lastName: string): string {
  const first = firstName.trim()[0] ?? "";
  const last = lastName.trim()[0] ?? "";
  return (first + last).toUpperCase();
}

export function NavBar({
  firstName,
  lastName,
  editorAllowed,
  isEditing,
  onToggleEdit,
}: NavBarProps) {
  const initials = getInitials(firstName, lastName);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
      <nav className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
        {/* Brand */}
        <a
          href="/"
          className="flex items-center gap-2.5 no-underline"
          aria-label="Home"
        >
          <span
            className="flex size-8 items-center justify-center rounded-md text-sm font-semibold text-white"
            style={{ backgroundColor: "var(--color-primary)" }}
          >
            {initials || "?"}
          </span>
        </a>

        {/* Editor control */}
        {editorAllowed && (
          <Button
            variant={isEditing ? "outline" : "default"}
            size="sm"
            onClick={onToggleEdit}
          >
            {isEditing ? "Done" : "Edit"}
          </Button>
        )}
      </nav>
    </header>
  );
}
