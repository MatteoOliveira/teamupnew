// Script simple pour générer des événements de test
// Utilise l'API Firebase côté client avec les clés existantes

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, serverTimestamp } = require('firebase/firestore');

// Configuration Firebase (utilise les clés de l'app)
const firebaseConfig = {
  apiKey: "AIzaSyBvOkBwJ7Z8K9L2M3N4O5P6Q7R8S9T0U1V",
  authDomain: "teamupnew-8a8b8.firebaseapp.com",
  projectId: "teamupnew-8a8b8",
  storageBucket: "teamupnew-8a8b8.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Données de test simples
const testEvents = [
  {
    name: "Match de Football - Équipe A vs B",
    sport: "Football",
    sportEmoji: "⚽",
    sportColor: "bg-green-500",
    location: "Stade Municipal",
    address: "1 Place de la Concorde, 75001 Paris, France",
    city: "Paris",
    postcode: "75001",
    coordinates: { lat: 48.8656, lng: 2.3212 },
    description: "Match amical entre deux équipes locales",
    maxParticipants: 22,
    currentParticipants: 0,
    createdBy: "test_user_1",
    createdByName: "Alex Martin",
    isReserved: true,
    status: "active"
  },
  {
    name: "Tournoi de Basketball",
    sport: "Basketball", 
    sportEmoji: "🏀",
    sportColor: "bg-orange-500",
    location: "Gymnase des Sports",
    address: "1 Place de la Concorde, 75001 Paris, France",
    city: "Paris",
    postcode: "75001",
    coordinates: { lat: 48.8656, lng: 2.3212 },
    description: "Tournoi de basketball ouvert à tous",
    maxParticipants: 20,
    currentParticipants: 3,
    createdBy: "test_user_2",
    createdByName: "Sarah Dubois",
    isReserved: false,
    status: "active"
  },
  {
    name: "Session Tennis Libre",
    sport: "Tennis",
    sportEmoji: "🎾", 
    sportColor: "bg-yellow-500",
    location: "Club de Tennis",
    address: "24 Rue du Commandant Guilbaud, 75016 Paris, France",
    city: "Paris",
    postcode: "75016",
    coordinates: { lat: 48.8414, lng: 2.2531 },
    description: "Session libre de tennis, venez nombreux !",
    maxParticipants: 8,
    currentParticipants: 2,
    createdBy: "test_user_3",
    createdByName: "Thomas Leroy",
    isReserved: true,
    status: "active"
  },
  {
    name: "Entraînement Volleyball",
    sport: "Volleyball",
    sportEmoji: "🏐",
    sportColor: "bg-blue-500", 
    location: "Salle de Sport",
    address: "8 Bd de Bercy, 75012 Paris, France",
    city: "Paris",
    postcode: "75012",
    coordinates: { lat: 48.8386, lng: 2.3782 },
    description: "Entraînement de volleyball pour tous niveaux",
    maxParticipants: 12,
    currentParticipants: 1,
    createdBy: "test_user_4",
    createdByName: "Emma Petit",
    isReserved: false,
    status: "active"
  },
  {
    name: "Compétition Badminton",
    sport: "Badminton",
    sportEmoji: "🏸",
    sportColor: "bg-purple-500",
    location: "Complexe Sportif",
    address: "1 Av. de Nogent, 94300 Vincennes, France", 
    city: "Vincennes",
    postcode: "94300",
    coordinates: { lat: 48.8448, lng: 2.4377 },
    description: "Compétition de badminton avec prix à gagner",
    maxParticipants: 16,
    currentParticipants: 4,
    createdBy: "test_user_5",
    createdByName: "Lucas Moreau",
    isReserved: true,
    status: "active"
  }
];

// Générer des dates de test (aujourd'hui + 1 à 7 jours)
function generateTestDates() {
  const today = new Date();
  const dates = [];
  
  for (let i = 1; i <= 7; i++) {
    const eventDate = new Date(today);
    eventDate.setDate(today.getDate() + i);
    
    // Heures variées : 9h, 14h, 18h
    const hours = [9, 14, 18];
    hours.forEach(hour => {
      const startTime = new Date(eventDate);
      startTime.setHours(hour, 0, 0, 0);
      
      const endTime = new Date(startTime);
      endTime.setHours(startTime.getHours() + 2); // 2 heures
      
      dates.push({ start: startTime, end: endTime });
    });
  }
  
  return dates;
}

// Créer un événement
async function createEvent(eventData) {
  try {
    const docRef = await addDoc(collection(db, 'events'), eventData);
    console.log(`✅ Événement créé: ${eventData.name}`);
    return docRef.id;
  } catch (error) {
    console.error(`❌ Erreur: ${eventData.name}`, error.message);
    return null;
  }
}

// Fonction principale
async function generateTestEvents() {
  console.log("🚀 Génération d'événements de test...\n");
  
  const dates = generateTestDates();
  let successCount = 0;
  
  // Créer des événements avec des dates variées
  for (let i = 0; i < testEvents.length; i++) {
    const eventTemplate = testEvents[i];
    const dateInfo = dates[i % dates.length];
    
    const eventData = {
      ...eventTemplate,
      date: dateInfo.start,
      endDate: dateInfo.end,
      createdAt: serverTimestamp()
    };
    
    const eventId = await createEvent(eventData);
    if (eventId) successCount++;
    
    // Pause entre les créations
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log(`\n🎉 Terminé ! ${successCount}/${testEvents.length} événements créés`);
  
  if (successCount > 0) {
    console.log("\n🧪 Pour tester le système de conflits :");
    console.log("1. Allez sur la page de création d'événement");
    console.log("2. Saisissez 'Place de la Concorde' dans l'adresse");
    console.log("3. Choisissez une date/heure qui entre en conflit");
    console.log("4. Observez les messages de statut (vert/orange/rouge)");
  }
  
  process.exit(0);
}

// Lancer la génération
generateTestEvents().catch(console.error);
