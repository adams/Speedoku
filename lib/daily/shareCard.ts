import { mmss } from "@/lib/ui/format";

export const DEPTH_BAR_CAP = 12;

export interface ShareCardInput {
  dateStr: string;
  depth: number;
  score: number;
  timeMs: number;
  streak: number;
  rank: number;
  name?: string;
}

function depthBar(depth: number): string {
  const filled = Math.max(0, Math.min(depth, DEPTH_BAR_CAP));
  return "🟦".repeat(filled) + "⬜".repeat(DEPTH_BAR_CAP - filled);
}

export function formatShareCard(input: ShareCardInput): string {
  const { dateStr, depth, score, timeMs, streak, rank, name } = input;
  return [
    `🟦 Speedoku Daily · ${dateStr}${name ? ` · ${name}` : ""}`,
    `Depth ${depth} ▼  ${depthBar(depth)}`,
    `${score.toLocaleString("en-US")} pts · ${mmss(timeMs)}`,
    `🔥 ${streak}-day streak · #${rank} today`,
    "speedoku.app/daily",
  ].join("\n");
}
