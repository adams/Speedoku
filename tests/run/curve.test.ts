import { describe, expect, it } from "vitest";
import { curveTarget, targetEmpties, targetRating } from "@/lib/run/curve";
import type { RunConfig } from "@/lib/run/types";

const config: RunConfig = {
  seed: 1,
  mode: "hints-on",
  tutorialRating: 100,
  floorRating: 100,
  slope: 20,
  curvature: 0,
  topRating: 500,
  floorEmpties: 8,
  topEmpties: 54,
  base: 1000,
  floorRatio: 0.25,
  cap: 4,
  weightSlope: 2,
  parFastSec: 25,
  parSlowSec: 90,
};

describe("targetRating", () => {
  it("is the floor at depth 1 (no special tutorial)", () => {
    expect(targetRating(1, config)).toBe(100);
  });
  it("takes one slope-step to depth 2 (small, continuous)", () => {
    expect(targetRating(2, config)).toBe(120);
  });
  it("rises monotonically and clamps at the top", () => {
    let prev = targetRating(1, config);
    for (let d = 2; d <= 40; d++) {
      const cur = targetRating(d, config);
      expect(cur).toBeGreaterThanOrEqual(prev);
      expect(cur).toBeLessThanOrEqual(config.topRating);
      prev = cur;
    }
    expect(targetRating(40, config)).toBe(500);
  });
});

describe("targetEmpties", () => {
  it("is the floor (near-solved) at depth 1", () => {
    expect(targetEmpties(1, config)).toBe(8);
  });
  it("rises with depth and reaches the top (minimal) faster than rating", () => {
    expect(targetEmpties(2, config)).toBeGreaterThan(8);
    expect(targetEmpties(8, config)).toBe(54); // saturates by ~depth 8
    expect(targetEmpties(20, config)).toBe(54); // stays at minimal
  });
});

describe("curveTarget", () => {
  it("bundles rating + empties; depth 1 is the easy floor on both axes", () => {
    expect(curveTarget(1, config)).toEqual({ rating: 100, empties: 8 });
  });
});
