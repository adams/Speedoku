"use client";

import { useEffect, useRef, useState } from "react";
import type { Grid } from "@/lib/engine";

export const EXIT_MS = 280; // bloom + slide up & out (the completed board)
export const ENTER_MS = 300; // rise from bottom + bloom in (the new board)

type Phase = "idle" | "exit" | "enter";

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

// Choreographs the depth-advance animation without touching the engine: on a
// depth increase it shows the previous (completed) grid sliding out, then the
// new grid rising in. Reduced-motion swaps instantly.
export function useDepthTransition(
  depth: number,
  grid: Grid,
): {
  transitioning: boolean;
  phase: Phase;
  displayGrid: Grid;
  stampDepth: number;
} {
  const [phase, setPhase] = useState<Phase>("idle");
  const prevDepth = useRef(depth);
  const prevGrid = useRef(grid);
  const exitGrid = useRef(grid);
  const stampDepth = useRef(depth);

  useEffect(() => {
    if (depth > prevDepth.current && !prefersReducedMotion()) {
      exitGrid.current = prevGrid.current; // the board we just completed
      stampDepth.current = depth;
      setPhase("exit");
      const t1 = setTimeout(() => setPhase("enter"), EXIT_MS);
      const t2 = setTimeout(() => setPhase("idle"), EXIT_MS + ENTER_MS);
      prevDepth.current = depth;
      prevGrid.current = grid;
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
    prevDepth.current = depth;
    prevGrid.current = grid;
  }, [depth, grid]);

  const transitioning = phase !== "idle";
  const displayGrid = phase === "exit" ? exitGrid.current : grid;
  return { transitioning, phase, displayGrid, stampDepth: stampDepth.current };
}
