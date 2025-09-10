// Service Worker unifié : PWA + Notifications Push
// Compatible avec next-pwa et Firebase

// ==========================================
// IMPORT DES SCRIPTS FIREBASE
// ==========================================
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// ==========================================
// CONFIGURATION FIREBASE
// ==========================================
const firebaseConfig = {
  apiKey: "AIzaSyDEhV0f2kWRyorZGi6QoFEuQvSabUq8qGU",
  authDomain: "teamup-7a2d6.firebaseapp.com",
  projectId: "teamup-7a2d6",
  storageBucket: "teamup-7a2d6.firebasestorage.app",
  messagingSenderId: "535498065920",
  appId: "1:535498065920:web:9c23eb124e7af9748030e5"
};

// Initialiser Firebase
firebase.initializeApp(firebaseConfig);

// Initialiser Firebase Messaging
const messaging = firebase.messaging();

// ==========================================
// GESTION DES NOTIFICATIONS PUSH
// ==========================================

// Gérer les messages en arrière-plan
messaging.onBackgroundMessage((payload) => {
  console.log('🔔 Message reçu en arrière-plan:', payload);
  
  const notificationTitle = payload.notification?.title || 'TeamUp';
  const notificationBody = payload.notification?.body || 'Nouvelle notification';
  
  const notificationOptions = {
    body: notificationBody,
    icon: '/icon-192x192.webp',
    badge: '/icon-192x192.webp',
    tag: 'teamup-notification',
    requireInteraction: true,
    silent: false,
    vibrate: [200, 100, 200],
    data: payload.data || {},
    actions: [
      {
        action: 'open',
        title: 'Ouvrir',
        icon: '/icon-192x192.webp'
      },
      {
        action: 'close',
        title: 'Fermer',
        icon: '/icon-192x192.webp'
      }
    ]
  };
  
  self.registration.showNotification(notificationTitle, notificationOptions);
});

// ==========================================
// GESTION DES CLICS SUR NOTIFICATIONS
// ==========================================

self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Notification cliquée:', event);
  
  event.notification.close();
  
  const clickedNotification = event.notification;
  const eventId = clickedNotification.data?.eventId;
  const urlToOpen = eventId ? `/messages/${eventId}` : '/';
  
  if (event.action === 'open') {
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        // Chercher une fenêtre existante
        for (const client of clientList) {
          if (client.url.includes(urlToOpen) && 'focus' in client) {
            return client.focus();
          }
        }
        // Ouvrir une nouvelle fenêtre si aucune trouvée
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
        return null;
      })
    );
  }
});

// ==========================================
// GESTION DES INSTALLATIONS PWA
// ==========================================

self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker unifié installé');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('🔧 Service Worker unifié activé');
  event.waitUntil(self.clients.claim());
});

// ==========================================
// GESTION DES ERREURS
// ==========================================

self.addEventListener('error', (event) => {
  console.error('❌ Erreur Service Worker:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('❌ Promise rejetée Service Worker:', event.reason);
});

// ==========================================
// CACHE STRATEGY PWA
// ==========================================

// Stratégie de cache pour les ressources statiques
self.addEventListener('fetch', (event) => {
  // Laisser next-pwa gérer le cache par défaut
  // On ne fait que logger pour debug
  if (event.request.url.includes('firebase') || event.request.url.includes('notification')) {
    console.log('🔍 Fetch Firebase/Notification:', event.request.url);
  }
});

console.log('✅ Service Worker unifié chargé avec succès');
