import { describe, expect, it } from "vitest";
import { combinedRatings } from "@/factory/grade";
import type { Grid } from "@/lib/engine";

const EASY: Grid = [
  5, 3, 4, 6, 7, 8, 9, 1, 0, 6, 7, 2, 1, 9, 5, 3, 4, 0, 1, 9, 8, 3, 4, 2, 5, 6,
  0, 8, 5, 9, 7, 6, 1, 4, 2, 0, 4, 2, 6, 8, 5, 3, 7, 9, 1, 7, 1, 3, 9, 2, 4, 8,
  5, 6, 9, 6, 1, 5, 3, 7, 2, 8, 4, 2, 8, 7, 4, 1, 9, 6, 3, 5, 3, 4, 5, 2, 8, 6,
  1, 7, 9,
] as const;
const HARD: Grid = [
  0, 0, 0, 0, 0, 0, 0, 1, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 5, 0, 4, 0, 7, 0, 0, 8, 0, 0, 0, 3, 0, 0, 0, 0, 1, 0, 9, 0, 0,
  0, 0, 3, 0, 0, 4, 0, 0, 2, 0, 0, 0, 5, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 8, 0, 6,
  0, 0, 0,
] as const;

describe("combinedRatings", () => {
  it("returns one rating per puzzle", () => {
    expect(combinedRatings([EASY, HARD])).toHaveLength(2);
  });

  it("rates the hard puzzle above the easy one", () => {
    const [easy, hard] = combinedRatings([EASY, HARD]);
    expect(hard).toBeGreaterThan(easy);
  });

  it("produces finite ratings within the scaled range", () => {
    for (const r of combinedRatings([EASY, HARD])) {
      expect(Number.isFinite(r)).toBe(true);
      expect(r).toBeGreaterThanOrEqual(0);
      expect(r).toBeLessThanOrEqual(1000);
    }
  });
});
