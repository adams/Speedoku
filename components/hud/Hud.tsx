"use client";

import type { Bests } from "@/lib/data/types";
import { EMPTY_BESTS } from "@/lib/data/types";
import { useElapsed } from "@/lib/run/useElapsed";
import type { RunStoreApi } from "@/lib/run/useRunStore";
import { useRunSelector } from "@/lib/run/useRunStore";
import { mmss } from "@/lib/ui/format";

export function Hud({
  store,
  bests = EMPTY_BESTS,
}: {
  store: RunStoreApi;
  bests?: Bests;
}) {
  const depth = useRunSelector(store, (s) => s.state.depth);
  const score = useRunSelector(store, (s) => s.state.score);
  const status = useRunSelector(store, (s) => s.state.status);
  const mode = useRunSelector(store, (s) => s.state.mode);
  const elapsed = useElapsed(store);

  return (
    <div className="relative flex items-stretch justify-between gap-4 rounded-[--radius-card] bg-[--color-cell] px-5 py-4 shadow-[0_2px_12px_rgba(0,0,0,0.08)]">
      {/* Depth */}
      <StatBlock label="Depth" value={String(depth)} />

      {/* Timer — hidden during tutorial */}
      {status !== "tutorial" && (
        <div className="flex flex-col items-center leading-none">
          <span className="mb-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[--color-muted]">
            Time
          </span>
          <span className="font-extrabold tabular-nums text-[28px] leading-tight tracking-tight">
            {mmss(elapsed)}
          </span>
        </div>
      )}

      {/* Score */}
      <StatBlock label="Score" value={score.toLocaleString()} align="right" />

      {/* Best — the live "beat this" pace target */}
      {bests.bestScore > 0 && (
        <StatBlock
          label="Best"
          value={bests.bestScore.toLocaleString()}
          align="right"
        />
      )}

      {/* Hints badge — only in hints-on mode */}
      {mode === "hints-on" && (
        <span className="absolute -top-2.5 right-4 rounded-full bg-[--color-accent] px-3 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white shadow-[var(--glow-accent)]">
          hints
        </span>
      )}
    </div>
  );
}

function StatBlock({
  label,
  value,
  align = "left",
}: {
  label: string;
  value: string;
  align?: "left" | "right";
}) {
  const alignClass = align === "right" ? "items-end" : "items-start";
  return (
    <div className={`flex flex-col leading-none ${alignClass}`}>
      <span className="mb-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[--color-muted]">
        {label}
      </span>
      <span className="text-2xl font-extrabold tabular-nums leading-tight">
        {value}
      </span>
    </div>
  );
}
