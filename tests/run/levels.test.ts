/**
 * Task 2: per-level depth/speed ledger
 *
 * The reducer accumulates a `levels[]` array in RunState. Each entry tracks
 * how many points a given depth contributed, split into:
 *   depthPts — par-pace baseline (cellDepthPoints per placement)
 *   speedPts — the speed bonus/penalty (cellPoints − cellDepthPoints)
 *
 * KEY invariant: after every banking placement,
 *   Σ over levels (depthPts + speedPts) === state.score
 */
import { describe, expect, it } from "vitest";
import { mulberry32, solve } from "@/lib/engine";
import type { BankFile } from "@/lib/engine/banks";
import fixture from "@/lib/engine/banks/banks.fixture.json";
import { makeDefaultConfig } from "@/lib/run/config";
import { initRun, reduce, summarize } from "@/lib/run/reduce";
import type { Ctx, RunConfig } from "@/lib/run/types";

const bank = fixture as BankFile;
const config: RunConfig = makeDefaultConfig(bank, {
  seed: 42,
  mode: "hints-on",
});
const mkCtx = (nowMs: number): Ctx => ({
  nowMs,
  bank,
  rng: mulberry32(config.seed),
  config,
});

function sumLevels(state: ReturnType<typeof initRun>): number {
  return state.levels.reduce((acc, l) => acc + l.depthPts + l.speedPts, 0);
}

describe("levels[] ledger", () => {
  it("initRun seeds a single depth-1 level with zero points", () => {
    const s = initRun(config, bank, mulberry32(config.seed));
    expect(s.levels).toHaveLength(1);
    expect(s.levels[0]).toEqual({ depth: 1, depthPts: 0, speedPts: 0 });
  });

  it("invariant: Σ(depthPts+speedPts) === score after every banking placement", () => {
    let s = initRun(config, bank, mulberry32(config.seed));
    s = reduce(s, { type: "startRun" }, mkCtx(0));

    const sol = solve(s.grid);
    if (!sol) throw new Error("expected solvable seed");

    // Place the first ~5 cells and check the invariant after each
    let placed = 0;
    for (let cell = 0; cell < 81 && placed < 5; cell++) {
      if (s.grid[cell] !== 0) continue;
      const digit = sol[cell];
      s = reduce(s, { type: "selectNumber", digit }, mkCtx(placed * 3000));
      s = reduce(s, { type: "placeNumber", cell }, mkCtx(placed * 3000 + 1000));
      expect(sumLevels(s)).toBe(s.score);
      placed++;
    }
    expect(placed).toBeGreaterThan(0);
  });

  it("completing depth 1 appends a new depth-2 level; depth-1 level is finalized", () => {
    let s = initRun(config, bank, mulberry32(config.seed));
    s = reduce(s, { type: "startRun" }, mkCtx(0));

    // Drive through the entire depth-1 puzzle
    const startDepth = s.depth;
    let t = 1000;
    while (s.status === "playing" && s.depth === startDepth) {
      const cell = s.grid.indexOf(0);
      if (cell === -1) break;
      const sol = solve(s.grid);
      if (!sol) throw new Error("expected solvable mid-puzzle");
      const digit = sol[cell];
      s = reduce(s, { type: "selectNumber", digit }, mkCtx(t));
      s = reduce(s, { type: "placeNumber", cell }, mkCtx(t + 500));
      t += 1000;
    }

    expect(s.depth).toBe(2);
    expect(s.levels).toHaveLength(2);
    expect(s.levels[0].depth).toBe(1);
    expect(s.levels[1]).toEqual({ depth: 2, depthPts: 0, speedPts: 0 });
    // Invariant still holds
    expect(sumLevels(s)).toBe(s.score);
    // depth-1 level is not all-zeros (we placed cells there)
    const d1 = s.levels[0];
    expect(d1.depthPts + d1.speedPts).toBeGreaterThan(0);
  });

  it("summarize includes levels from state", () => {
    const s = initRun(config, bank, mulberry32(config.seed));
    const sum = summarize(s);
    expect(sum.levels).toBeDefined();
    expect(Array.isArray(sum.levels)).toBe(true);
  });
});
