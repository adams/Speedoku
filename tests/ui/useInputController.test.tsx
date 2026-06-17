// @vitest-environment jsdom
import { act, render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { BankFile } from "@/lib/engine/banks";
import fixture from "@/lib/engine/banks/banks.fixture.json";
import { useInputController } from "@/lib/input/useInputController";
import { createRunStore } from "@/lib/run/store";
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
  it("first digit tap selects; tap of the active digit commits", () => {
    setup();
    // The run opens pre-aimed at the lowest non-solved digit (2), so tap a
    // different digit (3) to re-aim — the first tap selects.
    expect(store.getState().state.activeDigit).toBe(2);
    act(() => handlers.onDigit(3));
    expect(store.getState().state.activeDigit).toBe(3);
    const cell = store.getState().state.activeCell;
    expect(cell).not.toBeNull();
    // tap the active digit again -> commits into the aimed cell
    act(() => handlers.onDigit(3));
    expect(store.getState().state.grid[cell as number]).toBe(3);
  });

  it("board tap re-aims without placing (selectCell)", () => {
    setup();
    act(() => handlers.onDigit(2));
    const first = store.getState().state.activeCell as number;
    // find another legal empty cell for 2 and re-aim there
    act(() => handlers.onSelectCell(first)); // same cell is legal -> stays/aims
    expect(store.getState().state.activeCell).toBe(first);
    expect(store.getState().state.grid[first]).toBe(0); // not placed
  });

  it("number keys route through onDigit", () => {
    setup();
    act(() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "5" })));
    expect(store.getState().state.activeDigit).toBe(5);
  });
});
