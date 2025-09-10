'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCookieConsent } from '@/hooks/useCookieConsent';

export default function CookieBanner() {
  const { isPending, hasConsented, acceptAll, rejectAll, saveCustomConsent } = useCookieConsent();
  const [showCustomize, setShowCustomize] = useState(false);
  const [customAnalytics, setCustomAnalytics] = useState(true);
  const [customMarketing, setCustomMarketing] = useState(false);

  // Ne pas afficher si en cours de chargement ou si déjà consenti
  if (isPending || hasConsented) {
    return null;
  }

  const handleAcceptAll = () => {
    acceptAll();
  };

  const handleRejectAll = () => {
    rejectAll();
  };

  const handleCustomize = () => {
    setShowCustomize(true);
  };

  const handleSaveCustom = () => {
    saveCustomConsent(customAnalytics, customMarketing);
    setShowCustomize(false);
  };

  const handleClose = () => {
    // Fermer temporairement (reviendra au prochain chargement)
    setShowCustomize(false);
  };

  return (
    <>
      {/* Banner Principal */}
      {!showCustomize && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              {/* Contenu Principal */}
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  🍪 Gestion des Cookies
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  Nous utilisons des cookies pour améliorer votre expérience et analyser l&apos;utilisation de notre application. 
                  Vous pouvez choisir quels cookies accepter.
                </p>
                <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                  <Link href="/privacy" className="text-blue-600 hover:text-blue-800 underline">
                    Politique de Confidentialité
                  </Link>
                  <span>•</span>
                  <span>Cookies essentiels : toujours actifs</span>
                </div>
              </div>

              {/* Boutons d&apos;Action */}
              <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                <button
                  onClick={handleRejectAll}
                  className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                >
                  Refuser tout
                </button>
                <button
                  onClick={handleCustomize}
                  className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  Personnaliser
                </button>
                <button
                  onClick={handleAcceptAll}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-green-600 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Accepter tout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Personnalisation */}
      {showCustomize && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Personnaliser les Cookies
                </h3>
                <button
                  onClick={handleClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                {/* Cookies Essentiels */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">Cookies Essentiels</h4>
                    <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      Toujours actifs
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Nécessaires au fonctionnement de l&apos;application (connexion, sécurité, préférences).
                  </p>
                </div>

                {/* Cookies Analytiques */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">Cookies Analytiques</h4>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={customAnalytics}
                        onChange={(e) => setCustomAnalytics(e.target.checked)}
                        className="sr-only"
                      />
                      <div className={`w-11 h-6 rounded-full transition-colors ${
                        customAnalytics ? 'bg-green-600' : 'bg-gray-200'
                      }`}>
                        <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                          customAnalytics ? 'translate-x-5' : 'translate-x-0.5'
                        } mt-0.5`} />
                      </div>
                    </label>
                  </div>
                  <p className="text-sm text-gray-600">
                    Google Analytics pour analyser l&apos;utilisation et améliorer l&apos;application.
                  </p>
                </div>

                {/* Cookies Marketing */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">Cookies Marketing</h4>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={customMarketing}
                        onChange={(e) => setCustomMarketing(e.target.checked)}
                        className="sr-only"
                      />
                      <div className={`w-11 h-6 rounded-full transition-colors ${
                        customMarketing ? 'bg-green-600' : 'bg-gray-200'
                      }`}>
                        <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                          customMarketing ? 'translate-x-5' : 'translate-x-0.5'
                        } mt-0.5`} />
                      </div>
                    </label>
                  </div>
                  <p className="text-sm text-gray-600">
                    Cookies pour la publicité personnalisée (non utilisés actuellement).
                  </p>
                </div>
              </div>

              {/* Boutons d&apos;Action */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleClose}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSaveCustom}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Sauvegarder
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
