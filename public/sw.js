// Eiger Marvel HR Platform — Service Worker
// Cache-first for static assets, network-first for navigation

const CACHE_NAME = 'eiger-marvel-v1'
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/site.webmanifest',
  '/favicon.ico',
  '/favicon.svg',
  '/apple-touch-icon.png',
  '/android-chrome-192x192.png',
  '/android-chrome-512x512.png',
  '/robots.txt',
  '/sitemap.xml',
  '/404.html',
]

// Install: pre-cache critical static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS)
    }).then(() => {
      self.skipWaiting()
    })
  )
})

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    }).then(() => {
      self.clients.claim()
    })
  )
})

// Fetch: cache-first for static assets, network-first for navigations
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== 'GET') return

  // Cache-first for same-origin static assets
  if (url.origin === self.location.origin) {
    // For navigation requests (HTML pages), try network first
    if (request.mode === 'navigate') {
      event.respondWith(
        fetch(request)
          .then((response) => {
            const clone = response.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
            return response
          })
          .catch(() => {
            return caches.match(request).then((cached) => {
              return cached || caches.match('/')
            })
          })
      )
      return
    }

    // For static assets (JS, CSS, images, fonts), cache-first
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached
        return fetch(request).then((response) => {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
          return response
        })
      })
    )
    return
  }

  // For third-party requests (CDN, fonts), network-first with short cache
  event.respondWith(
    fetch(request).catch(() => {
      return caches.match(request)
    })
  )
})
