/**
 * AI Transparency Dashboard
 * Provides users complete visibility into AI operations and data usage
 */

import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Eye, 
  Download, 
  Trash2, 
  Settings, 
  Activity, 
  Lock,
  Unlock,
  AlertCircle,
  CheckCircle,
  Clock,
  Database,
  Cpu,
  Zap
} from 'lucide-react';

import { consentManager, ConsentTypes } from '../modules/shared/ai/consent/ConsentManager.js';
import { superClaudeAgent } from '../modules/shared/ai/agents/SuperClaudeAgent.js';
import { fallbackManager } from '../modules/shared/ai/fallback/FallbackManager.js';
import { eventBus } from '../modules/shared/events/EventBus.js';
import { createAIEventUtils } from '../modules/shared/events/AIEvents.js';

/**
 * AI Transparency Dashboard Component
 */
export default function AITransparencyDashboard({ className = '' }) {
  const [activeTab, setActiveTab] = useState('consent');
  const [consentData, setConsentData] = useState({});
  const [aiStats, setAiStats] = useState({});
  const [fallbackStats, setFallbackStats] = useState({});
  const [eventStats, setEventStats] = useState({});
  const [recentActivity, setRecentActivity] = useState([]);
  
  const aiEventUtils = createAIEventUtils(eventBus);

  /**
   * Load dashboard data
   */
  useEffect(() => {
    loadDashboardData();
    
    // Refresh data every 30 seconds
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  /**
   * Load all dashboard data
   */
  const loadDashboardData = () => {
    // Load consent data
    const consent = consentManager.getAllConsent();
    setConsentData(consent);

    // Load AI agent stats
    const aiAgentStats = superClaudeAgent.getStats();
    setAiStats(aiAgentStats);

    // Load fallback stats
    const fallbackData = fallbackManager.getStats();
    setFallbackStats(fallbackData);

    // Load AI event stats
    const eventData = aiEventUtils.getAIEventStats();
    setEventStats(eventData);

    // Load recent AI activity
    const recentEvents = aiEventUtils.getRecentAIEvents(60); // Last hour
    setRecentActivity(recentEvents);
  };

  /**
   * Handle consent toggle
   */
  const handleConsentToggle = (consentId) => {
    const currentlyGranted = consentManager.hasConsent(consentId);
    
    if (currentlyGranted) {
      consentManager.revokeConsent(consentId);
    } else {
      consentManager.grantConsent(consentId, { source: 'transparency_dashboard' });
    }
    
    // Refresh consent data
    setConsentData(consentManager.getAllConsent());
  };

  /**
   * Export user data
   */
  const handleExportData = () => {
    const exportData = {
      consent: consentManager.exportConsentData(),
      aiStats: aiStats,
      fallbackStats: fallbackStats,
      eventStats: eventStats,
      recentActivity: recentActivity,
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `atelier-ai-data-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  /**
   * Clear all AI data
   */
  const handleClearAllData = () => {
    if (confirm('Are you sure you want to clear all AI data? This cannot be undone.')) {
      consentManager.clearAllConsent();
      superClaudeAgent.reset();
      aiEventUtils.clearAIEventHistory();
      loadDashboardData();
    }
  };

  /**
   * Render consent management tab
   */
  const renderConsentTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">AI Feature Permissions</h3>
        <div className="text-sm text-gray-500">
          {Object.values(consentData).filter(c => c.granted && c.explicit).length} of {Object.keys(ConsentTypes).length} features enabled
        </div>
      </div>

      <div className="grid gap-4">
        {Object.values(ConsentTypes).map(consentType => {
          const consent = consentData[consentType.id] || {};
          const isGranted = consent.granted && consent.explicit;
          
          return (
            <div key={consentType.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{consentType.name}</h4>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {consentType.module}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{consentType.description}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    <strong>Data usage:</strong> {consentType.dataUsage}
                  </p>
                  {consent.timestamp && (
                    <p className="text-xs text-gray-400 mt-1">
                      Last updated: {new Date(consent.timestamp).toLocaleString()}
                    </p>
                  )}
                </div>
                
                <button
                  onClick={() => handleConsentToggle(consentType.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                    isGranted 
                      ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {isGranted ? (
                    <>
                      <Unlock size={16} />
                      Granted
                    </>
                  ) : (
                    <>
                      <Lock size={16} />
                      Denied
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  /**
   * Render AI activity tab
   */
  const renderActivityTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* AI Agent Stats */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Cpu size={20} className="text-blue-600" />
            <h4 className="font-semibold text-blue-900">AI Agent</h4>
          </div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Status:</span>
              <span className={aiStats.connected ? 'text-green-600' : 'text-red-600'}>
                {aiStats.connected ? 'Connected' : 'Offline'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Total Requests:</span>
              <span>{aiStats.totalRequests || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Success Rate:</span>
              <span>{aiStats.successRate || 0}%</span>
            </div>
            <div className="flex justify-between">
              <span>Avg Response:</span>
              <span>{aiStats.avgResponseTime || 0}ms</span>
            </div>
          </div>
        </div>

        {/* Fallback Stats */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield size={20} className="text-orange-600" />
            <h4 className="font-semibold text-orange-900">Fallback System</h4>
          </div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Total Fallbacks:</span>
              <span>{fallbackStats.totalFallbacks || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Recent (24h):</span>
              <span>{fallbackStats.recentFallbacks || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Active Operations:</span>
              <span>{fallbackStats.activeOperations || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Cache Size:</span>
              <span>{fallbackStats.cacheSize || 0}</span>
            </div>
          </div>
        </div>

        {/* Event Stats */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity size={20} className="text-green-600" />
            <h4 className="font-semibold text-green-900">AI Events</h4>
          </div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Total Events:</span>
              <span>{eventStats.totalAIEvents || 0}</span>
            </div>
            {eventStats.categories && Object.entries(eventStats.categories).map(([category, stats]) => (
              <div key={category} className="flex justify-between">
                <span className="capitalize">{category}:</span>
                <span>{stats.total}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h4 className="font-semibold mb-3">Recent AI Activity</h4>
        <div className="border border-gray-200 rounded-lg max-h-64 overflow-y-auto">
          {recentActivity.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {recentActivity.slice(-10).map((event, index) => (
                <div key={index} className="p-3 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        event.category === 'agent' ? 'bg-blue-500' :
                        event.category === 'consent' ? 'bg-green-500' :
                        event.category === 'fallback' ? 'bg-orange-500' :
                        event.category === 'security' ? 'bg-red-500' :
                        'bg-gray-500'
                      }`} />
                      <span className="text-sm font-medium">{event.event.split('.').pop()}</span>
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {event.category}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500">
              No recent AI activity
            </div>
          )}
        </div>
      </div>
    </div>
  );

  /**
   * Render data management tab
   */
  const renderDataTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Data Management</h3>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Database size={20} className="text-blue-600" />
            <h4 className="font-semibold text-blue-900">Your AI Data</h4>
          </div>
          <p className="text-sm text-blue-800">
            All AI interactions are stored locally on your device. We never send your data to external servers without explicit consent for specific operations.
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium mb-2">Export Your Data</h4>
          <p className="text-sm text-gray-600 mb-3">
            Download a complete copy of your AI interaction data, consent history, and usage statistics.
          </p>
          <button
            onClick={handleExportData}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Download size={16} />
            Export AI Data
          </button>
        </div>

        <div className="border border-red-200 rounded-lg p-4">
          <h4 className="font-medium mb-2 text-red-900">Clear All AI Data</h4>
          <p className="text-sm text-red-700 mb-3">
            Permanently delete all AI data, consent records, and usage history. This action cannot be undone.
          </p>
          <button
            onClick={handleClearAllData}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            <Trash2 size={16} />
            Clear All Data
          </button>
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium mb-2">Privacy Guarantees</h4>
        <ul className="text-sm text-gray-700 space-y-1">
          <li className="flex items-center gap-2">
            <CheckCircle size={16} className="text-green-600" />
            Data stored locally on your device
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle size={16} className="text-green-600" />
            Explicit consent required for all AI features
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle size={16} className="text-green-600" />
            Automatic data sanitization before AI processing
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle size={16} className="text-green-600" />
            Complete audit trail of all AI operations
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle size={16} className="text-green-600" />
            User control over data retention and deletion
          </li>
        </ul>
      </div>
    </div>
  );

  const tabs = [
    { id: 'consent', label: 'Permissions', icon: Lock },
    { id: 'activity', label: 'Activity', icon: Activity },
    { id: 'data', label: 'Data', icon: Database }
  ];

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center gap-3">
          <Eye size={24} className="text-blue-600" />
          <div>
            <h2 className="text-xl font-semibold">AI Transparency Dashboard</h2>
            <p className="text-gray-600">Complete visibility into AI operations and data usage</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6" aria-label="Tabs">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'consent' && renderConsentTab()}
        {activeTab === 'activity' && renderActivityTab()}
        {activeTab === 'data' && renderDataTab()}
      </div>
    </div>
  );
}