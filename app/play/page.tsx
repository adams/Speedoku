"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Board } from "@/components/board/Board";
import { PreGame } from "@/components/chrome/PreGame";
import { RunOver } from "@/components/chrome/RunOver";
import { Hud } from "@/components/hud/Hud";
import { NumberPad } from "@/components/number-pad/NumberPad";
import { createLocalAdapter } from "@/lib/data/localAdapter";
import type { NewBest } from "@/lib/data/types";
import type { BankFile } from "@/lib/engine/banks";
import bank from "@/lib/engine/banks/banks.fixture.json";
import { useInputController } from "@/lib/input/useInputController";
import { summarize } from "@/lib/run/reduce";
import { createRunStore } from "@/lib/run/store";
import { usePersistence } from "@/lib/run/usePersistence";
import { useRunSelector } from "@/lib/run/useRunStore";
import { useDepthTransition } from "@/lib/ui/useDepthTransition";

export default function PlayPage() {
  // The seed must be identical on the server and on the first client render, or
  // hydration mismatches (the SSR puzzle differs from the client puzzle). So we
  // start from a fixed seed and pick the real random one after mount — the swap
  // happens behind the PreGame overlay, before the player hits Start, so there's
  // no visible flash. (Using `useState(() => Math.random())` runs on both the
  // server and the client and diverges → the data-state hydration error.)
  const [seed, setSeed] = useState(0);
  const [phase, setPhase] = useState<"pre" | "run">("pre");

  useEffect(() => {
    setSeed(Math.floor(Math.random() * 1e9));
  }, []);

  const store = useMemo(
    () => createRunStore(bank as BankFile, { seed, mode: "hints-on" }),
    [seed],
  );

  const grid = useRunSelector(store, (s) => s.state.grid);
  const activeDigit = useRunSelector(store, (s) => s.state.activeDigit);
  const activeCell = useRunSelector(store, (s) => s.state.activeCell);
  const status = useRunSelector(store, (s) => s.state.status);
  const t = useDepthTransition(
    useRunSelector(store, (s) => s.state.depth),
    grid,
  );
  const { onDigit, onSelectCell, onSubmit } = useInputController(
    store,
    t.transitioning,
  );

  const adapter = useMemo(() => createLocalAdapter(), []);
  const { bests, recordRun } = usePersistence(adapter, "hints-on");
  const [isNewBest, setIsNewBest] = useState<NewBest | null>(null);
  const recordedFor = useRef<typeof store | null>(null);

  // Reset the record-once guard + new-best flags when a fresh run starts.
  // biome-ignore lint/correctness/useExhaustiveDependencies: store is the intentional trigger (new seed → new store → reset guard)
  useEffect(() => {
    recordedFor.current = null;
    setIsNewBest(null);
  }, [store]);

  // Start depth 1's clock the moment the board is shown — on first Start and on
  // every Play-again (new store, phase already "run"). Idempotent via startRun.
  useEffect(() => {
    if (phase === "run") {
      store.getState().dispatch({ type: "startRun" });
    }
  }, [phase, store]);

  // Record the run exactly once when it ends.
  useEffect(() => {
    if (status === "runOver" && recordedFor.current !== store) {
      recordedFor.current = store;
      recordRun(summarize(store.getState().state)).then(setIsNewBest);
    }
  }, [status, store, recordRun]);

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

      {/* ── Main layout: one centered game stack + a balanced sidebar ── */}
      <main className="relative flex flex-1 flex-col items-center gap-5 px-4 pt-3 pb-8 lg:flex-row lg:items-center lg:justify-center lg:gap-12 lg:px-8 lg:py-10">
        {/* ── Game stack: HUD + board + pad all share one width ──────── */}
        <div
          className="rise flex flex-col gap-3"
          style={{ width: "min(540px, 90vmin, 54vh)" }}
        >
          <Hud store={store} bests={bests} />

          <div
            className={`board-stage relative${t.transitioning ? " is-transition" : ""}`}
          >
            <div
              className={
                t.phase === "exit"
                  ? "board-exit"
                  : t.phase === "enter"
                    ? "board-enter"
                    : ""
              }
            >
              <Board
                grid={t.displayGrid}
                activeDigit={activeDigit}
                activeCell={activeCell}
                onSelectCell={onSelectCell}
                bloom={t.phase === "exit"}
              />
            </div>
            {t.transitioning && (
              <div className="depth-stamp pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center">
                <span className="text-5xl font-extrabold tracking-tight text-[--color-ink]">
                  {t.stampDepth}
                </span>
                <span className="text-[11px] font-bold uppercase tracking-[0.24em] text-[--color-cyan]">
                  Depth ↓
                </span>
              </div>
            )}
          </div>

          <NumberPad grid={grid} activeDigit={activeDigit} onDigit={onDigit} />

          {/* Submit — the only way to place. The pad just picks the number. */}
          <button
            type="button"
            onClick={onSubmit}
            // Don't let a mouse click leave the button focused, or a later Enter
            // would fire both the button and the window handler → double-place.
            onMouseDown={(e) => e.preventDefault()}
            disabled={status !== "playing" || activeCell == null}
            className="relative w-full overflow-hidden rounded-[--radius-card] py-3.5 text-base font-extrabold tracking-wide text-white transition-transform active:scale-[0.98] disabled:opacity-40 disabled:active:scale-100"
            style={{
              background:
                "linear-gradient(140deg,var(--color-accent) 0%,var(--color-cyan) 140%)",
              boxShadow: "var(--glow-accent)",
            }}
          >
            Submit
          </button>

          <p className="text-center text-[12.5px] font-semibold text-[--color-muted] lg:hidden">
            Tap a number to aim · arrows move · Submit (or Enter) places
          </p>
        </div>

        {/* ── Desktop sidebar ──────────────────────────────────────── */}
        <aside className="rise-late hidden w-[212px] shrink-0 lg:flex lg:flex-col lg:gap-5">
          {/* Wordmark + mode badge */}
          <div className="flex items-center justify-between">
            <span className="select-none text-[27px] font-extrabold leading-none tracking-[-0.02em]">
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
            <span className="rounded-full bg-[--color-accent] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-[var(--glow-accent)]">
              hints
            </span>
          </div>

          {/* Controls guide */}
          <div
            className="relative overflow-hidden rounded-[--radius-card] bg-[--color-cell] p-4 shadow-[0_8px_30px_-12px_rgba(23,26,43,0.18)]"
            style={{ border: "1px solid var(--color-line)" }}
          >
            <span
              aria-hidden="true"
              className="absolute inset-x-0 top-0 h-[3px]"
              style={{
                background:
                  "linear-gradient(90deg,var(--color-accent),var(--color-cyan))",
              }}
            />
            <p className="mb-3 mt-0.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[--color-muted]">
              Controls
            </p>
            <dl className="flex flex-col gap-2.5">
              {[
                ["Select number", "1–9"],
                ["Move · valid cells", "← ↑ → ↓"],
                ["Skip empty cell", "Tab ⇧Tab"],
                ["Submit / place", "Enter"],
              ].map(([label, keys]) => (
                <div
                  key={label}
                  className="flex items-center justify-between gap-2"
                >
                  <dt className="text-[12px] leading-none text-[--color-muted]">
                    {label}
                  </dt>
                  <dd className="shrink-0 rounded-md border border-[--color-line] bg-[--color-cell-given] px-2 py-1 text-[11px] font-bold leading-none tabular-nums text-[--color-ink]">
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
            bests={bests}
            isNewBest={isNewBest ?? undefined}
          />
        )}
      </main>
    </>
  );
}
