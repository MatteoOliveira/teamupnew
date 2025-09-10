'use client';

import { useState } from 'react';
import { CompleteUserData } from '@/hooks/useUserData';
import Button from '@/components/Button';

interface DataExporterProps {
  userData: CompleteUserData | null;
}

export default function DataExporter({ userData }: DataExporterProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<'json' | 'csv'>('json');

  const formatDate = (timestamp: { seconds: number } | Date) => {
    if (timestamp instanceof Date) {
      return timestamp.toISOString();
    }
    return new Date(timestamp.seconds * 1000).toISOString();
  };

  const exportToJSON = () => {
    if (!userData) return;

    const exportData = {
      exportDate: new Date().toISOString(),
      userProfile: userData.profile,
      events: userData.events.map(event => ({
        id: event.id,
        name: event.name,
        sport: event.sport,
        date: event.date ? formatDate(event.date) : null,
        location: event.location,
        city: event.city,
        description: event.description,
        createdBy: event.createdBy,
        createdAt: formatDate(event.createdAt)
      })),
      participations: userData.participations.map(participation => ({
        id: participation.id,
        eventId: participation.eventId,
        eventName: participation.eventName,
        eventDate: participation.eventDate ? formatDate(participation.eventDate) : null,
        joinedAt: formatDate(participation.joinedAt)
      })),
      messages: userData.messages.map(message => ({
        id: message.id,
        eventId: message.eventId,
        eventName: message.eventName,
        senderId: message.senderId,
        senderName: message.senderName,
        content: message.content,
        timestamp: formatDate(message.timestamp)
      })),
      consent: userData.consent
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `teamup-data-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportToCSV = () => {
    if (!userData) return;

    const csvData = [];
    
    // En-tête
    csvData.push('Type,ID,Nom,Date,Ville,Description');
    
    // Profil
    csvData.push(`Profil,${userData.profile?.name || 'N/A'},${userData.profile?.name || 'N/A'},N/A,${userData.profile?.city || 'N/A'},Profil utilisateur`);
    
    // Événements
    userData.events.forEach(event => {
      csvData.push(`Événement,${event.id},"${event.name}",${event.date ? formatDate(event.date) : 'N/A'},${event.city},"${event.description}"`);
    });
    
    // Participations
    userData.participations.forEach(participation => {
      csvData.push(`Participation,${participation.id},"${participation.eventName}",${participation.eventDate ? formatDate(participation.eventDate) : 'N/A'},N/A,Participation à un événement`);
    });
    
    // Messages
    userData.messages.forEach(message => {
      csvData.push(`Message,${message.id},"${message.eventName}",${formatDate(message.timestamp)},N/A,"${message.content}"`);
    });

    const blob = new Blob([csvData.join('\n')], { 
      type: 'text/csv;charset=utf-8;' 
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `teamup-data-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      if (exportFormat === 'json') {
        exportToJSON();
      } else {
        exportToCSV();
      }
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
    } finally {
      setIsExporting(false);
    }
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

  const totalDataCount = 
    (userData.events?.length || 0) + 
    (userData.participations?.length || 0) + 
    (userData.messages?.length || 0) + 
    (userData.profile ? 1 : 0);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          📤 Droit à la Portabilité - Exporter mes données
        </h3>
      </div>

      <div className="space-y-6">
        {/* Résumé des données */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-md font-medium text-gray-900 mb-3">Résumé de vos données</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{userData.profile ? 1 : 0}</div>
              <div className="text-gray-600">Profil</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{userData.events?.length || 0}</div>
              <div className="text-gray-600">Événements</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{userData.participations?.length || 0}</div>
              <div className="text-gray-600">Participations</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{userData.messages?.length || 0}</div>
              <div className="text-gray-600">Messages</div>
            </div>
          </div>
          <div className="mt-3 text-center">
            <div className="text-lg font-semibold text-gray-900">
              Total: {totalDataCount} éléments
            </div>
          </div>
        </div>

        {/* Format d'export */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-3">Format d&apos;export</h4>
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="radio"
                name="exportFormat"
                value="json"
                checked={exportFormat === 'json'}
                onChange={(e) => setExportFormat(e.target.value as 'json' | 'csv')}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-700">
                <strong>JSON</strong> - Format complet avec toutes les métadonnées (recommandé)
              </span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="exportFormat"
                value="csv"
                checked={exportFormat === 'csv'}
                onChange={(e) => setExportFormat(e.target.value as 'json' | 'csv')}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-700">
                <strong>CSV</strong> - Format tabulaire pour tableur (Excel, Google Sheets)
              </span>
            </label>
          </div>
        </div>

        {/* Informations sur l'export */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-md font-medium text-blue-900 mb-2">ℹ️ Informations sur l&apos;export</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Toutes vos données personnelles seront incluses dans l&apos;export</li>
            <li>• Le fichier sera téléchargé automatiquement sur votre appareil</li>
            <li>• Les dates sont au format ISO 8601 (YYYY-MM-DDTHH:mm:ss.sssZ)</li>
            <li>• Vous pouvez utiliser ces données pour migrer vers une autre plateforme</li>
          </ul>
        </div>

        {/* Bouton d'export */}
        <div className="flex justify-center pt-4 border-t border-gray-200">
          <Button
            onClick={handleExport}
            disabled={isExporting || totalDataCount === 0}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExporting ? 'Export en cours...' : `Exporter mes données (${exportFormat.toUpperCase()})`}
          </Button>
        </div>
      </div>
    </div>
  );
}
