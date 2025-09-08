"use client";

import { useState } from "react";

export const dynamic = 'force-dynamic';
import { collection, addDoc, Timestamp, doc, setDoc } from "firebase/firestore";
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
    setLoading(true);
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
                  Nom de l'événement *
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
                  className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 text-sm"
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
                  className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 text-sm"
                />
              </div>
              <div className="md:col-span-2">
                <div className="flex items-center p-2 md:p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <input
                    type="checkbox"
                    id="isReserved"
                    checked={isReserved}
                    onChange={(e) => setIsReserved(e.target.checked)}
                    className="h-3 w-3 md:h-5 md:w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isReserved" className="ml-1 md:ml-3 block text-xs font-medium text-gray-900">
                    Réserver le lieu (empêche d'autres événements au même endroit)
                  </label>
                </div>
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
                  className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 text-sm"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">
                  Adresse complète *
                </label>
                <Input
                  type="text"
                  placeholder="Ex: 10 rue de Paris"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                  className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">
                  Ville *
                </label>
                <Input
                  type="text"
                  placeholder="Ex: Paris"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                  className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">
                  Code postal *
                </label>
                <Input
                  type="text"
                  placeholder="Ex: 75001"
                  value={postcode}
                  onChange={(e) => setPostcode(e.target.value)}
                  required
                  className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 text-sm"
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
                  min="2"
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
            
            {message && (
              <div className={`text-sm text-center p-4 rounded-lg ${message.includes("succès") ? "bg-green-100 text-green-800 border border-green-200" : "bg-red-100 text-red-800 border border-red-200"}`}>
                {message}
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row gap-2 md:gap-4 pt-2 md:pt-6">
              <Button type="submit" disabled={loading} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1.5 md:py-3 px-3 md:px-6 rounded-lg transition-colors text-xs md:text-base">
                {loading ? "Création..." : "Créer l&apos;événement"}
              </Button>
              <Button type="button" className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-1.5 md:py-3 px-3 md:px-6 rounded-lg transition-colors text-xs md:text-base" onClick={() => router.push("/reservation")}>
                Annuler
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 