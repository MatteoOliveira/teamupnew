const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  buildExcludes: [/middleware-manifest\.json$/, /build-manifest\.json$/],
  publicExcludes: ['!robots.txt', '!sitemap.xml'],
  runtimeCaching: [
    {
      urlPattern: /^https?.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'offlineCache',
        expiration: {
          maxEntries: 200,
        },
      },
    },
  ],
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuration pour Next.js 15
  output: 'standalone',
  images: {
    domains: ['teamup-fawn.vercel.app'],
    unoptimized: true, // Pour éviter les problèmes avec Vercel
  },
  // Optimisation pour éviter le JavaScript hérité aux navigateurs modernes
  experimental: {
    esmExternals: true,
  },
  // Configuration du transpile pour cibler les navigateurs modernes
  transpilePackages: [],
  // Optimisation des polyfills
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Optimisation du code splitting pour réduire le JavaScript inutilisé
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // Optimisation des chunks pour réduire le JavaScript inutilisé
      config.optimization.splitChunks = {
        chunks: 'all',
        minSize: 20000, // Chunks minimum de 20KB
        maxSize: 100000, // Chunks maximum de 100KB
        cacheGroups: {
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
          // Chunk séparé pour React et ses dépendances
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            name: 'react',
            priority: 20,
            chunks: 'all',
          },
          // Chunk séparé pour Firebase
          firebase: {
            test: /[\\/]node_modules[\\/]firebase[\\/]/,
            name: 'firebase',
            priority: 15,
            chunks: 'all',
          },
          // Chunk séparé pour Leaflet (map)
          leaflet: {
            test: /[\\/]node_modules[\\/]leaflet[\\/]/,
            name: 'leaflet',
            priority: 15,
            chunks: 'all',
          },
          // Chunk séparé pour les autres vendors
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: -10,
            chunks: 'all',
            maxSize: 50000, // Limite de 50KB pour éviter les gros chunks
          },
          // Chunk séparé pour les composants lourds
          components: {
            test: /[\\/]src[\\/]components[\\/]/,
            name: 'components',
            priority: 10,
            chunks: 'all',
          },
        },
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
}

module.exports = nextConfig 