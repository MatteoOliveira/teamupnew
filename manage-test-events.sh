#!/bin/bash

echo "🎮 Gestionnaire d'événements de test TeamUp"
echo "=============================================="
echo ""

# Vérifier si Node.js est installé
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé. Veuillez l'installer d'abord."
    exit 1
fi

# Vérifier si le fichier .env.local existe
if [ ! -f ".env.local" ]; then
    echo "❌ Le fichier .env.local n'existe pas. Veuillez le créer avec vos clés Firebase."
    exit 1
fi

echo "Choisissez une action :"
echo "1. 📊 Voir les statistiques des événements actuels"
echo "2. 🚀 Générer 50 événements réalistes (simulation production)"
echo "3. 🧹 Nettoyer TOUS les événements de test"
echo "4. 🔄 Générer + Nettoyer (reset complet)"
echo "5. ❌ Quitter"
echo ""

read -p "Votre choix (1-5): " choice

case $choice in
    1)
        echo "📊 Affichage des statistiques..."
        node stats-events.js
        ;;
    2)
        echo "🚀 Génération de 50 événements réalistes..."
        echo "⏳ Cela peut prendre quelques minutes..."
        node generate-realistic-events.js
        ;;
    3)
        echo "🧹 Nettoyage de tous les événements..."
        read -p "⚠️  Êtes-vous sûr de vouloir supprimer TOUS les événements ? (oui/non): " confirm
        if [ "$confirm" = "oui" ]; then
            node cleanup-all-test-events.js
        else
            echo "❌ Annulé."
        fi
        ;;
    4)
        echo "🔄 Reset complet..."
        echo "1. Nettoyage..."
        node cleanup-all-test-events.js
        echo ""
        echo "2. Génération..."
        node generate-realistic-events.js
        ;;
    5)
        echo "👋 Au revoir !"
        exit 0
        ;;
    *)
        echo "❌ Choix invalide."
        exit 1
        ;;
esac

echo ""
echo "✅ Action terminée !"
