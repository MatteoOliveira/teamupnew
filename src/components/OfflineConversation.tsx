'use client';

import { useState, useEffect } from 'react';
import { useOfflineMessages } from '@/hooks/useOfflineMessages';

interface OfflineConversationProps {
  eventId: string;
  eventName: string;
}

export default function OfflineConversation({ eventId, eventName }: OfflineConversationProps) {
  const { getOfflineMessagesForEvent, addOfflineMessage } = useOfflineMessages();
  const [newMessage, setNewMessage] = useState('');
  const [offlineMessages, setOfflineMessages] = useState(getOfflineMessagesForEvent(eventId));

  useEffect(() => {
    setOfflineMessages(getOfflineMessagesForEvent(eventId));
  }, [eventId, getOfflineMessagesForEvent]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      addOfflineMessage(eventId, newMessage.trim(), 'message');
      setNewMessage('');
      setOfflineMessages(getOfflineMessagesForEvent(eventId));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">💬 Conversation</h1>
            <p className="text-sm text-gray-600">{eventName}</p>
          </div>
          <div className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
            📱 Hors ligne
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Messages hors ligne</h2>
        
        {offlineMessages.length > 0 ? (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {offlineMessages.map((msg) => (
              <div key={msg.id} className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-blue-800">
                    {msg.type === 'confirmation' ? '✅ Confirmation' : '💬 Message'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {msg.createdAt.toLocaleString('fr-FR')}
                  </span>
                </div>
                <p className="text-gray-800">{msg.content}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>📝 Aucun message hors ligne</p>
            <p className="text-sm mt-1">Écrivez un message ci-dessous</p>
          </div>
        )}
      </div>

      {/* Formulaire de nouveau message */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Nouveau message</h3>
        
        <div className="space-y-3">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Tapez votre message..."
            className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={3}
          />
          
          <div className="flex space-x-2">
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Envoyer hors ligne
            </button>
            <button
              onClick={() => setNewMessage('')}
              className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition-colors"
            >
              Effacer
            </button>
          </div>
        </div>
        
        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm text-yellow-800">
            ⚠️ Ce message sera envoyé automatiquement quand vous serez reconnecté
          </p>
        </div>
      </div>
    </div>
  );
}
