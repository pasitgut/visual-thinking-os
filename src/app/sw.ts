/// <reference lib="webworker" />
import { defaultCache } from "@serwist/next/worker";
import { type PrecacheEntry, Serwist, NetworkFirst, StaleWhileRevalidate, NetworkOnly } from "serwist";

declare const self: ServiceWorkerGlobalScope & {
  __SW_MANIFEST: (string | PrecacheEntry)[] | undefined;
};

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: false, // Mandatory fix for Safari 'no-response' error
  runtimeCaching: [
    // 1. Navigation Requests - NetworkFirst with longer timeout and fallback
    {
      matcher({ request }) {
        return request.mode === "navigate";
      },
      handler: new NetworkFirst({
        cacheName: "navigations",
        networkTimeoutSeconds: 20,
      }),
    },
    // 2. Static Assets (CSS, JS, Workers) - StaleWhileRevalidate (Faster & more reliable)
    {
      matcher({ request }) {
        return (
          request.destination === "style" ||
          request.destination === "script" ||
          request.destination === "worker"
        );
      },
      handler: new StaleWhileRevalidate({
        cacheName: "static-assets",
      }),
    },
    // 3. Images and Fonts - CacheFirst
    {
      matcher({ request }) {
        return request.destination === "image" || request.destination === "font";
      },
      handler: new StaleWhileRevalidate({
        cacheName: "media-assets",
      }),
    },
    // 4. Firebase/Firestore - Explicitly NetworkOnly
    {
      matcher({ url }) {
        return (
          url.hostname.includes("firebase") ||
          url.hostname.includes("googleapis") ||
          url.hostname.includes("firebaseapp") ||
          url.pathname.includes("/__/")
        );
      },
      handler: new NetworkOnly(),
    },
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
