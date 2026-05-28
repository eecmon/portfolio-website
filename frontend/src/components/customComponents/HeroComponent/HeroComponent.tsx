import { buttonVariants } from "@/components/ui/button";
import { cn, slugify } from "@/lib/utils";
import type { HeroContent } from "@/api/contentApi";

interface HeroComponentProps {
  content: HeroContent;
  defaultLanguage: string;
  multilanguage: boolean;
}

function pickLang(lang: string, de: string, en: string): string {
  return lang === "de" ? de : en;
}

function parseTranslation(pos?: string): [number, number] {
  if (!pos) return [0, 0];
  const parts = pos.trim().split(/\s+/);
  const x = parseFloat(parts[0]);
  const y = parseFloat(parts[1]);
  return [isNaN(x) ? 0 : x, isNaN(y) ? 0 : y];
}

function ProfileImage({
  src,
  alt,
  position,
  zoom,
}: {
  src: string;
  alt: string;
  position?: string;
  zoom?: number;
}) {
  const [tx, ty] = parseTranslation(position);
  const scale = zoom ?? 1;
  return (
    <div className="shrink-0">
      <div className="size-32 overflow-hidden rounded-full ring-2 ring-border sm:size-40">
        <img
          src={src}
          alt={alt}
          className="size-full object-cover origin-center"
          loading="lazy"
          style={{ transform: `scale(${scale}) translate(${tx}%, ${ty}%)` }}
        />
      </div>
    </div>
  );
}

function ProfilePlaceholder({ initials }: { initials: string }) {
  return (
    <div className="shrink-0">
      <div
        className="flex size-32 items-center justify-center rounded-full text-3xl font-semibold text-white sm:size-40"
        style={{ backgroundColor: "var(--color-primary)" }}
      >
        {initials}
      </div>
    </div>
  );
}

function LinkButton({ name, href, iconUrl }: { name: string; href: string; iconUrl?: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1.5")}
    >
      {iconUrl && (
        <img
          src={iconUrl}
          alt=""
          aria-hidden="true"
          className="size-4 shrink-0 object-contain"
        />
      )}
      {name}
    </a>
  );
}

export function HeroComponent({
  content,
  defaultLanguage,
  multilanguage: _multilanguage,
}: HeroComponentProps) {
  const lang = defaultLanguage;
  const {
    firstName,
    lastName,
    occupation_de,
    occupation_en,
    summary_de,
    summary_en,
    profile_image,
    profile_image_position,
    profile_image_zoom,
    navLabel,
    links,
  } = content;

  const anchorId = navLabel ? slugify(navLabel) : undefined;

  const occupation = pickLang(lang, occupation_de, occupation_en);
  const summary = pickLang(lang, summary_de, summary_en);

  const fullName = [firstName, lastName].filter(Boolean).join(" ");
  const initials = [firstName[0], lastName[0]].filter(Boolean).join("").toUpperCase();

  const hasContent = fullName || occupation || summary || links.length > 0;

  if (!hasContent) {
    return (
      <section id={anchorId} className="mx-auto max-w-5xl px-6 pt-24 pb-14 sm:pt-28 scroll-mt-20">
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-20 text-center">
          <p className="text-sm font-medium" style={{ color: "var(--color-primary)" }}>
            Your portfolio is empty
          </p>
          <p className="text-sm text-muted-foreground">
            Click <span className="font-medium">Edit</span> in the top right to add your content.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id={anchorId} className="mx-auto max-w-5xl px-6 pt-24 pb-14 sm:pt-28 scroll-mt-20">
      <div className="flex flex-col items-start gap-10 sm:flex-row sm:items-start sm:gap-14">
        {/* Avatar */}
        {profile_image ? (
          <ProfileImage src={profile_image} alt={fullName || "Profile photo"} position={profile_image_position} zoom={profile_image_zoom} />
        ) : initials ? (
          <ProfilePlaceholder initials={initials} />
        ) : null}

        {/* Text content */}
        <div className="flex min-w-0 flex-1 flex-col gap-5">
          {/* Name + occupation */}
          <div className="flex flex-col gap-1.5">
            {fullName && (
              <h1
                className="text-4xl font-bold tracking-tight sm:text-5xl"
                style={{ color: "var(--color-text)" }}
              >
                {fullName}
              </h1>
            )}
            {occupation && (
              <p
                className="text-lg font-medium"
                style={{ color: "var(--color-primary)" }}
              >
                {occupation}
              </p>
            )}
          </div>

          {/* Summary */}
          {summary && (
            <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
              {summary}
            </p>
          )}

          {/* Links */}
          {links.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {links.map((link) => (
                <LinkButton
                  key={link.href}
                  name={link.name}
                  href={link.href}
                  iconUrl={link.iconUrl}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
