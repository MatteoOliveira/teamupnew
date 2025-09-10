// Service Worker unifié pour PWA + Push Notifications
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Configuration Firebase (utilise les variables d'environnement côté client)
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

  // Afficher la notification
  self.registration.showNotification(notificationTitle, notificationOptions);
});

// ==========================================
// GESTION DES CLICS SUR NOTIFICATIONS
// ==========================================

self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Notification cliquée:', event);
  
  event.notification.close();
  
  if (event.action === 'open' || !event.action) {
    // Ouvrir l'application
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        // Si l'app est déjà ouverte, focus dessus
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            return client.focus();
          }
        }
        // Sinon, ouvrir une nouvelle fenêtre
        if (clients.openWindow) {
          const url = event.notification.data?.url || '/';
          return clients.openWindow(url);
        }
      })
    );
  } else if (event.action === 'close') {
    // Fermer la notification (déjà fait par event.notification.close())
    console.log('🔔 Notification fermée');
  }
});

// ==========================================
// GESTION DES NOTIFICATIONS FERMÉES
// ==========================================

self.addEventListener('notificationclose', (event) => {
  console.log('🔔 Notification fermée:', event);
});

// ==========================================
// GESTION DES MESSAGES PUSH
// ==========================================

self.addEventListener('push', (event) => {
  console.log('🔔 Push reçu:', event);
  
  if (event.data) {
    try {
      const data = event.data.json();
      console.log('🔔 Données push:', data);
      
      const options = {
        body: data.body || 'Nouvelle notification',
        icon: '/icon-192x192.webp',
        badge: '/icon-192x192.webp',
        tag: 'teamup-push',
        data: data.data || {},
        actions: [
          {
            action: 'open',
            title: 'Ouvrir'
          }
        ]
      };
      
      event.waitUntil(
        self.registration.showNotification(data.title || 'TeamUp', options)
      );
    } catch (error) {
      console.error('🔔 Erreur parsing push data:', error);
    }
  }
});

// ==========================================
// GESTION DES INSTALLATIONS
// ==========================================

self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker installé');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('🔧 Service Worker activé');
  event.waitUntil(self.clients.claim());
});

// ==========================================
// GESTION DES ERREURS
// ==========================================

self.addEventListener('error', (event) => {
  console.error('🔧 Erreur Service Worker:', event);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('🔧 Promise rejetée:', event);
});

// ==========================================
// UTILITAIRES
// ==========================================

// Fonction pour envoyer un message à tous les clients
function sendMessageToClients(message) {
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage(message);
    });
  });
}

// Fonction pour obtenir l'URL de base
function getBaseUrl() {
  return self.location.origin;
}

console.log('🔧 Service Worker TeamUp chargé avec succès');
