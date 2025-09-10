import React from 'react';
import { MetricCard as MetricCardType } from '@/types/stats';

interface MetricCardProps {
  metric: MetricCardType;
}

const iconMap = {
  calendar: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  plus: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    </svg>
  ),
  users: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  lightning: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  chart: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  clock: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  heart: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  )
};

const colorClasses = {
  blue: {
    bg: 'bg-blue-50',
    iconBg: 'bg-blue-500',
    text: 'text-blue-600',
    change: 'text-blue-600'
  },
  green: {
    bg: 'bg-green-50',
    iconBg: 'bg-green-500',
    text: 'text-green-600',
    change: 'text-green-600'
  },
  purple: {
    bg: 'bg-purple-50',
    iconBg: 'bg-purple-500',
    text: 'text-purple-600',
    change: 'text-purple-600'
  },
  yellow: {
    bg: 'bg-yellow-50',
    iconBg: 'bg-yellow-500',
    text: 'text-yellow-600',
    change: 'text-yellow-600'
  },
  red: {
    bg: 'bg-red-50',
    iconBg: 'bg-red-500',
    text: 'text-red-600',
    change: 'text-red-600'
  },
  orange: {
    bg: 'bg-orange-50',
    iconBg: 'bg-orange-500',
    text: 'text-orange-600',
    change: 'text-orange-600'
  }
};

export default function MetricCard({ metric }: MetricCardProps) {
  const colors = colorClasses[metric.color as keyof typeof colorClasses] || colorClasses.blue;
  const icon = iconMap[metric.icon as keyof typeof iconMap] || iconMap.calendar;

  return (
    <div className={`${colors.bg} rounded-lg p-4 shadow-sm border border-gray-200`}>
      <div className="flex items-center justify-between mb-3">
        <div className={`${colors.iconBg} rounded-lg p-2 text-white`}>
          {icon}
        </div>
        {metric.change && (
          <span className={`text-sm font-medium ${colors.change}`}>
            {metric.change}
          </span>
        )}
      </div>
      
      <div className="mb-2">
        <div className={`text-2xl font-bold ${colors.text}`}>
          {metric.value}
        </div>
        <div className="text-sm font-semibold text-gray-900">
          {metric.title}
        </div>
      </div>
      
      <div className="text-sm text-gray-600">
        {metric.subtitle}
      </div>
    </div>
  );
}
