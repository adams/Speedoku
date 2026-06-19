// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Hud } from "@/components/hud/Hud";
import { EMPTY_BESTS } from "@/lib/data/types";
import type { Grid } from "@/lib/engine";
import type { BankFile } from "@/lib/engine/banks";
import fixture from "@/lib/engine/banks/banks.fixture.json";
import { createRunStore } from "@/lib/run/store";

const bank = fixture as BankFile;

describe("Hud", () => {
  it("renders depth and score", () => {
    const store = createRunStore(bank, {
      seed: 1,
      mode: "hints-on",
      clock: () => 0,
    });
    render(<Hud store={store} />);
    expect(screen.getByText(/depth/i)).toBeInTheDocument();
    expect(screen.getByText(/score/i)).toBeInTheDocument();
  });

  it("shows the timer from depth 1 (every puzzle is timed)", () => {
    const store = createRunStore(bank, {
      seed: 1,
      mode: "hints-on",
      clock: () => 0,
    });
    render(<Hud store={store} />);
    // A fresh run is already 'playing' at depth 1 → the Time block is present.
    expect(screen.getByText(/^time$/i)).toBeInTheDocument();
  });

  it("shows the banked score and does not decay with elapsed time", () => {
    const store = createRunStore(bank, {
      seed: 1,
      mode: "hints-on",
      clock: () => 0,
    });
    const base = store.getState().state;
    // Mid-run: some cells placed, clock running — the displayed score is the
    // banked total only (no live decay), so it reads exactly 1,500.
    const grid = Array.from({ length: 81 }, (_, i) => (i < 18 ? 0 : 5)) as Grid;
    store.setState({
      state: {
        ...base,
        status: "playing",
        score: 1500,
        grid,
        emptyAtStart: 36,
        puzzleStartMs: 0,
      },
    });
    render(<Hud store={store} />);
    expect(screen.getByText("1,500")).toBeInTheDocument();
  });
});

describe("Hud best-pace line", () => {
  it("shows the best score when there is one", () => {
    const store = createRunStore(bank, {
      seed: 1,
      mode: "hints-on",
      clock: () => 0,
    });
    render(
      <Hud
        store={store}
        bests={{ bestScore: 2400, deepestDepth: 18, fastestSolveMs: 30000 }}
      />,
    );
    expect(screen.getByText("Best")).toBeInTheDocument();
    expect(screen.getByText("2,400")).toBeInTheDocument();
  });

  it("hides the best line when there are no runs yet", () => {
    const store = createRunStore(bank, {
      seed: 1,
      mode: "hints-on",
      clock: () => 0,
    });
    render(<Hud store={store} bests={EMPTY_BESTS} />);
    expect(screen.queryByText("Best")).toBeNull();
  });
});
