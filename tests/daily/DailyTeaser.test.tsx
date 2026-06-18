// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DailyTeaser } from "@/components/daily/DailyTeaser";
import type {
  DailyRecord,
  DailyService,
  LeaderboardEntry,
  LeaderboardService,
  PlayerProfile,
  StreakState,
} from "@/lib/daily/types";

const NOW = () => new Date("2026-06-17T18:00:00Z"); // PT date 2026-06-17

function stubDaily(record: DailyRecord | null): DailyService {
  return {
    async getToday() {
      return record;
    },
    async startAttempt(date) {
      return {
        record: {
          date,
          status: "inProgress",
          score: 0,
          depth: 0,
          fastestSolveMs: null,
          totalMs: 0,
        },
        streak: {
          lastDailyDate: date,
          currentStreak: 1,
          bestStreak: 1,
        } as StreakState,
      };
    },
    async finalizeAttempt(date) {
      return {
        date,
        status: "final",
        score: 0,
        depth: 0,
        fastestSolveMs: null,
        totalMs: 0,
      };
    },
    async getStreak() {
      return { lastDailyDate: null, currentStreak: 0, bestStreak: 0 };
    },
    async getProfile() {
      return {} as PlayerProfile;
    },
    async setName() {
      return {} as PlayerProfile;
    },
  };
}

const stubLeaderboard: LeaderboardService = {
  async getDaily(_date, me: LeaderboardEntry) {
    // One fake above the player → player ranks #2.
    return [
      { name: "Nova", depth: 12, score: 9000, timeMs: 100000 },
      { ...me, isYou: true },
    ];
  },
};

describe("DailyTeaser", () => {
  it("shows the 'try' link when there is no record for today", async () => {
    render(
      <DailyTeaser
        dailyService={stubDaily(null)}
        leaderboardService={stubLeaderboard}
        now={NOW}
      />,
    );
    const link = await screen.findByRole("link", {
      name: /try today's daily/i,
    });
    expect(link).toHaveAttribute("href", "/daily");
  });

  it("shows the 'done' chip with depth, score and rank when a record exists", async () => {
    const record = {
      date: "2026-06-17",
      status: "final" as const,
      score: 4820,
      depth: 9,
      fastestSolveMs: 12000,
      totalMs: 192000,
    };
    render(
      <DailyTeaser
        dailyService={stubDaily(record)}
        leaderboardService={stubLeaderboard}
        now={NOW}
      />,
    );
    const link = await screen.findByRole("link", { name: /today's daily/i });
    expect(link).toHaveAttribute("href", "/daily");
    expect(link).toHaveTextContent("Depth 9");
    expect(link).toHaveTextContent("4,820");
    expect(link).toHaveTextContent("#2");
  });
});
