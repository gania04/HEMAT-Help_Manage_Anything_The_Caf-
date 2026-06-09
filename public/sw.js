const CACHE_NAME = 'hemat-pwa-v1';
const STATIC_ASSETS = [
  '/',
  '/pos',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png'
];

globalThis.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  globalThis.skipWaiting();
});

globalThis.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  globalThis.clients.claim();
});

globalThis.addEventListener('fetch', (event) => {
  // Hanya proses request GET
  if (event.request.method !== 'GET') return;

  // Lewati request ke API/Server Actions
  if (event.request.url.includes('/api/') || event.request.url.includes('_next/data')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Simpan ke cache jika berhasil mengambil dari network
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => {
        // Jika offline, ambil dari cache
        return caches.match(event.request).then((response) => {
          return response || caches.match('/');
        });
      })
  );
});
