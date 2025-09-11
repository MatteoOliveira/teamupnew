'use client';

import { useState, useEffect, useCallback } from 'react';
import { Event, CachedEvent } from '@/types/event';

export function useEventCache() {
  const [cachedEvents, setCachedEvents] = useState<CachedEvent[]>([]);

  const saveCachedEvents = useCallback((events: CachedEvent[]) => {
    try {
      localStorage.setItem('teamup-cached-events', JSON.stringify(events));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du cache:', error);
    }
  }, []);

  const loadCachedEvents = useCallback(() => {
    try {
      const cached = localStorage.getItem('teamup-cached-events');
      if (cached) {
        const events = JSON.parse(cached).map((event: unknown) => {
          const eventData = event as Record<string, unknown>;
          return {
            ...eventData,
            cachedAt: new Date(eventData.cachedAt as string),
            date: new Date(eventData.date as string),
            endDate: new Date(eventData.endDate as string),
            createdAt: new Date(eventData.createdAt as string)
          };
        });
        
        // Filtrer uniquement les événements futurs
        const futureEvents = events.filter((event: CachedEvent) => {
          const eventDate = typeof event.date === 'string' ? new Date(event.date) : new Date(event.date.seconds * 1000);
          return eventDate > new Date();
        });
        
        setCachedEvents(futureEvents);
        
        // Nettoyer le cache des événements passés
        if (futureEvents.length !== events.length) {
          saveCachedEvents(futureEvents);
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement du cache:', error);
    }
  }, [saveCachedEvents]);

  // Charger les événements en cache au démarrage
  useEffect(() => {
    loadCachedEvents();
  }, [loadCachedEvents]);

  const cacheEvent = useCallback((event: Event) => {
    // Vérifier que l'événement est futur
    const eventDate = typeof event.date === 'string' ? new Date(event.date) : new Date(event.date.seconds * 1000);
    if (eventDate <= new Date()) {
      return false;
    }

    const cachedEvent: CachedEvent = {
      ...event,
      cachedAt: new Date(),
      isOfflineAvailable: true
    };

    setCachedEvents(prev => {
      // Vérifier si l'événement existe déjà
      const existingIndex = prev.findIndex(e => e.id === event.id);
      
      let newEvents;
      if (existingIndex >= 0) {
        // Mettre à jour l'événement existant
        newEvents = [...prev];
        newEvents[existingIndex] = cachedEvent;
      } else {
        // Ajouter le nouvel événement
        newEvents = [...prev, cachedEvent];
      }

      // Limiter à 50 événements maximum
      if (newEvents.length > 50) {
        newEvents = newEvents
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .slice(0, 50);
      }

      saveCachedEvents(newEvents);
      return newEvents;
    });

    return true;
  }, [saveCachedEvents]);

  const getCachedEvent = useCallback((eventId: string): CachedEvent | null => {
    return cachedEvents.find(event => event.id === eventId) || null;
  }, [cachedEvents]);

  const isEventCached = useCallback((eventId: string): boolean => {
    return cachedEvents.some(event => event.id === eventId);
  }, [cachedEvents]);

  const removeCachedEvent = useCallback((eventId: string) => {
    setCachedEvents(prev => {
      const newEvents = prev.filter(event => event.id !== eventId);
      saveCachedEvents(newEvents);
      return newEvents;
    });
  }, [saveCachedEvents]);

  const clearExpiredEvents = useCallback(() => {
    const now = new Date();
    setCachedEvents(prev => {
      const validEvents = prev.filter(event => {
        const eventDate = typeof event.date === 'string' ? new Date(event.date) : new Date(event.date.seconds * 1000);
        return eventDate > now;
      });
      saveCachedEvents(validEvents);
      return validEvents;
    });
  }, [saveCachedEvents]);

  // Nettoyer automatiquement les événements expirés toutes les heures
  useEffect(() => {
    const interval = setInterval(clearExpiredEvents, 60 * 60 * 1000); // 1 heure
    return () => clearInterval(interval);
  }, [clearExpiredEvents]);

  return {
    cachedEvents,
    cacheEvent,
    getCachedEvent,
    isEventCached,
    removeCachedEvent,
    clearExpiredEvents
  };
}
