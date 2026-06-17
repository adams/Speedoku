// @vitest-environment jsdom
import { act, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { BankFile } from "@/lib/engine/banks";
import fixture from "@/lib/engine/banks/banks.fixture.json";
import { createRunStore } from "@/lib/run/store";
import { useRunSelector } from "@/lib/run/useRunStore";

const bank = fixture as BankFile;

describe("useRunSelector", () => {
  it("subscribes to store state and re-renders on dispatch", () => {
    const store = createRunStore(bank, {
      seed: 1,
      mode: "hints-on",
      clock: () => 0,
    });
    function View() {
      const digit = useRunSelector(store, (s) => s.state.activeDigit);
      return <div data-testid="d">{digit ?? "none"}</div>;
    }
    render(<View />);
    // A run opens pre-aimed at the lowest non-solved digit (tutorial → 2).
    expect(screen.getByTestId("d").textContent).toBe("2");
    act(() => store.getState().dispatch({ type: "selectNumber", digit: 3 }));
    expect(screen.getByTestId("d").textContent).toBe("3");
  });
});
