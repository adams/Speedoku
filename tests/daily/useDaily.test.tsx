// @vitest-environment jsdom
import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type {
  DailyRecord,
  DailyService,
  LeaderboardEntry,
  LeaderboardService,
  PlayerProfile,
  StreakState,
} from "@/lib/daily/types";
import { useDaily } from "@/lib/daily/useDaily";
import type { RunSummary } from "@/lib/run/types";

function stubDaily(): DailyService {
  let record: DailyRecord | null = null;
  let streak: StreakState = {
    lastDailyDate: null,
    currentStreak: 0,
    bestStreak: 0,
  };
  let profile: PlayerProfile = {};
  return {
    async getToday() {
      return record;
    },
    async startAttempt(date) {
      streak = { lastDailyDate: date, currentStreak: 1, bestStreak: 1 };
      record = {
        date,
        status: "inProgress",
        score: 0,
        depth: 0,
        fastestSolveMs: null,
      };
      return { record, streak };
    },
    async finalizeAttempt(date, summary) {
      record = {
        date,
        status: "final",
        score: summary.score,
        depth: summary.depth,
        fastestSolveMs: summary.fastestSolveMs,
        name: profile.name,
      };
      return record;
    },
    async getStreak() {
      return streak;
    },
    async getProfile() {
      return profile;
    },
    async setName(name) {
      if (name.trim() === "") return profile;
      profile = { name: name.trim() };
      if (record) record = { ...record, name: profile.name };
      return profile;
    },
  };
}

const stubLeaderboard: LeaderboardService = {
  async getDaily(_date, me: LeaderboardEntry) {
    return [
      { name: "Nova", depth: 12, score: 9000, timeMs: 100000 },
      { ...me, isYou: true },
    ];
  },
};

const sum = (over: Partial<RunSummary>): RunSummary => ({
  depth: 9,
  score: 4820,
  fastestSolveMs: 12000,
  totalMs: 192000,
  mode: "hints-on",
  seed: 1,
  ...over,
});

describe("useDaily", () => {
  it("loads today, streak and profile on mount", async () => {
    const { result } = renderHook(() =>
      useDaily(stubDaily(), stubLeaderboard, "2026-06-17"),
    );
    await waitFor(() => expect(result.current.loaded).toBe(true));
    expect(result.current.record).toBeNull();
  });

  it("start consumes the day and credits the streak", async () => {
    const { result } = renderHook(() =>
      useDaily(stubDaily(), stubLeaderboard, "2026-06-17"),
    );
    await waitFor(() => expect(result.current.loaded).toBe(true));
    await act(async () => {
      await result.current.start();
    });
    expect(result.current.record?.status).toBe("inProgress");
    expect(result.current.streak.currentStreak).toBe(1);
  });

  it("finalize sets the record final, loads the leaderboard, computes rank", async () => {
    const { result } = renderHook(() =>
      useDaily(stubDaily(), stubLeaderboard, "2026-06-17"),
    );
    await waitFor(() => expect(result.current.loaded).toBe(true));
    await act(async () => {
      await result.current.start();
      await result.current.finalize(sum({ score: 4820, depth: 9 }));
    });
    expect(result.current.record?.status).toBe("final");
    expect(result.current.leaderboard.some((r) => r.isYou)).toBe(true);
    expect(result.current.rank).toBe(2); // Nova(9000) above You(4820)
  });

  it("saveName returns false on a rejected name", async () => {
    const { result } = renderHook(() =>
      useDaily(stubDaily(), stubLeaderboard, "2026-06-17"),
    );
    await waitFor(() => expect(result.current.loaded).toBe(true));
    let ok = true;
    await act(async () => {
      ok = await result.current.saveName("   ");
    });
    expect(ok).toBe(false);
  });
});
