'use client';

import { useWebNotifications } from '@/hooks/useWebNotifications';

export default function WebNotificationsProvider() {
  console.log('🔔 === WebNotificationsProvider initialisé ===');
  console.log('🔔 Permission notifications:', Notification.permission);
  console.log('🔔 Support notifications:', 'Notification' in window);
  
  // Ce composant initialise simplement le hook pour écouter les notifications
  const { notifications, unreadCount } = useWebNotifications();
  
  console.log('🔔 État notifications:', { count: notifications.length, unread: unreadCount });
  
  // Pas de rendu visible, juste l'initialisation du hook
  return null;
}
