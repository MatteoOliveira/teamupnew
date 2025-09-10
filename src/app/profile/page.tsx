'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { doc, setDoc, getDoc, collection, getDocs, query, where, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { deleteUser } from 'firebase/auth';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Input from '@/components/Input';
import Button from '@/components/Button';
import { Menu } from '@headlessui/react';
import { UserStats, StatsPeriod } from '@/types/stats';
import { getStatsPeriod } from '@/utils/statsCalculator';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useUserData } from '@/hooks/useUserData';
import DataViewer from '@/components/DataViewer';
import DataEditor from '@/components/DataEditor';
import DataExporter from '@/components/DataExporter';
import DataPreferences from '@/components/DataPreferences';
import PushNotificationManager from '@/components/PushNotificationManager';
import SettingsSection from '@/components/SettingsSection';

// Lazy loading des composants lourds pour réduire le JavaScript initial
// Ces composants seront utilisés quand la section statistiques sera implémentée
// const StatsChart = lazy(() => import('@/components/StatsChart'));
// const AdvancedMetrics = lazy(() => import('@/components/AdvancedMetrics'));
// const GoalsSection = lazy(() => import('@/components/GoalsSection'));
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
  const { getUserStats, trackPageView, trackProfileUpdate } = useAnalytics();
  
  
  const { userData, loading: userDataLoading } = useUserData(user?.uid || null);
  const [name, setName] = useState('');
  const [sport, setSport] = useState('');
  const [city, setCity] = useState("");
  const [activeTab, setActiveTab] = useState<'profile' | 'myevents' | 'cityevents' | 'myregistrations' | 'pastevents' | 'history' | 'stats' | 'settings'>('profile');
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [message, setMessage] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [myEvents, setMyEvents] = useState<Event[]>([]);
  const [myRegistrations, setMyRegistrations] = useState<Registration[]>([]);
  const [cityEvents, setCityEvents] = useState<Event[]>([]);
  
  // Nouveaux états pour les fonctionnalités restaurées
  const [pastEvents, setPastEvents] = useState<Event[]>([]);
  const [pastEventsFilter, setPastEventsFilter] = useState<'all' | 'created' | 'joined'>('all');
  const [activityHistory, setActivityHistory] = useState<{id: string; type: string; description: string; date: Date}[]>([]);
  const [userStats, setUserStats] = useState<UserStats>({
    totalEvents: 0,
    eventsCreated: 0,
    eventsJoined: 0,
    favoriteSport: '',
    participationRate: 0,
    averageEventDuration: 0,
    activityScore: 0,
    eventsByMonth: [],
    sportDistribution: [],
    monthlyGoal: { current: 0, target: 10 },
    newSportsGoal: { current: 0, target: 5 }
  });
  const [statsLoading, setStatsLoading] = useState(false);
  
  // États pour les statistiques dynamiques
  const [selectedPeriod, setSelectedPeriod] = useState<StatsPeriod>(getStatsPeriod('all'));
  
  // Refs pour le graphique des événements par mois
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const currentMonthRef = useRef<HTMLDivElement>(null);
  
  // États pour la suppression de compte
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Initialiser l'onglet depuis l'URL hash au montage
  useEffect(() => {
    const initializeTab = () => {
      const hash = window.location.hash.slice(1); // Enlever le #
      const validTabs = ['profile', 'myevents', 'cityevents', 'myregistrations', 'pastevents', 'history', 'stats', 'settings'];
      if (validTabs.includes(hash)) {
        setActiveTab(hash as 'profile' | 'myevents' | 'cityevents' | 'myregistrations' | 'pastevents' | 'history' | 'stats' | 'settings');
      }
    };

    // Initialiser l'onglet au montage
    initializeTab();

    // Écouter les changements de hash dans l'URL
    const handleHashChange = () => {
      initializeTab();
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Mettre à jour l'URL quand l'onglet change
  const handleTabChange = (tab: 'profile' | 'myevents' | 'cityevents' | 'myregistrations' | 'pastevents' | 'history' | 'stats' | 'settings') => {
    setActiveTab(tab);
    window.location.hash = tab;
  };

  // Charger le profil existant
  useEffect(() => {
    if (user && !profileLoaded) {
      getDoc(doc(db, 'users', user.uid)).then(userDoc => {
        if (userDoc.exists()) {
          const data = userDoc.data();
          setName(data.name || '');
          setSport(data.sport || '');
          setCity(data.city || '');
        }
        setProfileLoaded(true);
      });
    }
  }, [user, profileLoaded]);

  // Charger les statistiques
  const loadUserStats = useCallback(async () => {
    if (!user) return;
    
    setStatsLoading(true);
    try {
      const stats = await getUserStats(selectedPeriod);
      if (stats) {
        setUserStats(stats);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    } finally {
      setStatsLoading(false);
    }
  }, [user, getUserStats, selectedPeriod]);

  // Charger les statistiques quand on change d'onglet vers stats
  useEffect(() => {
    if (activeTab === 'stats' && user) {
      loadUserStats();
    }
  }, [activeTab, user, loadUserStats]);

  // Centrer automatiquement le mois actuel dans le graphique
  useEffect(() => {
    if (currentMonthRef.current && chartContainerRef.current && userStats.eventsByMonth.length > 0) {
      // Attendre un peu pour que le DOM soit rendu
      setTimeout(() => {
        currentMonthRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        });
      }, 100);
    }
  }, [userStats.eventsByMonth]);

  // Fonction pour supprimer le compte utilisateur
  const handleDeleteAccount = async () => {
    if (!user) return;
    
    setIsDeleting(true);
    try {
      // Supprimer toutes les données associées à l'utilisateur
      const batch = writeBatch(db);
      
      // 1. Supprimer le profil utilisateur
      batch.delete(doc(db, 'users', user.uid));
      
      // 2. Supprimer tous les événements créés par l'utilisateur
      const eventsQuery = query(collection(db, 'events'), where('createdBy', '==', user.uid));
      const eventsSnapshot = await getDocs(eventsQuery);
      eventsSnapshot.forEach((eventDoc) => {
        batch.delete(eventDoc.ref);
      });
      
      // 3. Supprimer toutes les participations de l'utilisateur
      const participantsQuery = query(collection(db, 'participants'), where('userId', '==', user.uid));
      const participantsSnapshot = await getDocs(participantsQuery);
      participantsSnapshot.forEach((participantDoc) => {
        batch.delete(participantDoc.ref);
      });
      
      // Exécuter toutes les suppressions
      await batch.commit();
      
      // 4. Supprimer le compte Firebase Auth
      await deleteUser(user);
      
      // Rediriger vers la page de connexion
      router.push('/choose-experience');
      
    } catch (error) {
      console.error('Erreur lors de la suppression du compte:', error);
      setMessage('Erreur lors de la suppression du compte. Veuillez réessayer.');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  // Track page view (une seule fois)
  useEffect(() => {
    if (user) {
      trackPageView('profile');
    }
  }, [user, trackPageView]);

  // Charger les événements liés à l'utilisateur
  useEffect(() => {
    if (!user) return;
    // Mes événements (créés par moi) - UNIQUEMENT les événements futurs
    getDocs(query(collection(db, 'events'), where('createdBy', '==', user.uid))).then(snap => {
      const now = new Date();
      const futureEvents = snap.docs
        .filter(doc => {
          const data = doc.data();
          if (!data.date?.seconds) return false;
          const eventDate = new Date(data.date.seconds * 1000);
          return eventDate > now; // Seulement les événements futurs
        })
        .map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name,
            sport: data.sport,
            city: data.city,
            date: data.date,
          };
        });
      setMyEvents(futureEvents);
    });
    // Mes inscriptions (où je suis inscrit) - UNIQUEMENT les événements futurs
    getDocs(query(collection(db, 'event_participants'), where('userId', '==', user.uid))).then(async snap => {
      const eventIds = snap.docs.map(doc => doc.data().eventId);
      if (eventIds.length === 0) { setMyRegistrations([]); return; }
      const eventsSnap = await getDocs(query(collection(db, 'events')));
      const now = new Date();
      const futureRegistrations = eventsSnap.docs
        .filter(doc => {
          const data = doc.data();
          if (!eventIds.includes(doc.id)) return false; // Je suis inscrit
          if (data.createdBy === user.uid) return false; // Exclure les événements que j'ai créés
          if (!data.date?.seconds) return false;
          const eventDate = new Date(data.date.seconds * 1000);
          return eventDate > now; // Seulement les événements futurs
        })
        .map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name,
            sport: data.sport,
            city: data.city,
            date: data.date,
          };
        });
      setMyRegistrations(futureRegistrations);
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



  // Accessibilité : focus sur le tab actif
  useEffect(() => {
    const el = document.getElementById(`tab-${activeTab}`);
    if (el) el.focus();
  }, [activeTab]);

  // --- UI ---
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Mobile minimal */}
      <div className="md:hidden flex items-center justify-center py-3 px-4 bg-white border-b border-gray-200">
        <div className="flex items-center space-x-1">
          <div className="w-6 h-6 bg-gradient-to-r from-purple-600 to-pink-600 rounded-md flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-sm font-bold text-gray-900">
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">TeamUp</span>
          </h2>
        </div>
      </div>

      {/* Header Desktop */}
      <div className="hidden md:block py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mon profil</h1>
          <p className="text-gray-600">Gérez vos informations et préférences</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto py-4 md:py-8 px-4 sm:px-6 lg:px-8">
        <main className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6" aria-label="Page profil utilisateur">
          {/* Navigation par onglets accessible avec menu burger sur mobile */}
          <nav aria-label="Navigation profil" className="mb-6">
            {/* Menu burger pour mobile */}
            <div className="md:hidden">
              <Menu as="div" className="relative">
                <Menu.Button className="flex items-center justify-between w-full px-4 py-3 text-sm font-medium text-gray-900 bg-gray-50 border border-gray-300 rounded-lg shadow-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500">
                  <span className="flex items-center space-x-2">
                    <div className="w-4 h-4 text-purple-500">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                    </div>
                    <span>{TABS.find(tab => tab.key === activeTab)?.label}</span>
                  </span>
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </Menu.Button>
                <Menu.Items className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg focus:outline-none">
                  <div className="py-2">
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
                              active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                            } ${
                              activeTab === tab.key ? 'bg-purple-50 text-purple-700 font-semibold' : ''
                            } flex items-center space-x-3 w-full text-left px-4 py-3 text-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 rounded-md mx-2`}
                            onClick={() => handleTabChange(tab.key as 'profile' | 'myevents' | 'cityevents' | 'myregistrations' | 'pastevents' | 'history' | 'stats' | 'settings')}
                          >
                            <div className={`w-2 h-2 rounded-full ${activeTab === tab.key ? 'bg-purple-500' : 'bg-gray-300'}`}></div>
                            <span>{tab.label}</span>
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
              <div className="flex flex-wrap gap-2" role="tablist">
                {TABS.map(tab => (
                  <button
                    key={tab.key}
                    id={`tab-${tab.key}`}
                    role="tab"
                    aria-selected={activeTab === tab.key}
                    aria-controls={`tabpanel-${tab.key}`}
                    tabIndex={activeTab === tab.key ? 0 : -1}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 ${
                      activeTab === tab.key 
                        ? 'bg-purple-100 text-purple-700 border border-purple-200' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                    }`}
                    onClick={() => handleTabChange(tab.key as 'profile' | 'myevents' | 'cityevents' | 'myregistrations' | 'pastevents' | 'history' | 'stats' | 'settings')}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </nav>

          {/* Contenu des onglets */}
          <section id="tabpanel-profile" role="tabpanel" hidden={activeTab !== 'profile'} aria-labelledby="tab-profile">
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-5 h-5 text-purple-500">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Informations personnelles</h2>
            </div>
            
            <form className="space-y-6" onSubmit={async (e) => {
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
                
                // Track profile update
                trackProfileUpdate('personal_info');
                
                setMessage('Profil enregistré !');
              } catch {
                setMessage('Erreur lors de l&apos;enregistrement du profil');
              }
            }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom complet
                  </label>
                  <Input 
                    type="text" 
                    placeholder="Votre nom complet" 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    aria-label="Nom complet"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sport favori
                  </label>
                  <Input 
                    type="text" 
                    placeholder="Votre sport favori" 
                    value={sport} 
                    onChange={e => setSport(e.target.value)} 
                    aria-label="Sport favori"
                    className="w-full"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ville
                </label>
                <Input 
                  type="text" 
                  placeholder="Votre ville" 
                  value={city} 
                  onChange={e => setCity(e.target.value)} 
                  aria-label="Ville"
                  className="w-full"
                />
              </div>
              <div className="flex justify-end">
                <Button type="submit" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-2 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200">
                  Enregistrer les modifications
                </Button>
              </div>
            </form>
          </section>

      {/* Onglet Réglages */}
      <section id="tabpanel-settings" role="tabpanel" hidden={activeTab !== 'settings'} aria-labelledby="tab-settings">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center space-x-2 mb-6">
            <div className="w-5 h-5 text-purple-500">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Réglages</h2>
          </div>

          {/* Section Notifications Push */}
          <SettingsSection
            title="🔔 Notifications Push"
            icon={
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            }
            defaultOpen={true}
          >
            <PushNotificationManager />
          </SettingsSection>

          {/* Section Droits RGPD */}
          <SettingsSection
            title="🔐 Mes Droits RGPD"
            icon={
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            }
          >
            <div className="space-y-4">
              <p className="text-sm text-gray-600 mb-4">
                Conformément au RGPD, vous disposez de droits sur vos données personnelles.
              </p>
              
              <DataViewer userData={userData} loading={userDataLoading} />
              <DataEditor 
                userData={userData} 
                onDataUpdated={() => {
                  window.location.reload();
                }} 
              />
              <DataExporter userData={userData} />
              <DataPreferences />
            </div>
          </SettingsSection>

          {/* Section Préférences d'Affichage */}
          <SettingsSection
            title="🎨 Préférences d'Affichage"
            icon={
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
              </svg>
            }
          >
            <div className="space-y-4">
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-2">Mode sombre</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Le mode sombre n&apos;est activé que si vous le choisissez explicitement ci-dessous. 
                  L&apos;application démarre toujours en mode clair par défaut.
                </p>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={darkMode}
                    onChange={handleDarkModeToggle}
                    aria-checked={darkMode}
                    aria-label="Activer le mode sombre"
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <span className="text-gray-900">Activer le mode sombre</span>
                </label>
              </div>
            </div>
          </SettingsSection>


          {/* Section Zone de Danger */}
          <SettingsSection
            title="⚠️ Zone de Danger"
            icon={
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            }
            className="border-red-200 bg-red-50"
          >
            <div className="space-y-4">
              <div>
                <h4 className="text-md font-medium text-red-800 mb-2">Supprimer mon compte</h4>
                <p className="text-sm text-red-700 mb-4">
                  La suppression de votre compte est définitive. Toutes vos données (profil, événements créés, participations) 
                  seront supprimées et ne pourront pas être récupérées.
                </p>
                <Button 
                  onClick={() => setShowDeleteModal(true)}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Supprimer mon compte
                </Button>
              </div>
            </div>
          </SettingsSection>
        </div>
      </section>

          {/* Onglet Mes événements */}
          <section id="tabpanel-myevents" role="tabpanel" hidden={activeTab !== 'myevents'} aria-labelledby="tab-myevents">
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-5 h-5 text-blue-500">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Mes événements créés</h2>
              <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">{myEvents.length}</span>
            </div>
            
            {myEvents.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun événement créé</h3>
                <p className="text-gray-600">Créez votre premier événement sportif !</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {myEvents.map(ev => (
                  <div 
                    key={ev.id} 
                    className="p-4 border border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => router.push(`/event/${ev.id}`)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{ev.name}</h3>
                        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-1">
                          <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">{ev.sport}</span>
                          <span>{ev.city}</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {ev.date ? new Date(ev.date.seconds * 1000).toLocaleDateString() : 'Date non définie'}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
          {/* Onglet Mes inscriptions */}
          <section id="tabpanel-myregistrations" role="tabpanel" hidden={activeTab !== 'myregistrations'} aria-labelledby="tab-myregistrations">
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-5 h-5 text-green-500">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Mes inscriptions</h2>
              <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">{myRegistrations.length}</span>
            </div>
            
            {myRegistrations.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune inscription</h3>
                <p className="text-gray-600">Rejoignez des événements sportifs !</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {myRegistrations.map(ev => (
                  <div 
                    key={ev.id} 
                    className="p-4 border border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => router.push(`/event/${ev.id}`)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{ev.name}</h3>
                        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-1">
                          <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">{ev.sport}</span>
                          <span>{ev.city}</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {ev.date ? new Date(ev.date.seconds * 1000).toLocaleDateString() : 'Date non définie'}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
        <div className="space-y-8">
          {/* Header avec titre et période - Responsive */}
          <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Mes statistiques</h2>
            <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-2">
              <span className="text-xs sm:text-sm text-gray-500">Période :</span>
              <select 
                value={selectedPeriod.key}
                onChange={(e) => {
                  const newPeriod = getStatsPeriod(e.target.value as 'all' | 'month' | 'year' | 'week');
                  setSelectedPeriod(newPeriod);
                }}
                className="px-2 py-1.5 sm:px-3 sm:py-1 border border-gray-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 w-full sm:w-auto"
              >
                <option value="all">Tout le temps</option>
                <option value="year">Cette année</option>
                <option value="month">Ce mois</option>
                <option value="week">Cette semaine</option>
              </select>
              {statsLoading && (
                <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-500">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                  <span>Chargement...</span>
                </div>
              )}
            </div>
          </div>

          {/* Métriques principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-600">{userStats.totalEvents}</div>
                  <div className="text-sm text-blue-500">+12% ce mois</div>
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Événements totaux</h3>
              <p className="text-sm text-gray-600">Tous les événements participés</p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-green-600">{userStats.eventsCreated}</div>
                  <div className="text-sm text-green-500">+8% ce mois</div>
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Événements créés</h3>
              <p className="text-sm text-gray-600">Événements organisés</p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-purple-600">{userStats.eventsJoined}</div>
                  <div className="text-sm text-purple-500">+15% ce mois</div>
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Événements rejoints</h3>
              <p className="text-sm text-gray-600">Événements participés</p>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6 border border-yellow-200">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-yellow-600">{userStats.favoriteSport}</div>
                  <div className="text-sm text-yellow-500">45% du temps</div>
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Sport favori</h3>
              <p className="text-sm text-gray-600">Activité préférée</p>
            </div>
          </div>

          {/* Graphiques et analyses détaillées */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Graphique des événements par mois */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Événements par mois</h3>
              <div className="h-64 overflow-x-auto overflow-y-hidden" ref={chartContainerRef}>
                <div className="flex items-end justify-start space-x-3 min-w-max px-2">
                  {userStats.eventsByMonth.length > 0 ? userStats.eventsByMonth.map((monthData, index) => {
                    const maxCount = Math.max(...userStats.eventsByMonth.map(m => m.count), 1);
                    const height = (monthData.count / maxCount) * 200;
                    const currentMonthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
                    const currentMonth = currentMonthNames[new Date().getMonth()];
                    const isCurrentMonth = monthData.month === currentMonth;
                    
                    return (
                      <div 
                        key={index} 
                        ref={isCurrentMonth ? currentMonthRef : null}
                        className={`flex flex-col items-center space-y-2 flex-shrink-0 ${isCurrentMonth ? 'ring-2 ring-blue-300 rounded-lg p-1' : ''}`}
                      >
                        <div 
                          className={`rounded-t w-8 transition-all duration-500 hover:from-blue-600 hover:to-blue-500 ${
                            isCurrentMonth 
                              ? 'bg-gradient-to-t from-blue-600 to-blue-500 shadow-lg' 
                              : 'bg-gradient-to-t from-blue-500 to-blue-400'
                          }`}
                          style={{ height: `${height}px` }}
                        ></div>
                        <div className={`text-xs ${isCurrentMonth ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>
                          {monthData.month}
                        </div>
                        {monthData.count > 0 && (
                          <div className={`text-xs font-medium ${isCurrentMonth ? 'text-blue-600' : 'text-blue-600'}`}>
                            {monthData.count}
                          </div>
                        )}
                      </div>
                    );
                  }) : (
                    <div className="flex items-center justify-center h-full w-full text-gray-500">
                      Aucune donnée disponible
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Répartition par sport */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Répartition par sport</h3>
              <div className="space-y-4">
                {userStats.sportDistribution.length > 0 ? userStats.sportDistribution.map((sportData, index) => {
                  const colors = ['bg-green-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-purple-500', 'bg-red-500', 'bg-gray-500'];
                  const color = colors[index % colors.length];
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">{sportData.sport}</span>
                        <span className="text-sm text-gray-500">{sportData.percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${color} transition-all duration-500`}
                          style={{ width: `${sportData.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                }) : (
                  <div className="flex items-center justify-center h-32 text-gray-500">
                    Aucune donnée disponible
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Statistiques avancées */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-900 text-sm sm:text-base">Taux de participation</h4>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-indigo-600 mb-2">{userStats.participationRate}%</div>
              <p className="text-xs sm:text-sm text-gray-600">Événements rejoints sur créés</p>
            </div>

            <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-900 text-sm sm:text-base">Temps moyen</h4>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-emerald-600 mb-2">{userStats.averageEventDuration}h</div>
              <p className="text-xs sm:text-sm text-gray-600">Durée moyenne des événements</p>
            </div>

            <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-rose-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-900 text-sm sm:text-base">Score d&apos;activité</h4>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-rose-600 mb-2">{userStats.activityScore}/5</div>
              <p className="text-xs sm:text-sm text-gray-600">Niveau d&apos;engagement</p>
            </div>
          </div>

          {/* Objectifs et défis */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Objectifs et défis</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Événements ce mois</span>
                  <span className="text-sm text-gray-500">{userStats.monthlyGoal.current}/{userStats.monthlyGoal.target}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-500 h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min((userStats.monthlyGoal.current / userStats.monthlyGoal.target) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Nouveaux sports</span>
                  <span className="text-sm text-gray-500">{userStats.newSportsGoal.current}/{userStats.newSportsGoal.target}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min((userStats.newSportsGoal.current / userStats.newSportsGoal.target) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

          {/* Message utilisateur */}
          {message && (
            <div className={`mt-4 p-3 rounded-lg text-center border ${
              message.includes('activées') || message.includes('Enregistr') 
                ? 'bg-green-100 text-green-700 border-green-200' 
                : 'bg-red-100 text-red-700 border-red-200'
            }`}>
              {message}
            </div>
          )}
        </main>
      </div>

      {/* Modal de confirmation de suppression de compte */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Supprimer votre compte</h3>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700 mb-4">
                <strong>Êtes-vous sûr de vouloir supprimer votre compte ?</strong>
              </p>
              <p className="text-sm text-gray-600 mb-4">
                Cette action est <strong>définitive et irréversible</strong>. Toutes vos données seront supprimées :
              </p>
              <ul className="text-sm text-gray-600 list-disc list-inside mb-4">
                <li>Votre profil utilisateur</li>
                <li>Tous vos événements créés</li>
                <li>Toutes vos participations à des événements</li>
                <li>Votre historique d&apos;activité</li>
              </ul>
              <p className="text-sm text-gray-600 mb-4">
                Tapez <strong>&quot;SUPPRIMER&quot;</strong> dans le champ ci-dessous pour confirmer :
              </p>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="Tapez SUPPRIMER ici"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex space-x-3">
              <Button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmText('');
                }}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white"
                disabled={isDeleting}
              >
                Annuler
              </Button>
              <Button
                onClick={handleDeleteAccount}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                disabled={deleteConfirmText !== 'SUPPRIMER' || isDeleting}
              >
                {isDeleting ? 'Suppression...' : 'Supprimer définitivement'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 