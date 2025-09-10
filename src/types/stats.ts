// Types pour les statistiques utilisateur
export interface EventData {
  id: string;
  name: string;
  sport: string;
  city: string;
  date?: { seconds: number };
  endDate?: { seconds: number };
  createdBy: string;
  isReserved?: boolean;
  maxParticipants?: number;
  currentParticipants?: number;
}

export interface ParticipantData {
  id: string;
  eventId: string;
  userId: string;
  userName: string;
  registeredAt: { seconds: number };
  isOrganizer?: boolean;
}

export interface UserStats {
  // Métriques principales
  totalEvents: number;
  eventsCreated: number;
  eventsJoined: number;
  favoriteSport: string;
  
  // Métriques avancées
  participationRate: number; // Pourcentage d'événements rejoints vs créés
  averageEventDuration: number; // En heures
  activityScore: number; // Score sur 5
  
  // Données pour les graphiques
  eventsByMonth: { month: string; count: number }[];
  sportDistribution: { sport: string; count: number; percentage: number }[];
  
  // Objectifs et défis
  monthlyGoal: { current: number; target: number };
  newSportsGoal: { current: number; target: number };
}

export interface StatsPeriod {
  key: 'all' | 'month' | 'year';
  label: string;
  startDate: Date;
  endDate: Date;
}

export interface MetricCard {
  title: string;
  value: string | number;
  subtitle: string;
  icon: string;
  color: string;
  change?: string;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string[];
    borderColor?: string[];
  }[];
}
