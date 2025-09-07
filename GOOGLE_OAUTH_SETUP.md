# Configuration Google OAuth pour TeamUp

## 🔐 Configuration Firebase Console

Pour activer la connexion Google OAuth dans votre application TeamUp, vous devez configurer Google comme fournisseur d'authentification dans Firebase Console.

### Étapes de configuration :

1. **Accédez à Firebase Console**
   - Allez sur [console.firebase.google.com](https://console.firebase.google.com)
   - Sélectionnez votre projet `teamup-7a2d6`

2. **Activez Google Authentication**
   - Dans le menu de gauche, cliquez sur "Authentication"
   - Cliquez sur l'onglet "Sign-in method"
   - Trouvez "Google" dans la liste des fournisseurs
   - Cliquez sur "Google" pour l'activer

3. **Configurez Google OAuth**
   - Activez le toggle "Enable"
   - Ajoutez un nom de projet de support (ex: "TeamUp Support")
   - Ajoutez une adresse email de support (votre email)
   - Cliquez sur "Save"

4. **Configurez les domaines autorisés**
   - Dans l'onglet "Authorized domains"
   - Ajoutez vos domaines de production si nécessaire
   - Les domaines locaux (localhost) sont déjà autorisés par défaut

## 🚀 Fonctionnalités implémentées

### ✅ Connexion Google OAuth
- Bouton "Continuer avec Google" sur les pages de connexion et d'inscription
- Gestion des erreurs spécifiques (popup bloqué, annulation, etc.)
- Interface utilisateur cohérente avec le design existant

### ✅ Gestion des erreurs
- Popup fermé par l'utilisateur
- Popup bloqué par le navigateur
- Connexion annulée
- Erreurs génériques

### ✅ Expérience utilisateur
- États de chargement séparés pour Google OAuth
- Icône Google officielle
- Design responsive et accessible

## 🔧 Code implémenté

### Configuration Firebase (`src/lib/firebase.ts`)
```typescript
import { GoogleAuthProvider } from 'firebase/auth';

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});
```

### Hook d'authentification (`src/hooks/useAuth.ts`)
```typescript
const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Erreur de connexion Google:', error);
    throw error;
  }
};
```

### Interface utilisateur
- Pages de connexion et d'inscription mises à jour
- Bouton Google avec icône officielle
- Séparateur visuel "Ou" entre les méthodes d'authentification

## 🧪 Test de la fonctionnalité

1. **Démarrez l'application**
   ```bash
   npm run dev
   ```

2. **Testez la connexion Google**
   - Allez sur `/login` ou `/register`
   - Cliquez sur "Continuer avec Google"
   - Autorisez les popups si demandé
   - Sélectionnez un compte Google
   - Vérifiez la redirection vers `/profile`

## ⚠️ Notes importantes

- **Popups** : Les navigateurs peuvent bloquer les popups. Assurez-vous d'autoriser les popups pour localhost
- **Domaine de production** : N'oubliez pas d'ajouter votre domaine de production dans les domaines autorisés Firebase
- **Sécurité** : Google OAuth est sécurisé par défaut, mais assurez-vous que votre configuration Firebase est correcte

## 🔄 Prochaines étapes

Une fois Google OAuth configuré et testé, vous pouvez :
1. Tester la fonctionnalité complète
2. Déployer en production
3. Ajouter d'autres fournisseurs OAuth (Facebook, Apple, etc.) si nécessaire

---

**Développé avec ❤️ pour TeamUp**
