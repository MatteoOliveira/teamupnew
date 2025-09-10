'use client';

import { useState, useEffect } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { useCookieConsent } from '@/hooks/useCookieConsent';
import Button from '@/components/Button';

export default function DataPreferences() {
  const { user } = useAuth();
  const { consent, saveCustomConsent, isAllowed } = useCookieConsent();
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');

  // États pour les préférences
  const [preferences, setPreferences] = useState({
    cookies: {
      analytics: true,
      marketing: false,
    },
    notifications: {
      push: true,
      email: true,
      sms: false,
    },
    communication: {
      newsletters: false,
      promotional: false,
      updates: true,
    },
    dataProcessing: {
      analytics: true,
      personalization: false,
      advertising: false,
    }
  });

  // Initialiser les préférences depuis le consentement actuel
  useEffect(() => {
    if (consent) {
      setPreferences(prev => ({
        ...prev,
        cookies: {
          analytics: isAllowed('analytics'),
          marketing: isAllowed('marketing'),
        }
      }));
    }
  }, [consent, isAllowed]);

  const handlePreferenceChange = (category: keyof typeof preferences, key: string, value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const handleSavePreferences = async () => {
    if (!user) return;

    setIsSaving(true);
    setMessage('');
    setMessageType('');

    try {
      // Sauvegarder les préférences dans Firestore
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        preferences: preferences,
        updatedAt: new Date()
      });

      // Mettre à jour le consentement des cookies
      saveCustomConsent(
        preferences.cookies.analytics,
        preferences.cookies.marketing
      );

      setMessage('Préférences sauvegardées avec succès !');
      setMessageType('success');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      setMessage('Erreur lors de la sauvegarde des préférences');
      setMessageType('error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetToDefaults = () => {
    setPreferences({
      cookies: {
        analytics: true,
        marketing: false,
      },
      notifications: {
        push: true,
        email: true,
        sms: false,
      },
      communication: {
        newsletters: false,
        promotional: false,
        updates: true,
      },
      dataProcessing: {
        analytics: true,
        personalization: false,
        advertising: false,
      }
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          🚫 Droit d&apos;Opposition - Gérer mes préférences
        </h3>
      </div>

      {message && (
        <div className={`mb-6 p-3 rounded-lg ${
          messageType === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message}
        </div>
      )}

      <div className="space-y-8">
        {/* Cookies et Tracker */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-4">🍪 Cookies et Tracker</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium text-gray-900">Analytics</div>
                <div className="text-sm text-gray-600">Mesure d&apos;audience et analyse du comportement</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.cookies.analytics}
                  onChange={(e) => handlePreferenceChange('cookies', 'analytics', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium text-gray-900">Marketing</div>
                <div className="text-sm text-gray-600">Publicité personnalisée et ciblage</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.cookies.marketing}
                  onChange={(e) => handlePreferenceChange('cookies', 'marketing', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-4">🔔 Notifications</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium text-gray-900">Notifications Push</div>
                <div className="text-sm text-gray-600">Rappels d&apos;événements et messages</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.notifications.push}
                  onChange={(e) => handlePreferenceChange('notifications', 'push', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium text-gray-900">Notifications Email</div>
                <div className="text-sm text-gray-600">Résumés et informations importantes</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.notifications.email}
                  onChange={(e) => handlePreferenceChange('notifications', 'email', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium text-gray-900">Notifications SMS</div>
                <div className="text-sm text-gray-600">Alertes urgentes par SMS</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.notifications.sms}
                  onChange={(e) => handlePreferenceChange('notifications', 'sms', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Communication */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-4">📧 Communication</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium text-gray-900">Newsletters</div>
                <div className="text-sm text-gray-600">Actualités et conseils sportifs</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.communication.newsletters}
                  onChange={(e) => handlePreferenceChange('communication', 'newsletters', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium text-gray-900">Offres Promotionnelles</div>
                <div className="text-sm text-gray-600">Réductions et événements spéciaux</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.communication.promotional}
                  onChange={(e) => handlePreferenceChange('communication', 'promotional', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium text-gray-900">Mises à Jour</div>
                <div className="text-sm text-gray-600">Nouvelles fonctionnalités et améliorations</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.communication.updates}
                  onChange={(e) => handlePreferenceChange('communication', 'updates', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Traitement des Données */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-4">⚙️ Traitement des Données</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium text-gray-900">Analyse Comportementale</div>
                <div className="text-sm text-gray-600">Amélioration de l&apos;expérience utilisateur</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.dataProcessing.analytics}
                  onChange={(e) => handlePreferenceChange('dataProcessing', 'analytics', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium text-gray-900">Personnalisation</div>
                <div className="text-sm text-gray-600">Contenu adapté à vos préférences</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.dataProcessing.personalization}
                  onChange={(e) => handlePreferenceChange('dataProcessing', 'personalization', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium text-gray-900">Publicité Ciblée</div>
                <div className="text-sm text-gray-600">Annonces personnalisées</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.dataProcessing.advertising}
                  onChange={(e) => handlePreferenceChange('dataProcessing', 'advertising', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-md font-medium text-blue-900 mb-3">⚡ Actions Rapides</h4>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => {
                setPreferences(prev => ({
                  ...prev,
                  cookies: { analytics: true, marketing: true },
                  notifications: { push: true, email: true, sms: true },
                  communication: { newsletters: true, promotional: true, updates: true },
                  dataProcessing: { analytics: true, personalization: true, advertising: true }
                }));
              }}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              Tout Autoriser
            </Button>
            <Button
              onClick={() => {
                setPreferences(prev => ({
                  ...prev,
                  cookies: { analytics: false, marketing: false },
                  notifications: { push: false, email: false, sms: false },
                  communication: { newsletters: false, promotional: false, updates: false },
                  dataProcessing: { analytics: false, personalization: false, advertising: false }
                }));
              }}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              Tout Refuser
            </Button>
            <Button
              onClick={handleResetToDefaults}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              Réinitialiser
            </Button>
          </div>
        </div>

        {/* Boutons de sauvegarde */}
        <div className="flex justify-center pt-4 border-t border-gray-200">
          <Button
            onClick={handleSavePreferences}
            disabled={isSaving}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg text-sm font-medium disabled:opacity-50"
          >
            {isSaving ? 'Sauvegarde...' : 'Sauvegarder mes préférences'}
          </Button>
        </div>
      </div>
    </div>
  );
}
