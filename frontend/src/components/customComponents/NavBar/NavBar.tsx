import { Button } from "@/components/ui/button";
import { t } from "@/i18n";
import type { UILang } from "@/i18n";

interface NavBarProps {
  firstName: string;
  lastName: string;
  editorAllowed: boolean;
  isEditing: boolean;
  onToggleEdit: () => void;
  multilanguage?: boolean;
  displayLanguage?: string;
  onLanguageChange?: (lang: string) => void;
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
  multilanguage = false,
  displayLanguage = "en",
  onLanguageChange,
}: NavBarProps) {
  const initials = getInitials(firstName, lastName);
  const uiLang = displayLanguage as UILang;

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

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Language switcher — only visible when multilanguage is enabled */}
          {multilanguage && (
            <div className="flex items-center gap-0.5 rounded-md border border-border bg-muted/40 p-0.5">
              {(["en", "de"] as UILang[]).map((lang) => {
                const isActive = displayLanguage === lang;
                return (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => onLanguageChange?.(lang)}
                    className={[
                      "rounded px-2.5 py-1 text-xs font-semibold uppercase tracking-wide transition-colors",
                      isActive
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground",
                    ].join(" ")}
                    aria-pressed={isActive}
                    aria-label={lang.toUpperCase()}
                  >
                    {lang.toUpperCase()}
                  </button>
                );
              })}
            </div>
          )}

          {/* Edit / Done button */}
          {editorAllowed && (
            <Button
              variant={isEditing ? "outline" : "default"}
              size="sm"
              onClick={onToggleEdit}
            >
              {isEditing ? t(uiLang, "nav.done") : t(uiLang, "nav.edit")}
            </Button>
          )}
        </div>
      </nav>
    </header>
  );
}
