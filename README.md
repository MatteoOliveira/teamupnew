# TeamUp - MVP Application de Réservation Sportive

## 🎯 Description

TeamUp est une application Progressive Web App (PWA) permettant aux utilisateurs de réserver des créneaux sportifs localement. L'application utilise Next.js avec TypeScript, Firebase pour l'authentification et la base de données, et est optimisée pour fonctionner hors ligne.

## 🚀 Fonctionnalités

### ✅ Implémentées
- **Authentification Firebase** : Inscription et connexion avec email/mot de passe
- **Profil utilisateur** : Gestion du nom et du sport préféré
- **Réservation de créneaux** : Système de réservation avec créneaux statiques
- **PWA** : Installation sur appareil mobile, fonctionnement hors ligne
- **Interface responsive** : Design adaptatif avec TailwindCSS
- **Protection des routes** : Redirection automatique si non connecté

### 🔧 Technologies utilisées
- **Frontend** : Next.js 14, TypeScript, TailwindCSS
- **Backend** : Firebase (Auth + Firestore)
- **PWA** : next-pwa
- **État** : React Hooks personnalisés

## 📦 Installation

### Prérequis
- Node.js 18+ 
- npm ou yarn
- Compte Firebase

### Étapes d'installation

1. **Cloner le projet**
```bash
git clone <votre-repo>
cd teamup
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configuration Firebase**
   - Créez un projet Firebase sur [console.firebase.google.com](https://console.firebase.google.com)
   - Activez Authentication (Email/Password)
   - Créez une base de données Firestore
   - Récupérez vos clés de configuration

4. **Variables d'environnement**
Créez un fichier `.env.local` à la racine :
```env
NEXT_PUBLIC_FIREBASE_API_KEY=votre_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=votre_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=votre_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=votre_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=votre_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=votre_app_id
```

5. **Lancer l'application**
```bash
npm run dev
```

L'application sera accessible sur `http://localhost:3000`

## 🏗️ Structure du projet

```
teamup/
├── src/
│   ├── app/                    # Pages Next.js App Router
│   │   ├── login/             # Page de connexion
│   │   ├── register/          # Page d'inscription
│   │   ├── profile/           # Page de profil
│   │   ├── reservation/       # Page de réservation
│   │   ├── layout.tsx         # Layout principal
│   │   └── page.tsx           # Page d'accueil
│   ├── components/            # Composants réutilisables
│   │   ├── Button.tsx
│   │   └── Input.tsx
│   ├── hooks/                 # Hooks personnalisés
│   │   └── useAuth.ts
│   └── lib/                   # Configuration
│       └── firebase.ts
├── public/                    # Assets statiques
│   ├── manifest.json          # Manifest PWA
│   └── icon-*.png            # Icônes PWA
├── next.config.js            # Configuration Next.js + PWA
└── package.json
```

## 🔐 Authentification

L'application utilise Firebase Authentication avec :
- **Inscription** : Email + mot de passe (minimum 6 caractères)
- **Connexion** : Email + mot de passe
- **Déconnexion** : Bouton dans le header
- **Protection des routes** : Redirection automatique vers `/login` si non connecté

## 📊 Base de données Firestore

### Collections

#### `users/{uid}`
```typescript
{
  name: string,
  sport: string,
  email: string,
  updatedAt: Date
}
```

#### `reservations/{docId}`
```typescript
{
  uid: string,
  name: string,
  sport: string,
  timeslot: string,
  timestamp: Date
}
```

## 📱 Fonctionnalités PWA

- **Installation** : L'application peut être installée sur mobile/desktop
- **Hors ligne** : Détection de l'état de connexion avec message d'alerte
- **Service Worker** : Géré automatiquement par `next-pwa`
- **Manifest** : Configuration complète pour l'installation

## 🎨 Interface utilisateur

- **Design responsive** : Adapté mobile, tablette et desktop
- **TailwindCSS** : Styling moderne et cohérent
- **Composants réutilisables** : Button, Input, etc.
- **États de chargement** : Feedback visuel pour les actions
- **Messages d'erreur** : Gestion d'erreurs utilisateur-friendly

## 🚀 Déploiement

### Vercel (Recommandé)
1. Connectez votre repo GitHub à Vercel
2. Ajoutez vos variables d'environnement Firebase
3. Déployez automatiquement

### Autres plateformes
L'application peut être déployée sur n'importe quelle plateforme supportant Next.js :
- Netlify
- Railway
- Heroku
- AWS Amplify

## 🔧 Scripts disponibles

```bash
npm run dev          # Développement local
npm run build        # Build de production
npm run start        # Serveur de production
npm run lint         # Vérification ESLint
```

## 📝 Utilisation

1. **Inscription** : Créez un compte avec email/mot de passe
2. **Profil** : Complétez votre nom et sport préféré
3. **Réservation** : Consultez et réservez des créneaux disponibles
4. **PWA** : Installez l'app sur votre appareil pour un accès rapide

## 🐛 Dépannage

### Problèmes courants

**Erreur Firebase** : Vérifiez vos variables d'environnement
**PWA ne s'installe pas** : Vérifiez que vous êtes en HTTPS (requis pour PWA)
**Erreur de build** : Vérifiez que toutes les dépendances sont installées

### Logs de développement
Les erreurs Firebase et autres sont loggées dans la console du navigateur.

## 🔮 Évolutions futures

- [ ] Gestion des conflits de réservation
- [ ] Système de notifications
- [ ] Calendrier interactif
- [ ] Gestion des équipes
- [ ] Système de paiement
- [ ] Chat entre utilisateurs

## 📄 Licence

Ce projet est développé pour un dossier de fin d'année.

---

**Développé avec ❤️ pour TeamUp**
