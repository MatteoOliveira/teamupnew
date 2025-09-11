'use client';

import { useState } from 'react';

export interface SportLevel {
  sport: string;
  level: 'débutant' | 'intermédiaire' | 'confirmé';
}

interface SportLevelProps {
  sportLevels: SportLevel[];
  onUpdate: (sportLevels: SportLevel[]) => void;
  isEditing: boolean;
}

const SPORTS = [
  'Football', 'Basketball', 'Tennis', 'Natation', 'Course', 
  'Cyclisme', 'Volleyball', 'Badminton', 'Rugby', 'Handball',
  'Athlétisme', 'Escalade', 'Boxe', 'Arts martiaux', 'Danse',
  'Yoga', 'Pilates', 'Musculation', 'Crossfit', 'Autre'
];

const LEVELS = [
  { value: 'débutant', label: 'Débutant', color: 'bg-green-100 text-green-800' },
  { value: 'intermédiaire', label: 'Intermédiaire', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'confirmé', label: 'Confirmé', color: 'bg-red-100 text-red-800' }
];

export default function SportLevel({ sportLevels, onUpdate, isEditing }: SportLevelProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSport, setNewSport] = useState('');
  const [newLevel, setNewLevel] = useState<'débutant' | 'intermédiaire' | 'confirmé'>('débutant');

  const addSport = () => {
    if (newSport && !sportLevels.find(sl => sl.sport === newSport)) {
      onUpdate([...sportLevels, { sport: newSport, level: newLevel }]);
      setNewSport('');
      setNewLevel('débutant');
      setShowAddForm(false);
    }
  };

  const removeSport = (sport: string) => {
    onUpdate(sportLevels.filter(sl => sl.sport !== sport));
  };

  const updateLevel = (sport: string, level: 'débutant' | 'intermédiaire' | 'confirmé') => {
    onUpdate(sportLevels.map(sl => 
      sl.sport === sport ? { ...sl, level } : sl
    ));
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Sports Pratiqués</h3>
      
      {sportLevels.length > 0 && (
        <div className="space-y-2">
          {sportLevels.map((sportLevel) => (
            <div key={sportLevel.sport} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center space-x-3">
                <span className="font-medium text-gray-900">{sportLevel.sport}</span>
                {isEditing ? (
                  <select
                    value={sportLevel.level}
                    onChange={(e) => updateLevel(sportLevel.sport, e.target.value as 'débutant' | 'intermédiaire' | 'confirmé')}
                    className="text-sm border border-gray-300 rounded px-2 py-1 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {LEVELS.map(level => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${LEVELS.find(l => l.value === sportLevel.level)?.color}`}>
                    {LEVELS.find(l => l.value === sportLevel.level)?.label}
                  </span>
                )}
              </div>
              {isEditing && (
                <button
                  onClick={() => removeSport(sportLevel.sport)}
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
              + Ajouter un sport
            </button>
          ) : (
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sport
                </label>
                <select
                  value={newSport}
                  onChange={(e) => setNewSport(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="" className="text-gray-500">Sélectionner un sport</option>
                  {SPORTS.map(sport => (
                    <option key={sport} value={sport}>{sport}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Niveau
                </label>
                <select
                  value={newLevel}
                  onChange={(e) => setNewLevel(e.target.value as 'débutant' | 'intermédiaire' | 'confirmé')}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {LEVELS.map(level => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={addSport}
                  disabled={!newSport}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Ajouter
                </button>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setNewSport('');
                    setNewLevel('débutant');
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
