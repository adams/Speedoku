"use client";

import type { Grid } from "@/lib/engine";

export interface NumberPadProps {
  grid: Grid;
  activeDigit: number | null;
  onDigit: (d: number) => void;
}

export function NumberPad({ grid, activeDigit, onDigit }: NumberPadProps) {
  const counts = new Array(10).fill(0);
  for (const v of grid) if (v) counts[v]++;

  return (
    <div
      className="grid grid-cols-3 gap-2"
      // Match the board's width cap so the pad aligns under it instead of
      // ballooning to fill the column.
      style={{ width: "min(92vmin, 540px)" }}
    >
      {Array.from({ length: 9 }, (_, k) => {
        const d = k + 1;
        const remaining = 9 - counts[d];
        const done = remaining <= 0;
        const active = d === activeDigit;

        return (
          <button
            key={d}
            type="button"
            aria-label={`digit ${d}`}
            data-active={active ? "true" : "false"}
            data-done={done ? "true" : "false"}
            disabled={done}
            onClick={() => onDigit(d)}
            className={[
              // Short, wide tiles: a 3×3 pad of squares would be as tall as the
              // 9×9 board. Cap the height so the pad stays a compact strip.
              "relative flex h-[clamp(44px,11vw,60px)] items-center justify-center",
              "rounded-[var(--radius-card)]",
              "select-none outline-none",
              "transition-all duration-200 ease-out",
              // font sizing: scales with viewport, capped for the shorter tile
              "text-[clamp(20px,5vw,30px)] font-extrabold leading-none tabular-nums",
              active
                ? "text-white"
                : done
                  ? "text-[var(--color-cand)]"
                  : "text-[var(--color-ink)] active:scale-95",
            ]
              .filter(Boolean)
              .join(" ")}
            style={
              active
                ? {
                    // coral → cyan: locked visual direction
                    background:
                      "linear-gradient(145deg, var(--color-accent) 0%, var(--color-cyan) 100%)",
                    boxShadow:
                      "var(--glow-accent), 0 4px 16px rgba(255,61,119,0.25)",
                  }
                : done
                  ? {
                      background: "var(--color-cell-given)",
                      opacity: 0.5,
                    }
                  : {
                      background: "#ffffff",
                      boxShadow:
                        "0 2px 12px rgba(23,26,43,0.07), 0 1px 3px rgba(23,26,43,0.05)",
                    }
            }
          >
            {/* remaining count badge — top-right superscript */}
            {!done && (
              <span
                className={[
                  "absolute right-[10%] top-[10%]",
                  "text-[clamp(9px,2vw,12px)] font-bold tabular-nums leading-none",
                  active ? "text-white/70" : "text-[var(--color-muted)]",
                ].join(" ")}
              >
                {remaining}
              </span>
            )}
            {d}
          </button>
        );
      })}
    </div>
  );
}
