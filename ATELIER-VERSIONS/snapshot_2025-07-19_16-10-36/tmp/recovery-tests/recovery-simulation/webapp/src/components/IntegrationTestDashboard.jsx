import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  PlayCircle, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Clock,
  Download,
  RefreshCw,
  Bug,
  Zap,
  Target,
  Activity
} from 'lucide-react';
import integrationTestSuite, { TestResult, TestSeverity } from '../modules/shared/testing/IntegrationTestSuite.js';

const IntegrationTestDashboard = () => {
  const [testResults, setTestResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const [lastRunTime, setLastRunTime] = useState(null);

  // Run all tests
  const runAllTests = async () => {
    setIsRunning(true);
    try {
      const results = await integrationTestSuite.runAll();
      setTestResults(results);
      setLastRunTime(Date.now());
    } catch (error) {
      console.error('Test suite failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  // Run specific test
  const runSingleTest = async (testName) => {
    setIsRunning(true);
    try {
      const result = await integrationTestSuite.runTest(testName);
      
      // Update existing results or create new if none exist
      if (testResults) {
        const updatedResults = { ...testResults };
        const index = updatedResults.results.findIndex(r => r.name === testName);
        if (index !== -1) {
          updatedResults.results[index] = result;
        } else {
          updatedResults.results.push(result);
        }
        updatedResults.summary = integrationTestSuite.getSummary();
        setTestResults(updatedResults);
      } else {
        setTestResults({
          results: [result],
          summary: integrationTestSuite.getSummary(),
          totalDuration: result.duration,
          timestamp: Date.now()
        });
      }
      
      setLastRunTime(Date.now());
    } catch (error) {
      console.error('Single test failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  // Export test results
  const exportResults = () => {
    if (!testResults) return;
    
    const dataStr = integrationTestSuite.exportResults();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `integration-test-results-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Get result icon
  const getResultIcon = (result) => {
    switch (result) {
      case TestResult.PASS:
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case TestResult.FAIL:
        return <XCircle className="w-5 h-5 text-red-500" />;
      case TestResult.ERROR:
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case TestResult.SKIP:
        return <Clock className="w-5 h-5 text-gray-500" />;
      default:
        return <Activity className="w-5 h-5 text-gray-400" />;
    }
  };

  // Get severity badge style
  const getSeverityStyle = (severity) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    
    switch (severity) {
      case TestSeverity.CRITICAL:
        return `${baseClasses} bg-red-100 text-red-800`;
      case TestSeverity.HIGH:
        return `${baseClasses} bg-orange-100 text-orange-800`;
      case TestSeverity.MEDIUM:
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case TestSeverity.LOW:
        return `${baseClasses} bg-blue-100 text-blue-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  // Get result style
  const getResultStyle = (result) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    
    switch (result) {
      case TestResult.PASS:
        return `${baseClasses} bg-green-100 text-green-800`;
      case TestResult.FAIL:
        return `${baseClasses} bg-red-100 text-red-800`;
      case TestResult.ERROR:
        return `${baseClasses} bg-red-100 text-red-900`;
      case TestResult.SKIP:
        return `${baseClasses} bg-gray-100 text-gray-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          Integration Test Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Automated testing suite for module system validation
        </p>
      </div>

      {/* Controls */}
      <div className="mb-6 flex flex-wrap gap-4 items-center">
        <button
          onClick={runAllTests}
          disabled={isRunning}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isRunning ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <PlayCircle className="w-4 h-4" />
          )}
          <span>{isRunning ? 'Running Tests...' : 'Run All Tests'}</span>
        </button>

        {testResults && (
          <button
            onClick={exportResults}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export Results</span>
          </button>
        )}

        {lastRunTime && (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Last run: {new Date(lastRunTime).toLocaleTimeString()}
          </div>
        )}
      </div>

      {/* Test Summary */}
      {testResults && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Total Tests */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Tests</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">
                  {testResults.summary.total}
                </p>
              </div>
              <Target className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          {/* Passed */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Passed</p>
                <p className="text-2xl font-bold text-green-600">
                  {testResults.summary.passed}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>

          {/* Failed */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Failed</p>
                <p className="text-2xl font-bold text-red-600">
                  {testResults.summary.failed + testResults.summary.errors}
                </p>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          </div>

          {/* Success Rate */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Success Rate</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">
                  {testResults.summary.successRate.toFixed(1)}%
                </p>
              </div>
              <Zap className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
        </div>
      )}

      {/* System Health Indicator */}
      {testResults && (
        <div className="mb-8 p-4 rounded-lg border-2 border-dashed" 
             style={{
               borderColor: testResults.summary.isHealthy ? '#10b981' : '#ef4444',
               backgroundColor: testResults.summary.isHealthy ? '#ecfdf5' : '#fef2f2'
             }}>
          <div className="flex items-center space-x-3">
            {testResults.summary.isHealthy ? (
              <CheckCircle className="w-6 h-6 text-green-600" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-red-600" />
            )}
            <div>
              <h3 className={`font-medium ${testResults.summary.isHealthy ? 'text-green-800' : 'text-red-800'}`}>
                {testResults.summary.isHealthy ? 'System Healthy' : 'System Issues Detected'}
              </h3>
              <p className={`text-sm ${testResults.summary.isHealthy ? 'text-green-700' : 'text-red-700'}`}>
                {testResults.summary.isHealthy 
                  ? 'All integration tests passed. Module system is functioning correctly.'
                  : `${testResults.summary.failed + testResults.summary.errors} test(s) failed. Check details below.`
                }
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Test Results */}
      {testResults && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            Test Results
          </h2>
          
          <div className="space-y-4">
            {testResults.results.map((result, index) => (
              <motion.div
                key={result.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    {getResultIcon(result.result)}
                    <h3 className="font-medium text-gray-800 dark:text-white">
                      {result.name}
                    </h3>
                    <span className={getSeverityStyle(result.severity)}>
                      {result.severity}
                    </span>
                    <span className={getResultStyle(result.result)}>
                      {result.result}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500">
                      {result.duration}ms
                    </span>
                    <button
                      onClick={() => runSingleTest(result.name)}
                      disabled={isRunning}
                      className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200 disabled:opacity-50 transition-colors"
                    >
                      Re-run
                    </button>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {result.description}
                </p>
                
                {result.error && (
                  <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded">
                    <div className="flex items-start space-x-2">
                      <Bug className="w-4 h-4 text-red-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-red-800">Error:</p>
                        <p className="text-sm text-red-700">{result.error}</p>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
          
          {/* Test Summary Footer */}
          <div className="mt-6 pt-4 border-t">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-400">Total Duration: </span>
                <span className="font-medium">{testResults.totalDuration}ms</span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Critical: </span>
                <span className="font-medium text-red-600">{testResults.summary.critical}</span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">High: </span>
                <span className="font-medium text-orange-600">{testResults.summary.high}</span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Medium: </span>
                <span className="font-medium text-yellow-600">{testResults.summary.medium}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Available Tests (if no results yet) */}
      {!testResults && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            Available Tests
          </h2>
          
          <div className="space-y-3">
            {integrationTestSuite.tests.map((test, index) => (
              <div key={test.name} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <h3 className="font-medium text-gray-800 dark:text-white">
                      {test.name}
                    </h3>
                    <span className={getSeverityStyle(test.severity)}>
                      {test.severity}
                    </span>
                  </div>
                  <button
                    onClick={() => runSingleTest(test.name)}
                    disabled={isRunning}
                    className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200 disabled:opacity-50 transition-colors"
                  >
                    Run Test
                  </button>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {test.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Console Commands */}
      <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
          Console Commands
        </h2>
        
        <div className="space-y-2 text-sm font-mono bg-gray-100 dark:bg-gray-900 p-4 rounded-lg">
          <div><span className="text-blue-600">window.__integrationTestSuite.runAll()</span> - Run all integration tests</div>
          <div><span className="text-blue-600">window.__integrationTestSuite.runTest('Module Registry Validation')</span> - Run specific test</div>
          <div><span className="text-blue-600">window.__integrationTestSuite.getSummary()</span> - Get test summary</div>
          <div><span className="text-blue-600">window.__integrationTestSuite.exportResults()</span> - Export test results</div>
          <div><span className="text-blue-600">window.__mockAdapterFactory.resetAllStores()</span> - Reset mock data</div>
        </div>
      </div>
    </div>
  );
};

export default IntegrationTestDashboard;