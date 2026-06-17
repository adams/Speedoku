"use client";

import { useEffect, useRef, useState } from "react";
import type { RunStoreApi } from "./useRunStore";

export function useElapsed(
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
  const live =
    s.status === "playing" && s.puzzleStartMs != null
      ? now() - s.puzzleStartMs
      : 0;
  return s.totalMs + Math.max(0, live);
}
