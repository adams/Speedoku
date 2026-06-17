import { describe, expect, it } from "vitest";
import type { Grid } from "@/lib/engine";
import { isSafe, isSolvable, mulberry32, solve } from "@/lib/engine";
import type { BankFile } from "@/lib/engine/banks";
import fixture from "@/lib/engine/banks/banks.fixture.json";
import { makeDefaultConfig } from "@/lib/run/config";
import { initRun, reduce, summarize } from "@/lib/run/reduce";
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
    score: 0,
    fastestSolveMs: null,
    totalMs: 0,
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
  it("starts in tutorial at depth 1", () => {
    const s = initRun(config);
    expect(s.status).toBe("tutorial");
    expect(s.depth).toBe(1);
    expect(s.score).toBe(0);
  });

  it("opens with the lowest non-solved digit + its first legal cell selected", () => {
    const s = initRun(config);
    // The tutorial is missing one each of 2, 3, 7, 8 (1/4/5/6/9 are complete),
    // so the lowest non-solved digit is 2, and the only legal cell for a 2 is 8.
    expect(s.activeDigit).toBe(2);
    expect(s.activeCell).toBe(8);
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

describe("advance — next puzzle opens pre-selected", () => {
  it("a fresh puzzle starts with the lowest non-solved digit + a legal cell", () => {
    // Complete the tutorial to advance into a real (depth-2) puzzle.
    let s = initRun(config);
    for (const [cell, digit] of [
      [8, 2],
      [17, 8],
      [26, 7],
      [35, 3],
    ] as const) {
      s = reduce(s, { type: "selectNumber", digit }, mkCtx(1000));
      s = reduce(s, { type: "placeNumber", cell }, mkCtx(1000));
    }
    expect(s.status).toBe("playing");
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

  it("runOver is terminal", () => {
    const over: RunState = { ...playingState(ONE_EMPTY), status: "runOver" };
    expect(reduce(over, { type: "selectNumber", digit: 1 }, mkCtx(0))).toBe(
      over,
    );
  });
});

describe("reduce — tutorial transitions to playing", () => {
  it("completing the tutorial starts the timed run at depth 2 with no score", () => {
    let s = initRun(config);
    // tutorial empties are at 8,17,26,35 — each forced to its row's missing value.
    for (const [cell, digit] of [
      [8, 2],
      [17, 8],
      [26, 7],
      [35, 3],
    ] as const) {
      s = reduce(s, { type: "selectNumber", digit }, mkCtx(1000));
      s = reduce(s, { type: "placeNumber", cell }, mkCtx(1000));
    }
    expect(s.status).toBe("playing");
    expect(s.depth).toBe(2);
    expect(s.score).toBe(0);
    expect(s.puzzleStartMs).toBe(1000);
  });
});
