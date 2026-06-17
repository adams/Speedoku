import { bit } from "./bits";
import type { Grid, Mask } from "./types";
import { PEERS } from "./units";

export function isSafe(grid: Grid, cell: number, d: number): boolean {
  if (grid[cell] !== 0) return false;
  for (const p of PEERS[cell]) if (grid[p] === d) return false;
  return true;
}

export function legalCandidates(grid: Grid): Mask[] {
  const out: Mask[] = new Array(81).fill(0);
  for (let s = 0; s < 81; s++) {
    if (grid[s] !== 0) continue;
    let m = 0;
    for (let d = 1; d <= 9; d++) if (isSafe(grid, s, d)) m |= bit(d);
    out[s] = m;
  }
  return out;
}

export function cellsForDigit(grid: Grid, d: number): number[] {
  const out: number[] = [];
  for (let s = 0; s < 81; s++)
    if (grid[s] === 0 && isSafe(grid, s, d)) out.push(s);
  return out;
}
