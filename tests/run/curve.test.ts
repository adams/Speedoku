import { describe, expect, it } from "vitest";
import { targetRating } from "@/lib/run/curve";
import type { RunConfig } from "@/lib/run/types";

const config: RunConfig = {
  seed: 1,
  mode: "hints-on",
  tutorialRating: 100,
  floorRating: 100,
  slope: 20,
  curvature: 0,
  topRating: 500,
  base: 1000,
  floorRatio: 0.25,
  cap: 4,
  weightSlope: 2,
  parFastSec: 25,
  parSlowSec: 90,
};

describe("targetRating", () => {
  it("returns tutorialRating at depth 1", () => {
    expect(targetRating(1, config)).toBe(100);
  });

  it("returns floorRating at depth 2", () => {
    expect(targetRating(2, config)).toBe(100);
  });

  it("strictly increases until it reaches the top, then clamps", () => {
    let prev = targetRating(2, config);
    for (let d = 3; d <= 40; d++) {
      const cur = targetRating(d, config);
      expect(cur).toBeGreaterThanOrEqual(prev);
      expect(cur).toBeLessThanOrEqual(config.topRating);
      prev = cur;
    }
    expect(targetRating(40, config)).toBe(500); // clamped at top
  });
});
