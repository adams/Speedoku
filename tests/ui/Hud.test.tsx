// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Hud } from "@/components/hud/Hud";
import { EMPTY_BESTS } from "@/lib/data/types";
import type { BankFile } from "@/lib/engine/banks";
import fixture from "@/lib/engine/banks/banks.fixture.json";
import { createRunStore } from "@/lib/run/store";

const bank = fixture as BankFile;

describe("Hud", () => {
  it("renders depth, score and the hints badge", () => {
    const store = createRunStore(bank, {
      seed: 1,
      mode: "hints-on",
      clock: () => 0,
    });
    render(<Hud store={store} />);
    expect(screen.getByText(/depth/i)).toBeInTheDocument();
    expect(screen.getByText(/score/i)).toBeInTheDocument();
    expect(screen.getByText(/hints/i)).toBeInTheDocument();
  });

  it("hides the timer during the tutorial", () => {
    const store = createRunStore(bank, {
      seed: 1,
      mode: "hints-on",
      clock: () => 0,
    });
    render(<Hud store={store} />);
    // status is 'tutorial' on a fresh run → no Time label
    expect(screen.queryByText(/^time$/i)).toBeNull();
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
