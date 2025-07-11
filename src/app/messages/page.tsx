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
    <div className="max-w-lg mx-auto p-4 bg-white rounded shadow mt-6 mb-24">
      <h1 className="text-2xl font-bold text-black mb-4">Mes groupes de discussion</h1>
      {loading ? (
        <div className="text-black text-center">Chargement...</div>
      ) : chats.length === 0 ? (
        <div className="text-black text-center">Aucun groupe de discussion pour le moment.</div>
      ) : (
        <ul className="space-y-4">
          {chats.map(chat => (
            <li key={chat.eventId} className="p-4 border rounded bg-gray-50 hover:bg-blue-50 transition">
              <Link href={`/messages/${chat.eventId}`} className="block">
                <div className="font-semibold text-lg text-blue-700">{chat.eventName}</div>
                <div className="text-xs text-gray-500">{chat.eventDate?.seconds ? new Date(chat.eventDate.seconds * 1000).toLocaleDateString() : ""}</div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
} 