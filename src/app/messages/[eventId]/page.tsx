"use client";
import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, getDoc, setDoc } from "firebase/firestore";
import Button from "@/components/Button";

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  isOrganizer: boolean;
  content: string;
  timestamp: any;
}

export default function EventChatPage() {
  const { eventId } = useParams();
  const { user } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [eventName, setEventName] = useState("");
  const [members, setMembers] = useState<any[]>([]);
  const [eventDate, setEventDate] = useState<Date | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Charger le nom de l'événement et les membres
  useEffect(() => {
    if (!eventId || !user?.uid) return;
    const fetchEvent = async () => {
      const eventDoc = await getDoc(doc(db, "event_chats", eventId as string));
      if (eventDoc.exists()) {
        setEventName(eventDoc.data().eventName || "Groupe de discussion");
        // Récupérer la date de l'événement
        const ts = eventDoc.data().eventDate;
        if (ts && ts.seconds) {
          setEventDate(new Date(ts.seconds * 1000));
        }
      }
      // Charger les membres uniquement si user?.uid existe
      if (user?.uid) {
        const membersSnap = await getDoc(doc(db, "event_chats", eventId as string, "members", user.uid));
        if (!membersSnap.exists()) {
          // Sécurité : si l'utilisateur n'est pas membre, retour à la liste
          router.push("/messages");
        }
      }
    };
    fetchEvent();
  }, [eventId, user, router]);

  // Charger les messages en temps réel
  useEffect(() => {
    if (!eventId) return;
    const q = query(collection(db, "event_chats", eventId as string, "messages"), orderBy("timestamp"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message)));
      // Scroll en bas à chaque nouveau message
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    });
    return () => unsubscribe();
  }, [eventId]);

  // Mettre à jour lastRead à chaque affichage du chat (dernier message visible)
  useEffect(() => {
    if (!eventId || !user?.uid || messages.length === 0) return;
    const lastMsg = messages[messages.length - 1];
    if (!lastMsg?.timestamp?.seconds) return;
    setDoc(
      doc(db, 'event_chats', eventId as string, 'members', user.uid),
      { lastRead: lastMsg.timestamp },
      { merge: true }
    );
  }, [eventId, user, messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user) return;
    // Récupérer le rôle organisateur
    const memberDoc = await getDoc(doc(db, "event_chats", eventId as string, "members", user.uid));
    const isOrganizer = memberDoc.exists() && memberDoc.data().isOrganizer;
    await addDoc(collection(db, "event_chats", eventId as string, "messages"), {
      senderId: user.uid,
      senderName: user.displayName || user.email || "Utilisateur",
      isOrganizer: !!isOrganizer,
      content: input.trim(),
      timestamp: serverTimestamp(),
    });
    setInput("");
  };

  return (
    <div className="max-w-lg mx-auto p-4 bg-white rounded shadow mt-6 mb-24 flex flex-col h-[80vh]">
      <div className="flex items-center gap-2 mb-4">
        <Button onClick={() => router.push("/messages")} className="bg-gray-200 text-gray-700 px-3 py-1">← Retour</Button>
        <h1 className="text-xl font-bold text-black flex-1 text-center">{eventName}</h1>
      </div>
      <div className="flex-1 overflow-y-auto bg-gray-50 rounded p-2 mb-2">
        {/* Message d'avertissement si l'événement est passé */}
        {eventDate && new Date() > eventDate && (
          <div className="mb-4 p-3 bg-yellow-100 text-yellow-800 rounded text-center text-sm">
            Merci d'avoir participé à l'événement ! Ce groupe se supprimera dans 2 jours.
          </div>
        )}
        {messages.length === 0 ? (
          <div className="text-gray-500 text-center mt-8">Aucun message pour le moment.</div>
        ) : (
          <ul className="space-y-2">
            {messages.map(msg => {
              const isMine = user && msg.senderId === user.uid;
              return (
                <li key={msg.id} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                  <div className={`flex items-center gap-2 mb-1 ${isMine ? 'flex-row-reverse' : ''}`}>
                    <span className="font-semibold text-black text-sm">{msg.senderName}</span>
                    {msg.isOrganizer && (
                      <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full font-medium">Organisateur</span>
                    )}
                    <span className="text-xs text-gray-400">{msg.timestamp?.seconds ? new Date(msg.timestamp.seconds * 1000).toLocaleTimeString() : ""}</span>
                  </div>
                  <div className={`${isMine ? 'bg-blue-100 text-black self-end' : 'bg-gray-200 text-black self-start'} border rounded px-3 py-2 max-w-xs break-words shadow-sm`}>
                    {msg.content}
                  </div>
                </li>
              );
            })}
            <div ref={messagesEndRef} />
          </ul>
        )}
      </div>
      <form onSubmit={handleSend} className="flex gap-2 mt-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
          placeholder="Écrire un message..."
        />
        <Button type="submit" className="bg-blue-500 hover:bg-blue-600">Envoyer</Button>
      </form>
    </div>
  );
} 