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
});
