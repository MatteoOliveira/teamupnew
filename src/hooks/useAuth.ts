import { useState, useEffect } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signInWithRedirect, getRedirectResult, signOut } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    // D'abord vérifier s'il y a un résultat de redirection (pour mobile)
    getRedirectResult(auth).then((result) => {
      if (result && isMounted) {
        console.log('Résultat de redirection Google:', result.user);
        alert('✅ Retour de redirection Google - Connexion réussie !');
        setUser(result.user);
        setLoading(false);
      }
    }).catch((error) => {
      console.error('Erreur lors de la récupération du résultat de redirection:', error);
      if (isMounted) {
        setLoading(false);
      }
    });

    // Ensuite écouter les changements d'état d'authentification
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (isMounted) {
        // Log seulement en mode développement et pour les changements significatifs
        if (process.env.NODE_ENV === 'development' && user) {
          console.log('Utilisateur connecté:', user.uid);
        }
        setUser(user);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    try {
      // Détecter si on est sur mobile
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      console.log('Tentative de connexion Google:', { isMobile, userAgent: navigator.userAgent });
      
      if (isMobile) {
        // Sur mobile, essayer d'abord signInWithPopup, puis signInWithRedirect si échec
        console.log('Utilisation de signInWithPopup pour mobile (fallback redirect)');
        alert('🔍 Mobile détecté - Tentative avec popup');
        
        try {
          // Essayer d'abord avec popup sur mobile
          const result = await signInWithPopup(auth, googleProvider);
          alert('✅ Connexion Google réussie avec popup !');
          return result.user;
        } catch (popupError) {
          console.log('Popup échoué, tentative avec redirect:', popupError);
          alert('⚠️ Popup échoué, redirection vers Google...');
          // Si popup échoue, utiliser redirect
          await signInWithRedirect(auth, googleProvider);
        }
      } else {
        // Utiliser signInWithPopup sur desktop
        console.log('Utilisation de signInWithPopup pour desktop');
        const result = await signInWithPopup(auth, googleProvider);
        return result.user;
      }
    } catch (error) {
      console.error('Erreur de connexion Google:', error);
      const errorCode = error && typeof error === 'object' && 'code' in error ? error.code : 'unknown';
      const errorMessage = error && typeof error === 'object' && 'message' in error ? error.message : 'unknown';
      
      console.error('Détails de l\'erreur:', {
        code: errorCode,
        message: errorMessage,
        isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      });
      
      // Afficher l'erreur dans une alerte pour mobile
      alert(`❌ Erreur Google OAuth:\nCode: ${errorCode}\nMessage: ${errorMessage}`);
      
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