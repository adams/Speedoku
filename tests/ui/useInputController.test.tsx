// @vitest-environment jsdom
import { act, render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { cellsForDigit } from "@/lib/engine";
import type { BankFile } from "@/lib/engine/banks";
import fixture from "@/lib/engine/banks/banks.fixture.json";
import { useInputController } from "@/lib/input/useInputController";
import { createRunStore } from "@/lib/run/store";
import type { Intent } from "@/lib/run/types";
import type { RunStoreApi } from "@/lib/run/useRunStore";

const bank = fixture as BankFile;
let handlers: ReturnType<typeof useInputController>;
let store: RunStoreApi;

function Harness({ s }: { s: RunStoreApi }) {
  handlers = useInputController(s);
  return null;
}

function setup() {
  store = createRunStore(bank, { seed: 1, mode: "hints-on", clock: () => 0 });
  render(<Harness s={store} />);
}

describe("useInputController", () => {
  it("a digit tap only selects — it never places, even the active digit", () => {
    setup();
    // Re-tapping the already-active digit must NOT commit (the old toggle hazard):
    // digits only choose the active number; placement is Submit/Enter only.
    const active = store.getState().state.activeDigit as number;
    const cell = store.getState().state.activeCell as number;
    expect(cell).not.toBeNull();
    act(() => handlers.onDigit(active));
    expect(store.getState().state.grid[cell]).toBe(0); // not placed
    expect(store.getState().state.activeDigit).toBe(active); // still selected

    // Tapping a different legal digit just re-aims (selects), still no placement.
    const grid = store.getState().state.grid;
    let other = 0;
    for (let cand = 1; cand <= 9; cand++) {
      if (cand !== active && cellsForDigit(grid, cand).length > 0) {
        other = cand;
        break;
      }
    }
    expect(other).toBeGreaterThan(0);
    act(() => handlers.onDigit(other));
    expect(store.getState().state.activeDigit).toBe(other);
    const otherCell = store.getState().state.activeCell as number;
    expect(store.getState().state.grid[otherCell]).toBe(0); // still not placed
  });

  it("onSubmit places the active number at the active cell", () => {
    setup();
    const active = store.getState().state.activeDigit as number;
    const cell = store.getState().state.activeCell as number;
    act(() => handlers.onSubmit());
    expect(store.getState().state.grid[cell]).toBe(active);
  });

  it("Enter submits (places) the active number at the active cell", () => {
    setup();
    const active = store.getState().state.activeDigit as number;
    const cell = store.getState().state.activeCell as number;
    act(() =>
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" })),
    );
    expect(store.getState().state.grid[cell]).toBe(active);
  });

  it("board tap re-aims without placing (selectCell)", () => {
    setup();
    // The opening state already has a legal aimed cell for the active digit.
    const first = store.getState().state.activeCell as number;
    expect(first).not.toBeNull();
    act(() => handlers.onSelectCell(first)); // same legal cell -> stays aimed
    expect(store.getState().state.activeCell).toBe(first);
    expect(store.getState().state.grid[first]).toBe(0); // not placed
  });

  it("number keys route through onDigit", () => {
    setup();
    act(() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "5" })));
    expect(store.getState().state.activeDigit).toBe(5);
  });

  it("arrows dispatch directional valid-cell moves; Tab/Shift+Tab walk empties", () => {
    setup();
    const intents: Intent[] = [];
    store.setState({ dispatch: (i: Intent) => intents.push(i) });
    const press = (key: string, shiftKey = false) =>
      act(() =>
        window.dispatchEvent(new KeyboardEvent("keydown", { key, shiftKey })),
      );
    press("ArrowRight");
    press("ArrowLeft");
    press("ArrowDown");
    press("ArrowUp");
    press("Tab");
    press("Tab", true);
    expect(intents).toEqual([
      { type: "skipToNextCell", traversal: "valid", axis: "row", dir: 1 },
      { type: "skipToNextCell", traversal: "valid", axis: "row", dir: -1 },
      { type: "skipToNextCell", traversal: "valid", axis: "col", dir: 1 },
      { type: "skipToNextCell", traversal: "valid", axis: "col", dir: -1 },
      { type: "skipToNextCell", traversal: "empty", dir: 1 },
      { type: "skipToNextCell", traversal: "empty", dir: -1 },
    ]);
  });
});
