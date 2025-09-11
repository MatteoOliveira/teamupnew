'use client';

import { useState } from 'react';
import { AdminAnalytics } from '@/hooks/useAdminAnalytics';

interface AdminChartsProps {
  analytics: AdminAnalytics;
}

export default function AdminCharts({ analytics }: AdminChartsProps) {
  const [activeChart, setActiveChart] = useState<'activity' | 'events' | 'users' | 'sports'>('activity');

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
  };

  const getMaxValue = (data: { count: number }[] | { users: number }[]) => {
    return Math.max(...data.map(item => 'count' in item ? item.count : item.users));
  };

  const renderBarChart = (data: { date: string; count: number }[] | { date: string; users: number }[], color: string) => {
    const maxValue = getMaxValue(data);
    
    return (
      <div className="space-y-2">
        {data.map((item, index) => {
          const value = 'count' in item ? item.count : item.users;
          const percentage = (value / maxValue) * 100;
          
          return (
            <div key={index} className="flex items-center space-x-3">
              <div className="w-16 text-xs text-gray-600 text-right">
                {formatDate(item.date)}
              </div>
              <div className="flex-1 bg-gray-200 rounded-full h-4 relative">
                <div
                  className={`h-4 rounded-full ${color} transition-all duration-500`}
                  style={{ width: `${percentage}%` }}
                ></div>
                <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
                  {value}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderPieChart = (data: { sport: string; count: number }[]) => {
    const total = data.reduce((sum, item) => sum + item.count, 0);
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500', 'bg-purple-500'];
    
    return (
      <div className="space-y-3">
        {data.map((item, index) => {
          const percentage = (item.count / total) * 100;
          const color = colors[index % colors.length];
          
          return (
            <div key={index} className="flex items-center space-x-3">
              <div className={`w-4 h-4 rounded-full ${color}`}></div>
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">{item.sport}</span>
                  <span className="text-sm text-gray-500">{item.count} événements</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div
                    className={`h-2 rounded-full ${color} transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Analytics</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveChart('activity')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              activeChart === 'activity'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Activité
          </button>
          <button
            onClick={() => setActiveChart('events')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              activeChart === 'events'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Événements
          </button>
          <button
            onClick={() => setActiveChart('users')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              activeChart === 'users'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Utilisateurs
          </button>
          <button
            onClick={() => setActiveChart('sports')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              activeChart === 'sports'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Sports
          </button>
        </div>
      </div>

      <div className="h-64">
        {activeChart === 'activity' && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-4">Utilisateurs actifs (7 derniers jours)</h4>
            {renderBarChart(analytics.peakActivity, 'bg-gradient-to-r from-blue-500 to-blue-600')}
          </div>
        )}

        {activeChart === 'events' && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-4">Événements créés (7 derniers jours)</h4>
            {renderBarChart(analytics.eventsPerDay, 'bg-gradient-to-r from-green-500 to-green-600')}
          </div>
        )}

        {activeChart === 'users' && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-4">Croissance des utilisateurs (30 derniers jours)</h4>
            {renderBarChart(analytics.userGrowth, 'bg-gradient-to-r from-purple-500 to-purple-600')}
          </div>
        )}

        {activeChart === 'sports' && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-4">Sports les plus populaires</h4>
            {renderPieChart(analytics.popularSports)}
          </div>
        )}
      </div>
    </div>
  );
}
