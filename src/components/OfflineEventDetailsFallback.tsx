'use client';

import { useState, useEffect } from 'react';
import { useEventCache } from '@/hooks/useEventCache';
import { useOfflineMessages } from '@/hooks/useOfflineMessages';
import { CachedEvent } from '@/types/event';

interface OfflineEventDetailsFallbackProps {
  eventId: string;
}

export default function OfflineEventDetailsFallback({ eventId }: OfflineEventDetailsFallbackProps) {
  const { getCachedEvent } = useEventCache();
  const { getOfflineMessagesForEvent, addOfflineMessage } = useOfflineMessages();
  const [event, setEvent] = useState<CachedEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [messageType, setMessageType] = useState<'message' | 'confirmation'>('message');

  useEffect(() => {
    const cachedEvent = getCachedEvent(eventId);
    if (cachedEvent) {
      setEvent(cachedEvent);
    }
    setLoading(false);
  }, [eventId, getCachedEvent]);

  const formatDate = (dateInput: string | { seconds: number } | undefined) => {
    if (!dateInput) return 'Date non définie';
    const date = typeof dateInput === 'string' ? new Date(dateInput) : new Date(dateInput.seconds * 1000);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSportColor = (sport: string | undefined) => {
    if (!sport) return 'bg-gray-500';
    const colors: Record<string, string> = {
      'Football': 'bg-green-500',
      'Basketball': 'bg-orange-500',
      'Tennis': 'bg-yellow-500',
      'Natation': 'bg-blue-500',
      'Course': 'bg-red-500',
      'Cyclisme': 'bg-purple-500',
      'Volleyball': 'bg-pink-500',
      'Badminton': 'bg-indigo-500'
    };
    return colors[sport] || 'bg-gray-500';
  };

  const handleSendMessage = () => {
    if (newMessage.trim() && event) {
      addOfflineMessage(event.id, newMessage.trim(), messageType);
      setNewMessage('');
      setShowMessages(false);
    }
  };

  const offlineMessages = event ? getOfflineMessagesForEvent(event.id) : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <p className="text-center text-gray-700">Chargement des détails hors ligne...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="text-6xl mb-4">📱</div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Mode Hors Ligne</h1>
            <p className="text-gray-600 mb-4">
              Cet événement n'est pas disponible hors ligne. 
              Veuillez vous reconnecter pour voir les détails.
            </p>
            <button
              onClick={() => window.location.href = '/'}
              className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Retour à l'accueil
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 ${getSportColor(event.sport)} rounded-lg flex items-center justify-center`}>
              <span className="text-2xl">{event.sportEmoji || '🏃'}</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{event.name}</h1>
              <p className="text-sm text-gray-600">{event.sport || 'Sport non défini'}</p>
            </div>
          </div>
          <div className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
            📱 Hors ligne
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="p-4 space-y-4">
        {/* Date et Heure */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h3 className="font-semibold text-gray-800 mb-2">📅 Date et Heure</h3>
          <p className="text-gray-700">{formatDate(event.date)}</p>
        </div>

        {/* Lieu */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h3 className="font-semibold text-gray-800 mb-2">📍 Lieu</h3>
          <p className="text-gray-700">{event.address}, {event.postcode} {event.city}</p>
        </div>

        {/* Description */}
        {event.description && (
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-2">📝 Description</h3>
            <p className="text-gray-700">{event.description}</p>
          </div>
        )}

        {/* Participants */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-800">👥 Participants</h3>
            <button
              onClick={() => setShowParticipants(!showParticipants)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              {showParticipants ? 'Masquer' : 'Voir la liste'}
            </button>
          </div>
          <p className="text-gray-700 mb-2">
            {event.currentParticipants || 0} / {event.maxParticipants} participants
          </p>
          
          {showParticipants && event.participants && event.participants.length > 0 ? (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {event.participants.map((participant) => (
                <div key={participant.id} className="flex items-center justify-between bg-gray-50 p-2 rounded border">
                  <div>
                    <span className="font-medium text-gray-900">{participant.userName}</span>
                    <span className="text-sm text-gray-600 ml-2">({participant.contact})</span>
                  </div>
                </div>
              ))}
            </div>
          ) : showParticipants ? (
            <p className="text-gray-500 text-sm italic">
              Aucun participant enregistré en cache
            </p>
          ) : null}
        </div>

        {/* Messages Hors Ligne */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-800">💬 Messages</h3>
            <button
              onClick={() => setShowMessages(!showMessages)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              {showMessages ? 'Masquer' : 'Écrire un message'}
            </button>
          </div>
          
          {/* Messages existants */}
          {offlineMessages.length > 0 && (
            <div className="space-y-2 max-h-32 overflow-y-auto mb-3">
              {offlineMessages.map((msg) => (
                <div key={msg.id} className="bg-blue-50 p-2 rounded border-l-4 border-blue-400">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-blue-600 font-medium">
                      {msg.type === 'confirmation' ? '✅ Confirmation' : '💬 Message'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {msg.createdAt.toLocaleTimeString('fr-FR')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-800 mt-1">{msg.content}</p>
                </div>
              ))}
            </div>
          )}
          
          {/* Formulaire de nouveau message */}
          {showMessages && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type de message
                </label>
                <select
                  value={messageType}
                  onChange={(e) => setMessageType(e.target.value as 'message' | 'confirmation')}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="message">💬 Message</option>
                  <option value="confirmation">✅ Confirmation</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contenu
                </label>
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Tapez votre message ou confirmation..."
                  className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                />
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Envoyer hors ligne
                </button>
                <button
                  onClick={() => {
                    setShowMessages(false);
                    setNewMessage('');
                  }}
                  className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Indicateur Hors Ligne */}
        <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-400">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div>
              <p className="text-orange-800 font-medium">Mode Hors Ligne</p>
              <p className="text-orange-700 text-sm">
                Ces informations sont mises en cache. Reconnectez-vous pour les données les plus récentes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
