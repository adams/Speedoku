// Speedoku service worker — hand-rolled. Turbopack does not process public/, so
// this plain-JS file is served verbatim at /sw.js with root scope (no build step).
// The strategy in strategyFor() mirrors lib/pwa/route-strategy.ts (unit-tested there).
const CACHE = "speedoku-v1"; // bump to bust all caches on a deploy
const SHELL = ["/", "/play", "/daily"];

self.addEventListener("install", (event) => {
  // Precache the route shells so any route cold-launches offline. NO skipWaiting:
  // a new SW activates on the next cold launch, never mid-run.
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

function strategyFor(request) {
  const { pathname } = new URL(request.url);
  if (
    pathname.startsWith("/_next/static/") ||
    pathname.startsWith("/icons/") ||
    pathname.startsWith("/apple-icon") ||
    /\.(?:woff2?|ttf|otf|png|svg|ico)$/.test(pathname)
  ) {
    return "cache-first";
  }
  if (request.mode === "navigate") return "network-first";
  return "network";
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const res = await fetch(request);
  if (res.ok) (await caches.open(CACHE)).put(request, res.clone());
  return res;
}

async function networkFirst(request) {
  try {
    const res = await fetch(request);
    if (res.ok) (await caches.open(CACHE)).put(request, res.clone());
    return res;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    return caches.match("/"); // last-resort shell fallback
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const strategy = strategyFor(request);
  if (strategy === "cache-first") event.respondWith(cacheFirst(request));
  else if (strategy === "network-first") event.respondWith(networkFirst(request));
  // "network": no respondWith — let the request pass through to the network.
});
