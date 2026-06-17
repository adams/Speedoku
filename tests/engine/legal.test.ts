import { expect, test } from "vitest";
import { digitsOf } from "@/lib/engine/bits";
import { cellsForDigit, isSafe, legalCandidates } from "@/lib/engine/legal";

// Row 0 = 5,3,0,0,7,...  (classic puzzle first row)
const g: number[] = [
  5, 3, 0, 0, 7, 0, 0, 0, 0, 6, 0, 0, 1, 9, 5, 0, 0, 0, 0, 9, 8, 0, 0, 0, 0, 6,
  0, 8, 0, 0, 0, 6, 0, 0, 0, 3, 4, 0, 0, 8, 0, 3, 0, 0, 1, 7, 0, 0, 0, 2, 0, 0,
  0, 6, 0, 6, 0, 0, 0, 0, 2, 8, 0, 0, 0, 0, 4, 1, 9, 0, 0, 5, 0, 0, 0, 0, 8, 0,
  0, 7, 9,
];

test("isSafe respects row/col/box", () => {
  expect(isSafe(g, 2, 5)).toBe(false); // 5 already in row 0
  expect(isSafe(g, 2, 1)).toBe(true); // 1 legal at r0c2
  expect(isSafe(g, 2, 8)).toBe(false); // 8 in box 0 (r2c2)
});

test("legalCandidates: filled cells 0, empty cells masked", () => {
  const cand = legalCandidates(g);
  expect(cand[0]).toBe(0); // filled (5)
  expect(digitsOf(cand[2])).toContain(1); // 1 legal at r0c2
  expect(digitsOf(cand[2])).not.toContain(5);
});

test("cellsForDigit returns empty legal cells for a digit", () => {
  const cells = cellsForDigit(g, 1);
  expect(cells).toContain(2);
  for (const c of cells) expect(g[c]).toBe(0);
});
