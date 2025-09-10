'use client';

import { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, query, where, orderBy, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface UserProfile {
  name: string;
  sport: string;
  city?: string;
  email?: string;
}

export interface EventData {
  id: string;
  name: string;
  sport: string;
  date: { seconds: number } | undefined;
  location: string;
  city: string;
  description: string;
  lat?: number;
  lng?: number;
  createdBy: string;
  createdAt: { seconds: number };
}

export interface ParticipationData {
  id: string;
  eventId: string;
  userId: string;
  eventName: string;
  eventDate: { seconds: number } | undefined;
  joinedAt: { seconds: number };
}

export interface MessageData {
  id: string;
  eventId: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: { seconds: number };
}

export interface ConsentData {
  analytics: boolean;
  marketing: boolean;
  timestamp: string;
  version: string;
}

export interface CompleteUserData {
  profile: UserProfile;
  events: EventData[];
  participations: ParticipationData[];
  messages: MessageData[];
  consent: ConsentData | null;
  uid: string;
  exportDate: string;
}

export function useUserData(userId: string | null) {
  const [userData, setUserData] = useState<CompleteUserData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debug log pour userId
  console.log('useUserData: userId =', userId);

  const fetchUserData = useCallback(async () => {
    if (!userId) {
      console.log('useUserData: userId is null');
      return;
    }

    console.log('useUserData: Fetching data for userId:', userId);
    setLoading(true);
    setError(null);

    try {
      // 1. Récupérer le profil utilisateur
      const profileQuery = query(collection(db, 'users'), where('__name__', '==', userId));
      const profileSnapshot = await getDocs(profileQuery);
      const profile = profileSnapshot.empty 
        ? { name: '', sport: '', city: '', email: '' }
        : profileSnapshot.docs[0].data() as UserProfile;

      // 2. Récupérer les événements créés par l'utilisateur (sans orderBy temporairement)
      const eventsQuery = query(
        collection(db, 'events'),
        where('createdBy', '==', userId)
      );
      const eventsSnapshot = await getDocs(eventsQuery);
      const events = eventsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as EventData[];
      
      // Trier côté client en attendant l'index Firestore
      events.sort((a, b) => {
        const dateA = a.createdAt?.seconds || 0;
        const dateB = b.createdAt?.seconds || 0;
        return dateB - dateA; // Descending order
      });

      // 3. Récupérer les participations de l'utilisateur (sans orderBy temporairement)
      const participationsQuery = query(
        collection(db, 'participations'),
        where('userId', '==', userId)
      );
      const participationsSnapshot = await getDocs(participationsQuery);
      const participations = participationsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ParticipationData[];
      
      // Trier côté client en attendant l'index Firestore
      participations.sort((a, b) => {
        const dateA = a.joinedAt?.seconds || 0;
        const dateB = b.joinedAt?.seconds || 0;
        return dateB - dateA; // Descending order
      });

      // 4. Récupérer les messages de l'utilisateur (sans orderBy temporairement)
      const messagesQuery = query(
        collection(db, 'messages'),
        where('userId', '==', userId)
      );
      const messagesSnapshot = await getDocs(messagesQuery);
      const messages = messagesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MessageData[];
      
      // Trier côté client en attendant l'index Firestore
      messages.sort((a, b) => {
        const dateA = a.timestamp?.seconds || 0;
        const dateB = b.timestamp?.seconds || 0;
        return dateB - dateA; // Descending order
      });

      // 5. Récupérer les consentements cookies
      let consent: ConsentData | null = null;
      if (typeof window !== 'undefined') {
        const storedConsent = localStorage.getItem('cookieConsent');
        if (storedConsent) {
          try {
            consent = JSON.parse(storedConsent);
          } catch (e) {
            console.warn('Erreur lors du parsing du consentement:', e);
          }
        }
      }

      // 6. Assembler toutes les données
      const completeData: CompleteUserData = {
        profile,
        events,
        participations,
        messages,
        consent,
        uid: userId,
        exportDate: new Date().toISOString()
      };

      setUserData(completeData);
    } catch (err) {
      console.error('Erreur lors du chargement des données utilisateur:', err);
      setError('Erreur lors du chargement de vos données');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const updateUserData = useCallback(async (updates: Partial<UserProfile>) => {
    if (!userId) return;

    try {
      // Mettre à jour le profil dans Firestore
      const profileQuery = query(collection(db, 'users'), where('__name__', '==', userId));
      const profileSnapshot = await getDocs(profileQuery);
      
      if (!profileSnapshot.empty) {
        const userDoc = profileSnapshot.docs[0];
        await updateDoc(userDoc.ref, updates);
        
        // Recharger les données
        await fetchUserData();
      }
    } catch (err) {
      console.error('Erreur lors de la mise à jour des données:', err);
      setError('Erreur lors de la mise à jour de vos données');
    }
  }, [userId, fetchUserData]);

  const updateConsent = useCallback(async (newConsent: ConsentData) => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('cookieConsent', JSON.stringify(newConsent));
        
        // Recharger les données pour inclure le nouveau consentement
        await fetchUserData();
      }
    } catch (err) {
      console.error('Erreur lors de la mise à jour du consentement:', err);
      setError('Erreur lors de la mise à jour de vos préférences');
    }
  }, [fetchUserData]);

  // Charger les données au montage du composant
  useEffect(() => {
    if (userId) {
      fetchUserData();
    }
  }, [userId, fetchUserData]);

  return {
    userData,
    loading,
    error,
    fetchUserData,
    updateUserData,
    updateConsent
  };
}
