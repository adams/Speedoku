"use client";

export function GiveUpButton({ onGiveUp }: { onGiveUp: () => void }) {
  return (
    <button
      type="button"
      onClick={onGiveUp}
      className="w-full rounded-[--radius-card] border border-[--color-line] py-2 text-sm font-semibold text-[--color-muted] transition-colors hover:text-[--color-ink]"
    >
      Give up — end today&apos;s run
    </button>
  );
}
