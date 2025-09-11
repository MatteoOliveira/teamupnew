'use client';

import { useState, useEffect, useCallback } from 'react';
import { getMessaging, getToken, isSupported } from 'firebase/messaging';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './useAuth';

interface PushNotificationState {
  isSupported: boolean;
  permission: { granted: boolean; denied: boolean; default: boolean };
  token: string | null;
  isSubscribed: boolean;
  isLoading: boolean;
  error: string | null;
}

export function usePushNotificationsSimple() {
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
        console.log('📱 Support des notifications:', supported);
        setState(prev => ({ ...prev, isSupported: supported }));
      } catch (error) {
        console.error('Erreur vérification support:', error);
        setState(prev => ({ ...prev, isSupported: false }));
      }
    };
    checkSupport();
  }, []);

  // Vérifier la permission
  const checkPermission = useCallback(() => {
    if (!state.isSupported) return;
    
    const permission = Notification.permission;
    console.log('📝 Permission actuelle:', permission);
    
    setState(prev => ({
      ...prev,
      permission: {
        granted: permission === 'granted',
        denied: permission === 'denied',
        default: permission === 'default',
      },
    }));
  }, [state.isSupported]);

  // Demander la permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!state.isSupported) {
      console.log('❌ Notifications non supportées');
      return false;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      console.log('📝 Demande de permission...');
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

  // S'abonner aux notifications - Version ultra-simplifiée
  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!user || !state.isSupported) {
      setState(prev => ({ ...prev, error: 'Utilisateur non connecté ou notifications non supportées' }));
      return false;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      console.log('🚀 === DÉBUT SUBSCRIPTION SIMPLIFIÉE ===');
      console.log('👤 Utilisateur:', user.uid);
      console.log('📱 Support:', state.isSupported);
      console.log('📝 Permission:', Notification.permission);
      
      // Vérifier la permission
      if (Notification.permission !== 'granted') {
        console.log('📝 Demande de permission...');
        const granted = await requestPermission();
        if (!granted) {
          setState(prev => ({ ...prev, isLoading: false, error: 'Permission refusée' }));
          return false;
        }
      }

      // Attendre le service worker
      if ('serviceWorker' in navigator) {
        console.log('🔧 Attente du service worker...');
        const registration = await navigator.serviceWorker.ready;
        console.log('🔧 Service Worker prêt:', registration.active?.scriptURL);
        await new Promise(resolve => setTimeout(resolve, 2000)); // Attendre 2 secondes
      }

      // Obtenir le token FCM
      console.log('🔑 Génération du token FCM...');
      const messaging = getMessaging();
      
      const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
      console.log('🔑 Clé VAPID disponible:', !!vapidKey);
      console.log('🔑 Clé VAPID (début):', vapidKey?.substring(0, 10) + '...');
      
      if (!vapidKey) {
        throw new Error('Clé VAPID manquante');
      }
      
      const token = await getToken(messaging, { vapidKey });
      
      if (!token) {
        throw new Error('Token FCM vide');
      }

      console.log('🔑 Token FCM obtenu:', token.substring(0, 20) + '...');
      console.log('🔑 Token FCM complet:', token);

      // Sauvegarder dans Firestore
      console.log('💾 Sauvegarde dans Firestore...');
      await setDoc(doc(db, 'users', user.uid), {
        fcmToken: token,
        pushNotificationsEnabled: true,
        lastTokenUpdate: new Date(),
      }, { merge: true });

      console.log('💾 Sauvegarde réussie');

      // Mettre à jour l'état
      console.log('🔄 Mise à jour de l\'état local...');
      setState(prev => ({
        ...prev,
        isSubscribed: true,
        token: token,
        isLoading: false,
        error: null,
      }));

      console.log('✅ === SUBSCRIPTION RÉUSSIE ===');
      console.log('📊 État final:', {
        isSubscribed: true,
        token: token ? 'Présent' : 'Absent',
        isLoading: false,
        error: null
      });
      return true;
      
    } catch (error) {
      console.error('❌ === ERREUR SUBSCRIPTION ===');
      console.error('❌ Erreur:', error);
      
      let errorMessage = 'Erreur lors de l\'abonnement';
      if (error instanceof Error) {
        errorMessage = `${error.name}: ${error.message}`;
        console.error('❌ Stack:', error.stack);
      }
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      return false;
    }
  }, [user, state.isSupported, requestPermission]);

  // Se désabonner
  const unsubscribe = useCallback(async (): Promise<boolean> => {
    if (!user) return false;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      await setDoc(doc(db, 'users', user.uid), {
        fcmToken: null,
        pushNotificationsEnabled: false,
        lastTokenUpdate: new Date(),
      }, { merge: true });

      setState(prev => ({
        ...prev,
        isSubscribed: false,
        token: null,
        isLoading: false,
        error: null,
      }));

      return true;
    } catch (error) {
      console.error('Erreur désabonnement:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Erreur lors du désabonnement',
      }));
      return false;
    }
  }, [user]);

  // Initialiser l'état depuis Firestore
  useEffect(() => {
    if (!user) return;
    
    const initializeState = async () => {
      try {
        console.log('🔄 === INITIALISATION ÉTAT ===');
        console.log('👤 Utilisateur:', user.uid);
        
        checkPermission();
        
        console.log('📖 Lecture Firestore...');
        const userDoc = await doc(db, 'users', user.uid);
        const userSnap = await getDoc(userDoc);
        
        if (userSnap.exists()) {
          const userData = userSnap.data();
          const hasToken = !!userData.fcmToken;
          const isEnabled = userData.pushNotificationsEnabled === true;
          
          console.log('📊 Données Firestore:', {
            hasToken,
            isEnabled,
            fcmToken: userData.fcmToken ? 'Présent' : 'Absent',
            pushNotificationsEnabled: userData.pushNotificationsEnabled,
            lastTokenUpdate: userData.lastTokenUpdate
          });
          
          const newState = {
            isSubscribed: hasToken && isEnabled,
            token: userData.fcmToken || null
          };
          
          console.log('🔄 Nouvel état calculé:', newState);
          
          setState(prev => ({
            ...prev,
            ...newState
          }));
          
          console.log('✅ État initialisé');
        } else {
          console.log('❌ Document utilisateur non trouvé');
        }
      } catch (error) {
        console.error('❌ Erreur initialisation:', error);
      }
    };
    
    initializeState();
  }, [user, checkPermission]);

  return {
    ...state,
    subscribe,
    unsubscribe,
    requestPermission,
    checkPermission,
  };
}
