'use client';

import { useState, useEffect, useCallback } from 'react';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './useAuth';

interface WebNotification {
  id: string;
  userId: string;
  title: string;
  body: string;
  eventId: string;
  data: { eventId: string; action: string };
  type: string;
  createdAt: Date;
}

export function useWebNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<WebNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Écouter les notifications en temps réel
  useEffect(() => {
    if (!user) return;

    console.log('🔔 Écoute des notifications web natives pour:', user.uid);

    const notificationsQuery = query(
      collection(db, 'web_notifications'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(10)
    );

    const unsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
      const newNotifications: WebNotification[] = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        newNotifications.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt.toDate()
        } as WebNotification);
      });

      setNotifications(newNotifications);
      setUnreadCount(newNotifications.length);

      // Afficher les nouvelles notifications
      newNotifications.forEach((notification) => {
        if (Notification.permission === 'granted') {
          const webNotification = new Notification(notification.title, {
            body: notification.body,
            icon: '/icon-192x192.webp',
            badge: '/icon-192x192.webp',
            tag: `event-${notification.eventId}`,
            requireInteraction: true,
            silent: false,
            data: notification.data
          });

          // Rediriger vers l'événement quand on clique sur la notification
          webNotification.onclick = () => {
            window.open(`/event/${notification.eventId}`, '_blank');
            webNotification.close();
          };

          // Fermer automatiquement après 5 secondes
          setTimeout(() => {
            webNotification.close();
          }, 5000);
        }
      });
    });

    return () => unsubscribe();
  }, [user]);

  // Marquer une notification comme lue
  const markAsRead = useCallback((notificationId: string) => {
    // Ici on pourrait ajouter un champ "read" dans Firestore
    console.log('Notification marquée comme lue:', notificationId);
  }, []);

  return {
    notifications,
    unreadCount,
    markAsRead
  };
}
