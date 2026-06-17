import type { Rng } from "./rng";
import { randomTransform } from "./transform";
import type { Grid } from "./types";

export interface PickTarget {
  rating: number;
  empties: number;
}

export interface SeedPick {
  seed: number[];
  rating: number;
}

export interface Band {
  lo: number;
  hi: number;
  seeds: number[][];
  ratings: number[]; // technique rating of each seed; parallel to seeds[]; lo <= ratings[i] < hi
}
export interface BankFile {
  bands: Band[];
}

export function loadBanks(file: BankFile): BankFile {
  return file;
}

// How many of the nearest seeds (on the combined 2-axis distance) to choose
// among — rating variety / anti-memorization without straying off the curve.
const NEIGHBORHOOD = 6;

function seedEmpties(seed: number[]): number {
  let n = 0;
  for (const d of seed) if (d === 0) n++;
  return n;
}

export function pickSeed(
  file: BankFile,
  target: PickTarget,
  rng: Rng,
): SeedPick {
  const pool: { seed: number[]; rating: number; empties: number }[] = [];
  for (const band of file.bands) {
    for (let i = 0; i < band.seeds.length; i++) {
      pool.push({
        seed: band.seeds[i],
        rating: band.ratings[i],
        empties: seedEmpties(band.seeds[i]),
      });
    }
  }
  if (pool.length === 0) throw new Error("pickSeed: bank file has no seeds");
  // Normalize each axis by its spread so rating (0..1000) and empties (~6..60)
  // weigh comparably; distance = normalized rating gap + normalized empties gap.
  const ratings = pool.map((p) => p.rating);
  const emps = pool.map((p) => p.empties);
  const rSpan = Math.max(...ratings) - Math.min(...ratings) || 1;
  const eSpan = Math.max(...emps) - Math.min(...emps) || 1;
  const dist = (p: { rating: number; empties: number }) =>
    Math.abs(p.rating - target.rating) / rSpan +
    Math.abs(p.empties - target.empties) / eSpan;
  pool.sort((a, b) => dist(a) - dist(b));
  const k = Math.min(NEIGHBORHOOD, pool.length);
  const chosen = pool[Math.floor(rng() * k)];
  return { seed: chosen.seed, rating: chosen.rating };
}

export function pickPuzzle(file: BankFile, target: PickTarget, rng: Rng): Grid {
  return randomTransform(pickSeed(file, target, rng).seed, rng);
}
