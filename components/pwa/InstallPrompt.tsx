// components/pwa/InstallPrompt.tsx
"use client";
import { useEffect, useState } from "react";
import { isIosSafari, isStandalone } from "@/lib/pwa/platform";

const IOS_HINT_KEY = "speedoku:v1:pwa:iosHintDismissed";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
}

export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null,
  );
  const [showIosHint, setShowIosHint] = useState(false);

  useEffect(() => {
    if (isStandalone()) return;

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);

    if (isIosSafari() && localStorage.getItem(IOS_HINT_KEY) !== "1") {
      setShowIosHint(true);
    }
    return () =>
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, []);

  if (deferred) {
    return (
      <button
        type="button"
        onClick={() => {
          void deferred.prompt();
          setDeferred(null);
        }}
        className="rounded-card bg-accent px-4 py-2 text-sm font-semibold text-white"
      >
        Install Speedoku
      </button>
    );
  }

  if (showIosHint) {
    return (
      <div className="flex items-center gap-2 rounded-card bg-cell px-4 py-2 text-sm text-muted">
        <span>Add to Home Screen: tap Share, then "Add to Home Screen".</span>
        <button
          type="button"
          aria-label="Dismiss"
          onClick={() => {
            localStorage.setItem(IOS_HINT_KEY, "1");
            setShowIosHint(false);
          }}
          className="text-muted"
        >
          ✕
        </button>
      </div>
    );
  }

  return null;
}
