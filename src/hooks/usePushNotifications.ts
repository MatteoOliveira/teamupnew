'use client';

import { useState, useEffect, useCallback } from 'react';
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';
import { doc, setDoc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './useAuth';

interface NotificationPermission {
  granted: boolean;
  denied: boolean;
  default: boolean;
}

interface PushNotificationState {
  isSupported: boolean;
  permission: NotificationPermission;
  token: string | null;
  isSubscribed: boolean;
  isLoading: boolean;
  error: string | null;
}


export function usePushNotifications() {
  const { user } = useAuth();
  const [state, setState] = useState<PushNotificationState>({
    isSupported: false,
    permission: { granted: false, denied: false, default: true },
    token: null,
    isSubscribed: false,
    isLoading: false,
    error: null,
  });

  // Vérifier le support des notifications
  useEffect(() => {
    const checkSupport = async () => {
      try {
        const supported = await isSupported();
        setState(prev => ({ ...prev, isSupported: supported }));
      } catch (error) {
        console.error('Erreur vérification support notifications:', error);
        setState(prev => ({ ...prev, isSupported: false }));
      }
    };

    checkSupport();
  }, []);

  // Vérifier les permissions
  const checkPermission = useCallback(() => {
    if (!state.isSupported || typeof window === 'undefined') {
      return;
    }

    const permission = Notification.permission;
    console.log('🔍 Permission actuelle:', permission);
    
    setState(prev => ({
      ...prev,
      permission: {
        granted: permission === 'granted',
        denied: permission === 'denied',
        default: permission === 'default',
      },
    }));

    return permission;
  }, [state.isSupported]);

  // Demander la permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!state.isSupported || typeof window === 'undefined') {
      setState(prev => ({ ...prev, error: 'Notifications non supportées' }));
      return false;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const permission = await Notification.requestPermission();
      
      setState(prev => ({
        ...prev,
        permission: {
          granted: permission === 'granted',
          denied: permission === 'denied',
          default: permission === 'default',
        },
        isLoading: false,
      }));

      return permission === 'granted';
    } catch (error) {
      console.error('Erreur demande permission:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Erreur lors de la demande de permission',
      }));
      return false;
    }
  }, [state.isSupported]);

  // Obtenir le token FCM
  const getFCMToken = useCallback(async (): Promise<string | null> => {
    if (!state.isSupported || !state.permission.granted) {
      return null;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const messaging = getMessaging();
      const token = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      });

      setState(prev => ({
        ...prev,
        token,
        isLoading: false,
      }));

      return token;
    } catch (error) {
      console.error('Erreur obtention token FCM:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Erreur lors de l\'obtention du token',
      }));
      return null;
    }
  }, [state.isSupported, state.permission]);

  // S'abonner aux notifications
  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!user || !state.isSupported) {
      setState(prev => ({ ...prev, error: 'Utilisateur non connecté ou notifications non supportées' }));
      return false;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      console.log('🚀 Début subscription, permission actuelle:', state.permission);
      
      // Vérifier que le service worker est disponible
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        console.log('🔧 Service Worker prêt:', registration.active?.scriptURL);
      }
      
      // Demander la permission si nécessaire
      if (!state.permission.granted) {
        console.log('📝 Demande de permission...');
        const granted = await requestPermission();
        console.log('📝 Permission accordée:', granted);
        if (!granted) {
          setState(prev => ({ ...prev, isLoading: false, error: 'Permission refusée par l\'utilisateur' }));
          return false;
        }
      }

      // Obtenir le token FCM
      const token = await getFCMToken();
      if (!token) {
        setState(prev => ({ ...prev, isLoading: false, error: 'Impossible d\'obtenir le token FCM' }));
        return false;
      }

      console.log('🔑 Token FCM obtenu:', token.substring(0, 20) + '...');

      // Sauvegarder le token dans Firestore
      await setDoc(doc(db, 'users', user.uid), {
        fcmToken: token,
        pushNotificationsEnabled: true,
        lastTokenUpdate: new Date(),
      }, { merge: true });

      console.log('💾 Token sauvegardé dans Firestore');

      setState(prev => ({
        ...prev,
        isSubscribed: true,
        token: token,
        isLoading: false,
      }));

      console.log('✅ État local mis à jour: isSubscribed = true');

      // Recharger l'état depuis Firestore pour s'assurer de la synchronisation
      setTimeout(async () => {
        try {
          const userDoc = await doc(db, 'users', user.uid);
          const userSnap = await getDoc(userDoc);
          
          if (userSnap.exists()) {
            const userData = userSnap.data();
            const hasToken = !!userData.fcmToken;
            const isEnabled = userData.pushNotificationsEnabled === true;
            
            console.log('🔄 Rechargement état Firestore:', {
              hasToken,
              isEnabled,
              fcmToken: userData.fcmToken ? 'Présent' : 'Absent',
              pushNotificationsEnabled: userData.pushNotificationsEnabled
            });
            
            setState(prev => ({ 
              ...prev, 
              isSubscribed: hasToken && isEnabled,
              token: userData.fcmToken || null
            }));
          }
        } catch (error) {
          console.error('Erreur rechargement état:', error);
        }
      }, 1000);

      return true;
    } catch (error) {
      console.error('❌ Erreur abonnement notifications:', error);
      
      // Détail de l'erreur pour debug
      let errorMessage = 'Erreur lors de l\'abonnement aux notifications';
      if (error instanceof Error) {
        errorMessage = `Erreur: ${error.message}`;
        console.error('❌ Détail erreur:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
      }
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      return false;
    }
  }, [user, state.isSupported, state.permission.granted, requestPermission, getFCMToken]);

  // Se désabonner des notifications
  const unsubscribe = useCallback(async (): Promise<boolean> => {
    if (!user) {
      setState(prev => ({ ...prev, error: 'Utilisateur non connecté' }));
      return false;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Supprimer le token de Firestore
      await updateDoc(doc(db, 'users', user.uid), {
        fcmToken: null,
        pushNotificationsEnabled: false,
        lastTokenUpdate: new Date(),
      });

      setState(prev => ({
        ...prev,
        isSubscribed: false,
        token: null,
        isLoading: false,
      }));

      return true;
    } catch (error) {
      console.error('Erreur désabonnement notifications:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Erreur lors du désabonnement',
      }));
      return false;
    }
  }, [user]);

  // Écouter les messages en premier plan
  const setupForegroundListener = useCallback(() => {
    if (!state.isSupported) return;

    try {
      const messaging = getMessaging();
      onMessage(messaging, (payload) => {
        console.log('🔔 Message reçu en premier plan:', payload);
        
        // Afficher une notification personnalisée
        if (payload.notification) {
          const notification = new Notification(payload.notification.title || 'TeamUp', {
            body: payload.notification.body || 'Nouvelle notification',
            icon: payload.notification.icon || '/icon-192x192.webp',
            tag: 'teamup-foreground',
            data: payload.data,
          });

          // Fermer automatiquement après 5 secondes
          setTimeout(() => {
            notification.close();
          }, 5000);
        }
      });
    } catch (error) {
      console.error('Erreur configuration listener premier plan:', error);
    }
  }, [state.isSupported]);

  // Initialiser l'état depuis Firestore
  useEffect(() => {
    if (!user) return;

    const initializeState = async () => {
      try {
        // Vérifier les permissions actuelles
        checkPermission();

        // Vérifier l'état d'abonnement depuis Firestore
        const userDoc = await doc(db, 'users', user.uid);
        const userSnap = await getDoc(userDoc);
        
        if (userSnap.exists()) {
          const userData = userSnap.data();
          const hasToken = !!userData.fcmToken;
          const isEnabled = userData.pushNotificationsEnabled === true;
          
          console.log('🔍 État Firestore:', {
            hasToken,
            isEnabled,
            fcmToken: userData.fcmToken ? 'Présent' : 'Absent',
            pushNotificationsEnabled: userData.pushNotificationsEnabled
          });
          
          setState(prev => ({ 
            ...prev, 
            isSubscribed: hasToken && isEnabled,
            token: userData.fcmToken || null
          }));
        } else {
          console.log('🔍 Document utilisateur non trouvé');
          setState(prev => ({ ...prev, isSubscribed: false }));
        }
      } catch (error) {
        console.error('Erreur initialisation état notifications:', error);
        setState(prev => ({ ...prev, isSubscribed: false }));
      }
    };

    initializeState();
  }, [user, checkPermission]);

  // Configurer l'écoute des messages en premier plan
  useEffect(() => {
    if (state.isSupported && state.permission.granted) {
      setupForegroundListener();
    }
  }, [state.isSupported, state.permission.granted, setupForegroundListener]);

  // Fonction pour envoyer une notification de test
  const sendTestNotification = useCallback(() => {
    if (!state.permission.granted) {
      setState(prev => ({ ...prev, error: 'Permission non accordée' }));
      return;
    }

    const notification = new Notification('Test TeamUp', {
      body: 'Ceci est une notification de test !',
      icon: '/icon-192x192.webp',
      badge: '/icon-192x192.webp',
      tag: 'teamup-test',
    });

    setTimeout(() => {
      notification.close();
    }, 3000);
  }, [state.permission.granted]);

  return {
    // État
    ...state,
    
    // Actions
    requestPermission,
    subscribe,
    unsubscribe,
    sendTestNotification,
    
    // Utilitaires
    canSubscribe: state.isSupported && state.permission.granted && !state.isSubscribed,
    canUnsubscribe: state.isSubscribed,
    needsPermission: state.permission.default || state.permission.denied,
    
    // Token pour debug
    token: state.token,
  };
}
