import { describe, expect, it } from "vitest";
import { hasUniqueSolution } from "@/lib/engine";
import type { BankFile } from "@/lib/engine/banks";
import fixture from "@/lib/engine/banks/banks.fixture.json";

const bank = fixture as BankFile;
const seedEmpties = (s: number[]) => s.filter((d) => d === 0).length;

describe("banks.fixture.json", () => {
  it("has many populated bands", () => {
    expect(bank.bands.length).toBeGreaterThanOrEqual(24);
    for (const b of bank.bands) expect(b.seeds.length).toBeGreaterThan(0);
  });

  it("is gap-free (each band.hi equals the next band.lo)", () => {
    for (let i = 1; i < bank.bands.length; i++) {
      expect(bank.bands[i].lo).toBeCloseTo(bank.bands[i - 1].hi, 6);
    }
  });

  it("stores a technique rating per seed, in-band", () => {
    for (const b of bank.bands) {
      expect(b.ratings).toHaveLength(b.seeds.length);
      for (const r of b.ratings) {
        expect(r).toBeGreaterThanOrEqual(b.lo);
        expect(r).toBeLessThan(b.hi);
      }
    }
  });

  it("stores length-81 unique-solution seeds", () => {
    for (const b of bank.bands) {
      expect(b.seeds[0]).toHaveLength(81);
      expect(hasUniqueSolution(b.seeds[0])).toBe(true);
    }
  });

  it("contains a clue-count spread: near-solved (easy) through minimal (hard)", () => {
    const empties = bank.bands.flatMap((b) => b.seeds.map(seedEmpties));
    expect(Math.min(...empties)).toBeLessThanOrEqual(10); // near-solved exist
    expect(Math.max(...empties)).toBeGreaterThanOrEqual(50); // minimal exist
  });
});
