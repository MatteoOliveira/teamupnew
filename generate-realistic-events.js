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

// Données réalistes pour les événements
const sports = [
  { name: "Football", emoji: "⚽", color: "bg-green-500" },
  { name: "Basketball", emoji: "🏀", color: "bg-orange-500" },
  { name: "Tennis", emoji: "🎾", color: "bg-yellow-500" },
  { name: "Volleyball", emoji: "🏐", color: "bg-blue-500" },
  { name: "Badminton", emoji: "🏸", color: "bg-purple-500" },
  { name: "Ping-pong", emoji: "🏓", color: "bg-red-500" },
  { name: "Handball", emoji: "🤾", color: "bg-indigo-500" },
  { name: "Rugby", emoji: "🏉", color: "bg-green-600" }
];

const locations = [
  {
    name: "Stade de France",
    address: "93200 Saint-Denis, France",
    city: "Saint-Denis",
    postcode: "93200",
    coordinates: { lat: 48.9245, lng: 2.3602 }
  },
  {
    name: "Parc des Princes",
    address: "24 Rue du Commandant Guilbaud, 75016 Paris, France",
    city: "Paris",
    postcode: "75016",
    coordinates: { lat: 48.8414, lng: 2.2531 }
  },
  {
    name: "Accor Arena",
    address: "8 Bd de Bercy, 75012 Paris, France",
    city: "Paris",
    postcode: "75012",
    coordinates: { lat: 48.8386, lng: 2.3782 }
  },
  {
    name: "Stade Roland Garros",
    address: "2 Av. Gordon Bennett, 75016 Paris, France",
    city: "Paris",
    postcode: "75016",
    coordinates: { lat: 48.8470, lng: 2.2531 }
  },
  {
    name: "Complexe Sportif de Vincennes",
    address: "1 Av. de Nogent, 94300 Vincennes, France",
    city: "Vincennes",
    postcode: "94300",
    coordinates: { lat: 48.8448, lng: 2.4377 }
  },
  {
    name: "Gymnase des Lilas",
    address: "35 Rue de Paris, 93260 Les Lilas, France",
    city: "Les Lilas",
    postcode: "93260",
    coordinates: { lat: 48.8799, lng: 2.4184 }
  },
  {
    name: "Centre Sportif de Montreuil",
    address: "1 Rue de la République, 93100 Montreuil, France",
    city: "Montreuil",
    postcode: "93100",
    coordinates: { lat: 48.8614, lng: 2.4432 }
  },
  {
    name: "Salle de Sport de Bagnolet",
    address: "15 Rue de la République, 93170 Bagnolet, France",
    city: "Bagnolet",
    postcode: "93170",
    coordinates: { lat: 48.8694, lng: 2.4169 }
  }
];

const eventTemplates = [
  "Match amical",
  "Tournoi",
  "Entraînement",
  "Compétition",
  "Session libre",
  "Championnat",
  "Coupe",
  "Rencontre",
  "Défi",
  "Festival sportif"
];

// Générer des dates réalistes (aujourd'hui + 1 à 30 jours)
function generateRealisticDates() {
  const today = new Date();
  const events = [];
  
  for (let i = 1; i <= 30; i++) {
    const eventDate = new Date(today);
    eventDate.setDate(today.getDate() + i);
    
    // Générer 1-3 événements par jour
    const eventsPerDay = Math.floor(Math.random() * 3) + 1;
    
    for (let j = 0; j < eventsPerDay; j++) {
      const startHour = Math.floor(Math.random() * 12) + 8; // 8h à 20h
      const startMinute = Math.random() < 0.5 ? 0 : 30;
      const duration = Math.floor(Math.random() * 3) + 1; // 1 à 3 heures
      
      const startTime = new Date(eventDate);
      startTime.setHours(startHour, startMinute, 0, 0);
      
      const endTime = new Date(startTime);
      endTime.setHours(startTime.getHours() + duration);
      
      events.push({
        start: startTime,
        end: endTime
      });
    }
  }
  
  return events;
}

// Créer un événement
async function createEvent(eventData) {
  try {
    const docRef = await db.collection('events').add(eventData);
    console.log(`✅ Événement créé: ${eventData.name} (ID: ${docRef.id})`);
    return docRef.id;
  } catch (error) {
    console.error(`❌ Erreur lors de la création de l'événement ${eventData.name}:`, error);
    return null;
  }
}

// Générer des utilisateurs de test
const testUsers = [
  { id: "test_user_1", name: "Alex Martin", email: "alex.martin@test.com" },
  { id: "test_user_2", name: "Sarah Dubois", email: "sarah.dubois@test.com" },
  { id: "test_user_3", name: "Thomas Leroy", email: "thomas.leroy@test.com" },
  { id: "test_user_4", name: "Emma Petit", email: "emma.petit@test.com" },
  { id: "test_user_5", name: "Lucas Moreau", email: "lucas.moreau@test.com" }
];

// Fonction principale
async function generateRealisticEvents() {
  console.log("🚀 Génération d'événements réalistes pour simuler la production...\n");
  
  const dates = generateRealisticDates();
  const events = [];
  
  // Créer des événements variés
  for (let i = 0; i < 50; i++) {
    const sport = sports[Math.floor(Math.random() * sports.length)];
    const location = locations[Math.floor(Math.random() * locations.length)];
    const template = eventTemplates[Math.floor(Math.random() * eventTemplates.length)];
    const user = testUsers[Math.floor(Math.random() * testUsers.length)];
    const dateInfo = dates[Math.floor(Math.random() * dates.length)];
    
    // 70% de chance d'être réservé
    const isReserved = Math.random() < 0.7;
    
    const eventData = {
      name: `${template} ${sport.name}`,
      sport: sport.name,
      sportEmoji: sport.emoji,
      sportColor: sport.color,
      location: location.name,
      address: location.address,
      city: location.city,
      postcode: location.postcode,
      coordinates: location.coordinates,
      date: admin.firestore.Timestamp.fromDate(dateInfo.start),
      endDate: admin.firestore.Timestamp.fromDate(dateInfo.end),
      description: `Rejoignez-nous pour un ${template.toLowerCase()} de ${sport.name.toLowerCase()} ! ${isReserved ? 'Lieu réservé pour cet événement.' : 'Événement libre, venez nombreux !'}`,
      maxParticipants: Math.floor(Math.random() * 20) + 5, // 5 à 25 participants
      currentParticipants: Math.floor(Math.random() * 5), // 0 à 5 participants déjà inscrits
      createdBy: user.id,
      createdByName: user.name,
      createdAt: admin.firestore.Timestamp.now(),
      isReserved: isReserved,
      status: 'active'
    };
    
    events.push(eventData);
  }
  
  // Créer les événements en base
  console.log(`📅 Création de ${events.length} événements...\n`);
  
  let successCount = 0;
  for (const eventData of events) {
    const eventId = await createEvent(eventData);
    if (eventId) successCount++;
    
    // Petite pause pour éviter de surcharger Firebase
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log(`\n🎉 Génération terminée !`);
  console.log(`✅ ${successCount} événements créés avec succès`);
  console.log(`❌ ${events.length - successCount} événements échoués`);
  
  // Afficher quelques statistiques
  const reservedEvents = events.filter(e => e.isReserved).length;
  const freeEvents = events.length - reservedEvents;
  
  console.log(`\n📊 Statistiques:`);
  console.log(`   🏟️  Événements réservés: ${reservedEvents}`);
  console.log(`   🆓 Événements libres: ${freeEvents}`);
  console.log(`   🏃 Sports: ${[...new Set(events.map(e => e.sport))].join(', ')}`);
  console.log(`   📍 Lieux: ${[...new Set(events.map(e => e.city))].join(', ')}`);
  
  console.log(`\n🧪 Pour tester le système de conflits:`);
  console.log(`   1. Allez sur la page de création d'événement`);
  console.log(`   2. Saisissez une adresse existante (ex: "Parc des Princes")`);
  console.log(`   3. Choisissez une date/heure qui entre en conflit`);
  console.log(`   4. Observez les messages de statut (vert/orange/rouge)`);
  
  process.exit(0);
}

// Lancer la génération
generateRealisticEvents().catch(console.error);
