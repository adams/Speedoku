import { createStore } from "zustand/vanilla";
import type { Rng } from "@/lib/engine";
import { mulberry32 } from "@/lib/engine";
import type { BankFile } from "@/lib/engine/banks";
import { makeDefaultConfig } from "./config";
import { initRun, reduce } from "./reduce";
import type { Ctx, Intent, Mode, RunConfig, RunState } from "./types";

export interface RunStore {
  state: RunState;
  config: RunConfig;
  dispatch(intent: Intent): void;
}

export function createRunStore(
  bank: BankFile,
  opts: { seed: number; mode: Mode; clock?: () => number },
) {
  const config: RunConfig = makeDefaultConfig(bank, {
    seed: opts.seed,
    mode: opts.mode,
  });
  const rng: Rng = mulberry32(opts.seed);
  const clock = opts.clock ?? (() => performance.now());

  return createStore<RunStore>((set, get) => ({
    state: initRun(config, bank, rng),
    config,
    dispatch(intent: Intent) {
      const ctx: Ctx = { nowMs: clock(), bank, rng, config };
      set({ state: reduce(get().state, intent, ctx) });
    },
  }));
}
