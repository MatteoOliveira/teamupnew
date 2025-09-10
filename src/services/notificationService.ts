/**
 * Service de notifications en temps réel pour TeamUp
 * Gère l'envoi de notifications push pour les événements et messages
 */

import { collection, doc, addDoc, updateDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface NotificationData {
  userId: string;
  title: string;
  body: string;
  type: 'event_reminder' | 'new_message' | 'event_update' | 'event_cancelled' | 'new_participant';
  eventId?: string;
  messageId?: string;
  data?: Record<string, string>;
  scheduledFor?: Date;
  sent?: boolean;
  createdAt: Date;
}

export interface NotificationTemplate {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
}

class NotificationService {
  private templates: Record<string, NotificationTemplate> = {
    event_reminder: {
      title: '⏰ Rappel d\'événement',
      body: 'Votre événement "{eventName}" commence dans {timeLeft}',
      icon: '/icon-192x192.webp',
      badge: '/icon-192x192.webp',
      actions: [
        { action: 'view', title: 'Voir l\'événement' },
        { action: 'dismiss', title: 'Ignorer' }
      ]
    },
    new_message: {
      title: '💬 Nouveau message',
      body: '{senderName}: {messagePreview}',
      icon: '/icon-192x192.webp',
      badge: '/icon-192x192.webp',
      actions: [
        { action: 'reply', title: 'Répondre' },
        { action: 'view', title: 'Voir la conversation' }
      ]
    },
    event_update: {
      title: '📝 Événement modifié',
      body: 'L\'événement "{eventName}" a été modifié',
      icon: '/icon-192x192.webp',
      badge: '/icon-192x192.webp',
      actions: [
        { action: 'view', title: 'Voir les modifications' },
        { action: 'dismiss', title: 'Ignorer' }
      ]
    },
    event_cancelled: {
      title: '❌ Événement annulé',
      body: 'L\'événement "{eventName}" a été annulé',
      icon: '/icon-192x192.webp',
      badge: '/icon-192x192.webp',
      actions: [
        { action: 'view', title: 'Voir les détails' }
      ]
    },
    new_participant: {
      title: '👥 Nouveau participant',
      body: '{participantName} a rejoint votre événement "{eventName}"',
      icon: '/icon-192x192.webp',
      badge: '/icon-192x192.webp',
      actions: [
        { action: 'view', title: 'Voir les participants' }
      ]
    }
  };

  /**
   * Envoie une notification à un utilisateur
   */
  async sendNotification(notification: Omit<NotificationData, 'createdAt'>): Promise<string> {
    try {
      const notificationData: NotificationData = {
        ...notification,
        createdAt: new Date()
      };

      const docRef = await addDoc(collection(db, 'notifications'), notificationData);
      return docRef.id;
    } catch (error) {
      console.error('Erreur envoi notification:', error);
      throw error;
    }
  }

  /**
   * Envoie une notification à plusieurs utilisateurs
   */
  async sendBulkNotification(
    userIds: string[],
    title: string,
    body: string,
    type: NotificationData['type'],
    eventId?: string,
    data?: Record<string, string>
  ): Promise<string[]> {
    const promises = userIds.map(userId => 
      this.sendNotification({
        userId,
        title,
        body,
        type,
        eventId,
        data
      })
    );

    try {
      const notificationIds = await Promise.all(promises);
      return notificationIds;
    } catch (error) {
      console.error('Erreur envoi notifications en masse:', error);
      throw error;
    }
  }

  /**
   * Envoie une notification de rappel d'événement
   */
  async sendEventReminder(
    userId: string,
    eventName: string,
    eventId: string,
    timeLeft: string
  ): Promise<string> {
    const template = this.templates.event_reminder;
    const title = template.title;
    const body = template.body
      .replace('{eventName}', eventName)
      .replace('{timeLeft}', timeLeft);

    return this.sendNotification({
      userId,
      title,
      body,
      type: 'event_reminder',
      eventId,
      data: {
        eventId,
        action: 'view_event'
      }
    });
  }

  /**
   * Envoie une notification de nouveau message
   */
  async sendNewMessageNotification(
    userId: string,
    senderName: string,
    messagePreview: string,
    eventId: string,
    messageId: string
  ): Promise<string> {
    const template = this.templates.new_message;
    const title = template.title;
    const body = template.body
      .replace('{senderName}', senderName)
      .replace('{messagePreview}', messagePreview);

    return this.sendNotification({
      userId,
      title,
      body,
      type: 'new_message',
      eventId,
      messageId,
      data: {
        eventId,
        messageId,
        action: 'view_message'
      }
    });
  }

  /**
   * Envoie une notification de modification d'événement
   */
  async sendEventUpdateNotification(
    userId: string,
    eventName: string,
    eventId: string,
    changes: string[]
  ): Promise<string> {
    const template = this.templates.event_update;
    const title = template.title;
    const body = template.body.replace('{eventName}', eventName);

    return this.sendNotification({
      userId,
      title,
      body,
      type: 'event_update',
      eventId,
      data: {
        eventId,
        changes: changes.join(', '),
        action: 'view_event'
      }
    });
  }

  /**
   * Envoie une notification d'annulation d'événement
   */
  async sendEventCancelledNotification(
    userId: string,
    eventName: string,
    eventId: string,
    reason?: string
  ): Promise<string> {
    const template = this.templates.event_cancelled;
    const title = template.title;
    const body = template.body.replace('{eventName}', eventName);

    return this.sendNotification({
      userId,
      title,
      body,
      type: 'event_cancelled',
      eventId,
      data: {
        eventId,
        reason: reason || 'Non spécifiée',
        action: 'view_event'
      }
    });
  }

  /**
   * Envoie une notification de nouveau participant
   */
  async sendNewParticipantNotification(
    userId: string,
    participantName: string,
    eventName: string,
    eventId: string
  ): Promise<string> {
    const template = this.templates.new_participant;
    const title = template.title;
    const body = template.body
      .replace('{participantName}', participantName)
      .replace('{eventName}', eventName);

    return this.sendNotification({
      userId,
      title,
      body,
      type: 'new_participant',
      eventId,
      data: {
        eventId,
        participantName,
        action: 'view_participants'
      }
    });
  }

  /**
   * Récupère les notifications d'un utilisateur
   */
  async getUserNotifications(userId: string, limit: number = 50): Promise<NotificationData[]> {
    try {
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId)
      );

      const querySnapshot = await getDocs(q);
      const notifications: NotificationData[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        notifications.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date()
        } as NotificationData & { id: string });
      });

      // Trier par date de création (plus récent en premier)
      notifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      return notifications.slice(0, limit);
    } catch (error) {
      console.error('Erreur récupération notifications:', error);
      throw error;
    }
  }

  /**
   * Marque une notification comme lue
   */
  async markAsRead(notificationId: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), {
        read: true,
        readAt: new Date()
      });
    } catch (error) {
      console.error('Erreur marquage notification comme lue:', error);
      throw error;
    }
  }

  /**
   * Supprime une notification
   */
  async deleteNotification(notificationId: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), {
        deleted: true,
        deletedAt: new Date()
      });
    } catch (error) {
      console.error('Erreur suppression notification:', error);
      throw error;
    }
  }

  /**
   * Planifie une notification pour plus tard
   */
  async scheduleNotification(
    notification: Omit<NotificationData, 'createdAt' | 'scheduledFor'>,
    scheduledFor: Date
  ): Promise<string> {
    try {
      const notificationData: NotificationData = {
        ...notification,
        createdAt: new Date(),
        scheduledFor
      };

      const docRef = await addDoc(collection(db, 'scheduled_notifications'), notificationData);
      return docRef.id;
    } catch (error) {
      console.error('Erreur planification notification:', error);
      throw error;
    }
  }

  /**
   * Obtient le template d'une notification
   */
  getTemplate(type: string): NotificationTemplate | null {
    return this.templates[type] || null;
  }

  /**
   * Formate le temps restant pour un événement
   */
  formatTimeLeft(eventDate: Date): string {
    const now = new Date();
    const diff = eventDate.getTime() - now.getTime();

    if (diff <= 0) {
      return 'maintenant';
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
      return `${days} jour${days > 1 ? 's' : ''}`;
    } else if (hours > 0) {
      return `${hours} heure${hours > 1 ? 's' : ''}`;
    } else {
      return `${minutes} minute${minutes > 1 ? 's' : ''}`;
    }
  }
}

// Instance singleton
export const notificationService = new NotificationService();
