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
  debugLogs: string[];
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
    debugLogs: [],
  });

  // Fonction pour ajouter des logs visibles
  const addDebugLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log(logMessage); // Log dans la console aussi
    setState(prev => ({
      ...prev,
      debugLogs: [...prev.debugLogs.slice(-9), logMessage] // Garde les 10 derniers logs
    }));
  }, []);

  // Vérifier le support des notifications
  useEffect(() => {
    const checkSupport = async () => {
      try {
        const supported = await isSupported();
        addDebugLog(`📱 Support des notifications: ${supported}`);
        setState(prev => ({ ...prev, isSupported: supported }));
      } catch (error) {
        addDebugLog(`❌ Erreur vérification support: ${error}`);
        setState(prev => ({ ...prev, isSupported: false }));
      }
    };
    checkSupport();
  }, [addDebugLog]);

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
      addDebugLog('🚀 === DÉBUT SUBSCRIPTION SIMPLIFIÉE ===');
      addDebugLog(`👤 Utilisateur: ${user.uid}`);
      addDebugLog(`📱 Support: ${state.isSupported}`);
      addDebugLog(`📝 Permission: ${Notification.permission}`);
      
      // Vérifier la permission
      if (Notification.permission !== 'granted') {
        addDebugLog('📝 Demande de permission...');
        const granted = await requestPermission();
        addDebugLog(`📝 Permission accordée: ${granted}`);
        if (!granted) {
          setState(prev => ({ ...prev, isLoading: false, error: 'Permission refusée' }));
          return false;
        }
      }

      // Attendre le service worker (méthode originale simple)
      if ('serviceWorker' in navigator) {
        addDebugLog('🔧 Attente du service worker...');
        try {
          await navigator.serviceWorker.ready;
          addDebugLog('🔧 Service Worker prêt');
        } catch (error) {
          addDebugLog(`❌ Erreur Service Worker: ${error}`);
          // Continuer quand même
        }
      }

      // Obtenir le token FCM
      addDebugLog('🔑 Génération du token FCM...');
      const messaging = getMessaging();
      
      // Essayer d'abord sans clé VAPID (comme avant)
      addDebugLog('🔑 Tentative sans clé VAPID (méthode originale)...');
      let token;
      try {
        token = await getToken(messaging);
        addDebugLog('🔑 Token obtenu sans clé VAPID (méthode originale)');
      } catch (error) {
        addDebugLog(`❌ Échec sans clé VAPID: ${error}`);
        addDebugLog('🔑 Tentative avec clé VAPID...');
        const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || "BAjaKTombbQFolVsg8nRR1J0Lq9j0d4qHlkLCI0gz2F4ya3XOBQdP_obmgn800G4j3OG4lR7b5lYGKQFyaW8-F0";
        token = await getToken(messaging, { vapidKey });
        addDebugLog('🔑 Token obtenu avec clé VAPID');
      }
      
      if (!token) {
        throw new Error('Token FCM vide');
      }

      addDebugLog(`🔑 Token FCM obtenu: ${token.substring(0, 20)}...`);
      addDebugLog(`🔑 Token FCM complet: ${token}`);

      // Sauvegarder dans Firestore
      addDebugLog('💾 Sauvegarde dans Firestore...');
      await setDoc(doc(db, 'users', user.uid), {
        fcmToken: token,
        pushNotificationsEnabled: true,
        lastTokenUpdate: new Date(),
      }, { merge: true });

      addDebugLog('💾 Sauvegarde réussie');

      // Mettre à jour l'état
      addDebugLog('🔄 Mise à jour de l\'état local...');
      setState(prev => ({
        ...prev,
        isSubscribed: true,
        token: token,
        isLoading: false,
        error: null,
      }));

      addDebugLog('✅ === SUBSCRIPTION RÉUSSIE ===');
      addDebugLog(`📊 État final: isSubscribed=true, token=${token ? 'Présent' : 'Absent'}`);
      return true;
      
    } catch (error) {
      addDebugLog('❌ === ERREUR SUBSCRIPTION ===');
      addDebugLog(`❌ Erreur: ${error}`);
      
      let errorMessage = 'Erreur lors de l\'abonnement';
      if (error instanceof Error) {
        errorMessage = `${error.name}: ${error.message}`;
        addDebugLog(`❌ Stack: ${error.stack}`);
      }
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      return false;
    }
  }, [user, state.isSupported, requestPermission, addDebugLog]);

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
    addDebugLog,
  };
}
