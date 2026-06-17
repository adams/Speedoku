import { digitsOf, onlyDigit, popcount } from "./bits";
import { assign, parseGrid } from "./propagate";
import type { Grid, Mask } from "./types";

export function valuesToGrid(values: Mask[]): Grid {
  return values.map((m) => onlyDigit(m));
}

export function search(values: Mask[] | null): Mask[] | null {
  if (values === null) return null;
  // solved if every cell has exactly one candidate
  let minLen = 10,
    minS = -1;
  for (let s = 0; s < 81; s++) {
    const c = popcount(values[s]);
    if (c > 1 && c < minLen) {
      minLen = c;
      minS = s;
    }
  }
  if (minS === -1) return values; // all solved
  for (const d of digitsOf(values[minS])) {
    const res = search(assign(values.slice(), minS, d));
    if (res) return res;
  }
  return null;
}

export function solve(grid: Grid): Grid | null {
  const solved = search(parseGrid(grid));
  return solved ? valuesToGrid(solved) : null;
}

export function isSolvable(grid: Grid): boolean {
  return search(parseGrid(grid)) !== null;
}
