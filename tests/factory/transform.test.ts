import { expect, test } from "vitest";
import { carvePuzzle } from "@/factory/carvePuzzle";
import { randomTransform, relabel, transpose } from "@/factory/transform";
import { countSolutions } from "@/lib/engine/count";
import { mulberry32 } from "@/lib/engine/rng";

function isValidSolution(g: number[]): boolean {
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

test("relabel preserves validity and is reversible structure", () => {
  const { solution } = carvePuzzle(mulberry32(3));
  const perm = [9, 8, 7, 6, 5, 4, 3, 2, 1];
  const r = relabel(solution, perm);
  expect(isValidSolution(r)).toBe(true);
  expect(r[0]).toBe(perm[solution[0] - 1]);
});

test("transpose preserves validity", () => {
  const { solution } = carvePuzzle(mulberry32(4));
  expect(isValidSolution(transpose(solution))).toBe(true);
});

test("randomTransform of a unique puzzle stays uniquely solvable", () => {
  const { puzzle } = carvePuzzle(mulberry32(11));
  const t = randomTransform(puzzle, mulberry32(22));
  expect(countSolutions(t, 2)).toBe(1);
});
