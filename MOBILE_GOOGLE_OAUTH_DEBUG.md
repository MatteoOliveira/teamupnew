# 🔧 Diagnostic Google OAuth Mobile

## 🚨 Problème
La connexion Google ne fonctionne pas sur mobile (ni PWA ni web), mais fonctionne sur PC.

## 🔍 Étapes de diagnostic

### 1. Vérifier les logs de console
1. Ouvrez https://teamupnew.vercel.app sur mobile
2. Ouvrez les outils de développement (Chrome mobile)
3. Allez dans l'onglet Console
4. Tapez sur "Continuer avec Google"
5. Notez l'erreur exacte qui apparaît

### 2. Vérifier la configuration Google Cloud Console

#### A. Aller dans Google Cloud Console
- URL: https://console.cloud.google.com/apis/credentials
- Projet: teamup-7a2d6

#### B. Vérifier l'OAuth 2.0 Client ID
1. Cliquez sur "Web client (auto created by Google Service)"
2. Vérifiez les "Authorized redirect URIs" :
   ```
   https://teamupnew.vercel.app/__/auth/handler
   https://teamup-fawn.vercel.app/__/auth/handler
   ```

#### C. Vérifier les domaines autorisés
1. Allez dans Firebase Console
2. Authentication → Settings → Authorized domains
3. Vérifiez que ces domaines sont présents :
   ```
   teamupnew.vercel.app
   teamup-fawn.vercel.app
   localhost (pour le développement)
   ```

### 3. Erreurs courantes et solutions

#### Erreur: "unauthorized-domain"
- **Cause** : Le domaine n'est pas autorisé
- **Solution** : Ajouter le domaine dans Firebase Console

#### Erreur: "operation-not-allowed"
- **Cause** : Google OAuth n'est pas activé
- **Solution** : Activer Google dans Firebase Console

#### Erreur: "popup-blocked"
- **Cause** : Le navigateur bloque les popups
- **Solution** : Autoriser les popups pour ce site

#### Erreur: "invalid-credential"
- **Cause** : Configuration OAuth incorrecte
- **Solution** : Vérifier les clés dans Google Cloud Console

### 4. Test de diagnostic

#### Test 1: Vérifier la détection mobile
```javascript
// Dans la console du navigateur mobile
console.log('User Agent:', navigator.userAgent);
console.log('Is Mobile:', /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
```

#### Test 2: Vérifier la configuration Firebase
```javascript
// Dans la console du navigateur mobile
console.log('Firebase Config:', {
  authDomain: 'teamup-7a2d6.firebaseapp.com',
  projectId: 'teamup-7a2d6'
});
```

### 5. Solutions à essayer

#### Solution 1: Vider le cache
1. Chrome mobile → Paramètres → Confidentialité et sécurité
2. Effacer les données de navigation
3. Sélectionner "Images et fichiers en cache"
4. Effacer et recharger

#### Solution 2: Réinstaller la PWA
1. Supprimer l'ancienne PWA de l'écran d'accueil
2. Aller sur https://teamupnew.vercel.app
3. Réinstaller la PWA

#### Solution 3: Vérifier les paramètres de sécurité
1. Vérifier que JavaScript est activé
2. Vérifier que les cookies sont autorisés
3. Vérifier que les popups sont autorisés

## 📱 Test final
1. Aller sur https://teamupnew.vercel.app
2. Ouvrir la console (F12)
3. Taper sur "Continuer avec Google"
4. Noter l'erreur exacte
5. Partager l'erreur pour diagnostic

## 🔗 Liens utiles
- [Firebase Console](https://console.firebase.google.com/project/teamup-7a2d6/authentication/settings)
- [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
- [Test PWA](https://teamupnew.vercel.app/pwa-test.html)
