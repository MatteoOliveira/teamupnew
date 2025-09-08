'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { auth, googleProvider } from '@/lib/firebase';
import { signInWithPopup, signInWithRedirect, getRedirectResult } from 'firebase/auth';

interface LogEntry {
  timestamp: string;
  type: 'info' | 'success' | 'error' | 'warning';
  message: string;
  data?: unknown;
}

export default function DebugPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const addLog = (type: LogEntry['type'], message: string, data?: unknown) => {
    const log: LogEntry = {
      timestamp: new Date().toLocaleTimeString(),
      type,
      message,
      data
    };
    setLogs(prev => [...prev, log]);
    console.log(`[${type.toUpperCase()}] ${message}`, data);
  };

  useEffect(() => {
    addLog('info', 'Page de diagnostic chargée');
    if (typeof window !== 'undefined') {
      addLog('info', 'User Agent', navigator.userAgent);
      addLog('info', 'Is Mobile', /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
      addLog('info', 'Is Standalone', window.matchMedia('(display-mode: standalone)').matches);
      addLog('info', 'Current URL', window.location.href);
    }
    addLog('info', 'User logged in', !!user);
  }, [user]);

  const testGoogleSignIn = async () => {
    setLoading(true);
    addLog('info', 'Début du test Google OAuth');
    
    try {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      addLog('info', 'Détection mobile', { isMobile });
      
      if (isMobile) {
        addLog('info', 'Tentative avec signInWithPopup sur mobile');
        try {
          const result = await signInWithPopup(auth, googleProvider);
          addLog('success', 'Connexion Google réussie avec popup !', { user: result.user.email });
        } catch (popupError) {
          addLog('warning', 'Popup échoué, tentative avec redirect', popupError);
          addLog('info', 'Redirection vers Google...');
          await signInWithRedirect(auth, googleProvider);
        }
      } else {
        addLog('info', 'Tentative avec signInWithPopup sur desktop');
        const result = await signInWithPopup(auth, googleProvider);
        addLog('success', 'Connexion Google réussie !', { user: result.user.email });
      }
    } catch (error: unknown) {
      addLog('error', 'Erreur Google OAuth', {
        code: error && typeof error === 'object' && 'code' in error ? error.code : 'unknown',
        message: error && typeof error === 'object' && 'message' in error ? error.message : 'unknown',
        error: error
      });
    } finally {
      setLoading(false);
    }
  };

  const testRedirectResult = async () => {
    addLog('info', 'Test getRedirectResult...');
    try {
      const result = await getRedirectResult(auth);
      if (result) {
        addLog('success', 'Résultat de redirection trouvé !', { user: result.user.email });
      } else {
        addLog('info', 'Aucun résultat de redirection');
      }
    } catch (error: unknown) {
      addLog('error', 'Erreur getRedirectResult', error);
    }
  };

  const clearLogs = () => {
    setLogs([]);
    addLog('info', 'Logs effacés');
  };

  const getLogColor = (type: LogEntry['type']) => {
    switch (type) {
      case 'success': return 'text-green-600 bg-green-50';
      case 'error': return 'text-red-600 bg-red-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-blue-600 bg-blue-50';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">🔍 Diagnostic Google OAuth</h1>
        
        {/* Informations système */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Informations système</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>User Agent:</strong><br />
              <code className="text-xs break-all">{typeof window !== 'undefined' ? navigator.userAgent : 'Chargement...'}</code>
            </div>
            <div>
              <strong>Mobile détecté:</strong> {typeof window !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? '✅ Oui' : '❌ Non'}<br />
              <strong>Mode PWA:</strong> {typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches ? '✅ Oui' : '❌ Non'}<br />
              <strong>Utilisateur connecté:</strong> {user ? `✅ ${user.email}` : '❌ Non'}
            </div>
          </div>
        </div>

        {/* Boutons de test */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Tests</h2>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={testGoogleSignIn}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Test en cours...' : 'Test Google OAuth'}
            </button>
            
            <button
              onClick={testRedirectResult}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Test Redirect Result
            </button>
            
            <button
              onClick={clearLogs}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              Effacer les logs
            </button>
          </div>
        </div>

        {/* Logs */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Logs en temps réel</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-gray-500 italic">Aucun log pour le moment...</p>
            ) : (
              logs.map((log, index) => (
                <div key={index} className={`p-3 rounded border-l-4 ${getLogColor(log.type)}`}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <span className="font-mono text-xs text-gray-500">[{log.timestamp}]</span>
                      <span className={`ml-2 font-semibold`}>
                        {log.type === 'success' && '✅'}
                        {log.type === 'error' && '❌'}
                        {log.type === 'warning' && '⚠️'}
                        {log.type === 'info' && 'ℹ️'}
                        {' '}{log.message}
                      </span>
                    </div>
                  </div>
                  {log.data !== undefined && (
                    <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                      {JSON.stringify(log.data, null, 2)}
                    </pre>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
