import type { RunSummary } from "@/lib/run/types";
import { previousDateString } from "./date";
import { isAllowedName } from "./profanity";
import type {
  DailyRecord,
  DailyService,
  PlayerProfile,
  StreakState,
} from "./types";

const dailyKey = (date: string) => `speedoku:v1:daily:${date}`;
const STREAK_KEY = "speedoku:v1:streak";
const PLAYER_KEY = "speedoku:v1:player";

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return fallback;
    return parsed as T;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full / unavailable — best-effort */
  }
}

function readStreak(): StreakState {
  const s = read<Partial<StreakState>>(STREAK_KEY, {});
  return {
    lastDailyDate: typeof s.lastDailyDate === "string" ? s.lastDailyDate : null,
    currentStreak: typeof s.currentStreak === "number" ? s.currentStreak : 0,
    bestStreak: typeof s.bestStreak === "number" ? s.bestStreak : 0,
  };
}

function readRecord(date: string): DailyRecord | null {
  const r = read<Partial<DailyRecord> | null>(dailyKey(date), null);
  if (!r || typeof r !== "object") return null;
  if (r.status !== "inProgress" && r.status !== "final") return null;
  return {
    date,
    status: r.status,
    score: typeof r.score === "number" ? r.score : 0,
    depth: typeof r.depth === "number" ? r.depth : 0,
    fastestSolveMs:
      typeof r.fastestSolveMs === "number" ? r.fastestSolveMs : null,
    name: typeof r.name === "string" ? r.name : undefined,
  };
}

function readProfile(): PlayerProfile {
  const p = read<Partial<PlayerProfile>>(PLAYER_KEY, {});
  return { name: typeof p.name === "string" ? p.name : undefined };
}

export function createLocalDailyService(): DailyService {
  return {
    async getToday(date) {
      return readRecord(date);
    },

    async startAttempt(date) {
      const existing = readRecord(date);
      if (existing) {
        // Day already consumed — idempotent, no streak change.
        return { record: existing, streak: readStreak() };
      }
      const prev = readStreak();
      let currentStreak: number;
      if (prev.lastDailyDate === date) {
        currentStreak = prev.currentStreak; // defensive: no record but same date
      } else if (prev.lastDailyDate === previousDateString(date)) {
        currentStreak = prev.currentStreak + 1;
      } else {
        currentStreak = 1;
      }
      const streak: StreakState = {
        lastDailyDate: date,
        currentStreak,
        bestStreak: Math.max(prev.bestStreak, currentStreak),
      };
      write(STREAK_KEY, streak);
      const record: DailyRecord = {
        date,
        status: "inProgress",
        score: 0,
        depth: 0,
        fastestSolveMs: null,
        name: readProfile().name,
      };
      write(dailyKey(date), record);
      return { record, streak };
    },

    async finalizeAttempt(date, summary: RunSummary) {
      const existing = readRecord(date);
      if (existing?.status === "final") return existing; // idempotent
      const record: DailyRecord = {
        date,
        status: "final",
        score: summary.score,
        depth: summary.depth,
        fastestSolveMs: summary.fastestSolveMs,
        name: existing?.name ?? readProfile().name,
      };
      write(dailyKey(date), record);
      return record;
    },

    async getStreak() {
      return readStreak();
    },

    async getProfile() {
      return readProfile();
    },

    async setName(name, date) {
      if (!isAllowedName(name)) return readProfile();
      const profile: PlayerProfile = { name: name.trim() };
      write(PLAYER_KEY, profile);
      const rec = readRecord(date);
      if (rec) write(dailyKey(date), { ...rec, name: profile.name });
      return profile;
    },
  };
}
