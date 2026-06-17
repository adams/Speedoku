import type { Grid } from "@/lib/engine";
import { isSafe, mulberry32, solve } from "@/lib/engine";
import type { BankFile } from "@/lib/engine/banks";
import { makeDefaultConfig } from "./config";
import { initRun, reduce, summarize } from "./reduce";
import type { Ctx, RunState, RunSummary } from "./types";

function firstEmpty(grid: Grid): number {
  return grid.indexOf(0);
}

function wrongLegalMove(
  grid: Grid,
  solution: Grid,
): { cell: number; digit: number } | null {
  for (let cell = 0; cell < 81; cell++) {
    if (grid[cell] !== 0) continue;
    for (let d = 1; d <= 9; d++) {
      if (d !== solution[cell] && isSafe(grid, cell, d))
        return { cell, digit: d };
    }
  }
  return null;
}

export function runAuto(
  bank: BankFile,
  opts: {
    seed: number;
    maxDepth?: number;
    mistakeRate?: number;
    moveMs?: number;
  },
): RunSummary {
  const maxDepth = opts.maxDepth ?? 50;
  const mistakeRate = opts.mistakeRate ?? 0;
  const moveMs = opts.moveMs ?? 1000;

  const config = makeDefaultConfig(bank, { seed: opts.seed, mode: "hints-on" });
  const rng = mulberry32(opts.seed);
  const mistakeRng = mulberry32(opts.seed ^ 0x9e3779b9);

  let now = 0;
  let state: RunState = initRun(config, bank, rng);
  // Start depth 1's clock, exactly as real play does when the board appears.
  state = reduce(
    state,
    { type: "startRun" },
    { nowMs: now, bank, rng, config },
  );
  let solution = solve(state.grid);

  // Safety bound on total moves (maxDepth puzzles × ≤81 cells).
  const moveBudget = (maxDepth + 2) * 81 + 10;
  for (let i = 0; i < moveBudget; i++) {
    if (state.status === "runOver") break;
    if (state.depth > maxDepth) break;
    if (!solution) break;

    now += moveMs;
    const ctx: Ctx = { nowMs: now, bank, rng, config };

    let cell = firstEmpty(state.grid);
    let digit = solution[cell];

    if (
      state.status === "playing" &&
      mistakeRate > 0 &&
      mistakeRng() < mistakeRate
    ) {
      const wrong = wrongLegalMove(state.grid, solution);
      if (wrong) {
        cell = wrong.cell;
        digit = wrong.digit;
      }
    }

    const beforeDepth = state.depth;
    state = reduce(state, { type: "selectNumber", digit }, ctx);
    state = reduce(state, { type: "placeNumber", cell }, ctx);

    // Re-solve whenever the puzzle changed (advance or transition).
    if (state.depth !== beforeDepth || state.status === "runOver") {
      solution = solve(state.grid);
    }
  }

  return summarize(state);
}
