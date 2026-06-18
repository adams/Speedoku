"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Board } from "@/components/board/Board";
import { DailyGate } from "@/components/daily/DailyGate";
import { DailyResult } from "@/components/daily/DailyResult";
import { GiveUpButton } from "@/components/daily/GiveUpButton";
import { Hud } from "@/components/hud/Hud";
import { NumberPad } from "@/components/number-pad/NumberPad";
import { dailyDateString } from "@/lib/daily/date";
import { createLocalDailyService } from "@/lib/daily/localDailyService";
import { createMockLeaderboard } from "@/lib/daily/mockLeaderboard";
import { seedFromDate } from "@/lib/daily/seed";
import { useDaily } from "@/lib/daily/useDaily";
import type { BankFile } from "@/lib/engine/banks";
import bank from "@/lib/engine/banks/banks.fixture.json";
import { useInputController } from "@/lib/input/useInputController";
import { summarize } from "@/lib/run/reduce";
import { createRunStore } from "@/lib/run/store";
import { useRunSelector } from "@/lib/run/useRunStore";
import { useDepthTransition } from "@/lib/ui/useDepthTransition";

type Phase = "gate" | "run" | "result";

export default function DailyPage() {
  // SSR-safe deterministic seed: placeholder on the server + first client render,
  // real PT date/seed picked after mount (behind the gate overlay, no flash).
  const [date, setDate] = useState("");
  const [seed, setSeed] = useState(0);
  const [phase, setPhase] = useState<Phase>("gate");

  useEffect(() => {
    const d = dailyDateString();
    setDate(d);
    setSeed(seedFromDate(d));
  }, []);

  const dailyService = useMemo(() => createLocalDailyService(), []);
  const leaderboardService = useMemo(() => createMockLeaderboard(), []);
  const daily = useDaily(dailyService, leaderboardService, date || "pending");

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

  // After load, if today is already consumed, jump straight to the result.
  const routedConsumed = useRef(false);
  // biome-ignore lint/correctness/useExhaustiveDependencies: loadLeaderboard identity is stable (useCallback with date dep); listing it would cause spurious re-runs if the ref changes
  useEffect(() => {
    if (!daily.loaded || !date || routedConsumed.current) return;
    if (
      daily.record?.status === "final" ||
      daily.record?.status === "inProgress"
    ) {
      routedConsumed.current = true;
      daily.loadLeaderboard(daily.record).then(() => setPhase("result"));
    }
  }, [daily.loaded, daily.record, date]);

  // Start depth 1's clock when the run begins.
  useEffect(() => {
    if (phase === "run") store.getState().dispatch({ type: "startRun" });
  }, [phase, store]);

  // Finalize exactly once on death.
  const finalizedFor = useRef<typeof store | null>(null);
  // biome-ignore lint/correctness/useExhaustiveDependencies: finalize identity is stable (useCallback with date dep); listing it would cause spurious double-finalize on re-renders
  useEffect(() => {
    if (status === "runOver" && finalizedFor.current !== store) {
      finalizedFor.current = store;
      daily
        .finalize(summarize(store.getState().state))
        .then(() => setPhase("result"));
    }
  }, [status, store]);

  const onStart = async () => {
    await daily.start();
    setPhase("run");
  };

  const onGiveUp = () => {
    if (finalizedFor.current === store) return;
    finalizedFor.current = store;
    daily
      .finalize(summarize(store.getState().state))
      .then(() => setPhase("result"));
  };

  return (
    <main className="relative flex flex-1 flex-col items-center gap-5 px-4 pt-3 pb-8">
      <div
        className="flex flex-col gap-3"
        style={{ width: "min(540px, 90vmin, 54vh)" }}
      >
        {phase === "result" && daily.record ? (
          <DailyResult
            dateStr={date}
            summary={summarize(store.getState().state)}
            streak={daily.streak}
            leaderboard={daily.leaderboard}
            rank={daily.rank}
            profileName={daily.profile.name}
            onSubmitName={daily.saveName}
          />
        ) : (
          <>
            <Hud store={store} bests={undefined} />
            <div className="board-stage relative">
              <Board
                grid={t.displayGrid}
                activeDigit={activeDigit}
                activeCell={activeCell}
                onSelectCell={onSelectCell}
                bloom={t.phase === "exit"}
              />
            </div>
            <NumberPad
              grid={grid}
              activeDigit={activeDigit}
              onDigit={onDigit}
            />
            <button
              type="button"
              onClick={onSubmit}
              onMouseDown={(e) => e.preventDefault()}
              disabled={status !== "playing" || activeCell == null}
              className="relative w-full overflow-hidden rounded-[--radius-card] py-3.5 text-base font-extrabold tracking-wide text-white transition-transform active:scale-[0.98] disabled:opacity-40"
              style={{
                background:
                  "linear-gradient(140deg,var(--color-accent) 0%,var(--color-cyan) 140%)",
                boxShadow: "var(--glow-accent)",
              }}
            >
              Submit
            </button>
            {phase === "run" && <GiveUpButton onGiveUp={onGiveUp} />}
          </>
        )}
        {phase === "gate" && <DailyGate dateStr={date} onStart={onStart} />}
      </div>
    </main>
  );
}
