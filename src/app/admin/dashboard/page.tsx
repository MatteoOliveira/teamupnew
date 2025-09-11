'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { collection, query, orderBy, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Event } from '@/types/event';
import { 
  ArrowLeftIcon, 
  ChartBarIcon, 
  CalendarIcon, 
  UsersIcon, 
  ClockIcon
} from '@heroicons/react/24/outline';
import { useAdminAnalytics } from '@/hooks/useAdminAnalytics';
import AdminCharts from '@/components/AdminCharts';

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
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

  // Charger les données récentes
  useEffect(() => {
    const loadRecentData = async () => {
      if (!isAdmin) return;

      try {
        setLoadingData(true);

        // Charger les 5 derniers événements
        const eventsQuery = query(
          collection(db, 'events'),
          orderBy('date', 'desc')
        );
        const eventsSnapshot = await getDocs(eventsQuery);
        const eventsData = eventsSnapshot.docs.slice(0, 5).map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Event[];

        setEvents(eventsData);

      } catch (error) {
        console.error('Erreur chargement données:', error);
      } finally {
        setLoadingData(false);
      }
    };

    if (isAdmin) {
      loadRecentData();
    }
  }, [isAdmin]);

  if (loading || loadingData || analyticsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement du dashboard...</p>
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
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 space-y-3 sm:space-y-0">
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <button
                onClick={() => router.push('/profile')}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors text-sm sm:text-base"
              >
                <ArrowLeftIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Retour au profil</span>
                <span className="sm:hidden">Retour</span>
              </button>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Dashboard Administrateur</h1>
            </div>
            <div className="text-xs sm:text-sm text-gray-500">
              Connecté en tant que : {user?.email}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Admin */}
        <div className="mb-6 sm:mb-8">
          <nav className="flex flex-wrap gap-1 sm:gap-0 sm:space-x-1 bg-gray-100 p-1 rounded-lg w-full sm:w-fit">
            <button
              onClick={() => router.push('/admin/dashboard')}
              className="flex-1 sm:flex-none px-2 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium bg-white text-gray-900 shadow-sm"
            >
              📊 <span className="hidden sm:inline">Dashboard</span>
            </button>
            <button
              onClick={() => router.push('/admin/users')}
              className="flex-1 sm:flex-none px-2 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-white transition-colors"
            >
              👥 <span className="hidden sm:inline">Utilisateurs</span>
            </button>
            <button
              onClick={() => router.push('/admin/events')}
              className="flex-1 sm:flex-none px-2 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-white transition-colors"
            >
              📅 <span className="hidden sm:inline">Événements</span>
            </button>
            <button
              onClick={() => router.push('/admin/analytics')}
              className="flex-1 sm:flex-none px-2 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-white transition-colors"
            >
              📈 <span className="hidden sm:inline">Analytics</span>
            </button>
            <button
              onClick={() => router.push('/admin/settings')}
              className="flex-1 sm:flex-none px-2 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-white transition-colors"
            >
              ⚙️ <span className="hidden sm:inline">Paramètres</span>
            </button>
          </nav>
        </div>

        {/* Statistiques Principales */}
        {analytics && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="bg-white rounded-lg shadow p-4 sm:p-6">
              <div className="flex items-center">
                <CalendarIcon className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                <div className="ml-3 sm:ml-4">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Total Événements</p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900">{analytics.totalEvents}</p>
                  <p className="text-xs text-green-600">+{analytics.eventsToday} aujourd&apos;hui</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4 sm:p-6">
              <div className="flex items-center">
                <UsersIcon className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                <div className="ml-3 sm:ml-4">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Utilisateurs</p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900">{analytics.totalUsers}</p>
                  <p className="text-xs text-blue-600">{analytics.activeUsers} actifs</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4 sm:p-6">
              <div className="flex items-center">
                <ClockIcon className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
                <div className="ml-3 sm:ml-4">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Temps Moyen</p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900">{analytics.avgSessionTime}min</p>
                  <p className="text-xs text-purple-600">par session</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4 sm:p-6">
              <div className="flex items-center">
                <ChartBarIcon className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600" />
                <div className="ml-3 sm:ml-4">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Rétention</p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900">{analytics.retentionRate.toFixed(1)}%</p>
                  <p className="text-xs text-orange-600">taux de rétention</p>
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

        {/* Événements Récents */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">Événements Récents</h2>
              <button
                onClick={() => router.push('/admin/events')}
                className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm font-medium self-start sm:self-auto"
              >
                Voir tous →
              </button>
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {events.map((event) => {
              if (!event.date) return null;
              
              const eventDate = event.date instanceof Date ? event.date : 
                typeof event.date === 'string' ? new Date(event.date) :
                new Date(event.date.seconds * 1000);
              const isFuture = eventDate >= new Date();
              
              return (
                <div key={event.id} className="px-4 sm:px-6 py-4 hover:bg-gray-50">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                    <div className="flex-1">
                      <h3 className="text-sm sm:text-lg font-medium text-gray-900">{event.name}</h3>
                      <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">{event.description}</p>
                      <div className="mt-2 flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 text-xs sm:text-sm text-gray-500">
                        <span>📅 {eventDate.toLocaleDateString('fr-FR')}</span>
                        <span>⏰ {eventDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                        <span>📍 {event.location}</span>
                        <span>👥 {event.currentParticipants || 0} participants</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        isFuture
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {isFuture ? 'Futur' : 'Passé'}
                      </span>
                      <button
                        onClick={() => router.push(`/event/${event.id}`)}
                        className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm font-medium"
                      >
                        Voir
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {events.length === 0 && (
            <div className="px-4 sm:px-6 py-8 text-center text-gray-500">
              Aucun événement trouvé.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
