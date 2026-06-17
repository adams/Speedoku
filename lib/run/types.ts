import type { Grid, Rng } from "@/lib/engine";
import type { BankFile } from "@/lib/engine/banks";

export type Mode = "hints-on" | "hints-off";
export type RunStatus = "playing" | "runOver";
export type Traversal = "empty" | "valid";
// Cursor-movement axis + direction. `row` walks reading order (left/right),
// `col` walks column-major (up/down); `dir` is +1 forward / -1 backward.
export type Axis = "row" | "col";
export type Dir = 1 | -1;

export interface RunConfig {
  seed: number;
  mode: Mode;
  // curve
  tutorialRating: number;
  floorRating: number; // depth-2 target
  slope: number;
  curvature: number;
  topRating: number; // bank ceiling; curve clamps here
  // clue-count (empties) axis — optional; makeDefaultConfig derives them from the bank
  floorEmpties?: number; // depth-1 empties (near-solved)
  topEmpties?: number; // deep empties (~minimal)
  // scorer
  base: number;
  floorRatio: number;
  cap: number;
  weightSlope: number;
  parFastSec: number; // par at floorRating
  parSlowSec: number; // par at topRating
}

// Per-depth breakdown: depth share (par-pace value) + speed share (bonus/penalty).
// Summed over all levels, depthPts + speedPts === run score.
export interface LevelLine {
  depth: number;
  depthPts: number;
  speedPts: number;
}

export interface RunState {
  status: RunStatus;
  mode: Mode;
  seed: number;
  depth: number; // 1 = first puzzle; every depth is timed + scored
  grid: Grid;
  rating: number; // target rating of the current puzzle
  activeDigit: number | null;
  activeCell: number | null;
  puzzleStartMs: number | null;
  lastPlaceMs: number | null; // when the last cell was placed (per-cell speed)
  score: number;
  fastestSolveMs: number | null;
  totalMs: number;
  emptyAtStart: number; // empties when the current puzzle began
  levels: LevelLine[]; // per-depth score breakdown; always length >= 1 while playing
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
  | {
      type: "skipToNextCell";
      traversal: Traversal;
      axis?: Axis;
      dir?: Dir;
    }
  | { type: "selectCell"; cell: number }
  | { type: "placeNumber"; cell: number }
  // Stamps the clock for depth 1 at the moment the run actually begins
  // (board shown). Every later puzzle is stamped by `advance` on entry.
  | { type: "startRun" };

export interface RunSummary {
  depth: number;
  score: number;
  fastestSolveMs: number | null;
  totalMs: number;
  mode: Mode;
  seed: number;
  levels?: LevelLine[]; // optional so existing RunSummary literals in tests compile unchanged
}
