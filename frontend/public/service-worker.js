/*
 * Minimal PWA service worker for "14 Meridian Akupunktur".
 *
 * Strategy (kept deliberately conservative so no user ever gets stale
 * Meridian data or stale application code):
 *
 *  - Navigation requests (HTML): NETWORK-FIRST. On network failure, fall back
 *    to the cached index shell so the installed app still opens offline. The
 *    hashed CRA bundle then re-boots the current React app, so users always
 *    receive the freshest code the moment they're back online.
 *
 *  - Same-origin static assets (CRA hashed JS/CSS, PNGs, manifest):
 *    STALE-WHILE-REVALIDATE. These filenames are content-hashed by CRA, so
 *    serving a cached copy while refreshing in the background is safe.
 *
 *  - Cross-origin (fonts.googleapis.com, fonts.gstatic.com, analytics):
 *    NOT intercepted — passed straight through to the network.
 *
 *  - SpeechSynthesis is never touched (nothing to intercept).
 *
 * Cache is namespaced with a version tag. Bumping CACHE_VERSION forces every
 * client to drop the old cache on activation.
 */

const CACHE_VERSION = "v1";
const RUNTIME_CACHE = `meridian-runtime-${CACHE_VERSION}`;

self.addEventListener("install", (event) => {
  // Activate the new worker as soon as it finishes installing.
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names
          .filter((n) => n !== RUNTIME_CACHE)
          .map((n) => caches.delete(n))
      );
      await self.clients.claim();
    })()
  );
});

const isNavigationRequest = (request) =>
  request.mode === "navigate" ||
  (request.method === "GET" &&
    request.headers.get("accept") &&
    request.headers.get("accept").includes("text/html"));

self.addEventListener("fetch", (event) => {
  const request = event.request;

  // Only handle GETs; leave POST/PUT/etc. alone.
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Don't intercept cross-origin requests (fonts, analytics, etc.).
  if (url.origin !== self.location.origin) return;

  // 1) Navigation requests → network first, cached shell as offline fallback.
  if (isNavigationRequest(request)) {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(request);
          const cache = await caches.open(RUNTIME_CACHE);
          cache.put(request, fresh.clone());
          return fresh;
        } catch (err) {
          const cache = await caches.open(RUNTIME_CACHE);
          const cached = await cache.match(request);
          if (cached) return cached;
          // As a last resort, try the app shell (start_url).
          const shell = await cache.match("./");
          if (shell) return shell;
          throw err;
        }
      })()
    );
    return;
  }

  // 2) Same-origin static assets → stale-while-revalidate.
  event.respondWith(
    (async () => {
      const cache = await caches.open(RUNTIME_CACHE);
      const cached = await cache.match(request);
      const networkFetch = fetch(request)
        .then((response) => {
          // Only cache successful, basic (same-origin) responses.
          if (
            response &&
            response.status === 200 &&
            response.type === "basic"
          ) {
            cache.put(request, response.clone());
          }
          return response;
        })
        .catch(() => cached);
      return cached || networkFetch;
    })()
  );
});
