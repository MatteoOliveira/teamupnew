# 📱 TeamUp - Documentation Complète

## 🎯 Vue d'Ensemble

TeamUp est une application web progressive (PWA) de réservation de créneaux sportifs qui permet aux utilisateurs de créer, rejoindre et gérer des événements sportifs locaux.

## 📋 Liste des Fonctionnalités Principales

### 🔐 **Authentification et Gestion des Utilisateurs**
- [Connexion/Déconnexion](./authentication.md)
- [Gestion des Profils](./user-management.md)
- [Suppression de Compte](./account-deletion.md)

### 🏃 **Gestion des Événements**
- [Création d'Événements](./event-creation.md)
- [Modification d'Événements](./event-editing.md)
- [Système de Réservation](./event-reservation.md)
- [Géolocalisation et Cartes](./geolocation-maps.md)

### 👥 **Gestion des Participants**
- [Inscription aux Événements](./event-participation.md)
- [Liste des Participants](./participant-management.md)
- [Messages entre Participants](./messaging-system.md)

### 📊 **Statistiques et Analytics**
- [Statistiques Personnelles](./user-statistics.md)
- [Analytics et Tracking](./analytics-tracking.md)

### 🔔 **Système de Notifications**
- [Notifications Push Web](./web-notifications.md)
- [Notifications FCM](./fcm-notifications.md)
- [Service Workers](./service-workers.md)

### 🛡️ **Sécurité et Conformité**
- [Sécurité Firebase](./firebase-security.md)
- [Conformité RGPD](./rgpd-compliance.md)
- [Validation des Données](./data-validation.md)

### 🎨 **Interface et Expérience Utilisateur**
- [Design Responsive](./responsive-design.md)
- [Navigation Mobile](./mobile-navigation.md)
- [Optimisations Performance](./performance-optimization.md)

### 🔧 **Architecture Technique**
- [Architecture Next.js](./nextjs-architecture.md)
- [Base de Données Firestore](./firestore-database.md)
- [Configuration PWA](./pwa-configuration.md)
- [Déploiement Vercel](./vercel-deployment.md)

## 🚀 **Démarrage Rapide**

1. **Installation** : `npm install`
2. **Configuration** : Copier `.env.local.example` vers `.env.local`
3. **Développement** : `npm run dev`
4. **Build** : `npm run build`
5. **Déploiement** : Push vers `main` branch

## 📁 **Structure du Projet**

```
teamupnew/
├── src/
│   ├── app/                 # Pages Next.js App Router
│   ├── components/          # Composants React réutilisables
│   ├── hooks/              # Hooks React personnalisés
│   ├── lib/                # Configuration et utilitaires
│   └── types/              # Définitions TypeScript
├── public/                 # Assets statiques
├── docs/                   # Documentation technique
└── next.config.js          # Configuration Next.js
```

## 🔗 **Liens Utiles**

- **Application** : https://teamupnew.vercel.app
- **Repository** : https://github.com/MatteoOliveira/teamupnew
- **Firebase Console** : https://console.firebase.google.com/project/teamup-7a2d6
- **Vercel Dashboard** : https://vercel.com/dashboard

---

*Documentation créée le $(date) - Version 1.0*
