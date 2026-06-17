import { describe, expect, it } from "vitest";
import { type BankFile, pickSeed } from "@/lib/engine/banks";
import fixture from "@/lib/engine/banks/banks.fixture.json";
import { mulberry32 } from "@/lib/engine/rng";
import { makeDefaultConfig } from "@/lib/run/config";
import { curveTarget, targetRating } from "@/lib/run/curve";
import { difficultyWeight } from "@/lib/run/scorer";

const bank = fixture as BankFile;
const config = makeDefaultConfig(bank, { seed: 7, mode: "hints-on" });
const seedEmpties = (s: number[]) => s.filter((d) => d === 0).length;

describe("difficulty curve → realized difficulty (2-axis symptom guard)", () => {
  it("level 1 is near-solved (few empties) — the Enter-mashable floor", () => {
    const pick = pickSeed(bank, curveTarget(1, config), mulberry32(1));
    // realized empties closer to the near-solved floor than to the minimal end
    const midpoint =
      ((config.floorEmpties ?? 8) + (config.topEmpties ?? 54)) / 2;
    expect(seedEmpties(pick.seed)).toBeLessThan(midpoint);
  });

  it("empties ramp up with depth toward minimal, then saturate", () => {
    const e = (d: number) =>
      seedEmpties(pickSeed(bank, curveTarget(d, config), mulberry32(d)).seed);
    expect(e(1)).toBeLessThan(e(8)); // gets harder (more empties)
    expect(e(12)).toBeGreaterThanOrEqual(40); // near minimal by mid-run
  });

  it("technique rating tracks the curve target within a tight window (no cliff)", () => {
    const span = config.topRating - config.floorRating;
    for (let depth = 1; depth <= 24; depth++) {
      const t = curveTarget(depth, config);
      const realized = pickSeed(bank, t, mulberry32(depth * 13)).rating;
      // realized never lands a far-off monster; tight to the target rating
      expect(Math.abs(realized - t.rating)).toBeLessThan(span / 3);
    }
  });

  it("un-squashes the scoring difficulty-weight across depth (coupled live-scoring fix)", () => {
    const wFloor = difficultyWeight(targetRating(2, config), config);
    const wDeep = difficultyWeight(targetRating(24, config), config);
    expect(wDeep).toBeGreaterThan(wFloor * 1.5);
  });
});
