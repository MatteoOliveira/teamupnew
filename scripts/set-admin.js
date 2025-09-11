const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc } = require('firebase/firestore');

// Configuration Firebase (remplacez par vos vraies clés)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function setAdmin(userId, isAdmin = true) {
  try {
    await setDoc(doc(db, 'users', userId), {
      isAdmin: isAdmin,
      updatedAt: new Date()
    }, { merge: true });
    
    console.log(`✅ Utilisateur ${userId} ${isAdmin ? 'promu' : 'rétrogradé'} ${isAdmin ? 'administrateur' : 'utilisateur normal'}`);
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

// Utilisation
const userId = process.argv[2];
const adminStatus = process.argv[3] === 'false' ? false : true;

if (!userId) {
  console.log('Usage: node set-admin.js <userId> [true|false]');
  console.log('Exemple: node set-admin.js abc123 true');
  process.exit(1);
}

setAdmin(userId, adminStatus).then(() => {
  process.exit(0);
});
