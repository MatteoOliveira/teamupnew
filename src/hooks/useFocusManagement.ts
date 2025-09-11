import { useEffect, useRef, useCallback, useState } from 'react';

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
  
  const openModal = useCallback(() => {
    setPreviousElement(document.activeElement as HTMLElement);
  }, []);
  
  const closeModal = useCallback(() => {
    restoreFocus(previousElement);
    setPreviousElement(null);
  }, [previousElement, restoreFocus]);
  
  return {
    openModal,
    closeModal,
    trapFocus
  };
}

// Hook pour la navigation au clavier
export function useKeyboardNavigation() {
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);
  
  const handleKeyDown = useCallback((e: KeyboardEvent, items: HTMLElement[]) => {
    if (!isNavigating) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => (prev + 1) % items.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => (prev - 1 + items.length) % items.length);
        break;
      case 'Home':
        e.preventDefault();
        setFocusedIndex(0);
        break;
      case 'End':
        e.preventDefault();
        setFocusedIndex(items.length - 1);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        items[focusedIndex]?.click();
        break;
      case 'Escape':
        setIsNavigating(false);
        break;
    }
  }, [focusedIndex, isNavigating]);
  
  const startNavigation = useCallback(() => {
    setIsNavigating(true);
  }, []);
  
  const stopNavigation = useCallback(() => {
    setIsNavigating(false);
  }, []);
  
  // Focus sur l'élément actuel
  useEffect(() => {
    if (isNavigating) {
      const items = document.querySelectorAll('[data-navigation-item]');
      const currentItem = items[focusedIndex] as HTMLElement;
      if (currentItem) {
        currentItem.focus();
      }
    }
  }, [focusedIndex, isNavigating]);
  
  return {
    focusedIndex,
    isNavigating,
    handleKeyDown,
    startNavigation,
    stopNavigation,
    setFocusedIndex
  };
}

// Hook pour les annonces d'écran
export function useScreenReader() {
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    // Supprimer l'annonce après 1 seconde
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }, []);
  
  return { announce };
}
