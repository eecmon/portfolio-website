import { renderHook, act } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useScrollNavVisibility } from "@/lib/useScrollNavVisibility";

describe("useScrollNavVisibility", () => {
  let rafCallbacks: FrameRequestCallback[];

  beforeEach(() => {
    rafCallbacks = [];
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      rafCallbacks.push(cb);
      return rafCallbacks.length;
    });
    Object.defineProperty(window, "scrollY", { value: 0, writable: true, configurable: true });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function flushScroll(y: number) {
    Object.defineProperty(window, "scrollY", { value: y, writable: true, configurable: true });
    act(() => {
      window.dispatchEvent(new Event("scroll"));
    });
    act(() => {
      rafCallbacks.forEach((cb) => cb(0));
      rafCallbacks = [];
    });
  }

  it("starts visible at the top", () => {
    const { result } = renderHook(() => useScrollNavVisibility());
    expect(result.current).toBe(true);
  });

  it("hides when scrolling down", () => {
    const { result } = renderHook(() => useScrollNavVisibility());

    flushScroll(120);
    expect(result.current).toBe(false);
  });

  it("shows again when scrolling up", () => {
    const { result } = renderHook(() => useScrollNavVisibility());

    flushScroll(120);
    expect(result.current).toBe(false);

    flushScroll(90);
    expect(result.current).toBe(true);
  });

  it("always shows when near the top", () => {
    const { result } = renderHook(() => useScrollNavVisibility());

    flushScroll(120);
    expect(result.current).toBe(false);

    flushScroll(4);
    expect(result.current).toBe(true);
  });

  it("stays visible when disabled", () => {
    const { result } = renderHook(() => useScrollNavVisibility({ enabled: false }));

    flushScroll(200);
    expect(result.current).toBe(true);
  });
});
