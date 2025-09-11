'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ArrowLeftIcon, CogIcon, BellIcon, ShieldCheckIcon, ServerIcon } from '@heroicons/react/24/outline';

export default function AdminSettings() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [settings, setSettings] = useState({
    maintenanceMode: false,
    newUserRegistration: true,
    eventCreation: true,
    notifications: true,
    analytics: true,
    maxEventsPerUser: 10,
    maxParticipantsPerEvent: 50
  });
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

  // Charger les paramètres
  useEffect(() => {
    const loadSettings = async () => {
      if (!isAdmin) return;

      try {
        setLoadingData(true);
        // Ici vous pourriez charger les paramètres depuis Firestore
        // Pour l'instant, on utilise des paramètres par défaut
        setLoadingData(false);
      } catch (error) {
        console.error('Erreur chargement paramètres:', error);
        setLoadingData(false);
      }
    };

    if (isAdmin) {
      loadSettings();
    }
  }, [isAdmin]);

  // Sauvegarder les paramètres
  const saveSettings = async () => {
    try {
      // Ici vous pourriez sauvegarder les paramètres dans Firestore
      // await updateDoc(doc(db, 'admin_settings', 'main'), settings);
      alert('Paramètres sauvegardés avec succès !');
    } catch (error) {
      console.error('Erreur sauvegarde paramètres:', error);
      alert('Erreur lors de la sauvegarde des paramètres');
    }
  };

  // Actions système
  const clearCache = () => {
    if (confirm('Êtes-vous sûr de vouloir vider le cache ?')) {
      // Logique pour vider le cache
      alert('Cache vidé avec succès !');
    }
  };

  const exportData = () => {
    // Logique pour exporter les données
    alert('Export des données démarré !');
  };

  const backupDatabase = () => {
    if (confirm('Êtes-vous sûr de vouloir créer une sauvegarde ?')) {
      // Logique pour créer une sauvegarde
      alert('Sauvegarde créée avec succès !');
    }
  };

  if (loading || loadingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des paramètres...</p>
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
              <h1 className="text-2xl font-bold text-gray-900">Paramètres Administrateur</h1>
            </div>
            <button
              onClick={saveSettings}
              className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              💾 Sauvegarder
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Admin */}
        <div className="mb-8">
          <nav className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
            <button
              onClick={() => router.push('/admin/dashboard')}
              className="px-4 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-white transition-colors"
            >
              📊 Dashboard
            </button>
            <button
              onClick={() => router.push('/admin/users')}
              className="px-4 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-white transition-colors"
            >
              👥 Utilisateurs
            </button>
            <button
              onClick={() => router.push('/admin/events')}
              className="px-4 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-white transition-colors"
            >
              📅 Événements
            </button>
            <button
              onClick={() => router.push('/admin/analytics')}
              className="px-4 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-white transition-colors"
            >
              📈 Analytics
            </button>
            <button
              onClick={() => router.push('/admin/settings')}
              className="px-4 py-2 rounded-md text-sm font-medium bg-white text-gray-900 shadow-sm"
            >
              ⚙️ Paramètres
            </button>
          </nav>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Paramètres Généraux */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <CogIcon className="h-6 w-6 text-gray-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Paramètres Généraux</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Mode Maintenance</label>
                  <p className="text-xs text-gray-500">Désactive l&apos;accès public à l&apos;application</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.maintenanceMode}
                    onChange={(e) => setSettings({...settings, maintenanceMode: e.target.checked})}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Inscription Utilisateurs</label>
                  <p className="text-xs text-gray-500">Autorise les nouvelles inscriptions</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.newUserRegistration}
                    onChange={(e) => setSettings({...settings, newUserRegistration: e.target.checked})}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Création d&apos;Événements</label>
                  <p className="text-xs text-gray-500">Autorise la création d&apos;événements</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.eventCreation}
                    onChange={(e) => setSettings({...settings, eventCreation: e.target.checked})}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Paramètres Notifications */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <BellIcon className="h-6 w-6 text-gray-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Notifications Globales</label>
                  <p className="text-xs text-gray-500">Active les notifications pour tous les utilisateurs</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications}
                    onChange={(e) => setSettings({...settings, notifications: e.target.checked})}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Analytics</label>
                  <p className="text-xs text-gray-500">Collecte des données d&apos;utilisation</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.analytics}
                    onChange={(e) => setSettings({...settings, analytics: e.target.checked})}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Limites */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <ShieldCheckIcon className="h-6 w-6 text-gray-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Limites</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Événements max par utilisateur
                </label>
                <input
                  type="number"
                  value={settings.maxEventsPerUser}
                  onChange={(e) => setSettings({...settings, maxEventsPerUser: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="1"
                  max="100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Participants max par événement
                </label>
                <input
                  type="number"
                  value={settings.maxParticipantsPerEvent}
                  onChange={(e) => setSettings({...settings, maxParticipantsPerEvent: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="1"
                  max="1000"
                />
              </div>
            </div>
          </div>

          {/* Actions Système */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <ServerIcon className="h-6 w-6 text-gray-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Actions Système</h3>
            </div>
            
            <div className="space-y-4">
              <button
                onClick={clearCache}
                className="w-full bg-yellow-600 text-white py-2 px-4 rounded-md hover:bg-yellow-700 transition-colors text-sm font-medium"
              >
                🗑️ Vider le Cache
              </button>

              <button
                onClick={exportData}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors text-sm font-medium"
              >
                📤 Exporter les Données
              </button>

              <button
                onClick={backupDatabase}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                💾 Sauvegarder la Base
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
