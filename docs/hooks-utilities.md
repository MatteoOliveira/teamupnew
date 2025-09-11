# 🔧 Hooks et Utilitaires

## 📝 Description Simple

Les hooks sont des fonctions React qui permettent de réutiliser la logique entre les composants. Ils gèrent l'état, les effets de bord, et les interactions avec les APIs. Les utilitaires sont des fonctions helper qui simplifient les tâches courantes.

## 🔧 Description Technique

### Architecture des Hooks

L'application utilise une architecture de hooks modulaire avec :
- **Hooks personnalisés** pour la logique métier
- **Hooks de données** pour l'interaction avec Firestore
- **Hooks d'UI** pour la gestion de l'interface
- **Utilitaires** pour les fonctions communes

### Fichiers Principaux

```
src/
├── hooks/
│   ├── useAuth.ts                  # Authentification
│   ├── useUserData.ts              # Données utilisateur
│   ├── useAnalytics.ts             # Analytics et tracking
│   ├── useWebNotifications.ts      # Notifications web
│   ├── useFCMNotifications.ts      # Notifications FCM
│   ├── usePushNotificationsSimple.ts # Notifications simplifiées
│   ├── useCookieConsent.ts         # Consentement cookies
│   ├── useLocalStorage.ts          # Stockage local
│   ├── useDebounce.ts              # Debounce
│   ├── useIntersectionObserver.ts  # Intersection Observer
│   └── useFocusManagement.ts       # Gestion du focus
├── utils/
│   ├── validation.ts               # Validation des données
│   ├── formatting.ts               # Formatage des données
│   ├── dateUtils.ts                # Utilitaires de date
│   ├── stringUtils.ts              # Utilitaires de chaînes
│   └── errorHandling.ts            # Gestion des erreurs
└── lib/
    ├── firebase.ts                 # Configuration Firebase
    └── constants.ts                # Constantes de l'application
```

### 1. Hook d'Authentification

#### useAuth.ts
```typescript
// src/hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      setError(null);
    }, (error) => {
      console.error('Erreur d\'authentification:', error);
      setError('Erreur d\'authentification');
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      setError('Erreur lors de la déconnexion');
    }
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.email?.includes('@admin.teamup.app') || false;

  return {
    user,
    loading,
    error,
    isAuthenticated,
    isAdmin,
    logout
  };
}
```

### 2. Hook de Données Utilisateur

#### useUserData.ts
```typescript
// src/hooks/useUserData.ts
import { useState, useEffect, useCallback } from 'react';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './useAuth';

interface UserData {
  email: string;
  name?: string;
  city?: string;
  bio?: string;
  avatar?: string;
  preferences?: {
    notifications: boolean;
    analytics: boolean;
    marketing: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

export function useUserData() {
  const { user } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserData = useCallback(async () => {
    if (!user) {
      setUserData(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserData({
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        });
      } else {
        // Créer le profil utilisateur s'il n'existe pas
        const newUserData: UserData = {
          email: user.email || '',
          createdAt: new Date(),
          updatedAt: new Date(),
          preferences: {
            notifications: true,
            analytics: true,
            marketing: false
          }
        };
        
        await setDoc(doc(db, 'users', user.uid), newUserData);
        setUserData(newUserData);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des données utilisateur:', error);
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const updateUserData = useCallback(async (updates: Partial<UserData>) => {
    if (!user || !userData) return;

    try {
      setError(null);
      
      const updatedData = {
        ...updates,
        updatedAt: new Date()
      };

      await updateDoc(doc(db, 'users', user.uid), updatedData);
      
      setUserData(prev => prev ? { ...prev, ...updatedData } : null);
      
      return true;
    } catch (error) {
      console.error('Erreur lors de la mise à jour des données:', error);
      setError('Erreur lors de la sauvegarde');
      return false;
    }
  }, [user, userData]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  return {
    userData,
    loading,
    error,
    updateUserData,
    refetch: fetchUserData
  };
}
```

### 3. Hook de Debounce

#### useDebounce.ts
```typescript
// src/hooks/useDebounce.ts
import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Hook pour debouncer une fonction
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  const debouncedCallback = ((...args: Parameters<T>) => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    const timer = setTimeout(() => {
      callback(...args);
    }, delay);

    setDebounceTimer(timer);
  }) as T;

  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);

  return debouncedCallback;
}
```

### 4. Hook de Local Storage

#### useLocalStorage.ts
```typescript
// src/hooks/useLocalStorage.ts
import { useState, useEffect } from 'react';

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  // État pour stocker notre valeur
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Erreur lors de la lecture de localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Fonction pour mettre à jour la valeur
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Permettre à value d'être une fonction pour avoir la même API que useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Sauvegarder dans l'état
      setStoredValue(valueToStore);
      
      // Sauvegarder dans localStorage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Erreur lors de la sauvegarde dans localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
}

// Hook pour gérer les préférences utilisateur
export function useUserPreferences() {
  const [preferences, setPreferences] = useLocalStorage('user-preferences', {
    theme: 'light',
    language: 'fr',
    notifications: true,
    analytics: true
  });

  const updatePreference = (key: string, value: any) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return {
    preferences,
    updatePreference,
    setPreferences
  };
}
```

### 5. Hook d'Intersection Observer

#### useIntersectionObserver.ts
```typescript
// src/hooks/useIntersectionObserver.ts
import { useEffect, useRef, useState } from 'react';

interface UseIntersectionObserverProps {
  threshold?: number;
  root?: Element | null;
  rootMargin?: string;
  freezeOnceVisible?: boolean;
}

export function useIntersectionObserver({
  threshold = 0,
  root = null,
  rootMargin = '0%',
  freezeOnceVisible = false
}: UseIntersectionObserverProps = {}) {
  const [entry, setEntry] = useState<IntersectionObserverEntry>();
  const [node, setNode] = useState<Element | null>(null);

  const frozen = entry?.isIntersecting && freezeOnceVisible;

  const updateEntry = ([entry]: IntersectionObserverEntry[]): void => {
    setEntry(entry);
  };

  useEffect(() => {
    const hasIOSupport = !!window.IntersectionObserver;

    if (!hasIOSupport || frozen || !node) return;

    const observerParams = { threshold, root, rootMargin };
    const observer = new IntersectionObserver(updateEntry, observerParams);

    observer.observe(node);

    return () => observer.disconnect();
  }, [node, threshold, root, rootMargin, frozen]);

  return [setNode, entry] as const;
}

// Hook pour le lazy loading
export function useLazyLoading() {
  const [isVisible, setIsVisible] = useState(false);
  const [setNode, entry] = useIntersectionObserver({
    threshold: 0.1,
    freezeOnceVisible: true
  });

  useEffect(() => {
    if (entry?.isIntersecting) {
      setIsVisible(true);
    }
  }, [entry]);

  return [setNode, isVisible] as const;
}
```

### 6. Hook de Gestion du Focus

#### useFocusManagement.ts
```typescript
// src/hooks/useFocusManagement.ts
import { useEffect, useRef, useCallback } from 'react';

export function useFocusManagement() {
  const focusRef = useRef<HTMLElement>(null);
  
  const focusElement = useCallback(() => {
    if (focusRef.current) {
      focusRef.current.focus();
    }
  }, []);
  
  const trapFocus = useCallback((container: HTMLElement) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
    
    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
      
      if (e.key === 'Escape') {
        container.blur();
      }
    };
    
    container.addEventListener('keydown', handleTabKey);
    
    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  }, []);
  
  const restoreFocus = useCallback((previousElement: HTMLElement | null) => {
    if (previousElement) {
      previousElement.focus();
    }
  }, []);
  
  return { 
    focusRef, 
    focusElement, 
    trapFocus, 
    restoreFocus 
  };
}

// Hook pour gérer le focus dans les modales
export function useModalFocus() {
  const [previousElement, setPreviousElement] = useState<HTMLElement | null>(null);
  const { trapFocus, restoreFocus } = useFocusManagement();
  
  const openModal = useCallback((modalElement: HTMLElement) => {
    setPreviousElement(document.activeElement as HTMLElement);
    trapFocus(modalElement);
  }, [trapFocus]);
  
  const closeModal = useCallback(() => {
    restoreFocus(previousElement);
    setPreviousElement(null);
  }, [restoreFocus, previousElement]);
  
  return { openModal, closeModal };
}
```

### 7. Utilitaires de Validation

#### validation.ts
```typescript
// src/utils/validation.ts
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validateField(value: any, rules: ValidationRule): ValidationResult {
  const errors: string[] = [];

  // Validation requise
  if (rules.required && (!value || value.toString().trim() === '')) {
    errors.push('Ce champ est requis');
  }

  // Validation de longueur minimale
  if (rules.minLength && value && value.toString().length < rules.minLength) {
    errors.push(`Minimum ${rules.minLength} caractères`);
  }

  // Validation de longueur maximale
  if (rules.maxLength && value && value.toString().length > rules.maxLength) {
    errors.push(`Maximum ${rules.maxLength} caractères`);
  }

  // Validation par pattern
  if (rules.pattern && value && !rules.pattern.test(value.toString())) {
    errors.push('Format invalide');
  }

  // Validation personnalisée
  if (rules.custom && value) {
    const customError = rules.custom(value);
    if (customError) {
      errors.push(customError);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validateForm(data: Record<string, any>, schema: Record<string, ValidationRule>): ValidationResult {
  const errors: string[] = [];
  const fieldErrors: Record<string, string[]> = {};

  Object.entries(schema).forEach(([field, rules]) => {
    const result = validateField(data[field], rules);
    if (!result.isValid) {
      fieldErrors[field] = result.errors;
      errors.push(...result.errors);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    fieldErrors
  };
}

// Règles de validation communes
export const validationRules = {
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    custom: (value: string) => {
      if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return 'Format d\'email invalide';
      }
      return null;
    }
  },
  password: {
    required: true,
    minLength: 6,
    custom: (value: string) => {
      if (value && value.length < 6) {
        return 'Le mot de passe doit contenir au moins 6 caractères';
      }
      return null;
    }
  },
  name: {
    required: true,
    minLength: 2,
    maxLength: 50,
    custom: (value: string) => {
      if (value && !/^[a-zA-ZÀ-ÿ\s]+$/.test(value)) {
        return 'Le nom ne peut contenir que des lettres et espaces';
      }
      return null;
    }
  },
  phone: {
    pattern: /^[0-9+\-\s()]+$/,
    custom: (value: string) => {
      if (value && !/^[0-9+\-\s()]+$/.test(value)) {
        return 'Format de téléphone invalide';
      }
      return null;
    }
  }
};
```

### 8. Utilitaires de Formatage

#### formatting.ts
```typescript
// src/utils/formatting.ts
export function formatDate(date: Date | string, format: 'short' | 'long' | 'time' = 'short'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return 'Date invalide';
  }

  const options: Intl.DateTimeFormatOptions = {
    short: {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    },
    long: {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    },
    time: {
      hour: '2-digit',
      minute: '2-digit'
    }
  };

  return dateObj.toLocaleDateString('fr-FR', options[format]);
}

export function formatDateTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return 'Date invalide';
  }

  return dateObj.toLocaleDateString('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function formatRelativeTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'À l\'instant';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `Il y a ${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''}`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `Il y a ${diffInHours} heure${diffInHours > 1 ? 's' : ''}`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `Il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`;
  }

  return formatDate(dateObj, 'short');
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('fr-FR').format(num);
}

export function formatCurrency(amount: number, currency: string = 'EUR'): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency
  }).format(amount);
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export function capitalizeFirst(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
    .replace(/[^a-z0-9\s-]/g, '') // Supprimer les caractères spéciaux
    .replace(/\s+/g, '-') // Remplacer les espaces par des tirets
    .replace(/-+/g, '-') // Supprimer les tirets multiples
    .trim();
}
```

### 9. Utilitaires de Date

#### dateUtils.ts
```typescript
// src/utils/dateUtils.ts
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

export function addYears(date: Date, years: number): Date {
  const result = new Date(date);
  result.setFullYear(result.getFullYear() + years);
  return result;
}

export function getStartOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

export function getEndOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
}

export function getStartOfWeek(date: Date): Date {
  const result = new Date(date);
  const day = result.getDay();
  const diff = result.getDate() - day + (day === 0 ? -6 : 1); // Ajuster pour lundi
  result.setDate(diff);
  return getStartOfDay(result);
}

export function getEndOfWeek(date: Date): Date {
  const startOfWeek = getStartOfWeek(date);
  return addDays(startOfWeek, 6);
}

export function getStartOfMonth(date: Date): Date {
  const result = new Date(date);
  result.setDate(1);
  return getStartOfDay(result);
}

export function getEndOfMonth(date: Date): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + 1, 0);
  return getEndOfDay(result);
}

export function isSameDay(date1: Date, date2: Date): boolean {
  return date1.getDate() === date2.getDate() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getFullYear() === date2.getFullYear();
}

export function isSameWeek(date1: Date, date2: Date): boolean {
  const startOfWeek1 = getStartOfWeek(date1);
  const startOfWeek2 = getStartOfWeek(date2);
  return isSameDay(startOfWeek1, startOfWeek2);
}

export function isSameMonth(date1: Date, date2: Date): boolean {
  return date1.getMonth() === date2.getMonth() &&
         date1.getFullYear() === date2.getFullYear();
}

export function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

export function isTomorrow(date: Date): boolean {
  return isSameDay(date, addDays(new Date(), 1));
}

export function isYesterday(date: Date): boolean {
  return isSameDay(date, addDays(new Date(), -1));
}

export function isPast(date: Date): boolean {
  return date < new Date();
}

export function isFuture(date: Date): boolean {
  return date > new Date();
}

export function getDaysBetween(date1: Date, date2: Date): number {
  const oneDay = 24 * 60 * 60 * 1000;
  return Math.round(Math.abs((date1.getTime() - date2.getTime()) / oneDay));
}

export function getHoursBetween(date1: Date, date2: Date): number {
  return Math.abs(date1.getTime() - date2.getTime()) / (1000 * 60 * 60);
}

export function formatTimeRange(startDate: Date, endDate: Date): string {
  const startTime = startDate.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  });
  
  const endTime = endDate.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  });
  
  return `${startTime} - ${endTime}`;
}
```

### 10. Utilitaires de Chaînes

#### stringUtils.ts
```typescript
// src/utils/stringUtils.ts
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Supprimer les balises HTML
    .substring(0, 1000); // Limiter la longueur
}

export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

export function unescapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#039;': "'"
  };
  
  return text.replace(/&(amp|lt|gt|quot|#039);/g, (m) => map[m]);
}

export function generateId(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
    .replace(/[^a-z0-9\s-]/g, '') // Supprimer les caractères spéciaux
    .replace(/\s+/g, '-') // Remplacer les espaces par des tirets
    .replace(/-+/g, '-') // Supprimer les tirets multiples
    .trim();
}

export function pluralize(count: number, singular: string, plural?: string): string {
  if (count === 1) return singular;
  return plural || singular + 's';
}

export function truncateWords(text: string, wordCount: number): string {
  const words = text.split(' ');
  if (words.length <= wordCount) return text;
  return words.slice(0, wordCount).join(' ') + '...';
}

export function highlightText(text: string, searchTerm: string): string {
  if (!searchTerm) return text;
  
  const regex = new RegExp(`(${escapeRegex(searchTerm)})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}

export function escapeRegex(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function extractEmails(text: string): string[] {
  const emailRegex = /[^\s@]+@[^\s@]+\.[^\s@]+/g;
  return text.match(emailRegex) || [];
}

export function extractUrls(text: string): string[] {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.match(urlRegex) || [];
}

export function maskEmail(email: string): string {
  const [localPart, domain] = email.split('@');
  if (localPart.length <= 2) return email;
  
  const maskedLocal = localPart.charAt(0) + '*'.repeat(localPart.length - 2) + localPart.charAt(localPart.length - 1);
  return `${maskedLocal}@${domain}`;
}

export function maskPhone(phone: string): string {
  if (phone.length <= 4) return phone;
  
  const visibleDigits = 4;
  const maskedLength = phone.length - visibleDigits;
  const masked = '*'.repeat(maskedLength);
  const visible = phone.slice(-visibleDigits);
  
  return masked + visible;
}
```

### 11. Gestion des Erreurs

#### errorHandling.ts
```typescript
// src/utils/errorHandling.ts
export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
}

export class CustomError extends Error {
  public code: string;
  public details?: any;
  public timestamp: Date;

  constructor(code: string, message: string, details?: any) {
    super(message);
    this.name = 'CustomError';
    this.code = code;
    this.details = details;
    this.timestamp = new Date();
  }
}

export function createError(code: string, message: string, details?: any): CustomError {
  return new CustomError(code, message, details);
}

export function handleFirebaseError(error: any): AppError {
  const errorMap: Record<string, string> = {
    'auth/user-not-found': 'Utilisateur non trouvé',
    'auth/wrong-password': 'Mot de passe incorrect',
    'auth/email-already-in-use': 'Email déjà utilisé',
    'auth/weak-password': 'Mot de passe trop faible',
    'auth/invalid-email': 'Email invalide',
    'auth/user-disabled': 'Compte désactivé',
    'auth/too-many-requests': 'Trop de tentatives, réessayez plus tard',
    'permission-denied': 'Permission refusée',
    'not-found': 'Ressource non trouvée',
    'already-exists': 'Ressource déjà existante',
    'resource-exhausted': 'Quota dépassé',
    'failed-precondition': 'Condition préalable échouée',
    'unavailable': 'Service indisponible'
  };

  const message = errorMap[error.code] || error.message || 'Une erreur est survenue';
  
  return {
    code: error.code || 'unknown',
    message,
    details: error.details,
    timestamp: new Date()
  };
}

export function handleNetworkError(error: any): AppError {
  if (error.name === 'NetworkError' || error.message.includes('network')) {
    return {
      code: 'network-error',
      message: 'Erreur de connexion réseau',
      details: error,
      timestamp: new Date()
    };
  }

  if (error.name === 'TimeoutError' || error.message.includes('timeout')) {
    return {
      code: 'timeout-error',
      message: 'Délai d\'attente dépassé',
      details: error,
      timestamp: new Date()
    };
  }

  return {
    code: 'unknown-error',
    message: 'Erreur inconnue',
    details: error,
    timestamp: new Date()
  };
}

export function logError(error: AppError, context?: string): void {
  console.error(`[${context || 'App'}] Error:`, {
    code: error.code,
    message: error.message,
    details: error.details,
    timestamp: error.timestamp,
    stack: error.details?.stack
  });

  // Envoyer à un service de monitoring (ex: Sentry)
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'exception', {
      description: error.message,
      fatal: false,
      error_code: error.code,
      context: context
    });
  }
}

export function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  return new Promise((resolve, reject) => {
    let attempts = 0;

    const attempt = () => {
      attempts++;
      
      operation()
        .then(resolve)
        .catch((error) => {
          if (attempts < maxRetries) {
            setTimeout(attempt, delay * attempts);
          } else {
            reject(error);
          }
        });
    };

    attempt();
  });
}
```

### 12. Tests des Hooks

#### Tests des Hooks
```typescript
// tests/hooks/useAuth.test.ts
import { renderHook, act } from '@testing-library/react';
import { useAuth } from '@/hooks/useAuth';

describe('useAuth', () => {
  test('should return initial state', () => {
    const { result } = renderHook(() => useAuth());
    
    expect(result.current.user).toBeNull();
    expect(result.current.loading).toBe(true);
    expect(result.current.isAuthenticated).toBe(false);
  });

  test('should handle logout', async () => {
    const { result } = renderHook(() => useAuth());
    
    await act(async () => {
      await result.current.logout();
    });
    
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });
});

// tests/hooks/useDebounce.test.ts
import { renderHook } from '@testing-library/react';
import { useDebounce } from '@/hooks/useDebounce';

describe('useDebounce', () => {
  test('should debounce value changes', async () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 100),
      { initialProps: { value: 'initial' } }
    );

    expect(result.current).toBe('initial');

    rerender({ value: 'updated' });
    expect(result.current).toBe('initial'); // Pas encore mis à jour

    await new Promise(resolve => setTimeout(resolve, 150));
    expect(result.current).toBe('updated'); // Maintenant mis à jour
  });
});
```

### 13. Améliorations Futures

#### Hooks à Ajouter
- [ ] **useInfiniteScroll** : Scroll infini
- [ ] **useVirtualization** : Virtualisation de listes
- [ ] **useWebSocket** : Connexion WebSocket
- [ ] **useGeolocation** : Géolocalisation
- [ ] **useMediaQuery** : Media queries
- [ ] **useClipboard** : Gestion du presse-papiers
- [ ] **useFullscreen** : Mode plein écran
- [ ] **useSpeechRecognition** : Reconnaissance vocale
