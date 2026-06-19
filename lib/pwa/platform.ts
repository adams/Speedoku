/** True when the app is running as an installed standalone PWA. */
export function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  const mm = window.matchMedia?.("(display-mode: standalone)");
  if (mm?.matches) return true;
  return (
    (window.navigator as Navigator & { standalone?: boolean }).standalone ===
    true
  );
}

/** True for iOS Safari, which fires no beforeinstallprompt and needs a manual A2HS hint. */
export function isIosSafari(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const isIos = /iphone|ipad|ipod/i.test(ua);
  const isSafari =
    /safari/i.test(ua) && !/crios|fxios|edgios|android/i.test(ua);
  return isIos && isSafari;
}
