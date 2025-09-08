"use client";

import { useState, useEffect } from "react";

export const dynamic = 'force-dynamic';
import { collection, addDoc, Timestamp, doc, setDoc, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import Input from "@/components/Input";
import Button from "@/components/Button";

const SPORTS = [
  "Football",
  "Basketball",
  "Tennis",
  "Volleyball",
  "Badminton",
  "Ping-pong",
  "Running",
  "Autre"
];

interface EventData {
  id: string;
  date?: { seconds: number };
  endDate?: { seconds: number };
  location?: string;
  city?: string;
  isReserved?: boolean;
}



export default function EventCreatePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [sport, setSport] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [city, setCity] = useState("");
  const [postcode, setPostcode] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [address, setAddress] = useState("");
  const [maxParticipants, setMaxParticipants] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isReserved, setIsReserved] = useState(false);
  
  // États pour la vérification des conflits
  const [conflictStatus, setConflictStatus] = useState<'available' | 'partial' | 'occupied'>('available');
  const [conflictMessage, setConflictMessage] = useState("");
  const [checkingConflicts, setCheckingConflicts] = useState(false);
  
  // États pour l'autocomplétion Google Maps
  const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<any>(null);
  const [isAddressSelected, setIsAddressSelected] = useState(false);
  
  // États pour les popups de confirmation
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [confirmationType, setConfirmationType] = useState<'reserved' | 'not-reserved'>('not-reserved');

  // Fonction d'autocomplétion Google Maps
  const searchAddress = async (query: string) => {
    if (query.length < 3) {
      setAddressSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const response = await fetch(
        `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&limit=5`
      );
      const data = await response.json();
      
      if (data.features) {
        setAddressSuggestions(data.features);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error("Erreur lors de la recherche d'adresse:", error);
    }
  };

  // Fonction pour sélectionner une adresse
  const selectAddress = (suggestion: any) => {
    const { properties, geometry } = suggestion;
    setAddress(properties.label);
    setCity(properties.city);
    setPostcode(properties.postcode);
    setSelectedAddress(suggestion);
    setIsAddressSelected(true);
    setShowSuggestions(false);
    setAddressSuggestions([]);
  };

  // Fonction pour réinitialiser la sélection d'adresse
  const resetAddressSelection = () => {
    setIsAddressSelected(false);
    setSelectedAddress(null);
    setCity("");
    setPostcode("");
  };

  // Fonction de vérification des conflits de réservation
  const checkReservationConflicts = async (eventDate: string, eventEndDate: string, eventAddress: string, eventCity: string, eventPostcode: string) => {
    if (!eventDate || !eventAddress || !eventCity || !eventPostcode) {
      setConflictStatus('available');
      setConflictMessage("");
      return;
    }

    setCheckingConflicts(true);
    
    try {
      // Chercher TOUS les événements au même endroit (adresse + ville + code postal)
      const eventsQuery = query(
        collection(db, "events"),
        where("address", "==", eventAddress),
        where("city", "==", eventCity),
        where("postcode", "==", eventPostcode)
      );
      
      const eventsSnapshot = await getDocs(eventsQuery);
      const existingEvents: EventData[] = eventsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as EventData));

      const newEventStart = new Date(eventDate);
      const newEventEnd = eventEndDate ? new Date(eventEndDate) : new Date(newEventStart.getTime() + 2 * 60 * 60 * 1000); // +2h par défaut
      
      // Ajouter 5 minutes de buffer après chaque événement existant
      const bufferMinutes = 5;
      
      let conflicts = 0;
      let totalEvents = 0;
      let hasExistingEvent = false;
      
      for (const event of existingEvents) {
        if (!event.date?.seconds) continue;
        
        const existingStart = new Date(event.date.seconds * 1000);
        const existingEnd = event.endDate?.seconds 
          ? new Date(event.endDate.seconds * 1000)
          : new Date(existingStart.getTime() + 2 * 60 * 60 * 1000); // +2h par défaut
        
        totalEvents++;
        
        // Vérifier les chevauchements (sans buffer pour la détection d'événements existants)
        const hasConflict = (
          (newEventStart < existingEnd && newEventEnd > existingStart)
        );
        
        if (hasConflict) {
          hasExistingEvent = true;
          conflicts++;
        }
      }
      
      // Déterminer le statut
      if (totalEvents === 0) {
        setConflictStatus('available');
        setConflictMessage("✅ Aucun événement à cette adresse aujourd'hui. Encore des disponibilités de réservation.");
      } else if (hasExistingEvent) {
        setConflictStatus('occupied');
        setConflictMessage(`❌ Endroit non réservable à cette date et à ces horaires car il y a déjà un événement.`);
      } else {
        setConflictStatus('partial');
        setConflictMessage(`⚠️ ${totalEvents} événement(s) existant(s) à cette adresse mais créneaux disponibles.`);
      }
      
    } catch (error) {
      console.error("Erreur lors de la vérification des conflits:", error);
      setConflictStatus('available');
      setConflictMessage("⚠️ Impossible de vérifier les disponibilités. Vérification manuelle recommandée.");
    } finally {
      setCheckingConflicts(false);
    }
  };

  // Vérification en temps réel des conflits
  useEffect(() => {
    if (date && address && city && postcode) {
      const timeoutId = setTimeout(() => {
        checkReservationConflicts(date, endDate, address, city, postcode);
      }, 500); // Délai de 500ms pour éviter trop de requêtes
      
      return () => clearTimeout(timeoutId);
    } else {
      setConflictStatus('available');
      setConflictMessage("");
    }
  }, [date, endDate, address, city, postcode]);

  // Fermer les suggestions d'adresse quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.address-suggestions')) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    if (!user) {
      setMessage("Vous devez être connecté pour créer un événement.");
      return;
    }
    if (!name || !sport || !date || !location || !city || !postcode || !address || !maxParticipants || Number(maxParticipants) < 2 || !contactInfo) {
      setMessage("Tous les champs obligatoires doivent être remplis, le nombre de participants doit être au moins 2, et un moyen de contact doit être fourni.");
      return;
    }
    
    // Validation de la date de fin si réservation activée
    if (isReserved && (!endDate || new Date(endDate) <= new Date(date))) {
      setMessage("Si vous réservez le lieu, la date de fin doit être renseignée et postérieure à la date de début.");
      return;
    }
    
    // Vérification des conflits
    await checkReservationConflicts(date, endDate, address, city, postcode);
    if (conflictStatus === 'occupied') {
      setMessage("Impossible de créer l'événement : ce lieu est déjà occupé à cette heure. Veuillez choisir un autre créneau ou un autre endroit.");
      return;
    }
    
    // Afficher le popup de confirmation
    setConfirmationType(isReserved ? 'reserved' : 'not-reserved');
    setShowConfirmationModal(true);
  };

  const handleConfirmCreation = async () => {
    setShowConfirmationModal(false);
    setLoading(true);
    
    if (!user) {
      setMessage("Vous devez être connecté pour créer un événement.");
      setLoading(false);
      return;
    }
    
    try {
      // Géocodage précis via API adresse.data.gouv.fr
      const fullAddress = `${address}, ${postcode} ${city}`;
      const response = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(fullAddress)}&limit=1`);
      const data = await response.json();
      if (!data.features || data.features.length === 0) {
        setMessage("Adresse, ville et code postal non trouvés ou ne correspondent pas.");
        setLoading(false);
        return;
      }
      const { coordinates } = data.features[0].geometry; // [lng, lat]
      // 1. Création de l'événement
      const eventRef = await addDoc(collection(db, "events"), {
        name,
        sport,
        date: Timestamp.fromDate(new Date(date)),
        endDate: endDate ? Timestamp.fromDate(new Date(endDate)) : null,
        location,
        city,
        postcode,
        address,
        lat: coordinates[1],
        lng: coordinates[0],
        description,
        createdBy: user.uid,
        createdAt: new Date(),
        maxParticipants: Number(maxParticipants),
        contactInfo,
        isReserved: isReserved,
      });
      // 2. Inscrire automatiquement l'organisateur comme participant (et membre du groupe)
      await addDoc(collection(db, "event_participants"), {
        eventId: eventRef.id,
        userId: user.uid,
        registeredAt: new Date(),
        userName: user.displayName || user.email || "Organisateur",
        contact: contactInfo,
        isOrganizer: true,
      });
      // 4. Ajouter l'organisateur comme membre du salon (accès immédiat au groupe de messages)
      await setDoc(doc(db, "event_chats", eventRef.id, "members", user.uid), {
        userId: user.uid,
        userName: user.displayName || user.email || "Organisateur",
        isOrganizer: true,
        joinedAt: new Date(),
      });
      // 3. Créer le salon de discussion pour l'événement
      // Calculer la date de suppression automatique (2 jours après la date de l'événement)
      const eventDateObj = new Date(date);
      const deletedAt = new Date(eventDateObj.getTime() + 2 * 24 * 60 * 60 * 1000); // +2 jours
      await setDoc(doc(db, "event_chats", eventRef.id), {
        eventId: eventRef.id,
        createdAt: new Date(),
        eventName: name,
        eventDate: Timestamp.fromDate(new Date(date)),
        deletedAt: Timestamp.fromDate(deletedAt),
      });
      setMessage("Événement créé avec succès !");
      setTimeout(() => router.push("/reservation"), 1200);
    } catch (error) {
      setMessage("Erreur lors de la création de l'événement.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Modal de confirmation */}
      {showConfirmationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                confirmationType === 'reserved' 
                  ? 'bg-blue-100' 
                  : 'bg-yellow-100'
              }`}>
                <svg className={`w-5 h-5 ${
                  confirmationType === 'reserved' 
                    ? 'text-blue-600' 
                    : 'text-yellow-600'
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Confirmation de création
              </h3>
            </div>
            
            <div className="mb-6">
              {confirmationType === 'reserved' ? (
                <div>
                  <p className="text-gray-700 mb-3">
                    <strong>Êtes-vous sûr de réserver le lieu ?</strong>
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                    <p className="text-sm text-blue-800">
                      • Personne ne pourra créer d'événement pendant ces horaires le même jour.
                    </p>
                    <p className="text-sm text-blue-800">
                      • Ils pourront créer un autre événement 5 min après la fin de votre événement.
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-gray-700 mb-3">
                    <strong>Êtes-vous sûr de ne pas réserver le lieu ?</strong>
                  </p>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
                    <p className="text-sm text-yellow-800">
                      • D'autres personnes pourront créer un événement au même endroit et à la même heure.
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowConfirmationModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmCreation}
                className={`flex-1 px-4 py-2 rounded-lg text-white font-medium transition-colors ${
                  confirmationType === 'reserved'
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-yellow-600 hover:bg-yellow-700'
                }`}
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-1 md:py-12 px-2 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-2 md:p-8">
          {/* Header Desktop */}
          <div className="hidden md:block text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl mb-4 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-2">
              Créer un événement sportif
            </h2>
            <p className="text-gray-600">
              Organisez votre événement et trouvez des participants
            </p>
          </div>

          {/* Header Mobile minimal - Utilisateur connecté */}
          <div className="md:hidden flex items-center justify-center mb-2">
            <div className="flex items-center space-x-1">
              <div className="w-5 h-5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-md flex items-center justify-center">
                <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h2 className="text-xs font-bold text-gray-900">
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">TeamUp</span>
              </h2>
            </div>
          </div>
          <form className="space-y-2 md:space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-6">
              <div className="md:col-span-2">
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">
                  Nom de l&apos;événement *
                </label>
                <Input
                  type="text"
                  placeholder="Ex: Match de football samedi"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">
                  Sport *
                </label>
                <select
                  value={sport}
                  onChange={(e) => setSport(e.target.value)}
                  required
                  className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 text-sm"
                >
                  <option value="">Sélectionnez un sport</option>
                  {SPORTS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">
                  Date et heure de début *
                </label>
                <Input
                  type="datetime-local"
                  placeholder=""
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className={`w-full px-3 py-2 md:px-4 md:py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent bg-white text-gray-900 text-sm transition-colors ${
                    isReserved 
                      ? conflictStatus === 'available'
                        ? 'border-green-300 focus:ring-green-500'
                        : conflictStatus === 'partial'
                        ? 'border-yellow-300 focus:ring-yellow-500'
                        : 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                />
              </div>
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">
                  Date et heure de fin (optionnel)
                </label>
                <Input
                  type="datetime-local"
                  placeholder=""
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className={`w-full px-3 py-2 md:px-4 md:py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent bg-white text-gray-900 text-sm transition-colors ${
                    isReserved 
                      ? conflictStatus === 'available'
                        ? 'border-green-300 focus:ring-green-500'
                        : conflictStatus === 'partial'
                        ? 'border-yellow-300 focus:ring-yellow-500'
                        : 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">
                  Lieu *
                </label>
                <Input
                  type="text"
                  placeholder="Ex: Stade municipal, Salle de sport..."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                  className={`w-full px-3 py-2 md:px-4 md:py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent bg-white text-gray-900 text-sm transition-colors ${
                    isReserved 
                      ? conflictStatus === 'available'
                        ? 'border-green-300 focus:ring-green-500'
                        : conflictStatus === 'partial'
                        ? 'border-yellow-300 focus:ring-yellow-500'
                        : 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">
                  Adresse complète *
                  {isAddressSelected && (
                    <span className="ml-2 text-xs text-green-600 font-normal">
                      ✓ Adresse sélectionnée
                    </span>
                  )}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Ex: 10 rue de Paris"
                    value={address}
                    onChange={(e) => {
                      setAddress(e.target.value);
                      searchAddress(e.target.value);
                      if (isAddressSelected) {
                        resetAddressSelection();
                      }
                    }}
                    onFocus={() => addressSuggestions.length > 0 && setShowSuggestions(true)}
                    required
                    className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 text-sm"
                  />
                  
                  {/* Bouton de réinitialisation */}
                  {isAddressSelected && (
                    <button
                      type="button"
                      onClick={resetAddressSelection}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      title="Réinitialiser l'adresse"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                  
                  {/* Suggestions d'adresses */}
                  {showSuggestions && addressSuggestions.length > 0 && (
                    <div className="address-suggestions absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {addressSuggestions.map((suggestion, index) => (
                        <div
                          key={index}
                          className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                          onClick={() => selectAddress(suggestion)}
                        >
                          <div className="text-sm font-medium text-gray-900">
                            {suggestion.properties.label}
                          </div>
                          <div className="text-xs text-gray-500">
                            {suggestion.properties.city} {suggestion.properties.postcode}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">
                  Ville *
                  {isAddressSelected && (
                    <span className="ml-2 text-xs text-green-600 font-normal">
                      ✓ Auto-remplie
                    </span>
                  )}
                </label>
                <input
                  type="text"
                  placeholder="Ex: Paris"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                  readOnly={isAddressSelected}
                  className={`w-full px-3 py-2 md:px-4 md:py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent text-gray-900 text-sm ${
                    isAddressSelected
                      ? 'border-green-300 bg-green-50 text-green-800 cursor-not-allowed'
                      : 'border-gray-300 bg-white focus:ring-blue-500'
                  }`}
                />
              </div>
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">
                  Code postal *
                  {isAddressSelected && (
                    <span className="ml-2 text-xs text-green-600 font-normal">
                      ✓ Auto-rempli
                    </span>
                  )}
                </label>
                <input
                  type="text"
                  placeholder="Ex: 75001"
                  value={postcode}
                  onChange={(e) => setPostcode(e.target.value)}
                  required
                  readOnly={isAddressSelected}
                  className={`w-full px-3 py-2 md:px-4 md:py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent text-gray-900 text-sm ${
                    isAddressSelected
                      ? 'border-green-300 bg-green-50 text-green-800 cursor-not-allowed'
                      : 'border-gray-300 bg-white focus:ring-blue-500'
                  }`}
                />
              </div>
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">
                  Nombre de participants max *
                </label>
                <Input
                  type="number"
                  placeholder="Ex: 10"
                  value={maxParticipants}
                  onChange={e => setMaxParticipants(e.target.value)}
                  required
                  className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">
                  Contact organisateur *
                </label>
                <Input
                  type="text"
                  placeholder="Ex: jean@email.com ou 06 12 34 56 78"
                  value={contactInfo}
                  onChange={e => setContactInfo(e.target.value)}
                  required
                  className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 text-sm"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">
                  Description (optionnel)
                </label>
                <textarea
                  placeholder="Décrivez votre événement, les règles, l'équipement nécessaire..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 resize-none text-sm"
                  rows={2}
                />
              </div>
            </div>
            
            {/* Section de réservation du lieu */}
            <div className="md:col-span-2 mt-4">
              <div className={`flex items-center p-3 md:p-4 rounded-lg border ${
                conflictStatus === 'occupied' 
                  ? 'bg-red-50 border-red-200' 
                  : 'bg-blue-50 border-blue-200'
              }`}>
                <input
                  type="checkbox"
                  id="isReserved"
                  checked={isReserved}
                  onChange={(e) => setIsReserved(e.target.checked)}
                  disabled={conflictStatus === 'occupied'}
                  className={`h-3 w-3 md:h-5 md:w-5 focus:ring-blue-500 border-gray-300 rounded ${
                    conflictStatus === 'occupied'
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-blue-600'
                  }`}
                />
                <label htmlFor="isReserved" className={`ml-2 md:ml-3 block text-xs md:text-sm font-medium ${
                  conflictStatus === 'occupied'
                    ? 'text-gray-500'
                    : 'text-gray-900'
                }`}>
                  {conflictStatus === 'occupied' 
                    ? 'Lieu non réservable (événement existant à ces horaires)'
                    : 'Réserver le lieu (empêche d\'autres événements au même endroit)'
                  }
                </label>
              </div>
              
              {/* Affichage du statut de disponibilité */}
              {(date && address && city && postcode) && (
                <div className={`mt-3 p-3 rounded-lg border-2 transition-all duration-300 ${
                  conflictStatus === 'available' 
                    ? 'bg-green-50 border-green-200' 
                    : conflictStatus === 'partial'
                    ? 'bg-yellow-50 border-yellow-200'
                    : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-center space-x-2">
                    {checkingConflicts ? (
                      <>
                        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-sm text-gray-600">Vérification des disponibilités...</span>
                      </>
                    ) : (
                      <>
                        <div className={`w-3 h-3 rounded-full ${
                          conflictStatus === 'available' 
                            ? 'bg-green-500' 
                            : conflictStatus === 'partial'
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}></div>
                        <span className={`text-sm font-medium ${
                          conflictStatus === 'available' 
                            ? 'text-green-700' 
                            : conflictStatus === 'partial'
                            ? 'text-yellow-700'
                            : 'text-red-700'
                        }`}>
                          {conflictMessage}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {message && (
              <div className={`text-sm text-center p-4 rounded-lg ${message.includes("succès") ? "bg-green-100 text-green-800 border border-green-200" : "bg-red-100 text-red-800 border border-red-200"}`}>
                {message}
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row gap-2 md:gap-4 pt-2 md:pt-6">
              <Button type="submit" disabled={loading} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1.5 md:py-3 px-3 md:px-6 rounded-lg transition-colors text-xs md:text-base">
                {loading ? "Création..." : "Créer l'événement"}
              </Button>
              <Button type="button" className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-1.5 md:py-3 px-3 md:px-6 rounded-lg transition-colors text-xs md:text-base" onClick={() => router.push("/reservation")}>
                Annuler
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
    </>
  );
} 