import { expect, test } from "vitest";
import { carvePuzzle } from "@/factory/carvePuzzle";
import { generateSolved } from "@/factory/generateSolved";
import { countSolutions } from "@/lib/engine/count";
import { mulberry32 } from "@/lib/engine/rng";
import {
  permuteBands,
  permuteColsInStacks,
  permuteRowsInBands,
  permuteStacks,
  randomTransform,
  relabel,
  transpose,
} from "@/lib/engine/transform";

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

test("permuteBands moves whole bands", () => {
  const sol = generateSolved(mulberry32(7));
  const t = permuteBands(sol, [2, 0, 1]);
  expect(isValidSolution(t)).toBe(true);
  // destination band 0 (rows 0-2) comes from source band 2 (rows 6-8)
  expect(t.slice(0, 27)).toEqual(sol.slice(54, 81));
  // destination band 1 (rows 3-5) comes from source band 0 (rows 0-2)
  expect(t.slice(27, 54)).toEqual(sol.slice(0, 27));
});

test("permuteStacks moves whole stacks", () => {
  const sol = generateSolved(mulberry32(7));
  const col = (g: number[], k: number) =>
    Array.from({ length: 9 }, (_, r) => g[r * 9 + k]);

  const t = permuteStacks(sol, [2, 0, 1]);
  expect(isValidSolution(t)).toBe(true);
  // destination col 0 equals source col 6
  expect(col(t, 0)).toEqual(col(sol, 6));
  // destination col 3 equals source col 0
  expect(col(t, 3)).toEqual(col(sol, 0));
});

test("permuteRowsInBands reorders rows within a band only", () => {
  const sol = generateSolved(mulberry32(7));
  const row = (g: number[], k: number) => g.slice(k * 9, k * 9 + 9);

  const t = permuteRowsInBands(sol, [
    [2, 0, 1],
    [0, 1, 2],
    [0, 1, 2],
  ]);
  expect(isValidSolution(t)).toBe(true);
  // destination row 0 comes from source row 2 (band 0, perm[0]=2)
  expect(row(t, 0)).toEqual(row(sol, 2));
  // band 1 unchanged
  expect(t.slice(27, 54)).toEqual(sol.slice(27, 54));
});

test("permuteColsInStacks reorders cols within a stack only", () => {
  const sol = generateSolved(mulberry32(7));
  const col = (g: number[], k: number) =>
    Array.from({ length: 9 }, (_, r) => g[r * 9 + k]);

  const t = permuteColsInStacks(sol, [
    [2, 0, 1],
    [0, 1, 2],
    [0, 1, 2],
  ]);
  expect(isValidSolution(t)).toBe(true);
  // destination col 0 comes from source col 2
  expect(col(t, 0)).toEqual(col(sol, 2));
  // stack 1 cols unchanged
  expect(col(t, 3)).toEqual(col(sol, 3));
});
