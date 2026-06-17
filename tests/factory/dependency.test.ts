import { describe, expect, it } from "vitest";
import { dependencyEase } from "@/factory/dependency";
import type { Grid } from "@/lib/engine";

// Easy: a full solution with 4 cells removed (each a naked single).
const EASY: Grid = [
  5, 3, 4, 6, 7, 8, 9, 1, 0, 6, 7, 2, 1, 9, 5, 3, 4, 0, 1, 9, 8, 3, 4, 2, 5, 6,
  0, 8, 5, 9, 7, 6, 1, 4, 2, 0, 4, 2, 6, 8, 5, 3, 7, 9, 1, 7, 1, 3, 9, 2, 4, 8,
  5, 6, 9, 6, 1, 5, 3, 7, 2, 8, 4, 2, 8, 7, 4, 1, 9, 6, 3, 5, 3, 4, 5, 2, 8, 6,
  1, 7, 9,
];

// Hard: a known 17-clue puzzle (few givens → little redundancy).
const HARD: Grid = [
  0, 0, 0, 0, 0, 0, 0, 1, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 5, 0, 4, 0, 7, 0, 0, 8, 0, 0, 0, 3, 0, 0, 0, 0, 1, 0, 9, 0, 0,
  0, 0, 3, 0, 0, 4, 0, 0, 2, 0, 0, 0, 5, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 8, 0, 6,
  0, 0, 0,
];

describe("dependencyEase", () => {
  it("is deterministic for a given puzzle", () => {
    expect(dependencyEase(EASY)).toBe(dependencyEase(EASY));
  });

  it("rates an easy (redundant) puzzle higher than a hard one", () => {
    expect(dependencyEase(EASY)).toBeGreaterThan(dependencyEase(HARD));
  });

  it("returns a finite non-negative number", () => {
    const v = dependencyEase(HARD);
    expect(Number.isFinite(v)).toBe(true);
    expect(v).toBeGreaterThanOrEqual(0);
  });
});
