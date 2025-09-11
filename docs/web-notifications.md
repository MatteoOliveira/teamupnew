# 🔔 Système de Notifications Web

## 📝 Description Simple

Le système de notifications permet d'informer les utilisateurs en temps réel des modifications d'événements, nouvelles inscriptions, et autres activités importantes. Les notifications apparaissent même quand l'application n'est pas ouverte (notifications push).

## 🔧 Description Technique

### Architecture des Notifications

L'application utilise deux systèmes de notifications complémentaires :
1. **Notifications Web Natives** : Pour les notifications quand l'app est ouverte
2. **Firebase Cloud Messaging (FCM)** : Pour les notifications push même app fermée

### Fichiers Principaux

```
src/
├── hooks/
│   ├── useWebNotifications.ts      # Hook pour notifications web natives
│   ├── useFCMNotifications.ts      # Hook pour notifications FCM
│   └── usePushNotificationsSimple.ts # Hook simplifié pour tests
├── components/
│   ├── PushNotificationManager.tsx  # Interface de gestion des notifications
│   └── WebNotificationsProvider.tsx # Provider pour notifications web
├── app/event-edit/[id]/page.tsx    # Logique d'envoi lors de modifications
└── public/
    └── firebase-messaging-sw.js    # Service worker pour FCM
```

### 1. Notifications Web Natives

#### Hook useWebNotifications
```typescript
// src/hooks/useWebNotifications.ts
export function useWebNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<WebNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    const notificationsQuery = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid),
      limit(10)
    );

    const unsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
      const newNotifications: WebNotification[] = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        newNotifications.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt.toDate()
        } as WebNotification);
      });

      // Tri côté client par date décroissante
      newNotifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      setNotifications(newNotifications);
      setUnreadCount(newNotifications.length);

      // Afficher les nouvelles notifications
      newNotifications.forEach((notification) => {
        if (Notification.permission === 'granted') {
          const webNotification = new Notification(notification.title, {
            body: notification.body,
            icon: '/icon-192x192.webp',
            badge: '/icon-192x192.webp',
            tag: `event-${notification.eventId}`,
            requireInteraction: true,
            silent: false,
            data: notification.data
          });

          webNotification.onclick = () => {
            window.focus();
            window.open(`/event/${notification.eventId}`, '_blank');
            webNotification.close();
          };

          // Auto-close après 5 secondes
          setTimeout(() => {
            webNotification.close();
          }, 5000);
        }
      });
    });

    return () => unsubscribe();
  }, [user]);

  return { notifications, unreadCount };
}
```

#### Provider pour Initialisation
```typescript
// src/components/WebNotificationsProvider.tsx
export default function WebNotificationsProvider() {
  console.log('🔔 === WebNotificationsProvider initialisé ===');
  console.log('🔔 Permission notifications:', Notification.permission);
  console.log('🔔 Support notifications:', 'Notification' in window);
  
  const { notifications, unreadCount } = useWebNotifications();
  
  console.log('🔔 État notifications:', { count: notifications.length, unread: unreadCount });
  
  return null;
}
```

### 2. Firebase Cloud Messaging (FCM)

#### Hook useFCMNotifications
```typescript
// src/hooks/useFCMNotifications.ts
export function useFCMNotifications() {
  const { user } = useAuth();
  const [state, setState] = useState<FCMState>({
    token: null,
    permission: 'default',
    isSubscribed: false,
    error: null
  });

  // S'abonner aux notifications FCM
  const subscribe = useCallback(async () => {
    if (!messaging || !user) {
      setState(prev => ({ ...prev, error: 'Messaging ou utilisateur non disponible' }));
      return false;
    }

    try {
      // Attendre que le service worker soit prêt
      const registration = await navigator.serviceWorker.ready;
      
      // Obtenir le token FCM
      const token = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
        serviceWorkerRegistration: registration
      });

      if (token) {
        // Sauvegarder le token dans le profil utilisateur
        await setDoc(doc(db, 'users', user.uid), {
          fcmToken: token,
          fcmTokenUpdated: new Date()
        }, { merge: true });
        
        setState(prev => ({ 
          ...prev, 
          token, 
          isSubscribed: true, 
          error: null 
        }));
        return true;
      }
    } catch (error) {
      console.error('Erreur lors de l\'abonnement FCM:', error);
      setState(prev => ({ ...prev, error: 'Erreur lors de l\'abonnement FCM' }));
      return false;
    }
  }, [user]);

  return { ...state, subscribe, requestPermission, unsubscribe };
}
```

#### Service Worker FCM
```javascript
// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDEhV0f2kWRyorZGi6QoFEuQvSabUq8qGU",
  authDomain: "teamup-7a2d6.firebaseapp.com",
  projectId: "teamup-7a2d6",
  storageBucket: "teamup-7a2d6.firebasestorage.app",
  messagingSenderId: "535498065920",
  appId: "1:535498065920:web:9c23eb124e7af9748030e5"
};

firebase.initializeApp(firebaseConfig);
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

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Gérer les clics sur les notifications
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.notification.data?.eventId) {
    event.waitUntil(
      clients.openWindow(`/event/${event.notification.data.eventId}`)
    );
  } else {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});
```

### 3. Envoi de Notifications

#### Lors de la Modification d'Événement
```typescript
// src/app/event-edit/[id]/page.tsx
const notifyParticipants = async (eventId: string, changeSummary: string[], eventData: Event) => {
  try {
    // Récupérer tous les participants
    const participantsQuery = query(collection(db, 'event_participants'), where('eventId', '==', eventId));
    const participantsSnapshot = await getDocs(participantsQuery);
    
    const notifications = [];
    const participantIds = [];
    
    participantsSnapshot.forEach((doc) => {
      const participantData = doc.data();
      participantIds.push(participantData.userId);
      
      notifications.push({
        userId: participantData.userId,
        title: '🎯 Événement Modifié',
        body: `L'événement "${eventData.name}" a été modifié`,
        eventId: eventId,
        data: { eventId: eventId, action: 'event_modified' },
        createdAt: new Date()
      });
    });

    // Sauvegarder les notifications dans Firestore
    const batch = writeBatch(db);
    notifications.forEach(notification => {
      const notificationRef = doc(collection(db, 'notifications'));
      batch.set(notificationRef, notification);
    });
    await batch.commit();

    // Essayer d'abord les notifications FCM (fonctionne même PWA fermée)
    const fcmSuccess = await sendFCMNotifications(participantIds, eventData);
    
    if (!fcmSuccess) {
      // Fallback vers le système web (fonctionne seulement PWA ouverte)
      await sendPushNotifications(notifications);
    }
  } catch (error) {
    console.error('Erreur lors de l\'envoi des notifications:', error);
  }
};
```

#### Envoi FCM via REST API
```typescript
const sendFCMNotifications = async (participants: string[], eventData: Event) => {
  try {
    // Récupérer les tokens FCM des participants
    const participantTokens = [];
    for (const participantId of participants) {
      const userDoc = await getDoc(doc(db, 'users', participantId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.fcmToken) {
          participantTokens.push(userData.fcmToken);
        }
      }
    }

    if (participantTokens.length === 0) {
      return false;
    }

    // Envoyer via FCM REST API
    const message = {
      registration_ids: participantTokens,
      notification: {
        title: '🎯 Événement Modifié',
        body: `L'événement "${eventData.name}" a été modifié`,
        icon: '/icon-192x192.webp',
        badge: '/icon-192x192.webp'
      },
      data: {
        eventId: eventData.id,
        action: 'event_modified',
        url: `/event/${eventData.id}`
      }
    };

    const response = await fetch('https://fcm.googleapis.com/fcm/send', {
      method: 'POST',
      headers: {
        'Authorization': `key=${process.env.FIREBASE_SERVER_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(message)
    });

    return response.ok;
  } catch (error) {
    console.error('Erreur lors de l\'envoi FCM:', error);
    return false;
  }
};
```

### 4. Interface de Gestion

#### PushNotificationManager
```typescript
// src/components/PushNotificationManager.tsx
export default function PushNotificationManager() {
  const {
    token: fcmToken,
    permission: fcmPermission,
    isSubscribed: fcmSubscribed,
    error: fcmError,
    requestPermission: requestFCMPermission,
    unsubscribe: unsubscribeFCM
  } = useFCMNotifications();

  return (
    <div className="space-y-4">
      {/* Section FCM */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">🚀 Notifications Push Réelles (FCM)</h3>
        
        <div className="space-y-2 text-sm">
          <p><strong>Permission FCM:</strong> {fcmPermission}</p>
          <p><strong>Abonnement FCM:</strong> {fcmSubscribed ? 'Actif' : 'Inactif'}</p>
          <p><strong>Token FCM:</strong> {fcmToken ? 'Présent' : 'Absent'}</p>
          {fcmError && <p className="text-red-600"><strong>Erreur FCM:</strong> {fcmError}</p>}
        </div>

        <div className="mt-4 space-x-2">
          <Button onClick={requestFCMPermission}>
            🚀 Activer FCM
          </Button>
          <Button onClick={unsubscribeFCM}>
            🚫 Désactiver FCM
          </Button>
        </div>
      </div>
    </div>
  );
}
```

### 5. Configuration et Déploiement

#### Configuration Next.js
```javascript
// next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: false,
  sw: 'firebase-messaging-sw.js', // Service worker FCM
  runtimeCaching: [
    {
      urlPattern: /^https?.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'offlineCache',
        expiration: { maxEntries: 50 }
      }
    }
  ]
});
```

#### Variables d'Environnement
```bash
# .env.local
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your_vapid_key
FIREBASE_SERVER_KEY=your_server_key
```

### 6. Gestion des Permissions

#### Demande de Permission
```typescript
const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    throw new Error('Notifications non supportées');
  }

  const permission = await Notification.requestPermission();
  
  if (permission === 'granted') {
    console.log('Permission accordée');
    return true;
  } else {
    console.log('Permission refusée');
    return false;
  }
};
```

#### Vérification du Support
```typescript
const isNotificationSupported = () => {
  return 'Notification' in window && 'serviceWorker' in navigator;
};
```

### 7. Tests et Debugging

#### Tests Recommandés
1. Demande de permission
2. Génération de token FCM
3. Envoi de notification de test
4. Réception en arrière-plan
5. Clic sur notification

#### Outils de Debug
- Console Firebase : https://console.firebase.google.com
- Logs du service worker
- Test de notifications dans le navigateur

### 8. Améliorations Futures

#### Fonctionnalités à Ajouter
- [ ] Notifications programmées
- [ ] Templates de notifications
- [ ] Préférences utilisateur
- [ ] Notifications par email/SMS
- [ ] Analytics des notifications

#### Optimisations
- [ ] Cache des tokens FCM
- [ ] Gestion des tokens expirés
- [ ] Retry automatique
- [ ] Compression des payloads
