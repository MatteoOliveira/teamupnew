'use client';

import { useAuth } from '@/hooks/useAuth';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/Button';
import { useState, useEffect } from 'react';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Message hors ligne */}
      {!isOnline && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm">
                Vous êtes actuellement hors ligne. Certaines fonctionnalités peuvent être limitées.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Contenu principal */}
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-black mb-4">
            Bienvenue sur TeamUp
          </h2>
          <p className="text-xl text-black max-w-3xl mx-auto">
            Réservez des créneaux sportifs localement et rejoignez une communauté de passionnés de sport.
          </p>
        </div>

        {!user ? (
          // Utilisateur non connecté
          <div className="max-w-md mx-auto space-y-4">
            <Link href="/login">
              <Button className="w-full">
                Se connecter
              </Button>
            </Link>
            <Link href="/register">
              <Button className="w-full bg-green-500 hover:bg-green-600">
                S'inscrire
              </Button>
            </Link>
          </div>
        ) : (
          // Utilisateur connecté
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-black mb-4">Mon Profil</h3>
              <p className="text-black mb-4">Gérez vos informations personnelles et vos préférences sportives.</p>
              <Link href="/profile"><Button className="w-full">Accéder au profil</Button></Link>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-black mb-4">Réservations</h3>
              <p className="text-black mb-4">Consultez et réservez des créneaux sportifs disponibles.</p>
              <Link href="/reservation"><Button className="w-full bg-green-500 hover:bg-green-600">Voir les créneaux</Button></Link>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-black mb-4">Discussions de groupe</h3>
              <p className="text-black mb-4">Participez aux discussions de groupe de vos événements.</p>
              <Link href="/messages"><Button className="w-full bg-blue-500 hover:bg-blue-600">Accéder aux messages</Button></Link>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-black mb-4">Créer un événement</h3>
              <p className="text-black mb-4">Organisez un nouvel événement sportif et invitez la communauté.</p>
              <Link href="/event-create"><Button className="w-full bg-purple-500 hover:bg-purple-600">Créer un événement</Button></Link>
            </div>
          </div>
        )}

        {/* Fonctionnalités */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-black text-center mb-8">Fonctionnalités</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-black mb-2">
                Authentification sécurisée
              </h4>
              <p className="text-black">
                Connexion et inscription sécurisées avec Firebase Auth.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-black mb-2">
                Réservation simple
              </h4>
              <p className="text-black">
                Réservez facilement vos créneaux sportifs préférés.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-black mb-2">
                Application PWA
              </h4>
              <p className="text-black">
                Installez l'application sur votre appareil pour un accès rapide.
              </p>
            </div>
          </div>
          <div className="mt-16 max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-black mb-2">À propos de TeamUp</h3>
            <p className="text-black">TeamUp est une plateforme communautaire pour organiser, réserver et discuter autour du sport local. Notre mission : faciliter la rencontre et la pratique sportive pour tous, partout !</p>
          </div>
        </div>
      </main>
    </div>
  );
}
