'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useCookieConsent } from '@/hooks/useCookieConsent';

// Déclaration de type pour gtag
declare global {
  interface Window {
    gtag?: (command: string, targetId: string, config?: Record<string, unknown>) => void;
  }
}

export default function GoogleAnalytics() {
  const { user } = useAuth();
  const { isAllowed, isPending } = useCookieConsent();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Ne pas charger si en cours de vérification du consentement
    if (isPending) return;

    // Charger Google Analytics seulement si :
    // 1. L'utilisateur est connecté
    // 2. Le consentement analytique est donné
    // 3. En production
    if (user && isAllowed('analytics') && process.env.NODE_ENV === 'production') {
      // Charger Google Analytics de manière asynchrone
      const loadGoogleAnalytics = async () => {
        try {
          // Configuration optimisée pour réduire la taille
          if (typeof window !== 'undefined' && window.gtag) {
            window.gtag('config', 'G-XP9K67C013', {
              page_title: document.title,
              page_location: window.location.href,
              // Optimisations pour réduire la taille
              send_page_view: true,
              anonymize_ip: true,
            });
            setIsLoaded(true);
          }
        } catch (error) {
          console.warn('Google Analytics failed to load:', error);
        }
      };

      // Délai pour éviter de bloquer le rendu initial
      const timer = setTimeout(loadGoogleAnalytics, 1000);
      
      return () => clearTimeout(timer);
    } else if (!isAllowed('analytics') && isLoaded) {
      // Désactiver Google Analytics si le consentement est retiré
      console.log('Google Analytics désactivé - consentement retiré');
      setIsLoaded(false);
    }
  }, [user, isAllowed, isPending, isLoaded]);

  // Écouter les changements de consentement
  useEffect(() => {
    const handleConsentChange = (event: CustomEvent) => {
      const consent = event.detail;
      if (!consent.analytics && isLoaded) {
        console.log('Google Analytics désactivé - consentement modifié');
        setIsLoaded(false);
      }
    };

    window.addEventListener('cookieConsentChanged', handleConsentChange as EventListener);
    
    return () => {
      window.removeEventListener('cookieConsentChanged', handleConsentChange as EventListener);
    };
  }, [isLoaded]);

  return null; // Ce composant ne rend rien
}
