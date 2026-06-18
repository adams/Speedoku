"use client";

import { useState } from "react";

export function NameEntry({
  initialName,
  onSubmit,
}: {
  initialName?: string;
  onSubmit: (name: string) => Promise<boolean>;
}) {
  const [name, setName] = useState(initialName ?? "");
  const [error, setError] = useState(false);
  const [saved, setSaved] = useState(false);

  const submit = async () => {
    setError(false);
    const ok = await onSubmit(name);
    if (ok) {
      setSaved(true);
    } else {
      setError(true);
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
        Add a name for the leaderboard (optional)
      </p>
      <div className="flex gap-2">
        <input
          type="text"
          value={name}
          maxLength={20}
          onChange={(e) => {
            setName(e.target.value);
            setSaved(false);
          }}
          placeholder="You"
          className="flex-1 rounded-card border border-line bg-cell px-3 py-2 text-sm text-ink outline-none focus:border-accent"
        />
        <button
          type="button"
          onClick={submit}
          className="rounded-card bg-accent px-4 py-2 text-sm font-bold text-white shadow-[var(--glow-accent)]"
        >
          Save
        </button>
      </div>
      {error && (
        <p className="text-[12px] font-semibold text-accent">
          Pick another name.
        </p>
      )}
      {saved && <p className="text-[12px] font-semibold text-cyan">Saved!</p>}
    </div>
  );
}
