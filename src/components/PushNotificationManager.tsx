'use client';

import { useState } from 'react';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import Button from '@/components/Button';

export default function PushNotificationManager() {
  const {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    error,
    subscribe,
    unsubscribe,
    needsPermission,
    token: stateToken,
  } = usePushNotifications();

  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');

  const handleSubscribe = async () => {
    setMessage('');
    setMessageType('');
    
    try {
      console.log('🚀 Début handleSubscribe');
      const success = await subscribe();
      console.log('🚀 Résultat subscribe:', success);
      
      if (success) {
        setMessage('Notifications push activées avec succès ! L&apos;abonnement sera mis à jour dans quelques secondes.');
        setMessageType('success');
        
        // Recharger la page après 2 secondes pour voir l'état mis à jour
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setMessage(error || 'Erreur lors de l\'activation des notifications');
        setMessageType('error');
      }
    } catch (error) {
      console.error('❌ Erreur handleSubscribe:', error);
      setMessage(`Erreur lors de l'activation des notifications: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
      setMessageType('error');
    }
  };

  const handleUnsubscribe = async () => {
    setMessage('');
    setMessageType('');
    
    const success = await unsubscribe();
    if (success) {
      setMessage('Notifications push désactivées avec succès !');
      setMessageType('success');
    } else {
      setMessage(error || 'Erreur lors de la désactivation des notifications');
      setMessageType('error');
    }
  };

  const handleTestNotification = () => {
    setMessage('');
    setMessageType('');
    
    try {
      // Créer une notification de test plus réaliste
      const testNotification = new Notification('🔔 Test TeamUp', {
        body: 'Ceci est un test de notification push depuis votre téléphone !',
        icon: '/icon-192x192.webp',
        badge: '/icon-192x192.webp',
        tag: 'teamup-test',
        requireInteraction: true
      });

      // Gérer les clics sur la notification
      testNotification.onclick = () => {
        window.focus();
        testNotification.close();
      };

      setMessage('📱 Notification de test envoyée ! Vérifiez votre téléphone.');
      setMessageType('success');
    } catch {
      setMessage('Erreur lors de l\'envoi de la notification de test');
      setMessageType('error');
    }
  };

  if (!isSupported) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">🔔 Notifications Push</h3>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Notifications non supportées
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>Votre navigateur ne supporte pas les notifications push. Essayez avec Chrome, Firefox ou Safari.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">🔔 Notifications Push</h3>
      
      {message && (
        <div className={`p-3 mb-4 rounded-md text-sm ${
          messageType === 'success' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {message}
        </div>
      )}

      {/* Message d'information sur l'auto-activation */}
      {!error && !message && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-blue-800 text-sm font-medium">
              Les notifications sont activées par défaut. Vous pouvez les désactiver si vous le souhaitez.
            </span>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Erreur
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* État des permissions */}
      <div className="mb-6">
        <h4 className="text-md font-medium text-gray-900 mb-3">État des permissions</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-700">Support des notifications</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              isSupported ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {isSupported ? 'Supporté' : 'Non supporté'}
            </span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-700">Permission accordée</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              permission.granted ? 'bg-green-100 text-green-800' : 
              permission.denied ? 'bg-red-100 text-red-800' : 
              'bg-yellow-100 text-yellow-800'
            }`}>
              {permission.granted ? 'Accordée' : 
               permission.denied ? 'Refusée' : 'Non demandée'}
            </span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-700">Abonnement actif</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              isSubscribed ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {isSubscribed ? 'Actif' : 'Inactif'}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-4">
        {needsPermission && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  📱 Comment activer les notifications ?
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p className="mb-2">Sur mobile (PWA) :</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Cliquez sur &quot;Activer les notifications&quot; ci-dessous</li>
                    <li>Autorisez dans la popup du navigateur</li>
                    <li>Testez avec le bouton &quot;Tester sur mobile&quot;</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          {/* Bouton d'activation - seulement si vraiment pas abonné ET permission accordée */}
          {!isSubscribed && permission.granted && (
            <Button
              onClick={handleSubscribe}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading ? 'Activation...' : 'Activer les notifications'}
            </Button>
          )}

          {/* Bouton de désactivation - visible par défaut (notifications activées par défaut) */}
          {(isSubscribed || (!permission.denied && !needsPermission)) && (
            <Button
              onClick={handleUnsubscribe}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isLoading ? 'Désactivation...' : 'Désactiver les notifications'}
            </Button>
          )}

          {/* Bouton de test - toujours visible si supporté */}
          {isSupported && (
            <Button
              onClick={handleTestNotification}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              📱 Tester sur mobile
            </Button>
          )}

          {/* Bouton de rechargement d'état */}
          <Button
            onClick={() => window.location.reload()}
            className="bg-gray-600 hover:bg-gray-700 text-white"
          >
            🔄 Recharger l&apos;état
          </Button>
        </div>
      </div>

      {/* Informations */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-900 mb-2">À propos des notifications</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Recevez des rappels pour vos événements</li>
          <li>• Soyez notifié des nouveaux messages</li>
          <li>• Restez informé des changements d&apos;événements</li>
          <li>• Les notifications fonctionnent même quand l&apos;app est fermée</li>
        </ul>
        
        {/* Test mobile */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <h5 className="text-sm font-medium text-blue-900 mb-2">📱 Test sur mobile</h5>
          <p className="text-sm text-blue-700 mb-2">
            Utilisez le bouton &quot;Tester sur mobile&quot; pour vérifier que les notifications fonctionnent sur votre téléphone. 
            La notification apparaîtra même si l&apos;application est fermée.
          </p>
          
          {/* Debug info */}
          <div className="mt-2 p-2 bg-white rounded border text-xs">
            <div className="text-gray-600 space-y-1">
              <div><strong>Debug :</strong></div>
              <div>• Permission: {permission.granted ? '✅ Accordée' : permission.denied ? '❌ Refusée' : '⏳ Non demandée'}</div>
              <div>• Abonnement: {isSubscribed ? '✅ Actif' : '❌ Inactif'}</div>
              <div>• Token: {stateToken ? '✅ Présent' : '❌ Absent'}</div>
              <div>• Support: {isSupported ? '✅ Oui' : '❌ Non'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
