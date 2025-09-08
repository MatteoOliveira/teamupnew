# Configuration Firebase - Domaine autorisé

## Problème
"Domaine non autorisé pour connexion Google" sur mobile et PC

## Solution : Configuration Firebase Console

### 1. Firebase Console - Domaines autorisés

1. **Aller sur** : https://console.firebase.google.com
2. **Sélectionner le projet** : `teamup-7a2d6`
3. **Aller dans** : Authentication → Settings
4. **Dans "Authorized domains"** :
   - Cliquer sur "Add domain"
   - Ajouter : `teamupnew.vercel.app` (URL réelle)
   - Ajouter : `teamup-fawn.vercel.app` (au cas où)
   - Cliquer sur "Done"
   - Vérifier que `localhost` est présent

### 2. Firebase Console - Configuration OAuth

1. **Aller dans** : Authentication → Sign-in method
2. **Cliquer sur Google**
3. **Vérifier** :
   - ✅ Google est **ACTIVÉ** (bouton ON)
   - ✅ **Nom public du projet** : `TeamUp - Application Sportive`
   - ✅ **Email de support** : configuré

### 3. Google Cloud Console - URIs de redirection

1. **Aller sur** : https://console.cloud.google.com
2. **Sélectionner le projet** : `teamup-7a2d6`
3. **Aller dans** : APIs & Services → Credentials
4. **Cliquer sur** : OAuth 2.0 Client ID (Web client)
5. **Dans "Authorized redirect URIs"** :
   - Ajouter : `https://teamupnew.vercel.app/__/auth/handler` (URL réelle)
   - Ajouter : `https://teamup-fawn.vercel.app/__/auth/handler` (au cas où)
   - Ajouter : `http://localhost:3000/__/auth/handler`
   - Cliquer sur "Save"

### 4. Vérification

Après configuration, tester :
- **PC** : http://localhost:3000 (développement)
- **Mobile** : https://teamupnew.vercel.app (production)

### 5. Dépannage

Si ça ne fonctionne toujours pas :
1. Attendre 5-10 minutes (propagation DNS)
2. Vider le cache du navigateur
3. Tester en navigation privée
4. Vérifier les logs de la console du navigateur

## URLs importantes
- **Firebase Console** : https://console.firebase.google.com/project/teamup-7a2d6
- **Google Cloud Console** : https://console.cloud.google.com/apis/credentials?project=teamup-7a2d6
- **App en production** : https://teamupnew.vercel.app
