'use client';

import { useWebNotifications } from '@/hooks/useWebNotifications';
import { useEffect, useState } from 'react';

export default function WebNotificationsProvider() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Toujours appeler le hook, mais il gère les vérifications SSR
  const { notifications, unreadCount } = useWebNotifications();

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
  console.log('État notifications:', { count: notifications.length, unread: unreadCount });
  
  // Pas de rendu visible, juste l'initialisation du hook
  return null;
}
