# 🗄️ Base de Données Firestore

## 📝 Description Simple

Firestore est la base de données de TeamUp qui stocke toutes les informations : profils utilisateurs, événements sportifs, participations, messages, et notifications. C'est une base de données "NoSQL" qui fonctionne en temps réel et s'adapte automatiquement à la charge.

## 🔧 Description Technique

### Architecture Firestore

Firestore est une base de données **NoSQL document-oriented** qui offre :
- **Temps réel** : Synchronisation automatique des données
- **Scalabilité** : Gestion automatique de la charge
- **Sécurité** : Règles de sécurité intégrées
- **Offline** : Fonctionnement hors ligne
- **Multi-région** : Réplication globale

### Structure des Collections

```
Firestore Database
├── users/                          # Profils utilisateurs
│   ├── {userId}/
│   │   ├── email: string
│   │   ├── name: string
│   │   ├── city: string
│   │   ├── createdAt: timestamp
│   │   ├── fcmToken: string
│   │   └── fcmTokenUpdated: timestamp
├── events/                         # Événements sportifs
│   ├── {eventId}/
│   │   ├── name: string
│   │   ├── sport: string
│   │   ├── sportEmoji: string
│   │   ├── sportColor: string
│   │   ├── city: string
│   │   ├── location: string
│   │   ├── address: string
│   │   ├── postcode: string
│   │   ├── lat: number
│   │   ├── lng: number
│   │   ├── date: string
│   │   ├── endDate: string
│   │   ├── description: string
│   │   ├── maxParticipants: number
│   │   ├── contactInfo: string
│   │   ├── createdBy: string
│   │   ├── createdAt: timestamp
│   │   └── isReserved: boolean
├── event_participants/             # Participations aux événements
│   ├── {participantId}/
│   │   ├── eventId: string
│   │   ├── userId: string
│   │   ├── userName: string
│   │   ├── userEmail: string
│   │   ├── joinedAt: timestamp
│   │   └── eventCreatedBy: string
├── messages/                       # Messages entre participants
│   ├── {messageId}/
│   │   ├── eventId: string
│   │   ├── userId: string
│   │   ├── userName: string
│   │   ├── content: string
│   │   ├── createdAt: timestamp
│   │   └── type: string
├── notifications/                  # Notifications utilisateur
│   ├── {notificationId}/
│   │   ├── userId: string
│   │   ├── title: string
│   │   ├── body: string
│   │   ├── eventId: string
│   │   ├── data: object
│   │   ├── type: string
│   │   ├── createdAt: timestamp
│   │   └── read: boolean
└── analytics/                      # Données d'analytics
    ├── {analyticsId}/
    │   ├── userId: string
    │   ├── event: string
    │   ├── data: object
    │   └── timestamp: timestamp
```

### 1. Collection Users

#### Structure du Document
```typescript
interface User {
  email: string;
  name?: string;
  city?: string;
  createdAt: Date;
  fcmToken?: string;
  fcmTokenUpdated?: Date;
  pushNotificationsEnabled?: boolean;
  analyticsEnabled?: boolean;
  marketingEnabled?: boolean;
}
```

#### Opérations CRUD
```typescript
// Créer un utilisateur
const createUser = async (userId: string, userData: User) => {
  try {
    await setDoc(doc(db, 'users', userId), {
      ...userData,
      createdAt: new Date()
    });
  } catch (error) {
    console.error('Erreur création utilisateur:', error);
  }
};

// Lire un utilisateur
const getUser = async (userId: string) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      return { id: userDoc.id, ...userDoc.data() };
    }
    return null;
  } catch (error) {
    console.error('Erreur lecture utilisateur:', error);
    return null;
  }
};

// Mettre à jour un utilisateur
const updateUser = async (userId: string, updates: Partial<User>) => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      ...updates,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Erreur mise à jour utilisateur:', error);
  }
};

// Supprimer un utilisateur
const deleteUser = async (userId: string) => {
  try {
    await deleteDoc(doc(db, 'users', userId));
  } catch (error) {
    console.error('Erreur suppression utilisateur:', error);
  }
};
```

### 2. Collection Events

#### Structure du Document
```typescript
interface Event {
  id: string;
  name: string;
  sport: string;
  sportEmoji: string;
  sportColor: string;
  city: string;
  location: string;
  address: string;
  postcode: string;
  lat: number;
  lng: number;
  date: string;
  endDate: string;
  description: string;
  maxParticipants: number;
  contactInfo: string;
  createdBy: string;
  createdAt: Date;
  isReserved: boolean;
}
```

#### Requêtes Complexes
```typescript
// Récupérer les événements futurs
const getFutureEvents = async () => {
  try {
    const now = new Date();
    const eventsQuery = query(
      collection(db, 'events'),
      where('date', '>=', now.toISOString()),
      orderBy('date', 'asc'),
      limit(20)
    );
    
    const eventsSnapshot = await getDocs(eventsQuery);
    return eventsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Erreur récupération événements:', error);
    return [];
  }
};

// Récupérer les événements par ville
const getEventsByCity = async (city: string) => {
  try {
    const eventsQuery = query(
      collection(db, 'events'),
      where('city', '==', city),
      where('date', '>=', new Date().toISOString()),
      orderBy('date', 'asc')
    );
    
    const eventsSnapshot = await getDocs(eventsQuery);
    return eventsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Erreur récupération événements par ville:', error);
    return [];
  }
};

// Récupérer les événements créés par un utilisateur
const getEventsByUser = async (userId: string) => {
  try {
    const eventsQuery = query(
      collection(db, 'events'),
      where('createdBy', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const eventsSnapshot = await getDocs(eventsQuery);
    return eventsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Erreur récupération événements utilisateur:', error);
    return [];
  }
};
```

### 3. Collection Event Participants

#### Structure du Document
```typescript
interface EventParticipant {
  id: string;
  eventId: string;
  userId: string;
  userName: string;
  userEmail: string;
  joinedAt: Date;
  eventCreatedBy: string;
}
```

#### Gestion des Participations
```typescript
// Rejoindre un événement
const joinEvent = async (eventId: string, userId: string, userData: any) => {
  try {
    // Vérifier si l'utilisateur n'est pas déjà inscrit
    const existingParticipant = await getParticipant(eventId, userId);
    if (existingParticipant) {
      throw new Error('Utilisateur déjà inscrit');
    }

    // Vérifier la capacité de l'événement
    const event = await getEvent(eventId);
    const currentParticipants = await getEventParticipantsCount(eventId);
    
    if (currentParticipants >= event.maxParticipants) {
      throw new Error('Événement complet');
    }

    // Ajouter le participant
    await addDoc(collection(db, 'event_participants'), {
      eventId,
      userId,
      userName: userData.name,
      userEmail: userData.email,
      joinedAt: new Date(),
      eventCreatedBy: event.createdBy
    });

    return true;
  } catch (error) {
    console.error('Erreur inscription événement:', error);
    throw error;
  }
};

// Quitter un événement
const leaveEvent = async (eventId: string, userId: string) => {
  try {
    const participantQuery = query(
      collection(db, 'event_participants'),
      where('eventId', '==', eventId),
      where('userId', '==', userId)
    );
    
    const participantSnapshot = await getDocs(participantQuery);
    
    if (participantSnapshot.empty) {
      throw new Error('Participation non trouvée');
    }

    // Supprimer la participation
    await deleteDoc(participantSnapshot.docs[0].ref);
    return true;
  } catch (error) {
    console.error('Erreur désinscription événement:', error);
    throw error;
  }
};

// Récupérer les participants d'un événement
const getEventParticipants = async (eventId: string) => {
  try {
    const participantsQuery = query(
      collection(db, 'event_participants'),
      where('eventId', '==', eventId),
      orderBy('joinedAt', 'asc')
    );
    
    const participantsSnapshot = await getDocs(participantsQuery);
    return participantsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Erreur récupération participants:', error);
    return [];
  }
};
```

### 4. Collection Messages

#### Structure du Document
```typescript
interface Message {
  id: string;
  eventId: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: Date;
  type: 'text' | 'system' | 'notification';
}
```

#### Système de Messaging
```typescript
// Envoyer un message
const sendMessage = async (eventId: string, userId: string, content: string, userName: string) => {
  try {
    await addDoc(collection(db, 'messages'), {
      eventId,
      userId,
      userName,
      content: sanitizeInput(content),
      createdAt: new Date(),
      type: 'text'
    });
  } catch (error) {
    console.error('Erreur envoi message:', error);
  }
};

// Écouter les messages en temps réel
const listenToMessages = (eventId: string, callback: (messages: Message[]) => void) => {
  const messagesQuery = query(
    collection(db, 'messages'),
    where('eventId', '==', eventId),
    orderBy('createdAt', 'asc'),
    limit(50)
  );

  return onSnapshot(messagesQuery, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(messages);
  });
};
```

### 5. Collection Notifications

#### Structure du Document
```typescript
interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  eventId: string;
  data: {
    eventId: string;
    action: string;
  };
  type: string;
  createdAt: Date;
  read: boolean;
}
```

#### Gestion des Notifications
```typescript
// Créer une notification
const createNotification = async (notification: Omit<Notification, 'id'>) => {
  try {
    await addDoc(collection(db, 'notifications'), {
      ...notification,
      createdAt: new Date(),
      read: false
    });
  } catch (error) {
    console.error('Erreur création notification:', error);
  }
};

// Marquer une notification comme lue
const markNotificationAsRead = async (notificationId: string) => {
  try {
    await updateDoc(doc(db, 'notifications', notificationId), {
      read: true,
      readAt: new Date()
    });
  } catch (error) {
    console.error('Erreur marquage notification:', error);
  }
};

// Récupérer les notifications non lues
const getUnreadNotifications = async (userId: string) => {
  try {
    const notificationsQuery = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      where('read', '==', false),
      orderBy('createdAt', 'desc'),
      limit(10)
    );
    
    const notificationsSnapshot = await getDocs(notificationsQuery);
    return notificationsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Erreur récupération notifications:', error);
    return [];
  }
};
```

### 6. Règles de Sécurité Firestore

#### Configuration des Règles
```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Utilisateurs : accès limité au propriétaire
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Événements : lecture publique, écriture limitée
    match /events/{eventId} {
      allow read: if true; // Tous peuvent lire
      allow create: if request.auth != null 
        && request.auth.uid == resource.data.createdBy;
      allow update: if request.auth != null 
        && request.auth.uid == resource.data.createdBy;
      allow delete: if request.auth != null 
        && request.auth.uid == resource.data.createdBy;
    }
    
    // Participants : accès limité aux participants et organisateur
    match /event_participants/{participantId} {
      allow read, write: if request.auth != null 
        && (request.auth.uid == resource.data.userId 
            || request.auth.uid == resource.data.eventCreatedBy);
    }
    
    // Messages : accès limité aux participants de l'événement
    match /messages/{messageId} {
      allow read, write: if request.auth != null 
        && request.auth.uid == resource.data.userId;
    }
    
    // Notifications : accès limité au destinataire
    match /notifications/{notificationId} {
      allow read, write: if request.auth != null 
        && request.auth.uid == resource.data.userId;
    }
    
    // Analytics : accès limité au propriétaire
    match /analytics/{analyticsId} {
      allow read, write: if request.auth != null 
        && request.auth.uid == resource.data.userId;
    }
  }
}
```

### 7. Index Firestore

#### Index Composés Requis
```javascript
// Index pour les événements futurs par ville
// Collection: events
// Fields: city (Ascending), date (Ascending)

// Index pour les participants par événement
// Collection: event_participants
// Fields: eventId (Ascending), joinedAt (Ascending)

// Index pour les messages par événement
// Collection: messages
// Fields: eventId (Ascending), createdAt (Ascending)

// Index pour les notifications par utilisateur
// Collection: notifications
// Fields: userId (Ascending), createdAt (Descending)
```

#### Création d'Index
```typescript
// Les index sont créés automatiquement lors des requêtes
// Mais peuvent être créés manuellement dans la console Firebase

const createIndex = async () => {
  // Index pour événements futurs par ville
  const eventsIndex = {
    collectionGroup: 'events',
    fields: [
      { fieldPath: 'city', order: 'ASCENDING' },
      { fieldPath: 'date', order: 'ASCENDING' }
    ]
  };
  
  // Index pour participants par événement
  const participantsIndex = {
    collectionGroup: 'event_participants',
    fields: [
      { fieldPath: 'eventId', order: 'ASCENDING' },
      { fieldPath: 'joinedAt', order: 'ASCENDING' }
    ]
  };
};
```

### 8. Optimisations Performance

#### Requêtes Optimisées
```typescript
// Utiliser des requêtes avec limite
const getRecentEvents = async (limit: number = 10) => {
  const eventsQuery = query(
    collection(db, 'events'),
    where('date', '>=', new Date().toISOString()),
    orderBy('date', 'asc'),
    limit(limit)
  );
  
  const eventsSnapshot = await getDocs(eventsQuery);
  return eventsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Utiliser des requêtes avec pagination
const getEventsWithPagination = async (lastDoc?: DocumentSnapshot, limit: number = 10) => {
  let eventsQuery = query(
    collection(db, 'events'),
    where('date', '>=', new Date().toISOString()),
    orderBy('date', 'asc'),
    limit(limit)
  );
  
  if (lastDoc) {
    eventsQuery = query(eventsQuery, startAfter(lastDoc));
  }
  
  const eventsSnapshot = await getDocs(eventsQuery);
  return {
    events: eventsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })),
    lastDoc: eventsSnapshot.docs[eventsSnapshot.docs.length - 1]
  };
};
```

#### Cache et Offline
```typescript
// Configuration du cache
import { enableNetwork, disableNetwork } from 'firebase/firestore';

// Désactiver le réseau pour le mode offline
const enableOfflineMode = async () => {
  await disableNetwork(db);
};

// Réactiver le réseau
const enableOnlineMode = async () => {
  await enableNetwork(db);
};

// Écouter les changements de connectivité
const listenToConnectivity = () => {
  window.addEventListener('online', enableOnlineMode);
  window.addEventListener('offline', enableOfflineMode);
};
```

### 9. Gestion des Erreurs

#### Types d'Erreurs Firestore
```typescript
const handleFirestoreError = (error: any) => {
  switch (error.code) {
    case 'permission-denied':
      return 'Permission refusée';
    case 'not-found':
      return 'Document non trouvé';
    case 'already-exists':
      return 'Document déjà existant';
    case 'resource-exhausted':
      return 'Quota dépassé';
    case 'failed-precondition':
      return 'Index manquant';
    case 'unavailable':
      return 'Service indisponible';
    default:
      return 'Erreur inconnue';
  }
};
```

#### Retry Logic
```typescript
const retryOperation = async (operation: () => Promise<any>, maxRetries: number = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      
      // Attendre avant de réessayer
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
};
```

### 10. Monitoring et Analytics

#### Métriques Firestore
```typescript
// Suivre les opérations Firestore
const trackFirestoreOperation = (operation: string, collection: string, success: boolean) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'firestore_operation', {
      operation_type: operation,
      collection_name: collection,
      success: success,
      timestamp: new Date().toISOString()
    });
  }
};

// Wrapper pour les opérations Firestore
const trackedGetDoc = async (docRef: DocumentReference) => {
  try {
    const result = await getDoc(docRef);
    trackFirestoreOperation('read', docRef.parent.id, true);
    return result;
  } catch (error) {
    trackFirestoreOperation('read', docRef.parent.id, false);
    throw error;
  }
};
```

### 11. Tests et Debugging

#### Tests Unitaires Firestore
```typescript
// Tests avec Firebase Emulator
import { initializeTestEnvironment } from '@firebase/rules-unit-testing';

const setupTestEnvironment = async () => {
  const testEnv = await initializeTestEnvironment({
    projectId: 'test-project',
    firestore: {
      rules: fs.readFileSync('firestore.rules', 'utf8'),
    },
  });
  
  return testEnv;
};

// Test de création d'événement
const testCreateEvent = async () => {
  const testEnv = await setupTestEnvironment();
  
  const context = testEnv.authenticatedContext('user1');
  const firestore = context.firestore();
  
  await firestore.collection('events').add({
    name: 'Test Event',
    createdBy: 'user1',
    createdAt: new Date()
  });
  
  const events = await firestore.collection('events').get();
  expect(events.docs.length).toBe(1);
};
```

### 12. Améliorations Futures

#### Optimisations à Implémenter
- [ ] **Sharding** : Répartition des données sur plusieurs collections
- [ ] **Caching** : Cache Redis pour les requêtes fréquentes
- [ ] **Archiving** : Archivage des anciens événements
- [ ] **Compression** : Compression des données volumineuses
- [ ] **Backup** : Sauvegarde automatique des données
- [ ] **Replication** : Réplication multi-région
- [ ] **Analytics** : Métriques détaillées d'utilisation
- [ ] **Cleanup** : Nettoyage automatique des données obsolètes
