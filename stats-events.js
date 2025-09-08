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

// Fonction pour afficher les statistiques des événements
async function showEventStats() {
  console.log("📊 Statistiques des événements dans la base de données...\n");
  
  try {
    // Récupérer tous les événements
    const eventsSnapshot = await db.collection('events').get();
    
    if (eventsSnapshot.empty) {
      console.log("✅ Aucun événement trouvé dans la base de données.");
      return;
    }
    
    const events = eventsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log(`📈 Total d'événements: ${events.length}\n`);
    
    // Statistiques par statut de réservation
    const reservedEvents = events.filter(e => e.isReserved);
    const freeEvents = events.filter(e => !e.isReserved);
    
    console.log(`🏟️  Événements réservés: ${reservedEvents.length} (${Math.round(reservedEvents.length/events.length*100)}%)`);
    console.log(`🆓 Événements libres: ${freeEvents.length} (${Math.round(freeEvents.length/events.length*100)}%)\n`);
    
    // Statistiques par sport
    const sports = {};
    events.forEach(event => {
      const sport = event.sport || 'Non défini';
      sports[sport] = (sports[sport] || 0) + 1;
    });
    
    console.log("🏃 Sports les plus populaires:");
    Object.entries(sports)
      .sort(([,a], [,b]) => b - a)
      .forEach(([sport, count]) => {
        console.log(`   ${sport}: ${count} événement(s)`);
      });
    
    console.log();
    
    // Statistiques par ville
    const cities = {};
    events.forEach(event => {
      const city = event.city || 'Non définie';
      cities[city] = (cities[city] || 0) + 1;
    });
    
    console.log("📍 Événements par ville:");
    Object.entries(cities)
      .sort(([,a], [,b]) => b - a)
      .forEach(([city, count]) => {
        console.log(`   ${city}: ${count} événement(s)`);
      });
    
    console.log();
    
    // Statistiques par créateur
    const creators = {};
    events.forEach(event => {
      const creator = event.createdByName || event.createdBy || 'Anonyme';
      creators[creator] = (creators[creator] || 0) + 1;
    });
    
    console.log("👥 Événements par créateur:");
    Object.entries(creators)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10) // Top 10
      .forEach(([creator, count]) => {
        console.log(`   ${creator}: ${count} événement(s)`);
      });
    
    console.log();
    
    // Prochains événements (dans les 7 prochains jours)
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    const upcomingEvents = events.filter(event => {
      if (!event.date) return false;
      const eventDate = event.date.toDate ? event.date.toDate() : new Date(event.date.seconds * 1000);
      return eventDate >= now && eventDate <= nextWeek;
    });
    
    console.log(`📅 Événements dans les 7 prochains jours: ${upcomingEvents.length}`);
    
    if (upcomingEvents.length > 0) {
      console.log("\n🎯 Prochains événements:");
      upcomingEvents
        .sort((a, b) => {
          const dateA = a.date.toDate ? a.date.toDate() : new Date(a.date.seconds * 1000);
          const dateB = b.date.toDate ? b.date.toDate() : new Date(b.date.seconds * 1000);
          return dateA - dateB;
        })
        .slice(0, 5) // Top 5
        .forEach(event => {
          const eventDate = event.date.toDate ? event.date.toDate() : new Date(event.date.seconds * 1000);
          const dateStr = eventDate.toLocaleDateString('fr-FR', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
          });
          console.log(`   ${dateStr} - ${event.name} (${event.sport}) - ${event.city}`);
        });
    }
    
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des statistiques:", error);
  }
  
  process.exit(0);
}

// Lancer l'affichage des statistiques
showEventStats().catch(console.error);
