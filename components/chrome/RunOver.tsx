"use client";

import Link from "next/link";
import { useEffect } from "react";
import { DailyTeaser } from "@/components/daily/DailyTeaser";
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
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-board/85 backdrop-blur-md">
      <div
        className="w-[320px] overflow-hidden rounded-card bg-cell shadow-[0_8px_40px_rgba(0,0,0,0.14)]"
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
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted">
              Run complete
            </p>
            <h2 className="mt-0.5 text-2xl font-extrabold tracking-tight text-ink">
              Run over
            </h2>
          </div>

          {/* Stats */}
          <dl className="flex flex-col divide-y divide-line">
            {rows.map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between py-2.5"
              >
                <dt className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted">
                  {row.label}
                </dt>
                <dd className="flex items-center gap-2 text-xl font-extrabold tabular-nums text-ink">
                  {row.isNew && (
                    <span className="rounded-full bg-mint px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                      New best!
                    </span>
                  )}
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>

          {bests.bestScore > 0 && !isNewBest.score && (
            <p className="mt-4 text-center text-[12px] font-semibold text-muted">
              Best {bests.bestScore.toLocaleString()}
            </p>
          )}

          {/* Per-level depth/speed ledger */}
          {(() => {
            const levels = summary.levels ?? [];
            if (levels.length === 0) return null;
            const totalDepth = levels.reduce((a, l) => a + l.depthPts, 0);
            const totalSpeed = levels.reduce((a, l) => a + l.speedPts, 0);
            const total = totalDepth + totalSpeed || 1;
            const depthPct = Math.round((totalDepth / total) * 100);
            const speedPct = 100 - depthPct;
            let running = 0;
            const lastIdx = levels.length - 1;
            return (
              <div className="mt-6">
                {/* Headline split */}
                <div className="mb-3">
                  <div className="flex items-baseline justify-between mb-1.5">
                    <span
                      className="text-[13px] font-extrabold tracking-tight"
                      style={{ color: "var(--color-accent)" }}
                    >
                      {depthPct}% depth
                    </span>
                    <span
                      className="text-[13px] font-extrabold tracking-tight"
                      style={{ color: "var(--color-cyan)" }}
                    >
                      {speedPct}% speed
                    </span>
                  </div>
                  {/* Proportional split bar */}
                  <div
                    className="h-[3px] w-full overflow-hidden rounded-full"
                    style={{ background: "var(--color-line)" }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.max(0, depthPct)}%`,
                        background:
                          "linear-gradient(90deg,var(--color-accent) 0%,var(--color-cyan) 200%)",
                      }}
                    />
                  </div>
                </div>

                {/* Per-level table */}
                <div
                  className="max-h-[168px] overflow-auto rounded-[6px]"
                  style={{ border: "1px solid var(--color-line)" }}
                >
                  <table className="w-full text-[11px] tabular-nums">
                    <thead>
                      <tr
                        style={{ borderBottom: "1px solid var(--color-line)" }}
                      >
                        <th
                          className="px-2.5 py-1.5 text-left text-[9px] font-bold uppercase tracking-widest"
                          style={{ color: "var(--color-muted)" }}
                        >
                          Lvl
                        </th>
                        <th
                          className="px-2.5 py-1.5 text-right text-[9px] font-bold uppercase tracking-widest"
                          style={{ color: "var(--color-accent)" }}
                        >
                          +Depth
                        </th>
                        <th
                          className="px-2.5 py-1.5 text-right text-[9px] font-bold uppercase tracking-widest"
                          style={{ color: "var(--color-cyan)" }}
                        >
                          +Speed
                        </th>
                        <th
                          className="px-2.5 py-1.5 text-right text-[9px] font-bold uppercase tracking-widest"
                          style={{ color: "var(--color-muted)" }}
                        >
                          Running
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {levels.map((l, idx) => {
                        running += l.depthPts + l.speedPts;
                        const isFinal = idx === lastIdx;
                        return (
                          <tr
                            key={l.depth}
                            style={{
                              borderTop: "1px solid var(--color-line)",
                              background: isFinal
                                ? "color-mix(in srgb, var(--color-accent) 6%, transparent)"
                                : undefined,
                            }}
                          >
                            <td
                              className="px-2.5 py-2 text-left text-[10px] font-bold uppercase tracking-wide"
                              style={{ color: "var(--color-muted)" }}
                            >
                              {l.depth}
                            </td>
                            <td
                              className="px-2.5 py-2 text-right font-bold"
                              style={{ color: "var(--color-accent)" }}
                            >
                              {l.depthPts.toLocaleString()}
                            </td>
                            <td
                              className="px-2.5 py-2 text-right font-bold"
                              style={{ color: "var(--color-cyan)" }}
                            >
                              {l.speedPts.toLocaleString()}
                            </td>
                            <td
                              className="px-2.5 py-2 text-right"
                              style={{
                                color: isFinal
                                  ? "var(--color-ink)"
                                  : "var(--color-muted)",
                                fontWeight: isFinal ? 800 : 600,
                                fontSize: isFinal ? "12px" : undefined,
                              }}
                            >
                              {running.toLocaleString()}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })()}

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

          <div className="mt-3">
            <DailyTeaser />
          </div>
          <Link
            href="/"
            className="mt-3 block text-center text-[12px] font-semibold text-muted"
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
