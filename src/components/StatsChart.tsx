import React from 'react';
import { ChartData } from '@/types/stats';

interface StatsChartProps {
  title: string;
  data: ChartData;
  type: 'bar' | 'horizontal-bar' | 'line';
  className?: string;
}

export default function StatsChart({ title, data, type, className = '' }: StatsChartProps) {
  const maxValue = Math.max(...data.datasets[0].data);

  const renderBarChart = () => (
    <div className="space-y-3">
      {data.labels.map((label, index) => {
        const value = data.datasets[0].data[index];
        const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
        const color = data.datasets[0].backgroundColor[index] || '#3B82F6';
        
        return (
          <div key={index} className="flex items-center space-x-3">
            <div className="w-12 text-xs text-gray-600 text-right">
              {label}
            </div>
            <div className="flex-1">
              <div className="w-full bg-gray-200 rounded-full h-6 relative">
                <div
                  className="h-6 rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: color
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
                  {value > 0 && value}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderHorizontalBarChart = () => (
    <div className="space-y-4">
      {data.labels.map((label, index) => {
        const value = data.datasets[0].data[index];
        const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
        const color = data.datasets[0].backgroundColor[index] || '#3B82F6';
        
        return (
          <div key={index} className="flex items-center justify-between">
            <div className="flex-1 flex items-center space-x-3">
              <div className="w-20 text-sm text-gray-900 font-medium">
                {label}
              </div>
              <div className="flex-1">
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className="h-4 rounded-full transition-all duration-500 ease-out"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: color
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="w-12 text-sm text-gray-600 text-right">
              {value}%
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderVerticalBarChart = () => (
    <div className="flex items-end justify-between h-64 space-x-2">
      {data.labels.map((label, index) => {
        const value = data.datasets[0].data[index];
        const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
        const color = data.datasets[0].backgroundColor[index] || '#3B82F6';
        
        return (
          <div key={index} className="flex flex-col items-center flex-1">
            <div className="w-full bg-gray-200 rounded-t-lg relative mb-2" style={{ height: '200px' }}>
              <div
                className="w-full rounded-t-lg transition-all duration-500 ease-out"
                style={{
                  height: `${percentage}%`,
                  backgroundColor: color,
                  position: 'absolute',
                  bottom: 0
                }}
              />
              {value > 0 && (
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-900">
                  {value}
                </div>
              )}
            </div>
            <div className="text-xs text-gray-600 text-center mt-1">
              {label}
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderChart = () => {
    switch (type) {
      case 'horizontal-bar':
        return renderHorizontalBarChart();
      case 'bar':
        return renderVerticalBarChart();
      default:
        return renderBarChart();
    }
  };

  return (
    <div className={`bg-white rounded-lg p-6 shadow-sm border border-gray-200 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      {renderChart()}
    </div>
  );
}
