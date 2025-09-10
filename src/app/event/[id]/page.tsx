"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc, collection, addDoc, getDocs, query, where, deleteDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import Button from "@/components/Button";
import { MapPinIcon, CalendarIcon, UsersIcon, UserIcon, ClockIcon, PhoneIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

interface Event {
  id: string;
  name: string;
  city: string;
  location: string;
  address?: string;
  postcode?: string;
  sport?: string;
  sportEmoji?: string;
  sportColor?: string;
  date?: { seconds: number };
  endDate?: { seconds: number };
  description: string;
  maxParticipants: number;
  currentParticipants?: number;
  createdBy: string;
  createdByName?: string;
  contactInfo: string;
  isReserved?: boolean;
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
  const router = useRouter();
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
            address: data.address,
            postcode: data.postcode,
            sport: data.sport,
            sportEmoji: data.sportEmoji,
            sportColor: data.sportColor,
            date: data.date,
            endDate: data.endDate,
            description: data.description,
            maxParticipants: data.maxParticipants,
            currentParticipants: data.currentParticipants,
            createdBy: data.createdBy,
            createdByName: data.createdByName,
            contactInfo: data.contactInfo,
            isReserved: data.isReserved,
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
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de l&apos;événement...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Événement non trouvé</h1>
          <p className="text-gray-600">Cet événement n&apos;existe pas ou a été supprimé.</p>
        </div>
      </div>
    );
  }

  const isEventFull = participants.length >= event.maxParticipants;
  const canRegister = user && !alreadyRegistered && !isCreator && !isEventFull;
  
  const formatDate = (date: { seconds: number }) => {
    const d = new Date(date.seconds * 1000);
    return d.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (date: { seconds: number }) => {
    const d = new Date(date.seconds * 1000);
    return d.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Bouton de retour */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors duration-200 group"
          >
            <ArrowLeftIcon className="h-5 w-5 group-hover:-translate-x-1 transition-transform duration-200" />
            <span className="font-medium">Retour aux événements</span>
          </button>
        </div>
        
        {/* Header avec image de sport */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className={`h-32 ${event.sportColor || 'bg-gradient-to-r from-purple-500 to-blue-500'} flex items-center justify-center`}>
            <div className="text-center text-white">
              <div className="text-6xl mb-2">{event.sportEmoji || '🏃'}</div>
              <h1 className="text-2xl font-bold">{event.sport || 'Sport'}</h1>
            </div>
          </div>
          
          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">{event.name}</h1>
            
            {/* Informations principales */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPinIcon className="h-6 w-6 text-purple-600 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-800">{event.location}</p>
                    <p className="text-gray-600">{event.address || `${event.city} ${event.postcode}`}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CalendarIcon className="h-6 w-6 text-purple-600 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-800">
                      {event.date ? formatDate(event.date) : 'Date non définie'}
                    </p>
                    {event.endDate && (
                      <p className="text-gray-600">
                        {formatTime(event.date!)} - {formatTime(event.endDate)}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <UsersIcon className="h-6 w-6 text-purple-600 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-800">
                      {participants.length} / {event.maxParticipants} participants
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min((participants.length / event.maxParticipants) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <UserIcon className="h-6 w-6 text-purple-600 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-800">Organisateur</p>
                    <p className="text-gray-600">{event.createdByName || 'Anonyme'}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <PhoneIcon className="h-6 w-6 text-purple-600 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-800">Contact</p>
                    <p className="text-gray-600">{event.contactInfo}</p>
                  </div>
                </div>
                
                {event.isReserved && (
                  <div className="flex items-center gap-2">
                    <ClockIcon className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-green-700 bg-green-100 px-3 py-1 rounded-full">
                      Lieu réservé
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Description */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-800 mb-2">Description</h3>
              <p className="text-gray-700 leading-relaxed">{event.description}</p>
            </div>
            
            {/* Messages d'état */}
            {message && (
              <div className={`p-4 rounded-lg mb-6 ${
                message.includes("réussie") || message.includes("désinscrit") 
                  ? "bg-green-100 border border-green-200 text-green-800" 
                  : "bg-red-100 border border-red-200 text-red-800"
              }`}>
                <p className="font-medium">{message}</p>
              </div>
            )}
            
            {/* Section d'inscription */}
            {canRegister && (
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200 mb-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <UserIcon className="h-6 w-6 text-purple-600" />
                  S&apos;inscrire à cet événement
                </h3>
                <form onSubmit={e => { e.preventDefault(); handleRegister(); }} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Votre contact (email, téléphone, etc.) *
                    </label>
                    <input
                      type="text"
                      placeholder="ex: jean.dupont@email.com ou 06 12 34 56 78"
                      value={contact}
                      onChange={e => setContact(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                      required
                    />
                  </div>
                  <Button 
                    type="submit"
                    disabled={registering || !contact.trim()}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {registering ? 'Inscription en cours...' : 'S&apos;inscrire maintenant'}
                  </Button>
                </form>
              </div>
            )}
            
            {/* Messages d'état pour l'inscription */}
            {!user && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2">
                  <div className="text-yellow-600">⚠️</div>
                  <p className="text-yellow-800 font-medium">Connectez-vous pour vous inscrire à cet événement</p>
                </div>
              </div>
            )}
            
            {alreadyRegistered && !isCreator && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                <div className="text-center">
                  <div className="text-4xl mb-3">✅</div>
                  <h3 className="text-lg font-bold text-green-800 mb-4">Vous êtes inscrit à cet événement</h3>
                  <Button
                    className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-200"
                    onClick={handleUnregister}
                    disabled={registering}
                  >
                    {registering ? 'Désinscription...' : 'Se désinscrire'}
                  </Button>
                </div>
              </div>
            )}
            
            {isCreator && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="text-blue-600">👑</div>
                    <p className="text-blue-800 font-semibold">Vous êtes l&apos;organisateur de cet événement</p>
                  </div>
                  <Button
                    onClick={() => router.push(`/event-edit/${event.id}`)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200"
                  >
                    ✏️ Modifier l&apos;événement
                  </Button>
                </div>
              </div>
            )}
            
            {isEventFull && !alreadyRegistered && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2">
                  <div className="text-red-600">🚫</div>
                  <p className="text-red-800 font-semibold">Événement complet - Plus de places disponibles</p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Liste des participants */}
        {canSeeParticipants && (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <UsersIcon className="h-6 w-6 text-purple-600" />
              Participants inscrits ({participants.length})
            </h2>
            
            {participants.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">👥</div>
                <p className="text-gray-600">Aucun participant inscrit pour le moment.</p>
                <p className="text-sm text-gray-500 mt-1">Soyez le premier à vous inscrire !</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {participants
                  .sort((a, b) => {
                    if (event.createdBy === a.userId) return -1;
                    if (event.createdBy === b.userId) return 1;
                    return new Date(b.registeredAt?.seconds ? b.registeredAt.seconds * 1000 : 0).getTime() - 
                           new Date(a.registeredAt?.seconds ? a.registeredAt.seconds * 1000 : 0).getTime();
                  })
                  .map(p => (
                    <div key={p.id} className={`p-4 rounded-lg border transition-all duration-200 ${
                      event.createdBy === p.userId 
                        ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200' 
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                            event.createdBy === p.userId ? 'bg-blue-600' : 'bg-purple-600'
                          }`}>
                            {p.userName.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                              <span className="font-semibold text-gray-800 truncate">{p.userName}</span>
                              {event.createdBy === p.userId && (
                                <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full font-medium self-start sm:self-auto">
                                  Organisateur
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 truncate">{p.contact}</p>
                          </div>
                        </div>
                        {p.registeredAt && (
                          <div className="text-xs text-gray-500 sm:text-right">
                            Inscrit le {new Date(p.registeredAt.seconds * 1000).toLocaleDateString('fr-FR')}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 