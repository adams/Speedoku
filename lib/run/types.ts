import type { Grid, Rng } from "@/lib/engine";
import type { BankFile } from "@/lib/engine/banks";

export type Mode = "hints-on" | "hints-off";
export type RunStatus = "tutorial" | "playing" | "runOver";
export type Traversal = "empty" | "valid";

export interface RunConfig {
  seed: number;
  mode: Mode;
  // curve
  tutorialRating: number;
  floorRating: number; // depth-2 target
  slope: number;
  curvature: number;
  topRating: number; // bank ceiling; curve clamps here
  // scorer
  base: number;
  floorRatio: number;
  cap: number;
  weightSlope: number;
  parFastSec: number; // par at floorRating
  parSlowSec: number; // par at topRating
}

export interface RunState {
  status: RunStatus;
  mode: Mode;
  seed: number;
  depth: number; // 1 = tutorial, 2+ = scored
  grid: Grid;
  rating: number; // target rating of the current puzzle
  activeDigit: number | null;
  activeCell: number | null;
  puzzleStartMs: number | null;
  score: number;
  fastestSolveMs: number | null;
  totalMs: number;
}

// Run-stable deps + the per-dispatch clock. Create `rng` ONCE per run and
// reuse the same instance across dispatches (advances consume it).
export interface Ctx {
  nowMs: number;
  bank: BankFile;
  rng: Rng;
  config: RunConfig;
}

export type Intent =
  | { type: "selectNumber"; digit: number }
  | { type: "skipToNextCell"; traversal: Traversal }
  | { type: "selectCell"; cell: number }
  | { type: "placeNumber"; cell: number };

export interface RunSummary {
  depth: number;
  score: number;
  fastestSolveMs: number | null;
  totalMs: number;
  mode: Mode;
  seed: number;
}
