import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { PortfolioSection } from "@/api/contentApi";
import { isLocalMode } from "@/api/apiMode";
import { SectionShell } from "./SectionShell";
import { t } from "@/i18n";

export interface SectionProps {
  section: PortfolioSection;
  defaultLanguage?: string;
  multilanguage?: boolean;
}

type FormState = "idle" | "submitting" | "success" | "error" | "ratelimit";

export function ContactSection({ section, defaultLanguage = "en" }: SectionProps) {
  const lang = defaultLanguage;

  const mountedAt = useRef(Date.now());

  const [organisation, setOrganisation] = useState("");
  const [firstName, setFirstName]       = useState("");
  const [lastName, setLastName]         = useState("");
  const [message, setMessage]           = useState("");
  const [formState, setFormState]       = useState<FormState>("idle");

  // Reset to idle after showing success/error for 5 seconds
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
          website: "",           // honeypot — always empty for real users
          _t: mountedAt.current, // timing check
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

  return (
    <SectionShell section={section} lang={lang}>
      {formState === "success" ? (
        <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 px-5 py-6">
          <span className="text-xl">✓</span>
          <p className="text-sm" style={{ color: "var(--color-primary)" }}>
            {t(lang, "contactSection.success")}
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex max-w-xl flex-col gap-4" noValidate>
          {/* Honeypot — visually hidden, never filled by real users */}
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            style={{ position: "absolute", opacity: 0, pointerEvents: "none", height: 0 }}
          />

          {/* Organisation (optional) */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`contact-org-${section.id}`}>
              {t(lang, "contactSection.organisation")}
            </Label>
            <Input
              id={`contact-org-${section.id}`}
              value={organisation}
              onChange={(e) => setOrganisation(e.target.value)}
              placeholder={t(lang, "contactSection.organisationPlaceholder")}
              disabled={isSubmitting}
              maxLength={200}
            />
          </div>

          {/* First + Last name */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={`contact-first-${section.id}`}>
                {t(lang, "contactSection.firstName")} <span className="text-destructive">*</span>
              </Label>
              <Input
                id={`contact-first-${section.id}`}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder={t(lang, "contactSection.firstNamePlaceholder")}
                required
                disabled={isSubmitting}
                maxLength={100}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={`contact-last-${section.id}`}>
                {t(lang, "contactSection.lastName")} <span className="text-destructive">*</span>
              </Label>
              <Input
                id={`contact-last-${section.id}`}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder={t(lang, "contactSection.lastNamePlaceholder")}
                required
                disabled={isSubmitting}
                maxLength={100}
              />
            </div>
          </div>

          {/* Message */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`contact-msg-${section.id}`}>
              {t(lang, "contactSection.message")} <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id={`contact-msg-${section.id}`}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t(lang, "contactSection.messagePlaceholder")}
              required
              disabled={isSubmitting}
              maxLength={2000}
              className="min-h-[140px] resize-y"
            />
            <span className="text-right text-[11px] text-muted-foreground">
              {message.length}/2000
            </span>
          </div>

          {/* Error / rate limit messages */}
          {formState === "error" && (
            <p className="text-sm text-destructive">{t(lang, "contactSection.error")}</p>
          )}
          {formState === "ratelimit" && (
            <p className="text-sm text-destructive">{t(lang, "contactSection.rateLimit")}</p>
          )}

          <Button
            type="submit"
            disabled={isSubmitting || !firstName.trim() || !lastName.trim() || !message.trim()}
            className="self-start"
          >
            {isSubmitting ? t(lang, "contactSection.sending") : t(lang, "contactSection.send")}
          </Button>
        </form>
      )}
    </SectionShell>
  );
}
