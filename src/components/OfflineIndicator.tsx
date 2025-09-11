'use client';

import { useState, useEffect } from 'react';

export default function OfflineIndicator() {
  const [showIndicator, setShowIndicator] = useState(false);

  useEffect(() => {
    // Vérifier l'état initial
    if (!navigator.onLine) {
      setShowIndicator(true);
    }

    // Écouter les changements de connectivité
    const handleOnline = () => {
      setShowIndicator(false);
    };

    const handleOffline = () => {
      setShowIndicator(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showIndicator) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-orange-500 text-white text-center py-2 px-4 z-50">
      <div className="flex items-center justify-center space-x-2">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <span className="text-sm font-medium">
          📱 Mode hors ligne - Navigation limitée
        </span>
        <button
          onClick={() => setShowIndicator(false)}
          className="ml-2 text-white hover:text-gray-200"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
