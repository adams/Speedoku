"use client";

import { useEffect, useRef, useState } from "react";
import type { RunStoreApi } from "./useRunStore";

// Live elapsed ms for the *current puzzle* (resets each puzzle). rAF-driven and
// leak-free, mirroring useElapsed; returns 0 outside a playing puzzle.
export function usePuzzleElapsed(
  store: RunStoreApi,
  now: () => number = () => performance.now(),
): number {
  const [, force] = useState(0);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    const tick = () => {
      force((n) => n + 1);
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current != null) cancelAnimationFrame(raf.current);
    };
  }, []);

  const s = store.getState().state;
  return s.status === "playing" && s.puzzleStartMs != null
    ? Math.max(0, now() - s.puzzleStartMs)
    : 0;
}
