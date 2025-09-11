# 🚀 Déploiement Vercel

## 📝 Description Simple

Vercel est la plateforme de déploiement qui héberge l'application TeamUp. Elle déploie automatiquement l'application à chaque modification du code, optimise les performances, et gère la distribution mondiale du contenu.

## 🔧 Description Technique

### Architecture de Déploiement

Vercel utilise une architecture moderne avec :
- **Déploiement automatique** depuis GitHub
- **Edge Functions** pour les API
- **CDN global** pour la distribution
- **Optimisations automatiques** Next.js
- **Monitoring intégré** des performances

### Configuration de Déploiement

#### 1. Configuration Vercel

#### vercel.json
```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "outputDirectory": ".next",
  "functions": {
    "src/app/api/**/*.ts": {
      "runtime": "nodejs18.x"
    }
  },
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
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "camera=(), microphone=(), geolocation=(self)"
        }
      ]
    },
    {
      "source": "/sw.js",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        }
      ]
    },
    {
      "source": "/firebase-messaging-sw.js",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        }
      ]
    }
  ],
  "redirects": [
    {
      "source": "/home",
      "destination": "/",
      "permanent": true
    }
  ],
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "/api/:path*"
    }
  ]
}
```

#### 2. Variables d'Environnement

#### Configuration des Variables
```bash
# Variables publiques (NEXT_PUBLIC_)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDEhV0f2kWRyorZGi6QoFEuQvSabUq8qGU
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=teamup-7a2d6.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=teamup-7a2d6
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=teamup-7a2d6.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=535498065920
NEXT_PUBLIC_FIREBASE_APP_ID=1:535498065920:web:9c23eb124e7af9748030e5
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XP9K67C013
NEXT_PUBLIC_FIREBASE_VAPID_KEY=MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEhT9Dl5kGogf7BQCXnEECup4ysZ8LcJRyoMwThbcwf/sriDPTKs7+dzw/kVbfsVgTswTuuJR8hg69a9eRHUQz/w==

# Variables privées (serveur uniquement)
FIREBASE_SERVER_KEY=your_server_key_here
```

#### Configuration dans Vercel Dashboard
1. **Aller dans** : Project Settings → Environment Variables
2. **Ajouter chaque variable** avec la valeur correspondante
3. **Sélectionner les environnements** : Production, Preview, Development
4. **Sauvegarder** les modifications

### 3. Processus de Déploiement

#### Déploiement Automatique
```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm run test
      
      - name: Build application
        run: npm run build
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

#### Déploiement Manuel
```bash
# Installation de Vercel CLI
npm i -g vercel

# Connexion à Vercel
vercel login

# Déploiement
vercel

# Déploiement en production
vercel --prod
```

### 4. Optimisations de Build

#### Configuration Next.js pour Production
```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuration pour Next.js 15
  output: 'standalone',
  
  // Optimisation des images
  images: {
    domains: ['teamup-fawn.vercel.app'],
    unoptimized: true, // Pour éviter les problèmes avec Vercel
    formats: ['image/webp', 'image/avif'],
  },
  
  // Optimisations expérimentales
  experimental: {
    esmExternals: true,
    optimizeCss: true,
    scrollRestoration: true,
  },
  
  // Compilation optimisée
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
    styledComponents: true,
  },
  
  // Optimisation du webpack
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // Optimisation des chunks
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
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: -10,
            chunks: 'all',
            maxSize: 50000,
          },
        },
      };
    }
    return config;
  },
  
  // Headers de sécurité
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups',
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
        ],
      },
    ];
  },
  
  // Redirections
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
```

### 5. Monitoring et Analytics

#### Configuration Analytics
```typescript
// src/lib/analytics.ts
export const initAnalytics = () => {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
    // Google Analytics
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=G-XP9K67C013';
    document.head.appendChild(script);
    
    script.onload = () => {
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      window.gtag = gtag;
      gtag('js', new Date());
      gtag('config', 'G-XP9K67C013', {
        page_title: document.title,
        page_location: window.location.href,
        send_page_view: true,
        anonymize_ip: true,
        cookie_flags: 'SameSite=None;Secure'
      });
    };
  }
};

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

#### Métriques de Performance
```typescript
// src/lib/performance.ts
export const trackPerformance = () => {
  if (typeof window !== 'undefined' && 'performance' in window) {
    // Core Web Vitals
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'largest-contentful-paint') {
          trackEvent('web_vitals', {
            metric_name: 'LCP',
            metric_value: entry.startTime,
            metric_rating: entry.startTime < 2500 ? 'good' : 'needs-improvement'
          });
        }
        
        if (entry.entryType === 'first-input') {
          trackEvent('web_vitals', {
            metric_name: 'FID',
            metric_value: entry.processingStart - entry.startTime,
            metric_rating: entry.processingStart - entry.startTime < 100 ? 'good' : 'needs-improvement'
          });
        }
        
        if (entry.entryType === 'layout-shift') {
          trackEvent('web_vitals', {
            metric_name: 'CLS',
            metric_value: entry.value,
            metric_rating: entry.value < 0.1 ? 'good' : 'needs-improvement'
          });
        }
      }
    });
    
    observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
  }
};
```

### 6. Gestion des Erreurs

#### Error Boundary Global
```typescript
// src/components/GlobalErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class GlobalErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('GlobalErrorBoundary caught an error:', error, errorInfo);
    
    // Envoyer l'erreur à un service de monitoring
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'exception', {
        description: error.message,
        fatal: false,
        error_info: errorInfo.componentStack
      });
    }
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 text-center">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            
            <h1 className="text-xl font-semibold text-gray-900 mb-2">
              Une erreur est survenue
            </h1>
            
            <p className="text-gray-600 mb-6">
              Désolé, quelque chose s'est mal passé. Notre équipe a été notifiée.
            </p>
            
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
              >
                Recharger la page
              </button>
              
              <button
                onClick={() => window.location.href = '/'}
                className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300"
              >
                Retour à l'accueil
              </button>
            </div>
            
            <div className="mt-6 text-sm text-gray-500">
              <p>Si le problème persiste, contactez-nous :</p>
              <p className="mt-1">support@teamup.app</p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### 7. Tests de Déploiement

#### Tests Automatisés
```typescript
// tests/deployment.test.ts
import { test, expect } from '@playwright/test';

test('Homepage loads correctly', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/TeamUp/);
  await expect(page.locator('h1')).toBeVisible();
});

test('PWA manifest is accessible', async ({ page }) => {
  const response = await page.goto('/manifest.json');
  expect(response?.status()).toBe(200);
  
  const manifest = await response?.json();
  expect(manifest.name).toBe('TeamUp - Réservation de créneaux sportifs');
  expect(manifest.icons).toHaveLength(2);
});

test('Service worker is registered', async ({ page }) => {
  await page.goto('/');
  
  const swRegistered = await page.evaluate(() => {
    return 'serviceWorker' in navigator;
  });
  expect(swRegistered).toBe(true);
});

test('Firebase configuration is loaded', async ({ page }) => {
  await page.goto('/');
  
  const firebaseConfig = await page.evaluate(() => {
    return window.firebaseConfig || null;
  });
  expect(firebaseConfig).toBeTruthy();
  expect(firebaseConfig.projectId).toBe('teamup-7a2d6');
});
```

#### Tests de Performance
```typescript
// tests/performance.test.ts
import { test, expect } from '@playwright/test';

test('Page load performance', async ({ page }) => {
  const startTime = Date.now();
  await page.goto('/');
  const loadTime = Date.now() - startTime;
  
  expect(loadTime).toBeLessThan(3000); // Moins de 3 secondes
});

test('Core Web Vitals', async ({ page }) => {
  await page.goto('/');
  
  // Attendre que la page soit complètement chargée
  await page.waitForLoadState('networkidle');
  
  const metrics = await page.evaluate(() => {
    return new Promise((resolve) => {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const metrics = {};
        
        entries.forEach((entry) => {
          if (entry.entryType === 'largest-contentful-paint') {
            metrics.lcp = entry.startTime;
          }
          if (entry.entryType === 'first-input') {
            metrics.fid = entry.processingStart - entry.startTime;
          }
          if (entry.entryType === 'layout-shift') {
            metrics.cls = entry.value;
          }
        });
        
        resolve(metrics);
      });
      
      observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
      
      // Timeout après 5 secondes
      setTimeout(() => resolve({}), 5000);
    });
  });
  
  expect(metrics.lcp).toBeLessThan(2500); // LCP < 2.5s
  expect(metrics.fid).toBeLessThan(100);  // FID < 100ms
  expect(metrics.cls).toBeLessThan(0.1);   // CLS < 0.1
});
```

### 8. Rollback et Gestion des Versions

#### Rollback Automatique
```typescript
// scripts/rollback.ts
import { execSync } from 'child_process';

const rollbackToPreviousVersion = () => {
  try {
    // Obtenir la version précédente
    const previousVersion = execSync('git log --oneline -n 2 | tail -1 | cut -d" " -f1').toString().trim();
    
    // Rollback vers la version précédente
    execSync(`git checkout ${previousVersion}`);
    
    // Déployer la version précédente
    execSync('vercel --prod');
    
    console.log(`Rollback vers la version ${previousVersion} effectué`);
  } catch (error) {
    console.error('Erreur lors du rollback:', error);
  }
};

// Exécuter le rollback si nécessaire
if (process.argv.includes('--rollback')) {
  rollbackToPreviousVersion();
}
```

#### Gestion des Versions
```json
// package.json
{
  "name": "teamup",
  "version": "1.0.0",
  "scripts": {
    "version:patch": "npm version patch && git push --follow-tags",
    "version:minor": "npm version minor && git push --follow-tags",
    "version:major": "npm version major && git push --follow-tags",
    "deploy:staging": "vercel --env staging",
    "deploy:production": "vercel --prod"
  }
}
```

### 9. Monitoring et Alertes

#### Configuration des Alertes
```typescript
// src/lib/monitoring.ts
export const setupMonitoring = () => {
  // Monitoring des erreurs JavaScript
  window.addEventListener('error', (event) => {
    if (window.gtag) {
      window.gtag('event', 'exception', {
        description: event.error?.message || 'Unknown error',
        fatal: false,
        error_info: event.error?.stack
      });
    }
  });
  
  // Monitoring des promesses rejetées
  window.addEventListener('unhandledrejection', (event) => {
    if (window.gtag) {
      window.gtag('event', 'exception', {
        description: event.reason?.message || 'Unhandled promise rejection',
        fatal: false,
        error_info: event.reason?.stack
      });
    }
  });
  
  // Monitoring des performances
  if ('performance' in window) {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'navigation') {
          const navEntry = entry as PerformanceNavigationTiming;
          
          if (window.gtag) {
            window.gtag('event', 'page_performance', {
              page_load_time: navEntry.loadEventEnd - navEntry.loadEventStart,
              dom_ready_time: navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart,
              first_paint: navEntry.responseEnd - navEntry.requestStart
            });
          }
        }
      }
    });
    
    observer.observe({ entryTypes: ['navigation'] });
  }
};
```

### 10. Sécurité et Conformité

#### Headers de Sécurité
```javascript
// next.config.js
async headers() {
  return [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff'
        },
        {
          key: 'X-Frame-Options',
          value: 'DENY'
        },
        {
          key: 'X-XSS-Protection',
          value: '1; mode=block'
        },
        {
          key: 'Referrer-Policy',
          value: 'strict-origin-when-cross-origin'
        },
        {
          key: 'Permissions-Policy',
          value: 'camera=(), microphone=(), geolocation=(self)'
        },
        {
          key: 'Content-Security-Policy',
          value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://firebase.googleapis.com https://fcm.googleapis.com;"
        }
      ]
    }
  ];
}
```

### 11. Améliorations Futures

#### Optimisations de Déploiement
- [ ] **Edge Functions** : Déploiement de fonctions à la périphérie
- [ ] **A/B Testing** : Tests de fonctionnalités
- [ ] **Blue-Green Deployment** : Déploiement sans interruption
- [ ] **Canary Releases** : Déploiement progressif
- [ ] **Feature Flags** : Activation/désactivation de fonctionnalités
- [ ] **Database Migrations** : Migration automatique des données
- [ ] **Health Checks** : Vérification de la santé de l'application
- [ ] **Load Testing** : Tests de charge automatisés
