"use client";

import { useMemo, useState } from "react";
import { Board } from "@/components/board/Board";
import { PreGame } from "@/components/chrome/PreGame";
import { RunOver } from "@/components/chrome/RunOver";
import { Hud } from "@/components/hud/Hud";
import { NumberPad } from "@/components/number-pad/NumberPad";
import type { BankFile } from "@/lib/engine/banks";
import bank from "@/lib/engine/banks/banks.fixture.json";
import { useInputController } from "@/lib/input/useInputController";
import { summarize } from "@/lib/run/reduce";
import { createRunStore } from "@/lib/run/store";
import { useRunSelector } from "@/lib/run/useRunStore";

export default function PlayPage() {
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 1e9));
  const [phase, setPhase] = useState<"pre" | "run">("pre");
  const store = useMemo(
    () => createRunStore(bank as BankFile, { seed, mode: "hints-on" }),
    [seed],
  );

  const grid = useRunSelector(store, (s) => s.state.grid);
  const activeDigit = useRunSelector(store, (s) => s.state.activeDigit);
  const activeCell = useRunSelector(store, (s) => s.state.activeCell);
  const status = useRunSelector(store, (s) => s.state.status);
  const { onDigit, onSelectCell } = useInputController(store);

  const playAgain = () => {
    setSeed(Math.floor(Math.random() * 1e9));
    setPhase("run");
  };

  return (
    <>
      {/* ── Mobile-only header ─────────────────────────────────────── */}
      <header className="lg:hidden flex items-center justify-between px-4 pt-4 pb-1">
        <span className="text-xl font-extrabold tracking-[-0.02em] select-none leading-none">
          <span
            style={{
              background:
                "linear-gradient(110deg,var(--color-accent) 0%,var(--color-cyan) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Speed
          </span>
          <span style={{ color: "var(--color-ink)" }}>oku</span>
        </span>
        <span className="rounded-full bg-[--color-accent] px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white shadow-[var(--glow-accent)]">
          hints
        </span>
      </header>

      {/* ── Main layout: single column on mobile, sidebar on desktop ── */}
      <main className="relative flex flex-1 flex-col lg:flex-row lg:items-start lg:gap-6 lg:p-6 lg:max-w-[1100px] lg:mx-auto lg:w-full">
        {/* ── Board column ─────────────────────────────────────────── */}
        <div className="flex flex-col gap-3 px-3 pb-3 pt-1 lg:px-0 lg:pt-0 lg:flex-1 lg:min-w-0">
          {/* Single HUD — visible on both breakpoints; sidebar picks it up via order */}
          <Hud store={store} />

          <Board
            grid={grid}
            activeDigit={activeDigit}
            activeCell={activeCell}
            onSelectCell={onSelectCell}
          />

          <NumberPad grid={grid} activeDigit={activeDigit} onDigit={onDigit} />

          <p className="text-center text-[13px] font-semibold text-muted pb-2 lg:hidden">
            Tap a number to aim · tap it again to place
          </p>
          <p className="hidden lg:block text-center text-[13px] font-semibold text-muted pb-2">
            Click a number to aim · click it again (or Enter) to place · arrows
            move within candidates · Tab jumps cells
          </p>
        </div>

        {/* ── Desktop sidebar ──────────────────────────────────────── */}
        <aside className="hidden lg:flex lg:flex-col lg:gap-4 lg:w-[240px] lg:shrink-0 lg:sticky lg:top-6">
          {/* Wordmark */}
          <div className="mb-1">
            <span className="text-2xl font-extrabold tracking-[-0.02em] select-none leading-none">
              <span
                style={{
                  background:
                    "linear-gradient(110deg,var(--color-accent) 0%,var(--color-cyan) 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Speed
              </span>
              <span style={{ color: "var(--color-ink)" }}>oku</span>
            </span>
          </div>

          {/* Controls guide */}
          <div
            className="rounded-[--radius-card] bg-[--color-cell] p-4 shadow-[0_2px_12px_rgba(0,0,0,0.06)]"
            style={{ border: "1px solid var(--color-line)" }}
          >
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.14em] text-[--color-muted]">
              Controls
            </p>
            <dl className="flex flex-col gap-2">
              {[
                ["Select / place", "1–9"],
                ["Move in candidates", "← ↑ → ↓"],
                ["Next empty cell", "Tab"],
                ["Place at cursor", "Enter"],
              ].map(([label, keys]) => (
                <div
                  key={label}
                  className="flex items-center justify-between gap-2"
                >
                  <dt className="text-[12px] text-[--color-muted] leading-none">
                    {label}
                  </dt>
                  <dd className="shrink-0 rounded-md bg-[--color-cell-given] px-2 py-0.5 text-[11px] font-bold tabular-nums text-[--color-ink] leading-none">
                    {keys}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </aside>

        {/* ── Overlays ─────────────────────────────────────────────── */}
        {phase === "pre" && <PreGame onStart={() => setPhase("run")} />}
        {status === "runOver" && (
          <RunOver
            summary={summarize(store.getState().state)}
            onPlayAgain={playAgain}
          />
        )}
      </main>
    </>
  );
}
