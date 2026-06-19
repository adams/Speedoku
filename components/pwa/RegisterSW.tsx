"use client";
import { useEffect } from "react";

/** Registers the service worker on mount. Renders nothing. */
export function RegisterSW() {
  useEffect(() => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator))
      return;
    if (!navigator.serviceWorker) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      /* registration failure is non-fatal; app still works online */
    });
  }, []);
  return null;
}
