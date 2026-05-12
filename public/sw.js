const CACHE_NAME = "visual-mindmap-v4";
const ASSETS_TO_CACHE = [
  "/",
  "/manifest",
  "/manifest.webmanifest",
  "/favicon.ico",
  "/file.svg",
  "/globe.svg",
  "/next.svg",
  "/vercel.svg",
  "/window.svg",
];

self.addEventListener("install", (event) => {
  console.log("[SW] Install event");
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[SW] Caching critical assets");
      // Use individual add to prevent one failure from stopping all
      return Promise.allSettled(
        ASSETS_TO_CACHE.map(url => cache.add(url))
      ).then(results => {
        const failed = results.filter(r => r.status === 'rejected');
        if (failed.length > 0) {
          console.warn(`[SW] ${failed.length} assets failed to cache during install`);
        }
      });
    })
  );
});

self.addEventListener("activate", (event) => {
  console.log("[SW] Activate event");
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log("[SW] Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
    ])
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);
  
  // Skip cross-origin and HMR/API
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/_next/webpack-hmr") || url.pathname.startsWith("/api/")) return;

  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then((cachedResponse) => {
      // Strategy: Stale-While-Revalidate
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch((error) => {
          console.log("[SW] Network failed, looking for fallback", url.pathname);
          
          // Navigation fallback: if user is offline and navigating to a page, show root "/"
          if (event.request.mode === "navigate") {
            return caches.match("/", { ignoreSearch: true });
          }
          
          return cachedResponse || new Response("Offline content not available", { status: 503 });
        });

      return cachedResponse || fetchPromise;
    })
  );
});
