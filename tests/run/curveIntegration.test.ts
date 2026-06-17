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

describe("difficulty curve → realized difficulty (empties-driven symptom guard)", () => {
  it("depth 1 is near-solved (≤ floorEmpties+3 blanks) — the Enter-mashable floor", () => {
    // This is the primary goal of the empties-driven rework:
    // depth-1 puzzles have near-solved blank counts even though their technique
    // ratings are high on the U-curve. Rating is now secondary.
    const pick = pickSeed(bank, curveTarget(1, config), mulberry32(1));
    const nearSolvedCeiling = (config.floorEmpties ?? 6) + 3;
    expect(seedEmpties(pick.seed)).toBeLessThanOrEqual(nearSolvedCeiling);
  });

  it("empties ramp up with depth toward minimal, then saturate", () => {
    const e = (d: number) =>
      seedEmpties(pickSeed(bank, curveTarget(d, config), mulberry32(d)).seed);
    expect(e(1)).toBeLessThan(e(5)); // gets harder (more blanks)
    expect(e(12)).toBeGreaterThanOrEqual(45); // near minimal by mid-run
  });

  it("realized empties track the curve target within a tight window (empties is primary axis)", () => {
    // With empties as primary axis and RATING_WEIGHT=0.3 down-weighting rating,
    // realized empties should land very close to the empties target across all depths.
    for (let depth = 1; depth <= 14; depth++) {
      const t = curveTarget(depth, config);
      const realized = pickSeed(bank, t, mulberry32(depth * 13));
      const realizedE = seedEmpties(realized.seed);
      expect(
        Math.abs(realizedE - t.empties),
        `depth ${depth}: realized empties ${realizedE} vs target ${t.empties}`,
      ).toBeLessThanOrEqual(6);
    }
  });

  it("deep technique climbs: depth-14 realized rating exceeds depth-7 realized rating", () => {
    // Once empties saturate (both depth-7 and depth-14 target ~51 blanks),
    // the RATING_WEIGHT secondary term should steer deeper picks toward
    // harder-rated minimal puzzles — so deep play still escalates technique.
    const p7 = pickSeed(bank, curveTarget(7, config), mulberry32(7 * 13));
    const p14 = pickSeed(bank, curveTarget(14, config), mulberry32(14 * 13));
    expect(p14.rating).toBeGreaterThan(p7.rating);
  });

  it("un-squashes the scoring difficulty-weight across depth (coupled live-scoring fix)", () => {
    const wFloor = difficultyWeight(targetRating(2, config), config);
    const wDeep = difficultyWeight(targetRating(24, config), config);
    expect(wDeep).toBeGreaterThan(wFloor * 1.5);
  });
});
