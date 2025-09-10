import React from 'react';
import { StatsPeriod } from '@/types/stats';

interface PeriodSelectorProps {
  selectedPeriod: StatsPeriod;
  onPeriodChange: (period: StatsPeriod) => void;
  className?: string;
}

const periods: StatsPeriod[] = [
  {
    key: 'all',
    label: 'Tout le temps',
    startDate: new Date(0),
    endDate: new Date()
  },
  {
    key: 'month',
    label: 'Ce mois',
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    endDate: new Date()
  },
  {
    key: 'year',
    label: 'Cette année',
    startDate: new Date(new Date().getFullYear(), 0, 1),
    endDate: new Date()
  }
];

export default function PeriodSelector({ selectedPeriod, onPeriodChange, className = '' }: PeriodSelectorProps) {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <span className="text-sm font-medium text-gray-700">Période :</span>
      <div className="relative">
        <select
          value={selectedPeriod.key}
          onChange={(e) => {
            const period = periods.find(p => p.key === e.target.value);
            if (period) onPeriodChange(period);
          }}
          className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        >
          {periods.map(period => (
            <option key={period.key} value={period.key}>
              {period.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
}
