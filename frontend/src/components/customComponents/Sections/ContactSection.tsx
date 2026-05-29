import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { PortfolioSection } from "@/api/contentApi";
import { isLocalMode } from "@/api/apiMode";
import { resolveNavAnchor } from "@/lib/navLabel";
import { t } from "@/i18n";

export interface SectionProps {
  section: PortfolioSection;
  defaultLanguage?: string;
  multilanguage?: boolean;
}

type FormState = "idle" | "submitting" | "success" | "error" | "ratelimit";

function FieldGroup({
  id,
  label,
  required,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id} className="text-sm font-medium">
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </Label>
      {children}
    </div>
  );
}

function ContactFormPanel({
  section,
  lang,
  formState,
  organisation,
  setOrganisation,
  firstName,
  setFirstName,
  lastName,
  setLastName,
  message,
  setMessage,
  isSubmitting,
  canSubmit,
  onSubmit,
}: {
  section: PortfolioSection;
  lang: string;
  formState: FormState;
  organisation: string;
  setOrganisation: (v: string) => void;
  firstName: string;
  setFirstName: (v: string) => void;
  lastName: string;
  setLastName: (v: string) => void;
  message: string;
  setMessage: (v: string) => void;
  isSubmitting: boolean;
  canSubmit: boolean;
  onSubmit: (e: React.FormEvent) => void;
}) {
  if (formState === "success") {
    return (
      <div className="flex h-full min-h-[280px] flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-muted/30 px-6 py-10 text-center sm:px-10">
        <div
          className="flex size-12 items-center justify-center rounded-full text-lg font-semibold text-white"
          style={{ backgroundColor: "var(--color-primary)" }}
        >
          ✓
        </div>
        <p className="max-w-sm text-sm leading-relaxed" style={{ color: "var(--color-text)" }}>
          {t(lang, "contactSection.success")}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-muted/20 p-5 sm:p-8">
      <form onSubmit={onSubmit} className="flex flex-col gap-5 sm:gap-6" noValidate>
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="pointer-events-none absolute h-0 opacity-0"
        />

        <FieldGroup
          id={`contact-org-${section.id}`}
          label={t(lang, "contactSection.organisation")}
        >
          <Input
            id={`contact-org-${section.id}`}
            value={organisation}
            onChange={(e) => setOrganisation(e.target.value)}
            placeholder={t(lang, "contactSection.organisationPlaceholder")}
            disabled={isSubmitting}
            maxLength={200}
            className="h-10 bg-background"
          />
        </FieldGroup>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-4">
          <FieldGroup
            id={`contact-first-${section.id}`}
            label={t(lang, "contactSection.firstName")}
            required
          >
            <Input
              id={`contact-first-${section.id}`}
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder={t(lang, "contactSection.firstNamePlaceholder")}
              required
              disabled={isSubmitting}
              maxLength={100}
              className="h-10 bg-background"
              autoComplete="given-name"
            />
          </FieldGroup>
          <FieldGroup
            id={`contact-last-${section.id}`}
            label={t(lang, "contactSection.lastName")}
            required
          >
            <Input
              id={`contact-last-${section.id}`}
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder={t(lang, "contactSection.lastNamePlaceholder")}
              required
              disabled={isSubmitting}
              maxLength={100}
              className="h-10 bg-background"
              autoComplete="family-name"
            />
          </FieldGroup>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between gap-3">
            <Label htmlFor={`contact-msg-${section.id}`} className="text-sm font-medium">
              {t(lang, "contactSection.message")}
              <span className="ml-0.5 text-destructive">*</span>
            </Label>
            <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
              {message.length}/2000
            </span>
          </div>
          <Textarea
            id={`contact-msg-${section.id}`}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={t(lang, "contactSection.messagePlaceholder")}
            required
            disabled={isSubmitting}
            maxLength={2000}
            className="min-h-[160px] resize-y bg-background leading-relaxed"
          />
        </div>

        {(formState === "error" || formState === "ratelimit") && (
          <p
            role="alert"
            className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-destructive"
          >
            {formState === "error"
              ? t(lang, "contactSection.error")
              : t(lang, "contactSection.rateLimit")}
          </p>
        )}

        <div className="flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            {t(lang, "contactSection.requiredNote")}
          </p>
          <Button
            type="submit"
            disabled={!canSubmit}
            className="h-10 w-full px-6 sm:w-auto sm:min-w-[148px]"
          >
            {isSubmitting ? t(lang, "contactSection.sending") : t(lang, "contactSection.send")}
          </Button>
        </div>
      </form>
    </div>
  );
}

export function ContactSection({ section, defaultLanguage = "en" }: SectionProps) {
  const lang = defaultLanguage;

  const title =
    (lang === "de" ? section.title_de : section.title_en) || section.title;
  const subtext =
    (lang === "de" ? section.subtext_de : section.subtext_en) || section.subtext;
  const description =
    (lang === "de" ? section.description_de : section.description_en) || section.description;

  const anchorId = resolveNavAnchor(section);

  const mountedAt = useRef(Date.now());

  const [organisation, setOrganisation] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [message, setMessage] = useState("");
  const [formState, setFormState] = useState<FormState>("idle");

  useEffect(() => {
    if (formState === "success" || formState === "error" || formState === "ratelimit") {
      const timer = setTimeout(() => setFormState("idle"), 5000);
      return () => clearTimeout(timer);
    }
  }, [formState]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (formState === "submitting") return;

    if (isLocalMode()) {
      setFormState("success");
      setOrganisation("");
      setFirstName("");
      setLastName("");
      setMessage("");
      return;
    }

    setFormState("submitting");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organisation,
          firstName,
          lastName,
          message,
          website: "",
          _t: mountedAt.current,
        }),
      });

      if (res.status === 429) {
        setFormState("ratelimit");
        return;
      }
      if (!res.ok) {
        setFormState("error");
        return;
      }

      setFormState("success");
      setOrganisation("");
      setFirstName("");
      setLastName("");
      setMessage("");
    } catch {
      setFormState("error");
    }
  }

  const isSubmitting = formState === "submitting";
  const canSubmit =
    !isSubmitting && firstName.trim() && lastName.trim() && message.trim();

  return (
    <section id={anchorId} className="mx-auto max-w-5xl scroll-mt-20 px-6 py-14">
      <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-3 md:gap-10 lg:gap-14">
        {/* Left — intro copy (~1/3 on md+) */}
        <div className="flex flex-col gap-4 md:col-span-1 md:pt-1">
          {section.iconUrl && (
            <img
              src={section.iconUrl}
              alt=""
              aria-hidden="true"
              className="size-7 shrink-0 object-contain"
            />
          )}
          {title && (
            <h2
              className="text-2xl font-bold tracking-tight md:text-3xl"
              style={{ color: "var(--color-text)" }}
            >
              {title}
            </h2>
          )}
          {subtext && (
            <p className="text-sm font-medium md:text-base" style={{ color: "var(--color-primary)" }}>
              {subtext}
            </p>
          )}
          {description && (
            <p className="text-sm leading-relaxed text-muted-foreground md:text-[15px]">
              {description}
            </p>
          )}
        </div>

        {/* Right — form (~2/3 on md+) */}
        <div className="md:col-span-2">
          <ContactFormPanel
            section={section}
            lang={lang}
            formState={formState}
            organisation={organisation}
            setOrganisation={setOrganisation}
            firstName={firstName}
            setFirstName={setFirstName}
            lastName={lastName}
            setLastName={setLastName}
            message={message}
            setMessage={setMessage}
            isSubmitting={isSubmitting}
            canSubmit={canSubmit}
            onSubmit={handleSubmit}
          />
        </div>
      </div>
    </section>
  );
}
