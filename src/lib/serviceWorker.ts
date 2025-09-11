// Script pour enregistrer manuellement le service worker
export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      console.log('🔧 Enregistrement du service worker...');
      
      // Désinscrire tous les anciens service workers
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        console.log('🔧 Désinscription ancien SW:', registration.scope);
        await registration.unregister();
      }
      
      // Enregistrer notre service worker
      const registration = await navigator.serviceWorker.register('/sw-unified.js', {
        scope: '/'
      });
      
      console.log('🔧 Service worker enregistré:', registration.scope);
      
      // Attendre que le service worker soit actif
      await navigator.serviceWorker.ready;
      console.log('🔧 Service worker prêt !');
      
      return registration;
    } catch (error) {
      console.error('❌ Erreur enregistrement service worker:', error);
      throw error;
    }
  } else {
    console.log('❌ Service Worker non supporté');
    throw new Error('Service Worker non supporté');
  }
};
