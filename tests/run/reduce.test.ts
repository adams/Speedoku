import { describe, expect, it } from "vitest";
import type { Grid } from "@/lib/engine";
import {
  cellsForDigit,
  isSafe,
  isSolvable,
  mulberry32,
  solve,
} from "@/lib/engine";
import type { BankFile } from "@/lib/engine/banks";
import fixture from "@/lib/engine/banks/banks.fixture.json";
import { makeDefaultConfig } from "@/lib/run/config";
import { initRun, reduce, summarize } from "@/lib/run/reduce";
import { cellPoints } from "@/lib/run/scorer";
import type { Ctx, RunConfig, RunState } from "@/lib/run/types";

const bank = fixture as BankFile;
const config: RunConfig = makeDefaultConfig(bank, {
  seed: 7,
  mode: "hints-on",
});
const mkCtx = (nowMs: number): Ctx => ({
  nowMs,
  bank,
  rng: mulberry32(config.seed),
  config,
});

// A near-complete grid (one empty at index 80, forced to 9).
const ONE_EMPTY: Grid = [
  5, 3, 4, 6, 7, 8, 9, 1, 2, 6, 7, 2, 1, 9, 5, 3, 4, 8, 1, 9, 8, 3, 4, 2, 5, 6,
  7, 8, 5, 9, 7, 6, 1, 4, 2, 3, 4, 2, 6, 8, 5, 3, 7, 9, 1, 7, 1, 3, 9, 2, 4, 8,
  5, 6, 9, 6, 1, 5, 3, 7, 2, 8, 4, 2, 8, 7, 4, 1, 9, 6, 3, 5, 3, 4, 5, 2, 8, 6,
  1, 7, 0,
];

// A fully-solved grid (every digit count = 9). Built by solving ONE_EMPTY.
const SOLVED: Grid = (() => {
  const s = solve(ONE_EMPTY);
  if (!s) throw new Error("ONE_EMPTY should be solvable");
  return s;
})();

// SOLVED with one occurrence of each listed digit removed → those digits become
// incomplete (count 8), the rest stay complete (count 9).
function withIncomplete(digits: number[]): Grid {
  const g = SOLVED.slice();
  for (const d of digits) g[g.indexOf(d)] = 0;
  return g;
}

// A fresh run: depth-1 real bank puzzle, clock not yet started.
function mkInit(): RunState {
  return initRun(config, bank, mulberry32(config.seed));
}

// Drive the reducer to fully solve the current puzzle (advancing one depth).
function completeCurrentPuzzle(s: RunState, nowMs: number): RunState {
  const sol = solve(s.grid);
  if (!sol) throw new Error("expected a solvable puzzle");
  const startDepth = s.depth;
  while (s.status === "playing" && s.depth === startDepth) {
    const cell = s.grid.indexOf(0);
    if (cell === -1) break;
    s = reduce(s, { type: "selectNumber", digit: sol[cell] }, mkCtx(nowMs));
    s = reduce(s, { type: "placeNumber", cell }, mkCtx(nowMs));
  }
  return s;
}

function playingState(grid: Grid): RunState {
  return {
    status: "playing",
    mode: "hints-on",
    seed: 7,
    depth: 2,
    grid: grid.slice(),
    rating: config.floorRating,
    activeDigit: null,
    activeCell: null,
    puzzleStartMs: 0,
    lastPlaceMs: 0,
    score: 0,
    fastestSolveMs: null,
    totalMs: 0,
    emptyAtStart: grid.filter((d) => d === 0).length,
    levels: [{ depth: 2, depthPts: 0, speedPts: 0 }],
  };
}

function countDigit(grid: Grid, d: number): number {
  let n = 0;
  for (const x of grid) if (x === d) n++;
  return n;
}

function findKillerMove(puzzle: Grid): { cell: number; digit: number } | null {
  const sol = solve(puzzle);
  if (!sol) return null;
  for (let cell = 0; cell < 81; cell++) {
    if (puzzle[cell] !== 0) continue;
    for (let d = 1; d <= 9; d++) {
      if (d === sol[cell] || !isSafe(puzzle, cell, d)) continue;
      const g = puzzle.slice();
      g[cell] = d;
      if (!isSolvable(g)) return { cell, digit: d };
    }
  }
  return null;
}

describe("initRun", () => {
  it("starts a playing, depth-1 puzzle with the clock unstarted", () => {
    const s = mkInit();
    expect(s.status).toBe("playing");
    expect(s.depth).toBe(1);
    expect(s.score).toBe(0);
    expect(s.puzzleStartMs).toBeNull(); // startRun stamps it when play begins
  });

  it("opens pre-aimed at the lowest non-solved digit + its first legal cell", () => {
    const s = mkInit();
    expect(s.activeDigit).not.toBeNull();
    expect(s.activeCell).not.toBeNull();
    const d = s.activeDigit as number;
    const cell = s.activeCell as number;
    for (let lower = 1; lower < d; lower++) {
      expect(countDigit(s.grid, lower)).toBe(9);
    }
    expect(countDigit(s.grid, d)).toBeLessThan(9);
    expect(s.grid[cell]).toBe(0);
    expect(isSafe(s.grid, cell, d)).toBe(true);
  });

  it("startRun stamps the depth-1 clock once, then is idempotent", () => {
    let s = mkInit();
    expect(s.puzzleStartMs).toBeNull();
    s = reduce(s, { type: "startRun" }, mkCtx(2000));
    expect(s.puzzleStartMs).toBe(2000);
    s = reduce(s, { type: "startRun" }, mkCtx(9999));
    expect(s.puzzleStartMs).toBe(2000); // not restamped
  });
});

describe("reduce — selection & traversal", () => {
  it("selectNumber sets the digit and first legal cell", () => {
    const s = reduce(
      playingState(ONE_EMPTY),
      { type: "selectNumber", digit: 9 },
      mkCtx(0),
    );
    expect(s.activeDigit).toBe(9);
    expect(s.activeCell).toBe(80);
  });

  it("placeNumber is a no-op when illegal", () => {
    let s = playingState(ONE_EMPTY);
    s = reduce(s, { type: "selectNumber", digit: 1 }, mkCtx(0)); // 1 illegal at 80
    const before = s;
    const after = reduce(s, { type: "placeNumber", cell: 80 }, mkCtx(0));
    expect(after.grid[80]).toBe(0);
    expect(after).toEqual(before);
  });
});

describe("reduce — completion advances and scores", () => {
  it("completing a puzzle increments depth, scores, and pulls a new grid", () => {
    let s = playingState(ONE_EMPTY);
    s = reduce(s, { type: "selectNumber", digit: 9 }, mkCtx(0));
    s = reduce(s, { type: "placeNumber", cell: 80 }, mkCtx(5000));
    expect(s.status).toBe("playing");
    expect(s.depth).toBe(3);
    expect(s.score).toBeGreaterThan(0);
    expect(s.grid.filter((d) => d === 0).length).toBeGreaterThan(0); // fresh puzzle
    expect(s.puzzleStartMs).toBe(5000);
  });
});

describe("reduce — directional cursor movement (arrows)", () => {
  // Empty grid → every cell is a legal target for any digit, so the valid set
  // is all 81 cells and the traversal order is fully predictable.
  const EMPTY: Grid = new Array(81).fill(0);
  const at = (cell: number): RunState => ({
    ...playingState(EMPTY),
    activeDigit: 1,
    activeCell: cell,
  });

  it("left/right step row-major (reading order) prev/next", () => {
    expect(
      reduce(
        at(10),
        { type: "skipToNextCell", traversal: "valid", axis: "row", dir: 1 },
        mkCtx(0),
      ).activeCell,
    ).toBe(11);
    expect(
      reduce(
        at(10),
        { type: "skipToNextCell", traversal: "valid", axis: "row", dir: -1 },
        mkCtx(0),
      ).activeCell,
    ).toBe(9);
  });

  it("up/down step column-major prev/next", () => {
    // column-major from r1c1 (10): next down the column is r2c1 (19); prev is r0c1 (1)
    expect(
      reduce(
        at(10),
        { type: "skipToNextCell", traversal: "valid", axis: "col", dir: 1 },
        mkCtx(0),
      ).activeCell,
    ).toBe(19);
    expect(
      reduce(
        at(10),
        { type: "skipToNextCell", traversal: "valid", axis: "col", dir: -1 },
        mkCtx(0),
      ).activeCell,
    ).toBe(1);
  });

  it("wraps around the valid set at the ends", () => {
    // row-major prev from cell 0 wraps to the last cell (80)
    expect(
      reduce(
        at(0),
        { type: "skipToNextCell", traversal: "valid", axis: "row", dir: -1 },
        mkCtx(0),
      ).activeCell,
    ).toBe(80);
  });
});

describe("reduce — cycleNumber (Tab walks the number selector)", () => {
  // Incomplete digits: 1, 5, 7 (one of each removed from a solved grid).
  const MULTI = withIncomplete([1, 5, 7]);
  const onDigit = (grid: Grid, digit: number | null): RunState => ({
    ...playingState(grid),
    activeDigit: digit,
    activeCell: digit == null ? null : (cellsForDigit(grid, digit)[0] ?? null),
  });
  const cyc = (s: RunState, dir: 1 | -1): RunState =>
    reduce(s, { type: "cycleNumber", dir }, mkCtx(0));

  it("Tab forward lands on the next non-completed digit, skipping completed", () => {
    // from 5 → 6 is complete → next incomplete is 7
    expect(cyc(onDigit(MULTI, 5), 1).activeDigit).toBe(7);
  });

  it("Tab forward wraps 9→1", () => {
    // from 7 → 8, 9 complete → wrap → 1
    expect(cyc(onDigit(MULTI, 7), 1).activeDigit).toBe(1);
  });

  it("Shift+Tab steps backward, skipping completed", () => {
    // from 5 → 4, 3, 2 complete → prev incomplete is 1
    expect(cyc(onDigit(MULTI, 5), -1).activeDigit).toBe(1);
  });

  it("Shift+Tab wraps 1→9", () => {
    // from 1 backward → wrap → highest incomplete is 7
    expect(cyc(onDigit(MULTI, 1), -1).activeDigit).toBe(7);
  });

  it("aims the landed digit's first legal cell", () => {
    const s = cyc(onDigit(MULTI, 5), 1);
    expect(s.activeDigit).toBe(7);
    expect(s.activeCell).toBe(cellsForDigit(MULTI, 7)[0]);
  });

  it("with no active digit, Tab picks the lowest incomplete and Shift+Tab the highest", () => {
    expect(cyc(onDigit(MULTI, null), 1).activeDigit).toBe(1);
    expect(cyc(onDigit(MULTI, null), -1).activeDigit).toBe(7);
  });

  it("lands on a remaining digit even with no legal cell (activeCell null)", () => {
    // Fully filled with 1s: digits 2..9 are 'remaining' but no empty cell exists.
    const FILLED = new Array(81).fill(1) as Grid;
    const s = cyc(onDigit(FILLED, 1), 1);
    expect(s.activeDigit).toBe(2);
    expect(s.activeCell).toBeNull();
  });

  it("is a no-op move when only the active digit remains", () => {
    const ONLY4 = withIncomplete([4]);
    expect(cyc(onDigit(ONLY4, 4), 1).activeDigit).toBe(4);
  });

  it("leaves state untouched when every digit is complete", () => {
    const before = onDigit(SOLVED, 5);
    expect(cyc(before, 1)).toBe(before);
  });
});

describe("advance — next puzzle opens pre-selected", () => {
  it("a fresh puzzle starts with the lowest non-solved digit + a legal cell", () => {
    // Solve depth 1 to advance into the depth-2 puzzle.
    let s = mkInit();
    s = reduce(s, { type: "startRun" }, mkCtx(1000));
    s = completeCurrentPuzzle(s, 1000);
    expect(s.status).toBe("playing");
    expect(s.depth).toBe(2);
    // The selector must never be blank on a fresh puzzle.
    expect(s.activeDigit).not.toBeNull();
    expect(s.activeCell).not.toBeNull();
    const d = s.activeDigit as number;
    const cell = s.activeCell as number;
    // It is the LOWEST non-solved digit…
    for (let lower = 1; lower < d; lower++) {
      expect(countDigit(s.grid, lower)).toBe(9);
    }
    expect(countDigit(s.grid, d)).toBeLessThan(9);
    // …aimed at a legal, empty cell.
    expect(s.grid[cell]).toBe(0);
    expect(isSafe(s.grid, cell, d)).toBe(true);
  });
});

describe("reduce — death on unsolvable", () => {
  it("a killing placement ends the run", () => {
    const seed = bank.bands[0].seeds[0] as Grid;
    const kill = findKillerMove(seed);
    expect(kill).not.toBeNull();
    // biome-ignore lint/style/noNonNullAssertion: guarded by expect above
    const { cell, digit } = kill!;
    let s = playingState(seed);
    s = reduce(s, { type: "selectNumber", digit }, mkCtx(0));
    s = reduce(s, { type: "placeNumber", cell }, mkCtx(0));
    expect(s.status).toBe("runOver");
    const sum = summarize(s);
    expect(sum.depth).toBe(2);
    expect(sum.seed).toBe(7);
  });

  it("the killing placement still banks points for the cell it filled", () => {
    const seed = bank.bands[0].seeds[0] as Grid;
    const startEmpty = seed.filter((d) => d === 0).length;
    const kill = findKillerMove(seed);
    expect(kill).not.toBeNull();
    // biome-ignore lint/style/noNonNullAssertion: guarded by expect above
    const { cell, digit } = kill!;

    let s = playingState(seed); // puzzleStartMs=0, lastPlaceMs=0, rating=floorRating
    s = reduce(s, { type: "selectNumber", digit }, mkCtx(0));
    s = reduce(s, { type: "placeNumber", cell }, mkCtx(5000)); // dt = 5000ms

    expect(s.status).toBe("runOver");
    // The one placed cell banks its per-cell points (dt measured from lastPlaceMs).
    const expected = cellPoints(config.floorRating, 5000, startEmpty, config);
    expect(s.score).toBe(expected);
    expect(s.score).toBeGreaterThan(0); // never a flat 0
  });

  it("counts the death-puzzle elapsed toward total time", () => {
    const seed = bank.bands[0].seeds[0] as Grid;
    const kill = findKillerMove(seed);
    expect(kill).not.toBeNull();
    // biome-ignore lint/style/noNonNullAssertion: guarded by expect above
    const { cell, digit } = kill!;

    let s = playingState(seed); // puzzleStartMs = 0, totalMs = 0
    s = reduce(s, { type: "selectNumber", digit }, mkCtx(0));
    s = reduce(s, { type: "placeNumber", cell }, mkCtx(5000)); // solveMs = 5000

    expect(s.status).toBe("runOver");
    expect(summarize(s).totalMs).toBe(5000);
  });

  it("runOver is terminal", () => {
    const over: RunState = { ...playingState(ONE_EMPTY), status: "runOver" };
    expect(reduce(over, { type: "selectNumber", digit: 1 }, mkCtx(0))).toBe(
      over,
    );
  });
});

describe("reduce — points bank per placement", () => {
  it("a placement during play raises the score immediately (before any completion)", () => {
    const seed = bank.bands[0].seeds[0] as Grid;
    const sol = solve(seed);
    if (!sol) throw new Error("expected solvable seed");
    const cell = seed.indexOf(0);
    let s = playingState(seed); // score 0
    s = reduce(s, { type: "selectNumber", digit: sol[cell] }, mkCtx(2000));
    s = reduce(s, { type: "placeNumber", cell }, mkCtx(2000));
    expect(s.status).toBe("playing");
    expect(s.score).toBeGreaterThan(0);
  });

  it("a faster placement banks more than a slower one", () => {
    const seed = bank.bands[0].seeds[0] as Grid;
    const sol = solve(seed);
    if (!sol) throw new Error("expected solvable seed");
    const cell = seed.indexOf(0);
    const digit = sol[cell];
    const fast = reduce(
      reduce(playingState(seed), { type: "selectNumber", digit }, mkCtx(500)),
      { type: "placeNumber", cell },
      mkCtx(500), // dt = 500ms from lastPlaceMs(0)
    );
    const slow = reduce(
      reduce(playingState(seed), { type: "selectNumber", digit }, mkCtx(20000)),
      { type: "placeNumber", cell },
      mkCtx(20000), // dt = 20s
    );
    expect(fast.score).toBeGreaterThan(slow.score);
  });
});

describe("reduce — depth 1 is a timed, scored puzzle", () => {
  it("completing depth 1 banks score + time and advances to depth 2", () => {
    let s = mkInit();
    s = reduce(s, { type: "startRun" }, mkCtx(0)); // clock starts at 0
    s = completeCurrentPuzzle(s, 5000); // depth-1 solve takes 5000ms
    expect(s.depth).toBe(2);
    expect(s.status).toBe("playing");
    expect(s.score).toBeGreaterThan(0); // depth 1 now scores
    expect(s.totalMs).toBe(5000); // depth-1 solve time is counted
    expect(s.puzzleStartMs).toBe(5000); // depth-2 clock stamped on entry
  });
});
