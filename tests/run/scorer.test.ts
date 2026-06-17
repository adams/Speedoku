import { describe, expect, it } from "vitest";
import {
  difficultyWeight,
  par,
  puzzleFloor,
  puzzleMax,
  puzzleScore,
} from "@/lib/run/scorer";
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
  parFastSec: 20,
  parSlowSec: 100,
};

describe("par", () => {
  it("is parFastSec at floor and parSlowSec at top", () => {
    expect(par(100, config)).toBeCloseTo(20);
    expect(par(500, config)).toBeCloseTo(100);
  });
  it("increases with rating", () => {
    expect(par(300, config)).toBeGreaterThan(par(100, config));
  });
});

describe("difficultyWeight", () => {
  it("is 1 at floor and 1+weightSlope at top", () => {
    expect(difficultyWeight(100, config)).toBeCloseTo(1);
    expect(difficultyWeight(500, config)).toBeCloseTo(3);
  });
});

describe("puzzleScore", () => {
  it("caps the speed factor for an instant solve", () => {
    // weight at floor = 1; par = 20s; solve = 1ms → ratio huge → clamp to cap=4
    expect(puzzleScore(100, 1, config)).toBe(Math.round(1000 * 1 * 4));
  });
  it("floors the speed factor for a very slow solve", () => {
    // ratio tiny → clamp to floorRatio=0.25
    expect(puzzleScore(100, 10_000_000, config)).toBe(
      Math.round(1000 * 1 * 0.25),
    );
  });
  it("is never zero or negative", () => {
    expect(puzzleScore(500, 10_000_000, config)).toBeGreaterThan(0);
  });
});

describe("puzzleMax / puzzleFloor (meter endpoints)", () => {
  it("bound the live score: instant solve hits max, very slow hits floor", () => {
    expect(puzzleScore(100, 1, config)).toBe(
      Math.round(puzzleMax(100, config)),
    );
    expect(puzzleScore(100, 10_000_000, config)).toBe(
      Math.round(puzzleFloor(100, config)),
    );
  });

  it("both rise with rating, and max exceeds floor", () => {
    expect(puzzleMax(300, config)).toBeGreaterThan(puzzleMax(100, config));
    expect(puzzleFloor(300, config)).toBeGreaterThan(puzzleFloor(100, config));
    expect(puzzleMax(300, config)).toBeGreaterThan(puzzleFloor(300, config));
  });
});
