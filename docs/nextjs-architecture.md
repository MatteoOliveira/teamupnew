# 🏗️ Architecture Next.js et Structure Technique

## 📝 Description Simple

L'application TeamUp est construite avec Next.js 15, un framework React moderne qui permet de créer des applications web rapides et optimisées. L'architecture utilise des composants réutilisables, des hooks personnalisés, et une base de données Firebase pour stocker les données.

## 🔧 Description Technique

### Architecture Générale

L'application suit une architecture **moderne et scalable** basée sur :
- **Next.js 15** avec App Router
- **React 18** avec hooks et composants fonctionnels
- **TypeScript** pour la sécurité des types
- **Firebase** pour l'authentification et la base de données
- **Tailwind CSS** pour le styling
- **PWA** pour l'expérience mobile

### Structure du Projet

```
teamupnew/
├── src/
│   ├── app/                          # Pages Next.js App Router
│   │   ├── layout.tsx               # Layout principal
│   │   ├── page.tsx                  # Page d'accueil
│   │   ├── login/page.tsx           # Page de connexion
│   │   ├── register/page.tsx         # Page d'inscription
│   │   ├── profile/page.tsx          # Page de profil utilisateur
│   │   ├── event-create/page.tsx    # Création d'événement
│   │   ├── event/[id]/page.tsx      # Détails d'événement
│   │   ├── event-edit/[id]/page.tsx # Modification d'événement
│   │   ├── reservation/page.tsx     # Réservation d'événements
│   │   ├── privacy/page.tsx         # Politique de confidentialité
│   │   ├── legal/page.tsx           # Mentions légales
│   │   └── contact/page.tsx         # Page de contact
│   ├── components/                   # Composants React réutilisables
│   │   ├── Header.tsx               # En-tête de navigation
│   │   ├── NavBar.tsx               # Barre de navigation mobile
│   │   ├── Footer.tsx               # Pied de page
│   │   ├── Button.tsx               # Composant bouton
│   │   ├── Input.tsx                # Composant input
│   │   ├── Map.tsx                  # Composant carte interactive
│   │   ├── EventCard.tsx            # Carte d'événement
│   │   ├── PushNotificationManager.tsx # Gestionnaire de notifications
│   │   ├── CookieBanner.tsx         # Banner de cookies RGPD
│   │   ├── DataViewer.tsx           # Visualiseur de données RGPD
│   │   ├── DataEditor.tsx           # Éditeur de données RGPD
│   │   ├── DataExporter.tsx         # Exporteur de données RGPD
│   │   ├── DataPreferences.tsx      # Préférences de données RGPD
│   │   └── GoogleAnalytics.tsx      # Analytics conditionnel
│   ├── hooks/                        # Hooks React personnalisés
│   │   ├── useAuth.ts               # Hook d'authentification
│   │   ├── useUserData.ts           # Hook de données utilisateur
│   │   ├── useAnalytics.ts          # Hook d'analytics
│   │   ├── useWebNotifications.ts   # Hook de notifications web
│   │   ├── useFCMNotifications.ts   # Hook de notifications FCM
│   │   ├── usePushNotificationsSimple.ts # Hook de notifications simplifié
│   │   └── useCookieConsent.ts      # Hook de consentement cookies
│   ├── lib/                          # Configuration et utilitaires
│   │   ├── firebase.ts              # Configuration Firebase
│   │   ├── serviceWorker.ts         # Configuration service worker
│   │   └── validation.ts            # Fonctions de validation
│   └── types/                        # Définitions TypeScript
│       ├── auth.ts                  # Types d'authentification
│       ├── event.ts                 # Types d'événements
│       └── stats.ts                 # Types de statistiques
├── public/                           # Assets statiques
│   ├── icon-192x192.webp           # Icône PWA
│   ├── icon-512x512.webp           # Icône PWA
│   ├── manifest.json               # Manifeste PWA
│   ├── firebase-messaging-sw.js    # Service worker FCM
│   └── sw-minimal.js               # Service worker minimal
├── docs/                            # Documentation technique
├── next.config.js                   # Configuration Next.js
├── tailwind.config.js               # Configuration Tailwind
├── tsconfig.json                    # Configuration TypeScript
└── package.json                     # Dépendances et scripts
```

### 1. Configuration Next.js

#### next.config.js
```javascript
// next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: false,
  buildExcludes: [/middleware-manifest\.json$/, /build-manifest\.json$/],
  publicExcludes: ['!robots.txt', '!sitemap.xml'],
  sw: 'firebase-messaging-sw.js', // Service worker FCM
  runtimeCaching: [
    {
      urlPattern: /^https?.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'offlineCache',
        expiration: { maxEntries: 50 }
      }
    }
  ]
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuration pour Next.js 15
  output: 'standalone',
  images: {
    domains: ['teamup-fawn.vercel.app'],
    unoptimized: true, // Pour éviter les problèmes avec Vercel
  },
  experimental: {
    esmExternals: true,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // Optimisation du code splitting
      config.optimization.splitChunks = {
        chunks: 'all',
        minSize: 20000,
        maxSize: 100000,
        cacheGroups: {
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            name: 'react',
            priority: 20,
            chunks: 'all',
          },
          firebase: {
            test: /[\\/]node_modules[\\/]firebase[\\/]/,
            name: 'firebase',
            priority: 15,
            chunks: 'all',
          },
          leaflet: {
            test: /[\\/]node_modules[\\/]leaflet[\\/]/,
            name: 'leaflet',
            priority: 15,
            chunks: 'all',
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: -10,
            chunks: 'all',
            maxSize: 50000,
          }
        }
      };
    }
    return config;
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups',
          },
        ],
      },
    ];
  },
};

module.exports = withPWA(nextConfig);
```

### 2. App Router Structure

#### Layout Principal
```typescript
// src/app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NavBar from '@/components/NavBar';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import GoogleAnalytics from '@/components/GoogleAnalytics';
import CookieBanner from '@/components/CookieBanner';
import WebNotificationsProvider from '@/components/WebNotificationsProvider';

export const metadata: Metadata = {
  title: "TeamUp - Réservation de créneaux sportifs",
  description: "Réservez des créneaux sportifs localement et rejoignez une communauté de passionnés de sport.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "TeamUp",
  },
  icons: {
    icon: [
      { url: "/icon-192x192.webp", sizes: "192x192", type: "image/webp" },
      { url: "/icon-512x512.webp", sizes: "512x512", type: "image/webp" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        {/* Métadonnées PWA */}
        <meta name="application-name" content="TeamUp" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="TeamUp" />
        <meta name="description" content="Réservez des créneaux sportifs localement" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#3b82f6" />

        {/* Optimisations de performance */}
        <link rel="dns-prefetch" href="//tile.openstreetmap.org" />
        <link rel="preconnect" href="https://a.tile.openstreetmap.org" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://firebase.googleapis.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.googletagmanager.com" crossOrigin="anonymous" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Header />
        <main className="min-h-screen pb-20">
          {children}
        </main>
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 h-16 shadow-md">
          <NavBar />
        </nav>
        <Footer />
        <CookieBanner />
        <GoogleAnalytics />
        <WebNotificationsProvider />
      </body>
    </html>
  );
}
```

### 3. Système de Composants

#### Composant Button Réutilisable
```typescript
// src/components/Button.tsx
interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  className?: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
}

export default function Button({
  children,
  onClick,
  type = 'button',
  disabled = false,
  className = '',
  variant = 'primary',
  size = 'md'
}: ButtonProps) {
  const baseClasses = 'font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={classes}
    >
      {children}
    </button>
  );
}
```

#### Composant Input Réutilisable
```typescript
// src/components/Input.tsx
interface InputProps {
  label: string;
  type: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
}

export default function Input({
  label,
  type,
  value,
  onChange,
  required = false,
  placeholder = '',
  error = '',
  disabled = false
}: InputProps) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          error ? 'border-red-500' : 'border-gray-300'
        } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
```

### 4. Système de Hooks

#### Hook d'Authentification
```typescript
// src/hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return { user, loading };
}
```

#### Hook de Données Utilisateur
```typescript
// src/hooks/useUserData.ts
import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export function useUserData(userId: string | null) {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setUserData(null);
      setLoading(false);
      return;
    }

    const fetchUserData = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        }
      } catch (error) {
        setError('Erreur lors du chargement des données utilisateur');
        console.error('Erreur useUserData:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  return { userData, loading, error };
}
```

### 5. Configuration TypeScript

#### tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "ES6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### 6. Configuration Tailwind CSS

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
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        sport: {
          football: '#10b981',
          basketball: '#f97316',
          tennis: '#eab308',
          swimming: '#06b6d4',
          running: '#ef4444',
        }
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
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
      },
    },
  },
  plugins: [],
};
```

### 7. Optimisations Performance

#### Lazy Loading des Composants
```typescript
// src/components/LazyMap.tsx
import dynamic from 'next/dynamic';

const Map = dynamic(() => import('./Map'), {
  ssr: false,
  loading: () => <div className="h-64 bg-gray-200 animate-pulse rounded-lg" />
});

export default Map;
```

#### Code Splitting Automatique
```typescript
// src/app/profile/page.tsx
import { lazy, Suspense } from 'react';

const StatsChart = lazy(() => import('@/components/StatsChart'));
const AdvancedMetrics = lazy(() => import('@/components/AdvancedMetrics'));

export default function ProfilePage() {
  return (
    <div>
      <Suspense fallback={<div>Chargement des statistiques...</div>}>
        <StatsChart />
      </Suspense>
    </div>
  );
}
```

#### Optimisation des Images
```typescript
// src/components/OptimizedImage.tsx
import Image from 'next/image';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
}

export default function OptimizedImage({ src, alt, width, height, className }: OptimizedImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority={false}
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
    />
  );
}
```

### 8. Gestion des Erreurs

#### Error Boundary
```typescript
// src/components/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="mt-4 text-center">
              <h3 className="text-lg font-medium text-gray-900">Une erreur est survenue</h3>
              <p className="mt-2 text-sm text-gray-500">
                Désolé, quelque chose s'est mal passé. Veuillez recharger la page.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Recharger la page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### 9. Tests et Qualité

#### Configuration ESLint
```json
// .eslintrc.json
{
  "extends": [
    "next/core-web-vitals",
    "@typescript-eslint/recommended"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn",
    "react-hooks/exhaustive-deps": "warn",
    "prefer-const": "error",
    "no-var": "error"
  }
}
```

#### Scripts Package.json
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

### 10. Déploiement et CI/CD

#### Configuration Vercel
```json
// vercel.json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "env": {
    "NEXT_PUBLIC_FIREBASE_API_KEY": "@firebase_api_key",
    "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN": "@firebase_auth_domain",
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID": "@firebase_project_id",
    "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET": "@firebase_storage_bucket",
    "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID": "@firebase_messaging_sender_id",
    "NEXT_PUBLIC_FIREBASE_APP_ID": "@firebase_app_id",
    "NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID": "@firebase_measurement_id",
    "NEXT_PUBLIC_FIREBASE_VAPID_KEY": "@firebase_vapid_key",
    "FIREBASE_SERVER_KEY": "@firebase_server_key"
  }
}
```

### 11. Monitoring et Analytics

#### Configuration Analytics
```typescript
// src/lib/analytics.ts
export const trackEvent = (eventName: string, parameters?: any) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, parameters);
  }
};

export const trackPageView = (url: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', 'G-XP9K67C013', {
      page_path: url,
    });
  }
};
```

### 12. Améliorations Futures

#### Optimisations à Implémenter
- [ ] Server-Side Rendering (SSR) pour les pages publiques
- [ ] Static Site Generation (SSG) pour les pages statiques
- [ ] Incremental Static Regeneration (ISR) pour les événements
- [ ] Edge Functions pour les API
- [ ] Middleware pour l'authentification
- [ ] Cache Redis pour les données fréquentes
- [ ] CDN pour les assets statiques
- [ ] Compression Brotli
- [ ] Preloading des routes critiques
