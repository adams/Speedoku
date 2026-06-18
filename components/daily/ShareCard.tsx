"use client";

import { useState } from "react";

export function ShareCard({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable — the text is still visible to select/copy */
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <pre className="whitespace-pre-wrap rounded-[--radius-card] border border-[--color-line] bg-[--color-cell] p-3 text-[13px] leading-relaxed text-[--color-ink]">
        {text}
      </pre>
      <button
        type="button"
        onClick={copy}
        className="rounded-[--radius-card] py-2.5 text-sm font-bold text-white"
        style={{
          background:
            "linear-gradient(140deg,var(--color-accent) 0%,var(--color-cyan) 140%)",
          boxShadow: "var(--glow-accent)",
        }}
      >
        {copied ? "Copied!" : "Copy result"}
      </button>
    </div>
  );
}
