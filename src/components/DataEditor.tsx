'use client';

import { useState, useEffect } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { CompleteUserData } from '@/hooks/useUserData';

interface DataEditorProps {
  userData: CompleteUserData | null;
  onDataUpdated: () => void;
}

export default function DataEditor({ userData, onDataUpdated }: DataEditorProps) {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');

  // États pour l'édition
  const [editedData, setEditedData] = useState({
    name: '',
    sport: '',
    city: '',
    notifications: {
      groupMessages: true,
      eventReminders: true,
      newEventsInCity: true,
      eventRegistration: true,
      eventChanges: true,
    },
  });

  // Initialiser les données éditées
  useEffect(() => {
    if (userData?.profile) {
      setEditedData({
        name: userData.profile.name || '',
        sport: userData.profile.sport || '',
        city: userData.profile.city || '',
        notifications: {
          groupMessages: true,
          eventReminders: true,
          newEventsInCity: true,
          eventRegistration: true,
          eventChanges: true,
        },
      });
    }
  }, [userData]);

  const handleInputChange = (field: 'name' | 'sport' | 'city', value: string) => {
    setEditedData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNotificationChange = (notification: keyof typeof editedData.notifications, value: boolean) => {
    setEditedData(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [notification]: value
      }
    }));
  };

  const handleSave = async () => {
    if (!user) return;

    setIsSaving(true);
    setMessage('');
    setMessageType('');

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        name: editedData.name,
        sport: editedData.sport,
        city: editedData.city,
        notifications: editedData.notifications,
        updatedAt: new Date()
      });

      setMessage('Données mises à jour avec succès !');
      setMessageType('success');
      setIsEditing(false);
      onDataUpdated(); // Rafraîchir les données
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      setMessage('Erreur lors de la mise à jour des données');
      setMessageType('error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (userData?.profile) {
      setEditedData({
        name: userData.profile.name || '',
        sport: userData.profile.sport || '',
        city: userData.profile.city || '',
        notifications: {
          groupMessages: true,
          eventReminders: true,
          newEventsInCity: true,
          eventRegistration: true,
          eventChanges: true,
        },
      });
    }
    setIsEditing(false);
    setMessage('');
    setMessageType('');
  };

  if (!userData) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Droit de Rectification - Modifier mes données
        </h3>
        {!isEditing && (
          <Button
            onClick={() => setIsEditing(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            Modifier
          </Button>
        )}
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded-lg ${
          messageType === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message}
        </div>
      )}

      <div className="space-y-6">
        {/* Informations personnelles */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-3">Informations personnelles</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom
              </label>
              <Input
                type="text"
                value={editedData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                disabled={!isEditing}
                className="w-full"
                placeholder="Votre nom"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sport favori
              </label>
              <Input
                type="text"
                value={editedData.sport}
                onChange={(e) => handleInputChange('sport', e.target.value)}
                disabled={!isEditing}
                className="w-full"
                placeholder="Votre sport favori"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ville
              </label>
              <Input
                type="text"
                value={editedData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                disabled={!isEditing}
                className="w-full"
                placeholder="Votre ville"
              />
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-3">Préférences de notification</h4>
          <div className="space-y-3">
            {Object.entries(editedData.notifications).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <label className="text-sm text-gray-700">
                  {key === 'groupMessages' && 'Messages de groupe'}
                  {key === 'eventReminders' && 'Rappels d\'événements'}
                  {key === 'newEventsInCity' && 'Nouveaux événements dans ma ville'}
                  {key === 'eventRegistration' && 'Inscriptions aux événements'}
                  {key === 'eventChanges' && 'Modifications d\'événements'}
                </label>
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => handleNotificationChange(key as keyof typeof editedData.notifications, e.target.checked)}
                  disabled={!isEditing}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded disabled:opacity-50"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Boutons d'action */}
        {isEditing && (
          <div className="flex space-x-3 pt-4 border-t border-gray-200">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
            >
              {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
            </Button>
            <Button
              onClick={handleCancel}
              disabled={isSaving}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
            >
              Annuler
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
