import { describe, expect, it } from "vitest";
import type { BankFile } from "@/lib/engine/banks";
import { makeDefaultConfig } from "@/lib/run/config";

const bank: BankFile = {
  bands: [
    { lo: 100, hi: 200, seeds: [[]] },
    { lo: 200, hi: 300, seeds: [[]] },
    { lo: 300, hi: 500, seeds: [[]] },
  ],
};

describe("makeDefaultConfig", () => {
  it("calibrates floor/top to the bank's rating span", () => {
    const c = makeDefaultConfig(bank, { seed: 42, mode: "hints-on" });
    expect(c.floorRating).toBe(100);
    expect(c.topRating).toBe(500);
    expect(c.tutorialRating).toBe(100);
    expect(c.slope).toBeGreaterThan(0);
    expect(c.seed).toBe(42);
    expect(c.mode).toBe("hints-on");
  });

  it("carries sane scoring defaults", () => {
    const c = makeDefaultConfig(bank, { seed: 1, mode: "hints-on" });
    expect(c.base).toBe(1000);
    expect(c.floorRatio).toBe(0.25);
    expect(c.cap).toBe(4);
    expect(c.parFastSec).toBeLessThan(c.parSlowSec);
  });
});
