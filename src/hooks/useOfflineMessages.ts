'use client';

import { useState, useEffect, useCallback } from 'react';

export interface OfflineMessage {
  id: string;
  eventId: string;
  content: string;
  createdAt: Date;
  type: 'message' | 'confirmation';
  isSynced: boolean;
}

export function useOfflineMessages() {
  const [offlineMessages, setOfflineMessages] = useState<OfflineMessage[]>([]);

  const saveOfflineMessages = useCallback((messages: OfflineMessage[]) => {
    try {
      localStorage.setItem('teamup-offline-messages', JSON.stringify(messages));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des messages hors ligne:', error);
    }
  }, []);

  const loadOfflineMessages = useCallback(() => {
    try {
      const cached = localStorage.getItem('teamup-offline-messages');
      if (cached) {
        const messages = JSON.parse(cached).map((msg: unknown) => {
          const messageData = msg as Record<string, unknown>;
          return {
            ...messageData,
            createdAt: new Date(messageData.createdAt as string),
          };
        });
        setOfflineMessages(messages);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des messages hors ligne:', error);
    }
  }, []);

  // Charger les messages au démarrage
  useEffect(() => {
    loadOfflineMessages();
  }, [loadOfflineMessages]);

  const addOfflineMessage = useCallback((eventId: string, content: string, type: 'message' | 'confirmation' = 'message') => {
    const newMessage: OfflineMessage = {
      id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      eventId,
      content,
      createdAt: new Date(),
      type,
      isSynced: false,
    };

    setOfflineMessages(prev => {
      const updated = [...prev, newMessage];
      saveOfflineMessages(updated);
      return updated;
    });

    return newMessage.id;
  }, [saveOfflineMessages]);

  const getOfflineMessagesForEvent = useCallback((eventId: string): OfflineMessage[] => {
    return offlineMessages.filter(msg => msg.eventId === eventId);
  }, [offlineMessages]);

  const markMessageAsSynced = useCallback((messageId: string) => {
    setOfflineMessages(prev => {
      const updated = prev.map(msg => 
        msg.id === messageId ? { ...msg, isSynced: true } : msg
      );
      saveOfflineMessages(updated);
      return updated;
    });
  }, [saveOfflineMessages]);

  const clearSyncedMessages = useCallback(() => {
    setOfflineMessages(prev => {
      const unsynced = prev.filter(msg => !msg.isSynced);
      saveOfflineMessages(unsynced);
      return unsynced;
    });
  }, [saveOfflineMessages]);

  return {
    offlineMessages,
    addOfflineMessage,
    getOfflineMessagesForEvent,
    markMessageAsSynced,
    clearSyncedMessages,
  };
}
