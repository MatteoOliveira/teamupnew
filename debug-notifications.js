// Script de debug pour vérifier les notifications
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs, doc, getDoc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyDEhV0f2kWRyorZGi6QoFEuQvSabUq8qGU",
  authDomain: "teamup-7a2d6.firebaseapp.com",
  projectId: "teamup-7a2d6",
  storageBucket: "teamup-7a2d6.firebasestorage.app",
  messagingSenderId: "535498065920",
  appId: "1:535498065920:web:9c23eb124e7af9748030e5"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function debugNotifications() {
  console.log('🔍 === DEBUG NOTIFICATIONS ===');
  
  try {
    // 1. Trouver les événements créés par mazz
    console.log('📅 Recherche des événements créés par mazz...');
    const eventsQuery = query(collection(db, 'events'), where('createdBy', '==', 'mazz'));
    const eventsSnapshot = await getDocs(eventsQuery);
    
    console.log(`📅 Événements trouvés: ${eventsSnapshot.size}`);
    
    for (const eventDoc of eventsSnapshot.docs) {
      const eventData = eventDoc.data();
      console.log(`📅 Événement: ${eventData.name} (ID: ${eventDoc.id})`);
      
      // 2. Vérifier les participants de cet événement
      console.log('👥 Recherche des participants...');
      const participantsQuery = query(collection(db, 'event_participants'), where('eventId', '==', eventDoc.id));
      const participantsSnapshot = await getDocs(participantsQuery);
      
      console.log(`👥 Participants trouvés: ${participantsSnapshot.size}`);
      
      for (const participantDoc of participantsSnapshot.docs) {
        const participantData = participantDoc.data();
        console.log(`👥 Participant: ${participantData.userName} (ID: ${participantData.userId})`);
        
        // 3. Vérifier si c'est test1 et s'il a un token FCM
        if (participantData.userId === 'test1') {
          console.log('🎯 test1 trouvé comme participant !');
          
          // Vérifier le token FCM de test1
          const userDoc = await getDoc(doc(db, 'users', 'test1'));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            console.log('🔑 Token FCM de test1:', userData.fcmToken ? 'Présent' : 'Absent');
            console.log('🔔 Notifications activées:', userData.pushNotificationsEnabled);
          } else {
            console.log('❌ Document utilisateur test1 non trouvé');
          }
        }
      }
    }
    
    // 4. Vérifier directement les participations de test1
    console.log('🔍 Recherche directe des participations de test1...');
    const test1ParticipationsQuery = query(collection(db, 'event_participants'), where('userId', '==', 'test1'));
    const test1ParticipationsSnapshot = await getDocs(test1ParticipationsQuery);
    
    console.log(`🔍 Participations de test1: ${test1ParticipationsSnapshot.size}`);
    
    for (const participationDoc of test1ParticipationsSnapshot.docs) {
      const participationData = participationDoc.data();
      console.log(`🔍 Participation: EventId ${participationData.eventId}`);
      
      // Vérifier l'événement correspondant
      const eventDoc = await getDoc(doc(db, 'events', participationData.eventId));
      if (eventDoc.exists()) {
        const eventData = eventDoc.data();
        console.log(`🔍 Événement: ${eventData.name} créé par ${eventData.createdBy}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

debugNotifications();
