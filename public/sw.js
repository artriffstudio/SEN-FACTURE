// Facturim Service Worker — Support Hybride Hors-Ligne
const CACHE_NAME = "facturim-cache-v1";
const STATIC_ASSETS = [
  "/",
  "/dashboard",
  "/invoices",
  "/clients",
  "/inventory",
  "/manifest.json",
  "/favicon.ico"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn("SW precache partial warning:", err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // Ignorer les requêtes non-GET et les requêtes Supabase/Auth/API
  if (event.request.method !== "GET" || event.request.url.includes("/api/") || event.request.url.includes("supabase.co")) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          if (event.request.mode === "navigate") {
            return caches.match("/dashboard") || caches.match("/");
          }
          return new Response("Mode hors-ligne Facturim", { status: 503, statusText: "Offline" });
        });
      })
  );
});
