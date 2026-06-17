import { countSolutions } from "@/lib/engine/count";
import { type Rng, shuffle } from "@/lib/engine/rng";
import type { Grid } from "@/lib/engine/types";
import { generateSolved } from "./generateSolved";

export interface Puzzle {
  puzzle: Grid;
  solution: Grid;
  clues: number;
}

export function carvePuzzle(
  rng: Rng,
  opts?: { targetEmpties?: number },
): Puzzle {
  const targetEmpties = opts?.targetEmpties ?? 81; // default: carve to minimal
  const solution = generateSolved(rng);
  const puzzle = solution.slice();
  let empties = 0;
  const order = shuffle(
    Array.from({ length: 81 }, (_, i) => i),
    rng,
  );
  for (const cell of order) {
    if (empties >= targetEmpties) break;
    const backup = puzzle[cell];
    if (backup === 0) continue;
    puzzle[cell] = 0;
    if (countSolutions(puzzle, 2) !== 1) {
      puzzle[cell] = backup; // revert if not unique
    } else {
      empties++;
    }
  }
  return { puzzle, solution, clues: puzzle.filter((x) => x !== 0).length };
}
