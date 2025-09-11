'use client';

import { useState, useEffect, useCallback } from 'react';
import { collection, query, orderBy, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface AdminAnalytics {
  totalUsers: number;
  totalEvents: number;
  futureEvents: number;
  pastEvents: number;
  eventsToday: number;
  avgSessionTime: number;
  peakActivity: { date: string; users: number }[];
  eventsPerDay: { date: string; count: number }[];
  userGrowth: { date: string; count: number }[];
  popularSports: { sport: string; count: number }[];
  activeUsers: number;
  retentionRate: number;
}

export const useAdminAnalytics = () => {
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Charger tous les utilisateurs
      const usersQuery = query(collection(db, 'users'));
      const usersSnapshot = await getDocs(usersQuery);
      const users = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Charger tous les événements
      const eventsQuery = query(collection(db, 'events'), orderBy('date', 'desc'));
      const eventsSnapshot = await getDocs(eventsQuery);
      const events = eventsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Calculer les statistiques de base
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      const futureEvents = events.filter(event => {
        const eventDate = event.date instanceof Date ? event.date : new Date(event.date);
        return eventDate >= today;
      });

      const pastEvents = events.filter(event => {
        const eventDate = event.date instanceof Date ? event.date : new Date(event.date);
        return eventDate < today;
      });

      const eventsToday = events.filter(event => {
        const eventDate = event.date instanceof Date ? event.date : new Date(event.date);
        const eventDay = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
        return eventDay.getTime() === today.getTime();
      }).length;

      // Calculer les sports populaires
      const sportCounts: { [key: string]: number } = {};
      events.forEach(event => {
        const sport = event.sport || 'Non défini';
        sportCounts[sport] = (sportCounts[sport] || 0) + 1;
      });
      const popularSports = Object.entries(sportCounts)
        .map(([sport, count]) => ({ sport, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Générer des données d'activité (à remplacer par de vraies données)
      const peakActivity = generatePeakActivity(7);
      const eventsPerDay = generateEventsPerDay(events, 7);
      const userGrowth = generateUserGrowth(users, 30);

      // Calculer les utilisateurs actifs (dernière semaine)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const activeUsers = users.filter(user => {
        const lastActive = user.lastActiveAt ? 
          (user.lastActiveAt instanceof Date ? user.lastActiveAt : new Date(user.lastActiveAt)) : 
          new Date(0);
        return lastActive >= weekAgo;
      }).length;

      // Calculer le taux de rétention (simulé)
      const retentionRate = Math.min(95, Math.max(60, 85 + Math.random() * 10));

      setAnalytics({
        totalUsers: users.length,
        totalEvents: events.length,
        futureEvents: futureEvents.length,
        pastEvents: pastEvents.length,
        eventsToday,
        avgSessionTime: 15.5, // À calculer avec de vraies données
        peakActivity,
        eventsPerDay,
        userGrowth,
        popularSports,
        activeUsers,
        retentionRate
      });

    } catch (err) {
      console.error('Erreur chargement analytics:', err);
      setError('Erreur lors du chargement des analytics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  return {
    analytics,
    loading,
    error,
    refetch: loadAnalytics
  };
};

// Fonctions utilitaires pour générer des données mock
const generatePeakActivity = (days: number) => {
  const data = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toISOString().split('T')[0],
      users: Math.floor(Math.random() * 50) + 10
    });
  }
  return data;
};

const generateEventsPerDay = (events: any[], days: number) => {
  const data = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dayEvents = events.filter(event => {
      const eventDate = event.date instanceof Date ? event.date : new Date(event.date);
      const eventDay = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
      const targetDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      return eventDay.getTime() === targetDay.getTime();
    });
    data.push({
      date: date.toISOString().split('T')[0],
      count: dayEvents.length
    });
  }
  return data;
};

const generateUserGrowth = (users: any[], days: number) => {
  const data = [];
  const totalUsers = users.length;
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    // Simuler une croissance progressive
    const baseCount = Math.max(0, totalUsers - (days - i) * 2);
    const randomGrowth = Math.floor(Math.random() * 3);
    const count = baseCount + randomGrowth;
    
    data.push({
      date: date.toISOString().split('T')[0],
      count: Math.max(0, count)
    });
  }
  return data;
};
