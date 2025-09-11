# 🔒 Règles de Sécurité Firestore

## 📝 Vue d'ensemble

Ce document détaille les règles de sécurité Firestore mises en place pour l'application TeamUp. Ces règles garantissent que seuls les utilisateurs autorisés peuvent accéder et modifier les données, tout en respectant les principes de sécurité et de confidentialité.

## 🎯 Objectifs de Sécurité

- **Authentification obligatoire** : Toutes les opérations nécessitent une authentification
- **Autorisation granulaire** : Accès basé sur les rôles et la propriété des données
- **Validation des données** : Contrôle de l'intégrité des données avant écriture
- **Isolation des utilisateurs** : Chaque utilisateur ne peut accéder qu'à ses propres données
- **Protection des conversations** : Accès restreint aux membres des chats d'événements

## 🏗️ Architecture des Règles

### Structure Générale

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Règles par collection
  }
}
```

### Collections Protégées

1. **`users/`** - Profils utilisateurs
2. **`events/`** - Événements sportifs
3. **`event_participants/`** - Participations aux événements
4. **`event_chats/`** - Chats d'événements
5. **`event_chats/{eventId}/members/`** - Membres des chats
6. **`event_chats/{eventId}/messages/`** - Messages des chats

## 🔐 Règles Détaillées par Collection

### 1. Collection Users (`/users/{userId}`)

#### Principe de Sécurité
- **Accès exclusif** : Seul le propriétaire du compte peut lire et modifier ses données
- **Validation stricte** : Contrôle de l'intégrité des données utilisateur

#### Règles Implémentées

```javascript
match /users/{userId} {
  // Lecture et écriture uniquement pour le propriétaire
  allow read, write: if request.auth != null && request.auth.uid == userId;
  
  // Validation des données utilisateur
  allow create: if request.auth != null && 
    request.auth.uid == userId &&
    isValidUserData(request.resource.data);
  
  allow update: if request.auth != null && 
    request.auth.uid == userId &&
    isValidUserData(request.resource.data);
}
```

#### Fonction de Validation

```javascript
function isValidUserData(data) {
  return data.keys().hasAll(['name', 'sport', 'city']) &&
    data.name is string && data.name.size() >= 2 && data.name.size() <= 50 &&
    data.sport is string && data.sport.size() >= 2 && data.sport.size() <= 30 &&
    data.city is string && data.city.size() >= 2 && data.city.size() <= 50 &&
    (!data.keys().hasAny(['email']) || (data.email is string && data.email.matches('.*@.*\\..*')));
}
```

#### Champs Validés
- **`name`** : 2-50 caractères, obligatoire
- **`sport`** : 2-30 caractères, obligatoire
- **`city`** : 2-50 caractères, obligatoire
- **`email`** : Format email valide, optionnel

### 2. Collection Events (`/events/{eventId}`)

#### Principe de Sécurité
- **Lecture publique** : Tous les utilisateurs authentifiés peuvent lire les événements
- **Création contrôlée** : Seuls les utilisateurs authentifiés peuvent créer des événements
- **Modification restreinte** : Seul le créateur peut modifier/supprimer son événement

#### Règles Implémentées

```javascript
match /events/{eventId} {
  // Lecture publique pour tous les utilisateurs authentifiés
  allow read: if request.auth != null;
  
  // Création uniquement par des utilisateurs authentifiés
  allow create: if request.auth != null && 
    request.auth.uid == request.resource.data.createdBy &&
    isValidEventData(request.resource.data);
  
  // Modification uniquement par le créateur
  allow update: if request.auth != null && 
    request.auth.uid == resource.data.createdBy &&
    isValidEventData(request.resource.data);
  
  // Suppression uniquement par le créateur
  allow delete: if request.auth != null && 
    request.auth.uid == resource.data.createdBy;
}
```

#### Fonction de Validation

```javascript
function isValidEventData(data) {
  return data.keys().hasAll(['name', 'sport', 'city', 'date', 'location', 'description', 'createdBy']) &&
    data.name is string && data.name.size() >= 3 && data.name.size() <= 100 &&
    data.sport is string && data.sport.size() >= 2 && data.sport.size() <= 30 &&
    data.city is string && data.city.size() >= 2 && data.city.size() <= 50 &&
    data.location is string && data.location.size() >= 5 && data.location.size() <= 200 &&
    data.description is string && data.description.size() >= 10 && data.description.size() <= 1000 &&
    data.createdBy is string &&
    data.date is timestamp &&
    (!data.keys().hasAny(['lat']) || (data.lat is number && data.lat >= -90 && data.lat <= 90)) &&
    (!data.keys().hasAny(['lng']) || (data.lng is number && data.lng >= -180 && data.lng <= 180));
}
```

#### Champs Validés
- **`name`** : 3-100 caractères, obligatoire
- **`sport`** : 2-30 caractères, obligatoire
- **`city`** : 2-50 caractères, obligatoire
- **`location`** : 5-200 caractères, obligatoire
- **`description`** : 10-1000 caractères, obligatoire
- **`createdBy`** : ID utilisateur, obligatoire
- **`date`** : Timestamp, obligatoire
- **`lat`** : -90 à 90, optionnel
- **`lng`** : -180 à 180, optionnel

### 3. Collection Event Participants (`/event_participants/{participationId}`)

#### Principe de Sécurité
- **Lecture publique** : Tous les utilisateurs authentifiés peuvent voir les participations
- **Création contrôlée** : Seul l'utilisateur concerné peut s'inscrire
- **Suppression contrôlée** : Seul l'utilisateur concerné peut se désinscrire

#### Règles Implémentées

```javascript
match /event_participants/{participationId} {
  // Lecture pour tous les utilisateurs authentifiés
  allow read: if request.auth != null;
  
  // Création uniquement par l'utilisateur concerné
  allow create: if request.auth != null && 
    request.auth.uid == request.resource.data.userId &&
    isValidParticipationData(request.resource.data);
  
  // Suppression uniquement par l'utilisateur concerné
  allow delete: if request.auth != null && 
    request.auth.uid == resource.data.userId;
}
```

#### Fonction de Validation

```javascript
function isValidParticipationData(data) {
  return data.keys().hasAll(['userId', 'eventId', 'userName', 'contact', 'registeredAt']) &&
    data.userId is string &&
    data.eventId is string &&
    data.userName is string && data.userName.size() >= 2 && data.userName.size() <= 50 &&
    data.contact is string && data.contact.size() >= 5 && data.contact.size() <= 100 &&
    data.registeredAt is timestamp;
}
```

### 4. Collection Event Chats (`/event_chats/{eventId}`)

#### Principe de Sécurité
- **Accès restreint** : Seuls les membres du chat peuvent lire et écrire
- **Création contrôlée** : Seul le créateur de l'événement peut créer le chat

#### Règles Implémentées

```javascript
match /event_chats/{eventId} {
  // Lecture et écriture uniquement pour les membres du chat
  allow read, write: if request.auth != null && 
    exists(/databases/$(database)/documents/event_chats/$(eventId)/members/$(request.auth.uid));
  
  // Création du chat uniquement par le créateur de l'événement
  allow create: if request.auth != null && 
    request.auth.uid == get(/databases/$(database)/documents/events/$(eventId)).data.createdBy;
}
```

### 5. Collection Chat Members (`/event_chats/{eventId}/members/{userId}`)

#### Principe de Sécurité
- **Lecture restreinte** : Seuls les membres du chat peuvent voir la liste des membres
- **Ajout contrôlé** : Le créateur de l'événement ou l'utilisateur lui-même peut s'ajouter
- **Suppression contrôlée** : L'utilisateur concerné ou le créateur peut supprimer

#### Règles Implémentées

```javascript
match /event_chats/{eventId}/members/{userId} {
  // Lecture pour tous les membres du chat
  allow read: if request.auth != null && 
    exists(/databases/$(database)/documents/event_chats/$(eventId)/members/$(request.auth.uid));
  
  // Ajout uniquement par le créateur de l'événement ou l'utilisateur lui-même
  allow create: if request.auth != null && 
    (request.auth.uid == userId || 
     request.auth.uid == get(/databases/$(database)/documents/events/$(eventId)).data.createdBy);
  
  // Suppression uniquement par l'utilisateur concerné ou le créateur
  allow delete: if request.auth != null && 
    (request.auth.uid == userId || 
     request.auth.uid == get(/databases/$(database)/documents/events/$(eventId)).data.createdBy);
}
```

### 6. Collection Messages (`/event_chats/{eventId}/messages/{messageId}`)

#### Principe de Sécurité
- **Lecture restreinte** : Seuls les membres du chat peuvent lire les messages
- **Création contrôlée** : Seuls les membres du chat peuvent envoyer des messages
- **Modification restreinte** : Seul l'auteur peut modifier son message
- **Suppression restreinte** : Seul l'auteur peut supprimer son message

#### Règles Implémentées

```javascript
match /event_chats/{eventId}/messages/{messageId} {
  // Lecture uniquement pour les membres du chat
  allow read: if request.auth != null && 
    exists(/databases/$(database)/documents/event_chats/$(eventId)/members/$(request.auth.uid));
  
  // Création uniquement par les membres du chat
  allow create: if request.auth != null && 
    request.auth.uid == request.resource.data.senderId &&
    exists(/databases/$(database)/documents/event_chats/$(eventId)/members/$(request.auth.uid)) &&
    isValidMessageData(request.resource.data);
  
  // Modification uniquement par l'auteur du message
  allow update: if request.auth != null && 
    request.auth.uid == resource.data.senderId &&
    isValidMessageData(request.resource.data);
  
  // Suppression uniquement par l'auteur du message
  allow delete: if request.auth != null && 
    request.auth.uid == resource.data.senderId;
}
```

#### Fonction de Validation

```javascript
function isValidMessageData(data) {
  return data.keys().hasAll(['senderId', 'senderName', 'content', 'timestamp']) &&
    data.senderId is string &&
    data.senderName is string && data.senderName.size() >= 2 && data.senderName.size() <= 50 &&
    data.content is string && data.content.size() >= 1 && data.content.size() <= 500 &&
    data.timestamp is timestamp;
}
```

## 🛡️ Mécanismes de Protection

### 1. Authentification Obligatoire

Toutes les opérations nécessitent une authentification Firebase valide :

```javascript
// Vérification de l'authentification
request.auth != null
```

### 2. Vérification de Propriété

Les utilisateurs ne peuvent accéder qu'à leurs propres données :

```javascript
// Vérification de propriété
request.auth.uid == userId
```

### 3. Validation des Données

Contrôle de l'intégrité des données avant écriture :

```javascript
// Validation des données
isValidUserData(request.resource.data)
```

### 4. Vérification d'Existence

Vérification de l'existence de documents liés :

```javascript
// Vérification d'existence
exists(/databases/$(database)/documents/event_chats/$(eventId)/members/$(request.auth.uid))
```

### 5. Récupération de Données

Récupération de données pour validation croisée :

```javascript
// Récupération de données
get(/databases/$(database)/documents/events/$(eventId)).data.createdBy
```

## 🔍 Cas d'Usage et Scénarios

### Scénario 1 : Création d'un Événement

1. **Utilisateur authentifié** ✅
2. **Vérification de propriété** : `createdBy == auth.uid` ✅
3. **Validation des données** : Tous les champs requis et valides ✅
4. **Résultat** : Événement créé avec succès

### Scénario 2 : Participation à un Événement

1. **Utilisateur authentifié** ✅
2. **Vérification de propriété** : `userId == auth.uid` ✅
3. **Validation des données** : Données de participation valides ✅
4. **Résultat** : Participation enregistrée

### Scénario 3 : Envoi de Message dans un Chat

1. **Utilisateur authentifié** ✅
2. **Vérification d'appartenance au chat** : Membre du chat ✅
3. **Vérification de propriété** : `senderId == auth.uid` ✅
4. **Validation des données** : Message valide ✅
5. **Résultat** : Message envoyé

### Scénario 4 : Tentative d'Accès Non Autorisé

1. **Utilisateur non authentifié** ❌
2. **Résultat** : Accès refusé

## ⚠️ Limitations et Considérations

### 1. Performance

- **Requêtes croisées** : Les vérifications `exists()` et `get()` peuvent impacter les performances
- **Recommandation** : Limiter le nombre de vérifications croisées par règle

### 2. Complexité

- **Règles imbriquées** : La structure des chats peut rendre les règles complexes
- **Recommandation** : Simplifier la structure si possible

### 3. Maintenance

- **Évolution des règles** : Les modifications nécessitent une attention particulière
- **Recommandation** : Tester les règles avant déploiement

## 🧪 Tests et Validation

### 1. Tests Unitaires

```javascript
// Test de création d'utilisateur
const testCreateUser = async () => {
  const testEnv = await setupTestEnvironment();
  const context = testEnv.authenticatedContext('user1');
  const firestore = context.firestore();
  
  await firestore.collection('users').doc('user1').set({
    name: 'Test User',
    sport: 'Football',
    city: 'Paris'
  });
  
  const userDoc = await firestore.collection('users').doc('user1').get();
  expect(userDoc.exists).toBe(true);
};
```

### 2. Tests d'Intégration

```javascript
// Test de création d'événement
const testCreateEvent = async () => {
  const testEnv = await setupTestEnvironment();
  const context = testEnv.authenticatedContext('user1');
  const firestore = context.firestore();
  
  await firestore.collection('events').add({
    name: 'Test Event',
    sport: 'Football',
    city: 'Paris',
    location: 'Stade de France',
    description: 'Match de football amical',
    createdBy: 'user1',
    date: new Date()
  });
  
  const events = await firestore.collection('events').get();
  expect(events.docs.length).toBe(1);
};
```

### 3. Tests de Sécurité

```javascript
// Test d'accès non autorisé
const testUnauthorizedAccess = async () => {
  const testEnv = await setupTestEnvironment();
  const context = testEnv.authenticatedContext('user1');
  const firestore = context.firestore();
  
  // Tentative d'accès aux données d'un autre utilisateur
  await expect(
    firestore.collection('users').doc('user2').get()
  ).rejects.toThrow('permission-denied');
};
```

## 📊 Monitoring et Audit

### 1. Logs de Sécurité

```javascript
// Logging des tentatives d'accès
const logSecurityEvent = (userId, action, resource, success) => {
  console.log({
    timestamp: new Date().toISOString(),
    userId,
    action,
    resource,
    success,
    ip: request.headers['x-forwarded-for']
  });
};
```

### 2. Métriques de Performance

```javascript
// Suivi des performances des règles
const trackRulePerformance = (ruleName, executionTime) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'firestore_rule_performance', {
      rule_name: ruleName,
      execution_time: executionTime,
      timestamp: new Date().toISOString()
    });
  }
};
```

## 🔄 Évolutions et Améliorations

### 1. Améliorations Prévues

- **Rôles d'administrateur** : Ajout de règles pour les administrateurs
- **Modération** : Règles pour la modération des contenus
- **Audit** : Logs détaillés des actions utilisateur

### 2. Optimisations

- **Cache des règles** : Mise en cache des vérifications fréquentes
- **Index optimisés** : Amélioration des performances des requêtes
- **Règles simplifiées** : Réduction de la complexité des règles

### 3. Sécurité Renforcée

- **Rate limiting** : Limitation du nombre de requêtes par utilisateur
- **Détection d'anomalies** : Surveillance des comportements suspects
- **Chiffrement** : Chiffrement des données sensibles

## 📚 Ressources et Documentation

### 1. Documentation Firebase

- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Rules Language Reference](https://firebase.google.com/docs/firestore/security/rules-language)
- [Testing Security Rules](https://firebase.google.com/docs/firestore/security/test-rules-emulator)

### 2. Bonnes Pratiques

- [Firebase Security Rules Best Practices](https://firebase.google.com/docs/firestore/security/rules-structure)
- [Common Security Rules Patterns](https://firebase.google.com/docs/firestore/security/rules-conditions)

### 3. Outils de Développement

- [Firebase Emulator Suite](https://firebase.google.com/docs/emulator-suite)
- [Firebase CLI](https://firebase.google.com/docs/cli)
- [Firebase Rules Playground](https://firebase.google.com/docs/firestore/security/rules-playground)

## 🎯 Conclusion

Les règles de sécurité Firestore de TeamUp offrent une protection robuste et granulaire des données utilisateur. Elles garantissent :

- **Confidentialité** : Chaque utilisateur ne peut accéder qu'à ses propres données
- **Intégrité** : Validation stricte des données avant écriture
- **Disponibilité** : Accès contrôlé aux fonctionnalités de l'application
- **Traçabilité** : Logs et monitoring des accès

Ces règles évoluent avec l'application et s'adaptent aux nouveaux besoins de sécurité tout en maintenant une performance optimale.
