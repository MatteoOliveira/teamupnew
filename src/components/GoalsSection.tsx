import React from 'react';

interface Goal {
  label: string;
  current: number;
  target: number;
  color: string;
}

interface GoalsSectionProps {
  goals: Goal[];
  className?: string;
}

export default function GoalsSection({ goals, className = '' }: GoalsSectionProps) {
  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const getProgressColor = (current: number, target: number) => {
    const percentage = (current / target) * 100;
    if (percentage >= 100) return 'from-green-500 to-green-600';
    if (percentage >= 75) return 'from-blue-500 to-blue-600';
    if (percentage >= 50) return 'from-yellow-500 to-yellow-600';
    return 'from-gray-400 to-gray-500';
  };

  return (
    <div className={`bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6 shadow-sm border border-gray-200 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Objectifs et défis</h3>
      
      <div className="space-y-4">
        {goals.map((goal, index) => {
          const progressPercentage = getProgressPercentage(goal.current, goal.target);
          const progressColor = getProgressColor(goal.current, goal.target);
          
          return (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-900">
                  {goal.label}
                </span>
                <span className="text-sm text-gray-600">
                  {goal.current}/{goal.target}
                </span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full bg-gradient-to-r ${progressColor} transition-all duration-500 ease-out`}
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              
              <div className="text-xs text-gray-500">
                {progressPercentage >= 100 
                  ? '🎉 Objectif atteint !' 
                  : `${Math.round(progressPercentage)}% complété`
                }
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
