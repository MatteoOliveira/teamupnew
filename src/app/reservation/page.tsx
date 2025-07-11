'use client';

import { useState, useEffect, useRef } from 'react';
import { collection, addDoc, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Button from '@/components/Button';
import Link from "next/link";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import type { Map as LeafletMap } from 'leaflet';
import { useMap } from 'react-leaflet';

interface Reservation {
  uid: string;
  name: string;
  sport: string;
  timeslot: string;
  timestamp: Date;
}

interface UserProfile {
  name: string;
  sport: string;
  city?: string; // Added city to UserProfile
}

interface Event {
  id: string;
  name: string;
  sport: string;
  date: any;
  location: string;
  city: string;
  description: string;
  lat?: number; // Added lat and lng for Haversine calculation
  lng?: number;
}

// Créneaux statiques
const TIMESLOTS = [
  '10h00 - 11h00',
  '11h00 - 12h00',
  '14h00 - 15h00',
  '15h00 - 16h00',
  '16h00 - 17h00',
  '17h00 - 18h00',
  '18h00 - 19h00',
  '19h00 - 20h00'
];

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

// Composant pour effectuer le zoom effectif sur la carte
function ZoomToEvent({ lat, lng }: { lat: number | null, lng: number | null }) {
  const map = useMap();
  useEffect(() => {
    if (lat !== null && lng !== null) {
      map.setView([lat, lng], 15, { animate: true });
    }
  }, [lat, lng, map]);
  return null;
}

export default function ReservationPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [booking, setBooking] = useState(false);
  const [message, setMessage] = useState('');
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

  const Leaflet = typeof window !== "undefined" ? require("react-leaflet") : {};
  const MapContainer = Leaflet.MapContainer || (() => null);
  const TileLayer = Leaflet.TileLayer || (() => null);
  const Marker = Leaflet.Marker || (() => null);
  const Popup = Leaflet.Popup || (() => null);

  // Référence vers la carte Leaflet
  const mapRef = useRef<any>(null);
  // Référence vers le conteneur de la carte pour scroll
  const mapContainerRef = useRef<HTMLDivElement>(null);
  // État pour stocker la cible de zoom
  const [zoomTarget, setZoomTarget] = useState<{lat: number|null, lng: number|null}>({lat: null, lng: null});
  // Fonction pour zoomer sur un événement et scroller vers la carte
  const zoomToEvent = (lat: number, lng: number) => {
    setZoomTarget({ lat, lng });
    if (mapContainerRef.current) {
      mapContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Redirection si non connecté
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Charger le profil utilisateur et les réservations
  useEffect(() => {
    if (user) {
      loadUserProfile();
      loadReservations();
    }
  }, [user]);

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
    if (position && events.length > 0) {
      const withCoords = events.filter(e => typeof e.lat === 'number' && typeof e.lng === 'number');
      const eventsWithDistance = withCoords.map(e => ({
        ...e,
        distance: getDistanceFromLatLonInKm(position.lat, position.lng, e.lat as number, e.lng as number)
      }));
      eventsWithDistance.sort((a, b) => a.distance - b.distance);
      setNearbyEvents(eventsWithDistance.filter(e => e.distance <= PROXIMITY_RADIUS_KM).slice(0, 5));
      setOtherCityEvents(eventsWithDistance.filter(e => e.distance > PROXIMITY_RADIUS_KM));
    } else {
      setNearbyEvents([]);
      setOtherCityEvents([]);
    }
  }, [position, events]);

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
        (err) => {
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
        (err) => {
          setGeoError("Géolocalisation refusée ou indisponible");
        }
      );
    } else {
      setGeoError("Géolocalisation non supportée par ce navigateur");
    }
  };

  const loadUserProfile = async () => {
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
  };

  const loadReservations = async () => {
    try {
      const reservationsQuery = await getDocs(collection(db, 'reservations'));
      const reservationsData = reservationsQuery.docs.map(doc => ({
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate()
      })) as Reservation[];
      setReservations(reservationsData);
    } catch (error) {
      console.error('Erreur lors du chargement des réservations:', error);
    }
  };

  const handleReservation = async (timeslot: string) => {
    if (!user || !userProfile) {
      setMessage('Veuillez d\'abord compléter votre profil');
      return;
    }

    setBooking(true);
    setMessage('');

    try {
      await addDoc(collection(db, 'reservations'), {
        uid: user.uid,
        name: userProfile.name,
        sport: userProfile.sport,
        timeslot,
        timestamp: new Date()
      });

      setMessage('Créneau réservé avec succès !');
      loadReservations(); // Recharger les réservations
    } catch (error) {
      console.error('Erreur lors de la réservation:', error);
      setMessage('Erreur lors de la réservation');
    } finally {
      setBooking(false);
    }
  };

  const isSlotBooked = (timeslot: string) => {
    return reservations.some(reservation => reservation.timeslot === timeslot);
  };

  const getBookedBy = (timeslot: string) => {
    const reservation = reservations.find(reservation => reservation.timeslot === timeslot);
    return reservation ? `${reservation.name} (${reservation.sport})` : '';
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
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Réservation de créneaux
          </h1>
          {userProfile && (
            <p className="text-gray-600">
              Bienvenue {userProfile.name} ! Votre sport : {userProfile.sport}
            </p>
          )}
          {/* Affichage géolocalisation */}
          <div className="mt-4 flex flex-col items-center gap-2">
            {position ? (
              <span className="text-sm text-green-700">Votre position : {position.lat.toFixed(5)}, {position.lng.toFixed(5)}</span>
            ) : geoError ? (
              <span className="text-sm text-red-600">{geoError}</span>
            ) : (
              <span className="text-sm text-gray-500">Recherche de votre position...</span>
            )}
            <button
              type="button"
              onClick={refreshPosition}
              className="mt-1 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs"
            >
              Actualiser la position
            </button>
          </div>
        </div>

        {message && (
          <div className={`text-sm text-center p-3 rounded mb-6 ${
            message.includes('succès') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {message}
          </div>
        )}

        {/* Lien vers création d'événement */}
        <div className="mb-8 text-center">
          <Link href="/event-create">
            <Button className="bg-blue-500 hover:bg-blue-600">Créer un événement sportif</Button>
          </Link>
        </div>
        {/* Carte Leaflet */}
        {position && (
          <div className="mb-8" ref={mapContainerRef}>
            <h2 className="text-lg font-bold mb-2 text-gray-900">Carte des événements</h2>
            <div style={{ height: 350, width: "100%" }}>
              <MapContainer
                center={[position.lat, position.lng]}
                zoom={8}
                style={{ height: "100%", width: "100%" }}
                scrollWheelZoom={true}
                whenCreated={(mapInstance: LeafletMap) => { mapRef.current = mapInstance; }}
              >
                <ZoomToEvent lat={zoomTarget.lat} lng={zoomTarget.lng} />
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {/* Marqueur utilisateur */}
                <Marker position={[position.lat, position.lng]}>
                  <Popup>Vous êtes ici</Popup>
                </Marker>
                {/* Marqueurs événements */}
                {events.filter(e => typeof e.lat === 'number' && typeof e.lng === 'number').map(event => (
                  <Marker key={event.id} position={[event.lat as number, event.lng as number]}>
                    <Popup>
                      <div>
                        <div className="font-bold">{event.name}</div>
                        <div>{event.city} - {event.location}</div>
                        <div>{event.date?.seconds ? new Date(event.date.seconds * 1000).toLocaleString() : ""}</div>
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&origin=${position.lat},${position.lng}&destination=${event.lat},${event.lng}&travelmode=driving`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline mt-2 block"
                        >
                          Itinéraire Google Maps
                        </a>
                        <button
                          className="mt-2 px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                          onClick={() => zoomToEvent(event.lat as number, event.lng as number)}
                          type="button"
                        >
                          Zoomer sur l'événement
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </div>
        )}
        {/* Liste des événements */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 text-gray-900">Événements sportifs à proximité</h2>
          {nearbyEvents.length === 0 ? (
            <div className="text-gray-500 text-center">Aucun événement trouvé à proximité.</div>
          ) : (
            <ul className="space-y-4">
              {nearbyEvents.map(event => (
                <li key={event.id} className="p-4 border rounded-lg bg-white shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-lg text-blue-700">{event.name}</span>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">{event.sport}</span>
                  </div>
                  <div className="text-sm text-gray-700 mb-1">{event.city} - {event.location}</div>
                  <div className="text-xs text-gray-500 mb-2">{event.date?.seconds ? new Date(event.date.seconds * 1000).toLocaleString() : ""}</div>
                  {typeof event.distance === 'number' && (
                    <div className="text-xs text-green-700 mb-1">{event.distance.toFixed(1)} km</div>
                  )}
                  {event.description && <div className="text-sm text-gray-600 mb-2">{event.description}</div>}
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&origin=${position?.lat},${position?.lng}&destination=${event.lat},${event.lng}&travelmode=driving`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline mt-2 block"
                  >
                    Itinéraire Google Maps
                  </a>
                  <button
                    className="mt-2 px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                    onClick={() => zoomToEvent(event.lat as number, event.lng as number)}
                    type="button"
                  >
                    Zoomer sur l'événement
                  </button>
                  <Link href={`/event/${event.id}`} className="mt-2 block text-xs text-blue-700 underline">Voir le détail</Link>
                </li>
              ))}
            </ul>
          )}
          {/* Événements des autres villes */}
          {otherCityEvents.length > 0 && (
            <div className="mt-10">
              <h3 className="text-lg font-bold mb-4 text-gray-900">Autres événements en France</h3>
              {/* Filtres */}
              <div className="flex flex-wrap gap-4 mb-4 items-center">
                <select
                  value={sportFilter}
                  onChange={e => setSportFilter(e.target.value)}
                  className="px-2 py-1 border rounded text-black"
                >
                  <option value="">Tous les sports</option>
                  {sportOptions.map(sport => (
                    <option key={sport} value={sport}>{sport}</option>
                  ))}
                </select>
                <select
                  value={dateOrder}
                  onChange={e => setDateOrder(e.target.value as "asc" | "desc")}
                  className="px-2 py-1 border rounded text-black"
                >
                  <option value="asc">Date croissante</option>
                  <option value="desc">Date décroissante</option>
                </select>
              </div>
              <ul className="space-y-4">
                {filteredOtherCityEvents.map(event => (
                  <li key={event.id} className="p-4 border rounded-lg bg-gray-50">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-lg text-black">{event.name}</span>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">{event.sport}</span>
                    </div>
                    <div className="text-sm text-black mb-1">{event.city} - {event.location}</div>
                    <div className="text-xs text-black mb-2">{event.date?.seconds ? new Date(event.date.seconds * 1000).toLocaleString() : ""}</div>
                    {typeof event.distance === 'number' && (
                      <div className="text-xs text-black mb-1">{event.distance.toFixed(1)} km</div>
                    )}
                    {event.description && <div className="text-sm text-black mb-2">{event.description}</div>}
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&origin=${position?.lat},${position?.lng}&destination=${event.lat},${event.lng}&travelmode=driving`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-black underline mt-2 block"
                    >
                      Itinéraire Google Maps
                    </a>
                    <button
                      className="mt-2 px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                      onClick={() => zoomToEvent(event.lat as number, event.lng as number)}
                      type="button"
                    >
                      Zoomer sur l'événement
                    </button>
                    <Link href={`/event/${event.id}`} className="mt-2 block text-xs text-blue-700 underline">Voir le détail</Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {TIMESLOTS.map((timeslot) => {
            const isBooked = isSlotBooked(timeslot);
            const bookedBy = getBookedBy(timeslot);

            return (
              <div
                key={timeslot}
                className={`p-6 rounded-lg border-2 ${
                  isBooked
                    ? 'border-red-200 bg-red-50'
                    : 'border-green-200 bg-white hover:border-green-300'
                }`}
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {timeslot}
                </h3>
                
                {isBooked ? (
                  <div className="space-y-2">
                    <p className="text-sm text-red-600 font-medium">
                      Créneau réservé
                    </p>
                    <p className="text-xs text-gray-600">
                      Par : {bookedBy}
                    </p>
                  </div>
                ) : (
                  <Button
                    onClick={() => handleReservation(timeslot)}
                    disabled={booking || !userProfile}
                    className="w-full bg-green-500 hover:bg-green-600"
                  >
                    {booking ? 'Réservation...' : 'Réserver'}
                  </Button>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <Button
            onClick={() => router.push('/profile')}
            className="bg-blue-500 hover:bg-blue-600"
          >
            Retour au profil
          </Button>
        </div>
      </div>
    </div>
  );
} 