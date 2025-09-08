# 🧪 Scripts de Test pour TeamUp

Ces scripts permettent de créer et supprimer des événements de test pour valider le système de vérification des conflits.

## 🚀 Utilisation Rapide

### Créer des événements de test
```bash
node create-test-events.js
```

### Nettoyer les événements de test
```bash
node cleanup-test-events.js
```

### Script interactif
```bash
node test-script.js
```

## 📋 Événements de Test Créés

### Stade Municipal (Paris, 75001)
- **14h-16h** : Match de Football (réservé) - `test-user-1`
- **15h-17h** : Football Conflit Test (réservé) - `test-user-2` ⚠️ **CONFLIT**
- **18h-20h** : Entraînement Football (réservé) - `test-user-3`
- **Demain 10h-12h** : Tournoi de Tennis (non réservé) - `test-user-4`

### Salle de Sport (Paris, 75002)
- **9h-10h** : Cours de Yoga (réservé) - `test-user-5`

## 🧪 Scénarios de Test

### Test 1 : Conflit de réservation
1. Créez un événement :
   - **Lieu** : "Stade Municipal"
   - **Ville** : "Paris"
   - **Date** : Aujourd'hui 14h-16h
2. ✅ **Résultat attendu** : Checkbox désactivée, message "Lieu non réservable"

### Test 2 : Chevauchement d'horaires
1. Créez un événement :
   - **Lieu** : "Stade Municipal"
   - **Ville** : "Paris"
   - **Date** : Aujourd'hui 15h-17h
2. ✅ **Résultat attendu** : Conflit détecté

### Test 3 : Pas de conflit
1. Créez un événement :
   - **Lieu** : "Stade Municipal"
   - **Ville** : "Paris"
   - **Date** : Demain 10h-12h
2. ✅ **Résultat attendu** : Pas de conflit, checkbox activée

### Test 4 : Autocomplétion d'adresse
1. Dans "Adresse complète", tapez "1 Place de la Concorde"
2. Sélectionnez une suggestion
3. ✅ **Résultat attendu** : Ville et code postal auto-remplis et verrouillés

## ⚠️ Important

- Les événements de test n'apparaîtront pas dans votre profil (utilisateurs fictifs)
- N'oubliez pas de nettoyer après vos tests
- Les scripts utilisent vos variables d'environnement Firebase
