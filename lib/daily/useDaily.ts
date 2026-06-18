"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { RunSummary } from "@/lib/run/types";
import type {
  DailyRecord,
  DailyService,
  LeaderboardEntry,
  LeaderboardService,
  PlayerProfile,
  StreakState,
} from "./types";
import { EMPTY_STREAK } from "./types";

export function useDaily(
  dailyService: DailyService,
  leaderboardService: LeaderboardService,
  date: string,
) {
  const [loaded, setLoaded] = useState(false);
  const [record, setRecord] = useState<DailyRecord | null>(null);
  const [streak, setStreak] = useState<StreakState>(EMPTY_STREAK);
  const [profile, setProfile] = useState<PlayerProfile>({});
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  // Store services in refs so their identity changes don't re-trigger effects.
  // In production the services are stable; in tests they may be re-created per render.
  const dailyRef = useRef(dailyService);
  dailyRef.current = dailyService;
  const leaderboardRef = useRef(leaderboardService);
  leaderboardRef.current = leaderboardService;

  useEffect(() => {
    let alive = true;
    Promise.all([
      dailyRef.current.getToday(date),
      dailyRef.current.getStreak(),
      dailyRef.current.getProfile(),
    ]).then(([r, s, p]) => {
      if (!alive) return;
      setRecord(r);
      setStreak(s);
      setProfile(p);
      setLoaded(true);
    });
    return () => {
      alive = false;
    };
  }, [date]);

  const loadLeaderboard = useCallback(
    async (r: DailyRecord) => {
      const me: LeaderboardEntry = {
        name: r.name ?? "You",
        depth: r.depth,
        score: r.score,
        timeMs: 0, // totalMs isn't on the record; share card uses the summary
        isYou: true,
      };
      const rows = await leaderboardRef.current.getDaily(date, me);
      setLeaderboard(rows);
    },
    [date],
  );

  const start = useCallback(async () => {
    const { record: r, streak: s } = await dailyRef.current.startAttempt(date);
    setRecord(r);
    setStreak(s);
  }, [date]);

  const finalize = useCallback(
    async (summary: RunSummary) => {
      const r = await dailyRef.current.finalizeAttempt(date, summary);
      setRecord(r);
      // The record lacks totalMs; carry it onto the "me" entry via the summary.
      const me: LeaderboardEntry = {
        name: r.name ?? "You",
        depth: r.depth,
        score: r.score,
        timeMs: summary.totalMs,
        isYou: true,
      };
      setLeaderboard(await leaderboardRef.current.getDaily(date, me));
    },
    [date],
  );

  const saveName = useCallback(
    async (name: string): Promise<boolean> => {
      const p = await dailyRef.current.setName(name, date);
      setProfile(p);
      const r = await dailyRef.current.getToday(date);
      setRecord(r);
      if (r) {
        // Re-rank with the new name; read leaderboard via functional setter to avoid stale closure.
        setLeaderboard((prev) => {
          const timeMs = prev.find((e) => e.isYou)?.timeMs ?? 0;
          const me: LeaderboardEntry = {
            name: r.name ?? "You",
            depth: r.depth,
            score: r.score,
            timeMs,
            isYou: true,
          };
          // Kick off the async refresh; return prev unchanged for now.
          leaderboardRef.current.getDaily(date, me).then(setLeaderboard);
          return prev;
        });
      }
      return p.name === name.trim() && name.trim() !== "";
    },
    [date],
  );

  const rank = useMemo(() => {
    const i = leaderboard.findIndex((e) => e.isYou);
    return i === -1 ? 0 : i + 1;
  }, [leaderboard]);

  // loadLeaderboard is exported for Task 10 — used when revisiting an already-consumed day.
  return {
    loaded,
    record,
    streak,
    profile,
    leaderboard,
    rank,
    start,
    finalize,
    saveName,
    loadLeaderboard,
  };
}
