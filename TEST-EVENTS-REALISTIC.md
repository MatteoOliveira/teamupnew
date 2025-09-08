# 🎮 Scripts de Test Réalistes - TeamUp

Ces scripts permettent de générer des événements de test réalistes pour simuler une utilisation en production et tester le système de détection des conflits.

## 📋 Scripts Disponibles

### 1. `manage-test-events.sh` - Gestionnaire Principal
Script interactif pour gérer tous les événements de test.

```bash
./manage-test-events.sh
```

**Options disponibles :**
- 📊 Voir les statistiques des événements actuels
- 🚀 Générer 50 événements réalistes (simulation production)
- 🧹 Nettoyer TOUS les événements de test
- 🔄 Générer + Nettoyer (reset complet)

### 2. `generate-realistic-events.js` - Génération d'Événements
Génère 50 événements variés avec des données réalistes.

```bash
node generate-realistic-events.js
```

**Caractéristiques :**
- 🏃 **8 sports différents** : Football, Basketball, Tennis, Volleyball, Badminton, Ping-pong, Handball, Rugby
- 📍 **8 lieux réels** : Stade de France, Parc des Princes, Accor Arena, Roland Garros, etc.
- 📅 **Dates étalées** : Événements sur les 30 prochains jours
- ⏰ **Horaires variés** : 8h à 20h, durées de 1 à 3 heures
- 🎯 **70% réservés** : La plupart des événements réservent le lieu
- 👥 **5 utilisateurs de test** : Créateurs variés

### 3. `stats-events.js` - Statistiques
Affiche des statistiques détaillées sur les événements existants.

```bash
node stats-events.js
```

**Informations affichées :**
- Nombre total d'événements
- Répartition réservés/libres
- Sports les plus populaires
- Événements par ville
- Top créateurs
- Prochains événements (7 jours)

### 4. `cleanup-all-test-events.js` - Nettoyage
Supprime TOUS les événements de la base de données.

```bash
node cleanup-all-test-events.js
```

⚠️ **Attention :** Ce script supprime tous les événements !

## 🧪 Scénarios de Test

### Test 1 : Conflit Simple
1. Lancez `./manage-test-events.sh` → Option 2 (Générer)
2. Allez sur la page de création d'événement
3. Saisissez "Parc des Princes" dans l'adresse
4. Choisissez une date/heure qui entre en conflit
5. Observez le message rouge "Endroit non réservable"

### Test 2 : Disponibilité Partielle
1. Créez un événement libre (non réservé) à une adresse
2. Essayez de créer un autre événement au même endroit
3. Observez le message orange "Créneaux disponibles"

### Test 3 : Lieu Libre
1. Choisissez une adresse sans événements
2. Observez le message vert "Aucun événement à cette adresse"

### Test 4 : Buffer de 5 Minutes
1. Créez un événement de 14h à 16h (réservé)
2. Essayez de créer un événement de 15h30 à 17h30
3. Le système devrait détecter le conflit

## 📊 Données Générées

### Lieux de Test
- **Stade de France** (Saint-Denis)
- **Parc des Princes** (Paris 16e)
- **Accor Arena** (Paris 12e)
- **Roland Garros** (Paris 16e)
- **Complexe Sportif de Vincennes**
- **Gymnase des Lilas**
- **Centre Sportif de Montreuil**
- **Salle de Sport de Bagnolet**

### Sports Inclus
- ⚽ Football
- 🏀 Basketball
- 🎾 Tennis
- 🏐 Volleyball
- 🏸 Badminton
- 🏓 Ping-pong
- 🤾 Handball
- 🏉 Rugby

### Types d'Événements
- Match amical
- Tournoi
- Entraînement
- Compétition
- Session libre
- Championnat
- Coupe
- Rencontre
- Défi
- Festival sportif

## 🔧 Prérequis

1. **Node.js** installé
2. **Fichier `.env.local`** avec les clés Firebase :
   ```
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_CLIENT_EMAIL=your-client-email
   FIREBASE_PRIVATE_KEY=your-private-key
   ```

## 🚀 Utilisation Rapide

```bash
# 1. Générer des événements de test
./manage-test-events.sh
# Choisir option 2

# 2. Voir les statistiques
./manage-test-events.sh
# Choisir option 1

# 3. Nettoyer après les tests
./manage-test-events.sh
# Choisir option 3
```

## 🎯 Objectif

Ces scripts permettent de :
- ✅ Tester le système de détection des conflits
- ✅ Simuler une utilisation en production
- ✅ Vérifier les performances avec de nombreuses données
- ✅ Tester différents scénarios d'utilisation
- ✅ Valider l'expérience utilisateur

**Parfait pour tester votre système de réservation de lieux !** 🎉
