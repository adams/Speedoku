"use client";

import { useEffect, useMemo, useRef } from "react";
import type { RunStoreApi } from "@/lib/run/useRunStore";

export interface InputHandlers {
  onDigit: (d: number) => void;
  onSelectCell: (cell: number) => void;
  onSubmit: () => void;
}

export function useInputController(
  store: RunStoreApi,
  locked = false,
): InputHandlers {
  const lockedRef = useRef(locked);
  lockedRef.current = locked;

  const handlers = useMemo<InputHandlers>(() => {
    // Digits only ever choose the active number — they never place. Placement
    // happens solely via Submit (button) / Enter (keyboard) on the active cell.
    const onDigit = (d: number) => {
      if (lockedRef.current) return;
      store.getState().dispatch({ type: "selectNumber", digit: d });
    };
    const onSelectCell = (cell: number) => {
      if (lockedRef.current) return;
      store.getState().dispatch({ type: "selectCell", cell });
    };
    const onSubmit = () => {
      if (lockedRef.current) return;
      const s = store.getState().state;
      if (s.activeCell != null) {
        store.getState().dispatch({ type: "placeNumber", cell: s.activeCell });
      }
    };
    return { onDigit, onSelectCell, onSubmit };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (lockedRef.current) return;
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
          e.preventDefault();
          handlers.onSubmit();
          break;
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [store, handlers]);

  return handlers;
}
