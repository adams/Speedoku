import { expect, test } from "vitest";
import { carvePuzzle } from "@/factory/carvePuzzle";
import { type BankFile, pickPuzzle } from "@/lib/engine/banks";
import { countSolutions } from "@/lib/engine/count";
import { mulberry32 } from "@/lib/engine/rng";

const seedA = carvePuzzle(mulberry32(1)).puzzle;
const seedB = carvePuzzle(mulberry32(2)).puzzle;
const file: BankFile = { bands: [{ lo: 0, hi: 50, seeds: [seedA, seedB] }] };

test("pickPuzzle returns a uniquely-solvable transformed puzzle near the target", () => {
  const p = pickPuzzle(file, 10, mulberry32(77));
  expect(p.length).toBe(81);
  expect(countSolutions(p, 2)).toBe(1);
});

test("deterministic for a seed", () => {
  expect(pickPuzzle(file, 10, mulberry32(5))).toEqual(
    pickPuzzle(file, 10, mulberry32(5)),
  );
});
