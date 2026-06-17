import { bit, digitsOf, popcount } from "./bits";
import type { Grid, Mask } from "./types";
import { ALL_DIGITS } from "./types";
import { UNITS_OF } from "./units";

export function assign(values: Mask[], s: number, d: number): Mask[] | null {
  const otherDigits = digitsOf(values[s]).filter((x) => x !== d);
  for (const d2 of otherDigits) if (!eliminate(values, s, d2)) return null;
  return values;
}

export function eliminate(values: Mask[], s: number, d: number): Mask[] | null {
  const b = bit(d);
  if (!(values[s] & b)) return values; // already gone
  values[s] &= ~b;

  const cnt = popcount(values[s]);
  if (cnt === 0) return null; // contradiction

  // Strategy 1: a cell with one value eliminates it from peers
  if (cnt === 1) {
    const d2 = digitsOf(values[s])[0];
    for (const u of UNITS_OF[s])
      for (const peer of u)
        if (peer !== s && !eliminate(values, peer, d2)) return null;
  }

  // Strategy 2: a unit with one place for d gets d assigned there
  for (const u of UNITS_OF[s]) {
    const places = u.filter((c) => values[c] & b);
    if (places.length === 0) return null;
    if (places.length === 1) if (!assign(values, places[0], d)) return null;
  }
  return values;
}

export function parseGrid(grid: Grid): Mask[] | null {
  const values: Mask[] = new Array(81).fill(ALL_DIGITS);
  for (let s = 0; s < 81; s++) {
    const d = grid[s];
    if (d !== 0 && !assign(values, s, d)) return null;
  }
  return values;
}
