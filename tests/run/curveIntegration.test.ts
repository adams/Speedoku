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
  it("depth 1 is a genuine medium puzzle (rating-led, NOT near-solved)", () => {
    // Rating now LEADS selection. Depth-1 targets floorRating (~p45 ≈ 151 on real
    // fixture) — a clear step up from the old near-solved floor (~105). The empties
    // target at depth 1 is the empties floor (6), but because rating is weighted 1.5×,
    // the picker lands on medium-rated puzzles (~14 blanks) rather than the trivial
    // 6-blank near-solved boards whose ratings sit on the high arm of the U-curve.
    const pick = pickSeed(bank, curveTarget(1, config), mulberry32(1));
    const realizedE = seedEmpties(pick.seed);
    const realizedR = pick.rating;
    // Not near-solved: must be well above the empties floor.
    expect(
      realizedE,
      `depth 1 should not be near-solved; got ${realizedE} blanks`,
    ).toBeGreaterThan((config.floorEmpties as number) + 3);
    // Rating is in the floor neighborhood: within 30 of floorRating.
    expect(
      Math.abs(realizedR - config.floorRating),
      `depth 1 realized rating ${realizedR.toFixed(1)} should be near floorRating ${config.floorRating.toFixed(1)}`,
    ).toBeLessThanOrEqual(30);
  });

  it("empties ramp up with depth toward minimal, then saturate", () => {
    const e = (d: number) =>
      seedEmpties(pickSeed(bank, curveTarget(d, config), mulberry32(d)).seed);
    expect(e(1)).toBeLessThan(e(5)); // gets harder (more blanks)
    expect(e(12)).toBeGreaterThanOrEqual(45); // near minimal by mid-run
  });

  it("realized empties track the curve target within a tight window (depth 2+)", () => {
    // Rating now LEADS selection (RATING_WEIGHT=1.5). At depth 1, the empties
    // target (6, the floor) conflicts with the rating target (~p45 ≈ 151) — there
    // are no 6-blank puzzles with that rating, so the picker lands on medium-rated
    // puzzles with more blanks (~14). This empties drift at depth 1 is intentional:
    // the rating term correctly avoids trivial near-solved boards.
    // From depth 2 onward the empties and rating targets are consistent with the
    // fixture distribution, so realized empties should stay close to the target.
    for (let depth = 2; depth <= 14; depth++) {
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
    // Single picks are stochastic draws from NEIGHBORHOOD=6; use median-of-N
    // to give the assertion real discriminating power (would fail if RATING_WEIGHT=0).
    const realizedRatings = (depth: number, n: number) => {
      const xs = Array.from(
        { length: n },
        (_, i) =>
          pickSeed(
            bank,
            curveTarget(depth, config),
            mulberry32(depth * 1000 + i),
          ).rating,
      ).sort((a, b) => a - b);
      return xs[Math.floor(xs.length / 2)]; // median
    };
    expect(realizedRatings(14, 16)).toBeGreaterThan(realizedRatings(7, 16));
  });

  it("un-squashes the scoring difficulty-weight across depth (coupled live-scoring fix)", () => {
    const wFloor = difficultyWeight(targetRating(2, config), config);
    const wDeep = difficultyWeight(targetRating(24, config), config);
    expect(wDeep).toBeGreaterThan(wFloor * 1.5);
  });
});
