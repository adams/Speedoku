"use client";

import { Leaderboard } from "@/components/daily/Leaderboard";
import { NameEntry } from "@/components/daily/NameEntry";
import { NextDailyNote } from "@/components/daily/NextDailyNote";
import { ShareCard } from "@/components/daily/ShareCard";
import { nextDateString } from "@/lib/daily/date";
import { formatShareCard } from "@/lib/daily/shareCard";
import type { LeaderboardEntry, StreakState } from "@/lib/daily/types";
import type { RunSummary } from "@/lib/run/types";
import { mmss } from "@/lib/ui/format";

export function DailyResult({
  dateStr,
  summary,
  streak,
  leaderboard,
  rank,
  profileName,
  onSubmitName,
}: {
  dateStr: string;
  summary: RunSummary;
  streak: StreakState;
  leaderboard: LeaderboardEntry[];
  rank: number;
  profileName?: string;
  onSubmitName: (name: string) => Promise<boolean>;
}) {
  const shareText = formatShareCard({
    dateStr,
    depth: summary.depth,
    score: summary.score,
    timeMs: summary.totalMs,
    streak: streak.currentStreak,
    rank,
  });

  return (
    <div className="flex w-full max-w-md flex-col gap-5 rounded-[--radius-card] border border-[--color-line] bg-[--color-cell] p-5 shadow-[0_8px_30px_-12px_rgba(23,26,43,0.18)]">
      <header className="text-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[--color-cyan]">
          Daily complete · {dateStr}
        </p>
        <p className="mt-1 text-sm font-semibold text-[--color-accent]">
          🔥 {streak.currentStreak}-day streak
          <span className="text-[--color-muted]">
            {" "}
            · best {streak.bestStreak}
          </span>
        </p>
      </header>

      <dl className="grid grid-cols-3 gap-2 text-center">
        {[
          ["Depth", String(summary.depth)],
          ["Score", summary.score.toLocaleString("en-US")],
          ["Time", mmss(summary.totalMs)],
        ].map(([label, value]) => (
          <div key={label} className="rounded-md bg-[--color-cell-given] py-2">
            <dt className="text-[10px] font-bold uppercase tracking-wide text-[--color-muted]">
              {label}
            </dt>
            <dd className="text-lg font-extrabold tabular-nums text-[--color-ink]">
              {value}
            </dd>
          </div>
        ))}
      </dl>

      <section className="flex flex-col gap-2">
        <p className="text-[11px] font-bold uppercase tracking-wide text-[--color-muted]">
          Today&apos;s leaderboard · you&apos;re #{rank}
        </p>
        <Leaderboard entries={leaderboard} />
      </section>

      <NameEntry initialName={profileName} onSubmit={onSubmitName} />
      <ShareCard text={shareText} />
      <NextDailyNote nextDate={nextDateString(dateStr)} />
    </div>
  );
}
