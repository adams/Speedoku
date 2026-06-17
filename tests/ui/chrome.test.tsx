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
    await userEvent.click(screen.getByRole("button", { name: /play again/i }));
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
