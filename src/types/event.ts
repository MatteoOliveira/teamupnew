export interface Event {
  id: string;
  name: string;
  city: string;
  location: string;
  address?: string;
  postcode?: string;
  sport?: string;
  sportEmoji?: string;
  sportColor?: string;
  date?: { seconds: number } | string;
  endDate?: { seconds: number } | string;
  description: string;
  maxParticipants: number;
  currentParticipants?: number;
  createdBy: string;
  createdByName?: string;
  contactInfo: string;
  isReserved?: boolean;
  createdAt?: Date;
}

export interface Participant {
  id: string;
  userId: string;
  userName: string;
  contact: string;
  registeredAt?: { seconds: number };
}

export interface CachedEvent extends Event {
  cachedAt: Date;
  isOfflineAvailable: boolean;
  participants?: Participant[];
}
