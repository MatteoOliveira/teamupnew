const { initializeApp } = require('firebase/app');
const { getFirestore, connectFirestoreEmulator } = require('firebase/firestore');

// Configuration Firebase (utilise les variables d'environnement)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

console.log('🔧 Configuration des index Firebase...');

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

console.log('✅ Firebase initialisé');

// Instructions pour créer les index manuellement
console.log(`
📋 INDEX FIREBASE REQUIS

Pour résoudre l'erreur "The query requires an index", vous devez créer les index suivants dans la console Firebase :

1. Allez sur : https://console.firebase.google.com/project/${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}/firestore/indexes

2. Cliquez sur "Créer un index"

3. Créez ces index composites :

   Index 1 - Analytics par utilisateur et timestamp :
   - Collection : analytics
   - Champs :
     * userId (Ascending)
     * timestamp (Descending)
   - Portée : Collection

   Index 2 - Événements par créateur :
   - Collection : events  
   - Champs :
     * createdBy (Ascending)
     * createdAt (Descending)
   - Portée : Collection

   Index 3 - Participants par événement :
   - Collection : event_participants
   - Champs :
     * eventId (Ascending)
     * registeredAt (Descending)
   - Portée : Collection

4. Attendez que les index soient créés (peut prendre quelques minutes)

5. Rechargez l'application

💡 Alternative : Utilisez le lien direct fourni dans l'erreur de la console pour créer l'index automatiquement.
`);

console.log('✅ Instructions générées');

