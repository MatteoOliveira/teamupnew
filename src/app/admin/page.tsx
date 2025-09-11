'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { collection, query, orderBy, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Event } from '@/types/event';
import { ArrowLeftIcon, ChartBarIcon, CalendarIcon, UsersIcon, ClockIcon } from '@heroicons/react/24/outline';
import { useAdminAnalytics } from '@/hooks/useAdminAnalytics';
import AdminCharts from '@/components/AdminCharts';

interface AdminStats {
  totalEvents: number;
  futureEvents: number;
  pastEvents: number;
  totalUsers: number;
  eventsToday: number;
  avgSessionTime: number;
  peakActivity: { date: string; users: number }[];
  eventsPerDay: { date: string; count: number }[];
}

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [filter, setFilter] = useState<'all' | 'future' | 'past'>('all');
  const [isAdmin, setIsAdmin] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const { analytics, loading: analyticsLoading } = useAdminAnalytics();

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

        // Charger les événements
        const eventsQuery = query(
          collection(db, 'events'),
          orderBy('date', 'desc')
        );
        const eventsSnapshot = await getDocs(eventsQuery);
        const eventsData = eventsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Event[];

        setEvents(eventsData);

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
  const filteredEvents = events.filter(event => {
    if (filter === 'all') return true;
    const eventDate = event.date instanceof Date ? event.date : new Date(event.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (filter === 'future') return eventDate >= today;
    if (filter === 'past') return eventDate < today;
    return true;
  });

  if (loading || loadingData || analyticsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement de l&apos;espace admin...</p>
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
                onClick={() => router.push('/profile')}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5 mr-2" />
                Retour au profil
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Espace Administrateur</h1>
            </div>
            <div className="text-sm text-gray-500">
              Connecté en tant que : {user?.email}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistiques */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <CalendarIcon className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Événements</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.totalEvents}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <UsersIcon className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Utilisateurs</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.totalUsers}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <ClockIcon className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Temps Moyen</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.avgSessionTime}min</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <ChartBarIcon className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Aujourd&apos;hui</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.eventsToday}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Graphiques */}
        {analytics && (
          <div className="mb-8">
            <AdminCharts analytics={analytics} />
          </div>
        )}

        {/* Filtres et Liste des Événements */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Gestion des Événements</h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    filter === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Tous
                </button>
                <button
                  onClick={() => setFilter('future')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    filter === 'future'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Futurs
                </button>
                <button
                  onClick={() => setFilter('past')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    filter === 'past'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Passés
                </button>
              </div>
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {filteredEvents.map((event) => {
              const eventDate = event.date instanceof Date ? event.date : new Date(event.date);
              const isFuture = eventDate >= new Date();
              
              return (
                <div key={event.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900">{event.title}</h3>
                      <p className="text-sm text-gray-600">{event.description}</p>
                      <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                        <span>📅 {eventDate.toLocaleDateString('fr-FR')}</span>
                        <span>⏰ {eventDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                        <span>📍 {event.location}</span>
                        <span>👥 {event.participants?.length || 0} participants</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        isFuture
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {isFuture ? 'Futur' : 'Passé'}
                      </span>
                      <button
                        onClick={() => router.push(`/event/${event.id}`)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Voir
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredEvents.length === 0 && (
            <div className="px-6 py-8 text-center text-gray-500">
              Aucun événement trouvé pour ce filtre.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
