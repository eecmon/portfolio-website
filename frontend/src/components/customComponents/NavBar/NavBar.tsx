import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
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

function NavLinks({ items, className }: { items: NavItem[]; className?: string }) {
  if (items.length === 0) return null;
  return (
    <div className={cn("items-center gap-4 lg:gap-5", className)}>
      {items.map((item) => (
        <button
          key={item.anchor}
          type="button"
          onClick={() => scrollTo(item.anchor)}
          className="whitespace-nowrap text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

function MobileNavMenu({ items, uiLang }: { items: NavItem[]; uiLang: UILang }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  if (items.length === 0) return null;

  return (
    <div className="relative md:hidden">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="size-7 rounded-full p-0"
        aria-expanded={open}
        aria-label={open ? t(uiLang, "nav.closeMenu") : t(uiLang, "nav.openMenu")}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? <X className="size-4" /> : <Menu className="size-4" />}
      </Button>

      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/15"
            aria-label={t(uiLang, "nav.closeMenu")}
            onClick={() => setOpen(false)}
          />
          <div className="absolute top-[calc(100%+0.5rem)] right-0 z-50 min-w-[11rem] max-w-[calc(100vw-2rem)] rounded-2xl border border-border/60 bg-background/95 p-2 shadow-lg backdrop-blur-md">
            {items.map((item) => (
              <button
                key={item.anchor}
                type="button"
                className="block w-full rounded-lg px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                onClick={() => {
                  scrollTo(item.anchor);
                  setOpen(false);
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </>
      )}
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
    <div className="flex shrink-0 items-center gap-1 text-xs font-semibold uppercase tracking-wide">
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

function NavBarInner({
  brand,
  navItems,
  rightControls,
  uiLang,
  className,
}: {
  brand: React.ReactNode;
  navItems: NavItem[];
  rightControls: React.ReactNode;
  uiLang: UILang;
  className?: string;
}) {
  return (
    <nav className={cn("flex min-w-0 items-center gap-3 sm:gap-4 md:gap-6", className)}>
      {brand}
      <NavLinks items={navItems} className="hidden min-w-0 md:flex" />
      <div className="ml-auto flex shrink-0 items-center gap-3 sm:gap-4">
        <MobileNavMenu items={navItems} uiLang={uiLang} />
        {rightControls}
      </div>
    </nav>
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
    <a href="/" className="flex shrink-0 items-center gap-2.5 no-underline" aria-label="Home">
      <span
        className="flex size-7 items-center justify-center rounded-full text-xs font-semibold text-white"
        style={{ backgroundColor: "var(--color-primary)" }}
      >
        {initials || "?"}
      </span>
    </a>
  );

  const rightControls = (
    <div className="flex shrink-0 items-center gap-3 sm:gap-4">
      {multilanguage && (
        <LangSwitcher displayLanguage={displayLanguage} onLanguageChange={onLanguageChange} />
      )}
      {editorAllowed && (
        <Button
          variant={isEditing ? "outline" : "default"}
          size="sm"
          className="h-7 shrink-0 rounded-full px-3.5 text-xs"
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
        <NavBarInner
          brand={brand}
          navItems={navItems}
          rightControls={rightControls}
          uiLang={uiLang}
          className="mx-auto h-12 max-w-5xl px-4 sm:px-6"
        />
      </header>
    );
  }

  return (
    <header
      className={cn(
        "pointer-events-none fixed top-4 right-0 left-0 z-50 flex justify-center px-4 sm:px-6",
        "transition-[transform,opacity] duration-300 ease-out motion-reduce:transition-none",
        hideOnScroll && "-translate-y-[calc(100%+1.5rem)] opacity-0"
      )}
    >
      <NavBarInner
        brand={brand}
        navItems={navItems}
        rightControls={rightControls}
        uiLang={uiLang}
        className="pointer-events-auto w-full min-w-0 max-w-5xl rounded-full border border-border/60 bg-background/85 px-3 py-2 shadow-lg shadow-black/10 backdrop-blur-md sm:px-5 sm:py-2.5"
      />
    </header>
  );
}
