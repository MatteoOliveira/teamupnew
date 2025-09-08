# Correction Google OAuth Mobile

## Problème
"the requested action is invalid" sur mobile avec Google OAuth

## Solutions implémentées

### 1. Code modifié
- Détection mobile/desktop automatique
- `signInWithRedirect` sur mobile
- `signInWithPopup` sur desktop
- Gestion des résultats de redirection

### 2. Configuration Firebase Console requise

#### A. Vérifier les domaines autorisés
1. Aller dans Firebase Console → Authentication → Settings
2. Dans "Authorized domains", ajouter :
   - `teamup-fawn.vercel.app` (production)
   - `localhost` (développement)
   - Votre domaine de test si nécessaire

#### B. Vérifier la configuration OAuth
1. Aller dans Authentication → Sign-in method
2. Cliquer sur Google
3. Vérifier que :
   - Google est activé
   - Le "Nom public du projet" est "TeamUp - Application Sportive"
   - L'email de support est configuré

#### C. Vérifier les paramètres OAuth
1. Dans Google Cloud Console (console.cloud.google.com)
2. Aller dans APIs & Services → Credentials
3. Sélectionner votre OAuth 2.0 Client ID
4. Vérifier les "Authorized redirect URIs" :
   - `https://teamup-fawn.vercel.app/__/auth/handler`
   - `http://localhost:3000/__/auth/handler` (pour dev)

## Test
1. Déployer les modifications
2. Tester sur mobile : https://teamup-fawn.vercel.app
3. Cliquer sur "Se connecter avec Google"
4. La redirection devrait fonctionner correctement

## Notes
- La redirection mobile peut prendre quelques secondes
- L'utilisateur sera redirigé vers Google, puis de retour sur l'app
- Le token sera automatiquement récupéré
