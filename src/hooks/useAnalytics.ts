import { useState, useCallback } from 'react';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './useAuth';
import { EventData, ParticipantData, UserStats as NewUserStats, StatsPeriod } from '@/types/stats';
import { calculateUserStats, getStatsPeriod } from '@/utils/statsCalculator';

export interface AnalyticsEvent {
  id?: string;
  userId: string;
  action: string;
  category: 'event' | 'user' | 'navigation' | 'engagement';
  details?: Record<string, unknown>;
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
    details?: Record<string, unknown>
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

  // Récupérer les statistiques utilisateur (version améliorée)
  const getUserStats = useCallback(async (period: StatsPeriod = getStatsPeriod('all')): Promise<NewUserStats | null> => {
    if (!user) return null;

    setIsLoading(true);
    try {
      // Récupérer tous les événements
      const eventsSnapshot = await getDocs(collection(db, 'events'));
      const events: EventData[] = eventsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          sport: data.sport,
          city: data.city,
          date: data.date,
          endDate: data.endDate,
          createdBy: data.createdBy,
          isReserved: data.isReserved,
          maxParticipants: data.maxParticipants,
          currentParticipants: data.currentParticipants,
        };
      });

      // Récupérer tous les participants
      const participantsSnapshot = await getDocs(collection(db, 'event_participants'));
      const participants: ParticipantData[] = participantsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          eventId: data.eventId,
          userId: data.userId,
          userName: data.userName,
          registeredAt: data.registeredAt,
          isOrganizer: data.isOrganizer,
        };
      });

      // Calculer les statistiques avec nos nouvelles fonctions
      const stats = calculateUserStats(events, participants, user.uid, period);

      return stats;
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
        eventsByMonth: [],
        sportDistribution: [],
        monthlyGoal: { current: 0, target: 10 },
        newSportsGoal: { current: 0, target: 5 }
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
