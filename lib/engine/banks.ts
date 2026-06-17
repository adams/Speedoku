import { randomTransform } from "@/factory/transform";
import type { Rng } from "./rng";
import type { Grid } from "./types";

export interface Band {
  lo: number;
  hi: number;
  seeds: number[][];
}
export interface BankFile {
  bands: Band[];
}

export function loadBanks(file: BankFile): BankFile {
  return file;
}

export function pickPuzzle(file: BankFile, target: number, rng: Rng): Grid {
  let band = file.bands.find((b) => target >= b.lo && target < b.hi);
  if (!band) {
    band = file.bands.reduce((best, b) => {
      const d = Math.min(Math.abs(target - b.lo), Math.abs(target - b.hi));
      const bd = Math.min(
        Math.abs(target - best.lo),
        Math.abs(target - best.hi),
      );
      return d < bd ? b : best;
    });
  }
  const seed = band.seeds[Math.floor(rng() * band.seeds.length)];
  return randomTransform(seed, rng);
}
