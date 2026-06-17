import type { BankFile } from "@/lib/engine/banks";
import type { Mode, RunConfig } from "./types";

export function makeDefaultConfig(
  bank: BankFile,
  opts: { seed: number; mode: Mode },
): RunConfig {
  const lo = bank.bands[0].lo;
  const hi = bank.bands[bank.bands.length - 1].hi;
  return {
    seed: opts.seed,
    mode: opts.mode,
    tutorialRating: lo,
    floorRating: lo,
    topRating: hi,
    slope: (hi - lo) / 24, // ~reach top band by depth ~26
    curvature: 0,
    base: 1000,
    floorRatio: 0.25,
    cap: 4,
    weightSlope: 2,
    parFastSec: 25,
    parSlowSec: 90,
  };
}
