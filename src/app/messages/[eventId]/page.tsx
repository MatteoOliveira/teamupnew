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
  timestamp: { seconds: number } | null;
}

export default function EventChatPage() {
  const { eventId } = useParams();
  const { user } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [eventName, setEventName] = useState("");
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
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Header Mobile minimal - FIXE */}
      <div className="md:hidden flex items-center justify-between py-3 px-4 bg-white border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => router.push("/messages")}
            className="p-1 hover:bg-gray-100 rounded-md transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div className="flex items-center space-x-1">
            <div className="w-6 h-6 bg-gradient-to-r from-green-600 to-blue-600 rounded-md flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h2 className="text-sm font-bold text-gray-900 truncate max-w-48">
              {eventName}
            </h2>
          </div>
        </div>
        <div className="w-5 h-5"></div> {/* Spacer pour centrer */}
      </div>

      {/* Header Desktop - FIXE */}
      <div className="hidden md:block py-4 px-4 sm:px-6 lg:px-8 bg-white border-b border-gray-200 flex-shrink-0">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push("/messages")}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Retour</span>
            </button>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-900">{eventName}</h1>
              {eventDate && (
                <p className="text-sm text-gray-600">
                  {eventDate.toLocaleDateString()} à {eventDate.toLocaleTimeString()}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Zone de chat - FLEXIBLE */}
      <div className="flex-1 max-w-4xl mx-auto w-full flex flex-col px-4 py-4">
        <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col overflow-hidden">
          {/* Zone des messages */}
          <div className="flex-1 overflow-y-auto p-4">
            {/* Message d'avertissement si l'événement est passé */}
            {eventDate && new Date() > eventDate && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg text-center text-sm">
                <div className="flex items-center justify-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <span>Merci d'avoir participé à l'événement ! Ce groupe se supprimera dans 2 jours.</span>
                </div>
              </div>
            )}
            
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun message</h3>
                <p className="text-gray-600">Soyez le premier à écrire dans cette discussion !</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map(msg => {
                  const isMine = user && msg.senderId === user.uid;
                  return (
                    <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`flex flex-col max-w-xs lg:max-w-md ${isMine ? 'items-end' : 'items-start'}`}>
                        <div className={`flex items-center space-x-2 mb-1 ${isMine ? 'flex-row-reverse space-x-reverse' : ''}`}>
                          <span className="font-semibold text-gray-900 text-sm">{msg.senderName}</span>
                          {msg.isOrganizer && (
                            <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full font-medium">Organisateur</span>
                          )}
                          <span className="text-xs text-gray-500">
                            {msg.timestamp?.seconds ? new Date(msg.timestamp.seconds * 1000).toLocaleTimeString() : ""}
                          </span>
                        </div>
                        <div className={`px-4 py-2 rounded-2xl ${
                          isMine 
                            ? 'bg-blue-500 text-white rounded-br-md' 
                            : 'bg-gray-100 text-gray-900 rounded-bl-md'
                        } shadow-sm`}>
                          <p className="text-sm break-words">{msg.content}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
          {/* Zone de saisie - FIXE */}
          <div className="border-t border-gray-200 p-4 flex-shrink-0">
            <form onSubmit={handleSend} className="flex gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                  placeholder="Écrire un message..."
                />
              </div>
              <button
                type="submit"
                disabled={!input.trim()}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-3 rounded-full font-medium transition-colors flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                <span className="hidden sm:inline">Envoyer</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 