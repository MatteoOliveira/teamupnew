const withPWA = require('@ducanh2912/next-pwa').default({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development'
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuration pour Next.js 15
  output: 'standalone',
  images: {
    domains: ['teamup-fawn.vercel.app'],
    unoptimized: true, // Pour éviter les problèmes avec Vercel
  },
  serverExternalPackages: ['@ducanh2912/next-pwa'],
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

module.exports = withPWA(nextConfig) 