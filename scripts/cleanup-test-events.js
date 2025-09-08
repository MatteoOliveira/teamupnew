const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, deleteDoc, doc, query, where } = require('firebase/firestore');

// Configuration Firebase
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function cleanupTestEvents() {
  console.log('🧹 Nettoyage des événements de test...\n');
  
  try {
    // Récupérer tous les événements créés par les utilisateurs de test
    const testUserIds = [
      'test-user-1', 'test-user-2', 'test-user-3', 'test-user-4',
      'test-user-5', 'test-user-6', 'test-user-7', 'test-user-8'
    ];
    
    let totalDeleted = 0;
    
    for (const userId of testUserIds) {
      const q = query(collection(db, 'events'), where('createdBy', '==', userId));
      const querySnapshot = await getDocs(q);
      
      console.log(`🔍 Recherche d'événements pour l'utilisateur: ${userId}`);
      
      for (const eventDoc of querySnapshot.docs) {
        const eventData = eventDoc.data();
        console.log(`   🗑️  Suppression: ${eventData.name} (ID: ${eventDoc.id})`);
        await deleteDoc(doc(db, 'events', eventDoc.id));
        totalDeleted++;
      }
    }
    
    console.log(`\n✅ Nettoyage terminé ! ${totalDeleted} événements de test supprimés.`);
    
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error);
  }
}

// Exécuter le script
cleanupTestEvents();
