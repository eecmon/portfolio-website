import { t } from "@/i18n";
import type { HeroContent } from "@/api/contentApi";
import { getFooterThemeId } from "@/themes/footerRegistry";

interface FooterProps {
  hero: HeroContent;
  defaultLanguage: string;
  theme?: string;
}

export function Footer({ hero, defaultLanguage, theme }: FooterProps) {
  const { firstName, lastName, occupation_en, occupation_de, links } = hero;
  const lang = defaultLanguage;
  const footerThemeId = theme ? getFooterThemeId(theme) : null;

  const occupation =
    lang === "de" ? occupation_de || occupation_en : occupation_en || occupation_de;

  const fullName = [firstName, lastName].filter(Boolean).join(" ");

  if (!fullName && !occupation && links.length === 0) return null;

  return (
    <footer
      className="mt-auto"
      {...(footerThemeId ? { "data-footer": footerThemeId } : {})}
    >
      <div className="footer-inner relative z-[1] mx-auto max-w-5xl px-6 pb-8">
        <div className="footer-divider mb-6 h-px bg-border" />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {(fullName || occupation) && (
            <p className="text-sm text-muted-foreground">
              {t(lang, "footer.resumeOf")}{" "}
              {occupation && (
                <span className="font-medium" style={{ color: "var(--color-primary)" }}>
                  {occupation}
                </span>
              )}
              {occupation && fullName && <span> — </span>}
              {fullName && (
                <span className="font-medium text-foreground">{fullName}</span>
              )}
            </p>
          )}

          {links.length > 0 && (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              {links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-link flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.iconUrl && (
                    <img
                      src={link.iconUrl}
                      alt=""
                      aria-hidden="true"
                      className="size-3.5 shrink-0 object-contain opacity-70"
                    />
                  )}
                  {link.name}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
