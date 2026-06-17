"use client";

import { puzzleFloor, puzzleMax, puzzleScore } from "@/lib/run/scorer";
import type { RunConfig } from "@/lib/run/types";

export function PuzzleMeter({
  rating,
  elapsedMs,
  config,
  visible,
}: {
  rating: number;
  elapsedMs: number;
  config: RunConfig;
  visible: boolean;
}) {
  if (!visible) return null;
  const value = puzzleScore(rating, elapsedMs, config);
  const max = puzzleMax(rating, config);
  const floor = puzzleFloor(rating, config);
  const span = max - floor;
  const fill = span > 0 ? Math.max(0, Math.min(1, (value - floor) / span)) : 0;

  return (
    <div className="flex flex-col items-end leading-none">
      <span className="mb-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[--color-muted]">
        Puzzle
      </span>
      <span className="text-2xl font-extrabold tabular-nums leading-tight text-[--color-accent]">
        +{value.toLocaleString()}
      </span>
      <div className="mt-1 h-1.5 w-20 overflow-hidden rounded-full bg-[--color-board]">
        <div
          data-testid="meter-fill"
          className="h-full rounded-full bg-[--color-accent] transition-[width] duration-150"
          style={{ width: `${fill * 100}%` }}
        />
      </div>
    </div>
  );
}
