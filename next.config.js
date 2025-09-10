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
        cacheGroups: {
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: -10,
            chunks: 'all',
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