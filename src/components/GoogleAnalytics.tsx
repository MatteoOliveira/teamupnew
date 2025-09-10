'use client';

import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

// Déclaration de type pour gtag
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

export default function GoogleAnalytics() {
  const { user } = useAuth();

  useEffect(() => {
    // Charger Google Analytics seulement si l'utilisateur est connecté
    // et seulement en production pour éviter le JavaScript inutile en développement
    if (user && process.env.NODE_ENV === 'production') {
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
          }
        } catch (error) {
          console.warn('Google Analytics failed to load:', error);
        }
      };

      // Délai pour éviter de bloquer le rendu initial
      const timer = setTimeout(loadGoogleAnalytics, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [user]);

  return null; // Ce composant ne rend rien
}
