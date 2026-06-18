"use client";

export function DailyGate({
  dateStr,
  onStart,
}: {
  dateStr: string;
  onStart: () => void;
}) {
  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-bg/90 p-6 text-center backdrop-blur-sm">
      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-cyan">
        Daily Challenge
      </p>
      <h2 className="text-2xl font-extrabold text-ink">{dateStr}</h2>
      <p className="max-w-xs text-sm text-muted">
        Everyone plays the same descent today. One attempt per day — no
        restarts.
      </p>
      <button
        type="button"
        onClick={onStart}
        className="rounded-card px-8 py-3 text-base font-extrabold text-white"
        style={{
          background:
            "linear-gradient(140deg,var(--color-accent) 0%,var(--color-cyan) 140%)",
          boxShadow: "var(--glow-accent)",
        }}
      >
        Start today&apos;s daily
      </button>
    </div>
  );
}
