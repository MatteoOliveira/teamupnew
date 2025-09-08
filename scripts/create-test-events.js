const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, Timestamp } = require('firebase/firestore');

// Configuration Firebase (utilise les mêmes variables d'environnement que l'app)
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

// Données de test pour créer des événements
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
    name: "Entraînement Football - Débutants",
    sport: "Football",
    location: "Stade Municipal",
    city: "Paris",
    postcode: "75001",
    address: "1 Place de la Concorde, 75001 Paris",
    lat: 48.8566,
    lng: 2.3522,
    description: "Session d'entraînement pour débutants",
    maxParticipants: 15,
    contactInfo: "coach@football.com",
    isReserved: true,
    createdBy: "test-user-2",
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
    isReserved: false, // Pas réservé pour tester les conflits
    createdBy: "test-user-3",
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
    createdBy: "test-user-4",
    createdAt: new Date(),
    // Aujourd'hui de 9h à 10h
    date: new Date(new Date().setHours(9, 0, 0, 0)),
    endDate: new Date(new Date().setHours(10, 0, 0, 0))
  },
  {
    name: "Musculation - Groupe",
    sport: "Musculation",
    location: "Salle de Sport",
    city: "Paris",
    postcode: "75002",
    address: "15 Rue de Rivoli, 75002 Paris",
    lat: 48.8575,
    lng: 2.3522,
    description: "Séance de musculation en groupe",
    maxParticipants: 12,
    contactInfo: "muscu@salle.com",
    isReserved: true,
    createdBy: "test-user-5",
    createdAt: new Date(),
    // Aujourd'hui de 19h à 21h
    date: new Date(new Date().setHours(19, 0, 0, 0)),
    endDate: new Date(new Date().setHours(21, 0, 0, 0))
  },
  
  // Événements à différents endroits pour tester la géolocalisation
  {
    name: "Basketball - Parc",
    sport: "Basketball",
    location: "Parc des Buttes-Chaumont",
    city: "Paris",
    postcode: "75019",
    address: "1 Rue Botzaris, 75019 Paris",
    lat: 48.8811,
    lng: 2.3833,
    description: "Match de basketball en extérieur",
    maxParticipants: 10,
    contactInfo: "basket@parc.com",
    isReserved: false,
    createdBy: "test-user-6",
    createdAt: new Date(),
    // Après-demain de 15h à 17h
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 15 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 17 * 60 * 60 * 1000)
  },
  
  // Événements avec conflits pour tester la vérification
  {
    name: "Football - Conflit Test 1",
    sport: "Football",
    location: "Stade Municipal",
    city: "Paris",
    postcode: "75001",
    address: "1 Place de la Concorde, 75001 Paris",
    lat: 48.8566,
    lng: 2.3522,
    description: "Événement pour tester les conflits - chevauchement",
    maxParticipants: 20,
    contactInfo: "conflit@test.com",
    isReserved: true,
    createdBy: "test-user-7",
    createdAt: new Date(),
    // Aujourd'hui de 15h à 17h (chevauche avec le premier événement)
    date: new Date(new Date().setHours(15, 0, 0, 0)),
    endDate: new Date(new Date().setHours(17, 0, 0, 0))
  },
  {
    name: "Football - Conflit Test 2",
    sport: "Football",
    location: "Stade Municipal",
    city: "Paris",
    postcode: "75001",
    address: "1 Place de la Concorde, 75001 Paris",
    lat: 48.8566,
    lng: 2.3522,
    description: "Événement pour tester les conflits - juste après",
    maxParticipants: 18,
    contactInfo: "conflit2@test.com",
    isReserved: true,
    createdBy: "test-user-8",
    createdAt: new Date(),
    // Aujourd'hui de 16h à 18h (juste après le premier, test de la règle des 5 min)
    date: new Date(new Date().setHours(16, 0, 0, 0)),
    endDate: new Date(new Date().setHours(18, 0, 0, 0))
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
      console.log(`✅ Événement créé: ${event.name} (ID: ${docRef.id})`);
      console.log(`   📍 Lieu: ${event.location}, ${event.city}`);
      console.log(`   🕐 Date: ${event.date.toLocaleString()}`);
      console.log(`   🔒 Réservé: ${event.isReserved ? 'Oui' : 'Non'}`);
      console.log('');
    }
    
    console.log('🎉 Tous les événements de test ont été créés avec succès !');
    console.log('\n📋 Résumé des événements créés:');
    console.log('   • Stade Municipal: 4 événements (avec conflits pour tester)');
    console.log('   • Salle de Sport: 2 événements');
    console.log('   • Parc des Buttes-Chaumont: 1 événement');
    console.log('\n🧪 Tests possibles:');
    console.log('   • Créer un événement au Stade Municipal aujourd\'hui 14h-16h → Conflit détecté');
    console.log('   • Créer un événement au Stade Municipal aujourd\'hui 16h-18h → Conflit détecté (règle des 5 min)');
    console.log('   • Créer un événement à la Salle de Sport aujourd\'hui 9h-10h → Conflit détecté');
    console.log('   • Créer un événement au Stade Municipal demain 10h-12h → Pas de conflit');
    
  } catch (error) {
    console.error('❌ Erreur lors de la création des événements:', error);
  }
}

// Exécuter le script
createTestEvents();
