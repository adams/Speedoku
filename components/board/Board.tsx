"use client";

import { Cell } from "@/components/board/Cell";
import type { Grid } from "@/lib/engine";
import { isSafe, legalCandidates } from "@/lib/engine";
import { digitsOf } from "@/lib/engine/bits";

export interface BoardProps {
  grid: Grid;
  activeDigit: number | null;
  activeCell: number | null;
  onSelectCell: (cell: number) => void;
  bloom?: boolean;
}

function boxClasses(i: number): string {
  const r = Math.floor(i / 9);
  const c = i % 9;
  const cls: string[] = ["border-r border-b border-line"];
  if (c === 0) cls.push("border-l");
  if (r === 0) cls.push("border-t");
  if (c === 2 || c === 5 || c === 8) cls.push("border-r-2 border-r-divider");
  if (r === 2 || r === 5 || r === 8) cls.push("border-b-2 border-b-divider");
  if (c === 3 || c === 6) cls.push("border-l-2 border-l-divider");
  if (r === 3 || r === 6) cls.push("border-t-2 border-t-divider");
  return cls.join(" ");
}

export function Board({
  grid,
  activeDigit,
  activeCell,
  onSelectCell,
  bloom = false,
}: BoardProps) {
  const cands = legalCandidates(grid);
  const counts = new Array(10).fill(0);
  for (const v of grid) if (v) counts[v]++;

  return (
    <div
      className={`grid aspect-square w-full grid-cols-9 overflow-hidden rounded-[var(--radius-card)] border border-line bg-board shadow-[0_12px_40px_-12px_rgba(23,26,43,0.18)]${bloom ? " board-bloom" : ""}`}
    >
      {grid.map((value, i) => {
        const empty = value === 0;
        const candidates = empty ? digitsOf(cands[i]) : [];
        const legalForActive =
          empty && activeDigit != null && isSafe(grid, i, activeDigit);
        return (
          <Cell
            // biome-ignore lint/suspicious/noArrayIndexKey: fixed 81-cell grid, never reordered
            key={i}
            value={value}
            given={!empty}
            candidates={candidates}
            activeDigit={activeDigit}
            legalForActive={legalForActive}
            isCursor={i === activeCell}
            digitComplete={value !== 0 && counts[value] === 9}
            onSelect={() => onSelectCell(i)}
            boxClasses={boxClasses(i)}
          />
        );
      })}
    </div>
  );
}
