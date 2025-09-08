import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

// Configuration Firebase
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDEhV0f2kWRyorZGi6QoFEuQvSabUq8qGU",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "teamup-7a2d6.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "teamup-7a2d6",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "teamup-7a2d6.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "535498065920",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:535498065920:web:9c23eb124e7af9748030e5",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-XP9K67C013"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);

// Exporter les services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Configuration Google OAuth
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
  // Configuration spécifique pour mobile
  hd: '', // Permet tous les domaines
});

// Analytics (optionnel - seulement côté client)
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app; 