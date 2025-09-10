'use client';

import { useState } from 'react';
import { CompleteUserData } from '@/hooks/useUserData';

interface DataViewerProps {
  userData: CompleteUserData | null;
  loading: boolean;
}

export default function DataViewer({ userData, loading }: DataViewerProps) {
  const [showData, setShowData] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'events' | 'participations' | 'messages' | 'consent'>('profile');


  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex justify-between items-center mb-3">
          <h4 className="font-medium text-gray-900">Droit d&apos;Accès</h4>
          <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="bg-gray-50 p-3 rounded text-sm text-gray-500">
          Chargement de vos données...
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex justify-between items-center mb-3">
          <h4 className="font-medium text-gray-900">Droit d&apos;Accès</h4>
          <button
            onClick={() => setShowData(!showData)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            {showData ? 'Masquer' : 'Voir mes données'}
          </button>
        </div>
        <div className="bg-gray-50 p-3 rounded text-sm text-gray-500">
          Aucune donnée disponible
        </div>
      </div>
    );
  }

  const formatDate = (timestamp: { seconds: number }) => {
    return new Date(timestamp.seconds * 1000).toLocaleString('fr-FR');
  };

  const renderProfileData = () => (
    <div className="space-y-2">
      <div className="text-gray-800"><strong>Nom :</strong> {userData.profile.name || 'Non renseigné'}</div>
      <div className="text-gray-800"><strong>Sport préféré :</strong> {userData.profile.sport || 'Non renseigné'}</div>
      <div className="text-gray-800"><strong>Ville :</strong> {userData.profile.city || 'Non renseigné'}</div>
      <div className="text-gray-800"><strong>Email :</strong> {userData.profile.email || 'Non renseigné'}</div>
      <div className="text-gray-800"><strong>ID Utilisateur :</strong> {userData.uid}</div>
    </div>
  );

  const renderEventsData = () => (
    <div className="space-y-3">
      <div className="text-sm text-gray-600 mb-2">
        {userData.events.length} événement(s) créé(s)
      </div>
      {userData.events.length === 0 ? (
        <div className="text-gray-500 italic">Aucun événement créé</div>
      ) : (
        userData.events.map((event, index) => (
          <div key={event.id} className="bg-gray-50 p-3 rounded border">
            <div className="text-gray-900"><strong>Événement #{index + 1}</strong></div>
            <div className="text-gray-800"><strong>Nom :</strong> {event.name}</div>
            <div className="text-gray-800"><strong>Sport :</strong> {event.sport}</div>
            <div className="text-gray-800"><strong>Date :</strong> {event.date ? formatDate(event.date) : 'Non définie'}</div>
            <div className="text-gray-800"><strong>Lieu :</strong> {event.location}, {event.city}</div>
            <div className="text-gray-800"><strong>Créé le :</strong> {formatDate(event.createdAt)}</div>
            {event.description && (
              <div className="text-gray-800"><strong>Description :</strong> {event.description}</div>
            )}
          </div>
        ))
      )}
    </div>
  );

  const renderParticipationsData = () => (
    <div className="space-y-3">
      <div className="text-sm text-gray-600 mb-2">
        {userData.participations.length} participation(s)
      </div>
      {userData.participations.length === 0 ? (
        <div className="text-gray-500 italic">Aucune participation</div>
      ) : (
        userData.participations.map((participation, index) => (
          <div key={participation.id} className="bg-gray-50 p-3 rounded border">
            <div className="text-gray-900"><strong>Participation #{index + 1}</strong></div>
            <div className="text-gray-800"><strong>Événement :</strong> {participation.eventName}</div>
            <div className="text-gray-800"><strong>Date de l&apos;événement :</strong> {participation.eventDate ? formatDate(participation.eventDate) : 'Non définie'}</div>
            <div className="text-gray-800"><strong>Rejoint le :</strong> {formatDate(participation.joinedAt)}</div>
          </div>
        ))
      )}
    </div>
  );

  const renderMessagesData = () => (
    <div className="space-y-3">
      <div className="text-sm text-gray-600 mb-2">
        {userData.messages.length} message(s) envoyé(s)
      </div>
      {userData.messages.length === 0 ? (
        <div className="text-gray-500 italic">Aucun message envoyé</div>
      ) : (
        userData.messages.map((message, index) => (
          <div key={message.id} className="bg-gray-50 p-3 rounded border">
            <div className="text-gray-900"><strong>Message #{index + 1}</strong></div>
            <div className="text-gray-800"><strong>Contenu :</strong> {message.message}</div>
            <div className="text-gray-800"><strong>Envoyé le :</strong> {formatDate(message.timestamp)}</div>
            <div className="text-gray-800"><strong>Dans l&apos;événement :</strong> {message.eventId}</div>
          </div>
        ))
      )}
    </div>
  );

  const renderConsentData = () => (
    <div className="space-y-2">
      <div className="text-sm text-gray-600 mb-2">
        Préférences de cookies et consentements
      </div>
      {!userData.consent ? (
        <div className="text-gray-500 italic">Aucun consentement enregistré</div>
      ) : (
        <div className="space-y-2">
          <div className="text-gray-800"><strong>Analytics :</strong> {userData.consent.analytics ? '✅ Autorisé' : '❌ Refusé'}</div>
          <div className="text-gray-800"><strong>Marketing :</strong> {userData.consent.marketing ? '✅ Autorisé' : '❌ Refusé'}</div>
          <div className="text-gray-800"><strong>Version :</strong> {userData.consent.version}</div>
          <div className="text-gray-800"><strong>Dernière mise à jour :</strong> {new Date(userData.consent.timestamp).toLocaleString('fr-FR')}</div>
        </div>
      )}
    </div>
  );

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'profile':
        return renderProfileData();
      case 'events':
        return renderEventsData();
      case 'participations':
        return renderParticipationsData();
      case 'messages':
        return renderMessagesData();
      case 'consent':
        return renderConsentData();
      default:
        return renderProfileData();
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex justify-between items-center mb-3">
        <h4 className="font-medium text-gray-900">Droit d&apos;Accès</h4>
        <button
          onClick={() => setShowData(!showData)}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
        >
          {showData ? 'Masquer' : 'Voir mes données'}
        </button>
      </div>
      
      <p className="text-gray-600 text-sm mb-3">
        Consultez toutes vos données personnelles stockées dans notre application.
      </p>

      {showData && (
        <div className="space-y-4">
          {/* Onglets de navigation */}
          <div className="flex flex-wrap gap-2 border-b border-gray-200">
            {[
              { key: 'profile', label: 'Profil', count: 1 },
              { key: 'events', label: 'Événements', count: userData.events.length },
              { key: 'participations', label: 'Participations', count: userData.participations.length },
              { key: 'messages', label: 'Messages', count: userData.messages.length },
              { key: 'consent', label: 'Consentements', count: userData.consent ? 1 : 0 }
            ].map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as 'profile' | 'events' | 'participations' | 'messages' | 'consent')}
                className={`px-3 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                  activeTab === key
                    ? 'bg-blue-100 text-blue-700 border-b-2 border-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {label} ({count})
              </button>
            ))}
          </div>

          {/* Contenu de l'onglet actif */}
          <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
            {renderActiveTab()}
          </div>

          {/* Informations sur l'export */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <div className="w-5 h-5 text-blue-600 mt-0.5">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Informations sur vos données</p>
                <p>Ces données sont exportées le {new Date(userData.exportDate).toLocaleString('fr-FR')}</p>
                <p>Vous pouvez exporter toutes ces données en utilisant le bouton &quot;Exporter mes données&quot; ci-dessous.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
