"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/firebase';
import { useEffect, useState } from 'react';
import { collection, getDocs, doc, getDoc, query } from 'firebase/firestore';

export default function NavBar() {
  // Tous les hooks sont appelés avant tout return conditionnel
  const [mounted, setMounted] = useState(false);
  const { user } = useAuth();
  const pathname = usePathname();
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Vérifier les messages non lus
  useEffect(() => {
    if (!user) return;
    const checkUnread = async () => {
      const chatsSnap = await getDocs(collection(db, 'event_chats'));
      let unread = false;
      for (const chatDoc of chatsSnap.docs) {
        const memberRef = doc(db, 'event_chats', chatDoc.id, 'members', user.uid);
        const memberSnap = await getDoc(memberRef);
        if (!memberSnap.exists()) continue;
        const member = memberSnap.data();
        // Récupérer le dernier message du groupe
        const messagesSnap = await getDocs(query(collection(db, 'event_chats', chatDoc.id, 'messages')));
        if (messagesSnap.empty) continue;
        const lastMsg = messagesSnap.docs[messagesSnap.docs.length - 1].data();
        if (!member.lastRead || (lastMsg.timestamp?.seconds && (!member.lastRead.seconds || lastMsg.timestamp.seconds > member.lastRead.seconds))) {
          unread = true;
          break;
        }
      }
      setHasUnread(unread);
    };
    checkUnread();
  }, [user]);

  // Rendu avec placeholder pour éviter les décalages
  if (!mounted) {
    return (
      <nav aria-label="Navigation principale" role="navigation" className="flex w-full justify-around bg-white border-t border-gray-200 h-16 shadow-md">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="flex flex-col items-center justify-center text-xs text-gray-400">
            <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-8 h-3 bg-gray-200 rounded animate-pulse mt-1"></div>
          </div>
        ))}
      </nav>
    );
  }

  const navItems = [
    { href: "/event-create", label: "Créer", icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><title>Créer un événement</title><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
    ) },
    { href: "/reservation", label: "Événements", icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><title>Liste des événements</title><path strokeLinecap="round" strokeLinejoin="round" d="M8 17l4 4 4-4m0-5V3m-8 9v6a2 2 0 002 2h4a2 2 0 002-2v-6" /></svg>
    ) },
    { href: "/profile", label: "Profil", icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><title>Profil utilisateur</title><path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
    ) },
    { href: "/messages", label: "Messages", icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><title>Messages de groupe</title><path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m-2 8a9 9 0 100-18 9 9 0 000 18z" /></svg>
    ) },
  ];

  return (
    <nav aria-label="Navigation principale" role="navigation" className="flex w-full justify-around bg-white border-t border-gray-200 h-16 shadow-md">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-label={item.label}
          tabIndex={0}
          className={`flex flex-col items-center justify-center text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${pathname === item.href ? 'text-blue-600 font-bold' : 'text-gray-700'}`}
        >
          <div className="relative">
            {item.icon}
            {item.href === "/messages" && hasUnread && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full w-3 h-3 flex items-center justify-center text-[10px] font-bold" aria-label="Nouveaux messages" role="status"></span>
            )}
          </div>
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  );
} 