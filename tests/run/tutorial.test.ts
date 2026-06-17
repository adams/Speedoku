import { describe, expect, it } from "vitest";
import { hasUniqueSolution, isSolvable } from "@/lib/engine";
import { TUTORIAL_GRID } from "@/lib/run/tutorial";

describe("TUTORIAL_GRID", () => {
  it("is length 81", () => {
    expect(TUTORIAL_GRID).toHaveLength(81);
  });
  it("has a handful of empty cells", () => {
    expect(TUTORIAL_GRID.filter((d) => d === 0)).toHaveLength(4);
  });
  it("is solvable and unique", () => {
    expect(isSolvable(TUTORIAL_GRID)).toBe(true);
    expect(hasUniqueSolution(TUTORIAL_GRID)).toBe(true);
  });
});
