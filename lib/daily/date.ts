// "Today" is the Pacific Time calendar date. Intl handles PST/PDT (DST) for us,
// so we never do a manual -8/-7 offset.
export function dailyDateString(now: Date = new Date()): string {
  // 'en-CA' formats as YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Los_Angeles",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

// Plain calendar arithmetic on a YYYY-MM-DD string. We anchor at UTC midnight so
// adding/subtracting a day never trips over a DST transition (these are pure
// calendar dates, not instants).
function shiftDate(dateStr: string, days: number): string {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function previousDateString(dateStr: string): string {
  return shiftDate(dateStr, -1);
}

export function nextDateString(dateStr: string): string {
  return shiftDate(dateStr, 1);
}
