import type { Grid } from "@/lib/engine";
import { cellsForDigit, isSafe, isSolvable } from "@/lib/engine";
import { pickPuzzle } from "@/lib/engine/banks";
import { targetRating } from "./curve";
import { puzzleScore } from "./scorer";
import { TUTORIAL_GRID } from "./tutorial";
import type { Ctx, Intent, RunConfig, RunState, RunSummary } from "./types";

function place(grid: Grid, cell: number, d: number): Grid {
  const g = grid.slice();
  g[cell] = d;
  return g;
}

function isComplete(grid: Grid): boolean {
  return grid.every((d) => d !== 0);
}

function nextEmptyCell(grid: Grid, from: number): number | null {
  for (let i = 1; i <= 81; i++) {
    const idx = (from + i) % 81;
    if (grid[idx] === 0) return idx;
  }
  return null;
}

function nextValidCellForDigit(
  grid: Grid,
  digit: number,
  from: number,
): number | null {
  for (let i = 1; i <= 81; i++) {
    const idx = (from + i) % 81;
    if (grid[idx] === 0 && isSafe(grid, idx, digit)) return idx;
  }
  return null;
}

function digitCount(grid: Grid, d: number): number {
  let n = 0;
  for (const x of grid) if (x === d) n++;
  return n;
}

function nextIncompleteDigit(grid: Grid, from: number): number | null {
  for (let i = 1; i <= 9; i++) {
    const d = ((from - 1 + i) % 9) + 1;
    if (digitCount(grid, d) < 9 && cellsForDigit(grid, d).length > 0) return d;
  }
  return null;
}

function advance(state: RunState, ctx: Ctx): RunState {
  const config: RunConfig = ctx.config;
  let { score, fastestSolveMs, totalMs } = state;

  if (state.status === "playing" && state.puzzleStartMs != null) {
    const solveMs = ctx.nowMs - state.puzzleStartMs;
    score += puzzleScore(state.rating, solveMs, config);
    fastestSolveMs =
      fastestSolveMs == null ? solveMs : Math.min(fastestSolveMs, solveMs);
    totalMs += solveMs;
  }

  const depth = state.depth + 1;
  const rating = targetRating(depth, config);
  const grid = pickPuzzle(ctx.bank, rating, ctx.rng);
  return {
    ...state,
    status: "playing",
    depth,
    grid,
    rating,
    activeDigit: null,
    activeCell: null,
    puzzleStartMs: ctx.nowMs,
    score,
    fastestSolveMs,
    totalMs,
  };
}

export function initRun(config: RunConfig): RunState {
  return {
    status: "tutorial",
    mode: config.mode,
    seed: config.seed,
    depth: 1,
    grid: TUTORIAL_GRID.slice(),
    rating: config.tutorialRating,
    activeDigit: null,
    activeCell: null,
    puzzleStartMs: null,
    score: 0,
    fastestSolveMs: null,
    totalMs: 0,
  };
}

export function reduce(state: RunState, intent: Intent, ctx: Ctx): RunState {
  if (state.status === "runOver") return state;

  switch (intent.type) {
    case "selectNumber": {
      const cells = cellsForDigit(state.grid, intent.digit);
      return {
        ...state,
        activeDigit: intent.digit,
        activeCell: cells.length ? cells[0] : null,
      };
    }
    case "skipToNextCell": {
      const from = state.activeCell ?? -1;
      const next =
        intent.traversal === "empty"
          ? nextEmptyCell(state.grid, from)
          : state.activeDigit == null
            ? null
            : nextValidCellForDigit(state.grid, state.activeDigit, from);
      return { ...state, activeCell: next };
    }
    case "selectCell": {
      const d = state.activeDigit;
      if (d == null) return state;
      if (state.grid[intent.cell] !== 0) return state;
      if (!isSafe(state.grid, intent.cell, d)) return state;
      return { ...state, activeCell: intent.cell };
    }
    case "placeNumber": {
      const d = state.activeDigit;
      if (d == null) return state;
      if (!isSafe(state.grid, intent.cell, d)) return state;

      const grid = place(state.grid, intent.cell, d);

      if (state.status === "playing" && !isSolvable(grid)) {
        return { ...state, grid, status: "runOver" };
      }
      if (isComplete(grid)) {
        return advance(state, ctx);
      }

      const stillValid = nextValidCellForDigit(grid, d, intent.cell);
      if (stillValid != null) {
        return { ...state, grid, activeCell: stillValid };
      }
      const nd = nextIncompleteDigit(grid, d);
      if (nd == null) {
        return { ...state, grid, activeDigit: null, activeCell: null };
      }
      const ncells = cellsForDigit(grid, nd);
      return {
        ...state,
        grid,
        activeDigit: nd,
        activeCell: ncells.length ? ncells[0] : null,
      };
    }
  }
}

export function summarize(state: RunState): RunSummary {
  return {
    depth: state.depth,
    score: state.score,
    fastestSolveMs: state.fastestSolveMs,
    totalMs: state.totalMs,
    mode: state.mode,
    seed: state.seed,
  };
}
