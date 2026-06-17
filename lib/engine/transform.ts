import { type Rng, shuffle } from "./rng";
import type { Grid } from "./types";

const at = (g: Grid, r: number, c: number) => g[r * 9 + c];

export function relabel(g: Grid, perm: number[]): Grid {
  return g.map((d) => (d === 0 ? 0 : perm[d - 1]));
}

export function transpose(g: Grid): Grid {
  const out = new Array(81).fill(0);
  for (let r = 0; r < 9; r++)
    for (let c = 0; c < 9; c++) out[c * 9 + r] = at(g, r, c);
  return out;
}

function remapRows(g: Grid, rowMap: number[]): Grid {
  const out = new Array(81).fill(0);
  for (let r = 0; r < 9; r++)
    for (let c = 0; c < 9; c++) out[r * 9 + c] = at(g, rowMap[r], c);
  return out;
}

export function permuteBands(g: Grid, bandOrder: number[]): Grid {
  const rowMap: number[] = [];
  for (const b of bandOrder) for (let i = 0; i < 3; i++) rowMap.push(b * 3 + i);
  return remapRows(g, rowMap);
}

export function permuteRowsInBands(g: Grid, perms: number[][]): Grid {
  const rowMap: number[] = [];
  for (let b = 0; b < 3; b++) for (const i of perms[b]) rowMap.push(b * 3 + i);
  return remapRows(g, rowMap);
}

export function permuteStacks(g: Grid, stackOrder: number[]): Grid {
  return transpose(permuteBands(transpose(g), stackOrder));
}

export function permuteColsInStacks(g: Grid, perms: number[][]): Grid {
  return transpose(permuteRowsInBands(transpose(g), perms));
}

const perm3 = (rng: Rng) => shuffle([0, 1, 2], rng);

export function randomTransform(g: Grid, rng: Rng): Grid {
  let out = g;
  out = relabel(out, shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9], rng));
  out = permuteBands(out, perm3(rng));
  out = permuteStacks(out, perm3(rng));
  out = permuteRowsInBands(out, [perm3(rng), perm3(rng), perm3(rng)]);
  out = permuteColsInStacks(out, [perm3(rng), perm3(rng), perm3(rng)]);
  if (rng() < 0.5) out = transpose(out);
  return out;
}
