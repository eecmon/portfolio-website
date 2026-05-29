import { describe, expect, it } from "vitest";
import {
  getScaledDimensions,
  isOptimizableImage,
} from "@/lib/optimizeImage";

describe("optimizeImage helpers", () => {
  it("detects optimizable raster types", () => {
    expect(isOptimizableImage(new File([], "a.jpg", { type: "image/jpeg" }))).toBe(true);
    expect(isOptimizableImage(new File([], "a.webp", { type: "image/webp" }))).toBe(true);
    expect(isOptimizableImage(new File([], "a.svg", { type: "image/svg+xml" }))).toBe(false);
    expect(isOptimizableImage(new File([], "a.gif", { type: "image/gif" }))).toBe(false);
    expect(isOptimizableImage(new File([], "a.pdf", { type: "application/pdf" }))).toBe(false);
  });

  it("scales down dimensions that exceed max size", () => {
    expect(getScaledDimensions(4000, 2000, 1920)).toEqual({
      width: 1920,
      height: 960,
      scale: 0.48,
    });
  });

  it("keeps dimensions when already within max size", () => {
    expect(getScaledDimensions(800, 600, 1920)).toEqual({
      width: 800,
      height: 600,
      scale: 1,
    });
  });
});
