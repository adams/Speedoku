import type { Grid } from "@/lib/engine";
import { legalCandidates, solve } from "@/lib/engine";
import { onlyDigit, popcount } from "@/lib/engine/bits";

export function dependencyEase(puzzle: Grid, k = 25): number {
  const solution = solve(puzzle);
  const work = puzzle.slice();
  const counts: number[] = [];

  for (let step = 0; step < k; step++) {
    if (work.every((d) => d !== 0)) break;
    const cand = legalCandidates(work);
    const nakedSingles: number[] = [];
    for (let s = 0; s < 81; s++) {
      if (work[s] === 0 && popcount(cand[s]) === 1) nakedSingles.push(s);
    }
    counts.push(nakedSingles.length);
    if (nakedSingles.length > 0) {
      const s = nakedSingles[0];
      work[s] = onlyDigit(cand[s]);
    } else {
      // No simple placement: advance using the known solution so the walk
      // continues. Records 0 for this step (a "hard" step).
      const s = work.indexOf(0);
      work[s] = solution ? solution[s] : 0;
      if (!solution) break;
    }
  }

  if (counts.length === 0) return 0;
  return counts.reduce((a, b) => a + b, 0) / counts.length;
}
