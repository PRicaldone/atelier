import React, { useState } from 'react';
import { Calendar, PenTool, BarChart3, Settings } from 'lucide-react';

const Orchestra = () => {
  const [activeTab, setActiveTab] = useState('calendar');

  const tabs = [
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'composer', label: 'Composer', icon: PenTool },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="h-screen bg-white dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Orchestra
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Orchestrate your content creation across all platforms
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8 px-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 p-4">
        {activeTab === 'calendar' && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 text-center">
            <Calendar className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Content Calendar
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Visual calendar for planning and scheduling content
            </p>
          </div>
        )}

        {activeTab === 'composer' && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 text-center">
            <PenTool className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Post Composer
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Multi-platform content creation with AI assistance
            </p>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 text-center">
            <BarChart3 className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Analytics Dashboard
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Track performance and engagement across platforms
            </p>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 text-center">
            <Settings className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Platform Settings
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Configure social media accounts and automation
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orchestra;