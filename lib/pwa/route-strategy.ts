export type CacheStrategy = "cache-first" | "network-first" | "network";

export interface StrategyRequest {
  url: string;
  /** RequestMode; document navigations are "navigate". */
  mode?: string;
}

/**
 * Decide how the service worker should serve a GET request.
 * NOTE: public/sw.js inlines an exact mirror of this function (it cannot import
 * TS). Keep the two in sync — this test file is the source of truth.
 */
export function routeStrategy(req: StrategyRequest): CacheStrategy {
  const { pathname } = new URL(req.url);
  if (
    pathname.startsWith("/_next/static/") ||
    pathname.startsWith("/icons/") ||
    pathname.startsWith("/apple-icon") ||
    /\.(?:woff2?|ttf|otf|png|svg|ico)$/.test(pathname)
  ) {
    return "cache-first";
  }
  if (req.mode === "navigate") return "network-first";
  return "network";
}
