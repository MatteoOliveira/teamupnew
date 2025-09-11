// Service Worker minimal pour PWA
// Pas de Firebase Cloud Messaging pour éviter les conflits

const CACHE_NAME = 'teamup-minimal-v1';
const urlsToCache = [
  '/',
  '/icon-192x192.webp',
  '/icon-512x512.webp',
  '/manifest.json'
];

// Installation du service worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker minimal installé');
        return cache.addAll(urlsToCache);
      })
  );
});

// Activation du service worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Suppression ancien cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Interception des requêtes
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Retourner le cache si disponible, sinon faire la requête
        return response || fetch(event.request);
      })
  );
});

console.log('Service Worker minimal chargé');
