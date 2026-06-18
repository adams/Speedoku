// v1 client-side seam only. Real, server-side moderation arrives with the
// Phase 3 online leaderboard (names aren't public until then).
const BANNED = ["fuck", "shit", "bitch", "cunt", "nigg", "fag", "rape"];

export function isAllowedName(name: string): boolean {
  const trimmed = name.trim();
  if (trimmed.length < 1 || trimmed.length > 20) return false;
  const lower = trimmed.toLowerCase();
  return !BANNED.some((bad) => lower.includes(bad));
}
