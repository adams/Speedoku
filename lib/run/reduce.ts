import type { Grid } from "@/lib/engine";
import { cellsForDigit, isSafe, isSolvable } from "@/lib/engine";
import { pickPuzzle } from "@/lib/engine/banks";
import { targetRating } from "./curve";
import { puzzleScore } from "./scorer";
import { TUTORIAL_GRID } from "./tutorial";
import type {
  Axis,
  Ctx,
  Dir,
  Intent,
  RunConfig,
  RunState,
  RunSummary,
} from "./types";

function place(grid: Grid, cell: number, d: number): Grid {
  const g = grid.slice();
  g[cell] = d;
  return g;
}

function isComplete(grid: Grid): boolean {
  return grid.every((d) => d !== 0);
}

function emptyCells(grid: Grid): number[] {
  const out: number[] = [];
  for (let i = 0; i < 81; i++) if (grid[i] === 0) out.push(i);
  return out;
}

// Order a cell set for cursor traversal: `row` = reading order (left→right,
// top→bottom); `col` = column-major (top→bottom, then next column).
function orderCells(cells: number[], axis: Axis): number[] {
  if (axis === "col") {
    return [...cells].sort((a, b) => (a % 9) - (b % 9) || a - b);
  }
  return [...cells].sort((a, b) => a - b);
}

// Step to the prev/next member of an ordered set, wrapping at the ends.
// If `current` isn't in the set, land on the first (dir 1) or last (dir -1).
function stepInSet(
  ordered: number[],
  current: number,
  dir: Dir,
): number | null {
  if (ordered.length === 0) return null;
  const idx = ordered.indexOf(current);
  if (idx === -1) return dir === 1 ? ordered[0] : ordered[ordered.length - 1];
  const n = ordered.length;
  return ordered[(((idx + dir) % n) + n) % n];
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

// A puzzle should never open with a blank selector: aim at the lowest
// non-solved digit and its first legal cell. Used on run start and on every
// depth advance.
function lowestSelection(grid: Grid): {
  activeDigit: number | null;
  activeCell: number | null;
} {
  const d = nextIncompleteDigit(grid, 0);
  if (d == null) return { activeDigit: null, activeCell: null };
  const cells = cellsForDigit(grid, d);
  return { activeDigit: d, activeCell: cells.length ? cells[0] : null };
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
    ...lowestSelection(grid),
    puzzleStartMs: ctx.nowMs,
    score,
    fastestSolveMs,
    totalMs,
    emptyAtStart: emptyCells(grid).length,
  };
}

export function initRun(config: RunConfig): RunState {
  const grid = TUTORIAL_GRID.slice();
  return {
    status: "tutorial",
    mode: config.mode,
    seed: config.seed,
    depth: 1,
    grid,
    rating: config.tutorialRating,
    ...lowestSelection(grid),
    puzzleStartMs: null,
    score: 0,
    fastestSolveMs: null,
    totalMs: 0,
    emptyAtStart: emptyCells(grid).length,
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
      const dir: Dir = intent.dir ?? 1;
      // Tab/Shift+Tab walk every empty cell in reading order; arrows walk only
      // the valid cells for the active digit, directionally (row vs column).
      let pool: number[];
      let axis: Axis;
      if (intent.traversal === "empty") {
        pool = emptyCells(state.grid);
        axis = "row";
      } else {
        if (state.activeDigit == null) return state;
        pool = cellsForDigit(state.grid, state.activeDigit);
        axis = intent.axis ?? "row";
      }
      const from = state.activeCell ?? -1;
      const next = stepInSet(orderCells(pool, axis), from, dir);
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
        const solveMs =
          state.puzzleStartMs == null ? 0 : ctx.nowMs - state.puzzleStartMs;
        const emptyNow = emptyCells(grid).length;
        const progress =
          state.emptyAtStart > 0
            ? (state.emptyAtStart - emptyNow) / state.emptyAtStart
            : 0;
        const credit = Math.round(
          puzzleScore(state.rating, solveMs, ctx.config) * progress,
        );
        return {
          ...state,
          grid,
          status: "runOver",
          score: state.score + credit,
        };
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
