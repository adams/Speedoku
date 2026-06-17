import { expect, test } from "vitest";
import { generateSolved } from "@/factory/generateSolved";
import { mulberry32 } from "@/lib/engine/rng";

function isValidSolution(g: number[]): boolean {
  if (g.length !== 81 || g.some((x) => x < 1 || x > 9)) return false;
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

test("generates a valid full grid, deterministic per seed", () => {
  const a = generateSolved(mulberry32(123));
  const b = generateSolved(mulberry32(123));
  expect(isValidSolution(a)).toBe(true);
  expect(a).toEqual(b);
});

test("different seeds give different grids", () => {
  expect(generateSolved(mulberry32(1))).not.toEqual(
    generateSolved(mulberry32(2)),
  );
});
