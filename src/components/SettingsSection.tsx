'use client';

import { useState } from 'react';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface SettingsSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export default function SettingsSection({ 
  title, 
  icon, 
  children, 
  defaultOpen = false,
  className = ''
}: SettingsSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-inset rounded-lg"
        aria-expanded={isOpen}
        aria-controls={`section-${title.toLowerCase().replace(/\s+/g, '-')}`}
      >
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 text-purple-600">
            {icon}
          </div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        <div className="w-5 h-5 text-gray-400">
          {isOpen ? (
            <ChevronDownIcon className="w-5 h-5" />
          ) : (
            <ChevronRightIcon className="w-5 h-5" />
          )}
        </div>
      </button>
      
      {isOpen && (
        <div 
          id={`section-${title.toLowerCase().replace(/\s+/g, '-')}`}
          className="px-4 pb-4 border-t border-gray-100"
        >
          <div className="pt-4">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}
