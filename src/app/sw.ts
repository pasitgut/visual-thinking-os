/// <reference lib="webworker" />
import { defaultCache } from "@serwist/next/worker";
import { type PrecacheEntry, Serwist, NetworkFirst, CacheFirst, NetworkOnly } from "serwist";

declare const self: ServiceWorkerGlobalScope & {
  __SW_MANIFEST: (string | PrecacheEntry)[] | undefined;
};

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    // 1. Navigation Requests - NetworkFirst
    {
      matcher({ request }) {
        return request.mode === "navigate";
      },
      handler: new NetworkFirst({
        cacheName: "navigations",
        networkTimeoutSeconds: 10,
      }),
    },
    // 2. Static Assets - CacheFirst
    {
      matcher({ request }) {
        return (
          request.destination === "style" ||
          request.destination === "script" ||
          request.destination === "worker" ||
          request.destination === "font" ||
          request.destination === "image"
        );
      },
      handler: new CacheFirst({
        cacheName: "static-assets",
        plugins: [
          {
            cacheWillUpdate: async ({ response }) => {
              if (response && response.status === 200) {
                return response;
              }
              return null;
            },
          },
        ],
      }),
    },
    // 3. Firebase/Firestore - Exclude
    {
      matcher({ url }) {
        return (
          url.hostname.includes("firebase") ||
          url.hostname.includes("googleapis") ||
          url.hostname.includes("firebaseapp")
        );
      },
      handler: new NetworkOnly(),
    },
    // Fallback to default cache for other requests
    ...defaultCache,
  ],
  fallbacks: {
    entries: [
      {
        url: "/~offline",
        matcher({ request }) {
          return request.destination === "document";
        },
      },
    ],
  },
});

serwist.addEventListeners();
