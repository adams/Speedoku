import { mulberry32 } from "@/lib/engine/rng";
import { seedFromDate } from "./seed";
import type { LeaderboardEntry, LeaderboardService } from "./types";

// A small curated, safe name pool for v1's mock competitors.
const NAMES = [
  "Nova",
  "Pixel",
  "Sage",
  "Echo",
  "Riff",
  "Juno",
  "Atlas",
  "Wren",
  "Koda",
  "Lyric",
  "Bolt",
  "Vesper",
  "Onyx",
  "Indie",
  "Cleo",
  "Dash",
];

export function createMockLeaderboard(): LeaderboardService {
  return {
    async getDaily(date, me) {
      // Perturb the puzzle seed so competitors don't correlate with the board.
      const rng = mulberry32((seedFromDate(date) ^ 0x9e3779b9) >>> 0);
      const names = NAMES.slice();
      const fakes: LeaderboardEntry[] = [];
      for (let i = 0; i < 9; i++) {
        // Plausible spread: depth 3–16, score scales with depth + noise.
        const depth = 3 + Math.floor(rng() * 14);
        const score = Math.round(depth * 480 + rng() * 1400);
        const timeMs = Math.round((40 + rng() * 200) * 1000);
        const idx = Math.floor(rng() * names.length);
        const [name] = names.splice(idx, 1); // unique names
        fakes.push({ name, depth, score, timeMs });
      }
      const rows = [...fakes, { ...me, isYou: true }];
      rows.sort((a, b) => b.score - a.score);
      return rows;
    },
  };
}
