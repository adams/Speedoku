import { digitsOf, popcount } from "./bits";
import { assign, parseGrid } from "./propagate";
import type { Grid, Mask } from "./types";

export function countSolutions(grid: Grid, limit = 2): number {
  const start = parseGrid(grid);
  if (start === null) return 0;
  let count = 0;
  const rec = (values: Mask[]): void => {
    if (count >= limit) return;
    let minLen = 10;
    let minS = -1;
    for (let s = 0; s < 81; s++) {
      const c = popcount(values[s]);
      if (c > 1 && c < minLen) {
        minLen = c;
        minS = s;
      }
    }
    if (minS === -1) {
      count++;
      return;
    }
    for (const d of digitsOf(values[minS])) {
      if (count >= limit) return;
      const next = assign(values.slice(), minS, d);
      if (next) rec(next);
    }
  };
  rec(start);
  return count;
}

export function hasUniqueSolution(grid: Grid): boolean {
  return countSolutions(grid, 2) === 1;
}
