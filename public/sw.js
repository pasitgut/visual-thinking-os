const CACHE_NAME = "visual-mindmap-v3";
const ASSETS_TO_CACHE = [
  "/",
  "/favicon.ico",
  "/manifest", // This matches Next.js App Router manifest path
  "/file.svg",
  "/globe.svg",
  "/next.svg",
  "/vercel.svg",
  "/window.svg",
];

self.addEventListener("install", (event) => {
  console.log("[SW] Installing...");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[SW] Pre-caching assets");
      // Use individual add calls or wrap in try-catch if using addAll 
      // but here we just ensure the list is correct.
      return cache.addAll(ASSETS_TO_CACHE).catch(err => {
        console.error("[SW] Pre-cache failed. Check if all assets exist:", err);
      });
    }),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("[SW] Activating...");
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("[SW] Deleting old cache:", cacheName);
            return caches.delete(cacheName);
          }
        }),
      );
    }),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);
  
  // Only handle same-origin requests
  if (url.origin !== self.location.origin) return;

  // Skip HMR and API
  if (url.pathname.startsWith("/_next/webpack-hmr") || url.pathname.startsWith("/api/")) return;

  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          // If valid response, update cache
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch((error) => {
          console.log("[SW] Fetch failed; returning offline content if available.", error);
          
          // If it's a navigation request (page load), return the cached root
          if (event.request.mode === "navigate") {
            return caches.match("/", { ignoreSearch: true });
          }
          
          return cachedResponse; // Return whatever we have in cache
        });

      return cachedResponse || fetchPromise;
    })
  );
});
