'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useEventCache } from '@/hooks/useEventCache';
import { Event } from '@/types/event';
import OfflineEventDetails from './OfflineEventDetails';

interface EventCardProps {
  event: Event;
  showActions?: boolean;
}

export default function EventCard({ event, showActions = true }: EventCardProps) {
  const { isEventCached } = useEventCache();
  const [showOfflineDetails, setShowOfflineDetails] = useState(false);

  const formatDate = (dateInput: string | { seconds: number } | undefined) => {
    if (!dateInput) return 'Date non définie';
    const date = typeof dateInput === 'string' ? new Date(dateInput) : new Date(dateInput.seconds * 1000);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
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

  const isCached = isEventCached(event.id);
  const eventDate = event.date ? (typeof event.date === 'string' ? new Date(event.date) : new Date(event.date.seconds * 1000)) : new Date();
  const isFuture = eventDate > new Date();

  const handleCardClick = (e: React.MouseEvent) => {
    // Si l'événement est en cache et futur, permettre l'accès hors ligne
    if (isCached && isFuture) {
      e.preventDefault();
      setShowOfflineDetails(true);
    }
  };

  return (
    <>
      <article 
        className="card card-hover animate-up"
        role="article"
        aria-labelledby={`event-title-${event.id}`}
        aria-describedby={`event-description-${event.id}`}
      >
        <div 
          onClick={handleCardClick} 
          className="cursor-pointer"
          role="button"
          tabIndex={0}
          aria-label={`Voir les détails de l'événement ${event.name}`}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              // Créer un événement de clic simulé pour la navigation clavier
              const clickEvent = new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
                view: window
              });
              handleCardClick(clickEvent as unknown as React.MouseEvent<HTMLDivElement>);
            }
          }}
        >
          <div className="p-4 sm:p-6">
            {/* Header avec sport et date */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`w-12 h-12 ${getSportColor(event.sport)} rounded-lg flex items-center justify-center`}>
                  <span className="text-2xl">{event.sportEmoji || '🏃'}</span>
                </div>
                <div>
                  <h3 
                    id={`event-title-${event.id}`}
                    className="font-semibold text-gray-900 text-lg leading-tight"
                  >
                    {event.name}
                  </h3>
                  <p className="text-sm text-gray-600">{event.sport || 'Sport non défini'}</p>
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {formatDate(event.date)}
                </p>
                <p className="text-xs text-gray-500">
                  {event.city}
                </p>
              </div>
            </div>

            {/* Description */}
            {event.description && (
              <p 
                id={`event-description-${event.id}`}
                className="text-gray-600 text-sm mb-4 line-clamp-2"
              >
                {event.description}
              </p>
            )}

            {/* Informations supplémentaires */}
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{event.location}</span>
                </div>
                
                <div className="flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                  <span>{event.maxParticipants} participants</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {event.isReserved && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    Réservé
                  </span>
                )}
                
                {/* Indicateur de cache */}
                {isCached && isFuture && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    📱 Hors ligne
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Actions (si activées) */}
        {showActions && (
          <div className="px-4 sm:px-6 pb-4 sm:pb-6">
            <div className="flex space-x-3">
              {isCached && isFuture ? (
                <button
                  onClick={() => setShowOfflineDetails(true)}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 text-center transition-colors duration-200"
                  aria-label={`Voir les détails de l'événement ${event.name} (version hors ligne)`}
                >
                  Voir détails (Hors ligne)
                </button>
              ) : (
                <Link
                  href={`/event/${event.id}`}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-center transition-colors duration-200"
                  aria-label={`Voir les détails de l'événement ${event.name}`}
                >
                  Voir détails
                </Link>
              )}
              
              {!event.isReserved && (
                <button 
                  className="bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200"
                  aria-label={`Rejoindre l'événement ${event.name}`}
                >
                  Rejoindre
                </button>
              )}
            </div>
          </div>
        )}
      </article>

      {/* Modal des détails hors ligne */}
      {showOfflineDetails && (
        <OfflineEventDetails
          eventId={event.id}
          onClose={() => setShowOfflineDetails(false)}
        />
      )}
    </>
  );
}
