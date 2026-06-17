import type { StoreApi } from "zustand";
import { useStore } from "zustand";
import type { RunStore } from "./store";

export type RunStoreApi = StoreApi<RunStore>;

export function useRunSelector<T>(
  store: RunStoreApi,
  selector: (s: RunStore) => T,
): T {
  return useStore(store, selector);
}
