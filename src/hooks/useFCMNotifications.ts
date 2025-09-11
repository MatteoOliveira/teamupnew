'use client';

import { useState, useEffect, useCallback } from 'react';
import { getToken, onMessage } from 'firebase/messaging';
import { messaging } from '@/lib/firebase';
import { useAuth } from './useAuth';

interface FCMState {
  token: string | null;
  permission: 'granted' | 'denied' | 'default';
  isSubscribed: boolean;
  error: string | null;
}

export function useFCMNotifications() {
  const { user } = useAuth();
  const [state, setState] = useState<FCMState>({
    token: null,
    permission: 'default',
    isSubscribed: false,
    error: null
  });

  // Vérifier le support des notifications
  const isSupported = typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator;

  // Demander la permission
  const requestPermission = useCallback(async () => {
    if (!isSupported) {
      setState(prev => ({ ...prev, error: 'Notifications non supportées' }));
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setState(prev => ({ ...prev, permission }));
      
      if (permission === 'granted') {
        return await subscribe();
      } else {
        setState(prev => ({ ...prev, error: 'Permission refusée' }));
        return false;
      }
    } catch (error) {
      console.error('Erreur lors de la demande de permission:', error);
      setState(prev => ({ ...prev, error: 'Erreur lors de la demande de permission' }));
      return false;
    }
  }, [isSupported]);

  // S'abonner aux notifications FCM
  const subscribe = useCallback(async () => {
    if (!messaging || !user) {
      setState(prev => ({ ...prev, error: 'Messaging ou utilisateur non disponible' }));
      return false;
    }

    try {
      // Attendre que le service worker soit prêt
      const registration = await navigator.serviceWorker.ready;
      console.log('🔔 Service worker prêt:', registration);

      // Obtenir le token FCM
      const token = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || "MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEhT9Dl5kGogf7BQCXnEECup4ysZ8LcJRyoMwThbcwf/sriDPTKs7+dzw/kVbfsVgTswTuuJR8hg69a9eRHUQz/w==",
        serviceWorkerRegistration: registration
      });

      if (token) {
        console.log('🔔 Token FCM obtenu:', token);
        
        // Sauvegarder le token dans le profil utilisateur
        try {
          const { doc, setDoc } = await import('firebase/firestore');
          const { db } = await import('@/lib/firebase');
          
          await setDoc(doc(db, 'users', user.uid), {
            fcmToken: token,
            fcmTokenUpdated: new Date()
          }, { merge: true });
          
          console.log('🔔 Token FCM sauvegardé dans le profil');
        } catch (error) {
          console.error('🔔 Erreur lors de la sauvegarde du token:', error);
        }
        
        setState(prev => ({ 
          ...prev, 
          token, 
          isSubscribed: true, 
          error: null 
        }));
        return true;
      } else {
        setState(prev => ({ ...prev, error: 'Impossible d\'obtenir le token FCM' }));
        return false;
      }
    } catch (error) {
      console.error('Erreur lors de l\'abonnement FCM:', error);
      setState(prev => ({ ...prev, error: 'Erreur lors de l\'abonnement FCM' }));
      return false;
    }
  }, [user]);

  // Se désabonner
  const unsubscribe = useCallback(async () => {
    setState(prev => ({ 
      ...prev, 
      token: null, 
      isSubscribed: false, 
      error: null 
    }));
  }, []);

  // Écouter les messages FCM
  useEffect(() => {
    if (!messaging || !state.isSubscribed) return;

    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('🔔 Message FCM reçu:', payload);
      
      // Afficher la notification même si l'app est ouverte
      if (Notification.permission === 'granted') {
        const notification = new Notification(payload.notification?.title || 'TeamUp', {
          body: payload.notification?.body || 'Nouvelle notification',
          icon: '/icon-192x192.webp',
          badge: '/icon-192x192.webp',
          tag: payload.data?.eventId || 'teamup-notification',
          requireInteraction: true,
          silent: false,
          data: payload.data
        });

        notification.onclick = () => {
          window.focus();
          if (payload.data?.eventId) {
            window.open(`/event/${payload.data.eventId}`, '_blank');
          }
          notification.close();
        };
      }
    });

    return unsubscribe;
  }, [messaging, state.isSubscribed]);

  // Initialiser automatiquement
  useEffect(() => {
    if (!user || !isSupported) return;

    const initialize = async () => {
      // Vérifier la permission actuelle
      const currentPermission = Notification.permission;
      setState(prev => ({ ...prev, permission: currentPermission }));

      if (currentPermission === 'granted') {
        await subscribe();
      }
    };

    initialize();
  }, [user, isSupported, subscribe]);

  return {
    ...state,
    isSupported,
    requestPermission,
    subscribe,
    unsubscribe
  };
}
