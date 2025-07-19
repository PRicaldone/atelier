/**
 * WIP Protection Dashboard - Comprehensive management interface
 * Provides detailed view and configuration for work in progress protection
 */

import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Activity, 
  Clock,
  Save,
  AlertTriangle,
  CheckCircle,
  Settings,
  BarChart3,
  FileText,
  Trash2,
  Download,
  RefreshCw,
  Play,
  Pause,
  Eye,
  Database
} from 'lucide-react';
import wipProtection from '../utils/wipProtection';

const WIPProtectionDashboard = () => {
  const [stats, setStats] = useState(null);
  const [sessionHistory, setSessionHistory] = useState([]);
  const [config, setConfig] = useState({});
  const [realTimeUpdates, setRealTimeUpdates] = useState(true);

  useEffect(() => {
    loadData();
    
    let unsubscribe;
    let interval;
    
    if (realTimeUpdates) {
      // Subscribe to WIP protection events
      unsubscribe = wipProtection.subscribe((event, data) => {
        loadData();
      });
      
      // Real-time updates every 5 seconds
      interval = setInterval(loadData, 5000);
    }

    return () => {
      if (unsubscribe) unsubscribe();
      if (interval) clearInterval(interval);
    };
  }, [realTimeUpdates]);

  const loadData = () => {
    const currentStats = wipProtection.getStats();
    setStats(currentStats);
    
    // Load session history from localStorage
    try {
      const history = JSON.parse(localStorage.getItem('ATELIER_WIP_HISTORY') || '[]');
      setSessionHistory(history.slice(0, 20)); // Keep last 20 sessions
    } catch (error) {
      console.error('Failed to load WIP history:', error);
    }
  };

  const handleSave = () => {
    wipProtection.triggerSave();
  };

  const handleClearSession = () => {
    if (confirm('Clear current work session? This will reset all tracking.')) {
      wipProtection.clearSession();
      loadData();
    }
  };

  const handleConfigUpdate = (updates) => {
    wipProtection.configure(updates);
    setConfig(prev => ({ ...prev, ...updates }));
  };

  const toggleProtection = () => {
    if (stats?.isEnabled) {
      wipProtection.disable();
    } else {
      wipProtection.enable();
    }
    loadData();
  };

  const exportData = () => {
    const exportData = {
      stats,
      sessionHistory,
      config,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `atelier-wip-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatDuration = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    return `${minutes}m`;
  };

  const getProtectionStatus = () => {
    if (!stats?.isEnabled) return { text: 'Disabled', color: 'text-gray-600 bg-gray-50' };
    if (stats?.protectionActive) return { text: 'Active', color: 'text-orange-600 bg-orange-50' };
    return { text: 'Monitoring', color: 'text-green-600 bg-green-50' };
  };

  const getChangeTypeIcon = (type) => {
    switch (type) {
      case 'input': return <FileText className="w-4 h-4 text-blue-500" />;
      case 'storage': return <Database className="w-4 h-4 text-green-500" />;
      case 'dom': return <Activity className="w-4 h-4 text-purple-500" />;
      case 'contenteditable': return <FileText className="w-4 h-4 text-indigo-500" />;
      default: return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading WIP protection data...</p>
        </div>
      </div>
    );
  }

  const status = getProtectionStatus();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">WIP Protection Dashboard</h1>
          </div>
          <p className="text-gray-600">Monitor and manage work in progress protection</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Protection Status</p>
                <div className={`inline-flex px-2 py-1 rounded-full text-sm font-medium ${status.color}`}>
                  {status.text}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Session Duration</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatDuration(stats.session.duration)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center gap-3">
              <Activity className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Changes Tracked</p>
                <p className="text-2xl font-bold text-gray-900">{stats.session.changes}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Unsaved Files</p>
                <p className="text-2xl font-bold text-gray-900">{stats.session.unsavedFiles}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Control Panel */}
        <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Control Panel</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setRealTimeUpdates(!realTimeUpdates)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  realTimeUpdates 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {realTimeUpdates ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {realTimeUpdates ? 'Pause' : 'Resume'} Updates
              </button>
              <button
                onClick={exportData}
                className="flex items-center gap-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={toggleProtection}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
                stats.isEnabled
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              <Shield className="w-4 h-4" />
              {stats.isEnabled ? 'Disable' : 'Enable'} Protection
            </button>

            {stats.protectionActive && (
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                <Save className="w-4 h-4" />
                Save Now
              </button>
            )}

            <button
              onClick={handleClearSession}
              className="flex items-center gap-2 px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium"
            >
              <Trash2 className="w-4 h-4" />
              Clear Session
            </button>

            <button
              onClick={loadData}
              className="flex items-center gap-2 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Current Session Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Session Information */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Current Session</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Start Time</span>
                  <div className="font-medium">
                    {new Date(Date.now() - stats.session.duration).toLocaleString()}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">Duration</span>
                  <div className="font-medium">{formatDuration(stats.session.duration)}</div>
                </div>
                <div>
                  <span className="text-gray-500">Text Changes</span>
                  <div className="font-medium">{stats.session.textChanges} characters</div>
                </div>
                <div>
                  <span className="text-gray-500">Last Save</span>
                  <div className="font-medium">
                    {stats.session.lastSave 
                      ? formatDuration(Date.now() - stats.session.lastSave) + ' ago'
                      : 'Never'
                    }
                  </div>
                </div>
              </div>

              {stats.protectionActive && (
                <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-center gap-2 text-orange-800">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="font-medium">Protection Active</span>
                  </div>
                  <p className="text-orange-700 text-sm mt-1">
                    Significant changes detected. Your work is being protected against data loss.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Changes */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Changes</h2>
            
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {stats.recentChanges && stats.recentChanges.length > 0 ? (
                stats.recentChanges.slice(-10).reverse().map((change, index) => (
                  <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                    {getChangeTypeIcon(change.type)}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium">
                        {change.type === 'input' && 'Form Input Change'}
                        {change.type === 'storage' && `Storage Update: ${change.key?.split('_').pop()}`}
                        {change.type === 'dom' && `DOM Changes (${change.mutations})`}
                        {change.type === 'contenteditable' && 'Content Edit'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {change.element && `Element: ${change.element}`}
                        {change.length && ` • Length: ${change.length}`}
                        {change.size && ` • Size: ${Math.round(change.size / 1024)}KB`}
                      </div>
                    </div>
                    <div className="text-xs text-gray-400">
                      {Math.round((Date.now() - change.timestamp) / 1000)}s ago
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <Activity className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p>No recent changes detected</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Configuration */}
        <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Settings className="w-6 h-6 text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-900">Protection Thresholds</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Significant Changes Threshold
              </label>
              <input
                type="number"
                value={stats.thresholds.significantChanges}
                onChange={(e) => handleConfigUpdate({ 
                  thresholds: { ...stats.thresholds, significantChanges: parseInt(e.target.value) }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="1"
                max="50"
              />
              <p className="text-xs text-gray-500 mt-1">Number of changes to trigger protection</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time Threshold (minutes)
              </label>
              <input
                type="number"
                value={Math.round(stats.thresholds.timeSpent / 60000)}
                onChange={(e) => handleConfigUpdate({ 
                  thresholds: { ...stats.thresholds, timeSpent: parseInt(e.target.value) * 60000 }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="1"
                max="60"
              />
              <p className="text-xs text-gray-500 mt-1">Minutes of activity to trigger protection</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Text Changes Threshold
              </label>
              <input
                type="number"
                value={stats.thresholds.textChanges}
                onChange={(e) => handleConfigUpdate({ 
                  thresholds: { ...stats.thresholds, textChanges: parseInt(e.target.value) }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="100"
                max="10000"
                step="100"
              />
              <p className="text-xs text-gray-500 mt-1">Characters typed to trigger protection</p>
            </div>
          </div>
        </div>

        {/* Session History */}
        {sessionHistory.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Session History</h2>
            
            <div className="space-y-3">
              {sessionHistory.slice(0, 10).map((session, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      session.protectionActive ? 'bg-orange-500' : 'bg-green-500'
                    }`} />
                    <div>
                      <div className="font-medium text-sm">
                        {formatDuration(session.duration)} session
                      </div>
                      <div className="text-xs text-gray-500">
                        {session.changes} changes • {session.unsavedFiles} unsaved files
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(session.timestamp).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WIPProtectionDashboard;