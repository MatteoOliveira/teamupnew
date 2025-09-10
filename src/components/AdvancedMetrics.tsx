import React from 'react';
import MetricCard from './MetricCard';
import { MetricCard as MetricCardType } from '@/types/stats';

interface AdvancedMetricsProps {
  participationRate: number;
  averageEventDuration: number;
  activityScore: number;
  className?: string;
}

export default function AdvancedMetrics({ 
  participationRate, 
  averageEventDuration, 
  activityScore,
  className = '' 
}: AdvancedMetricsProps) {
  const metrics: MetricCardType[] = [
    {
      title: 'Taux de participation',
      value: `${participationRate}%`,
      subtitle: 'Événements rejoints sur créés',
      icon: 'chart',
      color: 'purple'
    },
    {
      title: 'Temps moyen',
      value: `${averageEventDuration}h`,
      subtitle: 'Durée moyenne des événements',
      icon: 'clock',
      color: 'green'
    },
    {
      title: 'Score d\'activité',
      value: `${activityScore}/5`,
      subtitle: 'Niveau d\'engagement',
      icon: 'heart',
      color: 'red'
    }
  ];

  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${className}`}>
      {metrics.map((metric, index) => (
        <MetricCard key={index} metric={metric} />
      ))}
    </div>
  );
}
