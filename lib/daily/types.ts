import type { RunSummary } from "@/lib/run/types";

export type DailyStatus = "inProgress" | "final";

export interface DailyRecord {
  date: string; // PT YYYY-MM-DD
  status: DailyStatus;
  score: number;
  depth: number;
  fastestSolveMs: number | null;
  totalMs: number;
  name?: string;
}

export interface StreakState {
  lastDailyDate: string | null;
  currentStreak: number;
  bestStreak: number;
}

export interface PlayerProfile {
  name?: string;
}

export interface LeaderboardEntry {
  name: string;
  depth: number;
  score: number;
  timeMs: number;
  isYou?: boolean;
}

export interface DailyService {
  getToday(date: string): Promise<DailyRecord | null>;
  startAttempt(
    date: string,
  ): Promise<{ record: DailyRecord; streak: StreakState }>;
  finalizeAttempt(date: string, summary: RunSummary): Promise<DailyRecord>;
  getStreak(): Promise<StreakState>;
  getProfile(): Promise<PlayerProfile>;
  setName(name: string, date: string): Promise<PlayerProfile>;
}

export interface LeaderboardService {
  getDaily(date: string, me: LeaderboardEntry): Promise<LeaderboardEntry[]>;
}

export const EMPTY_STREAK: StreakState = {
  lastDailyDate: null,
  currentStreak: 0,
  bestStreak: 0,
};
