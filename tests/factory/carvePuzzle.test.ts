import { describe, expect, it, test } from "vitest";
import { carvePuzzle } from "@/factory/carvePuzzle";
import { hasUniqueSolution } from "@/lib/engine";
import { countSolutions } from "@/lib/engine/count";
import { mulberry32 } from "@/lib/engine/rng";
import { solve } from "@/lib/engine/solve";

test("carved puzzle is uniquely solvable and matches its solution", () => {
  const { puzzle, solution, clues } = carvePuzzle(mulberry32(99));
  expect(countSolutions(puzzle, 2)).toBe(1);
  expect(solve(puzzle)).toEqual(solution);
  expect(clues).toBe(puzzle.filter((x) => x !== 0).length);
  expect(clues).toBeGreaterThanOrEqual(17); // theoretical minimum
});

test("deterministic per seed", () => {
  expect(carvePuzzle(mulberry32(5))).toEqual(carvePuzzle(mulberry32(5)));
});

describe("carvePuzzle targetEmpties", () => {
  it("produces a near-solved unique puzzle when targetEmpties is small", () => {
    const { puzzle } = carvePuzzle(mulberry32(1), { targetEmpties: 8 });
    const empties = puzzle.filter((d) => d === 0).length;
    expect(empties).toBeLessThanOrEqual(8);
    expect(empties).toBeGreaterThan(0);
    expect(hasUniqueSolution(puzzle)).toBe(true);
  });

  it("defaults to a minimal carve (many empties)", () => {
    const { puzzle } = carvePuzzle(mulberry32(2));
    expect(puzzle.filter((d) => d === 0).length).toBeGreaterThanOrEqual(45);
  });
});
