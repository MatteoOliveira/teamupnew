'use client';

import { Menu } from '@headlessui/react';
import { useRouter } from 'next/navigation';

interface AdminNavigationProps {
  currentPage: 'dashboard' | 'users' | 'events' | 'analytics' | 'settings';
}

const ADMIN_TABS = [
  { key: 'dashboard', label: 'Dashboard', icon: '📊' },
  { key: 'users', label: 'Utilisateurs', icon: '👥' },
  { key: 'events', label: 'Événements', icon: '📅' },
  { key: 'analytics', label: 'Analytics', icon: '📈' },
  { key: 'settings', label: 'Paramètres', icon: '⚙️' },
];

export default function AdminNavigation({ currentPage }: AdminNavigationProps) {
  const router = useRouter();

  const handleNavigation = (page: string) => {
    router.push(`/admin/${page}`);
  };

  return (
    <div className="mb-6 sm:mb-8">
      {/* Menu burger pour mobile */}
      <div className="sm:hidden">
        <Menu as="div" className="relative">
          <Menu.Button className="flex items-center justify-between w-full px-4 py-3 text-sm font-medium text-gray-900 bg-gray-50 border border-gray-300 rounded-lg shadow-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <span className="flex items-center space-x-2">
              <div className="w-4 h-4 text-blue-500">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </div>
              <span>{ADMIN_TABS.find(tab => tab.key === currentPage)?.label}</span>
            </span>
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </Menu.Button>
          <Menu.Items className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg focus:outline-none">
            <div className="py-2">
              {ADMIN_TABS.map(tab => (
                <Menu.Item key={tab.key}>
                  {({ active }) => (
                    <button
                      onClick={() => handleNavigation(tab.key)}
                      className={`${
                        active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                      } ${
                        currentPage === tab.key ? 'bg-blue-50 text-blue-700 font-semibold' : ''
                      } flex items-center space-x-3 w-full text-left px-4 py-3 text-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md mx-2`}
                    >
                      <div className={`w-2 h-2 rounded-full ${currentPage === tab.key ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                      <span className="text-lg">{tab.icon}</span>
                      <span>{tab.label}</span>
                    </button>
                  )}
                </Menu.Item>
              ))}
            </div>
          </Menu.Items>
        </Menu>
      </div>
      
      {/* Onglets horizontaux pour desktop */}
      <div className="hidden sm:block">
        <nav className="flex flex-wrap gap-1 sm:gap-0 sm:space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
          {ADMIN_TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => handleNavigation(tab.key)}
              className={`px-2 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                currentPage === tab.key
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white'
              }`}
            >
              {tab.icon} <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
