import { render, screen, act } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { shouldShowThemeIntro, themeHasIntro } from "@/themes/introRegistry";
import { Modern1IntroOverlay } from "@/themes/modern-1/IntroOverlay";
import { MODERN_1_INTRO_TIMING } from "@/themes/modern-1/timing";
import { ThemeIntroOverlay } from "@/components/customComponents/ThemeIntro";

describe("theme intro registry", () => {
  beforeEach(() => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("registers modern-1 intro", () => {
    expect(themeHasIntro("modern-1")).toBe(true);
    expect(themeHasIntro("unknown-theme")).toBe(false);
  });

  it("returns false when theme has no intro", () => {
    expect(shouldShowThemeIntro("unknown-theme", "Mantas", "Ercius")).toBe(false);
  });

  it("returns false when both names are empty", () => {
    expect(shouldShowThemeIntro("modern-1", "", "")).toBe(false);
  });

  it("returns true for modern-1 when names exist", () => {
    expect(shouldShowThemeIntro("modern-1", "Mantas", "Ercius")).toBe(true);
  });

  it("returns false when reduced motion is preferred", () => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: query === "(prefers-reduced-motion: reduce)",
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    expect(shouldShowThemeIntro("modern-1", "Mantas", "Ercius")).toBe(false);
  });
});

describe("ThemeIntroOverlay", () => {
  it("renders nothing for themes without an intro", () => {
    const { container } = render(
      <ThemeIntroOverlay
        theme="unknown-theme"
        firstName="Mantas"
        lastName="Ercius"
        onReveal={vi.fn()}
        onComplete={vi.fn()}
      />
    );
    expect(container).toBeEmptyDOMElement();
  });
});

describe("Modern1IntroOverlay", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    document.body.style.overflow = "";
  });

  function runFullIntro(onComplete: () => void, onReveal: () => void) {
    render(
      <Modern1IntroOverlay
        firstName="Mantas"
        lastName="Ercius"
        onReveal={onReveal}
        onComplete={onComplete}
      />
    );

    const { initialsMs, charMs, typingCompleteDelayMs, holdMs, exitMs } = MODERN_1_INTRO_TIMING;

    act(() => {
      vi.advanceTimersByTime(initialsMs);
    });

    const fullName = "Mantas Ercius";
    for (let i = 0; i < fullName.length; i += 1) {
      act(() => {
        vi.advanceTimersByTime(charMs);
      });
    }

    act(() => {
      vi.advanceTimersByTime(typingCompleteDelayMs);
    });
    act(() => {
      vi.advanceTimersByTime(holdMs);
    });
    act(() => {
      vi.advanceTimersByTime(exitMs);
    });
  }

  it("shows initials side by side then types the full name", () => {
    render(
      <Modern1IntroOverlay
        firstName="Mantas"
        lastName="Ercius"
        onReveal={vi.fn()}
        onComplete={vi.fn()}
      />
    );

    expect(screen.getByText("M")).toBeInTheDocument();
    expect(screen.getByText("E")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(MODERN_1_INTRO_TIMING.initialsMs);
    });

    expect(screen.getByRole("heading", { hidden: true })).toHaveTextContent("M");
  });

  it("reveals the site before the overlay finishes", () => {
    const onReveal = vi.fn();
    const onComplete = vi.fn();

    render(
      <Modern1IntroOverlay
        firstName="Mantas"
        lastName="Ercius"
        onReveal={onReveal}
        onComplete={onComplete}
      />
    );

    const { initialsMs, charMs, typingCompleteDelayMs, holdMs } = MODERN_1_INTRO_TIMING;

    act(() => {
      vi.advanceTimersByTime(initialsMs);
    });

    const fullName = "Mantas Ercius";
    for (let i = 0; i < fullName.length; i += 1) {
      act(() => {
        vi.advanceTimersByTime(charMs);
      });
    }

    act(() => {
      vi.advanceTimersByTime(typingCompleteDelayMs);
    });
    act(() => {
      vi.advanceTimersByTime(holdMs);
    });

    expect(onReveal).toHaveBeenCalledTimes(1);
    expect(onComplete).not.toHaveBeenCalled();
  });

  it("completes the sequence", () => {
    const onReveal = vi.fn();
    const onComplete = vi.fn();
    runFullIntro(onComplete, onReveal);
    expect(onReveal).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("locks body scroll while visible", () => {
    render(
      <Modern1IntroOverlay
        firstName="Mantas"
        lastName="Ercius"
        onReveal={vi.fn()}
        onComplete={vi.fn()}
      />
    );
    expect(document.body.style.overflow).toBe("hidden");
  });
});
