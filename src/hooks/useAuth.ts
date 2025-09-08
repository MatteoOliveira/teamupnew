import { useState, useEffect } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signInWithRedirect, getRedirectResult, signOut } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    // Vérifier s'il y a un résultat de redirection (pour mobile)
    getRedirectResult(auth).then((result) => {
      if (result) {
        setUser(result.user);
        setLoading(false);
      }
    }).catch((error) => {
      console.error('Erreur lors de la récupération du résultat de redirection:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      // Détecter si on est sur mobile
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      if (isMobile) {
        // Utiliser signInWithRedirect sur mobile
        await signInWithRedirect(auth, googleProvider);
        // Note: Le résultat sera géré dans useEffect avec getRedirectResult
      } else {
        // Utiliser signInWithPopup sur desktop
        const result = await signInWithPopup(auth, googleProvider);
        return result.user;
      }
    } catch (error) {
      console.error('Erreur de connexion Google:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Erreur de déconnexion:', error);
      throw error;
    }
  };

  return { user, loading, signInWithGoogle, logout };
} 