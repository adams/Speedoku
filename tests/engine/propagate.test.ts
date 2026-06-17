import { expect, test } from "vitest";
import { onlyDigit, popcount } from "@/lib/engine/bits";
import { assign, eliminate, parseGrid } from "@/lib/engine/propagate";
import { ALL_DIGITS } from "@/lib/engine/types";

const easy: number[] = [
  0, 0, 3, 0, 2, 0, 6, 0, 0, 9, 0, 0, 3, 0, 5, 0, 0, 1, 0, 0, 1, 8, 0, 6, 4, 0,
  0, 0, 0, 8, 1, 0, 2, 9, 0, 0, 7, 0, 0, 0, 0, 0, 0, 0, 8, 0, 0, 6, 7, 0, 8, 2,
  0, 0, 0, 0, 2, 6, 0, 9, 5, 0, 0, 8, 0, 0, 2, 0, 3, 0, 0, 9, 0, 0, 5, 0, 1, 0,
  3, 0, 0,
];

test("parseGrid propagates givens without contradiction", () => {
  const v = parseGrid(easy);
  expect(v).not.toBeNull();
  // a given cell collapses to exactly that digit
  expect(onlyDigit((v as number[])[2])).toBe(3);
});

test("contradictory givens return null", () => {
  const bad = easy.slice();
  bad[1] = 3; // two 3s in row 0
  expect(parseGrid(bad)).toBeNull();
});

test("assign collapses a cell and propagates to peers", () => {
  const v: number[] = new Array(81).fill(ALL_DIGITS);
  expect(assign(v, 0, 5)).not.toBeNull();
  expect(onlyDigit(v[0])).toBe(5);
  // peers can no longer be 5
  expect(v[1] & (1 << 4)).toBe(0);
});

test("eliminating the last candidate is a contradiction", () => {
  const v: number[] = new Array(81).fill(ALL_DIGITS);
  // collapse cell 0 to {1} then eliminate 1
  for (let d = 2; d <= 9; d++) eliminate(v, 0, d);
  expect(popcount(v[0])).toBe(1);
  expect(eliminate(v, 0, 1)).toBeNull();
});
