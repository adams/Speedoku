import { describe, expect, it } from "vitest";
import type { BankFile } from "@/lib/engine/banks";
import { makeDefaultConfig } from "@/lib/run/config";

// Seeds encode empties by zero-count; ratings drive the technique percentiles.
const g = (empties: number) => [
  ...Array(81 - empties).fill(1),
  ...Array(empties).fill(0),
];
// ratings sorted: [10,20,30,40,50,60,70,80,90,100]; empties: [6,7,8,...,15]
const bank: BankFile = {
  bands: [
    {
      lo: 10,
      hi: 50,
      seeds: [g(6), g(7), g(8), g(9)],
      ratings: [10, 20, 30, 40],
    },
    { lo: 50, hi: 80, seeds: [g(10), g(11), g(12)], ratings: [50, 60, 70] },
    { lo: 80, hi: 101, seeds: [g(13), g(14), g(15)], ratings: [80, 90, 100] },
  ],
};

describe("makeDefaultConfig", () => {
  it("anchors the rating floor to ~p45 and top to ~p90", () => {
    const c = makeDefaultConfig(bank, { seed: 42, mode: "hints-on" });
    // percentile(p) uses idx=round(p*(n-1)); n=10 → p45→idx=round(0.45*9)=4→50, p90→idx8→90
    expect(c.floorRating).toBe(50);
    expect(c.topRating).toBe(90);
    expect(c.tutorialRating).toBe(c.floorRating); // legacy = depth-1 rating
    expect(c.slope).toBeCloseTo((90 - 50) / 8, 6);
    expect(c.seed).toBe(42);
    expect(c.mode).toBe("hints-on");
  });

  it("derives empties endpoints (near-solved floor, minimal top)", () => {
    const c = makeDefaultConfig(bank, { seed: 1, mode: "hints-on" });
    // empties sorted [6..15]; p05→idx0→6, p90→idx8→14
    expect(c.floorEmpties).toBe(6);
    expect(c.topEmpties).toBe(14);
  });

  it("carries sane scoring defaults", () => {
    const c = makeDefaultConfig(bank, { seed: 1, mode: "hints-on" });
    expect(c.base).toBe(1000);
    expect(c.floorRatio).toBe(0.25);
    expect(c.cap).toBe(4);
    expect(c.parFastSec).toBeLessThan(c.parSlowSec);
  });
});
