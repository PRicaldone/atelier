import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import ModuleSystemTest from '../modules/shared/test/ModuleSystemTest.js';

const ModuleSystemDemo = () => {
  const [testResults, setTestResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  const runTests = async () => {
    setIsRunning(true);
    setTestResults(null);
    
    try {
      const test = new ModuleSystemTest();
      const results = await test.runTests();
      setTestResults(results);
    } catch (error) {
      setTestResults({
        success: false,
        error: error.message,
        results: []
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          Module System Demo
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Test the new modular architecture with loose coupling and safe cross-module communication
        </p>
      </div>

      {/* Test Controls */}
      <div className="mb-6">
        <button
          onClick={runTests}
          disabled={isRunning}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isRunning ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Running Tests...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              <span>Run Module Tests</span>
            </>
          )}
        </button>
      </div>

      {/* Test Results */}
      {testResults && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6"
        >
          <div className="flex items-center space-x-2 mb-4">
            {testResults.success ? (
              <CheckCircle className="w-6 h-6 text-green-500" />
            ) : (
              <XCircle className="w-6 h-6 text-red-500" />
            )}
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              Test Results: {testResults.success ? 'PASSED' : 'FAILED'}
            </h2>
          </div>

          {testResults.error && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
              <p className="text-red-800 dark:text-red-200 font-medium">Error:</p>
              <p className="text-red-700 dark:text-red-300">{testResults.error}</p>
            </div>
          )}

          {/* Test Log */}
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">Test Log:</h3>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 max-h-96 overflow-y-auto">
              {testResults.results.map((entry, index) => (
                <div key={index} className="mb-2 text-sm font-mono">
                  <span className="text-gray-500 dark:text-gray-400">
                    {entry.timestamp.split('T')[1].split('.')[0]}
                  </span>
                  <span className="ml-2 text-gray-800 dark:text-gray-200">
                    {entry.message}
                  </span>
                  {entry.data && (
                    <div className="ml-4 mt-1 text-xs text-gray-600 dark:text-gray-400">
                      {typeof entry.data === 'object' ? JSON.stringify(entry.data, null, 2) : entry.data}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Module Architecture Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
          Module Architecture Benefits
        </h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
              ✅ What We Fixed
            </h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <li>• <strong>Tight Coupling:</strong> No more direct imports between modules</li>
              <li>• <strong>Breaking Changes:</strong> Adapters handle API changes gracefully</li>
              <li>• <strong>Name Changes:</strong> Aliases support (canvas/visual-canvas/creative-atelier)</li>
              <li>• <strong>Rollback Issues:</strong> Isolated modules can be rolled back individually</li>
              <li>• <strong>Testing:</strong> Modules can be mocked and tested in isolation</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
              🚀 New Capabilities
            </h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <li>• <strong>Event Bus:</strong> Loose coupling via async events</li>
              <li>• <strong>Module Registry:</strong> Centralized module management</li>
              <li>• <strong>Safe Invocation:</strong> Error-handled cross-module calls</li>
              <li>• <strong>Contracts:</strong> API validation and backwards compatibility</li>
              <li>• <strong>Hot Swapping:</strong> Modules can be replaced without restart</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModuleSystemDemo;