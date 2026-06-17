// @vitest-environment jsdom
import "@/tests/support/jsdomLocalStorage";
import { beforeEach, describe, expect, it } from "vitest";
import { createLocalAdapter } from "@/lib/data/localAdapter";
import { EMPTY_BESTS } from "@/lib/data/types";
import type { RunSummary } from "@/lib/run/types";

const sum = (over: Partial<RunSummary>): RunSummary => ({
  depth: 5,
  score: 1000,
  fastestSolveMs: 40000,
  totalMs: 120000,
  mode: "hints-on",
  seed: 1,
  ...over,
});

describe("localAdapter", () => {
  beforeEach(() => window.localStorage.clear());

  it("returns empty bests when nothing is stored", async () => {
    expect(await createLocalAdapter().getBests("hints-on")).toEqual(
      EMPTY_BESTS,
    );
  });

  it("first run sets all three bests and flags them new", async () => {
    const a = createLocalAdapter();
    const { bests, isNewBest } = await a.saveRun(
      sum({ score: 1000, depth: 5, fastestSolveMs: 40000 }),
    );
    expect(bests).toEqual({
      bestScore: 1000,
      deepestDepth: 5,
      fastestSolveMs: 40000,
    });
    expect(isNewBest).toEqual({ score: true, depth: true, fastest: true });
    expect(await a.getBests("hints-on")).toEqual(bests);
  });

  it("keeps max score/depth and min fastest across runs", async () => {
    const a = createLocalAdapter();
    await a.saveRun(sum({ score: 1000, depth: 5, fastestSolveMs: 40000 }));
    const r = await a.saveRun(
      sum({ score: 800, depth: 7, fastestSolveMs: 30000 }),
    );
    expect(r.bests).toEqual({
      bestScore: 1000,
      deepestDepth: 7,
      fastestSolveMs: 30000,
    });
    expect(r.isNewBest).toEqual({ score: false, depth: true, fastest: true });
  });

  it("treats a tie as not a new best", async () => {
    const a = createLocalAdapter();
    await a.saveRun(sum({ score: 1000, depth: 5, fastestSolveMs: 40000 }));
    const r = await a.saveRun(
      sum({ score: 1000, depth: 5, fastestSolveMs: 40000 }),
    );
    expect(r.isNewBest).toEqual({ score: false, depth: false, fastest: false });
  });

  it("handles a null fastestSolveMs without corrupting the min", async () => {
    const a = createLocalAdapter();
    await a.saveRun(sum({ fastestSolveMs: 40000 }));
    const r = await a.saveRun(sum({ fastestSolveMs: null }));
    expect(r.bests.fastestSolveMs).toBe(40000);
    expect(r.isNewBest.fastest).toBe(false);
  });

  it("first run with null fastest yields a null fastest best", async () => {
    const a = createLocalAdapter();
    const r = await a.saveRun(
      sum({ fastestSolveMs: null, score: 0, depth: 2 }),
    );
    expect(r.bests.fastestSolveMs).toBeNull();
    expect(r.isNewBest).toEqual({ score: false, depth: true, fastest: false });
  });

  it("round-trips the preferred mode", async () => {
    const a = createLocalAdapter();
    expect(await a.getMode()).toBeNull();
    await a.setMode("hints-on");
    expect(await a.getMode()).toBe("hints-on");
  });

  it("returns defaults on corrupt JSON (no throw)", async () => {
    window.localStorage.setItem("speedoku:v1:bests:hints-on", "{not json");
    expect(await createLocalAdapter().getBests("hints-on")).toEqual(
      EMPTY_BESTS,
    );
  });
});
