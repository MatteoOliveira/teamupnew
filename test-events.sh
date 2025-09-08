#!/bin/bash

# Script pour créer des événements de test TeamUp

echo "🚀 TeamUp - Script de Test des Événements"
echo "=========================================="
echo ""

# Vérifier si on est dans le bon répertoire
if [ ! -f "package.json" ]; then
    echo "❌ Erreur: Exécutez ce script depuis la racine du projet TeamUp"
    exit 1
fi

# Aller dans le dossier scripts
cd scripts

# Vérifier si node_modules existe
if [ ! -d "node_modules" ]; then
    echo "📦 Installation des dépendances..."
    npm install
    echo ""
fi

# Charger les variables d'environnement
if [ -f "../.env.local" ]; then
    echo "🔧 Chargement des variables d'environnement..."
    export $(cat ../.env.local | grep -v '^#' | xargs)
    echo ""
fi

echo "Choisissez une option :"
echo "1) Créer des événements de test"
echo "2) Nettoyer les événements de test"
echo "3) Test complet (créer + instructions)"
echo "4) Quitter"
echo ""

read -p "Votre choix (1-4): " choice

case $choice in
    1)
        echo "📝 Création des événements de test..."
        npm run create-events
        ;;
    2)
        echo "🧹 Nettoyage des événements de test..."
        npm run cleanup-events
        ;;
    3)
        echo "🧪 Test complet..."
        npm run test
        ;;
    4)
        echo "👋 Au revoir !"
        exit 0
        ;;
    *)
        echo "❌ Choix invalide"
        exit 1
        ;;
esac

echo ""
echo "✅ Script terminé !"
