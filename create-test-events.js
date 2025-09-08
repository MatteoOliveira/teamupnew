const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, Timestamp } = require('firebase/firestore');
require('dotenv').config({ path: '.env.local' });

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

// Événements de test
const testEvents = [
  // Événements au Stade Municipal (même lieu, différents horaires)
  {
    name: "Match de Football - Équipe A vs B",
    sport: "Football",
    location: "Stade Municipal",
    city: "Paris",
    postcode: "75001",
    address: "1 Place de la Concorde, 75001 Paris",
    lat: 48.8566,
    lng: 2.3522,
    description: "Match amical entre deux équipes locales",
    maxParticipants: 22,
    contactInfo: "contact@football.com",
    isReserved: true,
    createdBy: "test-user-1",
    createdAt: new Date(),
    // Aujourd'hui de 14h à 16h
    date: new Date(new Date().setHours(14, 0, 0, 0)),
    endDate: new Date(new Date().setHours(16, 0, 0, 0))
  },
  {
    name: "Football - Conflit Test",
    sport: "Football",
    location: "Stade Municipal",
    city: "Paris",
    postcode: "75001",
    address: "1 Place de la Concorde, 75001 Paris",
    lat: 48.8566,
    lng: 2.3522,
    description: "Événement pour tester les conflits",
    maxParticipants: 20,
    contactInfo: "conflit@test.com",
    isReserved: true,
    createdBy: "test-user-2",
    createdAt: new Date(),
    // Aujourd'hui de 15h à 17h (chevauche avec le premier)
    date: new Date(new Date().setHours(15, 0, 0, 0)),
    endDate: new Date(new Date().setHours(17, 0, 0, 0))
  },
  {
    name: "Entraînement Football - Soir",
    sport: "Football",
    location: "Stade Municipal",
    city: "Paris",
    postcode: "75001",
    address: "1 Place de la Concorde, 75001 Paris",
    lat: 48.8566,
    lng: 2.3522,
    description: "Session d'entraînement du soir",
    maxParticipants: 15,
    contactInfo: "coach@football.com",
    isReserved: true,
    createdBy: "test-user-3",
    createdAt: new Date(),
    // Aujourd'hui de 18h à 20h
    date: new Date(new Date().setHours(18, 0, 0, 0)),
    endDate: new Date(new Date().setHours(20, 0, 0, 0))
  },
  {
    name: "Tournoi de Tennis",
    sport: "Tennis",
    location: "Stade Municipal",
    city: "Paris",
    postcode: "75001",
    address: "1 Place de la Concorde, 75001 Paris",
    lat: 48.8566,
    lng: 2.3522,
    description: "Tournoi de tennis en simple et double",
    maxParticipants: 16,
    contactInfo: "tennis@club.com",
    isReserved: false,
    createdBy: "test-user-4",
    createdAt: new Date(),
    // Demain de 10h à 12h
    date: new Date(Date.now() + 24 * 60 * 60 * 1000 + 10 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 24 * 60 * 60 * 1000 + 12 * 60 * 60 * 1000)
  },
  // Événements à la Salle de Sport (autre lieu)
  {
    name: "Cours de Yoga",
    sport: "Yoga",
    location: "Salle de Sport",
    city: "Paris",
    postcode: "75002",
    address: "15 Rue de Rivoli, 75002 Paris",
    lat: 48.8575,
    lng: 2.3522,
    description: "Cours de yoga pour tous niveaux",
    maxParticipants: 20,
    contactInfo: "yoga@studio.com",
    isReserved: true,
    createdBy: "test-user-5",
    createdAt: new Date(),
    // Aujourd'hui de 9h à 10h
    date: new Date(new Date().setHours(9, 0, 0, 0)),
    endDate: new Date(new Date().setHours(10, 0, 0, 0))
  }
];

async function createTestEvents() {
  console.log('🚀 Création des événements de test...\n');
  
  try {
    for (let i = 0; i < testEvents.length; i++) {
      const event = testEvents[i];
      
      // Convertir les dates en Timestamp Firebase
      const eventData = {
        ...event,
        date: Timestamp.fromDate(event.date),
        endDate: Timestamp.fromDate(event.endDate),
        createdAt: Timestamp.fromDate(event.createdAt)
      };
      
      const docRef = await addDoc(collection(db, 'events'), eventData);
      console.log(`✅ Événement créé: ${event.name}`);
      console.log(`   📍 Lieu: ${event.location}, ${event.city}`);
      console.log(`   🕐 Date: ${event.date.toLocaleString()}`);
      console.log(`   🔒 Réservé: ${event.isReserved ? 'Oui' : 'Non'}`);
      console.log('');
    }
    
    console.log('🎉 Tous les événements de test ont été créés !');
    console.log('\n🧪 Tests à effectuer:');
    console.log('1. Créer un événement au "Stade Municipal" aujourd\'hui 14h-16h → Conflit détecté');
    console.log('2. Créer un événement au "Stade Municipal" aujourd\'hui 15h-17h → Conflit détecté');
    console.log('3. Créer un événement au "Stade Municipal" demain 10h-12h → Pas de conflit');
    console.log('4. Créer un événement à la "Salle de Sport" aujourd\'hui 9h-10h → Conflit détecté');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

createTestEvents();
