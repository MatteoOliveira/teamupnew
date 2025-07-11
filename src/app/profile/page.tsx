'use client';

import { useState, useEffect } from 'react';
import { doc, setDoc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Input from '@/components/Input';
import Button from '@/components/Button';
import { Menu } from '@headlessui/react';
import { getFCMToken } from '@/lib/firebase-messaging';

const AVATARS = [
  "/avatar1.png",
  "/avatar2.png",
  "/avatar3.png",
  "/avatar4.png",
  "/avatar5.png"
];

const TABS = [
  { key: 'profile', label: 'Mon profil' },
  { key: 'myevents', label: 'Mes événements' },
  { key: 'cityevents', label: 'Événements près de moi' },
  { key: 'myregistrations', label: 'Mes inscriptions' },
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
}
interface Registration extends Event {}

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [sport, setSport] = useState('');
  const [city, setCity] = useState("");
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [activeTab, setActiveTab] = useState<'profile' | 'myevents' | 'cityevents' | 'myregistrations' | 'settings'>('profile');
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [message, setMessage] = useState('');
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [notifications, setNotifications] = useState(defaultNotifications);
  const [darkMode, setDarkMode] = useState(false);
  const [myEvents, setMyEvents] = useState<Event[]>([]);
  const [myRegistrations, setMyRegistrations] = useState<Registration[]>([]);
  const [cityEvents, setCityEvents] = useState<Event[]>([]);

  // Charger le profil existant
  useEffect(() => {
    if (user && !profileLoaded) {
      getDoc(doc(db, 'users', user.uid)).then(userDoc => {
        if (userDoc.exists()) {
          const data = userDoc.data();
          setName(data.name || '');
          setSport(data.sport || '');
          setCity(data.city || '');
          setAvatar(data.avatar || AVATARS[0]);
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
                        onClick={() => setActiveTab(tab.key as any)}
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
                  onClick={() => setActiveTab(tab.key as any)}
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
              avatar,
              email: user.email || '',
              updatedAt: new Date(),
            }, { merge: true });
            setMessage('Profil enregistré !');
          } catch (err) {
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
          <label className="block">
            <span className="text-black">Avatar</span>
            <div className="flex gap-2 mt-1">
              {AVATARS.map((a) => (
                <button
                  key={a}
                  type="button"
                  aria-label={`Choisir l&apos;avatar ${a}`}
                  className={`rounded-full border-2 ${avatar === a ? 'border-blue-500' : 'border-gray-300'} focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500`}
                  onClick={() => setAvatar(a)}
                >
                  <img src={a} alt="Avatar" className="w-12 h-12 rounded-full" />
                </button>
              ))}
            </div>
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
                  <span className="text-black">{key}</span>
                </label>
              ))}
            </div>
            <Button type="submit" className="mt-3 bg-blue-500 hover:bg-blue-600">Enregistrer</Button>
          </form>
        </div>
        {/* Dark mode */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-black mb-2">Mode sombre</h3>
          <p className="text-sm text-gray-600 mb-2">Le mode sombre n'est activé que si vous le choisissez explicitement ci-dessous. L'application démarre toujours en mode clair par défaut.</p>
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

      {/* Message utilisateur */}
      {message && (
        <div className={`mt-4 p-3 rounded text-center ${message.includes('activées') || message.includes('Enregistr') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{message}</div>
      )}
    </main>
  );
} 