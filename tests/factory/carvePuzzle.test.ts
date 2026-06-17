import { expect, test } from "vitest";
import { carvePuzzle } from "@/factory/carvePuzzle";
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
