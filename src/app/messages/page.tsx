"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";

interface EventChat {
  eventId: string;
  eventName: string;
  eventDate: { seconds: number } | null;
}

export default function MessagesPage() {
  const { user } = useAuth();
  const [chats, setChats] = useState<EventChat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    // Récupérer tous les salons où l'utilisateur est membre
    const fetchChats = async () => {
      setLoading(true);
      try {
        // On cherche dans event_chats/*/members où userId == user.uid
        // Firestore ne permet pas de requête cross-collection, donc on récupère tous les salons puis on filtre
        const chatsSnap = await getDocs(collection(db, "event_chats"));
        const chats: EventChat[] = [];
        for (const chatDoc of chatsSnap.docs) {
          const memberRef = doc(db, "event_chats", chatDoc.id, "members", user.uid);
          const memberSnap = await getDoc(memberRef);
          if (memberSnap.exists()) {
            const data = chatDoc.data();
            chats.push({
              eventId: chatDoc.id,
              eventName: data.eventName,
              eventDate: data.eventDate,
            });
          }
        }
        setChats(chats);
      } catch (error) {
        console.error("Erreur lors du chargement des groupes de discussion:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchChats();
  }, [user]);

  if (!user) {
    return <div className="p-8 text-center text-black">Connectez-vous pour accéder à vos messages.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Mobile minimal */}
      <div className="md:hidden flex items-center justify-center py-3 px-4 bg-white border-b border-gray-200">
        <div className="flex items-center space-x-1">
          <div className="w-6 h-6 bg-gradient-to-r from-green-600 to-blue-600 rounded-md flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h2 className="text-sm font-bold text-gray-900">
            <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">TeamUp</span>
          </h2>
        </div>
      </div>

      {/* Header Desktop */}
      <div className="hidden md:block py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Mes groupes de discussion
          </h1>
          <p className="text-gray-600">
            Gérez vos conversations d'événements sportifs
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto py-4 md:py-8 px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-600">Chargement de vos discussions...</p>
            </div>
          </div>
        ) : chats.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune discussion</h3>
                <p className="text-gray-600">Vous n'avez pas encore de groupes de discussion.</p>
                <p className="text-sm text-gray-500 mt-1">Rejoignez un événement pour commencer à discuter !</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-5 h-5 text-green-500">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-gray-900">Mes discussions</h2>
              <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">{chats.length}</span>
            </div>
            
            <div className="grid gap-3">
              {chats.map(chat => (
                <Link key={chat.eventId} href={`/messages/${chat.eventId}`} className="block">
                  <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{chat.eventName}</h3>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>
                            {chat.eventDate?.seconds ? new Date(chat.eventDate.seconds * 1000).toLocaleDateString() : "Date non définie"}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">Discussion</span>
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 