import { Button } from "@/components/ui/button";
import { t } from "@/i18n";
import type { UILang } from "@/i18n";
import { cn } from "@/lib/utils";
import { useScrollNavVisibility } from "@/lib/useScrollNavVisibility";

export interface NavItem {
  label: string;
  anchor: string;
}

interface NavBarProps {
  firstName: string;
  lastName: string;
  editorAllowed: boolean;
  isEditing: boolean;
  onToggleEdit: () => void;
  multilanguage?: boolean;
  displayLanguage?: string;
  onLanguageChange?: (lang: string) => void;
  navItems?: NavItem[];
  /** When false, renders as a sticky bar inside its scroll container (used in builder preview). */
  floating?: boolean;
}

function getInitials(firstName: string, lastName: string): string {
  const first = firstName.trim()[0] ?? "";
  const last = lastName.trim()[0] ?? "";
  return (first + last).toUpperCase();
}

function scrollTo(anchor: string) {
  document.getElementById(anchor)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function NavLinks({ items }: { items: NavItem[] }) {
  if (items.length === 0) return null;
  return (
    <div className="flex items-center gap-5">
      {items.map((item) => (
        <button
          key={item.anchor}
          type="button"
          onClick={() => scrollTo(item.anchor)}
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

function LangSwitcher({
  displayLanguage,
  onLanguageChange,
}: {
  displayLanguage: string;
  onLanguageChange?: (lang: string) => void;
}) {
  return (
    <div className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide">
      {(["en", "de"] as UILang[]).map((lang, i) => (
        <span key={lang} className="flex items-center gap-1">
          {i > 0 && <span className="text-border select-none">|</span>}
          <button
            type="button"
            onClick={() => onLanguageChange?.(lang)}
            className={[
              "transition-colors",
              displayLanguage === lang
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground",
            ].join(" ")}
            aria-pressed={displayLanguage === lang}
            aria-label={lang.toUpperCase()}
          >
            {lang.toUpperCase()}
          </button>
        </span>
      ))}
    </div>
  );
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
  navItems = [],
  floating = true,
}: NavBarProps) {
  const initials = getInitials(firstName, lastName);
  const uiLang = displayLanguage as UILang;
  const navVisible = useScrollNavVisibility({ enabled: floating });
  const hideOnScroll = floating && !navVisible;

  const brand = (
    <a href="/" className="flex items-center gap-2.5 no-underline shrink-0" aria-label="Home">
      <span
        className="flex size-7 items-center justify-center rounded-full text-xs font-semibold text-white"
        style={{ backgroundColor: "var(--color-primary)" }}
      >
        {initials || "?"}
      </span>
    </a>
  );

  const rightControls = (
    <div className="flex shrink-0 items-center gap-4">
      {multilanguage && (
        <LangSwitcher displayLanguage={displayLanguage} onLanguageChange={onLanguageChange} />
      )}
      {editorAllowed && (
        <Button
          variant={isEditing ? "outline" : "default"}
          size="sm"
          className="h-7 rounded-full px-3.5 text-xs"
          onClick={onToggleEdit}
        >
          {isEditing ? t(uiLang, "nav.done") : t(uiLang, "nav.edit")}
        </Button>
      )}
    </div>
  );

  if (!floating) {
    return (
      <header className="sticky top-0 z-10 border-b border-border/40 bg-background/80 backdrop-blur-sm">
        <nav className="mx-auto flex h-12 max-w-5xl items-center gap-6 px-6">
          {brand}
          <div className="ml-auto flex shrink-0 items-center gap-6">
            {navItems.length > 0 && <NavLinks items={navItems} />}
            {rightControls}
          </div>
        </nav>
      </header>
    );
  }

  return (
    <header
      className={cn(
        "pointer-events-none fixed top-4 right-0 left-0 z-50 flex justify-center px-6",
        "transition-[transform,opacity] duration-300 ease-out motion-reduce:transition-none",
        hideOnScroll && "-translate-y-[calc(100%+1.5rem)] opacity-0"
      )}
    >
      <nav className="pointer-events-auto flex w-full max-w-5xl items-center gap-6 rounded-full border border-border/60 bg-background/85 px-5 py-2.5 shadow-lg shadow-black/10 backdrop-blur-md">
        {brand}
        <div className="ml-auto flex shrink-0 items-center gap-6">
          {navItems.length > 0 && <NavLinks items={navItems} />}
          {rightControls}
        </div>
      </nav>
    </header>
  );
}
