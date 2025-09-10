'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Button from '@/components/Button';
import Link from "next/link";
import dynamic from 'next/dynamic';

// Dynamic import de la Map avec SSR désactivé
const Map = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-50 rounded-lg flex items-center justify-center">
      <div className="text-center">
        <div className="w-6 h-6 mx-auto mb-2 text-blue-500 animate-spin">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </div>
        <p className="text-gray-500 text-sm">Chargement de la carte...</p>
      </div>
    </div>
  )
});


interface UserProfile {
  name: string;
  sport: string;
  city?: string; // Added city to UserProfile
}

interface Event {
  id: string;
  name: string;
  sport: string;
  date: { seconds: number } | undefined;
  location: string;
  city: string;
  description: string;
  lat?: number; // Added lat and lng for Haversine calculation
  lng?: number;
  createdBy?: string; // Added createdBy to identify event creator
}


// Fonction utilitaire pour calculer la distance entre deux points GPS (Haversine)
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  if (typeof lat1 !== 'number' || typeof lon1 !== 'number' || typeof lat2 !== 'number' || typeof lon2 !== 'number') return Infinity;
  const R = 6371; // Rayon de la Terre en km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Fonction getTileCoordinates supprimée car non utilisée

// Fonction getTileUrl supprimée car non utilisée


// Composant TilePreloader supprimé pour éviter les warnings de preload inutilisé

// Le composant ZoomToEvent est maintenant dans Map.tsx

export default function ReservationPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [message] = useState('');
  // Ajout géolocalisation
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [nearbyEvents, setNearbyEvents] = useState<(Event & { distance: number })[]>([]);
  const [otherCityEvents, setOtherCityEvents] = useState<(Event & { distance: number })[]>([]);

  // Filtres pour 'Autres événements en France'
  const [sportFilter, setSportFilter] = useState<string>("");
  const [dateOrder, setDateOrder] = useState<"asc" | "desc">("asc");

  // Liste des sports disponibles dans les autres événements
  const sportOptions = Array.from(new Set(otherCityEvents.map(e => e.sport)));

  // Application des filtres
  const filteredOtherCityEvents = otherCityEvents
    .filter(event => !sportFilter || event.sport === sportFilter)
    .sort((a, b) => {
      const dateA = a.date?.seconds ? a.date.seconds : 0;
      const dateB = b.date?.seconds ? b.date.seconds : 0;
      return dateOrder === "asc" ? dateA - dateB : dateB - dateA;
    });

  // Les composants MapContainer, TileLayer, Marker, Popup sont maintenant lazy-loaded

  // La configuration des icônes est maintenant gérée par le composant LeafletIconConfig

  // Référence vers la carte Leaflet
  const mapRef = useRef<unknown>(null);
  // Référence vers le conteneur de la carte pour scroll
  const mapContainerRef = useRef<HTMLDivElement>(null);
  // État pour stocker la cible de zoom
  const [zoomTarget, setZoomTarget] = useState<{lat: number|null, lng: number|null}>({lat: null, lng: null});
  // État simplifié pour la carte
  const [currentZoom, setCurrentZoom] = useState(8);
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);
  // Fonction pour zoomer sur un événement et scroller vers la carte
  const zoomToEvent = (lat: number, lng: number) => {
    setZoomTarget({ lat, lng });
    if (mapContainerRef.current) {
      mapContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Précharge JavaScript supprimée pour éviter les warnings de preload inutilisé

  // Initialiser le centre de la carte directement à la position utilisateur
  useEffect(() => {
    if (position) {
      // Commencer directement à la position de l'utilisateur
      setMapCenter([position.lat, position.lng]);
      setCurrentZoom(8);
    }
  }, [position]);

  const loadUserProfile = useCallback(async () => {
    if (!user) return;

    try {
      const userDoc = await getDocs(query(collection(db, 'users'), where('__name__', '==', user.uid)));
      if (!userDoc.empty) {
        const data = userDoc.docs[0].data() as UserProfile;
        setUserProfile(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
    }
  }, [user]);

  // Redirection si non connecté
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Charger le profil utilisateur
  useEffect(() => {
    if (user) {
      loadUserProfile();
    }
  }, [user, loadUserProfile]);

  // Charger les événements sportifs (tous, pour filtrage par distance)
  const loadEvents = async () => {
    try {
      const q = collection(db, "events");
      const snapshot = await getDocs(q);
      const allEvents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Event[];
      setEvents(allEvents);
    } catch (error) {
      console.error("Erreur lors du chargement des événements:", error);
    }
  };

  // Filtrage par distance après chargement de la position et des événements
  const PROXIMITY_RADIUS_KM = 30;
  useEffect(() => {
    if (events.length > 0) {
      // Filtrer les événements : futurs uniquement et pas créés par l'utilisateur connecté
      const now = new Date();
      const filteredEvents = events.filter(e => {
        // Événements futurs uniquement
        if (!e.date?.seconds) return false;
        const eventDate = new Date(e.date.seconds * 1000);
        if (eventDate <= now) return false;
        
        // Événements créés par d'autres utilisateurs uniquement (si createdBy existe)
        if (user && e.createdBy && e.createdBy === user.uid) return false;
        
        return true;
      });
      
      if (position) {
        // Si position disponible, calculer les distances
        const withCoords = filteredEvents.filter(e => typeof e.lat === 'number' && typeof e.lng === 'number');
        const eventsWithDistance = withCoords.map(e => ({
          ...e,
          distance: getDistanceFromLatLonInKm(position.lat, position.lng, e.lat as number, e.lng as number)
        }));
        eventsWithDistance.sort((a, b) => a.distance - b.distance);
        setNearbyEvents(eventsWithDistance.filter(e => e.distance <= PROXIMITY_RADIUS_KM).slice(0, 5));
        setOtherCityEvents(eventsWithDistance.filter(e => e.distance > PROXIMITY_RADIUS_KM));
      } else {
        // Si pas de position, afficher tous les événements filtrés
        setNearbyEvents([]);
        setOtherCityEvents(filteredEvents.map(e => ({ ...e, distance: 0 })));
      }
    } else {
      setNearbyEvents([]);
      setOtherCityEvents([]);
    }
  }, [position, events, user]);

  // Charger la ville de l'utilisateur (si profil chargé)
  useEffect(() => {
    loadEvents();
  }, [userProfile]);

  // Détection géolocalisation au chargement de la page
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setGeoError(null);
        },
        () => {
          setGeoError("Géolocalisation refusée ou indisponible");
        }
      );
    } else {
      setGeoError("Géolocalisation non supportée par ce navigateur");
    }
  }, []);

  // Fonction pour rafraîchir la position
  const refreshPosition = () => {
    if (navigator.geolocation) {
      setGeoError(null);
      setPosition(null);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setGeoError(null);
        },
        () => {
          setGeoError("Géolocalisation refusée ou indisponible");
        }
      );
    } else {
      setGeoError("Géolocalisation non supportée par ce navigateur");
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Chargement...</div>
      </div>
    );
  }

  if (!user) {
    return null; // Redirection en cours
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Précharge supprimée pour éviter les warnings de preload inutilisé */}
      {/* Header Mobile minimal */}
      <div className="md:hidden flex items-center justify-center py-3 px-4 bg-white border-b border-gray-200">
        <div className="flex items-center space-x-1">
          <div className="w-6 h-6 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-md flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h2 className="text-sm font-bold text-gray-900">
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">TeamUp</span>
          </h2>
        </div>
      </div>

      {/* Header Desktop */}
      <div className="hidden md:block py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Événements sportifs
          </h1>
          {userProfile && (
            <p className="text-gray-600">
              Bienvenue {userProfile.name} ! Votre sport : {userProfile.sport}
            </p>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto py-4 md:py-8 px-4 sm:px-6 lg:px-8">
        {/* Section géolocalisation mobile */}
        <div className="md:hidden mb-4">
          <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 text-blue-500">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="text-xs">
                  {position ? (
                    <span className="text-green-700">Position détectée</span>
                  ) : geoError ? (
                    <span className="text-red-600">Position indisponible</span>
                  ) : (
                    <span className="text-gray-500">Recherche...</span>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={refreshPosition}
                className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
              >
                Actualiser
              </button>
            </div>
          </div>
        </div>

        {/* Section géolocalisation desktop */}
        <div className="hidden md:block text-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="w-4 h-4 text-blue-500">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            {position ? (
              <span className="text-sm text-green-700">Position : {position.lat.toFixed(4)}, {position.lng.toFixed(4)}</span>
            ) : geoError ? (
              <span className="text-sm text-red-600">{geoError}</span>
            ) : (
              <span className="text-sm text-gray-500">Recherche de votre position...</span>
            )}
            <button
              type="button"
              onClick={refreshPosition}
              className="ml-2 px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
            >
              Actualiser
            </button>
          </div>
        </div>

        {message && (
          <div className={`text-sm text-center p-3 rounded-lg mb-4 ${
            message.includes('succès') ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'
          }`}>
            {message}
          </div>
        )}

        {/* Lien vers création d'événement */}
        <div className="mb-6 text-center">
          <Link href="/event-create">
            <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200">
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Créer un événement sportif</span>
              </div>
            </Button>
          </Link>
        </div>
        {/* Carte Leaflet avec Lazy Loading */}
        {position && (
          <div className="mb-6 relative z-10" ref={mapContainerRef}>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 text-blue-500">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">Carte des événements</h2>
                </div>
                
              </div>
              
              {/* Carte avec dynamic import et SSR désactivé */}
                <div style={{ height: 300, width: "100%", zIndex: 1, borderRadius: '8px', overflow: 'hidden' }}>
                  {mapCenter ? (
                    <Map
                      mapCenter={mapCenter}
                      currentZoom={currentZoom}
                      position={position}
                      events={events}
                      user={user}
                      zoomTarget={zoomTarget}
                      zoomToEvent={zoomToEvent}
                      mapRef={mapRef}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-50 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-6 h-6 mx-auto mb-2 text-blue-500 animate-spin">
                          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        </div>
                        <p className="text-gray-500 text-sm">Initialisation de la carte...</p>
                      </div>
                    </div>
                  )}
                </div>
            </div>
          </div>
        )}
        {/* Liste des événements à proximité */}
        {nearbyEvents.length > 0 && (
          <div className="mb-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-5 h-5 text-green-500">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h2 className="text-lg font-bold text-gray-900">Événements à proximité</h2>
                <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">{nearbyEvents.length}</span>
              </div>
              <div className="grid gap-3">
                {nearbyEvents.map(event => (
                  <Link key={event.id} href={`/event/${event.id}`} className="block">
                    <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100 hover:shadow-md transition-all duration-200 cursor-pointer group">
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
                            {event.date?.seconds ? new Date(event.date.seconds * 1000).toLocaleString() : ""}
                          </div>
                        </div>
                        <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">{event.sport}</span>
                      </div>
                      {event.description && (
                        <div className="text-sm text-gray-600 mb-3 line-clamp-2">{event.description}</div>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-2">
                          <button
                            className="text-xs bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              window.open(`https://www.google.com/maps/dir/?api=1&origin=${position?.lat},${position?.lng}&destination=${event.lat},${event.lng}&travelmode=driving`, '_blank');
                            }}
                            type="button"
                          >
                            Itinéraire
                          </button>
                          <button
                            className="text-xs bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 transition-colors"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              zoomToEvent(event.lat as number, event.lng as number);
                            }}
                            type="button"
                          >
                            Voir sur carte
                          </button>
                        </div>
                        <div className="text-xs text-gray-400 group-hover:text-purple-500 transition-colors">
                          Cliquer pour voir les détails →
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
        {/* Événements des autres villes */}
        {otherCityEvents.length > 0 && (
          <div className="mb-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-5 h-5 text-purple-500">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900">Autres événements en France</h3>
                <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full">{otherCityEvents.length}</span>
              </div>
              
              {/* Filtres */}
              <div className="flex flex-wrap gap-3 mb-4">
                <select
                  value={sportFilter}
                  onChange={e => setSportFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Tous les sports</option>
                  {sportOptions.map(sport => (
                    <option key={sport} value={sport}>{sport}</option>
                  ))}
                </select>
                <select
                  value={dateOrder}
                  onChange={e => setDateOrder(e.target.value as "asc" | "desc")}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="asc">Date croissante</option>
                  <option value="desc">Date décroissante</option>
                </select>
              </div>
              
              <div className="grid gap-3">
                {filteredOtherCityEvents.map(event => (
                  <Link key={event.id} href={`/event/${event.id}`} className="block">
                    <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100 hover:shadow-md transition-all duration-200 cursor-pointer group">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-purple-600 transition-colors">{event.name}</h3>
                          <div className="flex items-center space-x-2 text-sm text-gray-600 mb-1">
                            <span>{event.city} - {event.location}</span>
                            {typeof event.distance === 'number' && event.distance > 0 && (
                              <span className="text-purple-600 font-medium">{event.distance.toFixed(1)} km</span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 mb-2">
                            {event.date?.seconds ? new Date(event.date.seconds * 1000).toLocaleString() : ""}
                          </div>
                        </div>
                        <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full">{event.sport}</span>
                      </div>
                      {event.description && (
                        <div className="text-sm text-gray-600 mb-3 line-clamp-2">{event.description}</div>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-2">
                          {position && (
                            <button
                              className="text-xs bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                window.open(`https://www.google.com/maps/dir/?api=1&origin=${position.lat},${position.lng}&destination=${event.lat},${event.lng}&travelmode=driving`, '_blank');
                              }}
                              type="button"
                            >
                              Itinéraire
                            </button>
                          )}
                          {position && (
                            <button
                              className="text-xs bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 transition-colors"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                zoomToEvent(event.lat as number, event.lng as number);
                              }}
                              type="button"
                            >
                              Voir sur carte
                            </button>
                          )}
                        </div>
                        <div className="text-xs text-gray-400 group-hover:text-purple-500 transition-colors">
                          Cliquer pour voir les détails →
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Bouton retour avec hauteur fixe pour éviter les décalages */}
        <div className="mt-6 text-center h-12 flex items-center justify-center">
          <Button
            onClick={() => router.push('/profile')}
            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Retour au profil</span>
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
} 