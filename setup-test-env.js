const fs = require('fs');
const path = require('path');

console.log("🔧 Configuration de l'environnement de test Firebase...\n");

// Vérifier si .env.local existe
const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  console.log("✅ Fichier .env.local trouvé !");
  console.log("📋 Vérification des variables requises...\n");
  
  require('dotenv').config({ path: '.env.local' });
  
  const requiredVars = [
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'FIREBASE_CLIENT_EMAIL', 
    'FIREBASE_PRIVATE_KEY'
  ];
  
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length === 0) {
    console.log("✅ Toutes les variables Firebase sont configurées !");
    console.log("🚀 Vous pouvez maintenant lancer les scripts de test.\n");
    
    console.log("Commandes disponibles :");
    console.log("  node generate-realistic-events.js  # Générer des événements");
    console.log("  node stats-events.js              # Voir les statistiques");
    console.log("  node cleanup-all-test-events.js   # Nettoyer");
    console.log("  ./manage-test-events.sh           # Gestionnaire interactif");
    
  } else {
    console.log("❌ Variables manquantes dans .env.local :");
    missingVars.forEach(varName => console.log(`   - ${varName}`));
    console.log("\n📝 Créez un fichier .env.local avec ces variables :");
    console.log("NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id");
    console.log("FIREBASE_CLIENT_EMAIL=your-client-email");
    console.log("FIREBASE_PRIVATE_KEY=your-private-key");
  }
  
} else {
  console.log("❌ Fichier .env.local non trouvé !");
  console.log("\n📝 Créez un fichier .env.local dans le dossier teamupnew avec :");
  console.log("NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id");
  console.log("FIREBASE_CLIENT_EMAIL=your-client-email");
  console.log("FIREBASE_PRIVATE_KEY=your-private-key");
  console.log("\n💡 Vous pouvez récupérer ces informations depuis :");
  console.log("   1. Google Cloud Console → IAM & Admin → Service Accounts");
  console.log("   2. Créer une nouvelle clé JSON");
  console.log("   3. Extraire les valeurs du fichier JSON");
}
