"use client";

import { useState } from "react";
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-black">
            Créer un événement sportif
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <Input
              type="text"
              placeholder="Nom de l'événement *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <select
              value={sport}
              onChange={(e) => setSport(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Sport *</option>
              {SPORTS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <Input
              type="datetime-local"
              placeholder="Date et heure *"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
            <Input
              type="text"
              placeholder="Lieu *"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
            <Input
              type="text"
              placeholder="Adresse * (ex: 10 rue de Paris)"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
            <Input
              type="text"
              placeholder="Ville *"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
            />
            <Input
              type="text"
              placeholder="Code postal *"
              value={postcode}
              onChange={(e) => setPostcode(e.target.value)}
              required
            />
            <Input
              type="number"
              placeholder="Nombre de participants max *"
              value={maxParticipants}
              onChange={e => setMaxParticipants(e.target.value)}
              required
              className="min-w-0"
            />
            <Input
              type="text"
              placeholder="Contact organisateur (email, téléphone, ou autre) *"
              value={contactInfo}
              onChange={e => setContactInfo(e.target.value)}
              required
            />
            <textarea
              placeholder="Description (optionnel)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
              rows={3}
            />
          </div>
          {message && (
            <div className={`text-sm text-center p-3 rounded ${message.includes("succès") ? "bg-green-100 text-black" : "bg-red-100 text-black"}`}>
              {message}
            </div>
          )}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Création..." : "Créer l&apos;événement"}
          </Button>
          <Button type="button" className="w-full bg-gray-200 text-gray-700 mt-2" onClick={() => router.push("/reservation")}>Annuler</Button>
        </form>
      </div>
    </div>
  );
} 