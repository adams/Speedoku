"use client";

import { useEffect, useMemo } from "react";
import type { RunStoreApi } from "@/lib/run/useRunStore";

export interface InputHandlers {
  onDigit: (d: number) => void;
  onSelectCell: (cell: number) => void;
}

export function useInputController(store: RunStoreApi): InputHandlers {
  const handlers = useMemo<InputHandlers>(() => {
    const onDigit = (d: number) => {
      const s = store.getState().state;
      if (s.activeDigit === d && s.activeCell != null) {
        store.getState().dispatch({ type: "placeNumber", cell: s.activeCell });
      } else {
        store.getState().dispatch({ type: "selectNumber", digit: d });
      }
    };
    const onSelectCell = (cell: number) =>
      store.getState().dispatch({ type: "selectCell", cell });
    return { onDigit, onSelectCell };
  }, [store]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key >= "1" && e.key <= "9") {
        handlers.onDigit(Number(e.key));
        return;
      }
      switch (e.key) {
        case "ArrowUp":
        case "ArrowDown":
        case "ArrowLeft":
        case "ArrowRight":
          store
            .getState()
            .dispatch({ type: "skipToNextCell", traversal: "valid" });
          break;
        case "Tab":
          e.preventDefault();
          store
            .getState()
            .dispatch({ type: "skipToNextCell", traversal: "empty" });
          break;
        case "Enter": {
          const s = store.getState().state;
          if (s.activeCell != null)
            store
              .getState()
              .dispatch({ type: "placeNumber", cell: s.activeCell });
          break;
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [store, handlers]);

  return handlers;
}
