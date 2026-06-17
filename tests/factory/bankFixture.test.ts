import { describe, expect, it } from "vitest";
import { hasUniqueSolution } from "@/lib/engine";
import type { BankFile } from "@/lib/engine/banks";
import fixture from "@/lib/engine/banks/banks.fixture.json";

const bank = fixture as BankFile;

describe("banks.fixture.json", () => {
  it("has multiple populated bands", () => {
    expect(bank.bands.length).toBeGreaterThanOrEqual(8);
    for (const b of bank.bands) expect(b.seeds.length).toBeGreaterThan(0);
  });

  it("is gap-free (each band.hi equals the next band.lo)", () => {
    for (let i = 1; i < bank.bands.length; i++) {
      expect(bank.bands[i].lo).toBeCloseTo(bank.bands[i - 1].hi, 6);
    }
  });

  it("stores length-81 seeds whose first seed per band is unique-solution", () => {
    for (const b of bank.bands) {
      expect(b.seeds[0]).toHaveLength(81);
      expect(hasUniqueSolution(b.seeds[0])).toBe(true);
    }
  });
});
