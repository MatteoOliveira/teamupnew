const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc } = require('firebase/firestore');

// Configuration Firebase (utilise les variables d'environnement)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBvQvQvQvQvQvQvQvQvQvQvQvQvQvQvQvQ",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "teamup-12345.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "teamup-12345",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "teamup-12345.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:123456789:web:abcdef123456",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-ABCDEF1234"
};

async function setAdmin(userId, isAdmin = true) {
  try {
    console.log('🔥 Initialisation Firebase...');
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    console.log('📝 Mise à jour du profil utilisateur...');
    await setDoc(doc(db, 'users', userId), {
      isAdmin: isAdmin,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    
    console.log(`✅ Utilisateur ${userId} ${isAdmin ? 'promu' : 'rétrogradé'} ${isAdmin ? 'administrateur' : 'utilisateur normal'}`);
    console.log('🔄 Rechargez votre profil pour voir le bouton admin');
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.log('💡 Essayez de vérifier votre configuration Firebase');
  }
}

// Utilisation
const userId = process.argv[2];
const adminStatus = process.argv[3] === 'false' ? false : true;

if (!userId) {
  console.log('Usage: node set-admin-simple.js <userId> [true|false]');
  console.log('Exemple: node set-admin-simple.js nbbNpq1WbuTdPF8pX3lBPUr1icd2 true');
  process.exit(1);
}

setAdmin(userId, adminStatus).then(() => {
  process.exit(0);
});
