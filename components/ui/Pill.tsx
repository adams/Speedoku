import type { ReactNode } from "react";

export interface PillProps {
  children: ReactNode;
  /** Extra classes for positioning (e.g. `absolute -top-2.5 right-4`). */
  className?: string;
}

// Small brand pill (the "HINTS" badge). White uppercase label on the coral accent.
// Uses the Tailwind v4 token utility `bg-accent` — NOT the v4-broken
// `bg-[--color-accent]` bracket form, which compiles to invalid CSS (no
// background) and is what made the badge unreadable.
export function Pill({ children, className = "" }: PillProps) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-full bg-accent px-3 py-0.5",
        "text-[11px] font-bold uppercase tracking-wide text-white",
        "shadow-[var(--glow-accent)]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </span>
  );
}
