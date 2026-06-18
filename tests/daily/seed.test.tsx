import { describe, expect, it } from "vitest";
import { cyrb53, seedFromDate } from "@/lib/daily/seed";

describe("seedFromDate", () => {
  it("is deterministic — same date yields the same seed", () => {
    expect(seedFromDate("2026-06-17")).toBe(seedFromDate("2026-06-17"));
  });

  it("differs across dates", () => {
    expect(seedFromDate("2026-06-17")).not.toBe(seedFromDate("2026-06-18"));
  });

  it("returns a 32-bit non-negative integer", () => {
    const s = seedFromDate("2026-06-17");
    expect(Number.isInteger(s)).toBe(true);
    expect(s).toBeGreaterThanOrEqual(0);
    expect(s).toBeLessThan(2 ** 32);
  });

  it("cyrb53 is stable for a known string", () => {
    expect(cyrb53("speedoku")).toBe(cyrb53("speedoku"));
    expect(cyrb53("a")).not.toBe(cyrb53("b"));
  });
});
