# 📱 Configuration PWA et Service Workers

## 📝 Description Simple

L'application TeamUp est une PWA (Progressive Web App) qui fonctionne comme une application native sur mobile et desktop. Elle peut être installée, fonctionne hors ligne, et envoie des notifications push même quand l'app est fermée.

## 🔧 Description Technique

### Architecture PWA

L'application utilise une architecture PWA moderne avec :
- **Service Workers** pour le cache et les notifications
- **Web App Manifest** pour l'installation
- **Offline Support** avec cache intelligent
- **Push Notifications** via Firebase Cloud Messaging
- **Responsive Design** pour tous les appareils

### Fichiers PWA Principaux

```
public/
├── manifest.json                    # Manifeste PWA
├── icon-192x192.webp               # Icône PWA 192x192
├── icon-512x512.webp               # Icône PWA 512x512
├── firebase-messaging-sw.js        # Service worker FCM
├── sw-minimal.js                   # Service worker minimal
└── robots.txt                      # Robots pour SEO
```

### 1. Manifeste PWA

#### manifest.json
```json
{
  "name": "TeamUp - Réservation de créneaux sportifs",
  "short_name": "TeamUp",
  "description": "Réservez des créneaux sportifs localement et rejoignez une communauté de passionnés de sport.",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3b82f6",
  "orientation": "portrait-primary",
  "scope": "/",
  "lang": "fr",
  "categories": ["sports", "lifestyle", "social"],
  "icons": [
    {
      "src": "/icon-192x192.webp",
      "sizes": "192x192",
      "type": "image/webp",
      "purpose": "any maskable"
    },
    {
      "src": "/icon-512x512.webp",
      "sizes": "512x512",
      "type": "image/webp",
      "purpose": "any maskable"
    }
  ],
  "screenshots": [
    {
      "src": "/screenshot-mobile.webp",
      "sizes": "390x844",
      "type": "image/webp",
      "form_factor": "narrow"
    },
    {
      "src": "/screenshot-desktop.webp",
      "sizes": "1280x720",
      "type": "image/webp",
      "form_factor": "wide"
    }
  ],
  "shortcuts": [
    {
      "name": "Créer un événement",
      "short_name": "Créer",
      "description": "Créer un nouvel événement sportif",
      "url": "/event-create",
      "icons": [
        {
          "src": "/icon-192x192.webp",
          "sizes": "192x192"
        }
      ]
    },
    {
      "name": "Mes événements",
      "short_name": "Mes événements",
      "description": "Voir mes événements créés et participations",
      "url": "/profile",
      "icons": [
        {
          "src": "/icon-192x192.webp",
          "sizes": "192x192"
        }
      ]
    }
  ],
  "related_applications": [],
  "prefer_related_applications": false
}
```

### 2. Service Worker FCM

#### firebase-messaging-sw.js
```javascript
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

// Gérer les requêtes réseau
self.addEventListener('fetch', (event) => {
  // Stratégie de cache pour les assets statiques
  if (event.request.url.includes('/_next/static/')) {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
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
```

### 3. Service Worker Minimal

#### sw-minimal.js
```javascript
// Service Worker minimal pour satisfaire next-pwa
// Ce service worker ne gère pas les notifications push ou le cache complexe.
// Il assure simplement que la PWA peut être installée et a des capacités offline basiques.

self.addEventListener('install', (event) => {
  console.log('[SW-Minimal] Service Worker installé');
  self.skipWaiting(); // Activer immédiatement le nouveau service worker
});

self.addEventListener('activate', (event) => {
  console.log('[SW-Minimal] Service Worker activé');
  event.waitUntil(clients.claim()); // Prendre le contrôle de tous les clients
});

self.addEventListener('fetch', (event) => {
  // Stratégie de cache basique pour le support offline
  if (event.request.method === 'GET') {
    event.respondWith(
      caches.match(event.request).then((response) => {
        if (response) {
          return response;
        }
        
        return fetch(event.request).then((fetchResponse) => {
          // Ne pas mettre en cache les requêtes vers des domaines externes
          if (!event.request.url.startsWith(self.location.origin)) {
            return fetchResponse;
          }
          
          // Mettre en cache les ressources de l'application
          return caches.open('app-cache').then((cache) => {
            cache.put(event.request, fetchResponse.clone());
            return fetchResponse;
          });
        });
      })
    );
  }
});

// Gérer les messages du service worker principal
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
```

### 4. Configuration Next.js PWA

#### next.config.js
```javascript
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: false,
  buildExcludes: [/middleware-manifest\.json$/, /build-manifest\.json$/],
  publicExcludes: ['!robots.txt', '!sitemap.xml'],
  sw: 'firebase-messaging-sw.js', // Service worker FCM
  runtimeCaching: [
    {
      urlPattern: /^https?.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'offlineCache',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 24 * 60 * 60, // 24 heures
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
    {
      urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts-cache',
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 365 * 24 * 60 * 60, // 1 an
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
    {
      urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts-stylesheets',
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 365 * 24 * 60 * 60, // 1 an
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'images-cache',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 jours
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
  ],
});

module.exports = withPWA({
  // Configuration Next.js...
});
```

### 5. Installation PWA

#### Composant d'Installation
```typescript
// src/components/PWAInstallPrompt.tsx
import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Vérifier si l'app est déjà installée
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Écouter l'événement d'installation
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Écouter l'événement d'installation réussie
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('PWA installée avec succès');
      } else {
        console.log('Installation PWA refusée');
      }
      
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    } catch (error) {
      console.error('Erreur lors de l\'installation PWA:', error);
    }
  };

  if (isInstalled || !showInstallPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg z-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            📱
          </div>
          <div>
            <h3 className="font-semibold">Installer TeamUp</h3>
            <p className="text-sm text-blue-100">
              Ajoutez TeamUp à votre écran d'accueil pour un accès rapide
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowInstallPrompt(false)}
            className="text-blue-200 hover:text-white text-sm"
          >
            Plus tard
          </button>
          <button
            onClick={handleInstallClick}
            className="bg-white text-blue-600 px-4 py-2 rounded-md font-medium hover:bg-blue-50"
          >
            Installer
          </button>
        </div>
      </div>
    </div>
  );
}
```

### 6. Support Offline

#### Page Offline
```typescript
// src/app/offline/page.tsx
export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 text-center">
        <div className="w-16 h-16 mx-auto bg-yellow-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Mode Hors Ligne
        </h1>
        
        <p className="text-gray-600 mb-6">
          Vous êtes actuellement hors ligne. Certaines fonctionnalités peuvent être limitées.
        </p>
        
        <div className="space-y-3">
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
          >
            Réessayer
          </button>
          
          <button
            onClick={() => window.history.back()}
            className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300"
          >
            Retour
          </button>
        </div>
        
        <div className="mt-6 text-sm text-gray-500">
          <p>Fonctionnalités disponibles hors ligne :</p>
          <ul className="mt-2 space-y-1">
            <li>• Consultation des événements récents</li>
            <li>• Profil utilisateur</li>
            <li>• Messages en cache</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
```

### 7. Gestion des Notifications Push

#### Configuration FCM
```typescript
// src/lib/fcm.ts
import { getMessaging, getToken } from 'firebase/messaging';
import { messaging } from './firebase';

export const getFCMToken = async () => {
  try {
    const registration = await navigator.serviceWorker.ready;
    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: registration
    });
    
    if (token) {
      console.log('Token FCM obtenu:', token);
      return token;
    } else {
      console.log('Aucun token FCM disponible');
      return null;
    }
  } catch (error) {
    console.error('Erreur lors de l\'obtention du token FCM:', error);
    return null;
  }
};

export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    throw new Error('Notifications non supportées');
  }

  const permission = await Notification.requestPermission();
  
  if (permission === 'granted') {
    return await getFCMToken();
  } else {
    throw new Error('Permission de notification refusée');
  }
};
```

### 8. Optimisations Performance

#### Lazy Loading des Composants
```typescript
// src/components/LazyComponents.tsx
import dynamic from 'next/dynamic';

// Charger la carte seulement quand nécessaire
export const Map = dynamic(() => import('./Map'), {
  ssr: false,
  loading: () => <div className="h-64 bg-gray-200 animate-pulse rounded-lg" />
});

// Charger les statistiques seulement sur la page profil
export const StatsChart = dynamic(() => import('./StatsChart'), {
  loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded-lg" />
});

// Charger les notifications seulement si activées
export const NotificationManager = dynamic(() => import('./PushNotificationManager'), {
  loading: () => <div className="h-32 bg-gray-100 animate-pulse rounded-lg" />
});
```

#### Préchargement des Routes
```typescript
// src/components/RoutePreloader.tsx
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function RoutePreloader() {
  const router = useRouter();

  useEffect(() => {
    // Précharger les routes importantes
    const preloadRoutes = [
      '/profile',
      '/event-create',
      '/reservation'
    ];

    preloadRoutes.forEach(route => {
      router.prefetch(route);
    });
  }, [router]);

  return null;
}
```

### 9. Tests PWA

#### Tests de Conformité PWA
```typescript
// tests/pwa.test.ts
import { test, expect } from '@playwright/test';

test('PWA Installation', async ({ page }) => {
  await page.goto('/');
  
  // Vérifier le manifeste
  const manifest = await page.evaluate(() => {
    return document.querySelector('link[rel="manifest"]')?.getAttribute('href');
  });
  expect(manifest).toBe('/manifest.json');
  
  // Vérifier les icônes
  const icons = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('link[rel="icon"]')).map(link => 
      link.getAttribute('href')
    );
  });
  expect(icons).toContain('/icon-192x192.webp');
  expect(icons).toContain('/icon-512x512.webp');
  
  // Vérifier le service worker
  const swRegistered = await page.evaluate(() => {
    return 'serviceWorker' in navigator;
  });
  expect(swRegistered).toBe(true);
});

test('Offline Functionality', async ({ page, context }) => {
  await page.goto('/');
  
  // Simuler le mode hors ligne
  await context.setOffline(true);
  
  // Vérifier que la page offline s'affiche
  await page.waitForSelector('text=Mode Hors Ligne');
  
  // Réactiver la connexion
  await context.setOffline(false);
  await page.reload();
});
```

### 10. Monitoring PWA

#### Métriques PWA
```typescript
// src/lib/pwa-metrics.ts
export const trackPWAInstallation = () => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'pwa_install', {
      event_category: 'PWA',
      event_label: 'Installation',
      value: 1
    });
  }
};

export const trackPWAPerformance = () => {
  if (typeof window !== 'undefined' && 'performance' in window) {
    const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    if (window.gtag) {
      window.gtag('event', 'pwa_performance', {
        event_category: 'PWA',
        event_label: 'Performance',
        load_time: perfData.loadEventEnd - perfData.loadEventStart,
        dom_ready: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart
      });
    }
  }
};
```

### 11. Améliorations Futures

#### Fonctionnalités PWA à Ajouter
- [ ] **Background Sync** : Synchronisation en arrière-plan
- [ ] **Push Notifications** : Notifications programmées
- [ ] **Share Target** : Partage de contenu vers l'app
- [ ] **File System Access** : Accès au système de fichiers
- [ ] **Web Share API** : Partage natif
- [ ] **Payment Request API** : Paiements intégrés
- [ ] **Web Bluetooth** : Connexion Bluetooth
- [ ] **Web USB** : Connexion USB

#### Optimisations
- [ ] **Service Worker Updates** : Mise à jour automatique
- [ ] **Cache Strategies** : Stratégies de cache avancées
- [ ] **Bundle Splitting** : Division des bundles
- [ ] **Tree Shaking** : Élimination du code mort
- [ ] **Image Optimization** : Optimisation des images
- [ ] **Font Optimization** : Optimisation des polices
