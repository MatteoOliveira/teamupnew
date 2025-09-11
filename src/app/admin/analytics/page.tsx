'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ArrowLeftIcon, ChartBarIcon, CalendarIcon, UsersIcon, ClockIcon } from '@heroicons/react/24/outline';
import { useAdminAnalytics } from '@/hooks/useAdminAnalytics';
import AdminCharts from '@/components/AdminCharts';
import AdminNavigation from '@/components/AdminNavigation';

export default function AdminAnalytics() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const { analytics, loading: analyticsLoading, refetch } = useAdminAnalytics();

  // Auto-refresh toutes les minutes
  useEffect(() => {
    if (!isAdmin) return;

    // Mise à jour initiale
    setLastUpdate(new Date());

    const interval = setInterval(() => {
      console.log('🔄 Auto-refresh des analytics...');
      refetch();
      setLastUpdate(new Date());
    }, 60000); // 60 secondes = 1 minute

    return () => clearInterval(interval);
  }, [isAdmin, refetch]);

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

  if (loading || analyticsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des analytics...</p>
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
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 space-y-2 sm:space-y-0">
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <button
                onClick={() => router.push('/admin/dashboard')}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors text-sm sm:text-base"
              >
                <ArrowLeftIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Retour au dashboard</span>
                <span className="sm:hidden">Retour</span>
              </button>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Analytics Avancés</h1>
            </div>
            <div className="text-xs sm:text-sm text-gray-500">
              Dernière mise à jour : {lastUpdate.toLocaleTimeString('fr-FR')}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Admin */}
        <AdminNavigation currentPage="analytics" />

        {/* Métriques Principales */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <UsersIcon className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Utilisateurs</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.totalUsers}</p>
                  <p className="text-xs text-blue-600">{analytics.activeUsers} actifs cette semaine</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <CalendarIcon className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Événements</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.totalEvents}</p>
                  <p className="text-xs text-green-600">{analytics.futureEvents} futurs, {analytics.pastEvents} passés</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <ClockIcon className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Temps Moyen</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.avgSessionTime}min</p>
                  <p className="text-xs text-purple-600">par session utilisateur</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <ChartBarIcon className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Rétention</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.retentionRate.toFixed(1)}%</p>
                  <p className="text-xs text-orange-600">taux de rétention</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Graphiques Interactifs */}
        {analytics && (
          <div className="mb-8">
            <AdminCharts analytics={analytics} />
          </div>
        )}

        {/* Sports Populaires */}
        {analytics && analytics.popularSports.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Sports les Plus Populaires</h3>
            <div className="space-y-3">
              {analytics.popularSports.map((sport, index) => {
                const percentage = (sport.count / analytics.totalEvents) * 100;
                const colors = ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500', 'bg-purple-500'];
                const color = colors[index % colors.length];
                
                return (
                  <div key={index} className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full ${color}`}></div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">{sport.sport}</span>
                        <span className="text-sm text-gray-500">{sport.count} événements</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div
                          className={`h-2 rounded-full ${color} transition-all duration-500`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Informations Système */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations Système</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Statistiques Générales</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Événements créés aujourd&apos;hui : {analytics?.eventsToday || 0}</li>
                <li>• Utilisateurs actifs cette semaine : {analytics?.activeUsers || 0}</li>
                <li>• Taux de rétention : {analytics?.retentionRate.toFixed(1) || 0}%</li>
                <li>• Temps moyen de session : {analytics?.avgSessionTime || 0} minutes</li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Répartition des Événements</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Événements futurs : {analytics?.futureEvents || 0}</li>
                <li>• Événements passés : {analytics?.pastEvents || 0}</li>
                <li>• Total événements : {analytics?.totalEvents || 0}</li>
                <li>• Sports différents : {analytics?.popularSports.length || 0}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
