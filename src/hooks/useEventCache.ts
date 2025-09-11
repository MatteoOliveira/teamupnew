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
          if (!event.date) return false;
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
    console.log('🔄 Tentative de cache pour l\'événement:', event.id, event.name);
    console.log('📅 Date de l\'événement:', event.date);
    
    // Vérifier que l'événement est futur
    if (!event.date) {
      console.log('❌ Événement sans date, pas de cache');
      return false;
    }
    
    const eventDate = typeof event.date === 'string' ? new Date(event.date) : new Date(event.date.seconds * 1000);
    const now = new Date();
    console.log('📅 Date de l\'événement:', eventDate);
    console.log('📅 Date actuelle:', now);
    console.log('📅 Événement futur?', eventDate > now);
    
    if (eventDate <= now) {
      console.log('❌ Événement passé, pas de cache');
      return false;
    }

    console.log('✅ Événement futur, mise en cache...');
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
          .sort((a, b) => {
            const dateA = a.date ? (typeof a.date === 'string' ? new Date(a.date) : new Date(a.date.seconds * 1000)) : new Date(0);
            const dateB = b.date ? (typeof b.date === 'string' ? new Date(b.date) : new Date(b.date.seconds * 1000)) : new Date(0);
            return dateA.getTime() - dateB.getTime();
          })
          .slice(0, 50);
      }

      saveCachedEvents(newEvents);
      console.log('💾 Événement mis en cache:', event.id, 'Total en cache:', newEvents.length);
      return newEvents;
    });

    return true;
  }, [saveCachedEvents]);

  const getCachedEvent = useCallback((eventId: string): CachedEvent | null => {
    const cached = cachedEvents.find(event => event.id === eventId);
    console.log('🔍 Recherche événement en cache:', eventId, cached ? '✅ Trouvé' : '❌ Non trouvé');
    return cached || null;
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
        if (!event.date) return false;
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
