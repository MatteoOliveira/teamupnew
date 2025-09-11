'use client';

import { useEffect, useState } from 'react';

interface ScreenReaderAnnouncementsProps {
  announcements: string[];
  priority?: 'polite' | 'assertive';
}

export default function ScreenReaderAnnouncements({ 
  announcements, 
  priority = 'polite' 
}: ScreenReaderAnnouncementsProps) {
  const [currentAnnouncement, setCurrentAnnouncement] = useState<string>('');
  const [announcementKey, setAnnouncementKey] = useState(0);

  useEffect(() => {
    if (announcements.length > 0) {
      const latestAnnouncement = announcements[announcements.length - 1];
      setCurrentAnnouncement(latestAnnouncement);
      setAnnouncementKey(prev => prev + 1);
    }
  }, [announcements]);

  return (
    <div
      key={announcementKey}
      aria-live={priority}
      aria-atomic="true"
      className="sr-only"
    >
      {currentAnnouncement}
    </div>
  );
}

// Hook pour utiliser les annonces d'écran
export function useScreenReaderAnnouncements() {
  const [announcements, setAnnouncements] = useState<string[]>([]);

  const announce = (message: string) => {
    setAnnouncements(prev => [...prev, message]);
    
    // Nettoyer l'annonce après 5 secondes
    setTimeout(() => {
      setAnnouncements(prev => prev.filter(msg => msg !== message));
    }, 5000);
  };

  const clearAnnouncements = () => {
    setAnnouncements([]);
  };

  return {
    announcements,
    announce,
    clearAnnouncements
  };
}
