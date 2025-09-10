/**
 * Utilitaires de sécurité pour TeamUp
 * Validation, sanitization et rate limiting
 */

// ==========================================
// SANITIZATION DES DONNÉES
// ==========================================

/**
 * Nettoie une chaîne de caractères en supprimant les éléments dangereux
 */
export const sanitizeString = (input: string): string => {
  if (typeof input !== 'string') {
    return '';
  }

  return input
    // Supprimer les balises HTML dangereuses
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
    .replace(/<link\b[^<]*(?:(?!<\/link>)<[^<]*)*<\/link>/gi, '')
    .replace(/<meta\b[^<]*(?:(?!<\/meta>)<[^<]*)*<\/meta>/gi, '')
    
    // Supprimer les attributs dangereux
    .replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/\s*javascript\s*:/gi, '')
    .replace(/\s*vbscript\s*:/gi, '')
    .replace(/\s*data\s*:/gi, '')
    
    // Supprimer les caractères de contrôle
    .replace(/[\x00-\x1F\x7F]/g, '')
    
    // Normaliser les espaces
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Nettoie un objet en appliquant la sanitization à toutes les chaînes
 */
export const sanitizeObject = (obj: unknown): unknown => {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }

  if (typeof obj === 'object') {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeObject(value);
    }
    return sanitized;
  }

  return obj;
};

// ==========================================
// VALIDATION DES DONNÉES
// ==========================================

/**
 * Valide une adresse email
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valide un nom d'utilisateur
 */
export const isValidUsername = (username: string): boolean => {
  return typeof username === 'string' && 
    username.length >= 2 && 
    username.length <= 50 &&
    /^[a-zA-Z0-9\s\-_àâäéèêëïîôöùûüÿçÀÂÄÉÈÊËÏÎÔÖÙÛÜŸÇ]+$/.test(username);
};

/**
 * Valide un nom de sport
 */
export const isValidSport = (sport: string): boolean => {
  const validSports = [
    'football', 'basketball', 'tennis', 'running', 'cycling', 'swimming',
    'volleyball', 'badminton', 'table-tennis', 'golf', 'rugby', 'handball',
    'athletics', 'boxing', 'martial-arts', 'yoga', 'pilates', 'dance',
    'hiking', 'climbing', 'skiing', 'snowboarding', 'surfing', 'other'
  ];
  return validSports.includes(sport.toLowerCase());
};

/**
 * Valide un nom de ville
 */
export const isValidCity = (city: string): boolean => {
  return typeof city === 'string' && 
    city.length >= 2 && 
    city.length <= 50 &&
    /^[a-zA-Z\s\-àâäéèêëïîôöùûüÿçÀÂÄÉÈÊËÏÎÔÖÙÛÜŸÇ]+$/.test(city);
};

/**
 * Valide un nom d'événement
 */
export const isValidEventName = (name: string): boolean => {
  return typeof name === 'string' && 
    name.length >= 3 && 
    name.length <= 100 &&
    /^[a-zA-Z0-9\s\-_àâäéèêëïîôöùûüÿçÀÂÄÉÈÊËÏÎÔÖÙÛÜŸÇ!?.,:()]+$/.test(name);
};

/**
 * Valide une description d'événement
 */
export const isValidEventDescription = (description: string): boolean => {
  return typeof description === 'string' && 
    description.length >= 10 && 
    description.length <= 1000;
};

/**
 * Valide un message de chat
 */
export const isValidMessage = (message: string): boolean => {
  return typeof message === 'string' && 
    message.length >= 1 && 
    message.length <= 500;
};

/**
 * Valide des coordonnées GPS
 */
export const isValidCoordinates = (lat: number, lng: number): boolean => {
  return typeof lat === 'number' && 
    typeof lng === 'number' &&
    lat >= -90 && lat <= 90 &&
    lng >= -180 && lng <= 180;
};

/**
 * Valide une date
 */
export const isValidDate = (date: unknown): boolean => {
  if (!date) return false;
  
  if (date instanceof Date) {
    return !isNaN(date.getTime()) && date > new Date();
  }
  
  if (typeof date === 'object' && date !== null) {
    const dateObj = date as Record<string, unknown>;
    if (typeof dateObj.seconds === 'number') {
      const dateInstance = new Date(dateObj.seconds * 1000);
      return !isNaN(dateInstance.getTime()) && dateInstance > new Date();
    }
  }
  
  return false;
};

// ==========================================
// VALIDATION D'OBJETS COMPLETS
// ==========================================

/**
 * Valide les données d'un utilisateur
 */
export const validateUserData = (data: unknown): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    errors.push('Données invalides');
    return { isValid: false, errors };
  }

  const userData = data as Record<string, unknown>;

  if (!userData.name || !isValidUsername(userData.name as string)) {
    errors.push('Nom invalide (2-50 caractères, lettres et chiffres uniquement)');
  }

  if (!userData.sport || !isValidSport(userData.sport as string)) {
    errors.push('Sport invalide');
  }

  if (!userData.city || !isValidCity(userData.city as string)) {
    errors.push('Ville invalide (2-50 caractères, lettres uniquement)');
  }

  if (userData.email && !isValidEmail(userData.email as string)) {
    errors.push('Email invalide');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Valide les données d'un événement
 */
export const validateEventData = (data: unknown): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    errors.push('Données invalides');
    return { isValid: false, errors };
  }

  const eventData = data as Record<string, unknown>;

  if (!eventData.name || !isValidEventName(eventData.name as string)) {
    errors.push('Nom d\'événement invalide (3-100 caractères)');
  }

  if (!eventData.sport || !isValidSport(eventData.sport as string)) {
    errors.push('Sport invalide');
  }

  if (!eventData.city || !isValidCity(eventData.city as string)) {
    errors.push('Ville invalide');
  }

  if (!eventData.location || typeof eventData.location !== 'string' || eventData.location.length < 5 || eventData.location.length > 200) {
    errors.push('Lieu invalide (5-200 caractères)');
  }

  if (!eventData.description || !isValidEventDescription(eventData.description as string)) {
    errors.push('Description invalide (10-1000 caractères)');
  }

  if (!eventData.date || !isValidDate(eventData.date)) {
    errors.push('Date invalide (doit être dans le futur)');
  }

  if (!eventData.createdBy || typeof eventData.createdBy !== 'string') {
    errors.push('Créateur invalide');
  }

  if (eventData.lat !== undefined && eventData.lng !== undefined) {
    if (!isValidCoordinates(eventData.lat as number, eventData.lng as number)) {
      errors.push('Coordonnées GPS invalides');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Valide les données d'un message
 */
export const validateMessageData = (data: unknown): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    errors.push('Données invalides');
    return { isValid: false, errors };
  }

  const messageData = data as Record<string, unknown>;

  if (!messageData.content || !isValidMessage(messageData.content as string)) {
    errors.push('Message invalide (1-500 caractères)');
  }

  if (!messageData.senderId || typeof messageData.senderId !== 'string') {
    errors.push('ID expéditeur invalide');
  }

  if (!messageData.senderName || !isValidUsername(messageData.senderName as string)) {
    errors.push('Nom expéditeur invalide');
  }

  if (!messageData.timestamp || !isValidDate(messageData.timestamp)) {
    errors.push('Timestamp invalide');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// ==========================================
// RATE LIMITING
// ==========================================

interface RateLimitConfig {
  windowMs: number; // Fenêtre de temps en ms
  maxRequests: number; // Nombre max de requêtes
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private limits: Map<string, RateLimitEntry> = new Map();
  private configs: Map<string, RateLimitConfig> = new Map();

  constructor() {
    // Configuration par défaut
    this.setConfig('createEvent', { windowMs: 3600000, maxRequests: 5 }); // 5 événements/heure
    this.setConfig('sendMessage', { windowMs: 3600000, maxRequests: 50 }); // 50 messages/heure
    this.setConfig('joinEvent', { windowMs: 3600000, maxRequests: 10 }); // 10 participations/heure
    this.setConfig('updateProfile', { windowMs: 3600000, maxRequests: 20 }); // 20 mises à jour/heure
  }

  setConfig(action: string, config: RateLimitConfig) {
    this.configs.set(action, config);
  }

  isAllowed(userId: string, action: string): boolean {
    const config = this.configs.get(action);
    if (!config) return true;

    const key = `${userId}:${action}`;
    const now = Date.now();
    const entry = this.limits.get(key);

    if (!entry || now > entry.resetTime) {
      // Nouvelle fenêtre ou première requête
      this.limits.set(key, {
        count: 1,
        resetTime: now + config.windowMs
      });
      return true;
    }

    if (entry.count >= config.maxRequests) {
      return false;
    }

    entry.count++;
    return true;
  }

  getRemainingRequests(userId: string, action: string): number {
    const config = this.configs.get(action);
    if (!config) return Infinity;

    const key = `${userId}:${action}`;
    const entry = this.limits.get(key);

    if (!entry) return config.maxRequests;

    return Math.max(0, config.maxRequests - entry.count);
  }

  getResetTime(userId: string, action: string): number {
    const key = `${userId}:${action}`;
    const entry = this.limits.get(key);
    return entry ? entry.resetTime : 0;
  }
}

// Instance globale du rate limiter
export const rateLimiter = new RateLimiter();

/**
 * Vérifie si une action est autorisée selon le rate limiting
 */
export const checkRateLimit = (userId: string, action: string): { allowed: boolean; remaining: number; resetTime: number } => {
  const allowed = rateLimiter.isAllowed(userId, action);
  const remaining = rateLimiter.getRemainingRequests(userId, action);
  const resetTime = rateLimiter.getResetTime(userId, action);

  return { allowed, remaining, resetTime };
};

// ==========================================
// UTILITAIRES DE SÉCURITÉ
// ==========================================

/**
 * Génère un token CSRF simple
 */
export const generateCSRFToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

/**
 * Valide un token CSRF
 */
export const validateCSRFToken = (token: string, expectedToken: string): boolean => {
  return token === expectedToken && token.length === 64;
};

/**
 * Échappe les caractères HTML
 */
export const escapeHtml = (text: string): string => {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
};

/**
 * Valide une URL
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};
