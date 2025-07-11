"use client";
import Link from "next/link";
import { useAuth } from '@/hooks/useAuth';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import Button from '@/components/Button';
import { useState } from 'react';

export default function Header() {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      // Optionally handle error
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="bg-white shadow-sm w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="flex items-center gap-2">
            <img src="/icon-192x192.png" alt="Logo TeamUp" className="h-10 w-auto" />
            <span className="text-xl font-bold text-black hidden sm:inline">TeamUp!</span>
          </Link>
          {user && (
            <Button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600"
              disabled={isLoggingOut}
            >
              {isLoggingOut ? 'Déconnexion...' : 'Se déconnecter'}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
} 