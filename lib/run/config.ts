import type { BankFile } from "@/lib/engine/banks";
import type { Mode, RunConfig } from "./types";

const REACH_DEPTH = 14; // depths for technique rating to climb floor → top
const FLOOR_PCT = 0.05; // rating floor at the easy end (depth 1 is meant to be easy)
const TOP_PCT = 0.9; // rating ceiling — hard but reachable, not the worst outlier
const EMPTIES_FLOOR_PCT = 0.0; // near-solved floor — depth 1 targets the actual minimum empties
const EMPTIES_TOP_PCT = 0.9; // ~minimal top

function percentile(sortedAsc: number[], p: number): number {
  if (sortedAsc.length === 0) return 0;
  const idx = Math.min(
    sortedAsc.length - 1,
    Math.max(0, Math.round(p * (sortedAsc.length - 1))),
  );
  return sortedAsc[idx];
}

export function makeDefaultConfig(
  bank: BankFile,
  opts: { seed: number; mode: Mode },
): RunConfig {
  const ratings = bank.bands.flatMap((b) => b.ratings).sort((a, b) => a - b);
  const empties = bank.bands
    .flatMap((b) => b.seeds.map((s) => s.filter((d) => d === 0).length))
    .sort((a, b) => a - b);
  const floorRating = percentile(ratings, FLOOR_PCT);
  const topRating = percentile(ratings, TOP_PCT);
  return {
    seed: opts.seed,
    mode: opts.mode,
    tutorialRating: floorRating, // legacy: depth-1 rating == floor (no tutorial)
    floorRating,
    topRating,
    floorEmpties: percentile(empties, EMPTIES_FLOOR_PCT),
    topEmpties: percentile(empties, EMPTIES_TOP_PCT),
    slope: (topRating - floorRating) / REACH_DEPTH,
    curvature: 0,
    base: 1000,
    floorRatio: 0.25,
    cap: 4,
    weightSlope: 2,
    parFastSec: 25,
    parSlowSec: 90,
  };
}
