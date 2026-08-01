/**
 * service-worker.js — offline cache for "Memories of Sajjad and Nazanin"
 * Precaches the app shell + content on install so the memory can be
 * revisited without an internet connection after the first load.
 * Bump CACHE_VERSION any time you change core files so old caches get cleared.
 */

const CACHE_VERSION = 'memories-cache-v1';

const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.json',
  './config/config.js',
  './content/letter.md',
  './content/timeline.json',
  './content/gallery.json',
  './content/memories.json',
  './content/yearMessages.json',
  './content/secrets.json',
  './src/css/style.css',
  './src/css/animation.css',
  './src/css/responsive.css',
  './src/js/app.js',
  './src/js/auth.js',
  './src/js/effects.js',
  './src/js/gallery.js',
  './src/js/music.js',
  './src/js/timeline.js',
  './src/js/pwa.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(PRECACHE_URLS)).catch((err) => {
      console.warn('Precache failed for some assets:', err);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

// Strategy: cache-first for app shell, network-first (with cache fallback) for
// images/audio so newly added photos/music show up without a version bump.
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const isMedia = req.destination === 'image' || req.destination === 'audio';

  if (isMedia) {
    event.respondWith(
      fetch(req).then((res) => {
        const clone = res.clone();
        caches.open(CACHE_VERSION).then((cache) => cache.put(req, clone));
        return res;
      }).catch(() => caches.match(req))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then((cached) => cached || fetch(req).then((res) => {
      const clone = res.clone();
      caches.open(CACHE_VERSION).then((cache) => cache.put(req, clone));
      return res;
    }).catch(() => cached))
  );
});
