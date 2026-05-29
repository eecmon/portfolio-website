import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { ThemeIntroProps } from "@/themes/types";
import { MODERN_1_INTRO_TIMING } from "./timing";
import "./intro.css";

type IntroPhase = "initials" | "typing" | "hold" | "exit" | "done";

const { initialsMs, charMs, typingCompleteDelayMs, holdMs, exitMs } = MODERN_1_INTRO_TIMING;

export function Modern1IntroOverlay({ firstName, lastName, onReveal, onComplete }: ThemeIntroProps) {
  const [phase, setPhase] = useState<IntroPhase>("initials");
  const [typedLength, setTypedLength] = useState(0);
  const onRevealRef = useRef(onReveal);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onRevealRef.current = onReveal;
    onCompleteRef.current = onComplete;
  }, [onReveal, onComplete]);

  const fullName = useMemo(
    () => [firstName.trim(), lastName.trim()].filter(Boolean).join(" "),
    [firstName, lastName]
  );

  const firstInitial = firstName.trim()[0]?.toUpperCase() ?? "";
  const lastInitial = lastName.trim()[0]?.toUpperCase() ?? "";

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    if (phase !== "initials") return;
    const timer = window.setTimeout(() => setPhase("typing"), initialsMs);
    return () => window.clearTimeout(timer);
  }, [phase]);

  useEffect(() => {
    if (phase !== "typing") return;

    if (typedLength === 0 && fullName.length > 0) {
      setTypedLength(1);
      return;
    }

    if (typedLength >= fullName.length) {
      const timer = window.setTimeout(() => setPhase("hold"), typingCompleteDelayMs);
      return () => window.clearTimeout(timer);
    }

    const timer = window.setTimeout(() => setTypedLength((n) => n + 1), charMs);
    return () => window.clearTimeout(timer);
  }, [phase, typedLength, fullName.length]);

  useEffect(() => {
    if (phase !== "hold") return;
    const timer = window.setTimeout(() => {
      onRevealRef.current();
      setPhase("exit");
    }, holdMs);
    return () => window.clearTimeout(timer);
  }, [phase]);

  useEffect(() => {
    if (phase !== "exit") return;
    const timer = window.setTimeout(() => {
      setPhase("done");
      onCompleteRef.current();
    }, exitMs);
    return () => window.clearTimeout(timer);
  }, [phase]);

  if (phase === "done") return null;

  const showInitials = phase === "initials";
  const showName = phase === "typing" || phase === "hold" || phase === "exit";
  const isTyping = phase === "typing";
  const isExiting = phase === "exit";
  const typedName = fullName.slice(0, typedLength);
  const nameComplete = typedLength >= fullName.length;

  return (
    <div
      data-theme="modern-1"
      className={cn(
        "fixed inset-0 z-[100] flex items-center justify-center",
        isExiting ? "modern-1-intro-exit-overlay pointer-events-none" : "opacity-100"
      )}
      aria-hidden="true"
    >
      <div
        className={cn(
          "absolute inset-0 bg-background/70 backdrop-blur-xl",
          isExiting && "modern-1-intro-exit-backdrop"
        )}
      />

      <div
        className={cn(
          "pointer-events-none absolute size-[min(55vw,20rem)] rounded-full opacity-20 blur-3xl",
          "bg-[radial-gradient(circle,var(--color-primary)_0%,transparent_72%)]",
          isExiting && "modern-1-intro-exit-glow"
        )}
      />

      <div className={cn("relative px-6 text-center", isExiting && "modern-1-intro-exit-content")}>
        <div className="relative flex h-[3.5rem] items-center justify-center sm:h-[4rem]">
          <div
            className={cn(
              "absolute flex items-center justify-center gap-5 sm:gap-7",
              "transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
              showInitials ? "scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0"
            )}
            aria-hidden={!showInitials}
          >
            {firstInitial && (
              <span className="modern-1-intro-initial-pop text-5xl font-semibold tracking-tight text-foreground/90 sm:text-6xl">
                {firstInitial}
              </span>
            )}
            {lastInitial && (
              <span
                className="modern-1-intro-initial-pop text-5xl font-semibold tracking-tight text-foreground/90 sm:text-6xl"
                style={{ animationDelay: "80ms" }}
              >
                {lastInitial}
              </span>
            )}
          </div>

          <h1
            className={cn(
              "absolute whitespace-nowrap font-bold tracking-tight",
              "text-[clamp(1.75rem,5vw,3rem)]",
              "transition-opacity duration-300 ease-out",
              showName ? "opacity-100" : "pointer-events-none opacity-0"
            )}
            style={{ color: "var(--color-text)" }}
            aria-hidden={!showName}
          >
            {typedName}
            {isTyping && typedLength < fullName.length && (
              <span className="modern-1-intro-type-cursor ml-0.5 inline-block h-[0.9em] w-[2px] translate-y-[0.08em] bg-[var(--color-primary)]" />
            )}
          </h1>
        </div>

        <div
          className={cn(
            "mx-auto mt-6 h-px bg-gradient-to-r from-transparent via-[var(--color-primary)] to-transparent",
            "transition-all duration-400 ease-out",
            nameComplete && showName ? "w-24 opacity-50 sm:w-32" : "w-0 opacity-0"
          )}
        />
      </div>
    </div>
  );
}
