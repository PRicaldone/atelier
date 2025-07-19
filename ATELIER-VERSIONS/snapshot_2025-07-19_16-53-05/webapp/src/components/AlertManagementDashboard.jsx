/**
 * Alert Management Dashboard - Monitor and configure alert system
 * Provides comprehensive control over proactive alerts and system health
 */

import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Settings, 
  Shield, 
  Activity, 
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  Download,
  Trash2,
  Filter,
  BarChart3,
  Zap
} from 'lucide-react';
import alertSystem, { AlertSeverity, AlertCategory, AlertChannel } from '../utils/alertSystem';

const AlertManagementDashboard = () => {
  const [stats, setStats] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [filter, setFilter] = useState({ dismissed: false });
  const [config, setConfig] = useState({});
  const [healthChecks, setHealthChecks] = useState([]);

  useEffect(() => {
    loadData();
    
    // Subscribe to alert system updates
    const unsubscribe = alertSystem.subscribe(() => {
      loadData();
    });

    // Set up periodic refresh
    const interval = setInterval(loadData, 30000); // Every 30 seconds

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const loadData = () => {
    const systemStats = alertSystem.getStats();
    setStats(systemStats);
    setAlerts(alertSystem.getAlerts(filter));
    setConfig(systemStats.config);
    setHealthChecks(systemStats.healthChecks);
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setAlerts(alertSystem.getAlerts(newFilter));
  };

  const dismissAlert = (alertId) => {
    alertSystem.dismissAlert(alertId);
    loadData();
  };

  const clearAlerts = (filterOptions = {}) => {
    alertSystem.clearAlerts(filterOptions);
    loadData();
  };

  const testAlert = (severity) => {
    alertSystem.createAlert({
      severity,
      category: AlertCategory.SYSTEM_HEALTH,
      title: `Test ${severity.toUpperCase()} Alert`,
      message: `This is a test ${severity} alert to verify the notification system.`,
      channel: severity === AlertSeverity.CRITICAL ? AlertChannel.MODAL : AlertChannel.TOAST,
      actions: [{
        label: 'Acknowledge',
        action: () => console.log('Test alert acknowledged')
      }]
    });
  };

  const updateConfig = (key, value) => {
    const updates = { [key]: value };
    alertSystem.updateConfig(updates);
    setConfig(prev => ({ ...prev, ...updates }));
  };

  const exportAlerts = () => {
    const data = {
      alerts: alerts,
      stats: stats,
      exportedAt: new Date().toISOString(),
      filter: filter
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `atelier-alerts-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getHealthStatusColor = (status) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'error': return 'text-red-600 bg-red-50';
      case 'critical': return 'text-red-800 bg-red-100';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case AlertSeverity.CRITICAL:
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case AlertSeverity.ERROR:
        return <XCircle className="w-4 h-4 text-red-500" />;
      case AlertSeverity.WARNING:
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case AlertSeverity.INFO:
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case AlertSeverity.CRITICAL:
        return 'bg-red-100 text-red-800 border-red-200';
      case AlertSeverity.ERROR:
        return 'bg-red-50 text-red-700 border-red-200';
      case AlertSeverity.WARNING:
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case AlertSeverity.INFO:
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading alert system...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Bell className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Alert Management</h1>
          </div>
          <p className="text-gray-600">Monitor system health and manage proactive alerts</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center gap-3">
              <Activity className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Active Alerts</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeAlerts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-red-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Critical</p>
                <p className="text-2xl font-bold text-gray-900">{stats.criticalAlerts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Health Checks</p>
                <p className="text-2xl font-bold text-gray-900">{healthChecks.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Alerts</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalAlerts}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Health Checks Status */}
        <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">System Health Checks</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {healthChecks.map((check) => (
              <div key={check.name} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900 capitalize">{check.name}</h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded ${getHealthStatusColor(check.lastResult?.status || 'unknown')}`}>
                    {check.lastResult?.status || 'unknown'}
                  </span>
                </div>
                
                {check.lastResult && (
                  <div className="text-sm text-gray-600">
                    <p>{check.lastResult.message || check.lastResult.status}</p>
                    {check.lastCheck && (
                      <p className="text-xs text-gray-500 mt-1">
                        Last check: {new Date(check.lastCheck).toLocaleTimeString()}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Alert Controls */}
        <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Alert Controls</h2>
            <div className="flex gap-2">
              <button
                onClick={exportAlerts}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
              <button
                onClick={() => clearAlerts()}
                className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                <Trash2 className="w-4 h-4" />
                Clear All
              </button>
            </div>
          </div>

          {/* Filter Controls */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filters:</span>
            </div>
            
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={filter.dismissed === false}
                onChange={(e) => handleFilterChange({ 
                  ...filter, 
                  dismissed: e.target.checked ? false : undefined 
                })}
                className="rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">Active Only</span>
            </label>

            <select
              value={filter.severity || ''}
              onChange={(e) => handleFilterChange({ 
                ...filter, 
                severity: e.target.value || undefined 
              })}
              className="px-3 py-1 border border-gray-300 rounded text-sm"
            >
              <option value="">All Severities</option>
              <option value={AlertSeverity.CRITICAL}>Critical</option>
              <option value={AlertSeverity.ERROR}>Error</option>
              <option value={AlertSeverity.WARNING}>Warning</option>
              <option value={AlertSeverity.INFO}>Info</option>
            </select>

            <select
              value={filter.category || ''}
              onChange={(e) => handleFilterChange({ 
                ...filter, 
                category: e.target.value || undefined 
              })}
              className="px-3 py-1 border border-gray-300 rounded text-sm"
            >
              <option value="">All Categories</option>
              {Object.values(AlertCategory).map(category => (
                <option key={category} value={category}>
                  {category.replace('_', ' ').toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          {/* Test Alerts */}
          <div className="flex flex-wrap gap-2">
            <span className="text-sm font-medium text-gray-700">Test Alerts:</span>
            <button
              onClick={() => testAlert(AlertSeverity.INFO)}
              className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
            >
              Info
            </button>
            <button
              onClick={() => testAlert(AlertSeverity.WARNING)}
              className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
            >
              Warning
            </button>
            <button
              onClick={() => testAlert(AlertSeverity.ERROR)}
              className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
            >
              Error
            </button>
            <button
              onClick={() => testAlert(AlertSeverity.CRITICAL)}
              className="px-2 py-1 text-xs bg-red-200 text-red-800 rounded hover:bg-red-300"
            >
              Critical
            </button>
          </div>
        </div>

        {/* Alerts List */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Recent Alerts</h2>
            <p className="text-gray-600 text-sm mt-1">
              Showing {alerts.length} alerts
            </p>
          </div>

          <div className="divide-y divide-gray-200">
            {alerts.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-lg font-medium">No alerts found</p>
                <p className="text-sm">System is healthy or alerts match your filters</p>
              </div>
            ) : (
              alerts.map((alert) => (
                <div key={alert.id} className={`p-4 ${alert.dismissed ? 'opacity-50' : ''}`}>
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      {getSeverityIcon(alert.severity)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-medium text-gray-900">{alert.title}</h3>
                          <p className="text-sm text-gray-700 mt-1">{alert.message}</p>
                          
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span className={`px-2 py-1 rounded ${getSeverityColor(alert.severity)}`}>
                              {alert.severity}
                            </span>
                            <span>{alert.category.replace('_', ' ')}</span>
                            <span>{alert.channel}</span>
                            <span>{new Date(alert.timestamp).toLocaleString()}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {!alert.dismissed && (
                            <button
                              onClick={() => dismissAlert(alert.id)}
                              className="p-1 text-gray-400 hover:text-gray-600"
                              title="Dismiss alert"
                            >
                              <EyeOff className="w-4 h-4" />
                            </button>
                          )}
                          
                          {alert.dismissed && (
                            <Eye className="w-4 h-4 text-gray-400" title="Dismissed" />
                          )}
                        </div>
                      </div>
                      
                      {alert.actions && alert.actions.length > 0 && (
                        <div className="mt-3 flex gap-2">
                          {alert.actions.map((action, index) => (
                            <button
                              key={index}
                              onClick={action.action}
                              className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                            >
                              {action.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Configuration Panel */}
        <div className="bg-white p-6 rounded-lg shadow-sm border mt-8">
          <div className="flex items-center gap-3 mb-6">
            <Settings className="w-6 h-6 text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-900">Alert System Configuration</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Alerts in Memory
              </label>
              <input
                type="number"
                value={config.maxAlerts}
                onChange={(e) => updateConfig('maxAlerts', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="10"
                max="1000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rate Limit (per minute)
              </label>
              <input
                type="number"
                value={config.rateLimiting?.maxPerMinute}
                onChange={(e) => updateConfig('rateLimiting', { 
                  ...config.rateLimiting, 
                  maxPerMinute: parseInt(e.target.value) 
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="1"
                max="100"
              />
            </div>

            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.autoCleanup}
                  onChange={(e) => updateConfig('autoCleanup', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm font-medium text-gray-700">Auto Cleanup Old Alerts</span>
              </label>
            </div>

            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.rateLimiting?.enabled}
                  onChange={(e) => updateConfig('rateLimiting', { 
                    ...config.rateLimiting, 
                    enabled: e.target.checked 
                  })}
                  className="rounded border-gray-300"
                />
                <span className="text-sm font-medium text-gray-700">Enable Rate Limiting</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertManagementDashboard;