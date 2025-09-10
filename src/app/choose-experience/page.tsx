'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DevicePhoneMobileIcon, ComputerDesktopIcon, ArrowDownTrayIcon, SparklesIcon } from '@heroicons/react/24/outline';

export default function ChooseExperiencePage() {
  const [isStandalone, setIsStandalone] = useState(false);
  // const [isMobile, setIsMobile] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Détecter le mode PWA
    const standalone = window.matchMedia('(display-mode: standalone)').matches;
    setIsStandalone(standalone);

    // Détecter le type d'appareil
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const android = /Android/.test(navigator.userAgent);
    
    setIsIOS(iOS);
    setIsAndroid(android);

    // Si déjà en mode PWA, rediriger vers l'app
    if (standalone) {
      router.push('/');
    }
  }, [router]);

  const handleWebExperience = () => {
    // Continuer sur le web - rediriger vers le formulaire de connexion
    router.push('/login');
  };

  const handleAppExperience = () => {
    // Instructions pour installer la PWA
    // L'utilisateur sera guidé pour l'installation
  };

  const handleInstallPWA = async () => {
    // Déclencher l'installation PWA si possible
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        if (registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
      } catch {
        console.log('Installation PWA non disponible');
      }
    }
  };

  // Si déjà en mode PWA, ne pas afficher cette page
  if (isStandalone) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header avec logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-2xl mb-4 shadow-lg">
            <SparklesIcon className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Bienvenue sur TeamUp !
          </h1>
          <p className="text-gray-600">
            Choisissez votre expérience préférée
          </p>
        </div>

        {/* Carte principale */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-6">
          <div className="space-y-6">
            {/* Option Web */}
            <button
              onClick={handleWebExperience}
              className="w-full p-6 border-2 border-gray-200 rounded-2xl hover:border-blue-300 hover:bg-blue-50 transition-all duration-300 group"
            >
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                    <ComputerDesktopIcon className="w-6 h-6 text-gray-600 group-hover:text-blue-600" />
                  </div>
                </div>
                <div className="flex-1 text-left">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-900">
                    Continuer sur le Web
                  </h3>
                  <p className="text-sm text-gray-500 group-hover:text-blue-700">
                    Utilisez TeamUp directement dans votre navigateur
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <div className="w-6 h-6 border-2 border-gray-300 rounded-full group-hover:border-blue-500"></div>
                </div>
              </div>
            </button>

            {/* Option App */}
            <button
              onClick={handleAppExperience}
              className="w-full p-6 border-2 border-gray-200 rounded-2xl hover:border-purple-300 hover:bg-purple-50 transition-all duration-300 group"
            >
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                    <DevicePhoneMobileIcon className="w-6 h-6 text-gray-600 group-hover:text-purple-600" />
                  </div>
                </div>
                <div className="flex-1 text-left">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-purple-900">
                    Continuer sur l&apos;Application
                  </h3>
                  <p className="text-sm text-gray-500 group-hover:text-purple-700">
                    Installez TeamUp comme une app native
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <div className="w-6 h-6 border-2 border-gray-300 rounded-full group-hover:border-purple-500"></div>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Instructions d'installation */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="text-center mb-4">
            <ArrowDownTrayIcon className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <h3 className="text-lg font-semibold text-gray-900">
              Comment installer l&apos;application ?
            </h3>
          </div>
          
          <div className="space-y-4">
            {isIOS ? (
              <div className="bg-blue-50 rounded-xl p-4">
                <h4 className="font-semibold text-blue-900 mb-2">📱 Sur iPhone/iPad :</h4>
                <ol className="text-sm text-blue-800 space-y-1">
                  <li>1. Tapez sur l&apos;icône <strong>&quot;Partager&quot;</strong> en bas</li>
                  <li>2. Faites défiler et tapez <strong>&quot;Ajouter à l&apos;écran d&apos;accueil&quot;</strong></li>
                  <li>3. Tapez sur <strong>&quot;Ajouter&quot;</strong> pour confirmer</li>
                </ol>
              </div>
            ) : isAndroid ? (
              <div className="bg-green-50 rounded-xl p-4">
                <h4 className="font-semibold text-green-900 mb-2">🤖 Sur Android :</h4>
                <ol className="text-sm text-green-800 space-y-1">
                  <li>1. Tapez sur le menu (3 points) en haut à droite</li>
                  <li>2. Sélectionnez <strong>&quot;Ajouter à l&apos;écran d&apos;accueil&quot;</strong></li>
                  <li>3. Tapez sur <strong>&quot;Ajouter&quot;</strong> pour confirmer</li>
                </ol>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-semibold text-gray-900 mb-2">💻 Sur ordinateur :</h4>
                <ol className="text-sm text-gray-800 space-y-1">
                  <li>1. Cliquez sur l&apos;icône d&apos;installation dans la barre d&apos;adresse</li>
                  <li>2. Ou allez dans le menu Chrome → &quot;Installer TeamUp&quot;</li>
                </ol>
              </div>
            )}
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={handleInstallPWA}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg"
            >
              Installer maintenant
            </button>
          </div>
        </div>

        {/* Avantages de l'app */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            L&apos;application offre une expérience plus rapide et des notifications push
          </p>
        </div>
      </div>
    </div>
  );
}
