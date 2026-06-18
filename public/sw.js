// Kill-switch Service Worker untuk menghapus cache yang rusak dan mengembalikan fetch ke normal
const CACHE_NAME = 'hemat-pwa-v1';

globalThis.addEventListener('install', (event) => {
  globalThis.skipWaiting();
});

globalThis.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => caches.delete(name))
      );
    })
  );
  globalThis.clients.claim();
});

globalThis.addEventListener('fetch', (event) => {
  // Biarkan browser menangani semua request secara normal
  return;
});
