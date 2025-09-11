# 🔐 Authentification et Connexion

## 📝 Description Simple

Le système d'authentification permet aux utilisateurs de se connecter à l'application avec leur email et mot de passe, ou via Google. Une fois connecté, l'utilisateur peut créer et rejoindre des événements sportifs.

## 🔧 Description Technique

### Architecture d'Authentification

L'application utilise **Firebase Authentication** avec plusieurs providers :
- **Email/Password** : Authentification classique
- **Google OAuth** : Connexion via compte Google
- **Gestion des sessions** : Persistance automatique des connexions

### Fichiers Principaux

```
src/
├── hooks/useAuth.ts              # Hook principal d'authentification
├── components/Header.tsx         # Composant de navigation avec état de connexion
└── lib/firebase.ts              # Configuration Firebase Auth
```

### Hook useAuth

```typescript
// src/hooks/useAuth.ts
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return { user, loading };
}
```

### Fonctionnalités Implémentées

#### 1. **Connexion Email/Password**
```typescript
const signIn = async (email: string, password: string) => {
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    throw new Error('Erreur de connexion');
  }
};
```

#### 2. **Connexion Google**
```typescript
const signInWithGoogle = async () => {
  try {
    await signInWithPopup(auth, googleProvider);
  } catch (error) {
    throw new Error('Erreur de connexion Google');
  }
};
```

#### 3. **Inscription**
```typescript
const signUp = async (email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    // Créer le profil utilisateur dans Firestore
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      email: email,
      createdAt: new Date()
    });
  } catch (error) {
    throw new Error('Erreur d\'inscription');
  }
};
```

#### 4. **Déconnexion**
```typescript
const signOut = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    throw new Error('Erreur de déconnexion');
  }
};
```

### Sécurité

#### Règles Firestore
```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

#### Validation Côté Client
- Vérification de l'email avec regex
- Validation de la force du mot de passe
- Gestion des erreurs Firebase

### Gestion des États

#### États d'Authentification
```typescript
interface AuthState {
  user: User | null;        // Utilisateur connecté ou null
  loading: boolean;         // État de chargement
  error: string | null;     // Erreur éventuelle
}
```

#### Persistance des Sessions
- Firebase gère automatiquement la persistance
- Les sessions restent actives entre les rafraîchissements
- Déconnexion automatique après expiration

### Composants UI

#### Header avec État de Connexion
```typescript
// src/components/Header.tsx
export default function Header() {
  const { user, loading } = useAuth();

  if (loading) return <div>Chargement...</div>;
  
  return (
    <header>
      {user ? (
        <div>Connecté : {user.email}</div>
      ) : (
        <div>Non connecté</div>
      )}
    </header>
  );
}
```

### Gestion des Erreurs

#### Types d'Erreurs Courantes
- `auth/user-not-found` : Utilisateur inexistant
- `auth/wrong-password` : Mot de passe incorrect
- `auth/email-already-in-use` : Email déjà utilisé
- `auth/weak-password` : Mot de passe trop faible

#### Traitement des Erreurs
```typescript
const handleAuthError = (error: FirebaseError) => {
  switch (error.code) {
    case 'auth/user-not-found':
      return 'Utilisateur non trouvé';
    case 'auth/wrong-password':
      return 'Mot de passe incorrect';
    default:
      return 'Erreur de connexion';
  }
};
```

### Configuration Firebase

#### Variables d'Environnement
```bash
# .env.local
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=teamup-7a2d6.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=teamup-7a2d6
```

#### Configuration Google OAuth
```typescript
// src/lib/firebase.ts
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
  hd: '' // Permet tous les domaines
});
```

### Tests et Debugging

#### Outils de Debug
- Console Firebase : https://console.firebase.google.com
- Logs d'authentification dans la console
- État des utilisateurs en temps réel

#### Tests Recommandés
1. Connexion avec email valide
2. Connexion avec mot de passe incorrect
3. Inscription avec email existant
4. Connexion Google
5. Persistance de session après rafraîchissement

### Améliorations Futures

#### Fonctionnalités à Ajouter
- [ ] Réinitialisation de mot de passe
- [ ] Vérification d'email
- [ ] Authentification à deux facteurs
- [ ] Connexion avec Facebook/Twitter
- [ ] Gestion des rôles utilisateur

#### Optimisations
- [ ] Cache des données utilisateur
- [ ] Préchargement des profils
- [ ] Gestion offline des sessions
