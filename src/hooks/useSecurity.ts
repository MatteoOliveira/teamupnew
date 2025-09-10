'use client';

import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import { 
  sanitizeObject, 
  validateUserData, 
  validateEventData, 
  validateMessageData,
  checkRateLimit 
} from '@/utils/security';

interface SecurityError {
  type: 'validation' | 'rate_limit' | 'sanitization';
  message: string;
  details?: unknown;
}

export function useSecurity() {
  const { user } = useAuth();
  const [errors, setErrors] = useState<SecurityError[]>([]);

  // Nettoyer les erreurs
  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  // Ajouter une erreur
  const addError = useCallback((error: SecurityError) => {
    setErrors(prev => [...prev, error]);
  }, []);

  // Vérifier le rate limiting
  const checkActionRateLimit = useCallback((action: string) => {
    if (!user) {
      addError({
        type: 'rate_limit',
        message: 'Utilisateur non authentifié'
      });
      return false;
    }

    const { allowed, remaining, resetTime } = checkRateLimit(user.uid, action);
    
    if (!allowed) {
      const resetDate = new Date(resetTime);
      addError({
        type: 'rate_limit',
        message: `Limite de ${action} atteinte. Réessayez après ${resetDate.toLocaleTimeString()}`,
        details: { remaining, resetTime }
      });
      return false;
    }

    return true;
  }, [user, addError]);

  // Valider et nettoyer les données utilisateur
  const validateAndSanitizeUserData = useCallback((data: unknown) => {
    clearErrors();

    // Sanitization
    const sanitizedData = sanitizeObject(data);

    // Validation
    const { isValid, errors: validationErrors } = validateUserData(sanitizedData);

    if (!isValid) {
      validationErrors.forEach(error => {
        addError({
          type: 'validation',
          message: error
        });
      });
      return null;
    }

    return sanitizedData;
  }, [clearErrors, addError]);

  // Valider et nettoyer les données d'événement
  const validateAndSanitizeEventData = useCallback((data: unknown) => {
    clearErrors();

    // Vérifier le rate limiting
    if (!checkActionRateLimit('createEvent')) {
      return null;
    }

    // Sanitization
    const sanitizedData = sanitizeObject(data);

    // Validation
    const { isValid, errors: validationErrors } = validateEventData(sanitizedData);

    if (!isValid) {
      validationErrors.forEach(error => {
        addError({
          type: 'validation',
          message: error
        });
      });
      return null;
    }

    return sanitizedData;
  }, [clearErrors, addError, checkActionRateLimit]);

  // Valider et nettoyer les données de message
  const validateAndSanitizeMessageData = useCallback((data: unknown) => {
    clearErrors();

    // Vérifier le rate limiting
    if (!checkActionRateLimit('sendMessage')) {
      return null;
    }

    // Sanitization
    const sanitizedData = sanitizeObject(data);

    // Validation
    const { isValid, errors: validationErrors } = validateMessageData(sanitizedData);

    if (!isValid) {
      validationErrors.forEach(error => {
        addError({
          type: 'validation',
          message: error
        });
      });
      return null;
    }

    return sanitizedData;
  }, [clearErrors, addError, checkActionRateLimit]);

  // Valider une participation à un événement
  const validateParticipation = useCallback(() => {
    clearErrors();

    // Vérifier le rate limiting
    if (!checkActionRateLimit('joinEvent')) {
      return false;
    }

    return true;
  }, [clearErrors, checkActionRateLimit]);

  // Valider une mise à jour de profil
  const validateProfileUpdate = useCallback(() => {
    clearErrors();

    // Vérifier le rate limiting
    if (!checkActionRateLimit('updateProfile')) {
      return false;
    }

    return true;
  }, [clearErrors, checkActionRateLimit]);

  // Obtenir les erreurs par type
  const getErrorsByType = useCallback((type: SecurityError['type']) => {
    return errors.filter(error => error.type === type);
  }, [errors]);

  // Obtenir le message d'erreur principal
  const getMainError = useCallback(() => {
    if (errors.length === 0) return null;
    
    // Priorité : validation > rate_limit > sanitization
    const validationError = errors.find(e => e.type === 'validation');
    if (validationError) return validationError.message;

    const rateLimitError = errors.find(e => e.type === 'rate_limit');
    if (rateLimitError) return rateLimitError.message;

    return errors[0].message;
  }, [errors]);

  // Vérifier s'il y a des erreurs
  const hasErrors = errors.length > 0;

  // Vérifier s'il y a des erreurs de validation
  const hasValidationErrors = errors.some(e => e.type === 'validation');

  // Vérifier s'il y a des erreurs de rate limiting
  const hasRateLimitErrors = errors.some(e => e.type === 'rate_limit');

  return {
    // État
    errors,
    hasErrors,
    hasValidationErrors,
    hasRateLimitErrors,
    
    // Actions
    clearErrors,
    addError,
    
    // Validation et sanitization
    validateAndSanitizeUserData,
    validateAndSanitizeEventData,
    validateAndSanitizeMessageData,
    validateParticipation,
    validateProfileUpdate,
    
    // Utilitaires
    getErrorsByType,
    getMainError,
    checkActionRateLimit
  };
}
