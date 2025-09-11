# 📊 Guide du Dashboard Admin

## Vue d'ensemble

Le Dashboard est la page d'accueil de l'espace administrateur, offrant une vue d'ensemble des métriques clés de l'application TeamUp.

## Métriques Principales

### 1. Total Événements
- **Description** : Nombre total d'événements créés depuis le lancement
- **Calcul** : Comptage de tous les documents dans la collection `events`
- **Mise à jour** : Temps réel via Firestore
- **Affichage** : `{totalEvents} (+{eventsToday} aujourd'hui)`

### 2. Utilisateurs
- **Description** : Nombre total d'utilisateurs inscrits
- **Calcul** : Comptage de tous les documents dans la collection `users`
- **Sous-métrique** : Utilisateurs actifs (connectés dans les 7 derniers jours)
- **Affichage** : `{totalUsers} ({activeUsers} actifs)`

### 3. Utilisateurs Actifs
- **Description** : Utilisateurs ayant une activité récente
- **Critère** : Dernière connexion dans les 7 derniers jours
- **Calcul** : `lastLoginAt > (now - 7 days)`
- **Utilité** : Mesure de l'engagement utilisateur

### 4. Événements Aujourd'hui
- **Description** : Événements créés dans la journée
- **Calcul** : `createdAt >= début_jour_actuel`
- **Mise à jour** : Temps réel
- **Utilité** : Mesure de l'activité quotidienne

## Graphiques et Visualisations

### Graphique d'Activité par Heure
- **Type** : Graphique en barres
- **Données** : Nombre d'événements créés par heure (24h)
- **Période** : Dernières 24 heures
- **Utilité** : Identifier les pics d'activité

### Évolution des Utilisateurs Connectés
- **Type** : Graphique linéaire
- **Données** : Nombre d'utilisateurs connectés par jour
- **Période** : 30 derniers jours
- **Utilité** : Tendance de croissance

### Temps d'Utilisation Moyen
- **Type** : Métrique simple
- **Calcul** : Moyenne des durées de session
- **Période** : 7 derniers jours
- **Unité** : Minutes

### Événements Créés par Jour
- **Type** : Graphique linéaire
- **Données** : Nombre d'événements créés quotidiennement
- **Période** : 30 derniers jours
- **Utilité** : Tendance de création d'événements

## Événements Récents

### Affichage
- **Nombre** : 5 derniers événements
- **Tri** : Par date de création (décroissant)
- **Informations** :
  - Nom de l'événement
  - Sport
  - Créateur
  - Date de création
  - Nombre de participants

### Actions Rapides
- **Voir détails** : Redirection vers la page de l'événement
- **Modifier** : Accès à l'édition (si autorisé)
- **Supprimer** : Suppression avec confirmation

## Actualisation des Données

### Fréquence
- **Temps réel** : Via les listeners Firestore
- **Manuelle** : Bouton de rafraîchissement
- **Automatique** : Toutes les 5 minutes

### Indicateurs
- **Chargement** : Spinner pendant le chargement
- **Dernière mise à jour** : Timestamp visible
- **Erreurs** : Messages d'erreur explicites

## Responsive Design

### Desktop
- **Layout** : Grille 4 colonnes pour les métriques
- **Graphiques** : Taille complète
- **Navigation** : Onglets horizontaux

### Mobile
- **Layout** : Grille 1 colonne empilée
- **Graphiques** : Taille adaptée
- **Navigation** : Menu burger

## Personnalisation

### Filtres Temporels
- **Aujourd'hui** : Données du jour
- **7 derniers jours** : Semaine écoulée
- **30 derniers jours** : Mois écoulé
- **Personnalisé** : Plage de dates sélectionnable

### Métriques Personnalisées
- **Ajout** : Possibilité d'ajouter de nouvelles métriques
- **Masquage** : Cacher les métriques non pertinentes
- **Réorganisation** : Glisser-déposer pour réorganiser

## Dépannage

### Données Non Affichées
1. Vérifier la connexion Firestore
2. Contrôler les règles de sécurité
3. Vérifier les permissions admin

### Performance Lente
1. Activer la pagination
2. Limiter les requêtes
3. Utiliser les index Firestore

### Graphiques Non Rendu
1. Vérifier les données sources
2. Contrôler la configuration des graphiques
3. Vérifier les dépendances JavaScript

## Bonnes Pratiques

### Surveillance
- **Vérification quotidienne** : Contrôler les métriques clés
- **Alertes** : Configurer des seuils d'alerte
- **Rapports** : Générer des rapports réguliers

### Optimisation
- **Cache** : Utiliser le cache Firestore
- **Pagination** : Limiter les données chargées
- **Index** : Optimiser les requêtes Firestore

### Sécurité
- **Accès restreint** : Limiter aux vrais administrateurs
- **Audit** : Logger les accès au dashboard
- **Sauvegarde** : Exporter régulièrement les données
