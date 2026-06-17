import { describe, expect, it } from "vitest";
import type { BankFile } from "@/lib/engine/banks";
import fixture from "@/lib/engine/banks/banks.fixture.json";
import { createRunStore } from "@/lib/run/store";

const bank = fixture as BankFile;

describe("createRunStore", () => {
  it("starts in tutorial and dispatches intents through reduce", () => {
    const t = 0;
    const store = createRunStore(bank, {
      seed: 3,
      mode: "hints-on",
      clock: () => t,
    });
    expect(store.getState().state.status).toBe("tutorial");

    store.getState().dispatch({ type: "selectNumber", digit: 2 });
    expect(store.getState().state.activeDigit).toBe(2);
  });

  it("exposes the run config", () => {
    const store = createRunStore(bank, {
      seed: 3,
      mode: "hints-on",
      clock: () => 0,
    });
    expect(store.getState().config.cap).toBe(4);
    expect(store.getState().config.floorRating).toBeGreaterThan(0);
  });
});
