'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useEventCache } from '@/hooks/useEventCache';
import OfflineEventDetails from './OfflineEventDetails';

interface Event {
  id: string;
  name: string;
  sport: string;
  date?: { seconds: number };
  location: string;
  city: string;
  description?: string;
  lat?: number;
  lng?: number;
  distance?: number;
}

interface SimpleEventCardProps {
  event: Event;
  onZoomToEvent?: (lat: number, lng: number) => void;
}

export default function SimpleEventCard({ event, onZoomToEvent }: SimpleEventCardProps) {
  const { isEventCached } = useEventCache();
  const [showOfflineDetails, setShowOfflineDetails] = useState(false);

  const formatDate = (dateInput: { seconds: number } | undefined) => {
    if (!dateInput) return 'Date non définie';
    const date = new Date(dateInput.seconds * 1000);
    return date.toLocaleString('fr-FR');
  };


  const isCached = isEventCached(event.id);
  const isFuture = event.date ? new Date(event.date.seconds * 1000) > new Date() : false;

  const handleCardClick = (e: React.MouseEvent) => {
    // Si l'événement est en cache et futur, permettre l'accès hors ligne
    if (isCached && isFuture) {
      e.preventDefault();
      setShowOfflineDetails(true);
    }
  };

  return (
    <>
      {isCached && isFuture ? (
        <div onClick={handleCardClick} className="block">
          <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100 hover:shadow-md transition-all duration-200 cursor-pointer group">
      ) : (
        <Link href={`/event/${event.id}`} className="block">
          <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100 hover:shadow-md transition-all duration-200 cursor-pointer group">
      )}
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-purple-600 transition-colors">{event.name}</h3>
              <div className="flex items-center space-x-2 text-sm text-gray-600 mb-1">
                <span>{event.city} - {event.location}</span>
                {typeof event.distance === 'number' && (
                  <span className="text-green-600 font-medium">{event.distance.toFixed(1)} km</span>
                )}
              </div>
              <div className="text-xs text-gray-500 mb-2">
                {formatDate(event.date)}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">{event.sport}</span>
              {/* Indicateur de cache */}
              {isCached && isFuture && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  📱 Hors ligne
                </span>
              )}
            </div>
          </div>
          {event.description && (
            <div className="text-sm text-gray-600 mb-3 line-clamp-2">{event.description}</div>
          )}
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {event.lat && event.lng && (
                <>
                  <button
                    className="text-xs bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      window.open(`https://www.google.com/maps/dir/?api=1&destination=${event.lat},${event.lng}`, '_blank');
                    }}
                    type="button"
                  >
                    Itinéraire
                  </button>
                  {onZoomToEvent && (
                    <button
                      className="text-xs bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 transition-colors"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onZoomToEvent(event.lat as number, event.lng as number);
                      }}
                      type="button"
                    >
                      Voir sur carte
                    </button>
                  )}
                </>
              )}
            </div>
            <div className="text-xs text-gray-400 group-hover:text-purple-500 transition-colors">
              {isCached && isFuture ? 'Disponible hors ligne →' : 'Cliquer pour voir les détails →'}
            </div>
          </div>
          </div>
        {isCached && isFuture ? (
          </div>
        ) : (
          </Link>
        )}

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
