"use client";

import { useEffect } from "react";
import type { Bests, NewBest } from "@/lib/data/types";
import { EMPTY_BESTS } from "@/lib/data/types";
import type { RunSummary } from "@/lib/run/types";
import { mmss } from "@/lib/ui/format";

export function RunOver({
  summary,
  onPlayAgain,
  bests = EMPTY_BESTS,
  isNewBest = { score: false, depth: false, fastest: false },
}: {
  summary: RunSummary;
  onPlayAgain: () => void;
  bests?: Bests;
  isNewBest?: NewBest;
}) {
  // Enter restarts the run straight from the run-over card.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        onPlayAgain();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onPlayAgain]);

  const rows: { label: string; value: string; isNew: boolean }[] = [
    { label: "Depth", value: String(summary.depth), isNew: isNewBest.depth },
    {
      label: "Score",
      value: summary.score.toLocaleString(),
      isNew: isNewBest.score,
    },
    { label: "Total time", value: mmss(summary.totalMs), isNew: false },
  ];
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-[--color-board]/85 backdrop-blur-md">
      <div
        className="w-[320px] overflow-hidden rounded-card bg-[--color-cell] shadow-[0_8px_40px_rgba(0,0,0,0.14)]"
        style={{ border: "1px solid var(--color-line)" }}
      >
        {/* Gradient accent strip */}
        <div
          aria-hidden="true"
          className="h-1 w-full"
          style={{
            background:
              "linear-gradient(90deg,var(--color-accent) 0%,var(--color-cyan) 100%)",
          }}
        />

        <div className="p-7">
          {/* Header */}
          <div className="mb-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[--color-muted]">
              Run complete
            </p>
            <h2 className="mt-0.5 text-2xl font-extrabold tracking-tight text-[--color-ink]">
              Run over
            </h2>
          </div>

          {/* Stats */}
          <dl className="flex flex-col divide-y divide-[--color-line]">
            {rows.map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between py-2.5"
              >
                <dt className="text-[11px] font-bold uppercase tracking-[0.14em] text-[--color-muted]">
                  {row.label}
                </dt>
                <dd className="flex items-center gap-2 text-xl font-extrabold tabular-nums text-[--color-ink]">
                  {row.isNew && (
                    <span className="rounded-full bg-[--color-mint] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                      New best!
                    </span>
                  )}
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>

          {bests.bestScore > 0 && !isNewBest.score && (
            <p className="mt-4 text-center text-[12px] font-semibold text-[--color-muted]">
              Best {bests.bestScore.toLocaleString()}
            </p>
          )}

          {/* CTA */}
          <button
            type="button"
            onClick={onPlayAgain}
            className="relative mt-6 w-full overflow-hidden rounded-card py-3.5 text-base font-extrabold tracking-wide text-white transition-transform active:scale-[0.98]"
            style={{
              background:
                "linear-gradient(140deg,var(--color-accent) 0%,var(--color-cyan) 140%)",
              boxShadow: "var(--glow-accent)",
            }}
          >
            Play again
          </button>
        </div>
      </div>
    </div>
  );
}
