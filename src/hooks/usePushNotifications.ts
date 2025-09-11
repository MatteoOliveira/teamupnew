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
    permission: { granted: false, denied: false, default: true }, // Permission par défaut
    token: null,
    isSubscribed: false, // Pas activé par défaut
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
      console.log('📝 Demande de permission en cours...');
      const permission = await Notification.requestPermission();
      console.log('📝 Permission obtenue:', permission);
      
      setState(prev => ({
        ...prev,
        permission: {
          granted: permission === 'granted',
          denied: permission === 'denied',
          default: permission === 'default',
        },
        isLoading: false,
      }));

      console.log('📝 Permission accordée:', permission === 'granted');
      return permission === 'granted';
    } catch (error) {
      console.error('❌ Erreur demande permission:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Erreur lors de la demande de permission',
      }));
      return false;
    }
  }, [state.isSupported]);


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
      
      // Vérifier la permission directement depuis l'API
      if (Notification.permission !== 'granted') {
        console.log('📝 Permission non accordée, demande en cours...');
        const granted = await requestPermission();
        console.log('📝 Permission accordée:', granted);
        if (!granted) {
          setState(prev => ({ ...prev, isLoading: false, error: 'Permission refusée par l\'utilisateur' }));
          return false;
        }
      }

      // Obtenir le token FCM directement
      console.log('🔑 Obtention du token FCM...');
      const messaging = getMessaging();
      const token = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      });

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
  }, [user, state.isSupported, requestPermission]);

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
          
          // L'auto-activation est maintenant gérée dans un useEffect séparé
        } else {
          console.log('🔍 Document utilisateur non trouvé - Auto-activation');
          setState(prev => ({ ...prev, isSubscribed: false }));
          
          // L'auto-activation est maintenant gérée dans un useEffect séparé
        }
      } catch (error) {
        console.error('Erreur initialisation état notifications:', error);
        setState(prev => ({ ...prev, isSubscribed: false }));
      }
    };

    initializeState();
  }, [user, checkPermission, state.isSupported]);

  // Auto-activation séparée pour éviter les boucles infinies
  useEffect(() => {
    if (!user || !state.isSupported) return;

    const autoActivate = async () => {
      try {
        // Vérifier l'état d'abonnement depuis Firestore
        const userDoc = await doc(db, 'users', user.uid);
        const userSnap = await getDoc(userDoc);
        
        if (userSnap.exists()) {
          const userData = userSnap.data();
          // Auto-activer les notifications si l'utilisateur n'a pas encore de préférence définie OU si les notifications sont désactivées
          if ((!userData.hasOwnProperty('pushNotificationsEnabled') || userData.pushNotificationsEnabled === false)) {
            console.log('🚀 Auto-activation des notifications pour utilisateur');
            // Vérifier la permission actuelle avant de demander
            if (Notification.permission === 'default') {
              console.log('📝 Permission par défaut - demande automatique');
              const granted = await requestPermission();
              if (granted) {
                await subscribe(); // Activation immédiate après permission
              }
            } else if (Notification.permission === 'granted') {
              console.log('✅ Permission déjà accordée - activation directe');
              await subscribe();
            } else {
              console.log('❌ Permission refusée - pas d\'auto-activation');
            }
          }
        } else {
          // Nouvel utilisateur - auto-activer les notifications
          console.log('🚀 Auto-activation des notifications pour nouvel utilisateur');
          // Vérifier la permission actuelle avant de demander
          if (Notification.permission === 'default') {
            console.log('📝 Permission par défaut - demande automatique');
            const granted = await requestPermission();
            if (granted) {
              await subscribe(); // Activation immédiate après permission
            }
          } else if (Notification.permission === 'granted') {
            console.log('✅ Permission déjà accordée - activation directe');
            await subscribe();
          } else {
            console.log('❌ Permission refusée - pas d\'auto-activation');
          }
        }
      } catch (error) {
        console.error('Erreur auto-activation:', error);
      }
    };

    // Délai pour éviter les conflits avec l'initialisation
    const timeoutId = setTimeout(autoActivate, 2000);
    return () => clearTimeout(timeoutId);
  }, [user, state.isSupported, requestPermission, subscribe]);

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

  // Fonction pour forcer l'activation des notifications
  const forceActivation = useCallback(async (): Promise<boolean> => {
    if (!user || !state.isSupported) {
      setState(prev => ({ ...prev, error: 'Utilisateur non connecté ou notifications non supportées' }));
      return false;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      console.log('🚀 Force activation des notifications');
      
      // Demander la permission
      const granted = await requestPermission();
      if (!granted) {
        setState(prev => ({ ...prev, isLoading: false, error: 'Permission refusée par l\'utilisateur' }));
        return false;
      }

      // Activer les notifications
      const success = await subscribe();
      if (success) {
        setState(prev => ({ ...prev, isLoading: false, error: null }));
        return true;
      } else {
        setState(prev => ({ ...prev, isLoading: false, error: 'Erreur lors de l\'activation' }));
        return false;
      }
    } catch (error) {
      console.error('Erreur force activation:', error);
      setState(prev => ({ ...prev, isLoading: false, error: 'Erreur lors de l\'activation forcée' }));
      return false;
    }
  }, [user, state.isSupported, requestPermission, subscribe]);

  return {
    // État
    ...state,
    
    // Actions
    requestPermission,
    subscribe,
    unsubscribe,
    sendTestNotification,
    forceActivation,
    
    // Utilitaires
    canSubscribe: state.isSupported && state.permission.granted && !state.isSubscribed,
    canUnsubscribe: state.isSubscribed,
    needsPermission: state.permission.default || state.permission.denied,
    
    // Token pour debug
    token: state.token,
  };
}
