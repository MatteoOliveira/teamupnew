'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Rediriger vers la page d'accueil quand la connexion revient
      router.push('/');
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    // Vérifier l'état initial
    setIsOnline(navigator.onLine);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [router]);

  const handleRetry = () => {
    if (navigator.onLine) {
      router.push('/');
    } else {
      window.location.reload();
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 text-center">
        <div className="w-16 h-16 mx-auto bg-yellow-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Mode Hors Ligne
        </h1>
        
        <p className="text-gray-600 mb-6">
          Vous êtes actuellement hors ligne. Certaines fonctionnalités peuvent être limitées.
        </p>
        
        <div className="space-y-3">
          <button
            onClick={handleRetry}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200"
          >
            {isOnline ? 'Retour à l\'accueil' : 'Réessayer'}
          </button>
          
          <button
            onClick={handleGoBack}
            className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors duration-200"
          >
            Retour
          </button>
        </div>
        
        <div className="mt-6 text-sm text-gray-500">
          <p className="font-medium mb-2">Fonctionnalités disponibles hors ligne :</p>
          <ul className="space-y-1 text-left">
            <li>• Consultation des événements récents</li>
            <li>• Profil utilisateur</li>
            <li>• Messages en cache</li>
            <li>• Statistiques personnelles</li>
          </ul>
          
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-blue-800 text-xs">
              💡 <strong>Astuce :</strong> Installez l'application TeamUp sur votre écran d'accueil pour une meilleure expérience hors ligne.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}