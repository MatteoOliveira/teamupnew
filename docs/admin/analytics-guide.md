# 📈 Guide des Analytics Admin

## Vue d'ensemble

La page Analytics fournit une analyse approfondie des performances et de l'engagement de l'application TeamUp, avec des métriques en temps réel et des visualisations avancées.

## Métriques Principales

### 1. Total Utilisateurs
- **Description** : Nombre total d'utilisateurs inscrits
- **Calcul** : Comptage de tous les documents dans `users`
- **Sous-métrique** : Utilisateurs actifs cette semaine
- **Tendance** : Évolution par rapport à la période précédente

### 2. Total Événements
- **Description** : Nombre total d'événements créés
- **Répartition** : Futurs vs passés
- **Calcul** : `futurs: date >= now`, `passés: date < now`
- **Utilité** : Mesure de l'activité de création

### 3. Temps Moyen d'Utilisation
- **Description** : Durée moyenne des sessions utilisateur
- **Calcul** : Moyenne des durées de session sur 7 jours
- **Unité** : Minutes
- **Utilité** : Mesure de l'engagement

### 4. Taux d'Engagement
- **Description** : Pourcentage d'utilisateurs actifs
- **Calcul** : `(utilisateurs_actifs / total_utilisateurs) * 100`
- **Période** : 7 derniers jours
- **Utilité** : Santé globale de l'application

## Graphiques Avancés

### 1. Évolution des Utilisateurs (30 jours)
- **Type** : Graphique linéaire
- **Données** : Nombre d'utilisateurs par jour
- **Période** : 30 derniers jours
- **Couleur** : Bleu
- **Utilité** : Tendance de croissance

#### Interprétation
- **Croissance positive** : Ligne ascendante
- **Stagnation** : Ligne plate
- **Déclin** : Ligne descendante
- **Pics** : Périodes d'activité intense

### 2. Pic d'Activité par Heure
- **Type** : Graphique en barres
- **Données** : Événements créés par heure
- **Période** : 24 dernières heures
- **Couleur** : Vert
- **Utilité** : Identifier les heures de pointe

#### Heures Typiques
- **Matin** : 8h-10h (avant le travail)
- **Midi** : 12h-14h (pause déjeuner)
- **Soir** : 18h-20h (après le travail)
- **Weekend** : 10h-12h et 15h-17h

### 3. Utilisateurs Connectés par Jour
- **Type** : Graphique en aires
- **Données** : Utilisateurs uniques par jour
- **Période** : 30 derniers jours
- **Couleur** : Violet
- **Utilité** : Mesure de l'activité quotidienne

### 4. Temps d'Utilisation par Session
- **Type** : Histogramme
- **Données** : Distribution des durées de session
- **Périodes** : 0-5min, 5-15min, 15-30min, 30min+
- **Couleur** : Orange
- **Utilité** : Comprendre les habitudes d'usage

### 5. Événements Créés par Jour
- **Type** : Graphique linéaire
- **Données** : Nombre d'événements créés quotidiennement
- **Période** : 30 derniers jours
- **Couleur** : Rouge
- **Utilité** : Tendance de création d'événements

## Auto-refresh et Mise à Jour

### Fréquence de Mise à Jour
- **Automatique** : Toutes les 60 secondes
- **Manuelle** : Bouton de rafraîchissement
- **Indicateur** : Timestamp de dernière mise à jour
- **Logs** : Console pour le debugging

### Gestion des Données
- **Cache** : Mise en cache des données fréquemment utilisées
- **Optimisation** : Requêtes Firestore optimisées
- **Pagination** : Chargement progressif des données
- **Compression** : Réduction de la bande passante

## Filtres et Périodes

### Périodes Prédéfinies
- **Aujourd'hui** : Données du jour en cours
- **7 derniers jours** : Semaine écoulée
- **30 derniers jours** : Mois écoulé
- **3 derniers mois** : Trimestre
- **Personnalisé** : Plage de dates sélectionnable

### Filtres par Type
- **Utilisateurs** : Nouveaux, actifs, inactifs
- **Événements** : Par sport, par créateur, par statut
- **Géolocalisation** : Par ville, par région
- **Appareils** : Mobile, desktop, tablette

### Filtres Avancés
- **Segmentation** : Par cohorte d'utilisateurs
- **Comportement** : Par type d'activité
- **Engagement** : Par niveau de participation
- **Rétention** : Par cohorte d'inscription

## Export et Rapports

### Formats d'Export
- **CSV** : Données brutes pour analyse
- **PDF** : Rapport formaté pour présentation
- **Excel** : Feuille de calcul avec graphiques
- **JSON** : Données structurées pour intégration

### Types de Rapports
- **Rapport quotidien** : Résumé de la journée
- **Rapport hebdomadaire** : Synthèse de la semaine
- **Rapport mensuel** : Analyse du mois
- **Rapport personnalisé** : Critères définis par l'admin

### Personnalisation
- **Métriques** : Sélection des KPIs à inclure
- **Période** : Plage de dates personnalisée
- **Format** : Mise en page et style
- **Fréquence** : Envoi automatique par email

## Alertes et Notifications

### Seuils d'Alerte
- **Utilisateurs** : Chute brutale du nombre d'utilisateurs
- **Événements** : Baisse de la création d'événements
- **Performance** : Temps de réponse élevé
- **Erreurs** : Taux d'erreur anormal

### Types de Notifications
- **Email** : Alertes par email
- **Push** : Notifications dans l'interface admin
- **Slack/Discord** : Intégration avec les outils de communication
- **Webhook** : Intégration avec des systèmes externes

### Configuration
- **Seuils** : Définition des valeurs critiques
- **Fréquence** : Intervalle de vérification
- **Destinataires** : Liste des personnes à notifier
- **Escalade** : Niveaux d'alerte progressifs

## Intégrations et APIs

### APIs Disponibles
- **REST API** : Accès programmatique aux données
- **GraphQL** : Requêtes flexibles et optimisées
- **Webhooks** : Notifications en temps réel
- **SDK** : Bibliothèques pour intégration

### Intégrations Tierces
- **Google Analytics** : Synchronisation des données
- **Mixpanel** : Analyse comportementale avancée
- **Amplitude** : Analytics produit
- **Custom** : Intégrations personnalisées

### Données Externes
- **Météo** : Impact de la météo sur l'activité
- **Événements locaux** : Corrélation avec l'actualité
- **Saisons** : Variations saisonnières
- **Concurrence** : Benchmarking avec d'autres apps

## Dépannage

### Problèmes Courants

#### Données Non Affichées
- **Cause** : Problème de connexion Firestore
- **Solution** : Vérifier la connectivité réseau
- **Test** : Utiliser la console Firestore

#### Graphiques Non Rendu
- **Cause** : Erreur JavaScript ou données manquantes
- **Solution** : Vérifier la console du navigateur
- **Debug** : Activer les logs détaillés

#### Performance Lente
- **Cause** : Trop de données à traiter
- **Solution** : Activer la pagination et les filtres
- **Optimisation** : Utiliser les index Firestore

#### Auto-refresh Non Fonctionnel
- **Cause** : Problème de timer JavaScript
- **Solution** : Vérifier les erreurs de console
- **Test** : Forcer le rafraîchissement manuel

### Optimisation des Performances

#### Requêtes Firestore
- **Index** : Créer les index composites nécessaires
- **Pagination** : Limiter le nombre de documents
- **Cache** : Utiliser le cache Firestore
- **Batch** : Grouper les requêtes

#### Interface Utilisateur
- **Lazy Loading** : Chargement progressif des graphiques
- **Debouncing** : Éviter les requêtes excessives
- **Memoization** : Mise en cache des calculs
- **Virtualization** : Rendu optimisé des listes

## Bonnes Pratiques

### Surveillance Continue
- **Vérification quotidienne** : Contrôler les métriques clés
- **Alertes configurées** : Seuils d'alerte appropriés
- **Tendances** : Identifier les patterns d'usage
- **Anomalies** : Détecter les comportements anormaux

### Analyse des Données
- **Corrélations** : Identifier les relations entre métriques
- **Segmentation** : Analyser par groupes d'utilisateurs
- **Cohortes** : Suivre l'évolution des utilisateurs
- **A/B Testing** : Tester les améliorations

### Action et Amélioration
- **Insights** : Transformer les données en actions
- **Optimisation** : Améliorer les points faibles
- **Innovation** : Proposer de nouvelles fonctionnalités
- **ROI** : Mesurer l'impact des changements

### Communication
- **Rapports réguliers** : Partager les insights avec l'équipe
- **Dashboards** : Créer des vues personnalisées
- **Présentations** : Communiquer les résultats
- **Documentation** : Maintenir la documentation à jour
