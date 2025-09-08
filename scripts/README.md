# Scripts de Test pour TeamUp

Ces scripts permettent de créer et supprimer des événements de test pour valider le fonctionnement du système de vérification des conflits.

## 🚀 Installation

```bash
cd scripts
npm install
```

## 📝 Utilisation

### 1. Créer des événements de test

```bash
npm run create-events
```

Ce script crée 8 événements de test avec différents scénarios :

#### Événements au Stade Municipal (Paris, 75001)
- **14h-16h** : Match de Football (réservé) - `test-user-1`
- **15h-17h** : Football Conflit Test 1 (réservé) - `test-user-7` ⚠️ **CONFLIT**
- **16h-18h** : Football Conflit Test 2 (réservé) - `test-user-8` ⚠️ **CONFLIT** (règle des 5 min)
- **18h-20h** : Entraînement Football (réservé) - `test-user-2`
- **Demain 10h-12h** : Tournoi de Tennis (non réservé) - `test-user-3`

#### Événements à la Salle de Sport (Paris, 75002)
- **9h-10h** : Cours de Yoga (réservé) - `test-user-4`
- **19h-21h** : Musculation (réservé) - `test-user-5`

#### Événements au Parc (Paris, 75019)
- **Après-demain 15h-17h** : Basketball (non réservé) - `test-user-6`

### 2. Nettoyer les événements de test

```bash
npm run cleanup-events
```

Ce script supprime tous les événements créés par les utilisateurs de test.

### 3. Test complet

```bash
npm run test
```

Crée les événements, affiche les instructions de test, puis vous pouvez exécuter le cleanup.

## 🧪 Scénarios de Test

### Test 1 : Conflit de réservation
1. Allez sur la page de création d'événement
2. Remplissez les champs :
   - **Lieu** : "Stade Municipal"
   - **Ville** : "Paris"
   - **Date** : Aujourd'hui 14h-16h
3. ✅ **Résultat attendu** : Checkbox désactivée, message "Lieu non réservable"

### Test 2 : Règle des 5 minutes
1. Créez un événement :
   - **Lieu** : "Stade Municipal"
   - **Ville** : "Paris"
   - **Date** : Aujourd'hui 16h-18h
2. ✅ **Résultat attendu** : Conflit détecté (chevauche avec 15h-17h)

### Test 3 : Pas de conflit
1. Créez un événement :
   - **Lieu** : "Stade Municipal"
   - **Ville** : "Paris"
   - **Date** : Demain 10h-12h
2. ✅ **Résultat attendu** : Pas de conflit, checkbox activée

### Test 4 : Autocomplétion d'adresse
1. Dans le champ "Adresse complète", tapez "1 Place de la Concorde"
2. Sélectionnez une suggestion
3. ✅ **Résultat attendu** : Ville et code postal auto-remplis et verrouillés

## 🔧 Configuration

Assurez-vous que les variables d'environnement Firebase sont configurées dans votre `.env.local` :

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## ⚠️ Important

- Ces scripts créent des événements avec des utilisateurs de test fictifs
- N'oubliez pas de nettoyer après vos tests avec `npm run cleanup-events`
- Les événements de test n'apparaîtront pas dans votre profil car ils sont créés avec des UIDs fictifs
