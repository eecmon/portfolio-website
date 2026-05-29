import { useEffect, useState } from "react";

interface UseScrollNavVisibilityOptions {
  /** Scroll position from top where the nav always stays visible. */
  topThreshold?: number;
  /** Minimum scroll delta before toggling visibility. */
  scrollDelta?: number;
  /** When false, the nav stays visible and no scroll listener is attached. */
  enabled?: boolean;
}

export function useScrollNavVisibility({
  topThreshold = 8,
  scrollDelta = 6,
  enabled = true,
}: UseScrollNavVisibilityOptions = {}): boolean {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!enabled) {
      setVisible(true);
      return;
    }
    let lastScrollY = window.scrollY;
    let ticking = false;

    const update = () => {
      ticking = false;
      const currentY = window.scrollY;

      if (currentY <= topThreshold) {
        setVisible(true);
        lastScrollY = currentY;
        return;
      }

      const delta = currentY - lastScrollY;
      if (Math.abs(delta) < scrollDelta) return;

      setVisible(delta < 0);
      lastScrollY = currentY;
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [topThreshold, scrollDelta, enabled]);

  return visible;
}
