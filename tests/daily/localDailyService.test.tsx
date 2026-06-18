// @vitest-environment jsdom
import "@/tests/support/jsdomLocalStorage";
import { beforeEach, describe, expect, it } from "vitest";
import { createLocalDailyService } from "@/lib/daily/localDailyService";
import type { RunSummary } from "@/lib/run/types";

const sum = (over: Partial<RunSummary>): RunSummary => ({
  depth: 9,
  score: 4820,
  fastestSolveMs: 12000,
  totalMs: 192000,
  mode: "hints-on",
  seed: 1,
  ...over,
});

describe("localDailyService", () => {
  beforeEach(() => window.localStorage.clear());

  it("getToday returns null before any attempt", async () => {
    expect(await createLocalDailyService().getToday("2026-06-17")).toBeNull();
  });

  it("startAttempt creates an inProgress record and credits streak=1", async () => {
    const s = createLocalDailyService();
    const { record, streak } = await s.startAttempt("2026-06-17");
    expect(record).toMatchObject({
      date: "2026-06-17",
      status: "inProgress",
      score: 0,
      depth: 0,
    });
    expect(streak.currentStreak).toBe(1);
    expect(streak.bestStreak).toBe(1);
    expect(streak.lastDailyDate).toBe("2026-06-17");
  });

  it("startAttempt is idempotent — second call same day does not double the streak", async () => {
    const s = createLocalDailyService();
    await s.startAttempt("2026-06-17");
    const second = await s.startAttempt("2026-06-17");
    expect(second.streak.currentStreak).toBe(1);
    expect(second.record.status).toBe("inProgress");
  });

  it("consecutive PT days increment the streak; a gap resets it", async () => {
    const s = createLocalDailyService();
    await s.startAttempt("2026-06-16");
    const day2 = await s.startAttempt("2026-06-17");
    expect(day2.streak.currentStreak).toBe(2);
    expect(day2.streak.bestStreak).toBe(2);
    const day4 = await s.startAttempt("2026-06-19"); // skipped the 18th
    expect(day4.streak.currentStreak).toBe(1);
    expect(day4.streak.bestStreak).toBe(2); // best is retained
  });

  it("finalizeAttempt writes summary fields and is idempotent once final", async () => {
    const s = createLocalDailyService();
    await s.startAttempt("2026-06-17");
    const rec = await s.finalizeAttempt(
      "2026-06-17",
      sum({ score: 4820, depth: 9 }),
    );
    expect(rec).toMatchObject({ status: "final", score: 4820, depth: 9 });
    const again = await s.finalizeAttempt(
      "2026-06-17",
      sum({ score: 99999, depth: 99 }),
    );
    expect(again.score).toBe(4820); // not overwritten
    expect(again.depth).toBe(9);
  });

  it("setName validates, persists to profile, and stamps today's record", async () => {
    const s = createLocalDailyService();
    await s.startAttempt("2026-06-17");
    await s.finalizeAttempt("2026-06-17", sum({}));
    const profile = await s.setName("Mike", "2026-06-17");
    expect(profile.name).toBe("Mike");
    expect((await s.getToday("2026-06-17"))?.name).toBe("Mike");
  });

  it("setName rejects a disallowed name and leaves the profile unchanged", async () => {
    const s = createLocalDailyService();
    const profile = await s.setName("   ", "2026-06-17");
    expect(profile.name).toBeUndefined();
  });

  it("corrupt JSON falls back to defaults without throwing", async () => {
    window.localStorage.setItem("speedoku:v1:streak", "{not json");
    window.localStorage.setItem("speedoku:v1:daily:2026-06-17", "nope");
    const s = createLocalDailyService();
    expect(await s.getStreak()).toEqual({
      lastDailyDate: null,
      currentStreak: 0,
      bestStreak: 0,
    });
    expect(await s.getToday("2026-06-17")).toBeNull();
  });
});
