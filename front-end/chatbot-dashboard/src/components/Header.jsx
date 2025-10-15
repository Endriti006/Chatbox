import React from 'react';
import { useLocation } from 'react-router-dom';

const Header = () => {
  const location = useLocation();
  
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard';
    if (path === '/chatbots') return 'My Chatbots';
    if (path === '/train') return 'Train Chatbot';
    if (path === '/settings') return 'Settings';
    if (path === '/analytics') return 'Analytics';
    if (path === '/billing') return 'Billing';
    if (path === '/profile') return 'Profile';
    return 'Dashboard';
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{getPageTitle()}</h1>
        </div>
        <div className="flex items-center gap-4">
          <button className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium">
            + New Chatbot
          </button>
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
            <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold">
              A
            </div>
            <span className="text-sm font-medium text-gray-700">Admin</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;