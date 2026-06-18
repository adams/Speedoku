"use client";

export function NextDailyNote({ nextDate }: { nextDate: string }) {
  return (
    <p className="text-center text-[12.5px] font-semibold text-[--color-muted]">
      New puzzle {nextDate} · come back tomorrow
    </p>
  );
}
