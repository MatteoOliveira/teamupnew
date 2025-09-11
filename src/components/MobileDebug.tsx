'use client';

import { useState, useEffect } from 'react';
import { useEventCache } from '@/hooks/useEventCache';

export default function MobileDebug() {
  const { cachedEvents, isEventCached } = useEventCache();
  const [isVisible, setIsVisible] = useState(false);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);

  // Intercepter les console.log pour les afficher
  useEffect(() => {
    const originalLog = console.log;
    console.log = (...args) => {
      originalLog(...args);
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
      ).join(' ');
      
      setDebugLogs(prev => [...prev.slice(-9), `${new Date().toLocaleTimeString()}: ${message}`]);
    };
  }, []);

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-red-500 text-white p-2 rounded-full shadow-lg z-50"
      >
        🐛 Debug
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-90 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm max-h-96 overflow-y-auto">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-sm">🐛 Debug Mobile</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-white hover:text-gray-300"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-2 text-xs">
        <div>
          <strong>Cache Events:</strong> {cachedEvents.length}
        </div>
        
        <div>
          <strong>Events en cache:</strong>
          <div className="max-h-20 overflow-y-auto">
            {cachedEvents.map(event => (
              <div key={event.id} className="text-xs">
                • {event.name} ({event.id.slice(0, 8)}...)
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <strong>Logs récents:</strong>
          <div className="max-h-32 overflow-y-auto bg-gray-800 p-2 rounded text-xs">
            {debugLogs.map((log, index) => (
              <div key={index} className="mb-1">
                {log}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
