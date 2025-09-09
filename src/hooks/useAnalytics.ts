import { useState, useEffect, useCallback } from 'react';
import { collection, addDoc, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './useAuth';

export interface AnalyticsEvent {
  id?: string;
  userId: string;
  action: string;
  category: 'event' | 'user' | 'navigation' | 'engagement';
  details?: Record<string, any>;
  timestamp: Date;
  metadata?: {
    userAgent?: string;
    screenSize?: string;
    referrer?: string;
  };
}

export interface UserStats {
  totalEvents: number;
  eventsCreated: number;
  eventsJoined: number;
  favoriteSport: string;
  participationRate: number;
  averageEventDuration: number;
  activityScore: number;
  monthlyTrend: number;
  sportsDistribution: Record<string, number>;
  recentActivity: AnalyticsEvent[];
}

export const useAnalytics = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Track une action utilisateur
  const trackEvent = useCallback(async (
    action: string,
    category: AnalyticsEvent['category'],
    details?: Record<string, any>
  ) => {
    if (!user) return;

    try {
      const event: Omit<AnalyticsEvent, 'id'> = {
        userId: user.uid,
        action,
        category,
        details,
        timestamp: new Date(),
        metadata: {
          userAgent: navigator.userAgent,
          screenSize: `${window.screen.width}x${window.screen.height}`,
          referrer: document.referrer,
        },
      };

      await addDoc(collection(db, 'analytics'), event);
    } catch (error) {
      console.error('Erreur lors du tracking:', error);
    }
  }, [user]);

  // Récupérer les statistiques utilisateur (version simplifiée)
  const getUserStats = useCallback(async (): Promise<UserStats | null> => {
    if (!user) return null;

    setIsLoading(true);
    try {
      // Récupérer tous les événements de l'utilisateur (sans index complexe)
      const eventsQuery = query(
        collection(db, 'events'),
        where('createdBy', '==', user.uid)
      );
      const eventsSnapshot = await getDocs(eventsQuery);
      const createdEvents = eventsSnapshot.docs.length;

      // Récupérer les inscriptions de l'utilisateur (sans index complexe)
      const registrationsQuery = query(
        collection(db, 'event_participants'),
        where('userId', '==', user.uid)
      );
      const registrationsSnapshot = await getDocs(registrationsQuery);
      const joinedEvents = registrationsSnapshot.docs.length;

      // Pour l'instant, on évite la requête analytics complexe qui nécessite un index
      // TODO: Réactiver quand les index Firebase seront créés
      const recentActivity: AnalyticsEvent[] = [];

      // Calculer les statistiques
      const totalEvents = createdEvents + joinedEvents;
      const participationRate = createdEvents > 0 ? (joinedEvents / createdEvents) * 100 : 0;
      
      // Calculer la distribution des sports
      const sportsDistribution: Record<string, number> = {};
      eventsSnapshot.docs.forEach(doc => {
        const sport = doc.data().sport;
        sportsDistribution[sport] = (sportsDistribution[sport] || 0) + 1;
      });

      // Trouver le sport favori
      const favoriteSport = Object.entries(sportsDistribution)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Aucun';

      // Calculer le score d'activité (basé sur les événements réels)
      const activityScore = Math.min(5, Math.max(1, totalEvents / 3));

      // Calculer la tendance mensuelle (basée sur les événements des 3 derniers mois)
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      
      const recentEvents = eventsSnapshot.docs.filter(doc => {
        const eventDate = doc.data().createdAt?.toDate();
        return eventDate && eventDate >= threeMonthsAgo;
      }).length;
      
      const olderEvents = eventsSnapshot.docs.length - recentEvents;
      const monthlyTrend = olderEvents > 0 ? ((recentEvents - olderEvents) / olderEvents) * 100 : 0;

      // Calculer la durée moyenne des événements (basée sur les vrais événements)
      let totalDuration = 0;
      let eventsWithDuration = 0;
      
      eventsSnapshot.docs.forEach(doc => {
        const eventData = doc.data();
        if (eventData.startTime && eventData.endTime) {
          const start = new Date(eventData.startTime);
          const end = new Date(eventData.endTime);
          const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60); // en heures
          if (duration > 0) {
            totalDuration += duration;
            eventsWithDuration++;
          }
        }
      });
      
      const averageEventDuration = eventsWithDuration > 0 ? totalDuration / eventsWithDuration : 2.0;

      return {
        totalEvents,
        eventsCreated: createdEvents,
        eventsJoined: joinedEvents,
        favoriteSport,
        participationRate,
        averageEventDuration,
        activityScore,
        monthlyTrend,
        sportsDistribution,
        recentActivity,
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      // Retourner des statistiques par défaut en cas d'erreur
      return {
        totalEvents: 0,
        eventsCreated: 0,
        eventsJoined: 0,
        favoriteSport: 'Aucun',
        participationRate: 0,
        averageEventDuration: 0,
        activityScore: 0,
        monthlyTrend: 0,
        sportsDistribution: {},
        recentActivity: [],
      };
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Actions prédéfinies pour le tracking
  const trackEventCreation = useCallback((eventName: string, sport: string) => {
    trackEvent('event_created', 'event', { eventName, sport });
  }, [trackEvent]);

  const trackEventJoin = useCallback((eventId: string, eventName: string) => {
    trackEvent('event_joined', 'event', { eventId, eventName });
  }, [trackEvent]);

  const trackEventLeave = useCallback((eventId: string, eventName: string) => {
    trackEvent('event_left', 'event', { eventId, eventName });
  }, [trackEvent]);

  const trackProfileUpdate = useCallback((field: string) => {
    trackEvent('profile_updated', 'user', { field });
  }, [trackEvent]);

  const trackPageView = useCallback((page: string) => {
    trackEvent('page_view', 'navigation', { page });
  }, [trackEvent]);

  const trackSearch = useCallback((query: string, results: number) => {
    trackEvent('search_performed', 'engagement', { query, results });
  }, [trackEvent]);

  const trackFilter = useCallback((filterType: string, value: string) => {
    trackEvent('filter_applied', 'engagement', { filterType, value });
  }, [trackEvent]);

  return {
    trackEvent,
    trackEventCreation,
    trackEventJoin,
    trackEventLeave,
    trackProfileUpdate,
    trackPageView,
    trackSearch,
    trackFilter,
    getUserStats,
    isLoading,
  };
};
