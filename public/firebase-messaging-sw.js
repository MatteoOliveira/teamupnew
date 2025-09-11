// Service Worker pour Firebase Cloud Messaging
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDEhV0f2kWRyorZGi6QoFEuQvSabUq8qGU",
  authDomain: "teamup-7a2d6.firebaseapp.com",
  projectId: "teamup-7a2d6",
  storageBucket: "teamup-7a2d6.firebasestorage.app",
  messagingSenderId: "535498065920",
  appId: "1:535498065920:web:9c23eb124e7af9748030e5",
  measurementId: "G-XP9K67C013"
};

// Initialiser Firebase
firebase.initializeApp(firebaseConfig);

// Initialiser Firebase Messaging
const messaging = firebase.messaging();

// Gérer les messages en arrière-plan
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Message reçu en arrière-plan:', payload);
  
  const notificationTitle = payload.notification?.title || 'TeamUp';
  const notificationOptions = {
    body: payload.notification?.body || 'Nouvelle notification',
    icon: '/icon-192x192.webp',
    badge: '/icon-192x192.webp',
    tag: payload.data?.eventId || 'teamup-notification',
    requireInteraction: true,
    silent: false,
    data: payload.data
  };

  // Afficher la notification
  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Gérer les clics sur les notifications
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification cliquée:', event);
  
  event.notification.close();
  
  // Rediriger vers l'événement si disponible
  if (event.notification.data?.eventId) {
    event.waitUntil(
      clients.openWindow(`/event/${event.notification.data.eventId}`)
    );
  } else {
    // Rediriger vers la page d'accueil
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Gérer l'installation de la PWA
self.addEventListener('install', (event) => {
  console.log('[firebase-messaging-sw.js] Service Worker installé');
  self.skipWaiting(); // Activer immédiatement le nouveau service worker
});

// Gérer l'activation de la PWA
self.addEventListener('activate', (event) => {
  console.log('[firebase-messaging-sw.js] Service Worker activé');
  event.waitUntil(clients.claim()); // Prendre le contrôle de tous les clients
});

// Gérer les requêtes réseau pour le cache hors ligne
self.addEventListener('fetch', (event) => {
  // Stratégie de cache pour les pages HTML
  if (event.request.destination === 'document') {
    event.respondWith(
      caches.match(event.request).then((response) => {
        if (response) {
          return response;
        }
        
        return fetch(event.request).then((fetchResponse) => {
          // Mettre en cache les pages HTML
          if (fetchResponse.status === 200) {
            const responseClone = fetchResponse.clone();
            caches.open('pages-cache').then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return fetchResponse;
        }).catch(() => {
          // Fallback vers la page d'accueil si hors ligne
          return caches.match('/');
        });
      })
    );
  }
  
  // Stratégie de cache pour les assets statiques
  if (event.request.url.includes('/_next/static/')) {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request).then((fetchResponse) => {
          return caches.open('static-cache').then((cache) => {
            cache.put(event.request, fetchResponse.clone());
            return fetchResponse;
          });
        });
      })
    );
  }
  
  // Stratégie de cache pour les images
  if (event.request.destination === 'image') {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request).then((fetchResponse) => {
          return caches.open('images-cache').then((cache) => {
            cache.put(event.request, fetchResponse.clone());
            return fetchResponse;
          });
        });
      })
    );
  }
});