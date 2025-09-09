# 🔧 Configuration des Index Firebase

## Erreur Actuelle
```
FirebaseError: The query requires an index. You can create it here: https://console.firebase.google.com/v1/r/project/teamup-7a2d6/firestore/indexes?create_composite=...
```

## Solution Rapide

### Option 1 : Lien Direct (Recommandé)
1. **Cliquez sur le lien** fourni dans l'erreur de la console
2. **Connectez-vous** à votre compte Google
3. **Cliquez sur "Créer l'index"** dans Firebase Console
4. **Attendez** que l'index soit créé (2-5 minutes)

### Option 2 : Configuration Manuelle

1. **Allez sur** : https://console.firebase.google.com/project/teamup-7a2d6/firestore/indexes

2. **Cliquez sur "Créer un index"**

3. **Créez ces index composites** :

#### Index 1 - Analytics par utilisateur et timestamp
- **Collection** : `analytics`
- **Champs** :
  - `userId` (Ascending)
  - `timestamp` (Descending)
- **Portée** : Collection

#### Index 2 - Événements par créateur
- **Collection** : `events`
- **Champs** :
  - `createdBy` (Ascending)
  - `createdAt` (Descending)
- **Portée** : Collection

#### Index 3 - Participants par événement
- **Collection** : `event_participants`
- **Champs** :
  - `eventId` (Ascending)
  - `registeredAt` (Descending)
- **Portée** : Collection

## Après Création des Index

1. **Attendez** que les index soient créés (statut "En construction" → "Activé")
2. **Rechargez** l'application
3. **Testez** la page de profil et l'onglet "Statistiques"

## Vérification

Une fois les index créés, l'erreur Firebase devrait disparaître et les statistiques devraient se charger correctement.

## Note

Les index Firebase sont nécessaires pour les requêtes complexes qui utilisent plusieurs champs pour le tri et le filtrage. C'est une étape normale lors du développement d'applications Firebase.

