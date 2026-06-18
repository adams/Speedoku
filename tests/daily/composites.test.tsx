// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DailyGate } from "@/components/daily/DailyGate";
import { DailyResult } from "@/components/daily/DailyResult";
import type { LeaderboardEntry, StreakState } from "@/lib/daily/types";
import type { RunSummary } from "@/lib/run/types";

describe("DailyGate", () => {
  it("starts the daily on click", () => {
    const onStart = vi.fn();
    render(<DailyGate dateStr="2026-06-17" onStart={onStart} />);
    fireEvent.click(screen.getByRole("button", { name: /start/i }));
    expect(onStart).toHaveBeenCalledOnce();
  });

  it("warns that there is one attempt per day", () => {
    render(<DailyGate dateStr="2026-06-17" onStart={() => {}} />);
    expect(screen.getByText(/one attempt/i)).toBeInTheDocument();
  });
});

describe("DailyResult", () => {
  const summary: RunSummary = {
    depth: 9,
    score: 4820,
    fastestSolveMs: 12000,
    totalMs: 192000,
    mode: "hints-on",
    seed: 1,
  };
  const streak: StreakState = {
    lastDailyDate: "2026-06-17",
    currentStreak: 5,
    bestStreak: 7,
  };
  const leaderboard: LeaderboardEntry[] = [
    { name: "Nova", depth: 12, score: 9000, timeMs: 100000 },
    { name: "You", depth: 9, score: 4820, timeMs: 192000, isYou: true },
  ];

  it("shows result, streak, leaderboard, and a share card", () => {
    render(
      <DailyResult
        dateStr="2026-06-17"
        summary={summary}
        streak={streak}
        leaderboard={leaderboard}
        rank={2}
        onSubmitName={vi.fn().mockResolvedValue(true)}
      />,
    );
    expect(screen.getAllByText(/depth/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText("4,820").length).toBeGreaterThan(0);
    expect(screen.getAllByText(/5-day streak/i).length).toBeGreaterThan(0);
    expect(screen.getByText("Nova")).toBeInTheDocument();
    // The share card text appears in the ShareCard <pre>.
    expect(screen.getByText(/Speedoku Daily/)).toBeInTheDocument();
  });
});
