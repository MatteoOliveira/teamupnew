import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NavBar from '@/components/NavBar';
import Header from '@/components/Header';
import GoogleAnalytics from '@/components/GoogleAnalytics';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TeamUp - Réservation de créneaux sportifs",
  description: "Réservez des créneaux sportifs localement et rejoignez une communauté de passionnés de sport.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "TeamUp",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icon-192x192.webp", sizes: "192x192", type: "image/webp" },
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512x512.webp", sizes: "512x512", type: "image/webp" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icon-192x192.webp", sizes: "192x192", type: "image/webp" },
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
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
        <meta name="application-name" content="TeamUp" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="TeamUp" />
        <meta name="description" content="Réservez des créneaux sportifs localement" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#3b82f6" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="theme-color" content="#3b82f6" />

        <link rel="apple-touch-icon" href="/icon-192x192.webp" />
        <link rel="icon" type="image/webp" sizes="32x32" href="/icon-192x192.webp" />
        <link rel="icon" type="image/webp" sizes="32x32" href="/favicon-32x32.webp" />
        <link rel="icon" type="image/webp" sizes="16x16" href="/favicon-16x16.webp" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="mask-icon" href="/icon-192x192.webp" color="#3b82f6" />
        <link rel="shortcut icon" href="/favicon.ico" />
        
        {/* DNS Prefetch pour optimiser le chargement des tuiles OpenStreetMap */}
        <link rel="dns-prefetch" href="//tile.openstreetmap.org" />
        <link rel="dns-prefetch" href="//a.tile.openstreetmap.org" />
        <link rel="dns-prefetch" href="//b.tile.openstreetmap.org" />
        <link rel="dns-prefetch" href="//c.tile.openstreetmap.org" />
        
        {/* Preconnect pour établir la connexion plus rapidement - OpenStreetMap */}
        <link rel="preconnect" href="https://a.tile.openstreetmap.org" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://b.tile.openstreetmap.org" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://c.tile.openstreetmap.org" crossOrigin="anonymous" />
        
        {/* Preconnect pour Firebase - 620 ms d'économies */}
        <link rel="preconnect" href="https://teamup-7a2d6.firebaseapp.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://firebase.googleapis.com" crossOrigin="anonymous" />
        
        {/* Preconnect pour Google APIs - 620 ms d'économies */}
        <link rel="preconnect" href="https://apis.google.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.googleapis.com" crossOrigin="anonymous" />
        
        {/* Preconnect pour Google Tag Manager - 310 ms d'économies */}
        <link rel="preconnect" href="https://www.googletagmanager.com" crossOrigin="anonymous" />
        
        {/* Précharge globale ultra-agressive des tuiles les plus communes en France (zoom 8) */}
        {/* Tuile critique 129/88 - Tous les serveurs */}
        <link rel="preload" as="image" href="https://a.tile.openstreetmap.org/8/129/88.png" fetchPriority="high" crossOrigin="anonymous" />
        <link rel="preload" as="image" href="https://b.tile.openstreetmap.org/8/129/88.png" fetchPriority="high" crossOrigin="anonymous" />
        <link rel="preload" as="image" href="https://c.tile.openstreetmap.org/8/129/88.png" fetchPriority="high" crossOrigin="anonymous" />
        
        {/* Tuile critique 130/88 - Serveurs multiples */}
        <link rel="preload" as="image" href="https://a.tile.openstreetmap.org/8/130/88.png" fetchPriority="high" crossOrigin="anonymous" />
        <link rel="preload" as="image" href="https://b.tile.openstreetmap.org/8/130/88.png" fetchPriority="high" crossOrigin="anonymous" />
        
        {/* Tuile critique 129/89 - Serveurs multiples */}
        <link rel="preload" as="image" href="https://a.tile.openstreetmap.org/8/129/89.png" fetchPriority="high" crossOrigin="anonymous" />
        <link rel="preload" as="image" href="https://b.tile.openstreetmap.org/8/129/89.png" fetchPriority="high" crossOrigin="anonymous" />
        
        {/* Tuile critique 130/89 - Serveurs multiples */}
        <link rel="preload" as="image" href="https://a.tile.openstreetmap.org/8/130/89.png" fetchPriority="high" crossOrigin="anonymous" />
        <link rel="preload" as="image" href="https://b.tile.openstreetmap.org/8/130/89.png" fetchPriority="high" crossOrigin="anonymous" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Header />
        {/* Contenu principal avec padding fixe pour éviter les décalages */}
        <main className="min-h-screen pb-20">
          {children}
        </main>
        {/* NavBar en bas avec hauteur fixe */}
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 h-16 shadow-md">
          <NavBar />
        </nav>
        {/* Google Analytics chargé de manière conditionnelle */}
        <GoogleAnalytics />
      </body>
    </html>
  );
}
