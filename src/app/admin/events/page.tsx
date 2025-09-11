'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { collection, query, orderBy, getDocs, doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Event } from '@/types/event';
import { ArrowLeftIcon, MagnifyingGlassIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline';
import AdminNavigation from '@/components/AdminNavigation';

export default function AdminEvents() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'future' | 'past'>('all');
  const [isAdmin, setIsAdmin] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  // Vérifier si l'utilisateur est admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setIsAdmin(userData.isAdmin === true);
            if (!userData.isAdmin) {
              router.push('/profile');
            }
          } else {
            router.push('/profile');
          }
        } catch (error) {
          console.error('Erreur vérification admin:', error);
          router.push('/profile');
        }
      }
    };

    if (!loading) {
      checkAdminStatus();
    }
  }, [user, loading, router]);

  // Charger les événements
  useEffect(() => {
    const loadEvents = async () => {
      if (!isAdmin) return;

      try {
        setLoadingData(true);

        const eventsQuery = query(collection(db, 'events'), orderBy('date', 'desc'));
        const eventsSnapshot = await getDocs(eventsQuery);
        const eventsData = eventsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Event[];

        setEvents(eventsData);
        setFilteredEvents(eventsData);

      } catch (error) {
        console.error('Erreur chargement événements:', error);
      } finally {
        setLoadingData(false);
      }
    };

    if (isAdmin) {
      loadEvents();
    }
  }, [isAdmin]);

  // Filtrer les événements
  useEffect(() => {
    let filtered = events;

    // Filtre par type
    if (filter === 'future') {
      filtered = filtered.filter(event => {
        if (!event.date) return false;
        const eventDate = event.date instanceof Date ? event.date : 
          typeof event.date === 'string' ? new Date(event.date) :
          new Date(event.date.seconds * 1000);
        return eventDate >= new Date();
      });
    } else if (filter === 'past') {
      filtered = filtered.filter(event => {
        if (!event.date) return false;
        const eventDate = event.date instanceof Date ? event.date : 
          typeof event.date === 'string' ? new Date(event.date) :
          new Date(event.date.seconds * 1000);
        return eventDate < new Date();
      });
    }

    // Filtre par recherche
    if (searchTerm) {
      filtered = filtered.filter(event => 
        event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.city.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredEvents(filtered);
  }, [events, searchTerm, filter]);

  // Supprimer un événement
  const deleteEvent = async (eventId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) return;

    try {
      await deleteDoc(doc(db, 'events', eventId));
      setEvents(events.filter(event => event.id !== eventId));
      alert('Événement supprimé avec succès');
    } catch (error) {
      console.error('Erreur suppression événement:', error);
      alert('Erreur lors de la suppression de l\'événement');
    }
  };

  if (loading || loadingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des événements...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Accès Refusé</h1>
          <p className="text-gray-600 mb-4">Vous n&apos;avez pas les droits d&apos;administrateur.</p>
          <button
            onClick={() => router.push('/profile')}
            className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Retour au profil
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/admin/dashboard')}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5 mr-2" />
                Retour au dashboard
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Gestion des Événements</h1>
            </div>
            <div className="text-sm text-gray-500">
              {filteredEvents.length} événement{filteredEvents.length > 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Admin */}
        <AdminNavigation currentPage="events" />

        {/* Filtres et Recherche */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:gap-4">
            {/* Recherche */}
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="h-4 w-4 sm:h-5 sm:w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher par nom, description, lieu..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 sm:pl-10 pr-4 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Filtres */}
            <div className="flex flex-wrap gap-2 sm:space-x-2 sm:flex-nowrap">
              <button
                onClick={() => setFilter('all')}
                className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Tous ({events.length})
              </button>
              <button
                onClick={() => setFilter('future')}
                className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                  filter === 'future'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Futurs ({events.filter(e => {
                  if (!e.date) return false;
                  const eventDate = e.date instanceof Date ? e.date : 
                    typeof e.date === 'string' ? new Date(e.date) :
                    new Date(e.date.seconds * 1000);
                  return eventDate >= new Date();
                }).length})
              </button>
              <button
                onClick={() => setFilter('past')}
                className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                  filter === 'past'
                    ? 'bg-gray-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Passés ({events.filter(e => {
                  if (!e.date) return false;
                  const eventDate = e.date instanceof Date ? e.date : 
                    typeof e.date === 'string' ? new Date(e.date) :
                    new Date(e.date.seconds * 1000);
                  return eventDate < new Date();
                }).length})
              </button>
            </div>
          </div>
        </div>

        {/* Liste des Événements */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">Liste des Événements</h2>
          </div>

          <div className="divide-y divide-gray-200">
            {filteredEvents.map((event) => {
              if (!event.date) return null;
              
              const eventDate = event.date instanceof Date ? event.date : 
                typeof event.date === 'string' ? new Date(event.date) :
                new Date(event.date.seconds * 1000);
              const isFuture = eventDate >= new Date();
              
              return (
                <div key={event.id} className="px-4 sm:px-6 py-4 hover:bg-gray-50">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 mb-2">
                        <h3 className="text-sm sm:text-lg font-medium text-gray-900">{event.name}</h3>
                        <div className="flex flex-wrap gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            isFuture
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {isFuture ? 'Futur' : 'Passé'}
                          </span>
                          {event.isReserved && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Réservé
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600 mb-2 line-clamp-2">{event.description}</p>
                      <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 text-xs sm:text-sm text-gray-500">
                        <span>📅 {eventDate.toLocaleDateString('fr-FR')}</span>
                        <span>⏰ {eventDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                        <span>📍 {event.location}</span>
                        <span>🏙️ {event.city}</span>
                        <span>👥 {event.currentParticipants || 0}/{event.maxParticipants} participants</span>
                        <span>🏃 {event.sport || 'Sport non défini'}</span>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                      <button
                        onClick={() => router.push(`/event/${event.id}`)}
                        className="w-full sm:w-auto text-blue-600 hover:text-blue-800 text-xs sm:text-sm font-medium text-center sm:text-left"
                      >
                        Voir
                      </button>
                      <button
                        onClick={() => router.push(`/event-edit/${event.id}`)}
                        className="w-full sm:w-auto text-green-600 hover:text-green-800 text-xs sm:text-sm font-medium flex items-center justify-center sm:justify-start"
                      >
                        <PencilIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        Modifier
                      </button>
                      <button
                        onClick={() => deleteEvent(event.id)}
                        className="w-full sm:w-auto text-red-600 hover:text-red-800 text-xs sm:text-sm font-medium flex items-center justify-center sm:justify-start"
                      >
                        <TrashIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredEvents.length === 0 && (
            <div className="px-4 sm:px-6 py-8 text-center text-gray-500">
              Aucun événement trouvé.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
