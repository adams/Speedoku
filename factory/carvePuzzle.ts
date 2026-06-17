import { countSolutions } from "@/lib/engine/count";
import { type Rng, shuffle } from "@/lib/engine/rng";
import type { Grid } from "@/lib/engine/types";
import { generateSolved } from "./generateSolved";

export interface Puzzle {
  puzzle: Grid;
  solution: Grid;
  clues: number;
}

export function carvePuzzle(rng: Rng): Puzzle {
  const solution = generateSolved(rng);
  const puzzle = solution.slice();
  const order = shuffle(
    Array.from({ length: 81 }, (_, i) => i),
    rng,
  );
  for (const cell of order) {
    const backup = puzzle[cell];
    if (backup === 0) continue;
    puzzle[cell] = 0;
    if (countSolutions(puzzle, 2) !== 1) puzzle[cell] = backup; // revert if not unique
  }
  return { puzzle, solution, clues: puzzle.filter((x) => x !== 0).length };
}
