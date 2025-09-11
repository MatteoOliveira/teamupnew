# 🛡️ Documentation de l'Espace Admin - TeamUp

## 📋 Table des Matières

1. [Vue d'ensemble](#-vue-densemble)
2. [Accès et Authentification](#-accès-et-authentification)
3. [Navigation et Interface](#-navigation-et-interface)
4. [Pages et Fonctionnalités](#-pages-et-fonctionnalités)
5. [Gestion des Utilisateurs](#-gestion-des-utilisateurs)
6. [Gestion des Événements](#-gestion-des-événements)
7. [Analytics et Statistiques](#-analytics-et-statistiques)
8. [Paramètres Système](#-paramètres-système)
9. [Sécurité et Permissions](#-sécurité-et-permissions)
10. [Dépannage](#-dépannage)

---

## 🎯 Vue d'ensemble

L'espace administrateur de TeamUp est un tableau de bord complet permettant la gestion et le monitoring de l'application. Il offre des outils avancés pour :

- **Surveiller** l'activité des utilisateurs et des événements
- **Gérer** les utilisateurs et leurs permissions
- **Analyser** les performances et l'engagement
- **Configurer** les paramètres système
- **Superviser** la santé de l'application

---

## 🔐 Accès et Authentification

### Prérequis
- Compte utilisateur avec le champ `isAdmin: true` dans Firestore
- Connexion active à l'application

### Accès
1. Se connecter à l'application
2. Aller dans **Profil** > **Réglages**
3. Cliquer sur **"Accès Admin"** (visible uniquement pour les admins)
4. Redirection automatique vers `/admin/dashboard`

### Sécurité
- Vérification automatique du statut admin à chaque page
- Redirection vers le profil si l'utilisateur n'est pas admin
- Session sécurisée via Firebase Auth

---

## 🧭 Navigation et Interface

### Navigation Responsive
- **Desktop** : Onglets horizontaux en haut de page
- **Mobile** : Menu burger avec liste déroulante
- **Pages disponibles** :
  - 📊 Dashboard
  - 👥 Utilisateurs
  - 📅 Événements
  - 📈 Analytics
  - ⚙️ Paramètres

### Design
- Interface cohérente avec l'application principale
- Design responsive (mobile-first)
- Thème sombre/clair selon les préférences utilisateur
- Navigation intuitive avec icônes et labels

---

## 📊 Pages et Fonctionnalités

### 1. Dashboard (`/admin/dashboard`)

**Vue d'ensemble des métriques clés**

#### Statistiques Principales
- **Total Événements** : Nombre total d'événements créés
- **Utilisateurs** : Nombre total d'utilisateurs inscrits
- **Utilisateurs Actifs** : Utilisateurs connectés récemment
- **Événements Aujourd'hui** : Événements créés dans la journée

#### Graphiques et Visualisations
- **Graphique d'activité** : Pic d'activité par heure
- **Utilisateurs connectés** : Évolution quotidienne
- **Temps d'utilisation moyen** : Par session utilisateur
- **Événements créés** : Évolution quotidienne

#### Événements Récents
- Liste des 5 derniers événements créés
- Informations : nom, créateur, date, participants
- Actions rapides : voir détails, modifier

---

### 2. Gestion des Utilisateurs (`/admin/users`)

**Administration complète des comptes utilisateurs**

#### Liste des Utilisateurs
- **Filtres** :
  - Tous les utilisateurs
  - Utilisateurs actifs (connectés récemment)
  - Utilisateurs inactifs
  - Administrateurs uniquement

#### Informations Utilisateur
- **Profil** : Nom, email, photo, date d'inscription
- **Statistiques** : Nombre d'événements créés/participés
- **Dernière connexion** : Timestamp de la dernière activité
- **Statut** : Actif/Inactif/Admin

#### Actions Disponibles
- **Voir le profil** : Accès au profil public de l'utilisateur
- **Promouvoir Admin** : Accorder les droits administrateur
- **Rétrograder** : Retirer les droits administrateur
- **Suspendre** : Désactiver temporairement le compte
- **Supprimer** : Suppression définitive du compte

#### Recherche et Filtrage
- **Recherche par nom/email** : Recherche en temps réel
- **Tri** : Par nom, date d'inscription, dernière activité
- **Pagination** : Navigation par pages pour les grandes listes

---

### 3. Gestion des Événements (`/admin/events`)

**Supervision et gestion des événements sportifs**

#### Liste des Événements
- **Filtres** :
  - Tous les événements
  - Événements futurs
  - Événements passés
  - Par sport
  - Par créateur

#### Informations Événement
- **Détails** : Nom, sport, date, lieu, description
- **Créateur** : Nom et profil de l'organisateur
- **Participants** : Nombre et liste des inscrits
- **Statut** : Actif/Complet/Annulé

#### Actions Disponibles
- **Voir détails** : Page complète de l'événement
- **Modifier** : Édition des informations
- **Supprimer** : Suppression définitive
- **Exporter** : Export des données en CSV

#### Statistiques par Événement
- **Taux de participation** : Inscrits/Max participants
- **Engagement** : Messages, interactions
- **Géolocalisation** : Répartition géographique

---

### 4. Analytics (`/admin/analytics`)

**Analyse approfondie des performances et de l'engagement**

#### Métriques Principales
- **Total Utilisateurs** : Avec répartition actifs/inactifs
- **Total Événements** : Futurs vs passés
- **Temps Moyen** : Durée moyenne des sessions
- **Taux d'Engagement** : Participation aux événements

#### Graphiques Avancés
- **Évolution des Utilisateurs** : Croissance sur 30 jours
- **Pic d'Activité** : Heures de forte utilisation
- **Utilisateurs Connectés** : Évolution quotidienne
- **Temps d'Utilisation** : Distribution des sessions
- **Événements Créés** : Tendance quotidienne

#### Auto-refresh
- **Mise à jour automatique** : Toutes les minutes
- **Indicateur de dernière mise à jour** : Timestamp visible
- **Rafraîchissement manuel** : Bouton de mise à jour

#### Export de Données
- **Rapports PDF** : Génération de rapports détaillés
- **Export CSV** : Données brutes pour analyse
- **Périodes personnalisées** : Sélection de plages de dates

---

### 5. Paramètres Système (`/admin/settings`)

**Configuration globale de l'application**

#### Paramètres Généraux
- **Mode Maintenance** : Désactiver l'application temporairement
- **Inscription Nouveaux Utilisateurs** : Autoriser/désactiver
- **Création d'Événements** : Permettre/restreindre
- **Système de Notifications** : Activer/désactiver
- **Collecte d'Analytics** : Autoriser/refuser

#### Limites et Restrictions
- **Max Événements par Utilisateur** : Limite de création
- **Max Participants par Événement** : Limite d'inscription
- **Durée Max des Sessions** : Timeout automatique
- **Taille Max des Fichiers** : Upload d'images

#### Notifications Système
- **Alertes Administrateur** : Notifications importantes
- **Rapports Quotidiens** : Résumé automatique
- **Alertes de Sécurité** : Tentatives de connexion suspectes
- **Maintenance Programmée** : Notifications aux utilisateurs

#### Sauvegarde et Restauration
- **Sauvegarde Automatique** : Fréquence configurable
- **Export des Données** : Sauvegarde complète
- **Restauration** : Retour à une version antérieure
- **Logs Système** : Historique des actions

---

## 🔒 Sécurité et Permissions

### Niveaux d'Accès
- **Super Admin** : Accès complet à tous les paramètres
- **Admin** : Gestion des utilisateurs et événements
- **Modérateur** : Supervision des contenus uniquement

### Audit et Traçabilité
- **Logs d'Actions** : Historique de toutes les actions admin
- **Connexions** : Suivi des accès administrateur
- **Modifications** : Traçabilité des changements
- **Alertes** : Notifications de sécurité

### Bonnes Pratiques
- **Authentification forte** : Mots de passe complexes
- **Sessions limitées** : Déconnexion automatique
- **Accès restreint** : IP autorisées uniquement
- **Sauvegardes régulières** : Protection des données

---

## 🛠️ Dépannage

### Problèmes Courants

#### Accès Refusé
- **Cause** : Utilisateur non admin
- **Solution** : Vérifier le champ `isAdmin` dans Firestore
- **Commande** : `db.collection('users').doc(uid).update({isAdmin: true})`

#### Données Non Affichées
- **Cause** : Problème de connexion Firestore
- **Solution** : Vérifier les règles de sécurité Firestore
- **Logs** : Consulter la console du navigateur

#### Performance Lente
- **Cause** : Trop de données à charger
- **Solution** : Activer la pagination et les filtres
- **Optimisation** : Limiter les requêtes Firestore

#### Erreurs de Permissions
- **Cause** : Règles Firestore trop restrictives
- **Solution** : Mettre à jour les règles de sécurité
- **Test** : Utiliser l'émulateur Firestore

### Support Technique
- **Logs** : Console du navigateur (F12)
- **Firebase Console** : Monitoring des erreurs
- **Vercel Dashboard** : Logs de déploiement
- **GitHub Issues** : Rapport de bugs

---

## 📞 Contact et Support

Pour toute question ou problème avec l'espace administrateur :

- **Documentation** : Ce fichier et les guides techniques
- **Issues GitHub** : Rapport de bugs et demandes de fonctionnalités
- **Email** : support@teamup.app (à configurer)
- **Slack/Discord** : Canal dédié aux administrateurs

---

*Dernière mise à jour : Décembre 2024*
*Version : 1.0.0*
