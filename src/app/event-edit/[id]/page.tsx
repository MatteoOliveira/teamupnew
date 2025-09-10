'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

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
  createdBy: string;
  contactInfo: string;
  isReserved?: boolean;
}

export default function EventEditPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');

  // États pour l'édition
  const [editedEvent, setEditedEvent] = useState({
    name: '',
    city: '',
    location: '',
    address: '',
    postcode: '',
    sport: '',
    sportEmoji: '',
    sportColor: '',
    description: '',
    maxParticipants: 10,
    contactInfo: '',
    isReserved: false,
    date: '',
    endDate: '',
  });

  useEffect(() => {
    if (!id || !user) return;
    
    const fetchEvent = async () => {
      try {
        const eventDoc = await getDoc(doc(db, 'events', id as string));
        if (eventDoc.exists()) {
          const data = eventDoc.data();
          
          // Vérifier que l'utilisateur est l'organisateur
          if (data.createdBy !== user.uid) {
            setMessage('Vous n\'êtes pas autorisé à modifier cet événement');
            setMessageType('error');
            setLoading(false);
            return;
          }

          const eventData: Event = {
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
            createdBy: data.createdBy,
            contactInfo: data.contactInfo,
            isReserved: data.isReserved,
          };

          setEvent(eventData);

          // Initialiser les données éditées
          setEditedEvent({
            name: data.name || '',
            city: data.city || '',
            location: data.location || '',
            address: data.address || '',
            postcode: data.postcode || '',
            sport: data.sport || '',
            sportEmoji: data.sportEmoji || '',
            sportColor: data.sportColor || '',
            description: data.description || '',
            maxParticipants: data.maxParticipants || 10,
            contactInfo: data.contactInfo || '',
            isReserved: data.isReserved || false,
            date: data.date ? new Date(data.date.seconds * 1000).toISOString().slice(0, 16) : '',
            endDate: data.endDate ? new Date(data.endDate.seconds * 1000).toISOString().slice(0, 16) : '',
          });
        } else {
          setMessage('Événement non trouvé');
          setMessageType('error');
        }
      } catch (error) {
        console.error('Erreur lors du chargement de l\'événement:', error);
        setMessage('Erreur lors du chargement de l\'événement');
        setMessageType('error');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id, user]);

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setEditedEvent(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!event || !user) return;

    setSaving(true);
    setMessage('');
    setMessageType('');

    try {
      // Validation des champs obligatoires
      if (!editedEvent.name.trim()) {
        setMessage('Le nom de l\'événement est obligatoire');
        setMessageType('error');
        return;
      }

      if (!editedEvent.city.trim()) {
        setMessage('La ville est obligatoire');
        setMessageType('error');
        return;
      }

      if (!editedEvent.location.trim()) {
        setMessage('Le lieu est obligatoire');
        setMessageType('error');
        return;
      }

      if (!editedEvent.date) {
        setMessage('La date est obligatoire');
        setMessageType('error');
        return;
      }

      if (!editedEvent.contactInfo.trim()) {
        setMessage('Les informations de contact sont obligatoires');
        setMessageType('error');
        return;
      }

      // Préparer les données à sauvegarder
      const updateData: Record<string, unknown> = {
        name: editedEvent.name.trim(),
        city: editedEvent.city.trim(),
        location: editedEvent.location.trim(),
        address: editedEvent.address.trim(),
        postcode: editedEvent.postcode.trim(),
        sport: editedEvent.sport.trim(),
        sportEmoji: editedEvent.sportEmoji.trim(),
        sportColor: editedEvent.sportColor.trim(),
        description: editedEvent.description.trim(),
        maxParticipants: editedEvent.maxParticipants,
        contactInfo: editedEvent.contactInfo.trim(),
        isReserved: editedEvent.isReserved,
        updatedAt: new Date(),
      };

      // Convertir les dates
      if (editedEvent.date) {
        updateData.date = { seconds: Math.floor(new Date(editedEvent.date).getTime() / 1000) };
      }

      if (editedEvent.endDate) {
        updateData.endDate = { seconds: Math.floor(new Date(editedEvent.endDate).getTime() / 1000) };
      }

      // Sauvegarder les modifications
      await updateDoc(doc(db, 'events', event.id), updateData);

      setMessage('Événement modifié avec succès !');
      setMessageType('success');

      // Rediriger vers la page de détails après 2 secondes
      setTimeout(() => {
        router.push(`/event/${event.id}`);
      }, 2000);

    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      setMessage('Erreur lors de la sauvegarde. Veuillez réessayer.');
      setMessageType('error');
    } finally {
      setSaving(false);
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
          <Button
            onClick={() => router.push('/profile')}
            className="mt-4 bg-purple-600 hover:bg-purple-700 text-white"
          >
            Retour au profil
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Bouton de retour */}
        <div className="mb-6">
          <button
            onClick={() => router.push(`/event/${event.id}`)}
            className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors duration-200 group"
          >
            <ArrowLeftIcon className="h-5 w-5 group-hover:-translate-x-1 transition-transform duration-200" />
            <span className="font-medium">Retour aux détails</span>
          </button>
        </div>

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Modifier l&apos;événement</h1>
          <p className="text-gray-600">Modifiez les informations de votre événement</p>
        </div>

        {/* Formulaire de modification */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-6">
            {/* Informations de base */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom de l&apos;événement *
                </label>
                <Input
                  type="text"
                  value={editedEvent.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Ex: Match de football"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sport *
                </label>
                <Input
                  type="text"
                  value={editedEvent.sport}
                  onChange={(e) => handleInputChange('sport', e.target.value)}
                  placeholder="Ex: Football"
                />
              </div>
            </div>

            {/* Localisation */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ville *
                </label>
                <Input
                  type="text"
                  value={editedEvent.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="Ex: Paris"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lieu *
                </label>
                <Input
                  type="text"
                  value={editedEvent.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="Ex: Stade de France"
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse
                </label>
                <Input
                  type="text"
                  value={editedEvent.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Ex: 123 Rue de la Paix"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Code postal
                </label>
                <Input
                  type="text"
                  value={editedEvent.postcode}
                  onChange={(e) => handleInputChange('postcode', e.target.value)}
                  placeholder="Ex: 75001"
                />
              </div>
            </div>

            {/* Dates */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date et heure de début *
                </label>
                <Input
                  type="datetime-local"
                  value={editedEvent.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  placeholder=""
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date et heure de fin
                </label>
                <Input
                  type="datetime-local"
                  value={editedEvent.endDate}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                  placeholder=""
                />
              </div>
            </div>

            {/* Participants et contact */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre maximum de participants
                </label>
                <input
                  type="number"
                  min="1"
                  value={editedEvent.maxParticipants.toString()}
                  onChange={(e) => handleInputChange('maxParticipants', parseInt(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Informations de contact *
                </label>
                <Input
                  type="text"
                  value={editedEvent.contactInfo}
                  onChange={(e) => handleInputChange('contactInfo', e.target.value)}
                  placeholder="Ex: jean.dupont@email.com"
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={editedEvent.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Décrivez votre événement..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            {/* Options */}
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="isReserved"
                checked={editedEvent.isReserved}
                onChange={(e) => handleInputChange('isReserved', e.target.checked)}
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <label htmlFor="isReserved" className="text-sm font-medium text-gray-700">
                Lieu réservé
              </label>
            </div>

            {/* Message d'état */}
            {message && (
              <div className={`p-4 rounded-lg ${
                messageType === 'success' 
                  ? 'bg-green-100 border border-green-200 text-green-800' 
                  : 'bg-red-100 border border-red-200 text-red-800'
              }`}>
                <p className="font-medium">{message}</p>
              </div>
            )}

            {/* Boutons d'action */}
            <div className="flex space-x-4 pt-6 border-t border-gray-200">
              <Button
                type="button"
                onClick={() => router.push(`/event/${event.id}`)}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white"
                disabled={saving}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
              >
                {saving ? 'Sauvegarde...' : 'Sauvegarder les modifications'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
