'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon, DevicePhoneMobileIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Détecter iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Détecter si déjà en mode PWA
    const standalone = window.matchMedia('(display-mode: standalone)').matches;
    setIsStandalone(standalone);

    // Écouter l'événement d'installation PWA
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Vérifier si l'utilisateur a déjà refusé l'installation
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed && !standalone) {
      setShowPrompt(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('PWA installée avec succès');
        setShowPrompt(false);
      }
      
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  // Ne pas afficher si déjà en mode PWA ou sur desktop
  if (isStandalone || !isIOS) {
    return null;
  }

  if (!showPrompt) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-blue-600 text-white p-4 shadow-lg">
      <div className="flex items-center justify-between max-w-md mx-auto">
        <div className="flex items-center space-x-3">
          <DevicePhoneMobileIcon className="h-6 w-6" />
          <div>
            <p className="font-semibold text-sm">Installer l&apos;app TeamUp</p>
            <p className="text-xs opacity-90">Pour une meilleure expérience</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={handleInstall}
            className="bg-white text-blue-600 px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1"
          >
            <ArrowDownTrayIcon className="h-4 w-4" />
            <span>Installer</span>
          </button>
          
          <button
            onClick={handleDismiss}
            className="text-white hover:text-gray-200 p-1"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      {/* Instructions pour iOS */}
      {isIOS && (
        <div className="mt-3 text-xs opacity-90 text-center">
          <p>📱 Tapez sur l&apos;icône &quot;Partager&quot; puis &quot;Ajouter à l&apos;écran d&apos;accueil&quot;</p>
        </div>
      )}
    </div>
  );
}
