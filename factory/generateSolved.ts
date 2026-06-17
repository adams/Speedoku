import { digitsOf, popcount } from "@/lib/engine/bits";
import { assign, parseGrid } from "@/lib/engine/propagate";
import { type Rng, shuffle } from "@/lib/engine/rng";
import { valuesToGrid } from "@/lib/engine/solve";
import type { Grid, Mask } from "@/lib/engine/types";

function randomizedSearch(values: Mask[] | null, rng: Rng): Mask[] | null {
  if (values === null) return null;
  let minLen = 10,
    minS = -1;
  for (let s = 0; s < 81; s++) {
    const c = popcount(values[s]);
    if (c > 1 && c < minLen) {
      minLen = c;
      minS = s;
    }
  }
  if (minS === -1) return values;
  for (const d of shuffle(digitsOf(values[minS]), rng)) {
    const res = randomizedSearch(assign(values.slice(), minS, d), rng);
    if (res) return res;
  }
  return null;
}

export function generateSolved(rng: Rng): Grid {
  const empty: Grid = new Array(81).fill(0);
  const solved = randomizedSearch(parseGrid(empty), rng);
  if (!solved)
    throw new Error("generateSolved: search failed (should be impossible)");
  return valuesToGrid(solved);
}
