"use client";

import type { LeaderboardEntry } from "@/lib/daily/types";
import { mmss } from "@/lib/ui/format";

export function Leaderboard({ entries }: { entries: LeaderboardEntry[] }) {
  return (
    <ol className="flex flex-col gap-1">
      {entries.map((e, i) => (
        <li
          // biome-ignore lint/suspicious/noArrayIndexKey: leaderboard entries have no stable ID; name+index is safe for a static display list
          key={`${e.name}-${i}`}
          data-testid={e.isYou ? "lb-you" : undefined}
          className={`flex items-center justify-between rounded-md px-3 py-1.5 text-[13px] ${
            e.isYou
              ? "bg-[--color-accent] font-bold text-white"
              : "bg-[--color-cell] text-[--color-ink]"
          }`}
        >
          <span className="flex items-center gap-2">
            <span className="tabular-nums opacity-70">{i + 1}</span>
            <span>{e.name}</span>
          </span>
          <span className="flex items-center gap-3 tabular-nums">
            <span>D{e.depth}</span>
            <span>{e.score.toLocaleString("en-US")}</span>
            <span className="opacity-70">{mmss(e.timeMs)}</span>
          </span>
        </li>
      ))}
    </ol>
  );
}
