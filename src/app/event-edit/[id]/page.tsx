'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc, collection, getDocs, query, where, addDoc } from 'firebase/firestore';
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

interface AddressSuggestion {
  properties: {
    label: string;
    city: string;
    postcode: string;
  };
  geometry: {
    coordinates: [number, number];
  };
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
  
  // États pour l'autocomplétion Google Maps
  const [addressSuggestions, setAddressSuggestions] = useState<AddressSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isAddressSelected, setIsAddressSelected] = useState(false);

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

  // Gestionnaire pour fermer les suggestions quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      // Ne fermer que si on clique vraiment en dehors des suggestions
      if (!target.closest('.address-suggestions')) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setEditedEvent(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Fonction d'autocomplétion Google Maps
  const searchAddress = async (query: string) => {
    console.log('🔍 Recherche d\'adresse:', query);
    if (query.length < 3) {
      setAddressSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const response = await fetch(
        `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&limit=5&type=housenumber&autocomplete=1`
      );
      const data = await response.json();
      console.log('📍 Suggestions reçues:', data.features?.length || 0);
      setAddressSuggestions(data.features || []);
      setShowSuggestions(true);
    } catch (error) {
      console.error("Erreur lors de la recherche d'adresse:", error);
    }
  };

  // Fonction pour sélectionner une adresse
  const selectAddress = (suggestion: AddressSuggestion) => {
    const { properties } = suggestion;
    setEditedEvent(prev => ({
      ...prev,
      address: properties.label,
      city: properties.city,
      postcode: properties.postcode
    }));
    setIsAddressSelected(true);
    setShowSuggestions(false);
    setAddressSuggestions([]);
  };

  // Fonction pour réinitialiser la sélection d'adresse
  const resetAddressSelection = () => {
    setIsAddressSelected(false);
    setEditedEvent(prev => ({
      ...prev,
      city: '',
      postcode: ''
    }));
  };

  // Fonction pour comparer les données et générer un résumé des changements
  const generateChangeSummary = (originalEvent: Event, editedData: Record<string, unknown>) => {
    const changes: string[] = [];
    
    // Comparer les champs modifiés
    if (originalEvent.name !== (editedData.name as string)?.trim()) {
      changes.push('le nom');
    }
    if (originalEvent.city !== (editedData.city as string)?.trim()) {
      changes.push('la ville');
    }
    if (originalEvent.location !== (editedData.location as string)?.trim()) {
      changes.push('le lieu');
    }
    if (originalEvent.address !== (editedData.address as string)?.trim()) {
      changes.push('l\'adresse');
    }
    if (originalEvent.postcode !== (editedData.postcode as string)?.trim()) {
      changes.push('le code postal');
    }
    if (originalEvent.sport !== (editedData.sport as string)?.trim()) {
      changes.push('le sport');
    }
    if (originalEvent.description !== (editedData.description as string)?.trim()) {
      changes.push('la description');
    }
    if (originalEvent.maxParticipants !== editedData.maxParticipants) {
      changes.push('le nombre de participants');
    }
    if (originalEvent.contactInfo !== (editedData.contactInfo as string)?.trim()) {
      changes.push('les informations de contact');
    }
    if (originalEvent.isReserved !== editedData.isReserved) {
      changes.push('le statut de réservation');
    }
    
    // Comparer les dates
    const originalDate = originalEvent.date ? new Date(originalEvent.date.seconds * 1000).toISOString().slice(0, 16) : '';
    const originalEndDate = originalEvent.endDate ? new Date(originalEvent.endDate.seconds * 1000).toISOString().slice(0, 16) : '';
    
    if (originalDate !== editedData.date) {
      changes.push('la date de début');
    }
    if (originalEndDate !== editedData.endDate) {
      changes.push('la date de fin');
    }
    
    return changes;
  };

  // Fonction pour envoyer des notifications aux participants
  const notifyParticipants = async (eventId: string, changeSummary: string[]) => {
    try {
      // Récupérer tous les participants
      const participantsQuery = query(collection(db, 'event_participants'), where('eventId', '==', eventId));
      const participantsSnapshot = await getDocs(participantsQuery);
      
      if (participantsSnapshot.empty) return;
      
      // Générer le message de notification
      const changesText = changeSummary.length > 0 
        ? changeSummary.join(', ') 
        : 'des informations';
      
      const notificationMessage = `L'événement "${event?.name}" a été modifié : ${changesText} ont été changés.`;
      
      // Créer une notification pour chaque participant
      const notifications = participantsSnapshot.docs.map(participantDoc => {
        const participantData = participantDoc.data();
        return {
          userId: participantData.userId,
          title: 'Événement modifié',
          body: notificationMessage,
          type: 'event_update',
          eventId: eventId,
          data: {
            eventId: eventId,
            action: 'view_event'
          },
          createdAt: new Date()
        };
      });
      
      // Sauvegarder les notifications dans Firestore
      const batch = notifications.map(notification => 
        addDoc(collection(db, 'notifications'), notification)
      );
      
      await Promise.all(batch);
      console.log(`Notifications envoyées à ${notifications.length} participants`);
      
    } catch (error) {
      console.error('Erreur lors de l\'envoi des notifications:', error);
    }
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

      // Générer le résumé des changements AVANT la sauvegarde
      const changeSummary = generateChangeSummary(event, editedEvent);
      
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

      // Envoyer des notifications aux participants si des changements ont été détectés
      if (changeSummary.length > 0) {
        await notifyParticipants(event.id, changeSummary);
      }

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
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors duration-200 group"
          >
            <ArrowLeftIcon className="h-5 w-5 group-hover:-translate-x-1 transition-transform duration-200" />
            <span className="font-medium">Retour aux événements</span>
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
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse
                </label>
                <input
                  type="text"
                  placeholder="Ex: 10 rue de Paris"
                  value={editedEvent.address}
                  onChange={(e) => {
                    handleInputChange('address', e.target.value);
                    searchAddress(e.target.value);
                    if (isAddressSelected) {
                      resetAddressSelection();
                    }
                  }}
                  onFocus={() => {
                    if (addressSuggestions.length > 0) {
                      setShowSuggestions(true);
                    }
                  }}
                  className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 text-sm"
                />
                
                {/* Bouton de réinitialisation */}
                {isAddressSelected && (
                  <button
                    type="button"
                    onClick={resetAddressSelection}
                    className="absolute right-3 top-8 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
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
