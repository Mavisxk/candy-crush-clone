/* Hawker Crush service worker: precaches the whole game so it plays offline.
   Bump VERSION on every release so installed copies pick up the new files. */
const VERSION = 'hawker-crush-v1.0.0';
const ASSETS = [
  '/',
  '/css/style.css',
  '/js/art.js', '/js/game.js', '/js/ui.js', '/js/pwa.js',
  '/manifest.webmanifest',
  '/icons/icon.svg', '/icons/icon-192.png', '/icons/icon-512.png', '/icons/maskable-512.png',
  '/icons/apple-touch-icon.png', '/icons/favicon-32.png',
  '/fonts/baloo-2-latin-600-normal.woff2', '/fonts/baloo-2-latin-700-normal.woff2', '/fonts/baloo-2-latin-800-normal.woff2',
  '/fonts/nunito-latin-600-normal.woff2', '/fonts/nunito-latin-700-normal.woff2', '/fonts/nunito-latin-800-normal.woff2',
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(VERSION).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Cache first, then refresh the cached copy in the background (stale-while-revalidate).
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  const key = req.mode === 'navigate' ? '/' : req;
  event.respondWith(
    caches.open(VERSION).then(async cache => {
      const cached = await cache.match(key, { ignoreSearch: req.mode === 'navigate' });
      const network = fetch(req).then(res => {
        if (res && res.ok && !res.redirected) cache.put(key, res.clone());
        return res;
      }).catch(() => cached);
      if (cached) { event.waitUntil(network.catch(() => {})); return cached; }
      return network;
    })
  );
});
