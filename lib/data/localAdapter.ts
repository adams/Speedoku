import type { Mode } from "@/lib/run/types";
import type { Bests, DataService, NewBest } from "./types";
import { EMPTY_BESTS } from "./types";

const bestsKey = (mode: Mode) => `speedoku:v1:bests:${mode}`;
const MODE_KEY = "speedoku:v1:mode";

function readBests(mode: Mode): Bests {
  if (typeof window === "undefined") return { ...EMPTY_BESTS };
  try {
    const raw = window.localStorage.getItem(bestsKey(mode));
    if (!raw) return { ...EMPTY_BESTS };
    const p = JSON.parse(raw) as Partial<Bests>;
    if (typeof p !== "object" || p === null) return { ...EMPTY_BESTS };
    return {
      bestScore: typeof p.bestScore === "number" ? p.bestScore : 0,
      deepestDepth: typeof p.deepestDepth === "number" ? p.deepestDepth : 0,
      fastestSolveMs:
        typeof p.fastestSolveMs === "number" ? p.fastestSolveMs : null,
    };
  } catch {
    // corrupt JSON or parse error — return defaults
    return { ...EMPTY_BESTS };
  }
}

export function createLocalAdapter(): DataService {
  return {
    async getBests(mode) {
      return readBests(mode);
    },
    async saveRun(summary) {
      const prev = readBests(summary.mode);
      const fastestPrev = prev.fastestSolveMs ?? Number.POSITIVE_INFINITY;
      const fastestNew = summary.fastestSolveMs ?? Number.POSITIVE_INFINITY;
      const minFastest = Math.min(fastestPrev, fastestNew);
      const bests: Bests = {
        bestScore: Math.max(prev.bestScore, summary.score),
        deepestDepth: Math.max(prev.deepestDepth, summary.depth),
        fastestSolveMs: Number.isFinite(minFastest) ? minFastest : null,
      };
      const isNewBest: NewBest = {
        score: summary.score > prev.bestScore,
        depth: summary.depth > prev.deepestDepth,
        fastest: fastestNew < fastestPrev,
      };
      if (typeof window !== "undefined") {
        try {
          window.localStorage.setItem(
            bestsKey(summary.mode),
            JSON.stringify(bests),
          );
        } catch {
          /* storage full / unavailable — bests are best-effort */
        }
      }
      return { bests, isNewBest };
    },
    async getMode() {
      if (typeof window === "undefined") return null;
      const v = window.localStorage.getItem(MODE_KEY);
      return v === "hints-on" || v === "hints-off" ? (v as Mode) : null;
    },
    async setMode(mode) {
      if (typeof window === "undefined") return;
      try {
        window.localStorage.setItem(MODE_KEY, mode);
      } catch {
        /* storage full / unavailable */
      }
    },
  };
}
