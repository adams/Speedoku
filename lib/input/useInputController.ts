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
        // Arrows move directionally among the valid cells for the active digit:
        // left/right walk reading order, up/down walk the column.
        case "ArrowLeft":
          store.getState().dispatch({
            type: "skipToNextCell",
            traversal: "valid",
            axis: "row",
            dir: -1,
          });
          break;
        case "ArrowRight":
          store.getState().dispatch({
            type: "skipToNextCell",
            traversal: "valid",
            axis: "row",
            dir: 1,
          });
          break;
        case "ArrowUp":
          store.getState().dispatch({
            type: "skipToNextCell",
            traversal: "valid",
            axis: "col",
            dir: -1,
          });
          break;
        case "ArrowDown":
          store.getState().dispatch({
            type: "skipToNextCell",
            traversal: "valid",
            axis: "col",
            dir: 1,
          });
          break;
        // Tab / Shift+Tab walk every empty cell forward / backward.
        case "Tab":
          e.preventDefault();
          store.getState().dispatch({
            type: "skipToNextCell",
            traversal: "empty",
            dir: e.shiftKey ? -1 : 1,
          });
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
