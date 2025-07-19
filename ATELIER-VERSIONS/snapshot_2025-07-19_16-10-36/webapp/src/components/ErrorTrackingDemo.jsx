import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle, Info, AlertTriangle, Bug, Activity, Download } from 'lucide-react';
import errorTracker from '../modules/shared/monitoring/ErrorTracker.js';
import { canvasLogger, mindGardenLogger, orchestraLogger } from '../modules/shared/monitoring/ModuleLogger.js';

const ErrorTrackingDemo = () => {
  const [stats, setStats] = useState(null);
  const [recentErrors, setRecentErrors] = useState([]);
  const [isLive, setIsLive] = useState(false);

  // Refresh stats periodically
  useEffect(() => {
    const updateStats = () => {
      setStats(errorTracker.getStats());
      setRecentErrors(errorTracker.searchErrors({ limit: 10 }));
    };

    updateStats();
    
    if (isLive) {
      const interval = setInterval(updateStats, 1000);
      return () => clearInterval(interval);
    }
  }, [isLive]);

  // Demo functions to generate test errors
  const generateTestError = (type) => {
    switch (type) {
      case 'canvas':
        canvasLogger.error(new Error('Failed to add element to canvas'), 'addElement', {
          elementType: 'note',
          position: { x: 100, y: 100 },
          testError: true
        });
        break;
      case 'mind-garden':
        mindGardenLogger.error(new Error('Node creation failed'), 'createNode', {
          nodeData: { title: 'Test Node' },
          testError: true
        });
        break;
      case 'orchestra':
        orchestraLogger.warning('Calendar sync failed', 'syncCalendar', {
          provider: 'google',
          testWarning: true
        });
        break;
      case 'critical':
        errorTracker.logError(new Error('Database connection lost'), 'database', 'connect', {
          critical: true,
          testError: true
        });
        break;
      default:
        errorTracker.logInfo('Test info message', 'demo', 'generateTest', {
          testInfo: true
        });
    }
  };

  const clearErrors = () => {
    errorTracker.clear();
    setStats(errorTracker.getStats());
    setRecentErrors([]);
  };

  const exportErrors = () => {
    const data = errorTracker.exportErrors('json');
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `atelier-errors-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getLevelIcon = (level) => {
    switch (level) {
      case 'critical':
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'info':
        return <Info className="w-4 h-4 text-blue-500" />;
      case 'debug':
        return <Bug className="w-4 h-4 text-gray-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'critical':
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'debug':
        return 'bg-gray-50 border-gray-200 text-gray-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          Error Tracking Demo
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Centralized error tracking with structured logging and monitoring
        </p>
      </div>

      {/* Controls */}
      <div className="mb-6 flex flex-wrap gap-4">
        <button
          onClick={() => generateTestError('canvas')}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Generate Canvas Error
        </button>
        <button
          onClick={() => generateTestError('mind-garden')}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          Generate Mind Garden Error
        </button>
        <button
          onClick={() => generateTestError('orchestra')}
          className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
        >
          Generate Orchestra Warning
        </button>
        <button
          onClick={() => generateTestError('critical')}
          className="px-4 py-2 bg-red-800 text-white rounded-lg hover:bg-red-900 transition-colors"
        >
          Generate Critical Error
        </button>
        <button
          onClick={() => generateTestError('info')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Generate Info Log
        </button>
        <button
          onClick={() => setIsLive(!isLive)}
          className={`px-4 py-2 rounded-lg transition-colors ${
            isLive 
              ? 'bg-green-600 text-white hover:bg-green-700' 
              : 'bg-gray-600 text-white hover:bg-gray-700'
          }`}
        >
          {isLive ? 'Live On' : 'Live Off'}
        </button>
        <button
          onClick={clearErrors}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          Clear All
        </button>
        <button
          onClick={exportErrors}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
        >
          <Download className="w-4 h-4" />
          <span>Export</span>
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Errors</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.total}</p>
              </div>
              <Activity className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Last Hour</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.lastHour}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Session Uptime</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">
                  {Math.floor(stats.sessionInfo.uptime / 60000)}m
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Errors/Module</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">
                  {Object.keys(stats.byModule).length}
                </p>
              </div>
              <Bug className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>
      )}

      {/* Recent Errors */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
          Recent Errors
        </h2>
        
        {recentErrors.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            No errors recorded. Generate some test errors to see them here.
          </p>
        ) : (
          <div className="space-y-3">
            {recentErrors.map((error, index) => (
              <motion.div
                key={error.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-lg border ${getLevelColor(error.level)}`}
              >
                <div className="flex items-start space-x-3">
                  {getLevelIcon(error.level)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">
                        [{error.module}:{error.action}] {error.message}
                      </p>
                      <span className="text-xs text-gray-500">
                        {new Date(error.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    
                    {error.context && Object.keys(error.context).length > 0 && (
                      <div className="mt-2 text-xs">
                        <strong>Context:</strong> {JSON.stringify(error.context, null, 2)}
                      </div>
                    )}
                    
                    {error.stack && (
                      <details className="mt-2">
                        <summary className="text-xs cursor-pointer hover:text-gray-700">
                          Stack trace
                        </summary>
                        <pre className="mt-1 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                          {error.stack}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Console Commands */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
          Console Commands
        </h2>
        
        <div className="space-y-2 text-sm font-mono bg-gray-100 dark:bg-gray-900 p-4 rounded-lg">
          <div><span className="text-blue-600">window.__errorTracker.getStats()</span> - Get error statistics</div>
          <div><span className="text-blue-600">window.__errorTracker.searchErrors(&#123;module: 'canvas'&#125;)</span> - Search errors by module</div>
          <div><span className="text-blue-600">window.__errorTracker.exportErrors('json')</span> - Export errors as JSON</div>
          <div><span className="text-blue-600">window.__errorTracker.clear()</span> - Clear all errors</div>
        </div>
      </div>
    </div>
  );
};

export default ErrorTrackingDemo;