import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  AlertCircle,
  TrendingUp,
  Clock,
  Zap,
  Network,
  Eye,
  EyeOff,
  Play,
  Pause,
  Download,
  RefreshCw,
  Settings
} from 'lucide-react';
import eventBus from '../modules/shared/events/EventBus.js';
import errorTracker from '../modules/shared/monitoring/ErrorTracker.js';
import { 
  generateTestEvents, 
  generateTestErrors, 
  startContinuousTestActivity,
  generateHealthTestScenarios,
  clearTestData
} from '../utils/monitoringTestUtils.js';
import { 
  getHealthReport,
  isSystemHealthy,
  forceHealthCheck,
  getUnhealthyModules
} from '../modules/shared/health/HealthCheckIntegration.js';

const EventMonitoringDashboard = () => {
  const [isLive, setIsLive] = useState(true);
  const [eventHistory, setEventHistory] = useState([]);
  const [eventStats, setEventStats] = useState({});
  const [moduleHealth, setModuleHealth] = useState({});
  const [errorStats, setErrorStats] = useState(null);
  const [selectedModule, setSelectedModule] = useState('all');
  const [showSystemEvents, setShowSystemEvents] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [healthReport, setHealthReport] = useState(null);
  const [systemHealthy, setSystemHealthy] = useState(true);
  
  const eventListRef = useRef(null);
  const updateInterval = useRef(null);

  // Update dashboard data
  const updateDashboard = () => {
    // Get event history
    const history = eventBus.getHistory();
    setEventHistory(history.slice(-50)); // Keep last 50 events
    
    // Calculate event statistics
    const stats = calculateEventStats(history);
    setEventStats(stats);
    
    // Get module health
    const health = calculateModuleHealth(history);
    setModuleHealth(health);
    
    // Get error statistics
    const errors = errorTracker.getStats();
    setErrorStats(errors);
    
    // Get health check data
    try {
      const healthData = getHealthReport();
      setHealthReport(healthData);
      setSystemHealthy(isSystemHealthy());
    } catch (error) {
      console.error('Failed to get health report:', error);
    }
  };

  // Calculate event statistics
  const calculateEventStats = (history) => {
    const stats = {};
    const now = Date.now();
    const hourAgo = now - (60 * 60 * 1000);
    const minuteAgo = now - (60 * 1000);
    
    history.forEach(event => {
      const eventType = event.event.split(':')[0];
      if (!stats[eventType]) {
        stats[eventType] = { total: 0, lastHour: 0, lastMinute: 0 };
      }
      
      stats[eventType].total++;
      if (event.timestamp > hourAgo) {
        stats[eventType].lastHour++;
      }
      if (event.timestamp > minuteAgo) {
        stats[eventType].lastMinute++;
      }
    });
    
    return stats;
  };

  // Calculate module health based on events and errors
  const calculateModuleHealth = (history) => {
    const health = {};
    const now = Date.now();
    const hourAgo = now - (60 * 60 * 1000);
    
    // Initialize known modules
    ['canvas', 'mindgarden', 'orchestra', 'project'].forEach(module => {
      health[module] = {
        status: 'healthy',
        events: 0,
        errors: 0,
        lastActivity: null
      };
    });
    
    // Count events by module
    history.forEach(event => {
      const module = event.event.split(':')[0];
      if (health[module]) {
        health[module].events++;
        health[module].lastActivity = event.timestamp;
      }
    });
    
    // Add error data
    if (errorStats) {
      Object.entries(errorStats.byModule).forEach(([module, errors]) => {
        if (health[module]) {
          health[module].errors = errors;
          
          // Determine health status
          if (errors > 10) {
            health[module].status = 'critical';
          } else if (errors > 5) {
            health[module].status = 'warning';
          } else if (health[module].events === 0) {
            health[module].status = 'inactive';
          } else {
            health[module].status = 'healthy';
          }
        }
      });
    }
    
    return health;
  };

  // Filter events based on selected module and settings
  const filteredEvents = eventHistory.filter(event => {
    if (selectedModule !== 'all' && !event.event.startsWith(selectedModule)) {
      return false;
    }
    
    if (!showSystemEvents && event.event.includes('system:')) {
      return false;
    }
    
    return true;
  });

  // Auto-scroll to bottom when new events arrive
  useEffect(() => {
    if (autoScroll && eventListRef.current) {
      eventListRef.current.scrollTop = eventListRef.current.scrollHeight;
    }
  }, [eventHistory, autoScroll]);

  // Live updates
  useEffect(() => {
    updateDashboard();
    
    if (isLive) {
      updateInterval.current = setInterval(updateDashboard, 1000);
    } else if (updateInterval.current) {
      clearInterval(updateInterval.current);
    }
    
    return () => {
      if (updateInterval.current) {
        clearInterval(updateInterval.current);
      }
    };
  }, [isLive]);

  // Event type styling
  const getEventTypeStyle = (eventType) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    
    switch (eventType) {
      case 'canvas':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'mindgarden':
        return `${baseClasses} bg-purple-100 text-purple-800`;
      case 'orchestra':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'project':
        return `${baseClasses} bg-orange-100 text-orange-800`;
      case 'module':
        return `${baseClasses} bg-gray-100 text-gray-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  // Health status styling
  const getHealthStatusStyle = (status) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    
    switch (status) {
      case 'healthy':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'warning':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'critical':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'inactive':
        return `${baseClasses} bg-gray-100 text-gray-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  // Export monitoring data
  const exportData = () => {
    const data = {
      timestamp: new Date().toISOString(),
      eventHistory: eventBus.getHistory(),
      eventStats,
      moduleHealth,
      errorStats,
      registeredEvents: eventBus.getEvents()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `atelier-monitoring-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          Event Monitoring Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Real-time system monitoring and event tracking
        </p>
      </div>

      {/* Controls */}
      <div className="mb-6 flex flex-wrap gap-4 items-center">
        <button
          onClick={() => setIsLive(!isLive)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
            isLive 
              ? 'bg-green-600 text-white hover:bg-green-700' 
              : 'bg-gray-600 text-white hover:bg-gray-700'
          }`}
        >
          {isLive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          <span>{isLive ? 'Live' : 'Paused'}</span>
        </button>

        <select
          value={selectedModule}
          onChange={(e) => setSelectedModule(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-800"
        >
          <option value="all">All Modules</option>
          <option value="canvas">Canvas</option>
          <option value="mindgarden">Mind Garden</option>
          <option value="orchestra">Orchestra</option>
          <option value="project">Project</option>
          <option value="module">Module System</option>
        </select>

        <button
          onClick={() => setShowSystemEvents(!showSystemEvents)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
            showSystemEvents
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-600 text-white hover:bg-gray-700'
          }`}
        >
          {showSystemEvents ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          <span>System Events</span>
        </button>

        <button
          onClick={() => setAutoScroll(!autoScroll)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
            autoScroll
              ? 'bg-indigo-600 text-white hover:bg-indigo-700'
              : 'bg-gray-600 text-white hover:bg-gray-700'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Auto Scroll</span>
        </button>

        <button
          onClick={updateDashboard}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </button>

        <button
          onClick={exportData}
          className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Export</span>
        </button>
      </div>

      {/* Test Controls */}
      <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="text-sm font-medium text-yellow-800 mb-2">Test Controls</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={generateTestEvents}
            className="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700 transition-colors"
          >
            Generate Events
          </button>
          <button
            onClick={generateTestErrors}
            className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
          >
            Generate Errors
          </button>
          <button
            onClick={generateHealthTestScenarios}
            className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700 transition-colors"
          >
            Health Scenarios
          </button>
          <button
            onClick={clearTestData}
            className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 transition-colors"
          >
            Clear Data
          </button>
          <button
            onClick={forceHealthCheck}
            className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
          >
            Force Health Check
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Total Events */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Events</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {eventHistory.length}
              </p>
            </div>
            <Activity className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        {/* Events/Min */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Events/Min</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {Object.values(eventStats).reduce((sum, stat) => sum + stat.lastMinute, 0)}
              </p>
            </div>
            <Zap className="w-8 h-8 text-yellow-500" />
          </div>
        </div>

        {/* Active Modules */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Modules</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {Object.values(moduleHealth).filter(h => h.status !== 'inactive').length}
              </p>
            </div>
            <Network className="w-8 h-8 text-green-500" />
          </div>
        </div>

        {/* Total Errors */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Errors</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {errorStats?.total || 0}
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Module Health */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            Module Health Status
          </h2>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${systemHealthy ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className={`text-sm font-medium ${systemHealthy ? 'text-green-700' : 'text-red-700'}`}>
              {systemHealthy ? 'System Healthy' : 'System Issues'}
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(moduleHealth).map(([module, health]) => (
            <div key={module} className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-800 dark:text-white capitalize">
                  {module}
                </h3>
                <span className={getHealthStatusStyle(health.status)}>
                  {health.status}
                </span>
              </div>
              
              <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <div>Events: {health.events}</div>
                <div>Errors: {health.errors}</div>
                <div>
                  Last Activity: {
                    health.lastActivity 
                      ? new Date(health.lastActivity).toLocaleTimeString()
                      : 'None'
                  }
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Automated Health Checks */}
      {healthReport && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            Automated Health Checks
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(healthReport.healthCheck.modules).map(([moduleName, moduleHealth]) => (
              <div key={moduleName} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-800 dark:text-white capitalize">
                    {moduleName}
                  </h3>
                  <span className={getHealthStatusStyle(moduleHealth.status)}>
                    {moduleHealth.status}
                  </span>
                </div>
                
                <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <div>Failure Count: {moduleHealth.failureCount}</div>
                  <div>Restart Attempts: {moduleHealth.restartAttempts}</div>
                  <div>
                    Last Ping: {
                      moduleHealth.lastHeartbeat 
                        ? new Date(moduleHealth.lastHeartbeat).toLocaleTimeString()
                        : 'None'
                    }
                  </div>
                  <div>
                    Time Since Last Ping: {
                      moduleHealth.timeSinceLastHeartbeat 
                        ? `${Math.floor(moduleHealth.timeSinceLastHeartbeat / 1000)}s`
                        : 'N/A'
                    }
                  </div>
                  <div>
                    Uptime: {
                      moduleHealth.registeredAt 
                        ? `${Math.floor((Date.now() - moduleHealth.registeredAt) / 1000)}s`
                        : 'N/A'
                    }
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Health Check Summary */}
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h3 className="font-medium text-gray-800 dark:text-white mb-2">Health Check Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-400">Total: </span>
                <span className="font-medium">{healthReport.healthCheck.summary.total}</span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Healthy: </span>
                <span className="font-medium text-green-600">{healthReport.healthCheck.summary.healthy}</span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Warning: </span>
                <span className="font-medium text-yellow-600">{healthReport.healthCheck.summary.warning}</span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Critical: </span>
                <span className="font-medium text-red-600">{healthReport.healthCheck.summary.critical}</span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Dead: </span>
                <span className="font-medium text-red-800">{healthReport.healthCheck.summary.dead}</span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Restarting: </span>
                <span className="font-medium text-blue-600">{healthReport.healthCheck.summary.restarting}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Live Event Stream */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            Live Event Stream
          </h2>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500' : 'bg-gray-400'}`} />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {isLive ? 'Live' : 'Paused'}
            </span>
          </div>
        </div>
        
        <div 
          ref={eventListRef}
          className="h-96 overflow-y-auto border rounded-lg p-4 bg-gray-50 dark:bg-gray-900"
        >
          {filteredEvents.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              No events to display
            </div>
          ) : (
            <div className="space-y-2">
              {filteredEvents.map((event, index) => (
                <motion.div
                  key={`${event.timestamp}-${index}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center space-x-3 p-2 bg-white dark:bg-gray-800 rounded border"
                >
                  <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </div>
                  
                  <span className={getEventTypeStyle(event.event.split(':')[0])}>
                    {event.event.split(':')[0]}
                  </span>
                  
                  <div className="flex-1 text-sm text-gray-700 dark:text-gray-300">
                    {event.event}
                  </div>
                  
                  {event.data && (
                    <details className="text-xs">
                      <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                        data
                      </summary>
                      <pre className="mt-1 p-2 bg-gray-100 dark:bg-gray-700 rounded text-xs overflow-x-auto">
                        {JSON.stringify(event.data, null, 2)}
                      </pre>
                    </details>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventMonitoringDashboard;