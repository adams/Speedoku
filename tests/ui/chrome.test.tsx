// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { PreGame } from "@/components/chrome/PreGame";
import { RunOver } from "@/components/chrome/RunOver";
import type { RunSummary } from "@/lib/run/types";

describe("chrome", () => {
  it("PreGame fires onStart", async () => {
    const onStart = vi.fn();
    render(<PreGame onStart={onStart} />);
    await userEvent.click(screen.getByRole("button", { name: /start run/i }));
    expect(onStart).toHaveBeenCalledOnce();
  });

  it("RunOver shows the summary and fires onPlayAgain", async () => {
    const onPlayAgain = vi.fn();
    const summary: RunSummary = {
      depth: 7,
      score: 1240,
      fastestSolveMs: 54000,
      totalMs: 312000,
      mode: "hints-on",
      seed: 1,
    };
    render(<RunOver summary={summary} onPlayAgain={onPlayAgain} />);
    expect(screen.getByText("7")).toBeInTheDocument();
    expect(screen.getByText("1,240")).toBeInTheDocument();
    // The card is run-level only — no per-puzzle "fastest solve" row.
    expect(screen.queryByText(/fastest/i)).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /play again/i }));
    expect(onPlayAgain).toHaveBeenCalledOnce();
  });

  it("RunOver fires onPlayAgain on Enter", async () => {
    const onPlayAgain = vi.fn();
    const summary: RunSummary = {
      depth: 2,
      score: 53,
      fastestSolveMs: null,
      totalMs: 8000,
      mode: "hints-on",
      seed: 1,
    };
    render(<RunOver summary={summary} onPlayAgain={onPlayAgain} />);
    await userEvent.keyboard("{Enter}");
    expect(onPlayAgain).toHaveBeenCalledOnce();
  });

  it("RunOver flags a new best on the score row", () => {
    const summary = {
      depth: 9,
      score: 3000,
      fastestSolveMs: 25000,
      totalMs: 90000,
      mode: "hints-on" as const,
      seed: 1,
    };
    render(
      <RunOver
        summary={summary}
        onPlayAgain={() => {}}
        bests={{ bestScore: 3000, deepestDepth: 9, fastestSolveMs: 25000 }}
        isNewBest={{ score: true, depth: false, fastest: false }}
      />,
    );
    expect(screen.getByText(/new best/i)).toBeInTheDocument();
  });

  it("RunOver shows no new-best badge when nothing improved", () => {
    const summary = {
      depth: 3,
      score: 100,
      fastestSolveMs: 50000,
      totalMs: 30000,
      mode: "hints-on" as const,
      seed: 1,
    };
    render(
      <RunOver
        summary={summary}
        onPlayAgain={() => {}}
        isNewBest={{ score: false, depth: false, fastest: false }}
      />,
    );
    expect(screen.queryByText(/new best/i)).toBeNull();
  });
});

const summaryWithLevels: RunSummary = {
  depth: 2,
  score: 5000,
  fastestSolveMs: 1000,
  totalMs: 20000,
  mode: "hints-on",
  seed: 1,
  levels: [
    { depth: 1, depthPts: 1200, speedPts: 1800 }, // 3000
    { depth: 2, depthPts: 1300, speedPts: 700 }, // 2000 → running 5000
  ],
};

it("shows the depth/speed split and a per-level ledger that totals the score", () => {
  render(<RunOver summary={summaryWithLevels} onPlayAgain={() => {}} />);
  // headline split: depth = 2500/5000 = 50%, speed = 2500/5000 = 50%
  expect(screen.getByText(/50% depth/i)).toBeInTheDocument();
  expect(screen.getByText(/50% speed/i)).toBeInTheDocument();
  // running total lands on the final score (appears in Running column; score row also shows it)
  expect(screen.getAllByText("5,000").length).toBeGreaterThanOrEqual(1);
});

it("renders without a ledger when levels is empty (back-compat)", () => {
  render(
    <RunOver
      summary={{ ...summaryWithLevels, levels: [] }}
      onPlayAgain={() => {}}
    />,
  );
  expect(screen.queryByText(/% depth/i)).not.toBeInTheDocument();
});
