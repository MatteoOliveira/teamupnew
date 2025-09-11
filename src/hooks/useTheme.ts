'use client';

import { useState, useEffect } from 'react';

export type Theme = 'light' | 'dark';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  // Charger le thème depuis localStorage au montage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('theme');
      if (stored === 'dark' || stored === 'light') {
        setTheme(stored as Theme);
      } else {
        // Par défaut, toujours en mode clair
        setTheme('light');
      }
      setMounted(true);
    }
  }, []);

  // Appliquer le thème au document
  useEffect(() => {
    if (mounted && typeof window !== 'undefined') {
      const root = document.documentElement;
      
      if (theme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [theme, mounted]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', newTheme);
    }
  };

  const setThemeMode = (newTheme: Theme) => {
    setTheme(newTheme);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', newTheme);
    }
  };

  return {
    theme,
    toggleTheme,
    setTheme: setThemeMode,
    mounted
  };
}
