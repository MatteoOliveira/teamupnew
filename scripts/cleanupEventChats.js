// Script de nettoyage automatique des groupes de discussion expirés
// Usage : node scripts/cleanupEventChats.js

const { initializeApp, applicationDefault } = require('firebase-admin/app');
const { getFirestore, Timestamp } = require('firebase-admin/firestore');

// Initialisation Firebase Admin
initializeApp({
  credential: applicationDefault(),
});

const db = getFirestore();

async function deleteCollection(collectionRef) {
  const snapshot = await collectionRef.get();
  const batchSize = snapshot.size;
  if (batchSize === 0) return;
  const batch = db.batch();
  snapshot.docs.forEach(doc => batch.delete(doc.ref));
  await batch.commit();
}

async function cleanupEventChats() {
  const now = new Date();
  const chatsSnap = await db.collection('event_chats').get();
  let deletedCount = 0;
  for (const chatDoc of chatsSnap.docs) {
    const data = chatDoc.data();
    if (data.deletedAt && data.deletedAt.toDate() < now) {
      // Supprimer sous-collections messages et members
      await deleteCollection(chatDoc.ref.collection('messages'));
      await deleteCollection(chatDoc.ref.collection('members'));
      // Supprimer le document principal
      await chatDoc.ref.delete();
      deletedCount++;
      console.log(`Salon supprimé : ${chatDoc.id} (${data.eventName})`);
    }
  }
  console.log(`Nettoyage terminé. ${deletedCount} salons supprimés.`);
}

cleanupEventChats().catch(err => {
  console.error('Erreur lors du nettoyage des groupes de discussion :', err);
  process.exit(1);
}); 