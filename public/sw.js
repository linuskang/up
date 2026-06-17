self.addEventListener("install", (event) => {
    self.skipWaiting()
})

self.addEventListener("activate", (event) => {
    self.clients.claim()
})

// Required for PWA installability — Chromium won't prompt without a fetch handler
self.addEventListener("fetch", (event) => {
    event.respondWith(fetch(event.request))
})

// Placeholder for future push notification support
