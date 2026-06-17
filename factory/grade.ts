import { analyze } from "sudoku-core";
import type { Grid } from "@/lib/engine/types";
import { dependencyEase } from "./dependency";

/**
 * gradeDifficulty — continuous numeric difficulty rating for a puzzle.
 *
 * Uses sudoku-core's `analyze()` which runs a technique solver and sums
 * per-strategy scores (each strategy has an internal weight; the library
 * multiplies weight × application frequency to produce a cumulative score).
 * Harder puzzles require costlier elimination strategies and score higher.
 *
 * Returns a finite number ≥ 0. Higher = harder. This is build-time only;
 * the runtime never calls this function.
 */
export function gradeDifficulty(puzzle: Grid): number {
  // sudoku-core Board = (number | null)[] where null means empty
  const board = puzzle.map((d) => (d === 0 ? null : d));
  const result = analyze(board);
  return result.score ?? 0;
}

function normalize(xs: number[]): number[] {
  const lo = Math.min(...xs);
  const hi = Math.max(...xs);
  const span = hi - lo;
  if (span === 0) return xs.map(() => 0);
  return xs.map((x) => (x - lo) / span);
}

export function combinedRatings(puzzles: Grid[], blendWeight = 0.25): number[] {
  const scores = normalize(puzzles.map((p) => gradeDifficulty(p)));
  const eases = normalize(puzzles.map((p) => dependencyEase(p)));
  return puzzles.map(
    (_, i) =>
      1000 * ((1 - blendWeight) * scores[i] + blendWeight * (1 - eases[i])),
  );
}
