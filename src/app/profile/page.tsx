'use client';

import { useState, useEffect, useCallback } from 'react';
import { doc, setDoc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Input from '@/components/Input';
import Button from '@/components/Button';
import { Menu } from '@headlessui/react';
import { getFCMToken } from '@/lib/firebase-messaging';
// import Image from 'next/image'; // Désactivé pour éviter les erreurs 400

const TABS = [
  { key: 'profile', label: 'Mon profil' },
  { key: 'myevents', label: 'Mes événements' },
  { key: 'cityevents', label: 'Événements près de moi' },
  { key: 'myregistrations', label: 'Mes inscriptions' },
  { key: 'pastevents', label: 'Événements passés' },
  { key: 'history', label: 'Historique' },
  { key: 'stats', label: 'Statistiques' },
  { key: 'settings', label: 'Réglages' },
];

const defaultNotifications = {
  groupMessages: true,
  eventReminders: true,
  newEventsInCity: true,
  eventRegistration: true,
  eventChanges: true,
};

interface Event {
  id: string;
  name: string;
  sport: string;
  city: string;
  date?: { seconds: number };
  endDate?: { seconds: number };
  eventType?: 'created' | 'joined';
  isReserved?: boolean;
}
interface Registration {
  id: string;
  name: string;
  sport: string;
  city: string;
  date?: { seconds: number };
}

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [sport, setSport] = useState('');
  const [city, setCity] = useState("");
  const [activeTab, setActiveTab] = useState<'profile' | 'myevents' | 'cityevents' | 'myregistrations' | 'pastevents' | 'history' | 'stats' | 'settings'>('profile');
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [message, setMessage] = useState('');
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [notifications, setNotifications] = useState(defaultNotifications);
  const [darkMode, setDarkMode] = useState(false);
  const [myEvents, setMyEvents] = useState<Event[]>([]);
  const [myRegistrations, setMyRegistrations] = useState<Registration[]>([]);
  const [cityEvents, setCityEvents] = useState<Event[]>([]);
  
  // Nouveaux états pour les fonctionnalités restaurées
  const [pastEvents, setPastEvents] = useState<Event[]>([]);
  const [pastEventsFilter, setPastEventsFilter] = useState<'all' | 'created' | 'joined'>('all');
  const [activityHistory, setActivityHistory] = useState<{id: string; type: string; description: string; date: Date}[]>([]);
  const [userStats, setUserStats] = useState<{totalEvents: number; eventsCreated: number; eventsJoined: number; favoriteSport: string}>({
    totalEvents: 0,
    eventsCreated: 0,
    eventsJoined: 0,
    favoriteSport: ''
  });

  // Charger le profil existant
  useEffect(() => {
    if (user && !profileLoaded) {
      getDoc(doc(db, 'users', user.uid)).then(userDoc => {
        if (userDoc.exists()) {
          const data = userDoc.data();
          setName(data.name || '');
          setSport(data.sport || '');
          setCity(data.city || '');
          if (data.notifications) setNotifications({ ...defaultNotifications, ...data.notifications });
          if (data.fcmToken) {
            setPushEnabled(true);
            setPushToken(data.fcmToken);
          }
        }
        setProfileLoaded(true);
      });
    }
  }, [user, profileLoaded]);

  // Charger les événements liés à l'utilisateur
  useEffect(() => {
    if (!user) return;
    // Mes événements (créés par moi)
    getDocs(query(collection(db, 'events'), where('createdBy', '==', user.uid))).then(snap => {
      setMyEvents(snap.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          sport: data.sport,
          city: data.city,
          date: data.date,
        };
      }));
    });
    // Mes inscriptions (où je suis inscrit)
    getDocs(query(collection(db, 'event_participants'), where('userId', '==', user.uid))).then(async snap => {
      const eventIds = snap.docs.map(doc => doc.data().eventId);
      if (eventIds.length === 0) { setMyRegistrations([]); return; }
      const eventsSnap = await getDocs(query(collection(db, 'events')));
      setMyRegistrations(eventsSnap.docs.filter(doc => eventIds.includes(doc.id)).map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          sport: data.sport,
          city: data.city,
          date: data.date,
        };
      }));
    });
    // Événements près de moi (même ville)
    if (city) {
      getDocs(query(collection(db, 'events'), where('city', '==', city))).then(snap => {
        setCityEvents(snap.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name,
            sport: data.sport,
            city: data.city,
            date: data.date,
          };
        }));
      });
    }
  }, [user, city]);

  // Fonctions pour charger les données des onglets manquants
  const loadPastEvents = useCallback(async () => {
    if (!user) return;
    try {
      const now = new Date();
      const eventsQuery = query(collection(db, 'events'));
      const participantsQuery = query(collection(db, 'event_participants'), where('userId', '==', user.uid));
      
      const [eventsSnap, participantsSnap] = await Promise.all([
        getDocs(eventsQuery),
        getDocs(participantsQuery)
      ]);
      
      const participantEventIds = participantsSnap.docs.map(doc => doc.data().eventId);
      
      const pastEventsList = eventsSnap.docs
        .map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name,
            sport: data.sport,
            city: data.city,
            date: data.date,
            endDate: data.endDate,
            isReserved: data.isReserved,
            eventType: data.createdBy === user.uid ? 'created' as const : 
                      participantEventIds.includes(doc.id) ? 'joined' as const : undefined
          };
        })
        .filter(event => {
          if (!event.date?.seconds) return false;
          const eventDate = new Date(event.date.seconds * 1000);
          return eventDate < now;
        });
      
      setPastEvents(pastEventsList);
    } catch (error) {
      console.error('Erreur lors du chargement des événements passés:', error);
    }
  }, [user]);

  const loadActivityHistory = useCallback(async () => {
    if (!user) return;
    try {
      // Simuler un historique d'activité basé sur les événements
      const history: {id: string; type: string; description: string; date: Date}[] = [];
      
      // Événements créés
      const createdEvents = pastEvents.filter(e => e.eventType === 'created');
      createdEvents.forEach(event => {
        if (event.date?.seconds) {
          history.push({
            id: `created-${event.id}`,
            type: 'created',
            description: `Vous avez créé l'événement "${event.name}"`,
            date: new Date(event.date.seconds * 1000)
          });
        }
      });
      
      // Événements rejoints
      const joinedEvents = pastEvents.filter(e => e.eventType === 'joined');
      joinedEvents.forEach(event => {
        if (event.date?.seconds) {
          history.push({
            id: `joined-${event.id}`,
            type: 'joined',
            description: `Vous avez rejoint l'événement "${event.name}"`,
            date: new Date(event.date.seconds * 1000)
          });
        }
      });
      
      // Trier par date décroissante
      history.sort((a, b) => b.date.getTime() - a.date.getTime());
      setActivityHistory(history);
    } catch (error) {
      console.error('Erreur lors du chargement de l\'historique:', error);
    }
  }, [pastEvents, user]);

  const loadUserStats = useCallback(async () => {
    if (!user) return;
    try {
      const createdCount = pastEvents.filter(e => e.eventType === 'created').length;
      const joinedCount = pastEvents.filter(e => e.eventType === 'joined').length;
      
      // Calculer le sport favori
      const sportCounts: {[key: string]: number} = {};
      pastEvents.forEach(event => {
        if (event.sport) {
          sportCounts[event.sport] = (sportCounts[event.sport] || 0) + 1;
        }
      });
      
      const favoriteSport = Object.keys(sportCounts).reduce((a, b) => 
        sportCounts[a] > sportCounts[b] ? a : b, 'Aucun'
      );
      
      setUserStats({
        totalEvents: createdCount + joinedCount,
        eventsCreated: createdCount,
        eventsJoined: joinedCount,
        favoriteSport
      });
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    }
  }, [pastEvents, user]);

  // Charger les données des nouveaux onglets
  useEffect(() => {
    if (user && profileLoaded) {
      loadPastEvents();
    }
  }, [user, profileLoaded, loadPastEvents]);

  useEffect(() => {
    if (pastEvents.length > 0) {
      loadActivityHistory();
      loadUserStats();
    }
  }, [pastEvents, loadActivityHistory, loadUserStats]);

  // Redirection si non connecté
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Charger dark mode depuis localStorage (mais ne rien appliquer sur le body)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('darkMode');
      if (stored === 'true') setDarkMode(true);
    }
  }, []);

  // Gérer le switch dark mode (stocke la préférence mais n'applique rien)
  const handleDarkModeToggle = () => {
    setDarkMode((prev) => !prev);
    if (typeof window !== 'undefined') {
      localStorage.setItem('darkMode', (!darkMode).toString());
    }
  };

  // Activer les notifications push
  const enablePushNotifications = async () => {
    if (!user) return;
    const token = await getFCMToken();
    if (token) {
      await setDoc(doc(db, 'users', user.uid), { fcmToken: token }, { merge: true });
      setPushEnabled(true);
      setPushToken(token);
      setMessage('Notifications push activées !');
    } else {
      setMessage('Impossible d’activer les notifications push (permission refusée ou navigateur non supporté).');
    }
  };

  // Désactiver les notifications push (supprimer le token)
  const disablePushNotifications = async () => {
    if (!user) return;
    await setDoc(doc(db, 'users', user.uid), { fcmToken: null }, { merge: true });
    setPushEnabled(false);
    setPushToken(null);
    setMessage('Notifications push désactivées.');
  };

  // Gérer le changement de préférences de notifications
  const handleNotificationChange = (key: keyof typeof defaultNotifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const saveNotifications = async () => {
    if (!user) return;
    await setDoc(doc(db, 'users', user.uid), { notifications }, { merge: true });
    setMessage('Préférences de notifications mises à jour !');
  };

  // Accessibilité : focus sur le tab actif
  useEffect(() => {
    const el = document.getElementById(`tab-${activeTab}`);
    if (el) el.focus();
  }, [activeTab]);

  // --- UI ---
  return (
    <main className="max-w-2xl mx-auto py-8 px-4 bg-white text-black min-h-screen" aria-label="Page profil utilisateur">
      <h1 className="text-3xl font-bold mb-6 text-black">Mon profil</h1>
      {/* Navigation par onglets accessible avec menu burger sur mobile */}
      <nav aria-label="Navigation profil" className="mb-6">
        {/* Menu burger pour mobile */}
        <div className="md:hidden">
          <Menu as="div" className="relative">
            <Menu.Button className="flex items-center justify-between w-full px-4 py-2 text-sm font-medium text-black bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <span>{TABS.find(tab => tab.key === activeTab)?.label}</span>
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </Menu.Button>
            <Menu.Items className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg focus:outline-none">
              <div className="py-1">
                {TABS.map(tab => (
                  <Menu.Item key={tab.key}>
                    {({ active }) => (
                      <button
                        id={`tab-${tab.key}`}
                        role="tab"
                        aria-selected={activeTab === tab.key}
                        aria-controls={`tabpanel-${tab.key}`}
                        tabIndex={activeTab === tab.key ? 0 : -1}
                        className={`${
                          active ? 'bg-gray-100 text-black' : 'text-black'
                        } ${
                          activeTab === tab.key ? 'bg-blue-100 font-bold' : ''
                        } block w-full text-left px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        onClick={() => setActiveTab(tab.key as 'profile' | 'myevents' | 'cityevents' | 'myregistrations' | 'settings')}
                      >
                        {tab.label}
                      </button>
                    )}
                  </Menu.Item>
                ))}
              </div>
            </Menu.Items>
          </Menu>
        </div>
        
        {/* Onglets horizontaux pour desktop */}
        <div className="hidden md:block">
          <ul className="flex flex-wrap gap-2" role="tablist">
            {TABS.map(tab => (
              <li key={tab.key} role="presentation">
                <button
                  id={`tab-${tab.key}`}
                  role="tab"
                  aria-selected={activeTab === tab.key}
                  aria-controls={`tabpanel-${tab.key}`}
                  tabIndex={activeTab === tab.key ? 0 : -1}
                  className={`px-4 py-2 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${activeTab === tab.key ? 'bg-blue-100 text-black font-bold' : 'bg-gray-100 text-black'}`}
                  onClick={() => setActiveTab(tab.key as 'profile' | 'myevents' | 'cityevents' | 'myregistrations' | 'settings')}
                >
                  {tab.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Contenu des onglets */}
      <section id="tabpanel-profile" role="tabpanel" hidden={activeTab !== 'profile'} aria-labelledby="tab-profile">
        <h2 className="text-xl font-semibold mb-4 text-black">Informations personnelles</h2>
        <form className="flex flex-col gap-4" onSubmit={async (e) => {
          e.preventDefault();
          if (!user) return;
          try {
            await setDoc(doc(db, 'users', user.uid), {
              name,
              sport,
              city,
              email: user.email || '',
              updatedAt: new Date(),
            }, { merge: true });
            setMessage('Profil enregistré !');
          } catch {
            setMessage('Erreur lors de l&apos;enregistrement du profil');
          }
        }}>
          <label className="block">
            <span className="text-black">Nom</span>
            <Input type="text" placeholder="Votre nom" value={name} onChange={e => setName(e.target.value)} aria-label="Nom" />
          </label>
          <label className="block">
            <span className="text-black">Sport favori</span>
            <Input type="text" placeholder="Votre sport favori" value={sport} onChange={e => setSport(e.target.value)} aria-label="Sport favori" />
          </label>
          <label className="block">
            <span className="text-black">Ville</span>
            <Input type="text" placeholder="Votre ville" value={city} onChange={e => setCity(e.target.value)} aria-label="Ville" />
          </label>
          <Button type="submit" className="bg-blue-500 hover:bg-blue-600 mt-2">Enregistrer</Button>
        </form>
      </section>

      {/* Onglet Réglages */}
      <section id="tabpanel-settings" role="tabpanel" hidden={activeTab !== 'settings'} aria-labelledby="tab-settings">
        <h2 className="text-xl font-semibold mb-4 text-black">Réglages</h2>
        {/* Notifications push */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-black mb-2">Notifications push</h3>
          {pushEnabled ? (
            <div className="flex items-center gap-2 mb-2">
              <span className="text-green-700">Notifications activées</span>
              <Button onClick={disablePushNotifications} className="bg-red-500 hover:bg-red-600">Désactiver</Button>
            </div>
          ) : (
            <Button onClick={enablePushNotifications} className="bg-blue-500 hover:bg-blue-600">Activer les notifications push sur cet appareil</Button>
          )}
          {pushToken && (
            <div className="text-xs text-gray-500 break-all mt-1">Token : {pushToken}</div>
          )}
        </div>
        {/* Préférences de notifications */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-black mb-2">Préférences de notifications</h3>
          <form onSubmit={e => { e.preventDefault(); saveNotifications(); }}>
            <div className="flex flex-col gap-2">
              {Object.entries(defaultNotifications).map(([key, label]) => (
                <label key={key} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={notifications[key as keyof typeof defaultNotifications]}
                    onChange={() => handleNotificationChange(key as keyof typeof defaultNotifications)}
                    aria-checked={notifications[key as keyof typeof defaultNotifications]}
                    aria-label={key}
                  />
                  <span className="text-black">{label}</span>
                </label>
              ))}
            </div>
            <Button type="submit" className="mt-3 bg-blue-500 hover:bg-blue-600">Enregistrer</Button>
          </form>
        </div>
        {/* Dark mode */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-black mb-2">Mode sombre</h3>
          <p className="text-sm text-gray-600 mb-2">Le mode sombre n&apos;est activé que si vous le choisissez explicitement ci-dessous. L&apos;application démarre toujours en mode clair par défaut.</p>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={darkMode}
              onChange={handleDarkModeToggle}
              aria-checked={darkMode}
              aria-label="Activer le mode sombre"
            />
            <span className="text-black">Activer le mode sombre</span>
          </label>
        </div>
      </section>

      {/* Onglet Mes événements */}
      <section id="tabpanel-myevents" role="tabpanel" hidden={activeTab !== 'myevents'} aria-labelledby="tab-myevents">
        <h2 className="text-xl font-semibold mb-4 text-black">Mes événements créés</h2>
        {myEvents.length === 0 ? <div className="text-black">Aucun événement créé.</div> : (
          <ul className="space-y-2">
            {myEvents.map(ev => (
              <li key={ev.id} className="p-2 border rounded text-black">
                <div className="font-bold">{ev.name}</div>
                <div>{ev.sport} - {ev.city}</div>
                <div>{ev.date ? new Date(ev.date.seconds * 1000).toLocaleDateString() : ''}</div>
              </li>
            ))}
          </ul>
        )}
      </section>
      {/* Onglet Mes inscriptions */}
      <section id="tabpanel-myregistrations" role="tabpanel" hidden={activeTab !== 'myregistrations'} aria-labelledby="tab-myregistrations">
        <h2 className="text-xl font-semibold mb-4 text-black">Mes inscriptions</h2>
        {myRegistrations.length === 0 ? <div className="text-black">Aucune inscription.</div> : (
          <ul className="space-y-2">
            {myRegistrations.map(ev => (
              <li key={ev.id} className="p-2 border rounded text-black">
                <div className="font-bold">{ev.name}</div>
                <div>{ev.sport} - {ev.city}</div>
                <div>{ev.date ? new Date(ev.date.seconds * 1000).toLocaleDateString() : ''}</div>
              </li>
            ))}
          </ul>
        )}
      </section>
      {/* Onglet Événements près de moi */}
      <section id="tabpanel-cityevents" role="tabpanel" hidden={activeTab !== 'cityevents'} aria-labelledby="tab-cityevents">
        <h2 className="text-xl font-semibold mb-4 text-black">Événements près de moi</h2>
        {cityEvents.length === 0 ? <div className="text-black">Aucun événement trouvé dans ta ville.</div> : (
          <ul className="space-y-2">
            {cityEvents.map(ev => (
              <li key={ev.id} className="p-2 border rounded text-black">
                <div className="font-bold">{ev.name}</div>
                <div>{ev.sport} - {ev.city}</div>
                <div>{ev.date ? new Date(ev.date.seconds * 1000).toLocaleDateString() : ''}</div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Onglet Événements passés */}
      <section id="tabpanel-pastevents" role="tabpanel" hidden={activeTab !== 'pastevents'} aria-labelledby="tab-pastevents">
        <h2 className="text-xl font-semibold mb-4 text-black">Événements passés</h2>
        
        {/* Filtres */}
        <div className="mb-4">
          <div className="flex gap-2">
            <button
              onClick={() => setPastEventsFilter('all')}
              className={`px-3 py-1 rounded text-sm ${
                pastEventsFilter === 'all' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-black hover:bg-gray-300'
              }`}
            >
              Tous
            </button>
            <button
              onClick={() => setPastEventsFilter('created')}
              className={`px-3 py-1 rounded text-sm ${
                pastEventsFilter === 'created' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-black hover:bg-gray-300'
              }`}
            >
              Créés
            </button>
            <button
              onClick={() => setPastEventsFilter('joined')}
              className={`px-3 py-1 rounded text-sm ${
                pastEventsFilter === 'joined' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-black hover:bg-gray-300'
              }`}
            >
              Rejoints
            </button>
          </div>
        </div>

        {/* Liste des événements passés */}
        {pastEvents.length === 0 ? (
          <div className="text-black">Aucun événement passé.</div>
        ) : (
          <ul className="space-y-3">
            {pastEvents
              .filter(event => {
                if (pastEventsFilter === 'all') return true;
                return event.eventType === pastEventsFilter;
              })
              .map(event => (
                <li key={event.id} className="p-4 border rounded-lg bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-bold text-black">{event.name}</div>
                      <div className="text-sm text-gray-600">{event.sport} - {event.city}</div>
                      <div className="text-xs text-gray-500">
                        {event.date?.seconds ? new Date(event.date.seconds * 1000).toLocaleString() : ''}
                        {event.endDate?.seconds && (
                          <span> → {new Date(event.endDate.seconds * 1000).toLocaleString()}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`px-2 py-1 rounded text-xs ${
                        event.eventType === 'created' 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {event.eventType === 'created' ? 'Créé' : 'Rejoint'}
                      </span>
                      {event.isReserved && (
                        <span className="px-2 py-1 rounded text-xs bg-yellow-100 text-yellow-700">
                          Lieu réservé
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              ))}
          </ul>
        )}
      </section>

      {/* Onglet Historique */}
      <section id="tabpanel-history" role="tabpanel" hidden={activeTab !== 'history'} aria-labelledby="tab-history">
        <h2 className="text-xl font-semibold mb-4 text-black">Historique d&apos;activité</h2>
        
        {activityHistory.length === 0 ? (
          <div className="text-black">Aucune activité récente.</div>
        ) : (
          <div className="space-y-3">
            {activityHistory.map(activity => (
              <div key={activity.id} className="p-3 border-l-4 border-blue-500 bg-gray-50 rounded-r">
                <div className="text-sm text-black">{activity.description}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {activity.date.toLocaleDateString()} à {activity.date.toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Onglet Statistiques */}
      <section id="tabpanel-stats" role="tabpanel" hidden={activeTab !== 'stats'} aria-labelledby="tab-stats">
        <h2 className="text-xl font-semibold mb-4 text-black">Mes statistiques</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-black mb-2">Événements totaux</h3>
            <div className="text-2xl font-bold text-blue-600">{userStats.totalEvents}</div>
          </div>
          
          <div className="p-4 bg-green-50 rounded-lg">
            <h3 className="font-semibold text-black mb-2">Événements créés</h3>
            <div className="text-2xl font-bold text-green-600">{userStats.eventsCreated}</div>
          </div>
          
          <div className="p-4 bg-purple-50 rounded-lg">
            <h3 className="font-semibold text-black mb-2">Événements rejoints</h3>
            <div className="text-2xl font-bold text-purple-600">{userStats.eventsJoined}</div>
          </div>
          
          <div className="p-4 bg-yellow-50 rounded-lg">
            <h3 className="font-semibold text-black mb-2">Sport favori</h3>
            <div className="text-lg font-bold text-yellow-600">{userStats.favoriteSport}</div>
          </div>
        </div>
      </section>

      {/* Message utilisateur */}
      {message && (
        <div className={`mt-4 p-3 rounded text-center ${message.includes('activées') || message.includes('Enregistr') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{message}</div>
      )}
    </main>
  );
} 