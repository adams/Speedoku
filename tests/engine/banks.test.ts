import { expect, test } from "vitest";
import { carvePuzzle } from "@/factory/carvePuzzle";
import { type BankFile, pickPuzzle, pickSeed } from "@/lib/engine/banks";
import { countSolutions } from "@/lib/engine/count";
import { mulberry32 } from "@/lib/engine/rng";

// Synthetic seeds: empties via zero-count, rating via the band literal.
const grid = (empties: number) => [
  ...Array(81 - empties).fill(1),
  ...Array(empties).fill(0),
];
const file: BankFile = {
  bands: [
    { lo: 0, hi: 100, seeds: [grid(8)], ratings: [20] }, // easy + near-solved
    { lo: 100, hi: 600, seeds: [grid(55)], ratings: [400] }, // hard + minimal
  ],
};

test("pickSeed picks nearest on BOTH rating and empties", () => {
  // mulberry32(0) first value ≈ 0.266 → floor(0.266*2)=0 → always picks pool[0] (the nearest)
  expect(pickSeed(file, { rating: 25, empties: 9 }, mulberry32(0)).rating).toBe(
    20,
  );
  expect(
    pickSeed(file, { rating: 380, empties: 52 }, mulberry32(0)).rating,
  ).toBe(400);
});

test("pickPuzzle returns a uniquely-solvable transformed puzzle for the target", () => {
  const seed = carvePuzzle(mulberry32(9), { targetEmpties: 50 }).puzzle;
  const real: BankFile = {
    bands: [{ lo: 0, hi: 600, seeds: [seed], ratings: [300] }],
  };
  const p = pickPuzzle(real, { rating: 300, empties: 50 }, mulberry32(77));
  expect(p.length).toBe(81);
  expect(countSolutions(p, 2)).toBe(1);
});

test("deterministic for a seed", () => {
  const seed = carvePuzzle(mulberry32(9), { targetEmpties: 50 }).puzzle;
  const real: BankFile = {
    bands: [{ lo: 0, hi: 600, seeds: [seed], ratings: [300] }],
  };
  expect(pickPuzzle(real, { rating: 300, empties: 50 }, mulberry32(5))).toEqual(
    pickPuzzle(real, { rating: 300, empties: 50 }, mulberry32(5)),
  );
});
