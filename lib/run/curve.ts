import type { PickTarget } from "@/lib/engine/banks";
import type { RunConfig } from "./types";

// Empties saturate (reach minimal) faster than technique, so you get off the
// near-solved level quickly while technique keeps climbing afterward. Tuning knob.
const EMPTIES_REACH = 7; // saturates by ~depth 7
const DEFAULT_FLOOR_EMPTIES = 8;
const DEFAULT_TOP_EMPTIES = 54;

// Technique target. Depth 1 = floor (the removed tutorial used to special-case
// depth <= 1); the ramp now starts at depth 1 (x = depth - 1) and climbs smoothly.
export function targetRating(depth: number, config: RunConfig): number {
  const x = Math.max(0, depth - 1);
  const raw = config.floorRating + config.slope * x + config.curvature * x * x;
  return Math.min(config.topRating, raw);
}

// Clue-count target. Ramps floor → top empties over EMPTIES_REACH depths.
export function targetEmpties(depth: number, config: RunConfig): number {
  const fe = config.floorEmpties ?? DEFAULT_FLOOR_EMPTIES;
  const te = config.topEmpties ?? DEFAULT_TOP_EMPTIES;
  const t = Math.min(1, Math.max(0, (depth - 1) / (EMPTIES_REACH - 1)));
  return Math.round(fe + t * (te - fe));
}

export function curveTarget(depth: number, config: RunConfig): PickTarget {
  return {
    rating: targetRating(depth, config),
    empties: targetEmpties(depth, config),
  };
}
