'use client';

import { useState, useEffect } from 'react';

export interface CookieConsent {
  analytics: boolean;
  marketing: boolean;
  timestamp: string;
  version: string;
}

export interface CookieConsentState {
  consent: CookieConsent | null;
  isPending: boolean;
  hasConsented: boolean;
}

const COOKIE_CONSENT_KEY = 'cookieConsent';
const CONSENT_VERSION = '1.0';

export function useCookieConsent() {
  const [state, setState] = useState<CookieConsentState>({
    consent: null,
    isPending: true,
    hasConsented: false,
  });

  // Charger le consentement au montage du composant
  useEffect(() => {
    const loadConsent = () => {
      try {
        const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
        if (stored) {
          const consent: CookieConsent = JSON.parse(stored);
          setState({
            consent,
            isPending: false,
            hasConsented: true,
          });
        } else {
          setState({
            consent: null,
            isPending: false,
            hasConsented: false,
          });
        }
      } catch (error) {
        console.warn('Erreur lors du chargement du consentement:', error);
        setState({
          consent: null,
          isPending: false,
          hasConsented: false,
        });
      }
    };

    loadConsent();
  }, []);

  // Sauvegarder le consentement
  const saveConsent = (consent: Partial<CookieConsent>) => {
    try {
      const fullConsent: CookieConsent = {
        analytics: consent.analytics ?? false,
        marketing: consent.marketing ?? false,
        timestamp: new Date().toISOString(),
        version: CONSENT_VERSION,
      };

      localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(fullConsent));
      setState({
        consent: fullConsent,
        isPending: false,
        hasConsented: true,
      });

      // Déclencher un événement personnalisé pour notifier les autres composants
      window.dispatchEvent(new CustomEvent('cookieConsentChanged', { 
        detail: fullConsent 
      }));

      return true;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du consentement:', error);
      return false;
    }
  };

  // Accepter tous les cookies
  const acceptAll = () => {
    return saveConsent({
      analytics: true,
      marketing: true,
    });
  };

  // Refuser tous les cookies non-essentiels
  const rejectAll = () => {
    return saveConsent({
      analytics: false,
      marketing: false,
    });
  };

  // Sauvegarder des choix personnalisés
  const saveCustomConsent = (analytics: boolean, marketing: boolean) => {
    return saveConsent({
      analytics,
      marketing,
    });
  };

  // Vérifier si un type de cookie est autorisé
  const isAllowed = (type: 'analytics' | 'marketing') => {
    return state.consent?.[type] ?? false;
  };

  // Réinitialiser le consentement (pour les tests)
  const resetConsent = () => {
    try {
      localStorage.removeItem(COOKIE_CONSENT_KEY);
      setState({
        consent: null,
        isPending: false,
        hasConsented: false,
      });
      return true;
    } catch (error) {
      console.error('Erreur lors de la réinitialisation:', error);
      return false;
    }
  };

  return {
    ...state,
    acceptAll,
    rejectAll,
    saveCustomConsent,
    isAllowed,
    resetConsent,
  };
}
