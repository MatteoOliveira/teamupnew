"use client";

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Hors ligne
        </h1>
        <p className="text-gray-600 mb-8">
          Vous êtes actuellement hors ligne. Vérifiez votre connexion internet.
        </p>
        <button 
          onClick={() => window.location.reload()} 
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
          Réessayer
        </button>
      </div>
    </div>
  );
}
