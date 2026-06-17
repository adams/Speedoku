import type { RunConfig } from "./types";

function norm(rating: number, config: RunConfig): number {
  const span = config.topRating - config.floorRating;
  if (span <= 0) return 0;
  const t = (rating - config.floorRating) / span;
  return Math.max(0, Math.min(1, t));
}

export function par(rating: number, config: RunConfig): number {
  const t = norm(rating, config);
  return config.parFastSec + t * (config.parSlowSec - config.parFastSec);
}

export function difficultyWeight(rating: number, config: RunConfig): number {
  return 1 + config.weightSlope * norm(rating, config);
}

// Meter endpoints (live-scoring): the full and minimum bankable value for a
// puzzle at this rating. The live meter (puzzleScore at the current elapsed)
// rides between these — flat at max within the "perfect zone" (elapsed < par/cap),
// draining toward floor thereafter.
export function puzzleMax(rating: number, config: RunConfig): number {
  return config.base * difficultyWeight(rating, config) * config.cap;
}

export function puzzleFloor(rating: number, config: RunConfig): number {
  return config.base * difficultyWeight(rating, config) * config.floorRatio;
}

export function puzzleScore(
  rating: number,
  solveMs: number,
  config: RunConfig,
): number {
  const solveSec = Math.max(solveMs / 1000, 0.001);
  const ratio = par(rating, config) / solveSec;
  const speedFactor = Math.max(config.floorRatio, Math.min(config.cap, ratio));
  return Math.round(
    config.base * difficultyWeight(rating, config) * speedFactor,
  );
}

// Points for placing a single cell, banked immediately and never taken back.
// It's the puzzle's per-cell share (base / emptyAtStart, difficulty-weighted)
// scaled by how fast THIS placement landed — fast cells pay more, slow cells
// floor out, but every placement adds something. Summed over a full puzzle at
// par pace this ≈ the old per-puzzle award, so totals stay on the same scale.
export function cellPoints(
  rating: number,
  dtMs: number,
  emptyAtStart: number,
  config: RunConfig,
): number {
  if (emptyAtStart <= 0) return 0;
  const parCellSec = par(rating, config) / emptyAtStart;
  const dtSec = Math.max(dtMs / 1000, 0.001);
  const speed = Math.max(
    config.floorRatio,
    Math.min(config.cap, parCellSec / dtSec),
  );
  return Math.round(
    (config.base / emptyAtStart) * difficultyWeight(rating, config) * speed,
  );
}

// Points the *current* puzzle would bank if the run ended right now: the full
// puzzle value scaled by how much of it you've filled. This is the value death
// credits and that a completed puzzle banks (progress = 1).
export function puzzleCredit(
  rating: number,
  solveMs: number,
  progress: number,
  config: RunConfig,
): number {
  return Math.round(puzzleScore(rating, solveMs, config) * progress);
}
