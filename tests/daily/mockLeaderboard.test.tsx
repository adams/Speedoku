import { describe, expect, it } from "vitest";
import { createMockLeaderboard } from "@/lib/daily/mockLeaderboard";
import type { LeaderboardEntry } from "@/lib/daily/types";

const me: LeaderboardEntry = {
  name: "You",
  depth: 9,
  score: 4820,
  timeMs: 192000,
  isYou: true,
};

describe("mockLeaderboard", () => {
  it("is deterministic per date", async () => {
    const lb = createMockLeaderboard();
    const a = await lb.getDaily("2026-06-17", me);
    const b = await lb.getDaily("2026-06-17", me);
    expect(a).toEqual(b);
  });

  it("differs across dates", async () => {
    const lb = createMockLeaderboard();
    const a = await lb.getDaily("2026-06-17", me);
    const b = await lb.getDaily("2026-06-18", me);
    expect(a).not.toEqual(b);
  });

  it("includes the player's real entry exactly once, flagged isYou", async () => {
    const lb = createMockLeaderboard();
    const rows = await lb.getDaily("2026-06-17", me);
    const mine = rows.filter((r) => r.isYou);
    expect(mine).toHaveLength(1);
    expect(mine[0].score).toBe(4820);
  });

  it("is sorted by score descending", async () => {
    const lb = createMockLeaderboard();
    const rows = await lb.getDaily("2026-06-17", me);
    for (let i = 1; i < rows.length; i++) {
      expect(rows[i - 1].score).toBeGreaterThanOrEqual(rows[i].score);
    }
  });
});
