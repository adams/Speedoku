"use client";

export interface CellProps {
  value: number;
  given: boolean;
  candidates: number[];
  activeDigit: number | null;
  legalForActive: boolean;
  isCursor: boolean;
  digitComplete: boolean;
  onSelect: () => void;
  boxClasses?: string;
}

export function Cell(props: CellProps) {
  const {
    value,
    given,
    candidates,
    activeDigit,
    legalForActive,
    isCursor,
    digitComplete,
    onSelect,
    boxClasses = "",
  } = props;

  const state =
    value === 0
      ? "empty"
      : digitComplete
        ? "done"
        : given
          ? "given"
          : "entered";

  // Focus Mode contrast (v1 parity): with a digit selected, dim every cell
  // that isn't a legal target, the cursor, or an existing copy of that digit —
  // so the placeable cells pop. A digit is always selected during play.
  const holdsActive = activeDigit != null && value === activeDigit;
  const dimmed =
    activeDigit != null && !legalForActive && !isCursor && !holdsActive;

  // Derive background: legal-target tint (blue = an option) > given off-white > white
  const bgStyle: React.CSSProperties = legalForActive
    ? { background: "var(--color-cyan-soft)" }
    : given && value !== 0
      ? { background: "var(--color-cell-given)" }
      : { background: "var(--color-cell)" };

  // Cursor ring + glow via box-shadow (cyan, matching the legal-option signal)
  const shadowStyle: React.CSSProperties = isCursor
    ? { boxShadow: "inset 0 0 0 2px var(--color-cyan), var(--cursor-glow)" }
    : {};

  const combinedStyle: React.CSSProperties = { ...bgStyle, ...shadowStyle };

  // Build className string
  const cls = [
    // layout & base
    "relative flex aspect-square items-center justify-center",
    "select-none outline-none transition-[opacity,background-color,color] duration-150",
    // Focus Mode: fade cells the active digit can't use
    dimmed ? "opacity-30" : "",
    // cursor gets rounded corners and stacks above siblings
    isCursor ? "z-10 rounded-[var(--radius-cell)]" : "",
    // box divider classes injected by Board
    boxClasses,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type="button"
      onClick={onSelect}
      data-state={state}
      data-cursor={isCursor ? "true" : "false"}
      data-legal={legalForActive ? "true" : "false"}
      data-done={digitComplete ? "true" : "false"}
      className={cls}
      style={combinedStyle}
    >
      {value !== 0 ? (
        /* ── Filled cell ─────────────────────────────────────────────── */
        <span
          className={[
            // size scales with cell: clamp between mobile min and desktop max
            "text-[clamp(16px,4.2vw,26px)] leading-none tabular-nums",
            state === "given"
              ? // Given clues: heavy ink, slightly larger optical presence
                "font-extrabold text-[var(--color-ink)]"
              : state === "done"
                ? // Completed digit: mint, extrabold celebration
                  "font-extrabold text-[var(--color-mint)]"
                : // Player-entered: cyan, semibold (visually subordinate to givens)
                  "font-semibold text-[var(--color-entered)]",
          ].join(" ")}
        >
          {value}
        </span>
      ) : (
        /* ── Empty cell: 3×3 candidate pencil-mark grid ─────────────── */
        <span
          aria-hidden="true"
          className="absolute inset-0 grid grid-cols-3 grid-rows-3 p-[3px]"
        >
          {Array.from({ length: 9 }, (_, k) => {
            const d = k + 1;
            const show = candidates.includes(d);
            // Highlight the active digit's position when this cell is a legal target
            const highlighted = show && d === activeDigit && legalForActive;
            return (
              <span
                key={d}
                className={[
                  "flex items-center justify-center",
                  // slightly larger hit for the highlighted mark
                  highlighted
                    ? "text-[10px] font-extrabold leading-none text-[var(--color-entered)]"
                    : "text-[8px] font-semibold leading-none text-[var(--color-cand)]",
                ].join(" ")}
              >
                {show ? d : ""}
              </span>
            );
          })}
        </span>
      )}
    </button>
  );
}
