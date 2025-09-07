import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDEhV0f2kWRyorZGi6QoFEuQvSabUq8qGU",
  authDomain: "teamup-7a2d6.firebaseapp.com",
  projectId: "teamup-7a2d6",
  storageBucket: "teamup-7a2d6.firebasestorage.app",
  messagingSenderId: "535498065920",
  appId: "1:535498065920:web:9c23eb124e7af9748030e5",
  measurementId: "G-XP9K67C013"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);

// Exporter les services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Configuration Google OAuth
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Analytics (optionnel - seulement côté client)
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app; 