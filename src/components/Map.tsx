'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import "leaflet/dist/leaflet.css";

interface Event {
  id: string;
  name: string;
  city: string;
  location: string;
  date?: { seconds: number };
  lat?: number;
  lng?: number;
  createdBy?: string;
}

interface MapProps {
  mapCenter: [number, number];
  currentZoom: number;
  position: { lat: number; lng: number };
  events: Event[];
  user: { uid: string } | null;
  zoomTarget: { lat: number | null; lng: number | null };
  zoomToEvent: (lat: number, lng: number) => void;
  mapRef: React.MutableRefObject<unknown>;
}

// Composant pour configurer les icônes Leaflet
function LeafletIconConfig() {
  useEffect(() => {
    if (typeof window !== "undefined" && window.L) {
      // Configurer les nouvelles icônes WebP
      window.L.Icon.Default.mergeOptions({
        iconUrl: '/marker-icon.webp',
        iconRetinaUrl: '/marker-icon-2x.webp',
        shadowUrl: '', // Désactiver explicitement l'ombre
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [0, 0] // Taille d'ombre à zéro
      });
    }
  }, []);

  return null; // Ce composant ne rend rien
}

// Composant pour zoomer sur un événement
function ZoomToEvent({ lat, lng }: { lat: number | null; lng: number | null }) {
  const map = useMap();
  
  useEffect(() => {
    if (map && lat !== null && lng !== null) {
      map.setView([lat, lng], 15);
    }
  }, [map, lat, lng]);

  return null;
}

export default function Map({
  mapCenter,
  currentZoom,
  position,
  events,
  user,
  zoomTarget,
  zoomToEvent,
  mapRef
}: MapProps) {
  return (
    <MapContainer
      center={mapCenter}
      zoom={currentZoom}
      style={{ height: "100%", width: "100%", zIndex: 1 }}
      scrollWheelZoom={true}
      ref={(mapInstance: unknown) => { mapRef.current = mapInstance; }}
    >
      <LeafletIconConfig />
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
      {events.filter(e => {
        // Même filtrage que pour les listes : futurs uniquement et pas créés par l'utilisateur
        if (!e.date?.seconds) return false;
        const eventDate = new Date(e.date.seconds * 1000);
        const now = new Date();
        if (eventDate <= now) return false;
        if (user && e.createdBy && e.createdBy === user.uid) return false;
        return typeof e.lat === 'number' && typeof e.lng === 'number';
      }).map(event => (
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
                Zoomer sur l&apos;événement
              </button>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
