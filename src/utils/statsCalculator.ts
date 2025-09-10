import { EventData, ParticipantData, UserStats, StatsPeriod } from '@/types/stats';

// Couleurs pour les graphiques
const CHART_COLORS = {
  blue: '#3B82F6',
  green: '#10B981',
  purple: '#8B5CF6',
  yellow: '#F59E0B',
  red: '#EF4444',
  orange: '#F97316',
  pink: '#EC4899',
  indigo: '#6366F1',
  teal: '#14B8A6',
  gray: '#6B7280'
};

// const SPORT_COLORS = [
//   CHART_COLORS.blue,
//   CHART_COLORS.green,
//   CHART_COLORS.purple,
//   CHART_COLORS.yellow,
//   CHART_COLORS.red,
//   CHART_COLORS.orange,
//   CHART_COLORS.pink,
//   CHART_COLORS.indigo,
//   CHART_COLORS.teal,
//   CHART_COLORS.gray
// ];

// Fonction pour obtenir la période sélectionnée
export function getStatsPeriod(periodKey: 'all' | 'month' | 'year' | 'week'): StatsPeriod {
  const now = new Date();
  
  switch (periodKey) {
    case 'week':
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      weekStart.setHours(0, 0, 0, 0);
      return {
        key: 'week',
        label: 'Cette semaine',
        startDate: weekStart,
        endDate: now
      };
    case 'month':
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      return {
        key: 'month',
        label: 'Ce mois',
        startDate: monthStart,
        endDate: now
      };
    case 'year':
      const yearStart = new Date(now.getFullYear(), 0, 1);
      return {
        key: 'year',
        label: 'Cette année',
        startDate: yearStart,
        endDate: now
      };
    default:
      return {
        key: 'all',
        label: 'Tout le temps',
        startDate: new Date(0),
        endDate: now
      };
  }
}

// Fonction pour filtrer les événements par période
export function filterEventsByPeriod(events: EventData[], period: StatsPeriod): EventData[] {
  return events.filter(event => {
    if (!event.date?.seconds) return false;
    const eventDate = new Date(event.date.seconds * 1000);
    return eventDate >= period.startDate && eventDate <= period.endDate;
  });
}

// Fonction principale pour calculer toutes les statistiques
export function calculateUserStats(
  events: EventData[],
  participants: ParticipantData[],
  userId: string,
  period: StatsPeriod
): UserStats {
  // Filtrer les événements par période
  const filteredEvents = filterEventsByPeriod(events, period);
  
  // Séparer les événements créés et rejoints
  const createdEvents = filteredEvents.filter(event => event.createdBy === userId);
  const joinedEventIds = participants
    .filter(p => p.userId === userId && !p.isOrganizer)
    .map(p => p.eventId);
  const joinedEvents = filteredEvents.filter(event => joinedEventIds.includes(event.id));
  
  // Calculer les métriques de base
  const totalEvents = createdEvents.length + joinedEvents.length;
  const eventsCreated = createdEvents.length;
  const eventsJoined = joinedEvents.length;
  
  // Calculer le sport favori
  const sportCounts: { [key: string]: number } = {};
  filteredEvents.forEach(event => {
    if (event.sport) {
      sportCounts[event.sport] = (sportCounts[event.sport] || 0) + 1;
    }
  });
  
  const favoriteSport = Object.keys(sportCounts).length > 0 
    ? Object.keys(sportCounts).reduce((a, b) => sportCounts[a] > sportCounts[b] ? a : b)
    : 'Aucun';
  
  // Calculer le taux de participation
  const participationRate = eventsCreated > 0 
    ? Math.round((eventsJoined / eventsCreated) * 100)
    : 0;
  
  // Calculer la durée moyenne des événements
  const eventsWithDuration = filteredEvents.filter(event => 
    event.date?.seconds && event.endDate?.seconds
  );
  
  const totalDuration = eventsWithDuration.reduce((sum, event) => {
    const start = new Date(event.date!.seconds * 1000);
    const end = new Date(event.endDate!.seconds * 1000);
    return sum + (end.getTime() - start.getTime());
  }, 0);
  
  const averageEventDuration = eventsWithDuration.length > 0 
    ? Math.round((totalDuration / eventsWithDuration.length) / (1000 * 60 * 60) * 10) / 10 // En heures, arrondi à 1 décimale
    : 0;
  
  // Calculer le score d'activité (basé sur la fréquence et la diversité)
  const activityScore = calculateActivityScore(filteredEvents);
  
  // Calculer les événements par mois
  const eventsByMonth = calculateEventsByMonth(filteredEvents);
  
  // Calculer la répartition par sport
  const sportDistribution = calculateSportDistribution(filteredEvents);
  
  // Calculer les objectifs
  const monthlyGoal = calculateMonthlyGoal(events, participants, userId);
  const newSportsGoal = calculateNewSportsGoal(events, participants, userId);
  
  return {
    totalEvents,
    eventsCreated,
    eventsJoined,
    favoriteSport,
    participationRate,
    averageEventDuration,
    activityScore,
    eventsByMonth,
    sportDistribution,
    monthlyGoal,
    newSportsGoal
  };
}

// Calculer le score d'activité (0-5)
function calculateActivityScore(events: EventData[]): number {
  if (events.length === 0) return 0;
  
  // Facteurs de score
  const totalEvents = events.length;
  const uniqueSports = new Set(events.map(e => e.sport)).size;
  const recentEvents = events.filter(e => {
    if (!e.date?.seconds) return false;
    const eventDate = new Date(e.date.seconds * 1000);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    return eventDate >= thirtyDaysAgo;
  }).length;
  
  // Score basé sur la fréquence (max 2 points)
  const frequencyScore = Math.min(totalEvents / 10, 2);
  
  // Score basé sur la diversité (max 2 points)
  const diversityScore = Math.min(uniqueSports / 3, 2);
  
  // Score basé sur l'activité récente (max 1 point)
  const recentScore = Math.min(recentEvents / 5, 1);
  
  return Math.round((frequencyScore + diversityScore + recentScore) * 10) / 10;
}

// Calculer les événements par mois
function calculateEventsByMonth(events: EventData[]): { month: string; count: number }[] {
  const monthCounts: { [key: string]: number } = {};
  
  events.forEach(event => {
    if (event.date?.seconds) {
      const date = new Date(event.date.seconds * 1000);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthCounts[monthKey] = (monthCounts[monthKey] || 0) + 1;
    }
  });
  
  // Générer les mois dans l'ordre chronologique avec le mois actuel au centre
  const months = [];
  const now = new Date();
  
  // Commencer par 6 mois avant le mois actuel
  for (let i = -6; i <= 5; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const monthNames = [
      'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun',
      'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'
    ];
    
    months.push({
      month: monthNames[date.getMonth()],
      count: monthCounts[monthKey] || 0
    });
  }
  
  return months;
}

// Calculer la répartition par sport
function calculateSportDistribution(events: EventData[]): { sport: string; count: number; percentage: number }[] {
  const sportCounts: { [key: string]: number } = {};
  
  events.forEach(event => {
    if (event.sport) {
      sportCounts[event.sport] = (sportCounts[event.sport] || 0) + 1;
    }
  });
  
  const total = events.length;
  
  return Object.entries(sportCounts)
    .map(([sport, count]) => ({
      sport,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0
    }))
    .sort((a, b) => b.count - a.count);
}

// Calculer l'objectif mensuel
function calculateMonthlyGoal(events: EventData[], participants: ParticipantData[], userId: string): { current: number; target: number } {
  const currentMonthEvents = events.filter(event => {
    if (!event.date?.seconds) return false;
    const eventDate = new Date(event.date.seconds * 1000);
    const now = new Date();
    return eventDate.getMonth() === now.getMonth() && 
           eventDate.getFullYear() === now.getFullYear() &&
           (event.createdBy === userId || participants.some(p => p.userId === userId && p.eventId === event.id));
  });
  
  return {
    current: currentMonthEvents.length,
    target: 10 // Objectif par défaut
  };
}

// Calculer l'objectif nouveaux sports
function calculateNewSportsGoal(events: EventData[], participants: ParticipantData[], userId: string): { current: number; target: number } {
  const userEvents = events.filter(event => 
    event.createdBy === userId || participants.some(p => p.userId === userId && p.eventId === event.id)
  );
  
  const uniqueSports = new Set(userEvents.map(e => e.sport)).size;
  
  return {
    current: uniqueSports,
    target: 5 // Objectif par défaut
  };
}