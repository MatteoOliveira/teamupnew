'use client';

import { useState, useEffect } from 'react';
import { useEventCache } from '@/hooks/useEventCache';
import { Event } from '@/types/event';

interface OfflineEventDetailsProps {
  eventId: string;
  onClose: () => void;
}

export default function OfflineEventDetails({ eventId, onClose }: OfflineEventDetailsProps) {
  const { getCachedEvent } = useEventCache();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔍 OfflineEventDetails - Recherche événement:', eventId);
    const cachedEvent = getCachedEvent(eventId);
    console.log('🔍 OfflineEventDetails - Événement trouvé?', !!cachedEvent);
    if (cachedEvent) {
      console.log('🔍 OfflineEventDetails - Événement:', cachedEvent.name);
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

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 text-center">
          <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Événement Non Disponible
          </h2>
          <p className="text-gray-600 mb-6">
            Cet événement n&apos;est pas disponible hors ligne. Connectez-vous à internet pour le consulter.
          </p>
          <button
            onClick={onClose}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
          >
            Fermer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-12 h-12 ${getSportColor(event.sport)} rounded-lg flex items-center justify-center`}>
                <span className="text-2xl">{event.sportEmoji || '🏃'}</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{event.name}</h1>
                <p className="text-sm text-gray-600">{event.sport || 'Sport non défini'}</p>
              </div>
            </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Date et Heure */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">📅 Date et Heure</h3>
            <p className="text-blue-800">{formatDate(event.date)}</p>
            {event.endDate && (
              <p className="text-blue-600 text-sm mt-1">
                Fin : {formatDate(event.endDate)}
              </p>
            )}
          </div>

          {/* Lieu */}
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-900 mb-2">📍 Lieu</h3>
            <p className="text-green-800 font-medium">{event.location}</p>
            <p className="text-green-700 text-sm">{event.address}</p>
            <p className="text-green-600 text-sm">{event.city} {event.postcode}</p>
          </div>

          {/* Description */}
          {event.description && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">📝 Description</h3>
              <p className="text-gray-700">{event.description}</p>
            </div>
          )}

          {/* Participants */}
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-semibold text-purple-900 mb-2">👥 Participants</h3>
            <p className="text-purple-800">
              Maximum {event.maxParticipants} participants
            </p>
            {event.isReserved && (
              <p className="text-purple-600 text-sm mt-1">
                ⚠️ Événement réservé
              </p>
            )}
          </div>

          {/* Contact */}
          {event.contactInfo && (
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="font-semibold text-yellow-900 mb-2">📞 Contact</h3>
              <p className="text-yellow-800">{event.contactInfo}</p>
            </div>
          )}

          {/* Indicateur Hors Ligne */}
          <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-400">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <p className="text-orange-800 font-medium">
                📱 Version hors ligne - Données mises en cache
              </p>
            </div>
            <p className="text-orange-600 text-sm mt-1">
              Connectez-vous à internet pour voir les dernières mises à jour
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
          <button
            onClick={onClose}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
