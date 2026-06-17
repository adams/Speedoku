import type { Mode, RunSummary } from "@/lib/run/types";

export interface Bests {
  bestScore: number;
  deepestDepth: number;
  fastestSolveMs: number | null;
}

export interface NewBest {
  score: boolean;
  depth: boolean;
  fastest: boolean;
}

export interface DataService {
  getBests(mode: Mode): Promise<Bests>;
  saveRun(summary: RunSummary): Promise<{ bests: Bests; isNewBest: NewBest }>;
  getMode(): Promise<Mode | null>;
  setMode(mode: Mode): Promise<void>;
}

export const EMPTY_BESTS: Bests = {
  bestScore: 0,
  deepestDepth: 0,
  fastestSolveMs: null,
};
