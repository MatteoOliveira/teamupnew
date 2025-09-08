'use client';

import { useState, useEffect } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Input from '@/components/Input';
import Button from '@/components/Button';
import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const router = useRouter();
  const { signInWithGoogle, user, loading: authLoading } = useAuth();

  // Redirection automatique après connexion Google sur mobile
  useEffect(() => {
    if (user && !authLoading) {
      console.log('Utilisateur connecté, redirection vers /profile');
      router.push('/profile');
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/profile');
    } catch (error: unknown) {
      console.error('Erreur de connexion:', error);
      
      // Gestion d'erreurs plus spécifique
      if (error && typeof error === 'object' && 'code' in error && error.code === 'auth/invalid-credential') {
        setError('Email ou mot de passe incorrect. Vérifiez vos identifiants.');
      } else if (error && typeof error === 'object' && 'code' in error && error.code === 'auth/user-not-found') {
        setError('Aucun compte trouvé avec cette adresse email.');
      } else if (error && typeof error === 'object' && 'code' in error && error.code === 'auth/wrong-password') {
        setError('Mot de passe incorrect.');
      } else if (error && typeof error === 'object' && 'code' in error && error.code === 'auth/invalid-email') {
        setError('Adresse email invalide.');
      } else if (error && typeof error === 'object' && 'code' in error && error.code === 'auth/user-disabled') {
        setError('Ce compte a été désactivé.');
      } else if (error && typeof error === 'object' && 'code' in error && error.code === 'auth/too-many-requests') {
        setError('Trop de tentatives de connexion. Réessayez plus tard.');
      } else {
        setError('Erreur de connexion. Vérifiez vos identifiants.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setGoogleLoading(true);

    try {
      // Note: Plus de blocage sur mobile - l'utilisateur peut utiliser le navigateur
      
      // Détecter si on est sur mobile
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      if (isMobile) {
        // Sur mobile, utiliser signInWithRedirect (pas de redirection immédiate)
        await signInWithGoogle();
        // La redirection sera gérée par le hook useAuth
      } else {
        // Sur desktop, utiliser signInWithPopup avec redirection immédiate
        await signInWithGoogle();
        router.push('/profile');
      }
    } catch (error: unknown) {
      console.error('Erreur de connexion Google:', error);
      
      if (error && typeof error === 'object' && 'code' in error && error.code === 'auth/popup-closed-by-user') {
        setError('Connexion annulée par l&apos;utilisateur.');
      } else if (error && typeof error === 'object' && 'code' in error && error.code === 'auth/popup-blocked') {
        setError('Popup bloqué par le navigateur. Autorisez les popups pour ce site.');
      } else if (error && typeof error === 'object' && 'code' in error && error.code === 'auth/cancelled-popup-request') {
        setError('Connexion annulée.');
      } else if (error && typeof error === 'object' && 'code' in error && error.code === 'auth/operation-not-allowed') {
        setError('Connexion Google non autorisée. Contactez l&apos;administrateur.');
      } else if (error && typeof error === 'object' && 'code' in error && error.code === 'auth/unauthorized-domain') {
        setError('Domaine non autorisé pour la connexion Google.');
      } else {
        setError('Erreur de connexion Google. Réessayez.');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mb-4 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Bienvenue sur <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">TeamUp</span>
            </h2>
            <p className="text-gray-600 text-sm">
              Connectez-vous pour rejoindre la communauté sportive
            </p>
          </div>
          
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adresse email
              </label>
              <Input
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-4 text-base border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe
              </label>
              <Input
                type="password"
                placeholder="Votre mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-4 text-base border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-4 rounded-2xl transition-all duration-200 text-base disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 text-gray-500">Ou</span>
            </div>
          </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading || authLoading}
              className="w-full px-4 py-4 bg-white border-2 border-gray-200 text-gray-700 rounded-2xl hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-semibold transition-all duration-200 text-base transform hover:scale-105"
            >
            {googleLoading || authLoading ? (
              'Connexion...'
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continuer avec Google
              </>
            )}
          </button>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Pas encore de compte ?{' '}
              <Link href="/register" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                S'inscrire
              </Link>
            </p>
          </div>
          </form>
        </div>
      </div>
    </div>
  );
} 