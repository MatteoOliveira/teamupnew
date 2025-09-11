'use client';

import { useWebNotifications } from '@/hooks/useWebNotifications';
import { useEffect, useState } from 'react';

export default function WebNotificationsProvider() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Ne pas s'exécuter côté serveur
  if (!isClient) {
    return null;
  }

  // Vérifier que nous sommes côté client avant d'accéder aux APIs du navigateur
  if (typeof window === 'undefined' || typeof Notification === 'undefined') {
    return null;
  }

  console.log('=== WebNotificationsProvider initialisé ===');
  console.log('Permission notifications:', Notification.permission);
  console.log('Support notifications:', 'Notification' in window);
  console.log('Window object:', typeof window);
  console.log('Document object:', typeof document);
  
  // Ce composant initialise simplement le hook pour écouter les notifications
  // Le hook gère déjà les vérifications SSR
  const { notifications, unreadCount } = useWebNotifications();
  
  console.log('État notifications:', { count: notifications.length, unread: unreadCount });
  
  // Pas de rendu visible, juste l'initialisation du hook
  return null;
}
