'use client';

import { useState } from 'react';

export interface Availability {
  day: string;
  startTime: string;
  endTime: string;
}

interface AvailabilityProps {
  availabilities: Availability[];
  onUpdate: (availabilities: Availability[]) => void;
  isEditing: boolean;
}

const DAYS = [
  'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'
];

const TIME_SLOTS = [
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00',
  '20:00', '21:00', '22:00', '23:00'
];

export default function Availability({ availabilities, onUpdate, isEditing }: AvailabilityProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDay, setNewDay] = useState('');
  const [newStartTime, setNewStartTime] = useState('18:00');
  const [newEndTime, setNewEndTime] = useState('20:00');

  const addAvailability = () => {
    if (newDay && newStartTime && newEndTime && newStartTime < newEndTime) {
      // Vérifier qu'il n'y a pas de conflit
      const hasConflict = availabilities.some(av => 
        av.day === newDay && 
        ((newStartTime >= av.startTime && newStartTime < av.endTime) ||
         (newEndTime > av.startTime && newEndTime <= av.endTime) ||
         (newStartTime <= av.startTime && newEndTime >= av.endTime))
      );
      
      if (!hasConflict) {
        onUpdate([...availabilities, { day: newDay, startTime: newStartTime, endTime: newEndTime }]);
        setNewDay('');
        setNewStartTime('18:00');
        setNewEndTime('20:00');
        setShowAddForm(false);
      }
    }
  };

  const removeAvailability = (index: number) => {
    onUpdate(availabilities.filter((_, i) => i !== index));
  };

  const formatTime = (time: string) => {
    return time.slice(0, 5); // Format HH:MM
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Disponibilités</h3>
      
      {availabilities.length > 0 && (
        <div className="space-y-2">
          {availabilities.map((availability, index) => (
            <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center space-x-3">
                <span className="font-medium text-gray-900">{availability.day}</span>
                <span className="text-sm text-gray-600">
                  {formatTime(availability.startTime)} - {formatTime(availability.endTime)}
                </span>
              </div>
              {isEditing && (
                <button
                  onClick={() => removeAvailability(index)}
                  className="text-red-500 hover:text-red-700 p-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {isEditing && (
        <div className="space-y-3">
          {!showAddForm ? (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              + Ajouter une disponibilité
            </button>
          ) : (
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jour
                </label>
                <select
                  value={newDay}
                  onChange={(e) => setNewDay(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="" className="text-gray-500">Sélectionner un jour</option>
                  {DAYS.map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Début
                  </label>
                  <select
                    value={newStartTime}
                    onChange={(e) => setNewStartTime(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {TIME_SLOTS.map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fin
                  </label>
                  <select
                    value={newEndTime}
                    onChange={(e) => setNewEndTime(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {TIME_SLOTS.map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={addAvailability}
                  disabled={!newDay || newStartTime >= newEndTime}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Ajouter
                </button>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setNewDay('');
                    setNewStartTime('18:00');
                    setNewEndTime('20:00');
                  }}
                  className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
