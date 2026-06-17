// @vitest-environment jsdom
import { act, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { DataService } from "@/lib/data/types";
import type { RunSummary } from "@/lib/run/types";
import { usePersistence } from "@/lib/run/usePersistence";

const summary: RunSummary = {
  depth: 9,
  score: 3000,
  fastestSolveMs: 25000,
  totalMs: 90000,
  mode: "hints-on",
  seed: 1,
};

function stub(): DataService {
  return {
    async getBests() {
      return { bestScore: 1500, deepestDepth: 6, fastestSolveMs: 30000 };
    },
    async saveRun() {
      return {
        bests: { bestScore: 3000, deepestDepth: 9, fastestSolveMs: 25000 },
        isNewBest: { score: true, depth: true, fastest: true },
      };
    },
    async getMode() {
      return null;
    },
    async setMode() {
      /* noop */
    },
  };
}

let api: ReturnType<typeof usePersistence>;
function Harness({ adapter }: { adapter: DataService }) {
  api = usePersistence(adapter, "hints-on");
  return <div data-testid="best">{api.bests.bestScore}</div>;
}

describe("usePersistence", () => {
  it("loads bests on mount", async () => {
    render(<Harness adapter={stub()} />);
    expect(await screen.findByText("1500")).toBeInTheDocument();
  });

  it("recordRun updates bests and returns isNewBest", async () => {
    render(<Harness adapter={stub()} />);
    await screen.findByText("1500");
    let flags: unknown;
    await act(async () => {
      flags = await api.recordRun(summary);
    });
    expect(flags).toEqual({ score: true, depth: true, fastest: true });
    expect(screen.getByTestId("best").textContent).toBe("3000");
  });
});
