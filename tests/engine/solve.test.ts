import { expect, test } from "vitest";
import { isSolvable, solve } from "@/lib/engine/solve";

const easy: number[] = [
  0, 0, 3, 0, 2, 0, 6, 0, 0, 9, 0, 0, 3, 0, 5, 0, 0, 1, 0, 0, 1, 8, 0, 6, 4, 0,
  0, 0, 0, 8, 1, 0, 2, 9, 0, 0, 7, 0, 0, 0, 0, 0, 0, 0, 8, 0, 0, 6, 7, 0, 8, 2,
  0, 0, 0, 0, 2, 6, 0, 9, 5, 0, 0, 8, 0, 0, 2, 0, 3, 0, 0, 9, 0, 0, 5, 0, 1, 0,
  3, 0, 0,
];
// Arto Inkala-style hard puzzle (known solvable)
const hard: number[] = [
  8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 6, 0, 0, 0, 0, 0, 0, 7, 0, 0, 9, 0, 2, 0,
  0, 0, 5, 0, 0, 0, 7, 0, 0, 0, 0, 0, 0, 0, 4, 5, 7, 0, 0, 0, 0, 0, 1, 0, 0, 0,
  3, 0, 0, 0, 1, 0, 0, 0, 0, 6, 8, 0, 0, 8, 5, 0, 0, 0, 1, 0, 0, 9, 0, 0, 0, 0,
  4, 0, 0,
];

function isValidSolution(g: number[]): boolean {
  if (g.some((x) => x < 1 || x > 9)) return false;
  for (let i = 0; i < 9; i++) {
    const row = new Set(),
      col = new Set();
    for (let j = 0; j < 9; j++) {
      row.add(g[i * 9 + j]);
      col.add(g[j * 9 + i]);
    }
    if (row.size !== 9 || col.size !== 9) return false;
  }
  for (let br = 0; br < 3; br++) {
    for (let bc = 0; bc < 3; bc++) {
      const box = new Set<number>();
      for (let r = 0; r < 3; r++)
        for (let c = 0; c < 3; c++) box.add(g[(br * 3 + r) * 9 + (bc * 3 + c)]);
      if (box.size !== 9) return false;
    }
  }
  return true;
}

test("solves an easy puzzle to a valid grid", () => {
  const s = solve(easy);
  expect(s).not.toBeNull();
  expect(isValidSolution(s as number[])).toBe(true);
});

test("solves a hard puzzle", () => {
  const s = solve(hard);
  expect(s).not.toBeNull();
  expect(isValidSolution(s as number[])).toBe(true);
});

test("isSolvable false for a broken board", () => {
  const broken = easy.slice();
  broken[1] = 3; // dup 3 in row 0
  expect(isSolvable(broken)).toBe(false);
});
