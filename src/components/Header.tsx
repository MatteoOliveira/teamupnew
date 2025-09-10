"use client";
import Link from "next/link";
import { useAuth } from '@/hooks/useAuth';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import Button from '@/components/Button';
import { useState } from 'react';
import Image from 'next/image';

export default function Header() {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut(auth);
      router.push('/login');
    } catch {
      // Optionally handle error
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="bg-white shadow-sm w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-2 md:py-4">
          <Link href="/" className="flex items-center gap-1 md:gap-2">
            <Image 
              src="/icon-192x192.png" 
              alt="Logo TeamUp" 
              width={24} 
              height={24} 
              className="w-6 h-6 md:w-10 md:h-10"
              priority
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
            />
            <span className="text-sm md:text-xl font-bold text-black hidden sm:inline">TeamUp!</span>
          </Link>
          {/* Réservation d'espace pour le bouton pour éviter les décalages */}
          <div className="h-8 md:h-10 flex items-center">
            {user && (
              <Button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-xs md:text-sm px-2 py-1 md:px-4 md:py-2"
                disabled={isLoggingOut}
              >
                {isLoggingOut ? 'Déconnexion...' : 'Se déconnecter'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
} 