"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { dailyDateString } from "@/lib/daily/date";
import { createLocalDailyService } from "@/lib/daily/localDailyService";
import { createMockLeaderboard } from "@/lib/daily/mockLeaderboard";
import type {
  DailyService,
  LeaderboardEntry,
  LeaderboardService,
} from "@/lib/daily/types";

type TeaserState =
  | { kind: "loading" }
  | { kind: "try" }
  | { kind: "done"; depth: number; score: number; rank: number };

export function DailyTeaser({
  dailyService,
  leaderboardService,
  now,
}: {
  dailyService?: DailyService;
  leaderboardService?: LeaderboardService;
  now?: () => Date;
} = {}) {
  const [state, setState] = useState<TeaserState>({ kind: "loading" });

  useEffect(() => {
    const ds = dailyService ?? createLocalDailyService();
    const ls = leaderboardService ?? createMockLeaderboard();
    const date = dailyDateString(now ? now() : new Date());
    let alive = true;
    ds.getToday(date).then(async (record) => {
      if (!alive) return;
      if (!record) {
        setState({ kind: "try" });
        return;
      }
      const me: LeaderboardEntry = {
        name: record.name ?? "You",
        depth: record.depth,
        score: record.score,
        timeMs: record.totalMs,
        isYou: true,
      };
      const rows = await ls.getDaily(date, me);
      if (!alive) return;
      setState({
        kind: "done",
        depth: record.depth,
        score: record.score,
        rank: rows.findIndex((r) => r.isYou) + 1,
      });
    });
    return () => {
      alive = false;
    };
  }, [dailyService, leaderboardService, now]);

  if (state.kind === "loading") return null;

  if (state.kind === "try") {
    return (
      <Link
        href="/daily"
        className="block w-full rounded-card border border-line bg-cell px-4 py-3 text-center text-sm font-bold text-cyan"
      >
        Try today&apos;s Daily Challenge →
      </Link>
    );
  }

  return (
    <Link
      href="/daily"
      className="block w-full rounded-card border border-line bg-cell px-4 py-3 text-center text-[13px] font-semibold text-ink"
    >
      <span className="text-cyan">Today&apos;s Daily ✓</span> · Depth{" "}
      {state.depth} · {state.score.toLocaleString("en-US")} pts ·{" "}
      <span className="font-extrabold text-accent">#{state.rank}</span>
    </Link>
  );
}
