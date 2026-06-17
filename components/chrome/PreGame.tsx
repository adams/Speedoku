"use client";

export function PreGame({ onStart }: { onStart: () => void }) {
  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-10 bg-[--color-board]/85 backdrop-blur-md">
      {/* Wordmark */}
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-6xl font-extrabold tracking-[-0.03em] leading-none select-none">
          <span
            style={{
              background:
                "linear-gradient(110deg,var(--color-accent) 0%,var(--color-cyan) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Speed
          </span>
          <span style={{ color: "var(--color-ink)" }}>oku</span>
        </h1>
        <p className="text-sm font-semibold tracking-[0.18em] uppercase text-[--color-muted]">
          Speed · Depth · Score
        </p>
      </div>

      {/* CTA */}
      <button
        type="button"
        onClick={onStart}
        className="relative overflow-hidden rounded-card px-10 py-4 text-lg font-extrabold tracking-wide text-white transition-transform active:scale-95"
        style={{
          background:
            "linear-gradient(140deg,var(--color-accent) 0%,var(--color-cyan) 140%)",
          boxShadow: "var(--glow-accent)",
        }}
      >
        {/* shimmer sweep */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(105deg,transparent 40%,rgba(255,255,255,0.18) 50%,transparent 60%)",
            animation: "shimmer 2.6s ease-in-out infinite",
          }}
        />
        Start Run
      </button>

      <style>{`
        @keyframes shimmer {
          0%   { transform: translateX(-100%); }
          60%  { transform: translateX(100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
