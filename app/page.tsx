import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-10 p-8 text-center">
      {/* Wordmark */}
      <div className="flex flex-col items-center gap-3">
        <h1 className="text-[clamp(52px,14vw,80px)] font-extrabold tracking-[-0.03em] leading-none select-none">
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
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[--color-muted]">
          Speed · Depth · Score
        </p>
      </div>

      <p className="max-w-[300px] text-lg leading-relaxed text-[--color-muted]">
        A speed-first, roguelike Sudoku.{" "}
        <span className="font-semibold text-[--color-ink]">
          One wrong move can corner you.
        </span>
      </p>

      {/* Feature pills */}
      <div className="flex flex-wrap justify-center gap-2">
        {["Hints on", "Forced singles", "Depth scoring", "Roguelike"].map(
          (tag) => (
            <span
              key={tag}
              className="rounded-full px-3 py-1 text-[12px] font-semibold text-[--color-muted]"
              style={{
                background: "var(--color-cell)",
                border: "1px solid var(--color-line)",
              }}
            >
              {tag}
            </span>
          ),
        )}
      </div>

      {/* CTA */}
      <Link
        href="/play"
        className="relative overflow-hidden rounded-card px-12 py-4 text-xl font-extrabold tracking-wide text-white transition-transform active:scale-95"
        style={{
          background:
            "linear-gradient(140deg,var(--color-accent) 0%,var(--color-cyan) 140%)",
          boxShadow: "var(--glow-accent)",
        }}
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(105deg,transparent 40%,rgba(255,255,255,0.18) 50%,transparent 60%)",
            animation: "shimmer 2.6s ease-in-out infinite",
          }}
        />
        Play
      </Link>

      <style>{`
        @keyframes shimmer {
          0%   { transform: translateX(-100%); }
          60%  { transform: translateX(100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </main>
  );
}
