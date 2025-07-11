"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc, collection, addDoc, getDocs, query, where, deleteDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import Button from "@/components/Button";

interface Event {
  id: string;
  name: string;
  city: string;
  location: string;
  date?: { seconds: number };
  description: string;
  maxParticipants: number;
  createdBy: string;
  contactInfo: string;
}

interface Participant {
  id: string;
  userId: string;
  userName: string;
  contact: string;
  registeredAt?: { seconds: number };
}

export default function EventDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);
  const [contact, setContact] = useState("");
  const [isCreator, setIsCreator] = useState(false);
  const [canSeeParticipants, setCanSeeParticipants] = useState(false);
  const [participantDocId, setParticipantDocId] = useState<string | null>(null);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchEvent = async () => {
      try {
        const eventDoc = await getDoc(doc(db, "events", id as string));
        if (eventDoc.exists()) {
          const data = eventDoc.data();
          setEvent({
            id: eventDoc.id,
            name: data.name,
            city: data.city,
            location: data.location,
            date: data.date,
            description: data.description,
            maxParticipants: data.maxParticipants,
            createdBy: data.createdBy,
            contactInfo: data.contactInfo,
          });
        } else {
          setMessage("Événement non trouvé");
        }
      } catch (error) {
        console.error("Erreur lors du chargement de l'événement:", error);
        setMessage("Erreur lors du chargement de l'événement");
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const fetchParticipants = async () => {
      try {
        const q = query(collection(db, "event_participants"), where("eventId", "==", id));
        const snap = await getDocs(q);
        setParticipants(snap.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            userId: data.userId,
            userName: data.userName,
            contact: data.contact,
            registeredAt: data.registeredAt,
          };
        }));
      } catch (error) {
        console.error("Erreur lors du chargement des participants:", error);
      }
    };
    fetchParticipants();
  }, [id, message]);

  useEffect(() => {
    if (!user || !event) return;
    const isCreator = event.createdBy === user.uid;
    setIsCreator(isCreator);
    const found = participants.find(p => p.userId === user.uid);
    const isRegistered = isCreator || !!found;
    setAlreadyRegistered(isRegistered);
    setCanSeeParticipants(isRegistered);
    setParticipantDocId(found ? found.id : null);
  }, [user, participants, event]);

  const handleRegister = async () => {
    if (!user || !event) {
      setMessage("Vous devez être connecté pour vous inscrire");
      return;
    }
    
    setMessage("");
    setRegistering(true);
    
    try {
      if (participants.length >= event.maxParticipants) {
        setMessage("L'événement est complet.");
        return;
      }
      
      if (alreadyRegistered) {
        setMessage("Vous êtes déjà inscrit à cet événement.");
        return;
      }
      
      if (!contact.trim()) {
        setMessage("Merci d'indiquer un moyen de contact (email, téléphone, etc.)");
        return;
      }
      
      await addDoc(collection(db, "event_participants"), {
        eventId: event.id,
        userId: user.uid,
        registeredAt: new Date(),
        userName: user.displayName || user.email || "Utilisateur",
        contact: contact.trim(),
      });
      // Ajouter l'utilisateur comme membre du groupe de discussion
      await setDoc(doc(db, "event_chats", event.id, "members", user.uid), {
        userId: user.uid,
        userName: user.displayName || user.email || "Utilisateur",
        isOrganizer: false,
        joinedAt: new Date(),
      });
      
      setMessage("Inscription réussie !");
      setContact("");
      
      // Recharger les participants
      if (!event) return;
      const q = query(collection(db, "event_participants"), where("eventId", "==", event.id));
      const snap = await getDocs(q);
      setParticipants(snap.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          userId: data.userId,
          userName: data.userName,
          contact: data.contact,
          registeredAt: data.registeredAt,
        };
      }));
      
    } catch (error) {
      console.error("Erreur lors de l'inscription:", error);
      setMessage("Erreur lors de l'inscription. Veuillez réessayer.");
    } finally {
      setRegistering(false);
    }
  };

  const handleUnregister = async () => {
    if (!participantDocId) return;
    if (!event) return;
    setRegistering(true);
    try {
      await deleteDoc(doc(db, "event_participants", participantDocId));
      setMessage("Vous vous êtes désinscrit de l'événement.");
      
      // Refresh participants
      if (!event) return;
      const q = query(collection(db, "event_participants"), where("eventId", "==", event.id));
      const snap = await getDocs(q);
      setParticipants(snap.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          userId: data.userId,
          userName: data.userName,
          contact: data.contact,
          registeredAt: data.registeredAt,
        };
      }));
    } catch (error) {
      console.error("Erreur lors de la désinscription:", error);
      setMessage("Erreur lors de la désinscription. Veuillez réessayer.");
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-black">Chargement de l&apos;événement...</div>;
  }

  if (!event) {
    return <div className="p-8 text-center text-black">Événement non trouvé</div>;
  }

  const isEventFull = participants.length >= event.maxParticipants;
  const canRegister = user && !alreadyRegistered && !isCreator && !isEventFull;

  return (
    <div className="max-w-md mx-auto p-4 bg-white rounded shadow mt-6 mb-24">
      <h1 className="text-2xl font-bold text-black mb-2">{event.name}</h1>
      <div className="text-black mb-1">{event.city} - {event.location}</div>
      <div className="text-black mb-1">{event.date?.seconds ? new Date(event.date.seconds * 1000).toLocaleString() : ""}</div>
      <div className="text-black mb-1">{event.description}</div>
      <div className="text-black mb-1 font-semibold">Participants : {participants.length} / {event.maxParticipants}</div>
      <div className="text-black mb-1">Contact organisateur : <span className="font-semibold">{event.contactInfo}</span></div>
      
      {message && (
        <div className={`text-sm text-center p-3 rounded my-2 ${
          message.includes("réussie") || message.includes("désinscrit") 
            ? "bg-green-100 text-green-700" 
            : "bg-red-100 text-red-700"
        }`}>
          {message}
        </div>
      )}
      
      {/* Bouton d'inscription - toujours visible si l'utilisateur peut s'inscrire */}
      {canRegister && (
        <div className="mt-4 p-4 border border-blue-200 rounded-lg bg-blue-50">
          <h3 className="text-lg font-semibold text-black mb-2">S&apos;inscrire à cet événement</h3>
          <form onSubmit={e => { e.preventDefault(); handleRegister(); }} className="space-y-3">
            <input
              type="text"
              placeholder="Votre contact (email, téléphone, etc.) *"
              value={contact}
              onChange={e => setContact(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <Button 
              type="submit"
              disabled={registering || !contact.trim()}
              className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-50"
            >
              {registering ? 'Inscription...' : 'S&apos;inscrire'}
            </Button>
          </form>
        </div>
      )}
      
      {/* Messages d'état */}
      {!user && (
        <div className="mt-4 p-3 bg-yellow-100 text-yellow-700 rounded text-center">
          Connectez-vous pour vous inscrire à cet événement
        </div>
      )}
      
      {alreadyRegistered && !isCreator && (
        <div className="mt-4 p-3 bg-green-100 text-green-700 rounded text-center">
          <div className="font-semibold mb-2">Vous êtes inscrit à cet événement</div>
          <Button
            className="w-full bg-red-500 hover:bg-red-600"
            onClick={handleUnregister}
            disabled={registering}
          >
            {registering ? 'Désinscription...' : 'Se désinscrire'}
          </Button>
        </div>
      )}
      
      {isCreator && (
        <div className="mt-4 p-3 bg-blue-100 text-blue-700 rounded text-center font-semibold">
          Vous êtes l&apos;organisateur de cet événement
        </div>
      )}
      
      {isEventFull && !alreadyRegistered && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded text-center font-semibold">
          Événement complet
        </div>
      )}
      
      {/* Liste des inscrits : visible pour tous les inscrits et le créateur */}
      {canSeeParticipants && (
        <div className="mt-6">
          <h2 className="text-lg font-bold text-black mb-2">Participants inscrits</h2>
          {participants.length === 0 ? (
            <div className="text-black">Aucun inscrit pour le moment.</div>
          ) : (
            <ul className="space-y-2">
              {/* Trier les participants : organisateur en premier, puis les autres par ordre d'inscription */}
              {participants
                .sort((a, b) => {
                  // L'organisateur toujours en premier
                  if (event.createdBy === a.userId) return -1;
                  if (event.createdBy === b.userId) return 1;
                  // Les autres par ordre d'inscription (plus récent en premier)
                  return new Date(b.registeredAt?.seconds ? b.registeredAt.seconds * 1000 : 0).getTime() - 
                         new Date(a.registeredAt?.seconds ? a.registeredAt.seconds * 1000 : 0).getTime();
                })
                .map(p => (
                  <li key={p.id} className={`p-3 border rounded flex flex-col md:flex-row md:items-center md:justify-between ${
                    event.createdBy === p.userId ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'
                  }`}>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-black">
                        {p.userName}
                      </span>
                      {event.createdBy === p.userId && (
                        <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full font-medium">
                          Organisateur
                        </span>
                      )}
                    </div>
                    <span className="text-black text-xs mt-1 md:mt-0">{p.contact}</span>
                  </li>
                ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
} 