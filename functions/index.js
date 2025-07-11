// functions/index.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();

exports.sendGroupMessageNotification = functions.firestore
  .document('event_chats/{eventId}/messages/{messageId}')
  .onCreate(async (snap, context) => {
    const message = snap.data();
    const eventId = context.params.eventId;
    if (!message || !eventId) return null;

    // Récupérer les membres du groupe
    const membersSnap = await db.collection(`event_chats/${eventId}/members`).get();
    const tokens = [];
    for (const memberDoc of membersSnap.docs) {
      const member = memberDoc.data();
      // Ne pas notifier l'expéditeur
      if (member.userId === message.senderId) continue;
      // Récupérer le token FCM du membre
      const userDoc = await db.collection('users').doc(member.userId).get();
      if (userDoc.exists && userDoc.data().fcmToken) {
        tokens.push(userDoc.data().fcmToken);
      }
    }
    if (tokens.length === 0) return null;

    // Construire la notification
    const payload = {
      notification: {
        title: message.isOrganizer ? 'Message de l’organisateur' : `Nouveau message dans ${context.params.eventId}`,
        body: `${message.senderName}: ${message.content}`,
        click_action: `https://teamup.app/messages/${eventId}`,
      },
      data: {
        eventId,
      },
    };
    // Envoyer la notification à tous les tokens
    await admin.messaging().sendToDevice(tokens, payload);
    return null;
  }); 