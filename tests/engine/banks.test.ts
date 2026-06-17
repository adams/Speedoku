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
  expect(pickSeed(file, { rating: 25, empties: 9 }, mulberry32(0)).rating).toBe(
    20,
  );
  expect(
    pickSeed(file, { rating: 380, empties: 52 }, mulberry32(0)).rating,
  ).toBe(400);
});

test("pickSeed neighborhood exclusion: never picks the 2 farthest seeds from a pool of 8", () => {
  // Build a synthetic pool of 8 seeds with distinct (rating, empties) pairs
  // spread across both axes so distances are meaningfully different.
  // Ratings: 0, 100, 200, 300, 400, 500, 600, 700
  // Empties: 10, 15, 20, 25, 30, 35, 40, 45
  // Target at the near end: rating=10, empties=12
  // With this target, the 2 highest-distance seeds (farthest corner) are
  // deterministically at rating=700/empties=45 and rating=600/empties=40.
  // Since NEIGHBORHOOD=6 < 8, pool[6] and pool[7] (the two farthest) must
  // never be picked — verify this across rng seeds 0..9.

  const ratings8 = [0, 100, 200, 300, 400, 500, 600, 700];
  const empties8 = [10, 15, 20, 25, 30, 35, 40, 45];

  const bigFile: BankFile = {
    bands: [
      {
        lo: 0,
        hi: 800,
        seeds: empties8.map((e) => grid(e)),
        ratings: ratings8,
      },
    ],
  };

  const target = { rating: 10, empties: 12 };

  // Replicate the normalized-distance formula from pickSeed to find the 2 farthest.
  const rSpan = Math.max(...ratings8) - Math.min(...ratings8); // 700
  const eSpan = Math.max(...empties8) - Math.min(...empties8); // 35
  const dist = (r: number, e: number) =>
    Math.abs(r - target.rating) / rSpan + Math.abs(e - target.empties) / eSpan;

  const poolWithDist = ratings8.map((r, i) => ({
    rating: r,
    empties: empties8[i],
    d: dist(r, empties8[i]),
  }));
  poolWithDist.sort((a, b) => a.d - b.d);

  // The 2 farthest seeds (indices 6 and 7 after sort) must never be returned.
  const farthestRatings = new Set(poolWithDist.slice(6).map((p) => p.rating));

  let nearestSeen = false;
  for (let s = 0; s <= 9; s++) {
    const result = pickSeed(bigFile, target, mulberry32(s));
    expect(
      farthestRatings.has(result.rating),
      `rng seed ${s}: got rating ${result.rating} which is one of the 2 farthest`,
    ).toBe(false);
    if (result.rating === poolWithDist[0].rating) nearestSeen = true;
  }
  // Confirm the nearest seed is reachable (index 0 is within the neighborhood).
  expect(
    nearestSeen,
    "nearest seed was never returned across rng seeds 0-9",
  ).toBe(true);
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
