import { analyze } from "sudoku-core";
import type { Grid } from "@/lib/engine/types";

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
