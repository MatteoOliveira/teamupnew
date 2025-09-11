# 📊 Statistiques Utilisateur et Analytics

## 📝 Description Simple

Le système de statistiques permet aux utilisateurs de voir leurs données d'activité : nombre d'événements créés, participations, sports préférés, et évolution dans le temps. Ces données aident les utilisateurs à comprendre leur engagement sportif.

## 🔧 Description Technique

### Architecture des Statistiques

Le système utilise une approche hybride avec :
- **Calcul côté client** pour les statistiques personnelles
- **Firestore** pour le stockage des données brutes
- **Google Analytics** pour les métriques globales
- **Cache local** pour optimiser les performances

### Fichiers Principaux

```
src/
├── hooks/
│   └── useAnalytics.ts             # Hook principal d'analytics
├── components/
│   ├── UserStats.tsx              # Composant de statistiques
│   └── StatsChart.tsx             # Graphiques de statistiques
├── types/
│   └── stats.ts                   # Types TypeScript
└── utils/
    └── statsCalculator.ts         # Calculs de statistiques
```

### 1. Types de Statistiques

#### Interface des Statistiques
```typescript
// src/types/stats.ts
export interface UserStats {
  totalEvents: number;
  totalParticipations: number;
  favoriteSport: string;
  eventsByMonth: EventByMonth[];
  participationsByMonth: ParticipationByMonth[];
  sportsDistribution: SportDistribution[];
  recentActivity: RecentActivity[];
  achievements: Achievement[];
}

export interface EventByMonth {
  month: string;
  year: number;
  count: number;
  events: Event[];
}

export interface ParticipationByMonth {
  month: string;
  year: number;
  count: number;
  participations: Participation[];
}

export interface SportDistribution {
  sport: string;
  count: number;
  percentage: number;
  emoji: string;
  color: string;
}

export interface RecentActivity {
  id: string;
  type: 'event_created' | 'event_joined' | 'event_left';
  eventName: string;
  sport: string;
  date: Date;
  description: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: Date;
  progress: number;
  maxProgress: number;
}

export type StatsPeriod = 'week' | 'month' | 'quarter' | 'year' | 'all';
```

### 2. Hook d'Analytics

#### useAnalytics.ts
```typescript
// src/hooks/useAnalytics.ts
import { useState, useEffect, useCallback } from 'react';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './useAuth';
import { UserStats, StatsPeriod } from '@/types/stats';
import { calculateUserStats } from '@/utils/statsCalculator';

export function useAnalytics() {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getUserStats = useCallback(async (period: StatsPeriod = 'all') => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      // Récupérer les événements créés
      const eventsQuery = query(
        collection(db, 'events'),
        where('createdBy', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      const eventsSnapshot = await getDocs(eventsQuery);
      const events = eventsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Récupérer les participations
      const participationsQuery = query(
        collection(db, 'event_participants'),
        where('userId', '==', user.uid),
        orderBy('joinedAt', 'desc')
      );
      const participationsSnapshot = await getDocs(participationsQuery);
      const participations = participationsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Récupérer les événements pour les participations
      const eventIds = participations.map(p => p.eventId);
      const participatedEvents = [];
      
      for (const eventId of eventIds) {
        const eventDoc = await getDoc(doc(db, 'events', eventId));
        if (eventDoc.exists()) {
          participatedEvents.push({ id: eventDoc.id, ...eventDoc.data() });
        }
      }

      // Calculer les statistiques
      const userStats = calculateUserStats(events, participatedEvents, participations, period);
      setStats(userStats);

    } catch (error) {
      console.error('Erreur lors du calcul des statistiques:', error);
      setError('Erreur lors du chargement des statistiques');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const trackPageView = useCallback((page: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'page_view', {
        page_title: page,
        page_location: window.location.href,
        user_id: user?.uid
      });
    }
  }, [user]);

  const trackEvent = useCallback((eventName: string, parameters?: any) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', eventName, {
        ...parameters,
        user_id: user?.uid,
        timestamp: new Date().toISOString()
      });
    }
  }, [user]);

  const trackProfileUpdate = useCallback((updatedFields: string[]) => {
    trackEvent('profile_update', {
      updated_fields: updatedFields.join(','),
      fields_count: updatedFields.length
    });
  }, [trackEvent]);

  useEffect(() => {
    if (user) {
      getUserStats();
    }
  }, [user, getUserStats]);

  return {
    stats,
    loading,
    error,
    getUserStats,
    trackPageView,
    trackEvent,
    trackProfileUpdate
  };
}
```

### 3. Calculateur de Statistiques

#### statsCalculator.ts
```typescript
// src/utils/statsCalculator.ts
import { UserStats, StatsPeriod, EventByMonth, ParticipationByMonth, SportDistribution, RecentActivity, Achievement } from '@/types/stats';

export function calculateUserStats(
  events: any[],
  participatedEvents: any[],
  participations: any[],
  period: StatsPeriod
): UserStats {
  // Filtrer par période
  const filteredEvents = filterByPeriod(events, period);
  const filteredParticipations = filterByPeriod(participations, period);

  // Calculer les statistiques de base
  const totalEvents = filteredEvents.length;
  const totalParticipations = filteredParticipations.length;
  const favoriteSport = calculateFavoriteSport(filteredEvents);

  // Calculer les statistiques par mois
  const eventsByMonth = calculateEventsByMonth(filteredEvents);
  const participationsByMonth = calculateParticipationsByMonth(filteredParticipations);

  // Calculer la distribution des sports
  const sportsDistribution = calculateSportsDistribution(filteredEvents);

  // Calculer l'activité récente
  const recentActivity = calculateRecentActivity(events, participations);

  // Calculer les achievements
  const achievements = calculateAchievements(totalEvents, totalParticipations, favoriteSport);

  return {
    totalEvents,
    totalParticipations,
    favoriteSport,
    eventsByMonth,
    participationsByMonth,
    sportsDistribution,
    recentActivity,
    achievements
  };
}

function filterByPeriod(data: any[], period: StatsPeriod): any[] {
  if (period === 'all') return data;

  const now = new Date();
  const cutoffDate = new Date();

  switch (period) {
    case 'week':
      cutoffDate.setDate(now.getDate() - 7);
      break;
    case 'month':
      cutoffDate.setMonth(now.getMonth() - 1);
      break;
    case 'quarter':
      cutoffDate.setMonth(now.getMonth() - 3);
      break;
    case 'year':
      cutoffDate.setFullYear(now.getFullYear() - 1);
      break;
  }

  return data.filter(item => {
    const itemDate = item.createdAt?.toDate?.() || item.joinedAt?.toDate?.() || new Date(item.createdAt || item.joinedAt);
    return itemDate >= cutoffDate;
  });
}

function calculateFavoriteSport(events: any[]): string {
  if (events.length === 0) return 'Aucun';

  const sportCounts = events.reduce((acc, event) => {
    acc[event.sport] = (acc[event.sport] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const favoriteSport = Object.entries(sportCounts)
    .sort(([,a], [,b]) => b - a)[0]?.[0];

  return favoriteSport || 'Aucun';
}

function calculateEventsByMonth(events: any[]): EventByMonth[] {
  const monthGroups = events.reduce((acc, event) => {
    const date = event.createdAt?.toDate?.() || new Date(event.createdAt);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!acc[monthKey]) {
      acc[monthKey] = {
        month: date.toLocaleDateString('fr-FR', { month: 'long' }),
        year: date.getFullYear(),
        count: 0,
        events: []
      };
    }
    
    acc[monthKey].count++;
    acc[monthKey].events.push(event);
    
    return acc;
  }, {} as Record<string, EventByMonth>);

  return Object.values(monthGroups).sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    return b.month.localeCompare(a.month);
  });
}

function calculateParticipationsByMonth(participations: any[]): ParticipationByMonth[] {
  const monthGroups = participations.reduce((acc, participation) => {
    const date = participation.joinedAt?.toDate?.() || new Date(participation.joinedAt);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!acc[monthKey]) {
      acc[monthKey] = {
        month: date.toLocaleDateString('fr-FR', { month: 'long' }),
        year: date.getFullYear(),
        count: 0,
        participations: []
      };
    }
    
    acc[monthKey].count++;
    acc[monthKey].participations.push(participation);
    
    return acc;
  }, {} as Record<string, ParticipationByMonth>);

  return Object.values(monthGroups).sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    return b.month.localeCompare(a.month);
  });
}

function calculateSportsDistribution(events: any[]): SportDistribution[] {
  const sportCounts = events.reduce((acc, event) => {
    acc[event.sport] = (acc[event.sport] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const total = events.length;
  
  return Object.entries(sportCounts)
    .map(([sport, count]) => ({
      sport,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
      emoji: getSportEmoji(sport),
      color: getSportColor(sport)
    }))
    .sort((a, b) => b.count - a.count);
}

function calculateRecentActivity(events: any[], participations: any[]): RecentActivity[] {
  const activities: RecentActivity[] = [];

  // Ajouter les événements créés
  events.slice(0, 10).forEach(event => {
    activities.push({
      id: `event-${event.id}`,
      type: 'event_created',
      eventName: event.name,
      sport: event.sport,
      date: event.createdAt?.toDate?.() || new Date(event.createdAt),
      description: `Vous avez créé l'événement "${event.name}"`
    });
  });

  // Ajouter les participations
  participations.slice(0, 10).forEach(participation => {
    activities.push({
      id: `participation-${participation.id}`,
      type: 'event_joined',
      eventName: participation.eventName || 'Événement',
      sport: participation.sport || 'Sport',
      date: participation.joinedAt?.toDate?.() || new Date(participation.joinedAt),
      description: `Vous avez rejoint l'événement "${participation.eventName || 'Événement'}"`
    });
  });

  return activities
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 20);
}

function calculateAchievements(totalEvents: number, totalParticipations: number, favoriteSport: string): Achievement[] {
  const achievements: Achievement[] = [
    {
      id: 'first-event',
      title: 'Premier Pas',
      description: 'Créer votre premier événement',
      icon: '🎯',
      unlocked: totalEvents >= 1,
      unlockedAt: totalEvents >= 1 ? new Date() : undefined,
      progress: Math.min(totalEvents, 1),
      maxProgress: 1
    },
    {
      id: 'event-organizer',
      title: 'Organisateur',
      description: 'Créer 5 événements',
      icon: '🏆',
      unlocked: totalEvents >= 5,
      unlockedAt: totalEvents >= 5 ? new Date() : undefined,
      progress: Math.min(totalEvents, 5),
      maxProgress: 5
    },
    {
      id: 'social-butterfly',
      title: 'Papillon Social',
      description: 'Rejoindre 10 événements',
      icon: '🦋',
      unlocked: totalParticipations >= 10,
      unlockedAt: totalParticipations >= 10 ? new Date() : undefined,
      progress: Math.min(totalParticipations, 10),
      maxProgress: 10
    },
    {
      id: 'sport-master',
      title: 'Maître du Sport',
      description: `Être expert en ${favoriteSport}`,
      icon: '🥇',
      unlocked: totalEvents >= 10 && favoriteSport !== 'Aucun',
      unlockedAt: totalEvents >= 10 && favoriteSport !== 'Aucun' ? new Date() : undefined,
      progress: Math.min(totalEvents, 10),
      maxProgress: 10
    }
  ];

  return achievements;
}

function getSportEmoji(sport: string): string {
  const sportEmojis: Record<string, string> = {
    'Football': '⚽',
    'Basketball': '🏀',
    'Tennis': '🎾',
    'Natation': '🏊',
    'Course': '🏃',
    'Cyclisme': '🚴',
    'Volleyball': '🏐',
    'Badminton': '🏸'
  };
  
  return sportEmojis[sport] || '🏃';
}

function getSportColor(sport: string): string {
  const sportColors: Record<string, string> = {
    'Football': 'bg-green-500',
    'Basketball': 'bg-orange-500',
    'Tennis': 'bg-yellow-500',
    'Natation': 'bg-blue-500',
    'Course': 'bg-red-500',
    'Cyclisme': 'bg-purple-500',
    'Volleyball': 'bg-pink-500',
    'Badminton': 'bg-indigo-500'
  };
  
  return sportColors[sport] || 'bg-gray-500';
}
```

### 4. Composant de Statistiques

#### UserStats.tsx
```typescript
// src/components/UserStats.tsx
import { useState } from 'react';
import { useAnalytics } from '@/hooks/useAnalytics';
import { StatsPeriod } from '@/types/stats';
import StatsChart from './StatsChart';

export default function UserStats() {
  const { stats, loading, error, getUserStats } = useAnalytics();
  const [selectedPeriod, setSelectedPeriod] = useState<StatsPeriod>('all');

  const handlePeriodChange = (period: StatsPeriod) => {
    setSelectedPeriod(period);
    getUserStats(period);
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="grid grid-cols-2 gap-4">
          <div className="h-24 bg-gray-200 rounded"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">{error}</p>
        <button
          onClick={() => getUserStats(selectedPeriod)}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Réessayer
        </button>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Aucune donnée disponible</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Sélecteur de période */}
      <div className="flex space-x-2">
        {(['week', 'month', 'quarter', 'year', 'all'] as StatsPeriod[]).map((period) => (
          <button
            key={period}
            onClick={() => handlePeriodChange(period)}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              selectedPeriod === period
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {period === 'all' ? 'Tout' : period === 'week' ? 'Semaine' : 
             period === 'month' ? 'Mois' : period === 'quarter' ? 'Trimestre' : 'Année'}
          </button>
        ))}
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-2xl">🎯</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Événements Créés</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalEvents}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-2xl">👥</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Participations</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalParticipations}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <span className="text-2xl">🏆</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Sport Favori</p>
              <p className="text-2xl font-bold text-gray-900">{stats.favoriteSport}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Événements par Mois</h3>
          <StatsChart
            data={stats.eventsByMonth}
            type="line"
            color="#3b82f6"
          />
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Distribution des Sports</h3>
          <StatsChart
            data={stats.sportsDistribution}
            type="doughnut"
            colors={stats.sportsDistribution.map(s => s.color)}
          />
        </div>
      </div>

      {/* Activité récente */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Activité Récente</h3>
        <div className="space-y-3">
          {stats.recentActivity.slice(0, 10).map((activity) => (
            <div key={activity.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <span className="text-2xl">
                {activity.type === 'event_created' ? '🎯' : '👥'}
              </span>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                <p className="text-xs text-gray-500">
                  {activity.date.toLocaleDateString('fr-FR')} • {activity.sport}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Achievements */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Succès</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stats.achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`p-4 rounded-lg border-2 ${
                achievement.unlocked
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-3xl">{achievement.icon}</span>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{achievement.title}</h4>
                  <p className="text-sm text-gray-600">{achievement.description}</p>
                  <div className="mt-2">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{achievement.progress}</span>
                      <span>{achievement.maxProgress}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div
                        className={`h-2 rounded-full ${
                          achievement.unlocked ? 'bg-green-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

### 5. Composant de Graphiques

#### StatsChart.tsx
```typescript
// src/components/StatsChart.tsx
import { useEffect, useRef } from 'react';

interface ChartData {
  [key: string]: any;
}

interface StatsChartProps {
  data: ChartData[];
  type: 'line' | 'bar' | 'doughnut';
  color?: string;
  colors?: string[];
}

export default function StatsChart({ data, type, color = '#3b82f6', colors }: StatsChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !data.length) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Configuration du canvas
    canvas.width = canvas.offsetWidth * 2;
    canvas.height = canvas.offsetHeight * 2;
    ctx.scale(2, 2);

    // Nettoyer le canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    switch (type) {
      case 'line':
        drawLineChart(ctx, data, color);
        break;
      case 'bar':
        drawBarChart(ctx, data, color);
        break;
      case 'doughnut':
        drawDoughnutChart(ctx, data, colors || [color]);
        break;
    }
  }, [data, type, color, colors]);

  const drawLineChart = (ctx: CanvasRenderingContext2D, data: ChartData[], color: string) => {
    const width = canvasRef.current!.offsetWidth;
    const height = canvasRef.current!.offsetHeight;
    const padding = 40;

    const maxValue = Math.max(...data.map(d => d.count));
    const minValue = Math.min(...data.map(d => d.count));

    const xStep = (width - 2 * padding) / (data.length - 1);
    const yScale = (height - 2 * padding) / (maxValue - minValue);

    // Dessiner la ligne
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    data.forEach((point, index) => {
      const x = padding + index * xStep;
      const y = height - padding - (point.count - minValue) * yScale;

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // Dessiner les points
    ctx.fillStyle = color;
    data.forEach((point, index) => {
      const x = padding + index * xStep;
      const y = height - padding - (point.count - minValue) * yScale;

      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fill();
    });

    // Dessiner les labels
    ctx.fillStyle = '#666';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';

    data.forEach((point, index) => {
      const x = padding + index * xStep;
      ctx.fillText(point.month.substring(0, 3), x, height - 10);
    });
  };

  const drawBarChart = (ctx: CanvasRenderingContext2D, data: ChartData[], color: string) => {
    const width = canvasRef.current!.offsetWidth;
    const height = canvasRef.current!.offsetHeight;
    const padding = 40;

    const maxValue = Math.max(...data.map(d => d.count));
    const barWidth = (width - 2 * padding) / data.length - 10;

    data.forEach((point, index) => {
      const barHeight = (point.count / maxValue) * (height - 2 * padding);
      const x = padding + index * (barWidth + 10);
      const y = height - padding - barHeight;

      ctx.fillStyle = color;
      ctx.fillRect(x, y, barWidth, barHeight);

      // Label
      ctx.fillStyle = '#666';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(point.month.substring(0, 3), x + barWidth / 2, height - 10);
    });
  };

  const drawDoughnutChart = (ctx: CanvasRenderingContext2D, data: ChartData[], colors: string[]) => {
    const width = canvasRef.current!.offsetWidth;
    const height = canvasRef.current!.offsetHeight;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 20;

    const total = data.reduce((sum, item) => sum + item.count, 0);
    let currentAngle = 0;

    data.forEach((point, index) => {
      const sliceAngle = (point.count / total) * 2 * Math.PI;

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
      ctx.arc(centerX, centerY, radius * 0.6, currentAngle + sliceAngle, currentAngle, true);
      ctx.closePath();
      ctx.fillStyle = colors[index % colors.length];
      ctx.fill();

      // Label
      const labelAngle = currentAngle + sliceAngle / 2;
      const labelX = centerX + Math.cos(labelAngle) * (radius * 0.8);
      const labelY = centerY + Math.sin(labelAngle) * (radius * 0.8);

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(point.sport, labelX, labelY);

      currentAngle += sliceAngle;
    });
  };

  return (
    <div className="w-full h-64">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ maxWidth: '100%', height: 'auto' }}
      />
    </div>
  );
}
```

### 6. Tracking des Événements

#### Événements Trackés
```typescript
// src/lib/analytics.ts
export const trackEvent = (eventName: string, parameters?: any) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, {
      ...parameters,
      timestamp: new Date().toISOString()
    });
  }
};

// Événements spécifiques à l'application
export const trackEventCreation = (eventData: any) => {
  trackEvent('event_created', {
    event_category: 'Events',
    event_label: eventData.sport,
    sport: eventData.sport,
    city: eventData.city,
    max_participants: eventData.maxParticipants
  });
};

export const trackEventParticipation = (eventData: any) => {
  trackEvent('event_joined', {
    event_category: 'Participation',
    event_label: eventData.sport,
    sport: eventData.sport,
    city: eventData.city
  });
};

export const trackProfileUpdate = (updatedFields: string[]) => {
  trackEvent('profile_update', {
    event_category: 'Profile',
    updated_fields: updatedFields.join(','),
    fields_count: updatedFields.length
  });
};

export const trackNotificationInteraction = (notificationType: string) => {
  trackEvent('notification_interaction', {
    event_category: 'Notifications',
    notification_type: notificationType
  });
};
```

### 7. Optimisations Performance

#### Cache des Statistiques
```typescript
// src/hooks/useAnalytics.ts
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function useAnalytics() {
  const [statsCache, setStatsCache] = useState<Map<string, { data: UserStats; timestamp: number }>>(new Map());

  const getUserStats = useCallback(async (period: StatsPeriod = 'all') => {
    const cacheKey = `${user?.uid}-${period}`;
    const cached = statsCache.get(cacheKey);

    // Vérifier le cache
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setStats(cached.data);
      return;
    }

    // Récupérer les données...
    const userStats = calculateUserStats(events, participatedEvents, participations, period);
    
    // Mettre en cache
    setStatsCache(prev => new Map(prev).set(cacheKey, {
      data: userStats,
      timestamp: Date.now()
    }));
    
    setStats(userStats);
  }, [user, statsCache]);
}
```

### 8. Tests et Validation

#### Tests des Statistiques
```typescript
// tests/stats.test.ts
import { calculateUserStats } from '@/utils/statsCalculator';

describe('Stats Calculator', () => {
  const mockEvents = [
    { id: '1', sport: 'Football', createdAt: new Date('2024-01-01') },
    { id: '2', sport: 'Basketball', createdAt: new Date('2024-01-15') },
    { id: '3', sport: 'Football', createdAt: new Date('2024-02-01') }
  ];

  const mockParticipations = [
    { id: '1', eventId: '1', joinedAt: new Date('2024-01-01') },
    { id: '2', eventId: '2', joinedAt: new Date('2024-01-15') }
  ];

  test('should calculate total events correctly', () => {
    const stats = calculateUserStats(mockEvents, [], mockParticipations, 'all');
    expect(stats.totalEvents).toBe(3);
  });

  test('should calculate favorite sport correctly', () => {
    const stats = calculateUserStats(mockEvents, [], mockParticipations, 'all');
    expect(stats.favoriteSport).toBe('Football');
  });

  test('should filter by period correctly', () => {
    const stats = calculateUserStats(mockEvents, [], mockParticipations, 'month');
    expect(stats.totalEvents).toBeLessThanOrEqual(3);
  });
});
```

### 9. Améliorations Futures

#### Fonctionnalités à Ajouter
- [ ] **Comparaison temporelle** : Comparer les périodes
- [ ] **Objectifs personnels** : Définir et suivre des objectifs
- [ ] **Recommandations** : Suggestions d'événements
- [ ] **Export des données** : Export PDF/Excel des statistiques
- [ ] **Partage social** : Partager les achievements
- [ ] **Statistiques avancées** : Corrélations et tendances
- [ ] **Gamification** : Système de points et badges
- [ ] **Analytics prédictifs** : Prédictions basées sur l'historique
