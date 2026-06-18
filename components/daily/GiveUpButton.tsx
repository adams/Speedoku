"use client";

export function GiveUpButton({ onGiveUp }: { onGiveUp: () => void }) {
  return (
    <button
      type="button"
      onClick={onGiveUp}
      className="w-full rounded-card border border-line py-2 text-sm font-semibold text-muted transition-colors hover:text-ink"
    >
      Give up — end today&apos;s run
    </button>
  );
}
