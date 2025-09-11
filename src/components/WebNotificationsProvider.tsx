'use client';

import { useWebNotifications } from '@/hooks/useWebNotifications';

export default function WebNotificationsProvider() {
  // Ce composant initialise simplement le hook pour écouter les notifications
  useWebNotifications();
  
  // Pas de rendu visible, juste l'initialisation du hook
  return null;
}
