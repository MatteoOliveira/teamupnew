# 🎨 Design Responsive et Expérience Utilisateur

## 📝 Description Simple

Le design de TeamUp est optimisé pour tous les appareils (mobile, tablette, desktop) avec une interface intuitive et moderne. L'application utilise des couleurs cohérentes, des animations fluides, et une navigation claire pour offrir la meilleure expérience utilisateur possible.

## 🔧 Description Technique

### Architecture Design

L'application utilise une approche **mobile-first** avec :
- **Tailwind CSS** pour le styling
- **Design System** cohérent
- **Responsive Design** adaptatif
- **Accessibilité** intégrée
- **Performance** optimisée

### Fichiers Design Principaux

```
src/
├── app/
│   └── globals.css                 # Styles globaux
├── components/
│   ├── Header.tsx                 # En-tête responsive
│   ├── NavBar.tsx                 # Navigation mobile
│   ├── Footer.tsx                 # Pied de page
│   ├── Button.tsx                 # Composant bouton
│   ├── Input.tsx                  # Composant input
│   └── EventCard.tsx              # Carte d'événement
├── tailwind.config.js             # Configuration Tailwind
└── public/
    ├── icon-192x192.webp          # Icônes PWA
    └── icon-512x512.webp
```

### 1. Configuration Tailwind CSS

#### tailwind.config.js
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        sport: {
          football: '#10b981',
          basketball: '#f97316',
          tennis: '#eab308',
          swimming: '#06b6d4',
          running: '#ef4444',
          cycling: '#8b5cf6',
          volleyball: '#ec4899',
          badminton: '#6366f1',
        },
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        }
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'medium': '0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'strong': '0 10px 40px -10px rgba(0, 0, 0, 0.15), 0 2px 10px -2px rgba(0, 0, 0, 0.05)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'slide-left': 'slideLeft 0.3s ease-out',
        'slide-right': 'slideRight 0.3s ease-out',
        'bounce-soft': 'bounceSoft 0.6s ease-in-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideLeft: {
          '0%': { transform: 'translateX(10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideRight: {
          '0%': { transform: 'translateX(-10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        bounceSoft: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
      },
      screens: {
        'xs': '475px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
};
```

### 2. Styles Globaux

#### globals.css
```css
/* src/app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    font-family: var(--font-geist-sans), system-ui, sans-serif;
    scroll-behavior: smooth;
  }
  
  body {
    @apply bg-gray-50 text-gray-900 antialiased;
    font-feature-settings: 'rlig' 1, 'calt' 1;
  }
  
  * {
    @apply border-gray-200;
  }
  
  /* Focus styles */
  *:focus {
    @apply outline-none ring-2 ring-blue-500 ring-offset-2;
  }
  
  /* Selection styles */
  ::selection {
    @apply bg-blue-100 text-blue-900;
  }
  
  /* Scrollbar styles */
  ::-webkit-scrollbar {
    @apply w-2;
  }
  
  ::-webkit-scrollbar-track {
    @apply bg-gray-100;
  }
  
  ::-webkit-scrollbar-thumb {
    @apply bg-gray-300 rounded-full;
  }
  
  ::-webkit-scrollbar-thumb:hover {
    @apply bg-gray-400;
  }
}

@layer components {
  /* Button variants */
  .btn-primary {
    @apply bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200;
  }
  
  .btn-secondary {
    @apply bg-gray-200 text-gray-900 px-4 py-2 rounded-md font-medium hover:bg-gray-300 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200;
  }
  
  .btn-danger {
    @apply bg-red-600 text-white px-4 py-2 rounded-md font-medium hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200;
  }
  
  .btn-success {
    @apply bg-green-600 text-white px-4 py-2 rounded-md font-medium hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200;
  }
  
  /* Input styles */
  .input-primary {
    @apply w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200;
  }
  
  .input-error {
    @apply border-red-500 focus:ring-red-500 focus:border-red-500;
  }
  
  /* Card styles */
  .card {
    @apply bg-white rounded-lg shadow-soft border border-gray-200;
  }
  
  .card-hover {
    @apply hover:shadow-medium transition-shadow duration-200;
  }
  
  /* Sport color classes */
  .sport-football { @apply bg-sport-football; }
  .sport-basketball { @apply bg-sport-basketball; }
  .sport-tennis { @apply bg-sport-tennis; }
  .sport-swimming { @apply bg-sport-swimming; }
  .sport-running { @apply bg-sport-running; }
  .sport-cycling { @apply bg-sport-cycling; }
  .sport-volleyball { @apply bg-sport-volleyball; }
  .sport-badminton { @apply bg-sport-badminton; }
}

@layer utilities {
  /* Text utilities */
  .text-balance {
    text-wrap: balance;
  }
  
  .text-pretty {
    text-wrap: pretty;
  }
  
  /* Animation utilities */
  .animate-in {
    @apply animate-fade-in;
  }
  
  .animate-up {
    @apply animate-slide-up;
  }
  
  .animate-down {
    @apply animate-slide-down;
  }
  
  /* Layout utilities */
  .container-padding {
    @apply px-4 sm:px-6 lg:px-8;
  }
  
  .section-spacing {
    @apply py-8 sm:py-12 lg:py-16;
  }
  
  /* Responsive utilities */
  .mobile-only {
    @apply block sm:hidden;
  }
  
  .desktop-only {
    @apply hidden sm:block;
  }
  
  .tablet-up {
    @apply hidden md:block;
  }
  
  .mobile-tablet {
    @apply block md:hidden;
  }
}
```

### 3. Composant Header Responsive

#### Header.tsx
```typescript
// src/components/Header.tsx
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

export default function Header() {
  const { user, loading } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-soft border-b border-gray-200 sticky top-0 z-40">
      <div className="container-padding">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">T</span>
            </div>
            <span className="font-bold text-xl text-gray-900 hidden sm:block">
              TeamUp
            </span>
          </Link>

          {/* Navigation Desktop */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors duration-200"
            >
              Accueil
            </Link>
            <Link
              href="/reservation"
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors duration-200"
            >
              Réservations
            </Link>
            {user && (
              <Link
                href="/profile"
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors duration-200"
              >
                Profil
              </Link>
            )}
          </nav>

          {/* Actions Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            {loading ? (
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
            ) : user ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600">
                  {user.email}
                </span>
                <button
                  onClick={() => signOut()}
                  className="btn-secondary text-sm"
                >
                  Déconnexion
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link href="/login" className="btn-secondary text-sm">
                  Connexion
                </Link>
                <Link href="/register" className="btn-primary text-sm">
                  Inscription
                </Link>
              </div>
            )}
          </div>

          {/* Menu Mobile */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Menu Mobile Dropdown */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4 animate-down">
            <nav className="flex flex-col space-y-4">
              <Link
                href="/"
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Accueil
              </Link>
              <Link
                href="/reservation"
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Réservations
              </Link>
              {user && (
                <Link
                  href="/profile"
                  className="text-gray-600 hover:text-gray-900 font-medium transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profil
                </Link>
              )}
            </nav>
            
            <div className="mt-6 pt-6 border-t border-gray-200">
              {user ? (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">{user.email}</p>
                  <button
                    onClick={() => {
                      signOut();
                      setIsMenuOpen(false);
                    }}
                    className="btn-secondary w-full"
                  >
                    Déconnexion
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Link
                    href="/login"
                    className="btn-secondary w-full block text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Connexion
                  </Link>
                  <Link
                    href="/register"
                    className="btn-primary w-full block text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Inscription
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
```

### 4. Navigation Mobile (Bottom Bar)

#### NavBar.tsx
```typescript
// src/components/NavBar.tsx
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function NavBar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const navItems = [
    {
      href: '/',
      label: 'Accueil',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    {
      href: '/reservation',
      label: 'Réservations',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      href: '/event-create',
      label: 'Créer',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      )
    },
    {
      href: user ? '/profile' : '/login',
      label: 'Profil',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    }
  ];

  return (
    <nav className="flex items-center justify-around h-16 bg-white border-t border-gray-200">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center space-y-1 px-3 py-2 rounded-lg transition-colors duration-200 ${
              isActive
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <div className={`transition-transform duration-200 ${isActive ? 'scale-110' : ''}`}>
              {item.icon}
            </div>
            <span className="text-xs font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
```

### 5. Composant EventCard Responsive

#### EventCard.tsx
```typescript
// src/components/EventCard.tsx
import Link from 'next/link';
import { Event } from '@/types/event';

interface EventCardProps {
  event: Event;
  showActions?: boolean;
}

export default function EventCard({ event, showActions = true }: EventCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSportColor = (sport: string) => {
    const colors: Record<string, string> = {
      'Football': 'bg-green-500',
      'Basketball': 'bg-orange-500',
      'Tennis': 'bg-yellow-500',
      'Natation': 'bg-blue-500',
      'Course': 'bg-red-500',
      'Cyclisme': 'bg-purple-500',
      'Volleyball': 'bg-pink-500',
      'Badminton': 'bg-indigo-500'
    };
    return colors[sport] || 'bg-gray-500';
  };

  return (
    <div className="card card-hover animate-up">
      <Link href={`/event/${event.id}`} className="block">
        <div className="p-4 sm:p-6">
          {/* Header avec sport et date */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className={`w-12 h-12 ${getSportColor(event.sport)} rounded-lg flex items-center justify-center`}>
                <span className="text-2xl">{event.sportEmoji}</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-lg leading-tight">
                  {event.name}
                </h3>
                <p className="text-sm text-gray-600">{event.sport}</p>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                {formatDate(event.date)}
              </p>
              <p className="text-xs text-gray-500">
                {event.city}
              </p>
            </div>
          </div>

          {/* Description */}
          {event.description && (
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
              {event.description}
            </p>
          )}

          {/* Informations supplémentaires */}
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{event.location}</span>
              </div>
              
              <div className="flex items-center space-x-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                <span>{event.maxParticipants} participants</span>
              </div>
            </div>
            
            {event.isReserved && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                Réservé
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Actions (si activées) */}
      {showActions && (
        <div className="px-4 sm:px-6 pb-4 sm:pb-6">
          <div className="flex space-x-3">
            <Link
              href={`/event/${event.id}`}
              className="flex-1 btn-primary text-center"
            >
              Voir détails
            </Link>
            {!event.isReserved && (
              <button className="btn-secondary">
                Rejoindre
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
```

### 6. Composant Button Réutilisable

#### Button.tsx
```typescript
// src/components/Button.tsx
import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    children, 
    variant = 'primary', 
    size = 'md', 
    loading = false, 
    fullWidth = false,
    className = '',
    disabled,
    ...props 
  }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variantClasses = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
      secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
      danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
      success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
      ghost: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:ring-gray-500'
    };
    
    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg'
    };
    
    const widthClasses = fullWidth ? 'w-full' : '';
    
    const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClasses} ${className}`;
    
    return (
      <button
        ref={ref}
        className={classes}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
```

### 7. Composant Input Réutilisable

#### Input.tsx
```typescript
// src/components/Input.tsx
import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ 
    label, 
    error, 
    helperText, 
    leftIcon, 
    rightIcon, 
    className = '', 
    ...props 
  }, ref) => {
    const baseClasses = 'w-full px-3 py-2 border rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0';
    const errorClasses = error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500';
    const iconClasses = leftIcon ? 'pl-10' : rightIcon ? 'pr-10' : '';
    
    const classes = `${baseClasses} ${errorClasses} ${iconClasses} ${className}`;
    
    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <div className="h-5 w-5 text-gray-400">
                {leftIcon}
              </div>
            </div>
          )}
          
          <input
            ref={ref}
            className={classes}
            {...props}
          />
          
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <div className="h-5 w-5 text-gray-400">
                {rightIcon}
              </div>
            </div>
          )}
        </div>
        
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
        
        {helperText && !error && (
          <p className="text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
```

### 8. Responsive Design Patterns

#### Breakpoints et Media Queries
```css
/* src/app/globals.css */
@layer utilities {
  /* Mobile First Approach */
  .mobile-first {
    @apply text-sm;
  }
  
  @screen sm {
    .mobile-first {
      @apply text-base;
    }
  }
  
  @screen md {
    .mobile-first {
      @apply text-lg;
    }
  }
  
  @screen lg {
    .mobile-first {
      @apply text-xl;
    }
  }
  
  /* Responsive Grid */
  .responsive-grid {
    @apply grid grid-cols-1 gap-4;
  }
  
  @screen sm {
    .responsive-grid {
      @apply grid-cols-2;
    }
  }
  
  @screen md {
    .responsive-grid {
      @apply grid-cols-3;
    }
  }
  
  @screen lg {
    .responsive-grid {
      @apply grid-cols-4;
    }
  }
  
  /* Responsive Typography */
  .responsive-heading {
    @apply text-2xl font-bold;
  }
  
  @screen sm {
    .responsive-heading {
      @apply text-3xl;
    }
  }
  
  @screen md {
    .responsive-heading {
      @apply text-4xl;
    }
  }
  
  @screen lg {
    .responsive-heading {
      @apply text-5xl;
    }
  }
}
```

### 9. Accessibilité

#### Composant Accessible
```typescript
// src/components/AccessibleButton.tsx
import { ButtonHTMLAttributes, forwardRef } from 'react';

interface AccessibleButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  'aria-label'?: string;
  'aria-describedby'?: string;
  'aria-expanded'?: boolean;
  'aria-pressed'?: boolean;
}

const AccessibleButton = forwardRef<HTMLButtonElement, AccessibleButtonProps>(
  ({ children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className="btn-primary"
        {...props}
      >
        {children}
      </button>
    );
  }
);

AccessibleButton.displayName = 'AccessibleButton';

export default AccessibleButton;
```

#### Focus Management
```typescript
// src/hooks/useFocusManagement.ts
import { useEffect, useRef } from 'react';

export function useFocusManagement() {
  const focusRef = useRef<HTMLElement>(null);
  
  const focusElement = () => {
    if (focusRef.current) {
      focusRef.current.focus();
    }
  };
  
  const trapFocus = (container: HTMLElement) => {
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
    };
    
    container.addEventListener('keydown', handleTabKey);
    
    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  };
  
  return { focusRef, focusElement, trapFocus };
}
```

### 10. Animations et Transitions

#### Composant Animated
```typescript
// src/components/Animated.tsx
import { ReactNode } from 'react';

interface AnimatedProps {
  children: ReactNode;
  animation?: 'fade-in' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right';
  delay?: number;
  duration?: number;
}

export default function Animated({ 
  children, 
  animation = 'fade-in', 
  delay = 0, 
  duration = 300 
}: AnimatedProps) {
  const animationClasses = {
    'fade-in': 'animate-fade-in',
    'slide-up': 'animate-slide-up',
    'slide-down': 'animate-slide-down',
    'slide-left': 'animate-slide-left',
    'slide-right': 'animate-slide-right'
  };
  
  return (
    <div
      className={animationClasses[animation]}
      style={{
        animationDelay: `${delay}ms`,
        animationDuration: `${duration}ms`
      }}
    >
      {children}
    </div>
  );
}
```

### 11. Tests de Responsive Design

#### Tests Playwright
```typescript
// tests/responsive.test.ts
import { test, expect } from '@playwright/test';

test('Mobile layout', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/');
  
  // Vérifier que la navigation mobile est visible
  await expect(page.locator('[data-testid="mobile-nav"]')).toBeVisible();
  
  // Vérifier que la navigation desktop est cachée
  await expect(page.locator('[data-testid="desktop-nav"]')).toBeHidden();
});

test('Tablet layout', async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.goto('/');
  
  // Vérifier que les éléments s'adaptent
  await expect(page.locator('[data-testid="event-grid"]')).toHaveClass(/grid-cols-2/);
});

test('Desktop layout', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto('/');
  
  // Vérifier que la navigation desktop est visible
  await expect(page.locator('[data-testid="desktop-nav"]')).toBeVisible();
  
  // Vérifier que la navigation mobile est cachée
  await expect(page.locator('[data-testid="mobile-nav"]')).toBeHidden();
});
```

### 12. Améliorations Futures

#### Fonctionnalités Design à Ajouter
- [ ] **Dark Mode** : Mode sombre/clair
- [ ] **Thèmes personnalisés** : Couleurs personnalisables
- [ ] **Animations avancées** : Micro-interactions
- [ ] **Gestures** : Navigation par gestes
- [ ] **Haptic Feedback** : Retour tactile
- [ ] **Voice Navigation** : Navigation vocale
- [ ] **Accessibility** : Améliorations d'accessibilité
- [ ] **Internationalization** : Support multilingue
