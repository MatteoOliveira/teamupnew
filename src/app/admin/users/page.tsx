'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { collection, query, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ArrowLeftIcon, UserIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface User {
  id: string;
  name: string;
  email: string;
  city: string;
  age?: number;
  isAdmin?: boolean;
  createdAt?: Date;
  lastActiveAt?: Date;
  fcmToken?: string;
  notifications?: {
    eventChanges: boolean;
    eventRegistration: boolean;
    eventReminders: boolean;
  };
}

export default function AdminUsers() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'admin' | 'users'>('all');
  const [isAdmin, setIsAdmin] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  // Vérifier si l'utilisateur est admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setIsAdmin(userData.isAdmin === true);
            if (!userData.isAdmin) {
              router.push('/profile');
            }
          } else {
            router.push('/profile');
          }
        } catch (error) {
          console.error('Erreur vérification admin:', error);
          router.push('/profile');
        }
      }
    };

    if (!loading) {
      checkAdminStatus();
    }
  }, [user, loading, router]);

  // Charger les utilisateurs
  useEffect(() => {
    const loadUsers = async () => {
      if (!isAdmin) return;

      try {
        setLoadingData(true);

        const usersQuery = query(collection(db, 'users'));
        const usersSnapshot = await getDocs(usersQuery);
        const usersData = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as User[];

        console.log('🔍 Utilisateurs récupérés:', usersData.length);
        console.log('📋 Données utilisateurs:', usersData);

        // Tri côté client par nom
        const sortedUsers = usersData.sort((a, b) => {
          const nameA = a.name || a.email || '';
          const nameB = b.name || b.email || '';
          return nameA.localeCompare(nameB);
        });

        setUsers(sortedUsers);
        setFilteredUsers(sortedUsers);

      } catch (error) {
        console.error('Erreur chargement utilisateurs:', error);
      } finally {
        setLoadingData(false);
      }
    };

    if (isAdmin) {
      loadUsers();
    }
  }, [isAdmin]);

  // Filtrer les utilisateurs
  useEffect(() => {
    let filtered = users;

    // Filtre par type
    if (filter === 'admin') {
      filtered = filtered.filter(user => user.isAdmin === true);
    } else if (filter === 'users') {
      filtered = filtered.filter(user => user.isAdmin !== true);
    }

    // Filtre par recherche
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.city.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, filter]);

  // Toggle admin status
  const toggleAdminStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        isAdmin: !currentStatus,
        updatedAt: new Date()
      });

      // Mettre à jour l'état local
      setUsers(users.map(user => 
        user.id === userId ? { ...user, isAdmin: !currentStatus } : user
      ));

    } catch (error) {
      console.error('Erreur mise à jour admin:', error);
      alert('Erreur lors de la mise à jour du statut admin');
    }
  };

  if (loading || loadingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des utilisateurs...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Accès Refusé</h1>
          <p className="text-gray-600 mb-4">Vous n&apos;avez pas les droits d&apos;administrateur.</p>
          <button
            onClick={() => router.push('/profile')}
            className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Retour au profil
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/admin/dashboard')}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5 mr-2" />
                Retour au dashboard
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Gestion des Utilisateurs</h1>
            </div>
            <div className="text-sm text-gray-500">
              {filteredUsers.length} utilisateur{filteredUsers.length > 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Admin */}
        <div className="mb-8">
          <nav className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
            <button
              onClick={() => router.push('/admin/dashboard')}
              className="px-4 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-white transition-colors"
            >
              📊 Dashboard
            </button>
            <button
              onClick={() => router.push('/admin/users')}
              className="px-4 py-2 rounded-md text-sm font-medium bg-white text-gray-900 shadow-sm"
            >
              👥 Utilisateurs
            </button>
            <button
              onClick={() => router.push('/admin/events')}
              className="px-4 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-white transition-colors"
            >
              📅 Événements
            </button>
            <button
              onClick={() => router.push('/admin/analytics')}
              className="px-4 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-white transition-colors"
            >
              📈 Analytics
            </button>
            <button
              onClick={() => router.push('/admin/settings')}
              className="px-4 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-white transition-colors"
            >
              ⚙️ Paramètres
            </button>
          </nav>
        </div>

        {/* Filtres et Recherche */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Recherche */}
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher par nom, email ou ville..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Filtres */}
            <div className="flex space-x-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Tous ({users.length})
              </button>
              <button
                onClick={() => setFilter('admin')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filter === 'admin'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Admins ({users.filter(u => u.isAdmin).length})
              </button>
              <button
                onClick={() => setFilter('users')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filter === 'users'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Utilisateurs ({users.filter(u => !u.isAdmin).length})
              </button>
            </div>
          </div>
        </div>

        {/* Liste des Utilisateurs */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Liste des Utilisateurs</h2>
          </div>

          <div className="divide-y divide-gray-200">
            {filteredUsers.map((user) => (
              <div key={user.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                        <UserIcon className="h-6 w-6 text-gray-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-medium text-gray-900 truncate">
                          {user.name || 'Nom non défini'}
                        </h3>
                        {user.isAdmin && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Admin
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                        <span>📍 {user.city || 'Ville non définie'}</span>
                        {user.age && <span>🎂 {user.age} ans</span>}
                        <span>🔔 Notifications: {user.notifications ? 'Activées' : 'Désactivées'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleAdminStatus(user.id, user.isAdmin || false)}
                      className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                        user.isAdmin
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {user.isAdmin ? 'Retirer Admin' : 'Promouvoir Admin'}
                    </button>
                    <button
                      onClick={() => router.push(`/admin/users/${user.id}`)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Voir détails
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredUsers.length === 0 && (
            <div className="px-6 py-8 text-center text-gray-500">
              Aucun utilisateur trouvé.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
