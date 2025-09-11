'use client';

import { useTheme } from '@/hooks/useTheme';

export default function ThemeToggle() {
  const { theme, toggleTheme, mounted } = useTheme();

  // Éviter l'hydratation mismatch
  if (!mounted) {
    return (
      <div className="flex items-center space-x-3">
        <div className="w-4 h-4 bg-gray-300 rounded animate-pulse"></div>
        <span className="text-gray-400 animate-pulse">Chargement...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-3">
      <button
        onClick={toggleTheme}
        className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
        role="switch"
        aria-checked={theme === 'dark'}
        aria-label={`Basculer vers le mode ${theme === 'light' ? 'sombre' : 'clair'}`}
      >
        <span
          className={`${
            theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
          } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
        />
        <span
          className={`${
            theme === 'dark' ? 'bg-purple-600' : 'bg-gray-200'
          } absolute inset-0 rounded-full transition-colors`}
        />
      </button>
      
      <div className="flex items-center space-x-2">
        <span className={`text-sm ${theme === 'light' ? 'text-gray-900' : 'text-gray-300'}`}>
          {theme === 'light' ? '☀️' : '🌙'}
        </span>
        <span className={`text-sm font-medium ${theme === 'light' ? 'text-gray-900' : 'text-gray-300'}`}>
          {theme === 'light' ? 'Mode clair' : 'Mode sombre'}
        </span>
      </div>
    </div>
  );
}
