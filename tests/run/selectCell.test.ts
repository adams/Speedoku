import { describe, expect, it } from "vitest";
import type { Grid } from "@/lib/engine";
import { isSafe, mulberry32 } from "@/lib/engine";
import type { BankFile } from "@/lib/engine/banks";
import fixture from "@/lib/engine/banks/banks.fixture.json";
import { makeDefaultConfig } from "@/lib/run/config";
import { reduce } from "@/lib/run/reduce";
import type { Ctx, RunConfig, RunState } from "@/lib/run/types";

const bank = fixture as BankFile;
const config: RunConfig = makeDefaultConfig(bank, {
  seed: 4,
  mode: "hints-on",
});
const ctx: Ctx = { nowMs: 0, bank, rng: mulberry32(4), config };

const ONE_EMPTY: Grid = [
  5, 3, 4, 6, 7, 8, 9, 1, 2, 6, 7, 2, 1, 9, 5, 3, 4, 8, 1, 9, 8, 3, 4, 2, 5, 6,
  7, 8, 5, 9, 7, 6, 1, 4, 2, 3, 4, 2, 6, 8, 5, 3, 7, 9, 1, 7, 1, 3, 9, 2, 4, 8,
  5, 6, 9, 6, 1, 5, 3, 7, 2, 8, 4, 2, 8, 7, 4, 1, 9, 6, 3, 5, 3, 4, 5, 2, 8, 6,
  1, 7, 0,
];

function playing(
  grid: Grid,
  activeDigit: number | null,
  activeCell: number | null,
): RunState {
  return {
    status: "playing",
    mode: "hints-on",
    seed: 4,
    depth: 2,
    grid: grid.slice(),
    rating: config.floorRating,
    activeDigit,
    activeCell,
    puzzleStartMs: 0,
    lastPlaceMs: 0,
    score: 0,
    fastestSolveMs: null,
    totalMs: 0,
    emptyAtStart: grid.filter((d) => d === 0).length,
  };
}

describe("reduce selectCell", () => {
  it("re-aims to a legal target without placing", () => {
    // grid with two empties so there is a non-cursor legal target for some digit
    const g = ONE_EMPTY.slice();
    g[40] = 0; // index 40 was 5 -> now empty
    const s0 = playing(g, null, null);
    // pick digit 5: cell 40 is legal for 5 (its solution value)
    const s1 = reduce(s0, { type: "selectNumber", digit: 5 }, ctx);
    expect(s1.activeDigit).toBe(5);
    expect(isSafe(g, 40, 5)).toBe(true);
    const s2 = reduce(s1, { type: "selectCell", cell: 40 }, ctx);
    expect(s2.activeCell).toBe(40);
    expect(s2.grid[40]).toBe(0); // did NOT place
    expect(s2.status).toBe("playing");
  });

  it("is a no-op on a filled cell", () => {
    const s = playing(ONE_EMPTY, 9, 80);
    const after = reduce(s, { type: "selectCell", cell: 0 }, ctx); // cell 0 is filled
    expect(after).toEqual(s);
  });

  it("is a no-op when the cell is illegal for the active digit", () => {
    const s = playing(ONE_EMPTY, 1, 80); // 1 is illegal at 80 (row already has 1)
    const after = reduce(s, { type: "selectCell", cell: 80 }, ctx);
    expect(after).toEqual(s);
  });

  it("is a no-op when no digit is active", () => {
    const s = playing(ONE_EMPTY, null, null);
    const after = reduce(s, { type: "selectCell", cell: 80 }, ctx);
    expect(after).toEqual(s);
  });
});
