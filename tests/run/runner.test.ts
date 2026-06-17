import { describe, expect, it } from "vitest";
import type { BankFile } from "@/lib/engine/banks";
import fixture from "@/lib/engine/banks/banks.fixture.json";
import { runAuto } from "@/lib/run/runner";

const bank = fixture as BankFile;

describe("runAuto", () => {
  it("completes a capped no-mistake run with a sane summary", () => {
    const sum = runAuto(bank, { seed: 11, maxDepth: 5, mistakeRate: 0 });
    expect(sum.depth).toBeGreaterThanOrEqual(5);
    expect(sum.score).toBeGreaterThan(0);
    expect(sum.totalMs).toBeGreaterThan(0);
    if (sum.fastestSolveMs != null) {
      expect(sum.fastestSolveMs).toBeLessThanOrEqual(sum.totalMs);
    }
  });

  it("is deterministic for the same seed + options", () => {
    const a = runAuto(bank, { seed: 11, maxDepth: 5, mistakeRate: 0 });
    const b = runAuto(bank, { seed: 11, maxDepth: 5, mistakeRate: 0 });
    expect(a).toEqual(b);
  });
});
