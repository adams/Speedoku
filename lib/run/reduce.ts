import type { Grid, Rng } from "@/lib/engine";
import { cellsForDigit, isSafe, isSolvable } from "@/lib/engine";
import type { BankFile } from "@/lib/engine/banks";
import { pickPuzzle } from "@/lib/engine/banks";
import { targetRating } from "./curve";
import { cellPoints } from "./scorer";
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
  let { fastestSolveMs, totalMs } = state;

  // Points were already banked per placement; advance only rolls puzzle timing.
  if (state.status === "playing" && state.puzzleStartMs != null) {
    const solveMs = ctx.nowMs - state.puzzleStartMs;
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
    lastPlaceMs: ctx.nowMs,
    fastestSolveMs,
    totalMs,
    emptyAtStart: emptyCells(grid).length,
  };
}

// The run's first puzzle is a real bank puzzle, timed and scored exactly like
// every later depth — there is no special untimed tutorial in the core loop.
// The clock is left unstarted (`puzzleStartMs: null`) until `startRun` stamps it
// when the board actually appears; later puzzles are stamped by `advance`.
export function initRun(config: RunConfig, bank: BankFile, rng: Rng): RunState {
  const depth = 1;
  const rating = targetRating(depth, config);
  const grid = pickPuzzle(bank, rating, rng);
  return {
    status: "playing",
    mode: config.mode,
    seed: config.seed,
    depth,
    grid,
    rating,
    ...lowestSelection(grid),
    puzzleStartMs: null,
    lastPlaceMs: null,
    score: 0,
    fastestSolveMs: null,
    totalMs: 0,
    emptyAtStart: emptyCells(grid).length,
  };
}

export function reduce(state: RunState, intent: Intent, ctx: Ctx): RunState {
  if (state.status === "runOver") return state;

  switch (intent.type) {
    case "startRun": {
      // Idempotent: start depth 1's clock the moment play begins, once.
      if (state.puzzleStartMs != null) return state;
      return { ...state, puzzleStartMs: ctx.nowMs, lastPlaceMs: ctx.nowMs };
    }
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

      // Bank points for this placement immediately, scaled by how fast it came.
      // The score only ever goes up; speed shows up as bigger per-cell awards.
      let score = state.score;
      let lastPlaceMs = state.lastPlaceMs;
      if (state.status === "playing" && state.puzzleStartMs != null) {
        const from = state.lastPlaceMs ?? state.puzzleStartMs;
        score += cellPoints(
          state.rating,
          ctx.nowMs - from,
          state.emptyAtStart,
          ctx.config,
        );
        lastPlaceMs = ctx.nowMs;
      }

      if (state.status === "playing" && !isSolvable(grid)) {
        const solveMs =
          state.puzzleStartMs == null ? 0 : ctx.nowMs - state.puzzleStartMs;
        return {
          ...state,
          grid,
          status: "runOver",
          score,
          lastPlaceMs,
          totalMs: state.totalMs + solveMs,
        };
      }
      if (isComplete(grid)) {
        return advance({ ...state, score, lastPlaceMs }, ctx);
      }

      const stillValid = nextValidCellForDigit(grid, d, intent.cell);
      if (stillValid != null) {
        return { ...state, grid, score, lastPlaceMs, activeCell: stillValid };
      }
      const nd = nextIncompleteDigit(grid, d);
      if (nd == null) {
        return {
          ...state,
          grid,
          score,
          lastPlaceMs,
          activeDigit: null,
          activeCell: null,
        };
      }
      const ncells = cellsForDigit(grid, nd);
      return {
        ...state,
        grid,
        score,
        lastPlaceMs,
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
