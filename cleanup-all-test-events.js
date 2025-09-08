require('dotenv').config({ path: '.env.local' });
const admin = require('firebase-admin');

// Initialiser Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = admin.firestore();

// Fonction pour supprimer tous les événements de test
async function cleanupAllTestEvents() {
  console.log("🧹 Nettoyage de tous les événements de test...\n");
  
  try {
    // Récupérer tous les événements
    const eventsSnapshot = await db.collection('events').get();
    
    if (eventsSnapshot.empty) {
      console.log("✅ Aucun événement trouvé dans la base de données.");
      return;
    }
    
    console.log(`📊 ${eventsSnapshot.size} événement(s) trouvé(s) dans la base de données.`);
    
    // Supprimer tous les événements
    const batch = db.batch();
    let deleteCount = 0;
    
    eventsSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
      deleteCount++;
    });
    
    // Exécuter la suppression en lot
    await batch.commit();
    
    console.log(`✅ ${deleteCount} événement(s) supprimé(s) avec succès !`);
    console.log("🎉 Base de données nettoyée !");
    
  } catch (error) {
    console.error("❌ Erreur lors du nettoyage:", error);
  }
  
  process.exit(0);
}

// Lancer le nettoyage
cleanupAllTestEvents().catch(console.error);
